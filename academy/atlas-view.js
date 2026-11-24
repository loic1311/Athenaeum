import { ATLAS_PLACES, ATLAS_VIEWS, atlasById, historicalName, readAtlasYear } from './atlas-catalog.js?v=142';
import { byDate, explorerHref, explorationLessonHref, historyInScope } from './history-explorer.js?v=150';
import { explorerHeader, learningPath } from './history-explorer-view.js?v=150';
import { esc } from './views.js?v=150';

const count = n => n + (n === 1 ? ' les' : ' lessen');
const nameKey = value => String(value || '').normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
const siteLessons = new Map();
for (const place of ATLAS_PLACES) for (const id of place.lessons) {
  if (!siteLessons.has(id)) siteLessons.set(id, new Set());
  siteLessons.get(id).add(place.id);
}
function groupAtlasLessons(lessons, scope) {
  const grouped = new Map();
  for (const lesson of lessons) {
    if (!historyInScope(lesson, scope)) continue;
    for (const id of new Set([...(siteLessons.get(lesson.id) || []), ...(lesson.places || [])])) {
      if (!atlasById.has(id)) continue;
      if (!grouped.has(id)) grouped.set(id, []);
      grouped.get(id).push(lesson);
    }
  }
  for (const list of grouped.values()) list.sort(byDate);
  return grouped;
}
function overview(place, path) {
  const direct = path.filter(unit => unit.places?.includes(place.id) || unit.id.startsWith('atlas-' + place.id));
  const stages = place.stages || direct.map(unit => [unit.period,unit.title.replace(/^.*? · /u,''),unit.summary]);
  if (!stages.length) return '';
  return '<details class="atlas-overview"><summary>Beknopt stadsoverzicht</summary><ol>' + stages.map(([period,title,text]) =>
    '<li><small>' + esc(period) + '</small><h3>' + esc(title) + '</h3><p>' + esc(text) + '</p></li>').join('') + '</ol></details>';
}
export function atlasPage(lessons, scope, key, studied, read) {
  const paths = groupAtlasLessons(lessons, scope);
  const available = ATLAS_PLACES.map(place => ({ place, lessons: (paths.get(place.id) || []) }))
    .filter(entry => entry.lessons.length).sort((a, b) => a.place.name.localeCompare(b.place.name, 'nl'));
  const selected = available.find(entry => entry.place.id === key);
  const chosen = selected?.place;
  const path = selected?.lessons ?? [];
  const next = path.find(lesson => !read.has(lesson.id) && !studied.has(lesson.id)) ?? path[0];
  const prompt = 'Draai de wereldbol en kies een stad. Tik op een groep spelden om verder in te zoomen.';
  return explorerHeader('atlas', scope, chosen?.id, prompt) + `
    <div class="atlas-layout" data-atlas-scope="${esc(scope)}">
      <section id="atlas-globe" class="atlas-frame" data-selected-place="${esc(chosen?.id || '')}" aria-label="Interactieve historische wereldbol">
        <div class="atlas-map">
          <p class="atlas-loading" role="status">Wereldbol laden…</p>
          <canvas role="region" tabindex="-1" aria-label="Wereldbol. Draai met de pijltjestoetsen, zoom met plus en min, of selecteer een plaats in de lijst.">
            Kies een plaats in de lijst.
          </canvas>
          <div class="atlas-map-label"><span aria-hidden="true"></span><span id="atlas-map-status">${chosen ? esc(chosen.name) : 'Wereld'}</span></div>
          ${next ? `<a class="button atlas-map-open" href="#${explorationLessonHref(next.id, 'atlas', scope, chosen.id)}">Leerpad ${esc(chosen.name)}</a>` : ''}
          <div class="atlas-controls" role="group" aria-label="Kaartzoom" hidden>
            <button class="button icon-only" type="button" data-map-zoom="1.45" aria-label="Inzoomen">+</button>
            <button class="button icon-only" type="button" data-map-zoom=".69" aria-label="Uitzoomen">−</button>
          </div>
          <div class="atlas-error notice" hidden><p role="status"></p>
            <button type="button" class="button small" data-atlas-retry>Kaart opnieuw laden</button></div>
        </div>
        <div class="atlas-map-footer">
          <div class="row atlas-presets" aria-label="Ga naar een regio" hidden>${Object.entries(ATLAS_VIEWS).map(([id, view]) =>
            `<button type="button" class="chip outline" data-map-view="${id}" aria-pressed="${!chosen && id === 'wereld'}">${view.label}</button>`).join('')}</div>
          <p class="small-text muted">Huidige kustlijnen op een orthografische wereldbol. Sleep om te draaien, knijp of dubbelklik om in te zoomen. <a class="text-link" href="https://www.naturalearthdata.com/downloads/110m-physical-vectors/" target="_blank" rel="noopener noreferrer">Kustlijnen van Natural Earth</a> · <a class="text-link" href="https://www.naturalearthdata.com/downloads/110m-physical-vectors/110m-rivers-lake-centerlines/" target="_blank" rel="noopener noreferrer">Huidige rivierlopen</a></p><p class="atlas-layer-status small-text" role="status"></p>
        </div>
      </section>
      <section class="panel stack atlas-places" aria-label="Plaatsen met een leerpad">
        ${chosen ? `<div class="atlas-selection">
          <p class="small-text">${esc(chosen.region)}</p><h2>${esc(chosen.name)}</h2><p>${esc(chosen.text)}</p>${overview(chosen,path)}
          <div class="row"><a class="button primary" href="#${explorationLessonHref(next.id, 'atlas', scope, chosen.id)}">Uitgebreid studeren</a>
          <button class="button quiet" type="button" data-action="scroll-to" data-value="explorer-path">Alle lessen</button></div>
        </div>` : '<h2>Plaatsen</h2>'}
        <div class="field"><label for="atlas-search">Zoek een stad of regio</label>
          <input type="search" id="atlas-search" placeholder="Bijvoorbeeld Parijs, Tolosa of Spanje" aria-controls="atlas-city-list"></div>
        <div class="field"><label for="atlas-year">Historische tijdslaag</label><input id="atlas-year" type="text" placeholder="Bijvoorbeeld 100 n.Chr." aria-describedby="atlas-year-note" aria-controls="atlas-city-list"></div>
        <p id="atlas-year-note" class="small-text muted">Een leeg veld toont alle plaatsen. Per jaar zie je de vastgelegde naamperiodes. Een huidige naam blijft beschikbaar wanneer er geen eindjaar is vastgelegd. Een ontbrekende markering kan op een leemte in de gegevens wijzen.</p>
        <div class="row atlas-options"><button type="button" class="button small quiet" data-atlas-reset>Wis filters</button><label><input type="checkbox" data-atlas-grid checked> Gradennet</label><label><input type="checkbox" data-atlas-rivers> Grote rivieren</label></div>
        <p id="atlas-year-message" role="status" class="small-text"></p><p id="atlas-results" class="small-text muted" aria-live="polite">${available.length} ${available.length === 1 ? 'plaats' : 'plaatsen'}</p>
        <p id="atlas-empty" class="empty" ${available.length ? 'hidden' : ''}>Geen plaatsen gevonden. Pas je zoekterm of het segment aan.</p>
        <ul class="unit-list explorer-list" id="atlas-city-list">${available.map(({ place, lessons: cityLessons }) => `
          <li data-place-id="${place.id}" data-place-name="${esc([place.name, place.region, place.aliases].filter(Boolean).join(' '))}">
            <a class="atlas-place" ${place === chosen ? 'aria-current="page"' : ''} href="#${explorerHref('atlas', scope, place.id)}">
              <span><strong data-atlas-name>${esc(place.name)}</strong><span class="small-text muted">${esc(place.region)}</span></span>
              <span class="small-text">${count(cityLessons.length)}</span></a></li>`).join('')}</ul>
      </section>
    </div>
    ${chosen ? learningPath(chosen.name, chosen.text, path, 'atlas', scope, chosen.id, studied, read, 'Alle plaatsen') : ''}`;
}

