import { CHRONOLOGY_EVENTS } from './content/chronology-events.js?v=14r1';
import { byDate, explorerHref, explorationLessonHref, hasTheme, HISTORICAL_ERAS, historyInScope,
  inEra, STUDY_THEMES } from './history-explorer.js?v=14r1';
import { chronologyYear, HISTORICAL_TRACKS, timelineScope } from './history-chronology.js?v=14r1';
import { ATLAS_PLACES } from './atlas-catalog.js?v=14r1';
import { TRACKS } from './learning.js?v=13r8';
import { searchLessons } from './lesson-search.js?v=13r9';
import { esc, heading, historyExplorerNav, icon, studyMeter } from './views.js?v=14r1';

const REGIONS = { europa: 'Europa', azie: 'Azië', afrika: 'Afrika', amerika: 'Amerika', oceanie: 'Oceanië' };
const dateExpression = /^(-?\d{1,9})(vchr|nchr|v|n|bce?|ad|ce)?(?:[-–—](-?\d{1,9})(vchr|nchr|v|n|bce?|ad|ce)?)?$/u;
const words = value => String(value ?? '').normalize('NFD').replace(/\p{M}/gu,'').toLowerCase();
const dated = (entry, era) => entry.from <= era.to && (entry.to ?? entry.from) >= era.from;
const erasById = new Map(HISTORICAL_ERAS.map(era => [era.id, era]));
const eventsByLesson = new Map();
const placesByLesson = new Map();
const placeById = new Map(ATLAS_PLACES.map(place => [place.id, place]));

for (const [entries, index] of [[CHRONOLOGY_EVENTS, eventsByLesson],[ATLAS_PLACES, placesByLesson]]) {
  for (const entry of entries) {
    for (const id of entry.lessons) {
      if (!index.has(id)) index.set(id, []);
      index.get(id).push(entry);
    }
  }
}

const numberLabel = (n, one, many) => n + ' ' + (n === 1 ? one : many);
const lessonCount = n => numberLabel(n,'les','lessen');
const eventCount = n => numberLabel(n,'gebeurtenis','gebeurtenissen');
const stateOf = (lesson, studied, read) => studied.has(lesson.id) ? 'Geoefend' : read.has(lesson.id) ? 'Gelezen' : '';

export function parseChronologyDate(query) {
  const value = words(query).trim().replaceAll('−','-').replaceAll('tot','–').replace(/[.\s]/gu,'');
  const match = value.match(dateExpression);
  if (!match) return /^[\d+\-–—]+(?:[a-z\-–—\d]*)$/u.test(value) && !/[a-z]{4,}/u.test(value) ? { error: true } : null;
  const year = (digits, suffix) => {
    if (!digits) return undefined;
    const amount = Number(digits);
    if (amount === 0 || (amount < 0 && suffix)) return NaN;
    return /^(v|bc)/u.test(suffix || '') ? -amount : amount;
  };
  const left = year(match[1], match[2] || (match[4] && !match[1].startsWith('-') ? match[4] : undefined));
  const right = match[3] ? year(match[3], match[4] || (match[2] && !match[3].startsWith('-') ? match[2] : undefined)) : left;
  return Number.isFinite(left) && Number.isFinite(right) ? { from: Math.min(left,right), to: Math.max(left,right) } : { error: true };
}

const newUrl = (scope, era, options) => {
  const params = new URLSearchParams();
  if (options.query) params.set('q', options.query);
  if (options.region) params.set('regio', options.region);
  if (options.theme) params.set('thema', options.theme);
  if (options.zoom === 'detail') params.set('zoom','detail');
  if (era && options.core) params.set('kern','1');
  const base = 'paideia/chronologie/' + timelineScope(scope) + '/' +
    (era ? 'tijdvak/' + encodeURIComponent(era.id) : options.core ? 'kern' : 'alle');
  return base + (params.size || params.toString() ? '/' + encodeURIComponent(params.toString()) : '');
};
const optionsFor = (mode, raw) => {
  const params = new URLSearchParams(raw || '');
  const theme = params.get('thema');
  const region = params.get('regio');
  return { query: params.get('q')?.trim() || '', region: Object.hasOwn(REGIONS,region) ? region : '',
    theme: STUDY_THEMES.some(entry => entry.id === theme) ? theme : '',
    core: mode === 'kern' || params.get('kern') === '1', zoom: params.get('zoom') === 'detail' ? 'detail' : 'overzicht' };
};

