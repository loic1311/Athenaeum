import { ATLAS_PLACES, EXPLORER_PAGES, HISTORICAL_ERAS, STUDY_THEMES, explorerHref, explorationLessonHref,
  explorationLessons, historyInScope, inEra } from './history-explorer.js?v=13r9';
import { HISTORICAL_TRACKS, timelineHref } from './history-chronology.js?v=13r9';
import { TRACKS } from './learning.js?v=13r8';
import { esc, heading, historyExplorerNav, icon, sourceView } from './views.js?v=13r9';
import { curricula, reading } from './history-reading.js?v=13r9';

const count = number => number + (number === 1 ? ' les' : ' lessen');

function explorerHeader(page, scope, key, description = '') {
  return `<p class="back-link"><a class="text-link" href="#paideia">Paideia</a></p>
    ${heading(EXPLORER_PAGES[page], description)}
    ${historyExplorerNav(scope, page)}
    <nav class="row explorer-scopes" aria-label="Geschiedenissegment kiezen">${['alles', ...HISTORICAL_TRACKS].map(track => {
      return `<a class="chip outline" href="#${explorerHref(page, track, key)}" ${scope === track ? 'aria-current="page"' : ''}>${TRACKS[track]?.name ?? 'Alle segmenten'}</a>`;
    }).join('')}</nav>`;
}

function routeUnit(lesson, page, scope, key, studied, read) {
  const label = studied.has(lesson.id) ? 'Geoefend' : read.has(lesson.id) ? 'Gelezen' :
    lesson.primary ? 'Bronanalyse' : lesson.extension ? 'Verdieping' : lesson.structure ? 'Kernles' : 'Casus';
  return `<li><a class="unit explorer-unit" href="#${explorationLessonHref(lesson.id, page, scope, key)}">
    <span class="track-icon ${lesson.track}">${icon(TRACKS[lesson.track].icon)}</span>
    <div><h3>${esc(lesson.title)}</h3><small>${esc(lesson.period)}</small></div>
    <span class="unit-trailing">${label}</span>
  </a></li>`;
}

function learningPath(title, description, list, page, scope, key, studied, read, backLabel) {
  const next = list.find(lesson => !read.has(lesson.id) && !studied.has(lesson.id)) ?? list[0];
  const complete = list.filter(lesson => read.has(lesson.id) || studied.has(lesson.id)).length;
  return `<section class="panel stack explorer-path" aria-labelledby="explorer-path-title">
    <div><h2 id="explorer-path-title">${esc(title)}</h2><p class="muted">${esc(description)}</p></div>
    <div class="row">${next ? `<a class="button primary" href="#${explorationLessonHref(next.id, page, scope, key)}">${complete && complete < list.length ? 'Leer verder' : 'Start het leerpad'}</a>
      <span class="muted small-text">${complete} van ${list.length} gelezen of geoefend</span>` : ''}
      ${backLabel ? `<a class="text-link" href="#${explorerHref(page, scope)}">${backLabel}</a>` : ''}
    </div>
    ${next ? `<ol class="unit-list explorer-list">${list.map(lesson => routeUnit(lesson, page, scope, key, studied, read)).join('')}</ol>`
      : '<p class="empty">Dit leerpad heeft binnen dit segment nog geen lessen. Kies bovenaan Alle segmenten.</p>'}
  </section>`;
}

export function atlasPage(lessons, scope, key, studied, read) {
  const entries = ATLAS_PLACES.map(place => ({ place, count: explorationLessons(lessons, 'atlas', scope, place.id).length }));
  const chosen = entries.find(entry => entry.place.id === key)?.place;
  const available = entries.filter(entry => entry.count);
  const prompt = 'Draai de wereldbol, zoom in en tik op een plaats. Je kunt ook zoeken in de lijst.';
  const path = chosen && explorationLessons(lessons, 'atlas', scope, chosen.id);
  const first = path?.find(lesson => !read.has(lesson.id) && !studied.has(lesson.id)) ?? path?.[0];
  return explorerHeader('atlas', scope, chosen?.id, prompt) + (first ? `
    <p class="atlas-current"><a class="button primary" href="#${explorationLessonHref(first.id, 'atlas', scope, chosen.id)}">Open leerpad ${esc(chosen.name)}</a></p>` : '') + `
    <div class="atlas-layout">
      <section id="atlas-globe" class="panel atlas-frame stack" aria-label="Interactieve historische wereldbol">
        <p class="atlas-loading" role="status">Wereldbol laden…</p>
        <canvas role="region" tabindex="0" aria-label="Wereldbol. Gebruik de pijltjestoetsen om te draaien en plus of min om te zoomen. Plaatsen zijn ook in de lijst bereikbaar.">
          Kies een plaats in de lijst.
        </canvas>
        <div class="atlas-controls" role="group" aria-label="Wereldbol bedienen">
          <button class="button icon-only" type="button" data-map-control="1.45" aria-label="Inzoomen">+</button>
          <button class="button icon-only" type="button" data-map-control=".69" aria-label="Uitzoomen">−</button>
          <button class="button small" type="button" data-map-control="reset">Wereldbeeld</button>
        </div>
        <p class="atlas-error notice" hidden>De wereldbol kon niet laden. Kies een plaats in de lijst.</p>
        <p class="small-text"><a class="text-link" href="https://www.naturalearthdata.com/downloads/110m-physical-vectors/" target="_blank" rel="noopener noreferrer">Kustlijnen · Natural Earth</a></p>
      </section>
      <section class="panel stack atlas-places" aria-label="Plaatsen met een leerpad">
        <div class="field"><label for="atlas-search">Zoek een plaats of regio</label>
          <input type="search" id="atlas-search" placeholder="Bijvoorbeeld Zuid-Frankrijk"></div>
        <p id="atlas-empty" class="empty" hidden>Geen plaats in deze selectie. Zoek op een andere naam of kies Alle segmenten.</p>
        ${available.length ? `<ul class="unit-list explorer-list">${available.map(({ place, count: total }) => `
          <li data-place-name="${esc(place.name + ' ' + place.region)}"><a class="atlas-place" ${place === chosen ? 'aria-current="page"' : ''}
            href="#${explorerHref('atlas',scope,place.id)}"><span><strong>${esc(place.name)}</strong>
            <span class="small-text muted">${esc(place.region)}</span></span><span class="small-text">${count(total)}</span></a></li>`).join('')}</ul>` :
          '<p class="empty">Voor dit segment zijn nog geen plaatsen beschikbaar.</p>'}
      </section>
    </div>
    ${chosen ? learningPath(chosen.name, chosen.text, explorationLessons(lessons, 'atlas', scope, chosen.id),
      'atlas',scope,chosen.id,studied,read,'Alle plaatsen') : ''}`;
}

