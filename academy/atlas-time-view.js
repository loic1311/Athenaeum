import { readAtlasYear } from './atlas-catalog.js?v=142';
import { ATLAS_KINDS, ATLAS_REGIONS, atlasSnapshot, atlasTicks, formatAtlasYear, loadAtlasAreas } from './atlas-time.js?v=160';
import { esc, sourceView } from './views.js?v=160';

const states = new Map();
const selection = new WeakMap();
export const getAtlasHistory = frame => selection.get(frame) ?? {};

export function atlasTimeline() {
  return `<div class="atlas-time stack" aria-label="Historische tijdschuif">
    <div class="row"><label for="atlas-slider">Tijdschuif</label><output id="atlas-slider-label" for="atlas-slider">Nu</output></div>
    <input id="atlas-slider" type="range" min="0" step="1" aria-describedby="atlas-year-note">
    <div class="atlas-time-ticks small-text"><span data-time-start></span><span data-time-end></span></div>
    <div class="atlas-time-fields">
      <label class="field">Historische tijdslaag <input id="atlas-year" type="text" placeholder="Bijvoorbeeld 1200 v.Chr." aria-describedby="atlas-year-note atlas-year-message"></label>
      <label class="field">Tijdschaal <select data-time-span>
        <option value="0">Wereldgeschiedenis</option><option value="100">200 jaar rond de gekozen datum</option>
        <option value="25">50 jaar rond de gekozen datum</option>
      </select></label>
    </div>
    <div class="row">
      <button type="button" class="button small" data-time-now>Nu</button>
      <button type="button" class="button small" data-time-play aria-pressed="false">Afspelen</button>
      <label class="small-text">Tempo <select data-time-speed aria-label="Afspeeltempo">
        <option value="1800">Rustig</option><option value="900">Normaal</option><option value="400">Snel</option>
      </select></label>
    </div>
    <p class="small-text muted" id="atlas-year-note">Schuif door tijdvakken of typ een jaar. Grenzen en dateringen kunnen benaderend zijn.</p>
    <p class="small-text" id="atlas-year-message" role="status"></p>
  </div>`;
}

export function atlasHistoricalPanel() {
  return `<section class="atlas-historical stack" data-atlas-historical hidden aria-label="Historische kaartlagen">
    <div class="atlas-time-fields">
      <label class="field">Regio <select data-atlas-region><option value="">Alle regio’s</option>
        ${ATLAS_REGIONS.map(region => '<option>' + esc(region) + '</option>').join('')}</select></label>
      <label class="field">Kaartlaag <select data-atlas-kind><option value="">Alle soorten</option>
        ${Object.entries(ATLAS_KINDS).map(([id, name]) => `<option value="${id}">${esc(name)}</option>`).join('')}</select></label>
    </div>
    <label class="field">Vergelijk met <input data-atlas-comparison type="text" placeholder="Bijvoorbeeld 810 n.Chr." aria-describedby="atlas-compare-message"></label>
    <p class="small-text" id="atlas-compare-message" role="status"></p>
    <div class="atlas-legend small-text" aria-label="Kaartlegenda">
      <span><i class="atlas-key area"></i>Gereconstrueerd gebied</span>
      <span><i class="atlas-key political"></i>Politiek centrum of oriëntatiepunt</span>
      <span><i class="atlas-key culture"></i>Culturele vindregio</span>
      <span><i class="atlas-key site"></i>Vindplaats</span>
      <span><i class="atlas-key network"></i>Knooppunt</span>
    </div>
    <div class="atlas-history-selection" data-atlas-history-selection></div>
    <section class="stack" aria-label="Historische entiteiten"><h3 data-time-results></h3><div data-time-list></div></section>
    <section class="stack" data-compare-section hidden aria-label="Vergelijkende tijdslaag">
      <h3 data-compare-results></h3><p class="small-text"><i class="atlas-key comparison"></i> Paarse omtrek op de kaart</p><div data-compare-list></div>
    </section>
    <p class="small-text muted" data-time-coverage>De lagen tonen de beschikbare reconstructies en vindplaatsen. Een lege regio kan een leemte in de kaartgegevens zijn.</p>
    <p class="small-text" data-area-status role="status"></p>
    <button type="button" class="button small quiet" data-area-retry hidden>Gebieden opnieuw laden</button>
  </section>`;
}