const relatedPlaces = lesson => {
  const places = new Map((placesByLesson.get(lesson.id) || []).map(place => [place.id, place]));
  for (const id of lesson.places || []) if (placeById.has(id)) places.set(id, placeById.get(id));
  return Array.from(places.values());
};

const matchesRegion = (region, requested) => !requested || region === requested ||
  (region === 'eurazie' && (requested === 'europa' || requested === 'azie'));

function lessonRegion(lesson, region) {
  if (!region) return true;
  if (eventsByLesson.get(lesson.id)?.some(event => matchesRegion(event.region, region))) return true;
  return relatedPlaces(lesson).some(place => {
    const area = words(place.continent || place.region);
    const re = {
      afrika: /afrika|egypte|tanzania|ethiopie|mali|tunisi|marokko|soedan|senegal|nigeria|zimbabwe/u,
      amerika: /amerika|mexico|peru|bolivia|brazilie|argentinie|canada|chili/u,
      azie: /azie|turkije|syrie|iran|irak|india|china|japan|cambodja|israel|jordanie|indonesie|bosporus|jeruzalem/u,
      europa: /europa|frankrijk|spanje|italie|griekenland|belgie|vlaanderen|engeland|portugal|duitsland|hongarije|oostenrijk|tsjechie|bosporus|nederland/u,
      oceanie: /oceanie|australie|zeeland|samoa|pacific/u,
    };
    return re[region]?.test(area);
  });
}

function eventMatches(event, scope, options, interval) {
  if (scope !== 'alles' && !event.tracks.includes(scope)) return false;
  if (!matchesRegion(event.region,options.region) || (options.theme && !event.topics.includes(options.theme))) return false;
  if (interval) return !interval.error && dated(event,interval);
  const terms = words(options.query).split(/\s+/u).filter(Boolean);
  const text = words([event.title,event.location,event.text,event.search,event.date,
    ...event.topics.map(id => STUDY_THEMES.find(entry => entry.id === id)?.name)].join(' '));
  return terms.every(term => text.includes(term));
}

function pickRows(lessons, scope, options, period) {
  const interval = parseChronologyDate(options.query);
  const allLessons = lessons.filter(lesson => historyInScope(lesson, scope) && Number.isInteger(chronologyYear(lesson)) && chronologyYear(lesson) !== 0);
  const candidates = allLessons.filter(lesson => (!options.core || (lesson.structure && !lesson.extension)) &&
    (!period || inEra(lesson,period)) && lessonRegion(lesson, options.region));
  const theme = STUDY_THEMES.find(item => item.id === options.theme);
  const events = CHRONOLOGY_EVENTS.filter(event => (!period || dated(event, period)) && eventMatches(event,scope,options,interval));
  const eventLessonIds = new Set(events.flatMap(event => event.lessons));
  const terms = words(options.query).trim().split(/\s+/u).filter(Boolean);
  const eraMatches = era => !interval && terms.length > 0 && terms.every(term => words(era.date+' '+era.name+' '+era.text).includes(term));
  const byText = options.query && !interval ? new Set(searchLessons(candidates,options.query).results.map(result => result.lesson.id)) : null;
  const located = candidates.filter(lesson => {
    if (theme && !hasTheme(lesson,theme) && !eventLessonIds.has(lesson.id)) return false;
    if (interval) return !interval.error && inEra(lesson,interval);
    if (!byText) return true;
    return byText.has(lesson.id) || eventLessonIds.has(lesson.id) || HISTORICAL_ERAS.some(era => inEra(lesson,era) && eraMatches(era));
  }).sort(byDate);
  const groups = (period ? [period] : HISTORICAL_ERAS).map(era => ({
    era, lessons: located.filter(lesson => inEra(lesson,era)),
    // A date range may cross periods. In the main list the event is shown once, where the
    // portion relevant to the current search begins. A period detail also shows overlaps.
    events: events.filter(event => period ? dated(event,era) : inBounds(Math.max(event.from,interval?.from ?? -Infinity),era)),
  })).filter(group => group.lessons.length || group.events.length || (
    !options.region && !options.theme && ((interval && !interval.error && dated(interval,group.era)) || eraMatches(group.era))));
  return { allLessons, groups, interval, events, located };
}
const inBounds = (year, era) => year >= era.from && year <= era.to;