const jumpEras = [
  ['sporen','Oudste sporen'], ['eerste-steden','Oudheid'], ['vroeg-middeleeuws','Middeleeuwen'],
  ['reformaties','Vroegmodern'], ['revolutionair','Modern'], ['recente-geschiedenis','Hedendaags'],
];

export function eraPage(lessons, scope, key, studied, read) {
  const all = lessons.filter(lesson => historyInScope(lesson, scope));
  const eras = HISTORICAL_ERAS.map(era => ({...era, count: all.filter(lesson => inEra(lesson, era)).length}));
  const selected = eras.find(era => era.id === key);
  const range = eras.filter(era => era.count);
  return explorerHeader('tijdvakken', scope, selected?.id,
    'Scroll van de oudste sporen tot de recente geschiedenis. Open een tijdvak om de lessen, casussen en bronnen ervan te volgen.') + `
    <div class="row era-shortcuts">
      ${!selected ? jumpEras.filter(([id]) => range.some(era => era.id === id)).map(([id,title]) =>
        `<button type="button" class="chip outline" data-action="era-jump" data-value="${id}">${title}</button>`).join('') : ''}
      <a class="text-link" href="#${timelineHref(scope)}">Kernlessen op volgorde</a>
    </div>
    ${selected ? learningPath(selected.name, selected.date + ' · ' + selected.text,
      explorationLessons(lessons,'tijdvakken',scope,selected.id), 'tijdvakken',scope,selected.id,studied,read,'Alle tijdvakken')
      : `<ol class="era-rail">${range.map(era => `<li id="era-${era.id}" tabindex="-1">
        <a class="panel era-card" href="#${explorerHref('tijdvakken',scope,era.id)}">
          <span class="era-date">${esc(era.date)}</span>
          <div><h2>${esc(era.name)}</h2><p class="muted">${esc(era.text)}</p></div>
          <span class="small-text">${count(era.count)} <span aria-hidden="true">→</span></span>
        </a></li>`).join('')}</ol>
        <p class="small-text muted">Lessen staan bij hun start- of ijkpunt. Sommige ontwikkelingen lopen door in een volgend tijdvak.</p>`}
  `;
}

export function primaryPage(lessons, scope, _key, studied, read) {
  const sources = explorationLessons(lessons,'bronnen',scope);
  return explorerHeader('bronnen',scope,'',
    'Lees een origineel fragment met Engelse vertaling en context. Oefen wat de bron expliciet zegt, welke gevolgtrekking je kunt maken en waar aanvullend bewijs nodig is.') +
    (sources.length ? `<ol class="unit-list explorer-list source-catalogue">${sources.map(lesson =>
      routeUnit(lesson,'bronnen',scope,'',studied,read)).join('')}</ol>`
      : '<p class="empty">Voor dit segment staan nog geen bronlessen klaar.</p>');
}

export function academicPlanPage(lessons, scope, key, studied, read) {
  const chosen = STUDY_THEMES.find(theme => theme.id === key);
  const themes = STUDY_THEMES.map(theme => ({ ...theme, count: explorationLessons(lessons,'leerplan',scope,theme.id).length }));
  return explorerHeader('leerplan',scope,chosen?.id,
    'Volg een thema door de tijd. Begin met overzichtslessen en kies daarna casussen, bronanalyses en verdere lectuur.') +
    (chosen ? learningPath(chosen.name,chosen.text,explorationLessons(lessons,'leerplan',scope,chosen.id),
      'leerplan',scope,chosen.id,studied,read,'Alle thema’s') : `
    <div class="columns three explorer-themes">${themes.filter(theme => theme.count).map(theme => `
      <a class="panel track-card" href="#${explorerHref('leerplan',scope,theme.id)}">
        <h2>${esc(theme.name)}</h2><p class="muted">${esc(theme.text)}</p><span class="caption">${count(theme.count)}</span>
      </a>`).join('')}</div>`) +
    `<section class="block stack"><h2>Verder lezen</h2><div class="columns">${reading.map(book => `<article class="panel stack">
      <h3>${esc(book.title)}</h3><p>${esc(book.description)}</p><div class="stack">${sourceView(book.reference)}${sourceView(book.more)}</div>
    </article>`).join('')}</div></section>
    <section class="block stack"><h2>Opleidingen achter de selectie</h2><div class="columns">${curricula.map(entry => `<article class="panel stack">
      <h3>${esc(entry.name)}</h3><p>${esc(entry.focus)}</p><div class="stack">${entry.references.map(sourceView).join('')}</div>
    </article>`).join('')}</div></section>`;
}
