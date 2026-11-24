import './vendor/d3-array.min.mjs';
import './vendor/d3-geo.min.mjs';
import { ATLAS_VIEWS, historicalName } from './atlas-catalog.js?v=142';

import { fetchJson } from './fetch-json.js?v=142';

const { geoCentroid, geoContains, geoDistance, geoGraticule10, geoOrthographic, geoPath } = globalThis.d3;
const sphere = { type: 'Sphere' };
const graticule = geoGraticule10();
const maxZoom = 28;
const historyColors = { political: '#ffe28c', culture: '#eca5ff', site: '#a7f3ea', network: '#ffb195' };
const clamp = (number, min, max) => Math.max(min, Math.min(max, number));
const longitude = value => (value + 540) % 360 - 180;
const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
let geography;
let riversRequest;

function loadGeography(retry) {
  geography ??= fetchJson(new URL('./content/atlas-land.json?v=13r9', import.meta.url), { cache: retry ? 'reload' : 'default' })
    .then(world => {
      if (world?.type !== 'GeometryCollection' || !world.geometries?.length ||
          !world.geometries.every(geometry => geometry?.type === 'Polygon' && geometry.coordinates?.length)) {
        throw new Error('AtlasGeography');
      }
      return world;
    })
    .catch(error => {
      geography = undefined;
      throw error;
    });
  return geography;
}

// Longitude/latitude buckets are independent of zoom and computed once per mounted map.
function indexPlaces(places) {
  const cells = new Map();
  for (const place of places) {
    const [lon, lat] = place.coordinates;
    const key = Math.floor(lat / 10) + ':' + Math.floor(longitude(lon) / 10);
    if (!cells.has(key)) cells.set(key, []);
    cells.get(key).push(place);
  }
  return (center, projectedRadius, screenRadius) => {
    if (screenRadius >= projectedRadius) return places;
    const radians = Math.asin(screenRadius / projectedRadius);
    const degrees = radians * 180 / Math.PI;
    const south = Math.floor(Math.max(-90, center[1] - degrees) / 10);
    const north = Math.floor(Math.min(90, center[1] + degrees) / 10);
    const lonDelta = Math.abs(center[1]) + degrees >= 90 ? 180 :
      Math.asin(Math.min(1, Math.sin(radians) / Math.cos(center[1] * Math.PI / 180))) * 180 / Math.PI;
    const west = Math.floor((center[0] - lonDelta) / 10);
    const east = Math.floor((center[0] + lonDelta) / 10);
    const result = [];
    for (let lat = south; lat <= north; lat++) {
      for (let lon = west; lon <= Math.min(east, west + 35); lon++) {
        const column = ((lon + 18) % 36 + 36) % 36 - 18;
        const cell = cells.get(lat + ':' + column);
        if (cell) result.push(...cell);
      }
    }
    return result;
  };
}