function compactLesson(lesson, era, scope, studied, read) {
  const state = stateOf(lesson,studied,read);
  return `<li><a class="chrono-lesson" href="#${esc(explorationLessonHref(lesson.id,'chronologie',scope,era.id))}">
    <span><strong>${esc(lesson.title)}</strong><small>${esc(lesson.period)}</small></span>
    ${state ? `<span class="chrono-state">${esc(state)}</span>` : ''}</a></li>`;
}

function reference([author,label,url]) {
  return `<li><span>${esc(author)}. </span><a class="text-link" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)}</a></li>`;
}

function eventRow(event, byId, scope) {
  const label = event.precision === 'circa' ? 'Benaderende datering' : event.precision === 'period' ? 'Periode' : 'Gedateerde gebeurtenis';
  const locations = event.places.map(id => placeById.get(id)).filter(Boolean);
  const links = event.lessons.map(id => byId.get(id)).filter(Boolean);
  const figure = byId.get(event.imageLesson)?.primary?.image;
  return `<details class="chrono-event">
    <summary><span class="chrono-event-date">${esc(event.date)}</span><strong>${esc(event.title)}</strong></summary>
    <div class="chrono-event-body"><p class="chrono-attribution">${esc(event.location)} · ${label}</p>
      <p>${esc(event.text)}</p>
      ${figure && /^[\w-]+\.jpg$/u.test(figure.file) ? `<figure><img loading="lazy" alt="${esc(figure.alt)}" src="./assets/sources/${esc(figure.file)}"><figcaption>${esc(figure.credit)}</figcaption></figure>` : ''}
      ${links.length ? `<div><h4>Bijbehorende lessen</h4><ul>${links.map(lesson => {
        const era = HISTORICAL_ERAS.find(entry => inEra(lesson,entry));
        const destination = era ? explorationLessonHref(lesson.id,'chronologie',historyInScope(lesson,scope) ? scope : 'alles',era.id) : 'les/'+encodeURIComponent(lesson.id);
        return `<li><a class="text-link" href="#${esc(destination)}">${esc(lesson.title)}</a></li>`; }).join('')}</ul></div>` : ''}
      ${locations.length ? `<div class="row" aria-label="Plaatsen in de atlas">${locations.map(place => atlasLink(place)).join('')}</div>` : ''}
      <div><h4>Bron en datering</h4><ul class="chrono-references">${[event.source,event.study].filter(Boolean).map(reference).join('')}</ul></div>
    </div></details>`;
}

const atlasLink = place => `<a class="chip outline" href="#${esc(explorerHref('atlas','alles',place.id))}">${icon('globe')} ${esc(place.name)}</a>`;

function controls(scope, period, options) {
  const resetOptions = { query:'',theme:'',region:'',zoom:'overzicht',core:false };
  const optionsList = (values, current, first) => `<option value="">${first}</option>` +
    values.map(([id,name]) => `<option value="${esc(id)}"${id === current ? ' selected' : ''}>${esc(name)}</option>`).join('');
  return `<form class="panel chrono-controls" id="chronology-form" data-scope="${esc(scope)}" data-era="${period?.id || ''}" data-query="${esc(options.query)}">
    <div class="field chrono-search"><label for="chronology-query">Zoek een jaar, periode of gebeurtenis</label><div class="chrono-search-row">
      <input type="search" id="chronology-query" name="q" value="${esc(options.query)}" placeholder="44 v.Chr., 500–400 v.Chr. of Middeleeuws Gent">
      <button type="submit" class="button primary">Zoeken</button></div></div>
    <div class="chrono-filter-grid">
      <label class="field">Gebied<select name="regio">${optionsList(Object.entries(REGIONS),options.region,'Alle gebieden')}</select></label>
      <label class="field">Thema<select name="thema">${optionsList(STUDY_THEMES.map(t => [t.id,t.name]),options.theme,'Alle thema’s')}</select></label>
      <label class="field">Leerstof<select name="inhoud"><option value="alle">Alle lessen</option><option value="kern" ${options.core ? 'selected' : ''}>Kernlessen</option></select></label>
      <label class="field">Zoomniveau<select name="zoom"><option value="overzicht">Tijdvakken</option><option value="detail" ${options.zoom === 'detail' ? 'selected' : ''}>Gebeurtenissen en lessen</option></select></label>
    </div>${options.query || options.theme || options.region || options.core || options.zoom === 'detail' ? `<a class="text-link" href="#${esc(newUrl(scope,period,resetOptions))}">Wis zoekopdracht en filters</a>` : ''}
    </form>`;
}

