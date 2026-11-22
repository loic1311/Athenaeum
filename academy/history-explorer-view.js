import { ATLAS_PLACES, ATLAS_VIEWS, HISTORY_SECTIONS, HISTORICAL_ERAS, STUDY_THEMES, explorerHref, explorationLessonHref,
  explorationLessons, historyInScope, inEra } from './history-explorer.js?v=13r10';
import { HISTORICAL_TRACKS, timelineHref } from './history-chronology.js?v=13r9';
import { TRACKS } from './learning.js?v=13r8';
import { esc, heading, historyExplorerNav, icon, sourceView, studyMeter } from './views.js?v=13r10';
import { curricula, reading } from './history-reading.js?v=13r9';

const count = number => number + (number === 1 ? ' les' : ' lessen');

function explorerHeader(page, scope, key, description = '') {
  const [title, subtitle] = HISTORY_SECTIONS[page];
  return `<p class="back-link"><a class="text-link" href="#paideia">Paideia</a></p>
    ${heading(title, description, subtitle, 'la')}
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
  return `<section class="panel stack explorer-path" id="explorer-path" tabindex="-1" aria-labelledby="explorer-path-title">
    <div><h2 id="explorer-path-title">${esc(title)}</h2><p class="muted">${esc(description)}</p></div>
    <div class="row">${next ? `<a class="button primary" href="#${explorationLessonHref(next.id, page, scope, key)}">${complete && complete < list.length ? 'Leer verder' : 'Start het leerpad'}</a>
      <span class="muted small-text">${complete} van ${list.length} gelezen of geoefend</span>` : ''}
      ${backLabel ? `<a class="text-link" href="#${explorerHref(page, scope)}">${backLabel}</a>` : ''}
    </div>
    ${next ? studyMeter('Voortgang van het leerpad', complete, list.length) : ''}
    ${next ? `<ol class="unit-list explorer-list">${list.map(lesson => routeUnit(lesson, page, scope, key, studied, read)).join('')}</ol>`
      : '<p class="empty">Dit leerpad heeft binnen dit segment nog geen lessen. Kies bovenaan Alle segmenten.</p>'}
  </section>`;
}

export function atlasPage(lessons, scope, key, studied, read) {
  const available = ATLAS_PLACES.map(place => ({ place, lessons: explorationLessons(lessons, 'atlas', scope, place.id) }))
    .filter(entry => entry.lessons.length).sort((a, b) => a.place.name.localeCompare(b.place.name, 'nl'));
  const selected = available.find(entry => entry.place.id === key);
  const chosen = selected?.place;
  const path = selected?.lessons ?? [];
  const next = path.find(lesson => !read.has(lesson.id) && !studied.has(lesson.id)) ?? path[0];
  const prompt = 'Draai de wereldbol en kies een stad. Tik op een groep spelden om verder in te zoomen.';
  return explorerHeader('atlas', scope, chosen?.id, prompt) + `
    <div class="atlas-layout">
      <section id="atlas-globe" class="atlas-frame" aria-label="Interactieve historische wereldbol">
        <div class="atlas-map">
          <p class="atlas-loading" role="status">Wereldbol laden…</p>
          <canvas role="region" tabindex="0" aria-label="Wereldbol. Draai met de pijltjestoetsen, zoom met plus en min, of selecteer een plaats in de lijst.">
            Kies een plaats in de lijst.
          </canvas>
          <div class="atlas-map-label"><span aria-hidden="true"></span><span id="atlas-map-status">${chosen ? esc(chosen.name) : 'Wereld'}</span></div>
          ${next ? `<a class="button atlas-map-open" href="#${explorationLessonHref(next.id, 'atlas', scope, chosen.id)}">Leerpad ${esc(chosen.name)}</a>` : ''}
          <div class="atlas-controls" role="group" aria-label="Kaartzoom">
            <button class="button icon-only" type="button" data-map-zoom="1.45" aria-label="Inzoomen">+</button>
            <button class="button icon-only" type="button" data-map-zoom=".69" aria-label="Uitzoomen">−</button>
          </div>
          <p class="atlas-error notice" hidden>De wereldbol kon niet laden. Kies een plaats in de lijst.</p>
        </div>
        <div class="atlas-map-footer">
          <div class="row atlas-presets" aria-label="Ga naar een regio">${Object.entries(ATLAS_VIEWS).map(([id, view]) =>
            `<button type="button" class="chip outline" data-map-view="${id}" aria-pressed="${!chosen && id === 'wereld'}">${view.label}</button>`).join('')}</div>
          <p class="small-text muted">Sleep om te draaien, knijp of dubbelklik om in te zoomen. <a class="text-link" href="https://www.naturalearthdata.com/downloads/110m-physical-vectors/" target="_blank" rel="noopener noreferrer">Kustlijnen van Natural Earth</a></p>
        </div>
      </section>
      <section class="panel stack atlas-places" aria-label="Plaatsen met een leerpad">
        ${chosen ? `<div class="atlas-selection">
          <p class="small-text">${esc(chosen.region)}</p><h2>${esc(chosen.name)}</h2><p>${esc(chosen.text)}</p>
          <div class="row"><a class="button primary" href="#${explorationLessonHref(next.id, 'atlas', scope, chosen.id)}">Open leerpad</a>
          <button class="button quiet" type="button" data-action="scroll-to" data-value="explorer-path">Alle lessen</button></div>
        </div>` : '<h2>Plaatsen</h2>'}
        <div class="field"><label for="atlas-search">Zoek een stad of regio</label>
          <input type="search" id="atlas-search" placeholder="Bijvoorbeeld Parijs, Tolosa of Spanje" aria-controls="atlas-city-list"></div>
        <p id="atlas-results" class="small-text muted" aria-live="polite">${available.length} ${available.length === 1 ? 'plaats' : 'plaatsen'}</p>
        <p id="atlas-empty" class="empty" ${available.length ? 'hidden' : ''}>Geen plaatsen gevonden. Pas je zoekterm of het segment aan.</p>
        <ul class="unit-list explorer-list" id="atlas-city-list">${available.map(({ place, lessons: cityLessons }) => `
          <li data-place-id="${place.id}" data-place-name="${esc([place.name, place.region, place.aliases].filter(Boolean).join(' '))}">
            <a class="atlas-place" ${place === chosen ? 'aria-current="page"' : ''} href="#${explorerHref('atlas', scope, place.id)}">
              <span><strong>${esc(place.name)}</strong><span class="small-text muted">${esc(place.region)}</span></span>
              <span class="small-text">${count(cityLessons.length)}</span></a></li>`).join('')}</ul>
      </section>
    </div>
    ${chosen ? learningPath(chosen.name, chosen.text, path, 'atlas', scope, chosen.id, studied, read, 'Alle plaatsen') : ''}`;
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
        `<button type="button" class="chip outline" data-action="scroll-to" data-value="era-${id}">${title}</button>`).join('') : ''}
      <a class="text-link" href="#${timelineHref(scope)}">Kernlessen op volgorde</a>
    </div>
    ${selected ? learningPath(selected.name, selected.date + ' · ' + selected.text,
      explorationLessons(lessons,'tijdvakken',scope,selected.id), 'tijdvakken',scope,selected.id,studied,read,'Alle tijdvakken')
      : `<ol class="era-rail">${range.map(era => `<li id="era-${era.id}" data-epoch="${era.from < -31 ? 'ancient' : era.from < 750 ? 'classical' : era.from < 1492 ? 'medieval' : era.from < 1789 ? 'earlymodern' : 'modern'}" tabindex="-1">
        <a class="panel era-card" href="#${explorerHref('tijdvakken',scope,era.id)}">
          <span class="era-date">${esc(era.date)}</span>
          <div><h2>${esc(era.name)}</h2><p class="muted">${esc(era.text)}</p></div>
          <span class="small-text">${count(era.count)}</span>
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