const filters = new Map();
export function bindAtlasFilters(frame) {
  const layout = frame.closest('.atlas-layout');
  if (!layout) return;
  const scope = layout.dataset.atlasScope;
  const saved = filters.get(scope) || {query: '', year: '', grid: true};
  const nameInput = layout.querySelector('#atlas-search');
  const yearInput = layout.querySelector('#atlas-year');
  const gridInput = layout.querySelector('[data-atlas-grid]');
  const riverInput = layout.querySelector('[data-atlas-rivers]');
  const counter = layout.querySelector('#atlas-results');
  const empty = layout.querySelector('#atlas-empty');
  const message = layout.querySelector('#atlas-year-message');
  const rows = [...layout.querySelectorAll('[data-place-id]')];
  nameInput.value = saved.query;
  yearInput.value = saved.year;
  gridInput.checked = saved.grid;
  riverInput.checked = Boolean(saved.rivers);
  function apply() {
    const words = nameKey(nameInput.value.trim()).split(/\s+/u).filter(Boolean);
    const year = readAtlasYear(yearInput.value);
    const invalid = Number.isNaN(year);
    const selected = [];
    yearInput.setAttribute('aria-invalid', String(invalid));
    message.textContent = invalid ? 'Gebruik een historisch jaartal, bijvoorbeeld 44 v.Chr. of 125 n.Chr. De telling kent geen jaar nul.' : '';
    for (const row of rows) {
      const place = atlasById.get(row.dataset.placeId);
      const label = year === null ? place.name : historicalName(place, year);
      const match = Boolean(label) && words.every(word => nameKey(row.dataset.placeName).includes(word));
      row.hidden = !match;
      row.querySelector('[data-atlas-name]').textContent = year !== null && label && nameKey(label) !== nameKey(place.name) ? label + ' · ' + place.name : place.name;
      if (match) selected.push(place.id);
    }
    const focus = frame.dataset.selectedPlace;
    if (focus) {
      const matched = selected.includes(focus);
      for (const panel of [layout.querySelector('.atlas-selection'), frame.querySelector('.atlas-map-open'), layout.nextElementSibling]) {
        if (panel && (panel === layout.nextElementSibling ? panel.id === 'explorer-path' : true)) panel.hidden = !matched;
      }
    }
    empty.hidden = selected.length > 0 || invalid;
    counter.textContent = invalid ? '' : selected.length + (selected.length === 1 ? ' plaats' : ' plaatsen');
    frame.dataset.atlasYear = Number.isInteger(year) ? year : '';
    frame.dataset.atlasRivers = String(riverInput.checked);
    frame.dataset.atlasGrid = gridInput.checked ? 'true' : 'false';
    frame.dispatchEvent(new CustomEvent('atlas-filter', {detail: selected}));
    filters.set(scope, {query: nameInput.value, year: yearInput.value, grid: gridInput.checked, rivers: riverInput.checked});
  }
  nameInput.addEventListener('input', apply);
  yearInput.addEventListener('input', apply);
  gridInput.addEventListener('change', apply);
  riverInput.addEventListener('change', apply);
  layout.querySelector('[data-atlas-reset]').addEventListener('click', () => {
    nameInput.value = ''; yearInput.value = ''; apply(); nameInput.focus();
  });
  apply();
}