function renderGroup(group, settings) {
  const { era, lessons, events } = group;
  const { scope, period, options, filtered, byId, studied, read } = settings;
  const expanded = Boolean(period) || filtered || options.zoom === 'detail';
  const complete = lessons.filter(lesson => stateOf(lesson,studied,read)).length;
  const themes = (period || options.zoom === 'detail') ? STUDY_THEMES.filter(theme => lessons.some(lesson => hasTheme(lesson,theme))) : [];
  const detailURL = newUrl(scope,era,{...options,query:'',zoom:'overzicht'});
  const epochs = era.from < -31 ? 'ancient' : era.from < 750 ? 'classical' : era.from < 1492 ? 'medieval' : era.from < 1789 ? 'earlymodern' : 'modern';
  return `<li class="chrono-era" data-epoch="${epochs}" id="chrono-${era.id}" tabindex="-1">
    <section class="panel chrono-era-card"><header><span class="chrono-date">${esc(era.date)}</span>
      <h2>${period ? esc(era.name) : `<a href="#${esc(detailURL)}">${esc(era.name)}</a>`}</h2>
      <p class="muted">${esc(era.text)}</p>
      <div class="chrono-counts">${eventCount(events.length)} · ${lessonCount(lessons.length)}${complete ? ` · <span>${complete} gelezen of geoefend</span>` : ''}</div></header>
      ${expanded && events.length ? `<div class="chrono-events"><h3>Gebeurtenissen en bronnen</h3>${events.map(event => eventRow(event,byId,scope)).join('')}</div>` : ''}
      ${expanded && lessons.length ? `<details class="chrono-lessons" ${period || filtered ? 'open' : ''}><summary><strong>${settings.interval ? 'Lessen met een ijkpunt in deze datering' : 'Lessen en oefeningen'}</strong> · ${lessons.length}</summary>
        <ol>${lessons.map(lesson => compactLesson(lesson,era,scope,studied,read)).join('')}</ol></details>` : ''}
      ${themes.length ? `<details class="chrono-themes"><summary>Thema’s binnen dit tijdvak</summary><div class="row">${themes.map(theme => `<a class="chip outline" href="#${esc(explorerHref('leerplan',scope,theme.id+'~'+era.id))}">${esc(theme.name)}</a>`).join('')}</div></details>` : ''}
      ${!period ? `<a class="text-link chrono-open" href="#${esc(detailURL)}">Open tijdvak</a>` : ''}
    </section></li>`;
}

