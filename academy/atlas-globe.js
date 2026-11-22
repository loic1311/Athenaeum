import './vendor/d3-array.min.mjs';
import './vendor/d3-geo.min.mjs';

const { geoDistance, geoGraticule10, geoOrthographic, geoPath } = globalThis.d3;
const sphere = { type: 'Sphere' };
const graticule = geoGraticule10();
let geography;

function loadGeography() {
  geography ??= fetch(new URL('./content/atlas-land.json?v=13r9', import.meta.url))
    .then(reply => {
      if (!reply.ok) throw new Error('Kaartgegevens konden niet laden.');
      return reply.json();
    }).catch(error => {
      geography = undefined;
      throw error;
    });
  return geography;
}

const clamp = (number, min, max) => Math.max(min, Math.min(max, number));

export async function mountAtlasGlobe(frame, places, selected, onSelect) {
  const world = await loadGeography();
  if (!frame.isConnected) return;
  const canvas = frame.querySelector('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('De wereldbol kon niet tekenen.');
  const controls = new AbortController();
  const listen = (element, event, handler, options = {}) =>
    element.addEventListener(event, handler, { ...options, signal: controls.signal });
  const projection = geoOrthographic().precision(.25).clipAngle(90);
  const path = geoPath(projection, context);
  const active = places.find(place => place.id === selected);
  let center = active ? [...active.coordinates] : [14, 28];
  let zoom = active ? 3.4 : 1;
  let width = 0, height = 0;
  let visible = [];
  let gesture;
  const pointers = new Map();

  function shape(geometry, fill, stroke, line = 1) {
    context.beginPath();
    path(geometry);
    if (fill) { context.fillStyle = fill; context.fill(); }
    if (stroke) { context.strokeStyle = stroke; context.lineWidth = line; context.stroke(); }
  }

  function draw() {
    if (!width || !height) return;
    const ratio = canvas.width / width;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);
    const radius = Math.min(width, height) * .45 * zoom;
    projection.translate([width / 2, height / 2]).scale(radius).rotate([-center[0], -center[1]]);
    const sea = context.createLinearGradient(0, 0, width, height);
    sea.addColorStop(0, '#326673');
    sea.addColorStop(1, '#123844');
    shape(sphere, sea, '#e4f7ef', 1.25);
    shape(graticule, null, '#c8ebe044', .65);
    shape(world, '#9dbaaa', '#d5e7d3', .58);

    visible = places.filter(place => geoDistance(center, place.coordinates) < Math.PI / 2)
      .map(place => ({ place, point: projection(place.coordinates) }))
      .filter(({ point: [x, y] }) => x > 0 && x < width && y > 0 && y < height)
      .sort((a, b) => Number(b.place === active) - Number(a.place === active));
    const labels = [];
    context.font = '600 12px system-ui';
    context.textBaseline = 'middle';
    for (const { place, point: [x, y] } of visible) {
      const focus = place === active;
      context.beginPath();
      context.arc(x, y, focus ? 7.5 : 4.6, 0, 2 * Math.PI);
      context.fillStyle = focus ? '#f4cb80' : '#f2fff7';
      context.fill();
      context.lineWidth = focus ? 2.5 : 1.5;
      context.strokeStyle = '#123944';
      context.stroke();
      const labelW = context.measureText(place.name).width + 6;
      const left = x + labelW + 13 < width ? x + 11 : x - labelW - 10;
      const top = y - 7;
      if (left < 2 || labels.some(label => Math.abs(label.y - top) < 16 &&
          left < label.right + 3 && left + labelW > label.left - 3)) continue;
      context.lineWidth = 3;
      context.strokeStyle = '#153e48';
      context.strokeText(place.name, left, y);
      context.fillStyle = focus ? '#ffe2ad' : '#f5fff6';
      context.fillText(place.name, left, y);
      labels.push({ left, right: left + labelW, y: top });
    }
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

  function setZoom(value) {
    zoom = clamp(value, 1, 9);
    draw();
  }

  function translate(dx, dy) {
    const degrees = 180 / (Math.PI * Math.max(1, projection.scale()));
    center = [
      (center[0] - dx * degrees + 540) % 360 - 180,
      clamp(center[1] + dy * degrees, -83, 83),
    ];
    draw();
  }

  function pick(event) {
    const bounds = canvas.getBoundingClientRect();
    const x = event.clientX - bounds.left, y = event.clientY - bounds.top;
    const closest = visible.map(({ place, point }) => ({ place, distance: Math.hypot(x - point[0], y - point[1]) }))
      .sort((a, b) => a.distance - b.distance)[0];
    if (closest?.distance < 17) onSelect(closest.place.id);
  }

  function pinchDistance() {
    const [first, second] = [...pointers.values()];
    return Math.hypot(first.x - second.x, first.y - second.y);
  }

  listen(canvas, 'pointerdown', event => {
    if (event.button > 0 || pointers.size >= 2) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    canvas.setPointerCapture(event.pointerId);
    if (pointers.size === 1) gesture = { moved: false };
    else gesture = { moved: true, initialZoom: zoom, distance: Math.max(1, pinchDistance()) };
    canvas.classList.add('grabbing');
  });

  listen(canvas, 'pointermove', event => {
    const old = pointers.get(event.pointerId);
    if (!old) return;
    const dx = event.clientX - old.x, dy = event.clientY - old.y;
    if (pointers.size === 1 && !gesture.moved && Math.hypot(dx, dy) < 4) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    gesture.moved = true;
    if (pointers.size === 2) setZoom(gesture.initialZoom * pinchDistance() / gesture.distance);
    else translate(dx, dy);
  });

  function endPointer(event) {
    if (!pointers.has(event.pointerId)) return;
    const click = !gesture.moved && event.type === 'pointerup';
    pointers.delete(event.pointerId);
    if (!pointers.size) canvas.classList.remove('grabbing');
    if (click) pick(event);
  }

  listen(canvas, 'pointerup', endPointer);
  listen(canvas, 'pointercancel', endPointer);
  listen(canvas, 'keydown', event => {
    const pan = { ArrowLeft: [28, 0], ArrowRight: [-28, 0], ArrowUp: [0, 28], ArrowDown: [0, -28] };
    if (Object.hasOwn(pan, event.key)) translate(...pan[event.key]);
    else if (event.key === '+' || event.key === '=') setZoom(zoom * 1.38);
    else if (event.key === '-') setZoom(zoom / 1.38);
    else return;
    event.preventDefault();
  });
  for (const control of frame.querySelectorAll('[data-map-control]')) listen(control, 'click', () => {
    if (control.dataset.mapControl === 'reset') {
      center = [14, 28];
      setZoom(1);
    } else {
      setZoom(zoom * Number(control.dataset.mapControl));
    }
  });
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  resize();
  frame.dataset.ready = 'true';
  return () => { controls.abort(); observer.disconnect(); };
}