export async function mountAtlasGlobe(frame, places, selected, onSelect, { retry = false, history = () => ({}) } = {}) {
  const world = await loadGeography(retry);
  if (!frame.isConnected) return;
  const canvas = frame.querySelector('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('AtlasCanvas');
  const controls = new AbortController();
  const listen = (element, event, handler, options = {}) =>
    element.addEventListener(event, handler, { ...options, signal: controls.signal });
  const projection = geoOrthographic().precision(.3).clipAngle(90);
  const path = geoPath(projection, context);
  const active = places.find(place => place.id === selected);
  const mapStatus = frame.querySelector('#atlas-map-status');
  const presetButtons = [...frame.querySelectorAll('[data-map-view]')];
  const zoomButtons = [...frame.querySelectorAll('[data-map-zoom]')];
  const pointers = new Map();
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let center = active?.coordinates ?? ATLAS_VIEWS.wereld.center;
  let zoom = active ? 9 : 1;
  let width = 0;
  let height = 0;
  let markers = [];
  let historicalMarkers = [];
  let gesture;
  let animation = 0;
  let hover;
  let rivers;
  let loadingRivers = false;
  let filter = new Set(places.map(place => place.id));
  const visiblePlaces = indexPlaces(places);
  const name = place => historicalName(place, Number(frame.dataset.atlasYear)) || place.name;
  let mapLabel = active ? name(active) : 'Wereld';

  function shape(geometry, fill, stroke, line = 1) {
    context.beginPath();
    path(geometry);
    if (fill) { context.fillStyle = fill; context.fill(); }
    if (stroke) { context.strokeStyle = stroke; context.lineWidth = line; context.stroke(); }
  }

  function makeMarkers() {
    const candidates = visiblePlaces(center, projection.scale(), Math.hypot(width / 2, height / 2));
    const points = candidates.filter(place => filter.has(place.id) && geoDistance(center, place.coordinates) < Math.PI / 2)
      .map(place => ({ place, point: projection(place.coordinates) }))
      .filter(({ point: [x, y] }) => x > 10 && x < width - 10 && y > 10 && y < height - 10);
    const groups = [];
    for (const { place, point } of points) {
      const group = zoom < 19 && place !== active && groups.find(mark =>
        !mark.places.includes(active) && distance(mark.point, point) < 29);
      if (group) {
        const previousCount = group.places.length;
        group.point = group.point.map((n, axis) => (n * previousCount + point[axis]) / (previousCount + 1));
        group.places.push(place);
      } else {
        groups.push({ places: [place], point });
      }
    }
    return groups.sort((a, b) => Number(b.places.includes(active)) - Number(a.places.includes(active)));
  }

  function drawMarkers() {
    markers = makeMarkers();
    const labels = [];
    for (const marker of markers) {
      const { places: list, point: [x, y] } = marker;
      const cluster = list.length > 1;
      const focus = list[0] === active;
      const highlighted = list[0].id === hover;
      const radius = cluster ? 13 : focus ? 8 : 5.4;
      if (focus || highlighted) {
        context.beginPath();
        context.arc(x, y, 15, 0, Math.PI * 2);
        context.fillStyle = '#eec87c55';
        context.fill();
      }
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fillStyle = focus || highlighted ? '#ffda89' : cluster ? '#f3dfac' : '#f2fff8';
      context.fill();
      context.lineWidth = 1.8;
      context.strokeStyle = '#142f35';
      context.stroke();
      context.textBaseline = 'middle';
      if (cluster) {
        context.font = '750 12px system-ui';
        context.textAlign = 'center';
        context.fillStyle = '#21382b';
        context.fillText(String(list.length), x, y + .5);
        context.textAlign = 'start';
        continue;
      }
      const label = name(list[0]);
      context.font = '650 13px system-ui';
      const labelWidth = context.measureText(label).width + 4;
      const options = [[x + 12, y], [x - labelWidth - 12, y], [x + 7, y - 16], [x + 7, y + 16]];
      const position = options.find(([left, middle]) => left > 3 && left + labelWidth < width - 2 &&
        middle > 9 && middle < height - 9 && !labels.some(([other, positionY, size]) =>
          Math.abs(middle - positionY) < 17 && left < other + size + 4 && left + labelWidth > other - 4));
      if (!position) continue;
      const [left, middle] = position;
      context.lineWidth = 4.5;
      context.lineJoin = 'round';
      context.strokeStyle = '#10313b';
      context.strokeText(label, left, middle);
      context.fillStyle = focus ? '#ffde9b' : '#ffffff';
      context.fillText(label, left, middle);
      labels.push([left, middle, labelWidth]);
      marker.label = [left, middle, labelWidth];
    }
  }

  function drawHistoricalAreas(figures, compared) {
    if (figures.length === 0 && compared.length === 0) return;
    context.save();
    context.setLineDash([5, 3]);
    for (const figure of figures) {
      if (figure.area) shape(figure.area, '#f4d77a65', '#68490d', 1.4);
    }
    context.setLineDash([2, 4]);
    for (const figure of compared) {
      if (figure.area) shape(figure.area, null, '#a63a64', 2);
    }
    context.restore();
  }

  function drawHistoricalMarkers(figures, compared) {
    historicalMarkers = [];
    const labels = [];
    function drawRecord(figure, comparison) {
      if (geoDistance(center, figure.coordinates) > Math.PI / 2) return;
      const point = projection(figure.coordinates);
      const [x, y] = point;
      if (x < 6 || x > width - 6 || y < 6 || y > height - 6) return;
      if (!comparison) {
        historicalMarkers.push({ point, places: [figure], historical: true });
      }
      const size = figure.id === hover ? 9 : comparison ? 7 : 5;
      context.beginPath();
      context.moveTo(x, y - size);
      context.lineTo(x + size, y);
      context.lineTo(x, y + size);
      context.lineTo(x - size, y);
      context.closePath();
      context.lineWidth = comparison ? 2.2 : 1.4;
      context.strokeStyle = comparison ? '#a63a64' : '#17272a';
      if (!comparison) {
        context.fillStyle = historyColors[figure.kind];
        context.fill();
      }
      context.stroke();
      if (comparison || zoom < 2 || labels.some(([lx, ly]) => Math.abs(x - lx) < 100 && Math.abs(y - ly) < 16)) return;
      labels.push(point);
      context.font = '650 12px system-ui';
      context.lineWidth = 3.6;
      context.strokeStyle = '#1b3038';
      context.fillStyle = '#fff9eb';
      context.strokeText(figure.name, x + 10, y - 6);
      context.fillText(figure.name, x + 10, y - 6);
    }
    for (const figure of compared) drawRecord(figure, true);
    for (const figure of figures) drawRecord(figure, false);
  }

  function draw() {
    if (!width || !height) return;
    const ratio = canvas.width / width;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);
    projection.translate([width / 2, height / 2]).scale(Math.min(width, height) * .44 * zoom).rotate([-center[0], -center[1]]);
    const sea = context.createLinearGradient(0, 0, width, height);
    sea.addColorStop(0, '#3f7480');
    sea.addColorStop(1, '#183c4b');
    shape(sphere, sea, '#a3c4bd', 1.3);
    if (frame.dataset.atlasGrid !== 'false') shape(graticule, null, '#c4e4db44', .65);
    const land = context.createLinearGradient(width * .2, 0, width * .9, height);
    land.addColorStop(0, '#adbe98');
    land.addColorStop(1, '#779d91');
    shape(world, land, '#d6e4ce', .8);
    if (rivers && frame.dataset.atlasRivers === 'true') shape(rivers, null, '#326476', zoom >= 3 ? 1.1 : .8);
    const { figures = [], compared = [] } = history();
    drawHistoricalAreas(figures, compared);
    if (zoom < 2.3) {
      const radius = projection.scale();
      const light = context.createRadialGradient(width/2-radius*.3, height/2-radius*.32, radius*.12,
        width/2, height/2, radius);
      light.addColorStop(0, 'rgba(243,255,244,.11)');
      light.addColorStop(.72, 'rgba(10,36,56,.015)');
      light.addColorStop(1, 'rgba(8,32,50,.32)');
      shape(sphere, light);
    }
    drawMarkers();
    drawHistoricalMarkers(figures, compared);
  }

  function resize() {
    const bounds = canvas.getBoundingClientRect();
    width = bounds.width;
    height = bounds.height;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    draw();
  }

  function updateControls(preset = '') {
    for (const button of presetButtons) button.setAttribute('aria-pressed', String(button.dataset.mapView === preset));
    zoomButtons[0].disabled = zoom >= maxZoom;
    zoomButtons[1].disabled = zoom <= 1;
    mapStatus.textContent = mapLabel + (zoom > 1.01 ? ' · ' + new Intl.NumberFormat('nl-BE', { maximumFractionDigits: 1 }).format(zoom) + '×' : '');
  }

  function stopAnimation() {
    cancelAnimationFrame(animation);
    animation = 0;
  }

  function fly(target, targetZoom, label, preset = '') {
    stopAnimation();
    const start = center;
    const startZoom = zoom;
    const delta = longitude(target[0] - start[0]);
    const destinationZoom = clamp(targetZoom, 1, maxZoom);
    const began = performance.now();
    mapLabel = label;
    function step(time) {
      const fraction = reducedMotion.matches ? 1 : Math.min(1, (time - began) / 340);
      const ease = 1 - (1 - fraction) ** 3;
      center = [longitude(start[0] + delta * ease), start[1] + (target[1] - start[1]) * ease];
      zoom = fraction === 1 ? destinationZoom : startZoom * (destinationZoom / startZoom) ** ease;
      draw();
      if (fraction < 1) animation = requestAnimationFrame(step);
      else {
        animation = 0;
        updateControls(preset);
      }
    }
    animation = requestAnimationFrame(step);
  }

  function zoomAt(value, point) {
    zoom = clamp(value, 1, maxZoom);
    if (point) {
      const location = projection.invert(point);
      if (location && location.every(Number.isFinite) && distance(point, [width / 2, height / 2]) <= projection.scale()) center = [longitude(location[0]), clamp(location[1], -85, 85)];
      mapLabel = 'Kaart';
    }
    draw();
    updateControls();
  }

  function translate(dx, dy) {
    const degrees = 180 / (Math.PI * Math.max(1, projection.scale()));
    center = [longitude(center[0] - dx * degrees / Math.max(.4, Math.cos(center[1] * Math.PI / 180))),
      clamp(center[1] + dy * degrees, -85, 85)];
    mapLabel = 'Kaart';
    draw();
    updateControls();
  }

  function canvasPoint(event) {
    const bounds = canvas.getBoundingClientRect();
    return [event.clientX - bounds.left, event.clientY - bounds.top];
  }

  function hit(point) {
    const pin = historicalMarkers.find(marker => distance(point, marker.point) < 11);
    if (pin) return pin;
    const markersByDistance = markers.map(marker => ({ marker, distance: distance(point, marker.point) }))
      .sort((a, b) => a.distance - b.distance);
    const selectedMarker = markersByDistance[0];
    if (selectedMarker?.distance < (selectedMarker.marker.places.length > 1 ? 18 : 14)) return selectedMarker.marker;
    const label = markers.find(({ label }) => label && Math.abs(label[1] - point[1]) <= 8 &&
      point[0] >= label[0] - 2 && point[0] <= label[0] + label[2]);
    if (label) return label;
    if (distance(point, [width / 2, height / 2]) > projection.scale()) return;
    const coordinates = projection.invert(point);
    const area = history().figures?.find(figure => figure.area && geoContains(figure.area, coordinates));
    if (area) return { places: [area], historical: true };

  }

  function pick(marker) {
    if (!marker) return;
    if (marker.historical) {
      frame.dispatchEvent(new CustomEvent('atlas-entity-select', { detail: marker.places[0].id }));
      return;
    }
    if (marker.places.length === 1) {
      onSelect(marker.places[0].id);
      return;
    }
    const target = geoCentroid({ type: 'MultiPoint', coordinates: marker.places.map(place => place.coordinates) });
    fly(target, zoom * 2.25, marker.places.length + ' plaatsen');
  }

  function pinchDistance() {
    const [first, second] = pointers.values();
    return distance(first, second);
  }

  listen(canvas, 'pointerdown', event => {
    if (event.button > 0 || pointers.size >= 2) return;
    stopAnimation();
    pointers.set(event.pointerId, canvasPoint(event));
    canvas.setPointerCapture(event.pointerId);
    gesture = pointers.size === 1 ? { moved: false } :
      { moved: true, initialZoom: zoom, distance: Math.max(1, pinchDistance()) };
    canvas.classList.add('grabbing');
  });

  listen(canvas, 'pointermove', event => {
    const point = canvasPoint(event);
    const previous = pointers.get(event.pointerId);
    if (!previous) {
      if (pointers.size || event.pointerType === 'touch') return;
      const marker = hit(point);
      const nextHover = marker?.places.length === 1 ? marker.places[0].id : undefined;
      canvas.classList.toggle('over-marker', Boolean(marker));
      if (nextHover !== hover) { hover = nextHover; draw(); }
      return;
    }
    if (pointers.size === 1 && !gesture.moved && distance(point, previous) < 4) return;
    pointers.set(event.pointerId, point);
    gesture.moved = true;
    if (pointers.size === 2) {
      mapLabel = 'Kaart';
      zoomAt(gesture.initialZoom * pinchDistance() / gesture.distance);
    } else {
      translate(point[0] - previous[0], point[1] - previous[1]);
    }
  });

  function endPointer(event) {
    if (!pointers.has(event.pointerId)) return;
    const click = !gesture.moved && event.type === 'pointerup';
    pointers.delete(event.pointerId);
    if (!pointers.size) canvas.classList.remove('grabbing');
    if (click) pick(hit(canvasPoint(event)));
  }

  listen(canvas, 'pointerup', endPointer);
  listen(canvas, 'pointercancel', endPointer);
  listen(canvas, 'lostpointercapture', endPointer);
  listen(canvas, 'pointerleave', () => {
    if (hover) { hover = undefined; draw(); }
    canvas.classList.remove('over-marker');
  });
  listen(canvas, 'dblclick', event => zoomAt(zoom * 1.85, canvasPoint(event)));
  listen(canvas, 'wheel', event => {
    if (document.activeElement !== canvas) return;
    event.preventDefault();
    stopAnimation();
    zoomAt(zoom * (event.deltaY < 0 ? 1.16 : 1 / 1.16));
  }, { passive: false });
  listen(canvas, 'keydown', event => {
    const pan = { ArrowLeft: [28, 0], ArrowRight: [-28, 0], ArrowUp: [0, 28], ArrowDown: [0, -28] };
    if (Object.hasOwn(pan, event.key)) { stopAnimation(); translate(...pan[event.key]); }
    else if (event.key === '+' || event.key === '=') { stopAnimation(); zoomAt(zoom * 1.38); }
    else if (event.key === '-') { stopAnimation(); zoomAt(zoom / 1.38); }
    else return;
    event.preventDefault();
  });

  for (const button of zoomButtons) listen(button, 'click', () => {
    stopAnimation();
    zoomAt(zoom * Number(button.dataset.mapZoom));
  });
  for (const button of presetButtons) listen(button, 'click', () => {
    const preset = ATLAS_VIEWS[button.dataset.mapView];
    fly(preset.center, preset.zoom, preset.label, button.dataset.mapView);
  });
  const layerMessage = frame.querySelector('.atlas-layer-status');
  async function updateRivers() {
    if (frame.dataset.atlasRivers !== 'true') {
      layerMessage.textContent = '';
      return;
    }
    if (rivers || loadingRivers) return;
    loadingRivers = true;
    layerMessage.textContent = 'Rivierlaag laden…';
    riversRequest ??= fetchJson(new URL('./content/atlas-rivers.json?v=14r1', import.meta.url)).catch(error => {
      riversRequest = undefined;
      throw error;
    });
    try {
      rivers = await riversRequest;
      if (!frame.isConnected) return;
      layerMessage.textContent = '';
      draw();
    } catch {
      if (frame.isConnected && frame.dataset.atlasRivers === 'true') layerMessage.textContent = 'De rivierlaag is niet beschikbaar. Zet de laag uit en aan om opnieuw te laden.';
    } finally {
      loadingRivers = false;
    }
  }
  listen(frame, 'atlas-history', draw);
  listen(frame, 'atlas-filter', event => {
    updateRivers();
    filter = new Set(event.detail);
    const match = filter.size === 1 && places.find(place => filter.has(place.id));
    if (match) fly(match.coordinates, 9, name(match));
    else {
      stopAnimation();
      if (active && filter.has(active.id)) mapLabel = name(active);
      else if (active) mapLabel = 'Kaart';
      draw();
      updateControls();
    }
  });
  const visibleRows = frame.parentElement.querySelectorAll('[data-place-id]:not([hidden])');
  filter = new Set([...visibleRows].map(row => row.dataset.placeId));
  const single = filter.size === 1 && places.find(place => filter.has(place.id));
  if (single) {
    center = single.coordinates;
    zoom = 9;
    mapLabel = name(single);
  }
  let observer;
  function dispose() {
    stopAnimation();
    controls.abort();
    observer?.disconnect();
  }
  try {
    resize();
    if (!width || !height) throw new Error('AtlasCanvas');
    updateControls(active || single ? '' : 'wereld');
    if (typeof ResizeObserver === 'function') {
      observer = new ResizeObserver(resize);
      observer.observe(canvas);
    } else {
      listen(window, 'resize', resize);
    }
  } catch (error) {
    dispose();
    throw error;
  }
  updateRivers();
  return dispose;
}