export function chronologyPage(lessons, studied, read, scope = 'alles', mode = 'alle', key = '', trailing = '') {
  const period = mode === 'tijdvak' ? erasById.get(key) : undefined;
  const options = optionsFor(mode, mode === 'tijdvak' ? trailing : key);
  const { groups, allLessons, located, events, interval } = pickRows(lessons,scope,options,period);
  const filtered = Boolean(options.query || options.region || options.theme);
  const byId = new Map(lessons.map(lesson => [lesson.id, lesson]));
  const complete = located.filter(lesson => stateOf(lesson,studied,read)).length;
  const next = located.find(lesson => !stateOf(lesson,studied,read));
  const first = next || located[0];
  const nextEra = first && HISTORICAL_ERAS.find(era => inEra(first,era));
  const resultInfo = filtered ? `${eventCount(events.length)} · ${lessonCount(located.length)}` : '';
  const settings = { scope, period, options, filtered, byId, studied, read, interval };
  const stretches = [
    [-Infinity,-3501,'Vroegste sporen'],[-3500,-32,'Oudheid'],[-31,749,'Rome en late oudheid'],[750,1491,'Middeleeuwen'],
    [1492,1788,'Vroegmodern'],[1789,Infinity,'Modern en hedendaags'],
  ];
  const jump = !period && !filtered && groups.length > 2 ? `<nav class="row chrono-jumps" aria-label="Spring in de tijd">${stretches.map(([from,to,name]) => {
    const target = groups.find(({era}) => era.from >= from && era.from <= to);
    return target ? `<button class="chip outline" type="button" data-action="scroll-to" data-value="chrono-${target.era.id}">${name}</button>` : '';
  }).join('')}</nav>` : '';
  return `<p class="back-link"><a class="text-link" href="#paideia">Paideia</a>${period ? ` · <a class="text-link" href="#${esc(newUrl(scope,undefined,options))}">Alle tijdvakken</a>` : ''}</p>` +
    heading('Chronologia','Volg gebeurtenissen, bronnen en lessen van de vroegste sporen tot vandaag.','Tijdlijn en tijdvakken','la') +
    historyExplorerNav(scope,'chronologie') +
    `<nav class="row explorer-scopes" aria-label="Geschiedenissegment kiezen">${['alles',...HISTORICAL_TRACKS].map(track =>
      `<a class="chip outline" href="#${esc(newUrl(track,period,options))}" ${track === scope ? 'aria-current="page"' : ''}>${esc(TRACKS[track]?.name ?? 'Alle segmenten')}</a>`).join('')}</nav>` +
    controls(scope,period,options) +
    (interval?.error ? '<p class="notice" role="status">Gebruik een historisch jaar of een bereik, bijvoorbeeld 1 v.Chr.–1 n.Chr. De traditionele jaartelling heeft geen jaar nul.</p>' :
      `<div class="chrono-results">${filtered ? `<p role="status"><strong>${resultInfo}</strong>${options.query ? ' voor ‘'+esc(options.query)+'’' : ''}.</p>` : ''}
      ${interval && !events.length ? '<p class="muted">Voor deze datering en filters bevat de tijdlijn geen afzonderlijk gedateerde gebeurtenis. Een tijdvak hieronder geeft de ruimere context.</p>' : ''}
      ${located.length ? `<div class="chrono-resume"><div><span>${complete} van ${located.length} lessen gelezen of geoefend</span>${studyMeter('Lessen gelezen of geoefend',complete,located.length)}</div>
      ${nextEra ? `<a class="button quiet" href="#${esc(explorationLessonHref(first.id,'chronologie',scope,nextEra.id))}">${!next ? 'Herneem de lessen' : complete ? 'Verder leren' : 'Open eerste les'}</a>` : ''}</div>` : ''}
      ${jump}
      ${groups.length ? `<ol class="chrono-rail">${groups.map(group => renderGroup(group,settings)).join('')}</ol>` :
        `<p class="empty">${allLessons.length ? 'Geen passende resultaten. Probeer een andere zoekterm of verruim het gebied of onderwerp.' : 'In dit segment is nog geen gedateerde les beschikbaar.'}</p>`}
      ${groups.length ? '<p class="small-text muted">Een les staat bij haar start- of ijkpunt. Zoek een afzonderlijke gebeurtenis om de bron en de precisie van haar datering te bekijken.</p>' : ''}
      </div>`);
}

export function eraPage(lessons, scope, key, studied, read) {
  return chronologyPage(lessons,studied,read,scope,key ? 'tijdvak' : 'alle',key);
}

export function mountChronology(main) {
  const form = main.querySelector('#chronology-form');
  if (!form) return;
  const submit = event => {
    event.preventDefault();
    const values = new FormData(form);
    const query = String(values.get('q') || '').trim();
    const era = query === form.dataset.query ? erasById.get(form.dataset.era) : undefined;
    const url = newUrl(form.dataset.scope,era,{ query,region:values.get('regio'),theme:values.get('thema'),
      core:values.get('inhoud') === 'kern',zoom:values.get('zoom') });
    if (location.hash !== '#'+url) location.hash = url;
  };
  form.addEventListener('submit',submit);
  form.addEventListener('change',event => { if (event.target.tagName === 'SELECT') submit(event); });
}

export function lessonExplorerLinks(lesson) {
  if (!lesson || !HISTORICAL_TRACKS.includes(lesson.track)) return '';
  const era = HISTORICAL_ERAS.find(entry => inEra(lesson,entry));
  if (!era) return '';
  const places = relatedPlaces(lesson);
  const themes = STUDY_THEMES.filter(theme => hasTheme(lesson,theme));
  return `<section class="panel block stack chrono-connections"><h2>Historische context</h2>
    <a class="text-link" href="#${esc(explorerHref('chronologie','alles',era.id))}">${esc(era.date)} · ${esc(era.name)}</a>
    ${places.length ? `<div><h3>In de atlas</h3><div class="row">${places.map(atlasLink).join('')}</div></div>` : ''}
    ${themes.length ? `<div><h3>Thema’s in dit tijdvak</h3><div class="row">${themes.map(theme => `<a class="chip outline" href="#${esc(explorerHref('leerplan','alles',theme.id+'~'+era.id))}">${esc(theme.name)}</a>`).join('')}</div></div>` : ''}
    </section>`;
}