export function bindAtlasTime(frame, lessons, onYear) {
  const layout = frame.closest('.atlas-layout');
  const scope = layout.dataset.atlasScope;
  const state = states.get(scope) ?? { year: '', span: 0, center: null, region: '', kind: '', compare: '' };
  states.set(scope, state);
  const controls = new AbortController();
  const fields = { year: '#atlas-year', slider: '#atlas-slider', span: '[data-time-span]', region: '[data-atlas-region]',
    kind: '[data-atlas-kind]', compare: '[data-atlas-comparison]', query: '#atlas-search' };
  const inputs = Object.fromEntries(Object.entries(fields).map(([name, selector]) => [name, layout.querySelector(selector)]));
  for (const name of ['year', 'span', 'region', 'kind', 'compare']) inputs[name].value = state[name];
  const panel = layout.querySelector('[data-atlas-historical]');
  const details = panel.querySelector('[data-atlas-history-selection]');
  const playControl = layout.querySelector('[data-time-play]');
  const areaStatus = panel.querySelector('[data-area-status]');
  const retryButton = panel.querySelector('[data-area-retry]');
  const byLesson = new Map(lessons.map(lesson => [lesson.id, lesson]));
  const listen = (node, event, action) => node.addEventListener(event, action, { signal: controls.signal });
  let areas;
  let pending;
  let timer = 0;
  let figures = [];
  let compared = [];
  let ticks = [];

  function select(id, rows) {
    state.selected = id;
    const record = rows.find(row => row.id === id);
    if (!record) { details.innerHTML = ''; return; }
    const [from, until, phase] = record.period;
    const related = record.lessons.map(lesson => byLesson.get(lesson)).filter(Boolean);
    const relation = record.area?.properties.relation;
    details.innerHTML = `<article class="atlas-selection stack"><h3 tabindex="-1">${esc(record.name)}</h3>
      <p class="small-text">${esc(phase)} · ${formatAtlasYear(from)} tot ${formatAtlasYear(until)}</p><p>${esc(record.text)}</p>
      <p class="small-text muted">${esc(record.uncertainty)}</p>
      ${related.length ? '<h4>Bijbehorende lessen</h4><ul>' + related.map(lesson =>
        '<li><a class="text-link" href="#les/' + encodeURIComponent(lesson.id) + '">' + esc(lesson.title) + '</a></li>').join('') + '</ul>' : ''}
      ${sourceView(record.source)}
      ${relation ? '<p class="small-text"><a class="text-link" href="https://www.openhistoricalmap.org/relation/' + relation +
         '" target="_blank" rel="noopener noreferrer">OpenHistoricalMap-bijdragers · geometrie en brongegevens (CC0)</a></p>' : ''}</article>`;
  }

  function setSlider(year) {
    const display = Number.isFinite(year) ? year : null;
    ticks = atlasTicks(state.span, state.center);
    if (display !== null && !ticks.includes(display) && display > ticks[0] && display < (ticks.at(-1) ?? new Date().getFullYear())) {
      ticks.splice(ticks.findIndex(value => value === null || value > display), 0, display);
    }
    let index = ticks.indexOf(display);
    if (index < 0 && display !== null) {
      index = ticks.reduce((nearest, candidate, i) =>
        candidate !== null && Math.abs(candidate - display) < Math.abs(ticks[nearest] - display) ? i : nearest, 0);
    }
    inputs.slider.max = ticks.length - 1;
    inputs.slider.value = index < 0 ? ticks.length - 1 : index;
    inputs.slider.setAttribute('aria-valuetext', formatAtlasYear(display));
    layout.querySelector('#atlas-slider-label').textContent = formatAtlasYear(display);
    layout.querySelector('[data-time-start]').textContent = formatAtlasYear(ticks[0]);
    layout.querySelector('[data-time-end]').textContent = formatAtlasYear(ticks.at(-1));
  }

  const list = (rows, type) => rows.length ? '<ul class="atlas-entity-list">' + rows.map(row =>
    `<li><button class="button quiet" type="button" data-atlas-entity="${row.id}" data-entity-time="${type}">
    <i class="atlas-key ${row.kind}" aria-hidden="true"></i><span>${esc(row.name)}</span></button></li>`).join('') + '</ul>' :
    '<p class="muted small-text">Geen gegevens voor deze selectie.</p>';

  function render() {
    const year = readAtlasYear(inputs.year.value);
    const compareYear = readAtlasYear(inputs.compare.value);
    const query = { region: inputs.region.value, kind: inputs.kind.value, query: inputs.query.value };
    const historical = Number.isInteger(year);
    figures = atlasSnapshot(year, areas, query);
    compared = historical ? atlasSnapshot(compareYear, areas, query) : [];
    selection.set(frame, { figures, compared });
    panel.hidden = !historical;
    inputs.year.setAttribute('aria-invalid', String(Number.isNaN(year)));
    inputs.compare.setAttribute('aria-invalid', String(Number.isNaN(compareYear)));
    layout.querySelector('#atlas-year-message').textContent = Number.isNaN(year)
      ? 'Vul een jaartal in, bijvoorbeeld 44 v.Chr. of 125 n.Chr. De telling kent geen jaar nul.' : '';
    panel.querySelector('#atlas-compare-message').textContent = Number.isNaN(compareYear) ? 'Vul een geldig historisch jaartal in.' : '';
    panel.querySelector('[data-time-results]').textContent = historical ? formatAtlasYear(year) + ' · ' + figures.length + ' vermeldingen' : '';
    panel.querySelector('[data-compare-results]').textContent = Number.isInteger(compareYear) ? formatAtlasYear(compareYear) + ' · vergelijkingslaag' : '';
    panel.querySelector('[data-time-list]').innerHTML = list(figures, 'main');
    panel.querySelector('[data-compare-list]').innerHTML = list(compared, 'comparison');
    panel.querySelector('[data-compare-section]').hidden = !Number.isInteger(compareYear);
    select(state.selected, state.activeTime === 'comparison' ? compared : figures);
    for (const name of ['year', 'region', 'kind', 'compare']) state[name] = inputs[name].value;
    setSlider(year);
    onYear(year, query.region, query.kind);
    frame.dispatchEvent(new Event('atlas-history'));
    if (historical && !areas && !pending && retryButton.hidden) void load();
  }

  async function load(retry = false) {
    retryButton.hidden = true;
    areaStatus.textContent = 'Gereconstrueerde gebieden laden…';
    try {
      pending = loadAtlasAreas(retry);
      const data = await pending;
      if (controls.signal.aborted) return;
      areas = data;
      areaStatus.textContent = '';
      render();
    } catch {
      if (controls.signal.aborted) return;
      areaStatus.textContent = 'De gereconstrueerde grenzen zijn tijdelijk niet beschikbaar. De vindplaatsen en knooppunten blijven toegankelijk.';
      retryButton.hidden = false;
    } finally {
      pending = undefined;
    }
  }

  function pause() {
    window.clearTimeout(timer);
    timer = 0;
    playControl.textContent = 'Afspelen';
    playControl.setAttribute('aria-pressed', 'false');
  }

  function applyTick() {
    const year = ticks[Number(inputs.slider.value)];
    inputs.year.value = year === null ? '' : formatAtlasYear(year);
    render();
  }

  function advance() {
    if (inputs.slider.valueAsNumber >= Number(inputs.slider.max)) { pause(); return; }
    inputs.slider.valueAsNumber++;
    applyTick();
    timer = window.setTimeout(advance, Number(layout.querySelector('[data-time-speed]').value));
  }

  listen(inputs.slider, 'input', () => { pause(); applyTick(); });
  listen(inputs.year, 'input', () => {
    pause();
    const year = readAtlasYear(inputs.year.value);
    if (Number.isInteger(year) && state.span) state.center = year;
    render();
  });
  listen(inputs.span, 'change', () => {
    pause();
    state.span = Number(inputs.span.value);
    const year = readAtlasYear(inputs.year.value);
    state.center = Number.isFinite(year) ? year : new Date().getFullYear();
    render();
  });
  const now = () => {
    pause();
    inputs.year.value = '';
    inputs.span.value = '0';
    inputs.region.value = '';
    inputs.kind.value = '';
    inputs.compare.value = '';
    state.span = 0;
    state.center = null;
    render();
  };
  listen(layout.querySelector('[data-time-now]'), 'click', now);
  listen(playControl, 'click', () => {
    if (timer) { pause(); return; }
    if (inputs.slider.value === inputs.slider.max) inputs.slider.value = '0';
    applyTick();
    playControl.textContent = 'Pauzeren';
    playControl.setAttribute('aria-pressed', 'true');
    timer = window.setTimeout(advance, Number(layout.querySelector('[data-time-speed]').value));
  });
  for (const name of ['region', 'kind', 'compare', 'query']) listen(inputs[name], 'input', render);
  listen(retryButton, 'click', () => { if (!pending) void load(true); });
  listen(panel, 'click', event => {
    const button = event.target.closest('[data-atlas-entity]');
    if (!button) return;
    state.activeTime = button.dataset.entityTime;
    select(button.dataset.atlasEntity, state.activeTime === 'comparison' ? compared : figures);
    details.querySelector('h3')?.focus();
  });
  listen(frame, 'atlas-entity-select', event => { state.activeTime = 'main'; select(event.detail, figures); });
  render();
  return { reset: now, close: () => { pause(); controls.abort(); } };
}
