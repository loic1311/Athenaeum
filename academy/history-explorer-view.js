import { HISTORY_SECTIONS, HISTORICAL_ERAS, STUDY_THEMES, explorerHref, explorationLessonHref,
  explorationLessons, historyInScope, inEra, hasTheme, themeSelection } from './history-explorer.js?v=160';
import { HISTORICAL_TRACKS } from './history-chronology.js?v=160';
import { TRACKS } from './learning.js?v=160';
import { esc, heading, historyExplorerNav, icon, sourceView, studyMeter } from './views.js?v=160';
import { curricula, reading } from './history-reading.js?v=13r9';

const count = number => number + (number === 1 ? ' les' : ' lessen');

export function explorerHeader(page, scope, key, description = '') {
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

export function learningPath(title, description, list, page, scope, key, studied, read, backLabel) {
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


export function primaryPage(lessons, scope, _key, studied, read) {
  const sources = explorationLessons(lessons,'bronnen',scope);
  return explorerHeader('bronnen',scope,'',
    'Onderzoek een bronfragment of een gedocumenteerde casus. Oefen welke uitspraak de bron draagt en waarvoor je aanvullend bewijs nodig hebt.') +
    (sources.length ? `<ol class="unit-list explorer-list source-catalogue">${sources.map(lesson =>
      routeUnit(lesson,'bronnen',scope,'',studied,read)).join('')}</ol>`
      : '<p class="empty">Voor dit segment staan nog geen bronlessen klaar.</p>');
}

export function academicPlanPage(lessons, scope, key, studied, read) {
  const { theme, era } = themeSelection(key);
  const scoped = lessons.filter(lesson => historyInScope(lesson, scope));
  const themes = theme ? [theme] : STUDY_THEMES;
  const periods = HISTORICAL_ERAS.map(period => {
    const dated = scoped.filter(lesson => inEra(lesson, period));
    return { period, entries: themes.map(entry => ({ entry, size: dated.filter(lesson => hasTheme(lesson, entry)).length }))
      .filter(item => item.size) };
  }).filter(item => item.entries.length);
  const visible = (theme && era) ? explorationLessons(lessons, 'leerplan', scope, key) : [];
  const plan = theme && era
    ? learningPath(theme.name + ' · ' + era.name, era.date + ' · ' + era.text, visible,
      'leerplan',scope,key,studied,read,'Alle thema’s')
    : `<section class="block stack" aria-label="Thema per tijdvak">
        <div class="topline"><h2>${theme ? esc(theme.name) : 'Kies een tijdvak en een thema'}</h2>
        ${theme ? `<a class="text-link" href="#${explorerHref('leerplan',scope)}">Alle thema’s</a>` : ''}</div>
        ${periods.length ? periods.map(({ period, entries }) => `<details class="panel chronology-theme">
          <summary><strong>${esc(period.name)}</strong><span class="muted small-text">${esc(period.date)}</span></summary>
          <ul>${entries.map(({ entry, size }) => `<li><a class="text-link" href="#${explorerHref('leerplan',scope,entry.id+'~'+period.id)}">${esc(entry.name)}</a> · ${count(size)}</li>`).join('')}</ul>
          <a class="text-link" href="#${explorerHref('chronologie',scope,period.id)}">Tijdvak op de tijdlijn</a></details>`).join('')
          : '<p class="empty">Geen periodegebonden lessen voor dit segment.</p>'}
      </section>`;
  const compare = theme && !era
    ? learningPath('Vergelijkend traject · ' + theme.name,theme.text,explorationLessons(lessons,'leerplan',scope,theme.id),
        'leerplan',scope,theme.id,studied,read,'Alle thema’s')
    : '';
  return explorerHeader('leerplan',scope,key,
    'Onderzoek een thema binnen één tijdvak of vergelijk het door de tijd.') +
    plan + (compare || (!theme ? `<details class="panel block chronology-theme"><summary><strong>Vergelijken door de tijd</strong></summary>
      <ul>${STUDY_THEMES.filter(entry => scoped.some(lesson => hasTheme(lesson,entry))).map(entry => `<li><a class="text-link" href="#${explorerHref('leerplan',scope,entry.id)}">${esc(entry.name)}</a></li>`).join('')}</ul></details>` : '')) +
    `<section class="block stack"><div class="topline"><h2>Verder lezen</h2><a class="button quiet" href="#studiegids">Universitaire studiegids</a></div><div class="columns">${reading.map(book => `<article class="panel stack">
      <h3>${esc(book.title)}</h3><p>${esc(book.description)}</p><div class="stack">${sourceView(book.reference)}${sourceView(book.more)}</div>
    </article>`).join('')}</div></section>
    <section class="block stack"><h2>Opleidingen achter de selectie</h2><div class="columns">${curricula.map(entry => `<article class="panel stack">
      <h3>${esc(entry.name)}</h3><p>${esc(entry.focus)}</p><div class="stack">${entry.references.map(sourceView).join('')}</div>
    </article>`).join('')}</div></section>`;
}