let globeModule;
let globeImportFailed = false;

function loadGlobe(retry) {
  globeModule ??= (globeImportFailed && retry
    ? import('./atlas-globe.js?v=142-retry')
    : import('./atlas-globe.js?v=142'))
    .catch(error => {
      globeModule = undefined;
      globeImportFailed = true;
      throw error;
    });
  return globeModule;
}

export function mountAtlas(frame, onSelect) {
  bindAtlasFilters(frame);
  const layout = frame.closest('.atlas-layout');
  const available = new Set([...layout.querySelectorAll('[data-place-id]')].map(row => row.dataset.placeId));
  const places = ATLAS_PLACES.filter(place => available.has(place.id));
  const loading = frame.querySelector('.atlas-loading');
  const canvas = frame.querySelector('canvas');
  const errorPanel = frame.querySelector('.atlas-error');
  const retryButton = frame.querySelector('[data-atlas-retry]');
  const mapControls = frame.querySelector('.atlas-controls');
  const presets = frame.querySelector('.atlas-presets');
  let dispose;
  let closed = false;
  let pending = false;

  async function start(retry = false) {
    if (pending || closed) return;
    pending = true;
    delete frame.dataset.failed;
    errorPanel.hidden = true;
    loading.hidden = false;
    canvas.hidden = false;
    try {
      const { mountAtlasGlobe } = await loadGlobe(retry);
      if (closed) return;
      const cleanup = await mountAtlasGlobe(frame, places, frame.dataset.selectedPlace, onSelect, { retry });
      if (closed) { cleanup?.(); return; }
      dispose = cleanup;
      frame.dataset.ready = 'true';
      canvas.tabIndex = 0;
      loading.hidden = true;
      mapControls.hidden = false;
      presets.hidden = false;
      if (retry) canvas.focus({ preventScroll: true });
    } catch (error) {
      if (closed) return;
      frame.dataset.failed = 'true';
      loading.hidden = true;
      canvas.hidden = true;
      errorPanel.hidden = false;
      const reason = error?.message === 'AtlasCanvas' ? 'De browser kon de wereldbol niet tekenen.' :
        error?.message === 'AtlasGeography' ? 'De kustlijnen konden niet worden gelezen.' :
        navigator.onLine === false ? 'De kaartbestanden zijn niet offline beschikbaar.' :
        'De kaartbestanden konden niet laden.';
      errorPanel.querySelector('p').textContent = reason + ' De leerpaden blijven beschikbaar in de plaatsenlijst.';
      if (retry) retryButton.focus({ preventScroll: true });
    } finally {
      pending = false;
    }
  }

  const retry = () => start(true);
  retryButton.addEventListener('click', retry);
  start();
  return () => {
    closed = true;
    retryButton.removeEventListener('click', retry);
    dispose?.();
  };
}
