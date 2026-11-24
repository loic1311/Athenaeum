import { EXAM_GOALS, formatSource, KINDS, LEVELS, ROUTES, TRACKS, tally } from './learning.js?v=150';
import { tipsFor } from './daily.js?v=150';
import { instructionFor, PRACTICE_KINDS, PRACTICE_PHASES, practiceOptions, practicePhase, workedExample } from './practice.js?v=150';
import { LANGUAGE_TOPICS, isLanguageTopic } from './language-topics.js?v=14r3';
import { EXAM_ICE, EXAM_PASS, MAX_ICE, STARTING_ICE } from './streak.js?v=150';
import { studyNotes } from './study-notes.js?v=13r6';
import { LEGACY_TIMES, MAX_REMINDERS, REMINDER_DAYS } from './notifications.js?v=13r6';
import { belongsToHistoryTrack, chronologicalLessons, chronologyGroups, chronologyYear, HISTORICAL_TRACKS, historyLessonHref,
  PAIDEIA_TRACKS, timelineHref } from './history-chronology.js?v=14r3';
import { HISTORY_SECTIONS, explorerHref } from './history-links.js?v=14r4';

import { classicalCourse, classicalLesson, greekKeyboard } from './classical-view.js?v=14r3';
import { evidenceFor, SCORE_VERSION } from './assessment.js?v=150';
import { annotatedTerms, lessonSources, preparationFor, studyConcept, studyLevel, STUDY_LEVELS } from './history-study.js?v=150';

const SECTION_NAMES = {
  leer: ['Studium', 'pen', 'Studeren'],
  traditio: ['Traditio', 'traditio', 'Verhalen en religie'],
  vandaag: ['Hodie', 'home', 'Vandaag'],
  zoeken: ['Quaere', 'search', 'Zoeken'],
  paideia: ['Paideia', 'roman', 'Leren'],
  talen: ['Linguae', 'language', 'Talen'],
  scriptorium: ['Scriptorium', 'scriptorium', 'Onderzoek'],
  toetsen: ['Examina', 'check', 'Toetsen'],
  meer: ['Optiones', 'grid', 'Instellingen'],
  onderzoek: ['Investigatio', 'knowledge', 'Dossiers'],
  voortgang: ['Progressus', 'graph', 'Voortgang'],
  importeren: ['Materia mea', 'import', 'Eigen leerstof'],
  meldingen: ['Nuntii', 'bell', 'Appmeldingen'],
};

const navigation = keys => keys.map(key => [key, ...SECTION_NAMES[key]]);
export const NAV = navigation(['vandaag', 'zoeken', 'paideia', 'talen', 'toetsen', 'meer']);
export const APP_NAV = navigation(['paideia', 'talen', 'scriptorium', 'traditio']);
export const SECONDARY_NAV = navigation(['onderzoek', 'voortgang', 'importeren']);

const TRACK_NAMES = {
  greek: 'Graecia antiqua',
  roman: 'Roma antiqua',
  medieval: 'Medium aevum',
  earlymodern: 'Prima aetas moderna',
  history: 'Historia generalis',
  knowledge: 'Scientia generalis',
  la: 'Lingua Latina', grc: 'Lingua Graeca antiqua', traditio: 'Traditio',
  it: 'Lingua Italiana',
  fr: 'Lingua Francogallica',
};

const SUBJECTS = ['history', ...PAIDEIA_TRACKS.filter(track => track !== 'history')];
const LANGUAGE_SUBJECTS = ['it', 'fr', 'la', 'grc'];

const FRENCH_LEVEL_FOCUS = {
  A1: 'Herken basiswoorden en stel korte vragen.',
  A2: 'Oefen met hoeveelheden, materiaal en alledaagse instructies.',
  B1: 'Leg uit wat er gebeurd is en breng een praktische oplossing onder woorden.',
  B2: 'Lees de voorwaarden, gebruik complexere grammatica en onderbouw je formulering.',
  C1: 'Lees tussen de regels en formuleer precies wat vaststaat, wat onzeker is en welke voorwaarden gelden.',
};

const icons = {
  traditio: '<path d="M4 5c3-1 6 0 8 2 2-2 5-3 8-2v13c-3-1-6 0-8 2-2-2-5-3-8-2zM12 7v13M6.5 9c1.3 0 2.3.4 3.5 1M15 10c1.2-.6 2.2-.9 3.2-1"/>',
  home: '<path d="M3 11 12 3l9 8v9a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
  greek: '<path d="M3 8l9-5 9 5v2H3zm2 4v6m14-6v6m-9-6v6m4-6v6M3 21h18"/>',
  roman: '<path d="M3 21h18M5 21v-9a7 7 0 0 1 14 0v9M9 21v-8a3 3 0 0 1 6 0v8M3 7h18"/>',
  language: '<path d="M3 4h13v10H9l-4 3v-3H3zm14 4h4v11h-2v2l-3-2h-4v-3"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18m-9-9c5 5 5 13 0 18-5-5-5-13 0-18z"/>',
  castle: '<path d="M3 21V8h4v3h3V5h4v6h3V8h4v13H3Zm7 0v-4a2 2 0 0 1 4 0v4"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m16 8-2 6-6 2 2-6 6-2Z"/>',
  knowledge: '<path d="M4 5c3-1 6 0 8 2 2-2 5-3 8-2v13c-3-1-6 0-8 2-2-2-5-3-8-2zm8 2v13"/>',
  scriptorium: '<path d="M6 3h12v17H6zm3 4h6m-6 4h6m-6 4h4M3 7v14h13"/>',
  italian: '<path d="M4 5h16v14H4zm5 0v14m6-14v14"/>',
  french: '<path d="M4 5h16v14H4zm5 0v14m6-14v14"/>',
  check: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="m8 13 3 3 5-6M9 4V2m6 2V2"/>',
  graph: '<path d="M4 3v17h17M8 16v-3m5 3V8m5 8V5"/>',
  grid: '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/>',
  import: '<path d="M12 16V3m-5 6 5-5 5 5M4 15v5h16v-5"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 4.5 4.5"/>',
  bell: '<path d="M9 19a3 3 0 0 0 6 0m-10-2h14c-2-2-2-4-2-6a5 5 0 1 0-10 0c0 2 0 4-2 6Z"/>',
  volume: '<path d="M3 9h4l5-4v14l-5-4H3zm13-1a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  play: '<path d="M7 4l13 8-13 8z"/>',
  flask: '<path d="M9 3h6m-5 0v7l-5 8a1.5 1.5 0 0 0 1.3 2h11.4a1.5 1.5 0 0 0 1.3-2l-5-8V3M8 14h8"/>',
  cross: '<path d="M10 4h4v6h6v4h-6v6h-4v-6H4v-4h6z"/>',
  bag: '<path d="M5 8h14l1 12H4zM9 9V6a3 3 0 0 1 6 0v3"/>',
  cup: '<path d="M4 8h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM17 9h2a2 2 0 1 1 0 4h-2M3 21h16M8 3v2m4-2v2"/>',
  pen: '<path d="m15 4 5 5-9 9-6 1 1-6zM13 6l5 5M4 22h16"/>',
};

export function icon(name) {
  return `<svg aria-hidden="true" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">${icons[name] || icons.knowledge}</svg>`;
}

export function esc(value) {
  return String(value ?? '').replace(/[&<>"']/gu, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

function linkURL(value) {
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
}

export function sourceView(source) {
  const label = formatSource(source);
  if (!label) return '';
  const url = linkURL(source.url);
  return url ? `<a class="source" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>` :
    `<span class="source">${esc(label)}</span>`;
}

export function heading(title, description = '', kicker = '', language = '') {
  return `<div class="headline">${kicker ? '<p class="eyebrow">' + esc(kicker) + '</p>' : ''}<h1${language ? ' lang="' + esc(language) + '"' : ''}>${esc(title)}</h1>${description ? '<p>' + esc(description) + '</p>' : ''}</div>`;
}

export function sectionLabel(id) {
  const [name, , meaning] = SECTION_NAMES[id] ?? ['Athenaeum'];
  return meaning ? name + ' · ' + meaning : name;
}

export function sectionHeading(id, description) {
  const [name, , meaning] = SECTION_NAMES[id];
  return heading(name, description, meaning, id === 'paideia' ? 'grc-Latn' : 'la');
}

function button(action, label, css = '', value = '') {
  return `<button type="button" class="button ${css}" data-action="${action}" data-value="${esc(value)}">${esc(label)}</button>`;
}

export function nav(link, active, compact = false) {
  const [url, name, symbol, meaning] = link;
  const label = compact && url === 'meer' ? 'Opties' : meaning;
  return `<a href="#${url}" ${active === url ? 'aria-current="page"' : ''}>${icon(symbol)}
    <span class="nav-label"><span lang="${url === 'paideia' ? 'grc-Latn' : 'la'}">${name}</span>
    <span class="nav-meaning">${label}</span></span></a>`;
}

function trackIcon(track) {
  return `<span class="track-icon ${esc(track)}">${icon(TRACKS[track]?.icon)}</span>`;
}

function subjectList(tracks, lessons, prefs = {}) {
  const totals = Object.fromEntries(tracks.map(track => [track,
    lessons.filter(lesson => !lesson.extension && belongsToHistoryTrack(lesson, track)).length]));
  return `<ul class="subject-list">${tracks.map(track => {
    const { name, section } = TRACKS[track];
    const language = section === 'language';
    return `<li><a class="subject-link" href="#${language ? 'talen' : 'paideia'}/${track}">
      ${trackIcon(track)}<span class="subject-name"><strong>${name}</strong><span lang="la">${TRACK_NAMES[track]}</span></span>
      <span class="subject-meta">${['fr','it'].includes(track) ? esc(prefs[track] ?? 'A1') : totals[track] ? totals[track] + (totals[track] === 1 ? ' les' : ' lessen') : ''}</span>
    </a></li>`;
  }).join('')}</ul>`;
}

function metrics(info) {
  return `<div class="metrics">
    ${[['check', info.today, 'Antwoorden vandaag'], ['clock', info.due, 'Leerdoelen klaar voor herhaling'], ['graph', info.goals, 'Unieke leerdoelen geoefend']]
      .map(([symbol, value, label]) => `<div class="metric"><span class="metric-icon">${icon(symbol)}</span>
        <strong>${value}</strong><span>${label}</span></div>`).join('')}
  </div>`;
}

function progressSummary(info, full = false) {
  const percent = info.totalGoals ? info.goals / info.totalGoals * 100 : 0;
  const percentage = percent > 0 && percent < 1 ? '&lt;1%' : percent < 100 && percent > 99 ? '&gt;99%' : Math.round(percent) + '%';
  return `<section class="progress-summary" aria-label="Voortgangsoverzicht">
    <div class="progress-summary-head">
      <div><h2>Leerdoelen geoefend</h2><p>${info.goals} van ${info.totalGoals} in alle leerpaden</p></div>
      <strong>${percentage}</strong>
    </div>
    ${studyMeter('Leerdoelen minstens één keer geoefend', info.goals, info.totalGoals)}
    ${full ? '' : '<a class="button quiet" href="#voortgang">Alle statistieken</a>'}
  </section>`;
}

function activityChart(days) {
  const high = Math.max(1, ...days.map(day => day.count));
  const short = new Intl.DateTimeFormat('nl-BE', { weekday: 'short' });
  const long = new Intl.DateTimeFormat('nl-BE', { weekday: 'long', day: 'numeric', month: 'long' });
  return `<section class="panel stack activity-panel" aria-labelledby="activity-title">
    <div class="topline"><h2 id="activity-title">Oefenactiviteit</h2><p class="muted small-text">Afgelopen 7 dagen</p></div>
    <ul class="activity-chart" aria-label="Aantal beantwoorde oefenvragen per dag">${days.map(({ date, count }, i) => {
      const time = new Date(date + 'T12:00:00');
      return `<li class="${i === days.length - 1 ? 'is-today' : ''}">
        <span class="sr-only">${esc(long.format(time))}, ${count} ${count === 1 ? 'antwoord' : 'antwoorden'}</span>
        <span aria-hidden="true" class="activity-value">${count}</span>
        <span aria-hidden="true" class="activity-track"><span class="activity-fill" style="--activity:${100 * count / high}%"></span></span>
        <span aria-hidden="true" class="activity-day">${esc(short.format(time))}</span>
      </li>`;
    }).join('')}</ul>
    ${high === 1 && days.every(day => !day.count) ? '<p class="muted small-text">Je eerste antwoorden verschijnen hier zodra je oefent.</p>' : ''}
  </section>`;
}

function unit(lesson, studied, { href = 'les/' + encodeURIComponent(lesson.id), read, timeline = false, label } = {}) {
  const info = [lesson.period, lesson.level, ROUTES[lesson.route]].filter(Boolean).join(' · ');
  const search = [lesson.title, lesson.period, lesson.summary, ...(lesson.items ?? []).map(item => item.label)]
    .concat((lesson.structure ?? []).flatMap(block => [block.lead, block.text]))
    .filter(Boolean).join(' ').toLocaleLowerCase('nl').normalize('NFD').replace(/\p{M}/gu,'');
  const details = [info, label].filter(Boolean).join(' · ');
  const progress = studied.has(lesson.id) ? 'Geoefend' : read?.has(lesson.id) ? 'Gelezen' :
    lesson.structure ? 'Kernles' : timeline ? 'Casus' : (lesson.goalCount ?? lesson.items.length) + ' leerdoelen';
  return `<a class="unit"${timeline ? ' data-completed="' + Boolean(read?.has(lesson.id) || studied.has(lesson.id)) + '"' : ' data-unit-search="' + esc(search) + '"'} href="#${esc(href)}">
    ${trackIcon(lesson.track)}<div><h3>${esc(lesson.title)}</h3>${details ? '<small>' + esc(details) + '</small>' : ''}</div>
    <span class="unit-trailing">${progress}</span>
  </a>`;
}

export function lessonSearchPage(query) {
  return sectionHeading('zoeken', 'Vind lessen op titel, onderwerp of woordenschat.') + `
    <div class="lesson-search">
      <form id="lesson-search-form" class="panel lesson-search-form" role="search" aria-label="Lessen zoeken">
        <div class="field">
          <label for="lesson-query">Wat wil je leren?</label>
          <div class="lesson-search-input">
            ${icon('search')}
            <input id="lesson-query" name="query" type="search" value="${esc(query)}" placeholder="Bijv. maatbeker Frans"
              autocomplete="off" spellcheck="false" enterkeyhint="search" maxlength="140">
            <button type="button" class="button icon-only" id="lesson-search-clear" data-action="lesson-search-clear"
              aria-label="Wis zoekterm" hidden>${icon('close')}</button>
          </div>
        </div>
        <button type="submit" class="button primary">Zoeken</button>
      </form>
      <section class="block stack" aria-label="Zoekresultaten">
        <h2 id="lesson-search-status" class="search-status" tabindex="-1" aria-live="polite" aria-atomic="true"></h2>
        <div id="lesson-search-results"></div>
      </section>
    </div>`;
}

export function lessonSearchResults({ hasQuery, results }) {
  if (!hasQuery) {
    return `<div class="stack"><p class="muted">Probeer bijvoorbeeld</p><div class="row">
      ${button('lesson-search-example', 'maatbeker Frans', 'quiet', 'maatbeker Frans')}
      ${button('lesson-search-example', 'economie in de poleis', 'quiet', 'economie in de poleis')}
    </div></div>`;
  }
  if (!results.length) {
    return '<p class="notice">Probeer een kortere zoekterm of zoek op een verwant woord.</p>';
  }
  return '<ul class="unit-list search-results">' + results.map(({ lesson, snippet }) => {
    const details = [TRACKS[lesson.track].name, lesson.level, ROUTES[lesson.route]].filter(Boolean).join(' · ');
    return `<li><a class="unit search-result" href="#les/${esc(encodeURIComponent(lesson.id))}">
      ${trackIcon(lesson.track)}<div><small>${esc(details)}</small><h3>${esc(lesson.title)}</h3>
      ${snippet ? '<p class="search-excerpt">' + esc(snippet) + '</p>' : ''}</div></a></li>`;
  }).join('') + '</ul>';
}

function streakPanel(streak, full = false) {
  if (!streak) return '';
  const { length, ice, studiedToday, days, best } = streak;
  const label = studiedToday ? 'Mooi zo! Vandaag telt mee.' : length ? 'Rond vandaag één oefening, dagles of toets af om je reeks voort te zetten.' :
    'Rond je eerste oefening, dagles of toets af om een reeks te starten.';
  const states = { done: ['✓', 'Gestudeerd'], ice: ['🧊', 'Beschermd'], open: ['·', 'Open'] };
  const shortDay = new Intl.DateTimeFormat('nl-BE', { weekday: 'short' });
  const longDay = new Intl.DateTimeFormat('nl-BE', { weekday: 'long', day: 'numeric', month: 'long' });
  return `<section class="block panel stack streak-panel" aria-labelledby="streak-title">
    <div class="topline"><h2 id="streak-title"><span lang="la">Series</span> · Streak</h2>
      <a class="button quiet small" href="#meer/meldingen">${icon('bell')} Appmeldingen</a></div>
    <div class="streak-stats">
      <div><span aria-hidden="true">🔥</span><strong>${length}</strong> ${length === 1 ? 'dag' : 'dagen'} op rij</div>
      <div><span aria-hidden="true">🧊</span><strong>${ice}</strong> ${ice === 1 ? 'ijsklontje' : 'ijsklontjes'}</div>
    </div>
    <ul class="streak-days" aria-label="Afgelopen zeven dagen">${days.map(({ date, state }) => {
      const time = new Date(date + 'T12:00:00');
      const [symbol, meaning] = states[state];
      return `<li class="streak-day ${state}"><span class="sr-only">${esc(longDay.format(time))} · ${meaning}</span>
        <span aria-hidden="true">${esc(shortDay.format(time))}</span><span aria-hidden="true">${symbol}</span></li>`;
    }).join('')}</ul>
    <p>${label}${days.at(-2)?.state === 'ice' ? ' Een ijsklontje heeft gisteren je reeks beschermd.' : ''}</p>
    ${full ? `<p class="small-text muted">Beste reeks: ${best} ${best === 1 ? 'dag' : 'dagen'}.</p>
      <p class="small-text muted">Je begint met ${STARTING_ICE} ijsklontjes. Op een gemiste dag gebruikt Athenaeum er automatisch één zolang je een reeks hebt. Je verdient er meer via <a class="text-link" href="#toetsen">Examina · Toetsen</a> en bewaart er maximaal ${MAX_ICE}.</p>` :
      '<a class="text-link" href="#voortgang">Hoe werken ijsklontjes?</a>'}
  </section>`;
}

export function home(info) {
  const date = new Date().toLocaleDateString('nl-BE', { weekday: 'long', day: 'numeric', month: 'long' });
  const welcome = info.profile && info.profile.name !== 'Leerling' ? 'Welkom, ' + info.profile.name.split(' ')[0] : '';
  return heading('Hodie', welcome, 'Vandaag · ' + date, 'la') + `
    <section class="hero" aria-labelledby="quick-title">
      <div>
        <h2 id="quick-title">Je les van vandaag</h2>
        <p class="subtitle">${info.daily?.completed ? 'Je dagles is afgerond. Bekijk de behandelde onderwerpen of oefen verder.' : 'Bekijk eerst de uitleg en een voorbeeld. Oefen daarna in korte stappen, met tips en uitwerkingen.'}</p>
        <div class="row">
          <a class="button hero-primary" href="#dagles">${info.daily?.completed ? 'Bekijk je dagles' : info.daily ? 'Hervat je dagles' : 'Open je dagles'}</a>
          ${button(info.resume ? 'resume' : 'quick', info.resume ? 'Oefening hervatten' : 'Sneloefening · 2 min', 'hero-secondary')}
        </div>
      </div>
      <div class="hero-mark" aria-hidden="true"><img src="./assets/logos/athenaeum-inverse.svg?v=14r1" alt="" width="146" height="146"></div>
    </section>
    <div class="block stack home-progress">${progressSummary(info)}${metrics(info)}</div>
    <section class="block stack">
      <div class="topline"><h2>Vakken</h2><a class="text-link" href="#paideia">Paideia</a></div>
      ${subjectList(SUBJECTS, info.lessons)}
      <div class="topline"><h2>Talen</h2><a class="text-link" href="#talen">Linguae</a></div>
      ${subjectList(LANGUAGE_SUBJECTS, info.lessons, info.prefs)}
    </section>
    ${streakPanel(info.streak)}
    ${info.next.length ? '<section class="block"><div class="topline"><h2>Een volgende les</h2></div><div class="unit-list">' +
      info.next.map(lesson => unit(lesson, info.studied)).join('') + '</div></section>' : ''}`;
}

export function studyHub(info) {
  const last = info.lastLesson;
  const actions = [
    ['paideia', 'roman', 'Paideia', 'Geschiedenis en algemene kennis'],
    ['talen', 'language', 'Linguae', 'Moderne en klassieke talen'],
    ['traditio', 'traditio', 'Traditio', 'Mythologie en religieuze overlevering'],
    [timelineHref('alles', 'alle'), 'clock', 'Chronologia', 'Geschiedenis per tijdvak'],
    [explorerHref('atlas'), 'globe', 'Atlas historicus', 'Geschiedenis per stad'],
    [explorerHref('leerplan'), 'compass', 'Curriculum', 'Thema’s binnen een tijdvak'],
    ['toetsen', 'check', 'Examina', 'Oefentoets en persoonlijke examens'],
    ['scriptorium', 'scriptorium', 'Scriptorium', 'Bronnen en onderzoek'],
  ];
  const current = info.resume ? button('resume', 'Oefening hervatten', 'primary') :
    last ? `<a class="button primary" href="#les/${encodeURIComponent(last.id)}">Les hervatten</a>` :
    '<a class="button primary" href="#dagles">Open je dagles</a>';
  return sectionHeading('leer') + `<section class="panel course-start study-hub-resume stack">
    <div><p class="eyebrow">${info.resume || last ? 'Verder studeren' : 'Vandaag'}</p>
      <h2>${esc(info.resumeTitle || last?.title || 'Je dagles')}</h2></div>
    <div class="row">${current}${button('quick','Sneloefening · 2 min','quiet')}</div></section>
    <nav class="study-hub-grid block" aria-label="Kies je leeractiviteit">${actions.map(([url,symbol,title,detail]) =>
      `<a class="panel hub-path" href="#${url}"><span class="track-icon">${icon(symbol)}</span><span><strong lang="la">${title}</strong><small>${detail}</small></span></a>`).join('')}</nav>`;
}

export function catalogue(section, lessons, prefs) {
  if (section === 'talen') return sectionHeading(section, 'Kies een taal. Bij Latijn en Oudgrieks kun je bij de eerste letters en woorden beginnen.') +
    subjectList(LANGUAGE_SUBJECTS, lessons, prefs);
  return heading('Paideia', 'Kies een vak of verken de geschiedenis per plaats, tijdvak of bron.', '', 'grc-Latn') +
    `<section class="stack" aria-labelledby="subjects-heading">
      <h2 id="subjects-heading">Vakken</h2>
      ${subjectList(SUBJECTS, lessons)}
    </section>
    <section class="block stack paideia-explore" aria-labelledby="explore-heading">
      <div class="topline"><h2 id="explore-heading">Verkennen</h2>${button('history-mix', 'Oefen geschiedenis door elkaar', 'small quiet')}</div>
      ${historyExplorerNav('alles', '', true)}
    </section>`;
}

export function course(track, lessons, studied, prefs, route, search = '', topic = '', read = new Set()) {
  if (['la','grc'].includes(track)) return classicalCourse(track, lessons, studied, topic);
  if (HISTORICAL_TRACKS.includes(track)) return historyCoursePage(track, lessons, studied, read, search);
  const model = TRACKS[track];
  const language = model.section === 'language';
  const level = prefs[track] ?? 'A1';
  if (language && isLanguageTopic(track, topic)) return topicPage(track, topic, lessons, studied, level);
  const all = lessons.filter(lesson => lesson.track === track && !lesson.languageTopic);
  const shown = language ? all.filter(lesson => lesson.level === level && (!route || route === lesson.route)) : all;
  const routes = [...new Set(all.filter(lesson => lesson.level === level).map(lesson => lesson.route))].filter(r => ROUTES[r]);
  const next = (!route && lessons.find(lesson => lesson.track === track && lesson.starter && lesson.level === level && !studied.has(lesson.id))) ||
    shown.find(lesson => !studied.has(lesson.id)) || shown[0];
  return `<p class="back-link"><a class="text-link" href="#${language ? 'talen' : 'paideia'}">${language ? 'Linguae' : 'Paideia'}</a></p>` +
    heading(model.name, model.desc, TRACK_NAMES[track]) + (language ? languageLevel(track, level) : '') + `
    <section class="panel stack course-start ${language ? 'block' : ''}">
      <div><h2>${next ? esc(next.title) : 'Aan de slag'}</h2>
        <p class="muted">${next ? 'Lees de uitleg of begin met een gemengde reeks.' :
          'Kies hieronder een ander niveau of een andere leersituatie.'}</p></div>
      <div class="row">
        ${next ? '<a class="button primary" href="#les/' + esc(next.id) + '">Open les</a>' +
          button('drill', 'Oefen 5 gemengde vragen', '', track + '/5') : ''}
        ${language ? button('placement', 'Bepaal je niveau', 'quiet', track) : ''}
      </div>
      <details><summary>Meer oefenopties</summary><div class="row">
        ${next ? button('quick-track', 'Sneloefening · 2 min', 'quiet', track) +
          button('drill', 'Oefen 15 gemengde vragen', 'quiet', track + '/15') +
          button('drill', 'Oefen 30 gemengde vragen', 'quiet', track + '/30') : ''}
        <a class="button quiet" href="#importeren/${track}">Eigen leerstof toevoegen</a>
      </div></details>
    </section>
    ${language ? `<section class="block stack"><h2>Thema’s</h2>${topicCards(track, lessons)}</section>` : ''}
    <section class="block">
      <div class="topline"><h2>${language ? 'Lessen op ' + level : 'Lessen'}</h2><p class="muted small-text" id="lesson-count" aria-live="polite">${shown.length} lessen</p></div>
      ${language ? `<div class="row" role="group" aria-label="Leersituatie">${['', ...routes].map(r => `<button type="button" class="chip outline" data-action="route-filter" data-value="${r}" aria-pressed="${route === r}">${r ? ROUTES[r] : 'Alle situaties'}</button>`).join('')}</div>` : ''}
      <div class="field course-search"><label for="course-search">Zoek in dit leerpad</label>
        <input type="search" id="course-search" value="${esc(search)}" placeholder="Titel, datering of begrip"></div>
      <p class="empty" id="lesson-no-match" ${shown.length ? 'hidden' : ''}>Geen lessen met deze keuze. Pas je zoekterm of filter aan.</p>
      <div class="unit-list">${shown.map(lesson => unit(lesson, studied)).join('')}</div>
    </section>`;
}

const historyScopeName = scope => TRACKS[scope]?.name ?? 'Alle segmenten';

export function historyExplorerNav(scope, active, cards = false) {
  return `<nav class="explorer-nav ${cards ? 'explorer-destinations' : 'explorer-tabs'}" aria-label="Geschiedenis verkennen">
    ${Object.entries(HISTORY_SECTIONS).map(([page, [title, subtitle, symbol]]) => {
      const href = page === 'chronologie' ? timelineHref(scope) : explorerHref(page, scope);
      return `<a class="explorer-link" data-explorer="${page}" href="#${href}" ${active === page ? 'aria-current="page"' : ''}>
        <span class="explorer-icon">${icon(symbol)}</span><span class="explorer-label">
          <strong lang="la">${title}</strong><span>${subtitle}</span></span></a>`;
    }).join('')}
  </nav>`;
}

function historyCoursePage(track, lessons, studied, read, search) {
  const model = TRACKS[track];
  const core = chronologicalLessons(lessons, track);
  const cases = lessons.filter(lesson => belongsToHistoryTrack(lesson, track) && !lesson.extension && !lesson.structure);
  const next = core.find(lesson => !read.has(lesson.id) && !studied.has(lesson.id));
  return '<p class="back-link"><a class="text-link" href="#paideia">Paideia · Vakken</a></p>' +
    heading(model.name, model.desc, TRACK_NAMES[track]) + `
    ${next ? `<section class="panel study-resume" aria-label="Volgende kernles">
      <div><p class="small-text muted">Volgende kernles</p><h2>${esc(next.title)}</h2></div>
      <a class="button primary" href="#${historyLessonHref(next.id, track, 'kern')}">Open les</a>
    </section>` : ''}
    ${historyExplorerNav(track)}
    <section class="block stack">
      <div class="topline"><h2>Lessen</h2><p class="muted small-text" id="lesson-count" aria-live="polite">${core.length + cases.length} lessen</p></div>
      <div class="field course-search"><label for="course-search">Zoek in dit vak</label>
        <input type="search" id="course-search" value="${esc(search)}" placeholder="Titel, datering of begrip"></div>
      <details><summary>Oefenen en eigen leerstof</summary><div class="row">
        ${[5, 15, 30].map(length => button('drill', 'Oefen ' + length + ' gemengde vragen', 'quiet', track + '/' + length)).join('')}
        <a class="button quiet" href="#importeren/${track}">Eigen leerstof toevoegen</a>
      </div></details>
      <p class="empty" id="lesson-no-match" hidden>Geen lessen met deze zoekterm.</p>
      ${core.length ? `<section class="stack" data-lesson-group><h3>Kernlessen</h3><div class="unit-list">${core.map(lesson =>
        unit(lesson, studied, { href: historyLessonHref(lesson.id, track, 'kern'), read })).join('')}</div></section>` : ''}
      ${cases.length ? `<section class="stack" data-lesson-group><h3>Casussen en bronnen</h3><div class="unit-list">${cases.map(lesson =>
        unit(lesson, studied, { read, href: 'les/' + encodeURIComponent(lesson.id) + '/vak/' + track })).join('')}</div></section>` : ''}
    </section>`;
}

export function studyMeter(label, value, total) {
  return `<progress class="study-meter" aria-label="${esc(label)}" value="${value}" max="${Math.max(1, total)}"></progress>`;
}

export function timelinePage(lessons, studied, read, scope, mode) {
  const sequence = chronologicalLessons(lessons, scope, mode);
  const groups = chronologyGroups(sequence);
  const finished = lesson => read.has(lesson.id) || studied.has(lesson.id);
  const completed = sequence.filter(finished).length;
  const next = sequence.find(lesson => !finished(lesson));
  const [title, subtitle] = HISTORY_SECTIONS.chronologie;
  return `<p class="back-link"><a class="text-link" href="#paideia">Paideia</a></p>` +
    heading(title, 'Volg de lessen van vroeg naar laat. Dateringen geven het start- of ijkpunt aan. Ontwikkelingen kunnen overlappen.', subtitle, 'la') +
    historyExplorerNav(scope, 'chronologie') + `
    <section class="panel stack timeline-filters" aria-label="Tijdlijn instellen">
      <div class="timeline-tools">
        <nav class="row timeline-options" aria-label="Kies een segment">${['alles', ...HISTORICAL_TRACKS].map(track =>
          `<a class="chip outline" href="#${timelineHref(track, mode)}" ${scope === track ? 'aria-current="page"' : ''}>${historyScopeName(track)}</a>`).join('')}</nav>
        <nav class="row timeline-options" aria-label="Kies welke lessen je ziet">
          <a class="chip outline" href="#${timelineHref(scope, 'kern')}" ${mode === 'kern' ? 'aria-current="page"' : ''}>Kernlessen</a>
          <a class="chip outline" href="#${timelineHref(scope, 'alle')}" ${mode === 'alle' ? 'aria-current="page"' : ''}>Volledige tijdlijn</a>
        </nav>
      </div>
      ${sequence.length ? `<div class="timeline-resume">
        <div><div class="progress-caption"><strong>Voortgang op de tijdlijn</strong><span>${completed} van ${sequence.length} gelezen of geoefend</span></div>
          ${studyMeter('Lessen gelezen of geoefend', completed, sequence.length)}</div>
        ${next ? `<a class="button primary" href="#${historyLessonHref(next.id, scope, mode)}">${completed ? 'Verder leren' : 'Begin bij de eerste les'}</a>` : ''}
      </div>` : ''}
    </section>
    ${groups.length > 1 ? `<nav class="timeline-jumps row" aria-label="Naar een periode">${groups.map(([era], i) =>
      `<button type="button" class="chip outline" data-action="scroll-to" data-value="timeline-era-${i}">${esc(era)}</button>`).join('')}</nav>` : ''}
    <div class="timeline">
      ${groups.length ? groups.map(([era, entries], i) => {
        const eraDone = entries.filter(finished).length;
        const year = chronologyYear(entries[0]);
        return `<section class="timeline-group" data-epoch="${year < 0 ? 'ancient' : year < 500 ? 'classical' : year < 1450 ? 'medieval' : year < 1800 ? 'earlymodern' : 'modern'}"
          aria-labelledby="timeline-title-${i}" id="timeline-era-${i}" tabindex="-1">
          <header class="timeline-era"><span class="timeline-medallion">${icon('clock')}</span>
            <h2 id="timeline-title-${i}">${esc(era)}</h2><span>${eraDone} / ${entries.length} gevolgd</span></header>
          <ol class="unit-list">${entries.map(lesson => `<li>${unit(lesson, studied, { href: historyLessonHref(lesson.id, scope, mode),
            timeline: true, read, label: scope === 'alles' ? historyScopeName(lesson.track) : '' })}</li>`).join('')}</ol>
        </section>`;
      }).join('') : '<p class="empty">Voor deze keuze zijn nog geen lessen beschikbaar.</p>'}
    </div>`;
}

function languageLevel(track, level) {
  const focus = track === 'fr' ? FRENCH_LEVEL_FOCUS[level] : '';
  return `<section class="panel stack">
    <h2>${TRACKS[track].name} op ${esc(level)}</h2>
    <div class="row" role="group" aria-label="Taalniveau">${LEVELS.map(l => `<button type="button" class="chip" data-action="level" data-value="${track}/${l}" aria-pressed="${level === l}">${l}</button>`).join('')}</div>
    ${focus ? '<p class="muted">' + esc(focus) + '</p>' : ''}
  </section>`;
}

const paragraphs = text => String(text ?? '').split(/\n\s*\n/u).map(p => p.trim()).filter(Boolean);
const sentenceBoundaries = typeof Intl.Segmenter === 'function' ? new Intl.Segmenter('nl', { granularity: 'sentence' }) : null;

function conceptButton(id, text) {
  return '<button type="button" class="study-term" data-action="study-concept" data-value="' + esc(id) + '">' + esc(text) + '</button>';
}

function studyText(text) {
  let html = '';
  let previous = 0;
  for (const term of annotatedTerms(text)) {
    html += esc(text.slice(previous, term.index)) + conceptButton(term.id, term.text);
    previous = term.index + term.text.length;
  }
  return html + esc(text.slice(previous));
}

function emphasizedParagraph(text, renderText = esc) {
  const first = sentenceBoundaries?.segment(text)[Symbol.iterator]().next().value?.segment ?? text.split(/(?<=\.)\s+/u)[0];
  const end = first.trimEnd().length;
  return '<p><strong>' + renderText(text.slice(0, end)) + '</strong>' + renderText(text.slice(end)) + '</p>';
}

function studyParagraph(lead, text, source, renderText = esc) {
  return '<p><strong>' + renderText(lead) + '</strong> ' + renderText(text) +
    (source ? ' ' + sourceView(source) : '') + '</p>';
}

export function lessonExplanation(lesson) {
  const renderText = preparationFor(lesson) ? studyText : esc;
  const summary = paragraphs(lesson.summary).map(text => emphasizedParagraph(text, renderText)).join('');
  if (lesson.structure) {
    return '<div class="lesson-copy">' + summary + '</div>' +
      '<div class="history-dimensions">' + lesson.structure.map(({ heading, lead, text }) =>
        '<section class="history-dimension lesson-copy"><h3>' + esc(heading) + '</h3>' + studyParagraph(lead + '.', text, undefined, renderText) + '</section>').join('') + '</div>';
  }
  const core = lesson.languageTopic ? [] : lesson.items.filter(item => typeof item.explanation === 'string').map(item =>
    studyParagraph(item.label + '.', item.explanation, lesson.sources?.[item.source ?? (lesson.level ? -1 : 0)], renderText));
  return '<div class="lesson-copy">' + summary + core.join('') +
    studyNotes(lesson).map(([lead, text]) => studyParagraph(lead + '.', text, undefined, renderText)).join('') + '</div>';
}

export function studyPreparation(lesson, known = new Set(), required = []) {
  const guide = preparationFor(lesson);
  if (!guide) return '';
  const all = [...new Set([...required, ...guide.prerequisites])].map(studyConcept).filter(Boolean);
  const terms = rows => '<dl class="daily-glossary">' + rows.map(term =>
    '<dt>' + conceptButton(term.id, term.label) + '</dt><dd>' + esc(term.definition) + '</dd>').join('') + '</dl>';
  const unfamiliar = all.filter(term => !known.has(term.id));
  const familiar = all.filter(term => known.has(term.id));
  return `<section class="study-preparation stack"><h3>Voorkennis</h3>
    <p>Na deze les kun je de volgende leerdoelen uitleggen of toepassen.</p>
    <ul class="study-goals">${lesson.items.map(item => '<li>' + studyText(item.label) + '</li>').join('')}</ul>
    ${unfamiliar.length ? terms(unfamiliar.slice(0, 5)) : ''}
    ${unfamiliar.length > 5 ? '<details><summary>Meer begrippen bij deze les</summary>' + terms(unfamiliar.slice(5)) + '</details>' : ''}
    ${familiar.length ? '<details><summary>Eerder zelfstandig opgehaald</summary>' + terms(familiar) + '</details>' : ''}
  </section>`;
}

export function seminarExplanation(lesson) {
  const seminar = preparationFor(lesson)?.seminar;
  if (!seminar) return '';
  const [example, reasoning, source] = seminar.example;
  return `<div class="study-seminar stack">
    ${seminar.preparation.map(([title, text, reference]) =>
      '<section class="lesson-copy"><h3>' + esc(title) + '</h3><p>' + studyText(text) + '</p>' + sourceView(reference) + '</section>').join('')}
    <details><summary>Uitgewerkt voorbeeld · ${esc(example)}</summary><div class="study-example lesson-copy">
      <p>${studyText(reasoning)}</p>${sourceView(source)}</div></details>
  </div>`;
}

export function conceptDialog(term) {
  return `<div class="dialog-inner stack">
    <div class="topline"><h2 id="dialog-title">${esc(term.label)}</h2>
      <button type="button" class="button icon-only" aria-label="Sluiten" data-action="close-dialog">${icon('close')}</button></div>
    <p><strong>${esc(term.definition)}</strong></p>
    <p>${esc(term.context)}</p>
    <p><strong>Voorbeeld</strong> ${esc(term.example)}</p>
    <p class="muted small-text">${esc(term.scope)}</p>
    ${sourceView(term.source)}
    <div class="row">${term.related.map(studyConcept).map(related => conceptButton(related.id, related.label)).join('')}</div>
  </div>`;
}

function historyLinks(lesson, lessons) {
  const cases = lesson.caseIds?.map(id => lessons.find(row => row.id === id)).filter(Boolean) ?? [];
  const related = cases.length ? cases : lessons.filter(row => row.caseIds?.includes(lesson.id));
  if (!related.length) return '';
  return `<section class="panel block stack"><h2>${cases.length ? 'Casussen bij deze kernles' : 'Bijbehorende kernlessen'}</h2>
    <ul class="history-related">${related.map(row => `<li><a class="text-link" href="#les/${esc(encodeURIComponent(row.id))}">${esc(row.title)}</a></li>`).join('')}</ul>
  </section>`;
}

function historyNavigation(lesson, journey, read) {
  if (!journey) return '';
  const back = journey.back ?? timelineHref(journey.scope, journey.mode);
  const label = journey.label ?? 'Tijdlijn · ' + historyScopeName(journey.scope);
  const link = journey.link ?? (id => historyLessonHref(id, journey.scope, journey.mode));
  const step = (row, label, direction) => row ? `<a class="button history-step" rel="${direction}" href="#${link(row.id)}">
    <span>${label}</span><strong>${esc(row.title)}</strong></a>` : '';
  return `<nav class="panel block stack" aria-label="Chronologisch verder leren">
    <div class="topline"><h2>Chronologisch verder</h2>${journey.index >= 0 ? '<span class="muted small-text">Les ' + (journey.index + 1) + ' van ' + journey.listSize + '</span>' : ''}</div>
    <div class="row"><a class="text-link" href="#${back}">${esc(label)}</a>
      <button type="button" class="button small quiet" data-action="history-read" data-value="${esc(lesson.id)}" aria-pressed="${read}">Markeer als gelezen</button></div>
    <div class="history-steps">${step(journey.previous, 'Vorige les', 'prev')}${step(journey.next, 'Volgende les', 'next')}</div>
  </nav>`;
}

export function primaryPassage(passage, showImage = false) {
  const image = passage.image;
  const imageURL = image && linkURL(image.url);
  const reproduction = showImage && imageURL && /^[a-z0-9-]+\.jpg$/.test(image.file) ? `<figure class="source-image">
    <a href="${esc(imageURL)}" target="_blank" rel="noopener noreferrer"><img src="./assets/sources/${esc(image.file)}" alt="${esc(image.alt)}" loading="lazy"></a>
    <figcaption class="muted small-text">${esc(image.credit)}</figcaption></figure>` : '';
  return `<div class="source-texts"><section><h3>Origineel · ${esc(passage.language)}</h3>
      <blockquote lang="${esc(passage.lang)}" dir="auto">${esc(passage.original)}</blockquote></section>
    <section><h3>Engelse weergave</h3><blockquote lang="en">${esc(passage.english)}</blockquote></section>
    ${reproduction}</div>`;
}

export function lessonPage(lesson, { journey = null, read = false, lessons = [], courseTrack = lesson.track } = {}) {
  if (lesson.classical) return classicalLesson(lesson,lessons);
  if (lesson.languageTopic) return languageLessonPage(lesson);
  const courseHref = TRACKS[lesson.track].section === 'history' ? 'paideia' : 'talen';
  const sources = lessonSources(lesson);
  return `<div class="row"><a class="text-link" href="#${courseHref}/${courseTrack}">${TRACKS[courseTrack].name}</a>
    ${journey?.inRoute ? `<a class="text-link" href="#${journey.back ?? timelineHref(journey.scope, journey.mode)}">${esc(journey.label ?? 'Tijdlijn · ' + historyScopeName(journey.scope))}</a>` : ''}</div>
    <div class="block"><br>${heading(lesson.title, '', [lesson.period, lesson.level, ROUTES[lesson.route]].filter(Boolean).join(' · '))}</div>
    <article class="panel stack">
      ${studyPreparation(lesson)}
      ${lesson.primary ? '<h2>Bronfragment</h2>' + primaryPassage(lesson.primary, true) : ''}
      <h2>${lesson.primary ? 'Context en bronkritiek' : 'Uitleg'}</h2>
      ${lessonExplanation(lesson)}
      ${seminarExplanation(lesson)}
      ${exampleView(workedExample(lesson))}
      ${lesson.dialogue?.length ? `<div class="dialogue"><h3>Dialoog</h3>${lesson.dialogue.map((line, i) => `<div class="dialogue-line">
        <div class="row"><p lang="${esc(lesson.track)}"><strong>${esc(line.speaker)}</strong> · ${esc(line.text)}</p>
        ${button('speak-line', 'Luister', 'small quiet', lesson.id + '/' + i)}</div><p class="muted small-text">${esc(line.translation)}</p>
      </div>`).join('')}</div>` : ''}
      ${sources.length ? `<details><summary>Bronnen</summary><div class="stack">${sources.map(sourceView).join('')}</div></details>` : ''}
    </article>
    <section class="panel block stack lesson-practice">
      <h2>Oefenen</h2>
      <p class="muted">${lesson.structure ? 'Pas de uitleg toe in de analysevragen. Vergelijk je open antwoorden met een modelantwoord en beoordelingscriteria.' :
        'Begin met korte vragen. Gebruik een tip wanneer je vastloopt en bekijk de uitleg bij elk antwoord.'}</p>
      <div class="row">${button('lesson-quiz', lesson.structure ? 'Start de analysevragen' : 'Start korte oefenreeks', 'primary', lesson.id)}
        ${preparationFor(lesson)?.seminar ? button('lesson-academic', 'Academische verdieping', 'quiet', lesson.id) : ''}
        ${lesson.structure ? '' : button('lesson-more', 'Meer oefeningen', '', lesson.id)}</div>
    </section>
    ${historyNavigation(lesson, journey, read)}
    ${journey ? historyLinks(lesson, lessons) : ''}
    ${lesson.id.startsWith('eigen-') ? '<section class="block">' + button('delete-deck', 'Les verwijderen', 'danger', lesson.id) + '</section>' : ''}`;
}

function topicCards(track, lessons) {
  return `<div class="topic-grid">${Object.entries(LANGUAGE_TOPICS[track]).map(([id, theme]) => {
    const total = lessons.filter(lesson => lesson.track === track && lesson.languageTopic === id).length;
    return `<a class="panel track-card topic-card" href="#talen/${track}/${id}">
      <span class="track-icon ${track}">${icon(theme.icon)}</span><h2>${esc(theme.title)}</h2>
      <p class="muted">${esc(theme.text)}</p><span class="caption">${total} ${total === 1 ? 'les' : 'lessen'}</span>
    </a>`;
  }).join('')}</div>`;
}

function topicPage(track, topic, lessons, studied, level) {
  const theme = LANGUAGE_TOPICS[track][topic];
  const french = track === 'fr';
  const shown = lessons.filter(lesson => lesson.track === track && lesson.languageTopic === topic && (!french || lesson.level === level));
  return `<p class="back-link"><a class="text-link" href="#talen/${track}">Terug naar ${TRACKS[track].name}</a></p>` +
    heading(theme.title, theme.text, TRACKS[track].name) + (french ? languageLevel(track, level) : '') + `
    <section class="block stack" aria-label="Lessen over ${esc(theme.title)}">
      ${french ? `<div class="topline"><h2>Lessen op ${esc(level)}</h2>${shown.length ? button('drill', 'Oefen dit thema', '', track + '/5') : ''}</div>` : ''}
      <div class="unit-list topic-units">${shown.map(lesson => unit(lesson, studied)).join('')}</div>
      ${shown.length ? '' : '<p class="empty">Voor dit niveau is er nog geen les geladen.</p>'}
    </section>`;
}

export function languageGrammar(lesson) {
  const { grammar } = lesson;
  if (!grammar) return '';
  return `<div class="grammar-example stack">
    <h3>${esc(grammar.title)}</h3><div class="lesson-copy">${paragraphs(grammar.rule).map(emphasizedParagraph).join('')}</div>
    <p lang="${esc(lesson.track)}"><strong>${esc(grammar.example)}</strong></p><p class="muted">${esc(grammar.translation)}</p>
    ${button('speak-grammar', 'Luister naar het voorbeeld', 'small quiet', lesson.id)}</div>`;
}

export function languageVocabulary(lesson, limit) {
  const words = limit ? lesson.vocabulary.slice(0, limit) : lesson.vocabulary;
  return `<dl class="word-list">${words.map(([term, meaning], index) => `<div class="word-row">
    <dt lang="${esc(lesson.track)}">${esc(term)}</dt><dd>${esc(meaning)}</dd>
    ${lesson.classical ? '' : `<button class="button icon-only audio-word" type="button" data-action="speak-vocab" data-value="${esc(lesson.id)}/${index}" aria-label="Luister naar ${esc(term)}">${icon('volume')}</button>`}</div>`).join('')}</dl>`;
}

function languageLessonPage(lesson) {
  const { track, id, languageTopic } = lesson;
  return `<p class="back-link"><a class="text-link" href="#talen/${track}/${esc(languageTopic)}">
    ${esc(LANGUAGE_TOPICS[track][languageTopic].title)}</a></p>` +
    heading(lesson.title, '', TRACKS[track].name + ' · ' + lesson.level) + `
    <article class="panel stack"><h2>Uitleg</h2>${lessonExplanation(lesson)}</article>
    <div class="language-lesson-grid block">
      <section class="panel stack"><h2>Woordenschat</h2>${languageVocabulary(lesson)}</section>
      <div class="stack language-lesson-aside">
        <section class="panel stack"><h2>Grammatica</h2>${languageGrammar(lesson)}</section>
        ${lesson.sources.length ? `<section class="panel stack"><h2>Bronnen</h2>${lesson.sources.map(sourceView).join('')}</section>` : ''}
      </div>
    </div>
    <section class="panel block stack" aria-label="Oefenen"><h2>Oefenen</h2>
      <div class="row language-actions">
        ${button('language-practice', 'Woordenschat oefenen', 'primary', id + '/vocabulary')}
        ${button('language-practice', 'Grammatica oefenen', '', id + '/grammar')}
        ${button('language-practice', track === 'it' ? 'Spreken en zinnen maken' : 'Zinnen maken', '', id + '/sentence')}
      </div>
    </section>`;
}

export function exampleView(example) {
  return example ? `<aside class="worked-example stack" aria-label="Uitgewerkt voorbeeld">
    <h3>Uitgewerkt voorbeeld</h3>
    <p${example.language ? ' lang="' + esc(example.language) + '"' : ''}>${esc(example.prompt)}</p>
    <p><strong>${esc(example.answer)}</strong></p>
    ${example.explanation ? '<p>' + esc(example.explanation) + '</p>' : ''}
    ${sourceView(example.source)}
  </aside>` : '';
}

function examDate(at) {
  return new Date(at).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short', year: 'numeric' });
}

function scoreText(data) {
  if (data.scoreVersion !== SCORE_VERSION) return data.correct + ' / ' + data.total + ' · toenmalige telling';
  if (!data.objective) return 'Zelfbeoordeling';
  return data.correct + ' van ' + data.objective + ' automatisch juist zonder hulp';
}

export function outcomes(rows, emptyText) {
  return rows.length ? `<div class="unit-list">${rows.map(row => `<a class="unit" href="#resultaat/${esc(row.id)}">${icon('check')}
    <div><h3>${esc(row.data.title)}</h3><small>${examDate(row.at)}</small></div>
    <span class="unit-trailing">${row.data.reviewed < row.data.total ? 'Correctie open' : esc(scoreText(row.data))}</span>
  </a>`).join('')}</div>` : `<p class="empty">${esc(emptyText)}</p>`;
}

export function exams(info) {
  const week = info.weekly;
  const month = info.monthly;
  const range = week ? examDate(week.monday) + ' – ' + examDate(week.sunday) : '';
  const monthName = month?.start.toLocaleDateString('nl-BE', { month:'long', year:'numeric' });
  return sectionHeading('toetsen', 'Bereid je voor met een korte oefentoets of kies een toets over behandelde leerstof uit Paideia.') + `
    <section class="panel course-start stack">
      <h2>Oefentoets</h2><p>Probeer maximaal vijf voorbeeldvragen. Je kunt tips gebruiken en krijgt na elke vraag de uitwerking. Je kunt meteen beginnen.</p>
      <div>${button('exam-practice', 'Start oefentoets', 'primary')}</div>
    </section>
    <div class="columns block">
      <section class="panel stack"><h2>Weekexamen</h2><p class="muted">Tot 10 vragen · 45 minuten</p>
        ${range ? '<p class="small-text">' + range + '</p>' : ''}
        <p>Je krijgt vragen over wat je deze week las in een dagles, oefende of als gelezen markeerde in Paideia en Traditio.</p>
        ${week?.lessons.length ? `<details><summary>${week.lessons.length} ${week.lessons.length === 1 ? 'les' : 'lessen'} in jouw examenstof</summary>
          <ul>${week.lessons.map(lesson => `<li><a class="text-link" href="#les/${encodeURIComponent(lesson.id)}">${esc(lesson.title)}</a></li>`).join('')}</ul></details>`
          : '<p class="muted small-text">Je examenstof verschijnt hier zodra je deze week in Paideia studeert.</p>'}
        ${week?.goals.length && !week.ready ? '<p class="muted small-text">Oefen nog één leerdoel om het weekexamen te starten.</p>' : ''}
        <p class="exam-ice">🧊 +${EXAM_ICE.week} ijsklontje bij ${EXAM_PASS}% of meer op minstens ${EXAM_GOALS.week} automatisch beoordeelde vragen, eenmaal per week.</p>
        <div class="row">${button('exam', 'Bekijk weekexamen', '', 'week')}
        ${week?.ready ? button('exam', 'Alle behandelde leerdoelen', 'quiet', 'week-all') : ''}</div></section>
      <section class="panel stack"><h2>Maandtoets</h2><p class="muted">Tot 18 vragen · 75 minuten</p>
        ${monthName ? '<p class="small-text">' + esc(monthName) + '</p>' : ''}
        <p>Je krijgt vragen over wat je deze kalendermaand bestudeerde in Paideia en Traditio.</p>
        ${month?.lessons.length ? '<details><summary>' + month.lessons.length + (month.lessons.length === 1 ? ' les' : ' lessen') +
          ' in jouw examenstof</summary><ul>' + month.lessons.map(lesson => '<li><a class="text-link" href="#les/' +
          encodeURIComponent(lesson.id) + '">' + esc(lesson.title) + '</a></li>').join('') + '</ul></details>' : ''}
        <p class="exam-ice">🧊 +${EXAM_ICE.month} ijsklontjes bij ${EXAM_PASS}% of meer op minstens ${EXAM_GOALS.month} automatisch beoordeelde vragen, eenmaal per maand.</p>
        <div class="row">${button('exam', 'Bekijk maandtoets', '', 'month')}
        ${month?.ready ? button('exam', 'Alle behandelde leerdoelen', 'quiet', 'month-all') : ''}</div></section>
    </div>
    <section class="block"><div class="topline"><h2>Vorige toetsen</h2></div>${outcomes(info.results.filter(row => row.data.mode === 'exam'), 'Je hebt nog geen toets afgerond.')}</section>`;
}

export function progressPage(info) {
  return sectionHeading('voortgang', 'Volg je oefenactiviteit en bekijk welke leerdoelen toe zijn aan herhaling.') +
    `<div class="progress-overview">
      <div class="stack">${progressSummary(info, true)}${metrics(info)}</div>
      ${activityChart(info.activity)}
    </div>
    <section class="panel block stack" aria-label="Studie en beheersing">
      <h2>Wat heb je onthouden?</h2>
      <div class="study-evidence">
        <div><strong>${info.studiedCount}</strong><span>lessen gelezen of geoefend</span></div>
        <div><strong>${info.completedLessons}</strong><span>lessen met elk leerdoel geoefend</span></div>
        <div><strong>${info.recognized}</strong><span>leerdoelen juist herkend zonder hulp</span></div>
        <div><strong>${info.retained}</strong><span>leerdoelen zelfstandig opgehaald met minstens 24 uur ertussen</span></div>
        <div><strong>${info.applied}</strong><span>leerdoelen juist toegepast op een broncasus zonder hulp</span></div>
      </div>
      ${info.conceptRecognition || info.conceptDefinitions || info.conceptApplication ?
        '<p class="small-text">Begrippen · ' + info.conceptRecognition + ' zelfstandig herkend · ' + info.conceptDefinitions +
        ' definities zelf nagekeken · ' + info.conceptApplication + ' zelfstandig toegepast.</p>' : ''}
      <p class="muted small-text">Oudere pogingen en zelfbeoordelingen blijven beschikbaar als oefenhistoriek.</p>
    </section>
    <div class="columns block">
      <section class="panel stack"><h2>Je weekdoel</h2>
        <p>${info.weeklyLessons} verschillende lessen bestudeerd sinds maandag${info.weeklyGoal ? ' · doel ' + info.weeklyGoal : ''}.</p>
        ${info.weeklyGoal ? studyMeter('Bestudeerde lessen deze week',Math.min(info.weeklyLessons,info.weeklyGoal),info.weeklyGoal) : ''}
        <form id="weekly-goal-form" class="row"><label for="weekly-goal">Lessen per week</label><input id="weekly-goal" name="lessons" type="number" min="1" step="1" required value="${info.weeklyGoal ?? ''}"><button class="button small" type="submit">Bewaren</button></form>
      </section>
      <section class="panel stack"><h2>Laatste beoordeelde examen</h2>
        ${info.completedExams.length ? `<p><strong>${esc(info.completedExams[0].data.title)}</strong> · ${examDate(new Date(info.completedExams[0].at))}</p>
          <p>${esc(scoreText(info.completedExams[0].data))}</p>
          <a class="text-link" href="#resultaat/${encodeURIComponent(info.completedExams[0].id)}">Bekijk je antwoorden</a>` :
          '<p class="muted">Hier verschijnt je resultaat zodra alle antwoorden van je examen beoordeeld zijn.</p><a class="text-link" href="#toetsen">Naar de examens</a>'}
      </section></div>
    ${streakPanel(info.streak, true)}
    <section class="block">
      <div class="topline"><h2>Per leerpad</h2><a class="text-link" href="#dagles">${info.days} ${info.days === 1 ? 'dagles' : 'daglessen'} afgerond</a></div>
      <div class="columns progress-tracks">${Object.keys(TRACKS).map(track => {
        const { goals, total, due } = info.byTrack[track];
        const name = TRACKS[track].name;
        return `<article class="panel stack progress-track ${track}">
          <div class="path-head">${trackIcon(track)}<div><h3 lang="la">${TRACK_NAMES[track]}</h3><p class="muted small-text">${name}</p></div></div>
          <div class="progress-caption"><strong>${goals} / ${total}</strong><span>Leerdoelen geoefend</span></div>
          ${studyMeter(name + ' · leerdoelen geoefend', goals, total)}
          <div class="topline progress-track-bottom"><span class="muted small-text">${due} klaar voor herhaling</span>
            ${due ? button('quick-track', 'Herhaal nu', 'small', track) : ''}</div>
        </article>`;
      }).join('')}</div>
    </section>
    <section class="block"><div class="topline"><h2>Recente sessies</h2></div>${outcomes(info.results, 'Je eerste afgeronde sessie verschijnt hier.')}</section>`;
}

const SET_APPROACH = [
  'Lees de vraag en bepaal wat je moet herkennen. Vergelijk daarna de opties aan de hand van de opgave.',
  'Probeer het begrip of de vorm eerst zelf op te halen. Controleer of je voorstel past in de volledige zin of situatie.',
  'Verbind het begrip met de informatie in de opgave. Let op wat verandert wanneer de situatie of de volgorde verandert.',
  'Begin met je belangrijkste gedachte. Voeg een concreet gegeven, een reden of een passende vervolgzin toe.',
];

function practiceTitle(session) {
  if (session.mode === 'daily' || session.mode === 'exam' || session.mode === 'placement') return session.title;
  if (session.mode === 'quick') return 'Sneloefening';
  return session.track ? 'Oefenreeks · ' + TRACKS[session.track].name : 'Oefenreeks';
}

export function quizIntro(session) {
  const placement = session.mode === 'placement';
  const exam = session.mode === 'exam';
  const count = session.questions.length;
  const phases = [...new Set(session.questions.map(practicePhase))].sort((a, b) => a - b);
  const description = placement
    ? 'Je begint op A1. De vragen gaan omhoog tot je een niveau nog moeilijk vindt. Je krijgt een startadvies en kiest zelf je niveau.'
    : exam ? 'Lees elke vraag rustig. Een open antwoord kun je na afloop beoordelen met de uitwerking en de criteria.'
      : 'Werk de vragen op je eigen tempo af. Je kunt tijdens het oefenen een tip over de aanpak openen.';
  return `<div class="quiz"><section class="panel stack quiz-intro" aria-labelledby="quiz-title">
    <p class="eyebrow">Voor je begint</p>
    <div><h1 id="quiz-title">${esc(practiceTitle(session))}</h1><p class="muted">${description}</p></div>
    <div class="row"><span class="chip">${placement ? 'Maximaal ' : ''}${count} ${count === 1 ? 'vraag' : 'vragen'}</span>
      ${exam ? '<span class="chip">' + esc(session.duration) + ' minuten</span>' :
        placement ? '<span class="chip">Lezen en invullen</span>' : '<span class="chip">Op eigen tempo</span>'}</div>
    ${exam ? '<p>De tijd begint wanneer je op Start toets drukt. Na afloop kun je alle antwoorden bekijken.</p>' : ''}
    ${!exam && !placement ? '<div class="lesson-copy">' +
      phases.map(phase => studyParagraph(PRACTICE_PHASES[phase] + '.', SET_APPROACH[phase])).join('') + '</div>' : ''}
    <div class="row intro-actions">${button('quiz-start', exam ? 'Start toets' : placement ? 'Start instaptest' : 'Start oefenen', 'primary')}
      ${button('pause', 'Later verder', 'quiet')}</div>
  </section></div>`;
}

export function practiceControls(q, session) {
  const answered = session.answers[session.index];
  const selected = answered?.selection ?? session.selection ?? [];
  const choices = practiceOptions(q);
  const order = q.optionOrder ?? choices.map((_, i) => i);
  if (q.kind === 'order') {
    const language = q.language?.slice(0, 2);
    return `<div class="selected-parts" aria-label="Jouw volgorde"${language ? ' lang="' + language + '"' : ''}>
      ${selected.length ? selected.map((part, i) => answered ? '<span class="part">' + esc(choices[part]) + '</span>' :
        `<button type="button" class="part part-selected" data-action="remove-part" data-value="${i}"
            aria-label="Haal ${esc(choices[part])} weg">${esc(choices[part])}<span aria-hidden="true"> ×</span></button>`).join('') :
        '<p class="muted">Jouw volgorde verschijnt hier.</p>'}</div>
      ${answered ? '' : `<div class="part-bank" aria-label="Beschikbare blokken"${language ? ' lang="' + language + '"' : ''}>
        ${order.map(i => `<button class="part" type="button" data-action="add-part" data-value="${i}" ${selected.includes(i) ? 'disabled' : ''}>
          ${esc(choices[i])}</button>`).join('')}</div>`}`;
  }
  if (q.kind !== 'match') return '';
  return `<ol class="match-options" type="A" aria-label="Mogelijke antwoorden">
    ${order.map(i => '<li>' + esc(choices[i]) + '</li>').join('')}</ol>
    <div class="match-rows">${q.pairs.map((pair, row) => `<div class="match-row field">
      <label for="match-${row}"${q.language ? ' lang="' + esc(q.language) + '"' : ''}>${esc(pair.prompt)}</label>
      <select id="match-${row}" data-match-row="${row}" ${answered ? 'disabled' : ''}>
        <option value="">Kies een antwoord</option>
        ${order.map((i, j) => `<option value="${i}" ${selected[row] === i ? 'selected' : ''}>${String.fromCharCode(65 + j)}. ${esc(choices[i])}</option>`).join('')}
      </select></div>`).join('')}</div>`;
}

export function quizPage(session) {
  const q = session.questions[session.index];
  const answered = session.answers[session.index];
  const count = session.questions.length;
  const index = session.index;
  const formal = session.mode === 'exam' || session.mode === 'placement';
  const selected = answered?.response ?? session.response ?? '';
  const isCard = q.kind === 'card' && !formal;
  const choice = q.kind === 'choice' && Boolean(q.options?.length);
  const canTypeOrder = !formal && q.kind === 'order' && q.language;
  const typeOrder = canTypeOrder && session.typeOrder;
  const interactive = Object.hasOwn(PRACTICE_KINDS, q.kind) && !typeOrder;
  const multiline = ['card','open','listen'].includes(q.kind) || typeOrder;
  const fieldAttributes = (answered && !formal ? ' readonly' : '') +
    (q.language ? ' lang="' + esc(q.language) + '" autocomplete="off" autocorrect="off" spellcheck="false"' : '');
  const format = { vocabulary: 'Woordenschat', grammar: 'Grammatica', sentence: 'Zinnen maken' }[q.skill] ??
    KINDS[q.kind] ?? PRACTICE_KINDS[q.kind];
  const hints = formal ? [] : tipsFor(q);
  const visibleHints = session.hints?.[index] || 0;
  const difficulty = STUDY_LEVELS[studyLevel(q) - 1];
  const hintLabels = ['Verduidelijk de vraag', 'Krijg een inhoudelijke tip', 'Krijg een aanwijzing voor je aanpak'];
  return `<div class="quiz">
    <div class="quiz-top"><div><p class="eyebrow">${esc(practiceTitle(session))}</p><span class="quiz-count">Vraag ${index + 1} van ${count}</span></div>
      <div class="row">${session.deadline ? '<span class="chip quiz-timer" id="timer"></span>' : ''}${button('pause', 'Pauzeren', 'small quiet')}</div></div>
    ${studyMeter('Beantwoorde vragen in deze sessie', index + Number(!!answered), count)}
    <div class="panel question stack">
      <div><span class="chip">${esc([difficulty ?? (formal ? '' : PRACTICE_PHASES[practicePhase(q)]), format].filter(Boolean).join(' · '))}</span><h1${q.promptLanguage ? ' lang="' + esc(q.promptLanguage) + '"' : ''}>${esc(q.text)}</h1></div>
      ${q.passage ? '<details class="question-source"><summary>Lees het fragment</summary>' + primaryPassage(q.passage) + '</details>' : ''}
      ${evidenceNotes(q)}
      ${q.context ? '<p class="question-context"' + (q.promptLanguage ? ' lang="' + esc(q.promptLanguage) + '"' : '') + '>' + esc(q.context) + '</p>' : ''}
      ${!answered && !formal ? '<p class="question-instruction">' + esc(typeOrder ? 'Typ de volledige zin.' : instructionFor(q)) + '</p>' : ''}
      ${!answered && q.audioPrompt ? `<div class="spoken-prompt stack">
        <div>${button('listen-prompt', 'Luister naar de vraag', '', '')}</div>
        <details><summary>Lees de vraag</summary><p lang="${esc(q.language)}">${esc(q.audioPrompt)}</p><p class="muted">${esc(q.promptMeaning)}</p></details></div>` : ''}
      ${q.cases?.length ? `<details><summary>Bekijk de twee casussen</summary>
        <div class="stack">${q.cases.map(c => `<div><h3>${esc(c.title)}</h3><p>${esc(c.label)} · ${esc(c.note)}</p>${sourceView(c.source)}</div>`).join('')}</div></details>` : ''}
      ${q.kind === 'listen' && !answered ? button('listen', 'Speel audio af', 'quiet') : ''}
      ${choice ? `<div class="choices" role="group" aria-label="Antwoordopties">${q.options.map((option, i) =>
        `<button type="button" class="choice" data-action="choose" data-value="${i}" data-selected="${selected === option}"
            aria-pressed="${selected === option}" ${answered && !formal ? 'disabled data-correct="' + (option === q.answer) + '"' : ''}>
          <b aria-hidden="true">${'ABCD'.charAt(i) || i + 1}</b><span${q.promptLanguage ? ' lang="' + esc(q.promptLanguage) + '"' : ''}>${esc(option)}</span></button>`).join('')}</div>` : ''}
      ${interactive ? '<div class="practice-controls stack">' + practiceControls(q, session) + '</div>' : ''}
      ${!choice && !interactive ? `<div class="field answer-field"><label for="answer">Jouw antwoord</label>
        ${multiline ? `<textarea class="answer-input" id="answer" rows="${q.kind === 'open' ? 3 : 2}" maxlength="3000"${fieldAttributes}>${esc(selected)}</textarea>` :
        `<input type="text" id="answer" maxlength="300" value="${esc(selected)}" enterkeyhint="done"${fieldAttributes}>`}</div>` : ''}
      ${q.track === 'grc' && !answered && !choice && !interactive ? greekKeyboard() : ''}
      ${canTypeOrder && !answered ? '<div>' + button('toggle-type-order', typeOrder ? 'Gebruik woordblokken' : 'Typ de zin zelf', 'small quiet') + '</div>' : ''}
      ${session.retry && !answered ? `<div class="notice retry stack" tabindex="-1" role="status">
        <strong>Probeer nog eens</strong>
        <p>${session.retry === 'accent' ? 'De letters kloppen. Let nog op de accenten.' : q.kind === 'match'
          ? 'Een of meer koppelingen komen nog niet overeen.' : esc(hints[1] ?? 'Lees de opgave nog eens rustig.')}</p></div>` : ''}
      ${!answered && hints.length ? `<div class="quiz-hints stack">
        ${visibleHints ? '<ol class="hint-list" tabindex="-1" aria-label="Tips bij deze vraag">' + hints.slice(0, visibleHints).map(h => '<li>' + esc(h) + '</li>').join('') + '</ol>' : ''}
        ${visibleHints < hints.length ? '<div>' + button('hint', hintLabels[visibleHints], 'small quiet') + '</div>' : ''}
      </div>` : ''}
      ${answered && !formal ? answerFeedback(q, answered) : ''}
      <div class="quiz-actions">
        ${formal ? button('skip-question', 'Overslaan', 'quiet') + button('submit-answer', index + 1 === count ? 'Indienen' : 'Volgende vraag', 'primary') : ''}
        ${!formal && !answered ? button('skip-question', 'Sla over en bekijk uitwerking', 'quiet') +
          button('submit-answer', q.kind === 'open' || isCard ? 'Vergelijk mijn antwoord' : 'Controleer', 'primary') : ''}
        ${!formal && answered && !answered.rating ? (q.kind === 'open' || isCard ?
          button('rate', 'Nog oefenen', '', 'again') +
          button('rate', q.kind === 'open' ? 'Voldoet aan de criteria' : 'Ik had het goed', 'primary', 'good') : '') : ''}
        ${!formal && answered?.rating ? button('next-question', index + 1 === count ? 'Afronden' : 'Volgende vraag', 'primary') : ''}
      </div>
    </div>
  </div>`;
}

function evidenceNotes(q) {
  if (!q.evidenceNotes?.length) return '';
  return `<details class="question-source" open><summary>Bronmateriaal bij de vraag</summary>
    <div class="study-example stack">${q.evidenceNotes.map(([title, text, source]) =>
      '<section class="lesson-copy"><h3>' + esc(title) + '</h3><p>' + esc(text) + '</p>' + sourceView(source) + '</section>').join('')}</div></details>`;
}

function rubricView(q, answer, result) {
  if (!q.rubric?.length) return '';
  return `<fieldset class="study-rubric stack"><legend>Beoordeel je redenering</legend>
    <p class="small-text muted">Vergelijk je eigen tekst per criterium. Athenaeum telt dit als zelfbeoordeling.</p>
    ${q.rubric.map((criterion, index) => {
      const status = answer.rubric?.[index] ?? '';
      return `<div class="study-criterion stack">
        <p><strong>${esc(criterion.label)}</strong> ${esc(criterion.expected)}</p>
        ${answer.skipped ? '' : `<label class="field"><span class="sr-only">${esc(criterion.label)}</span>
          <select data-rubric="${index}" data-rubric-result="${esc(result)}">
            <option value="">Kies je beoordeling</option>
            <option value="met" ${status === 'met' ? 'selected' : ''}>Aanwezig</option>
            <option value="revise" ${status === 'revise' ? 'selected' : ''}>Aanvullen</option>
          </select></label>`}
        <p class="notice small-text" data-rubric-note aria-live="polite" ${status !== 'revise' ? 'hidden' : ''}>
          ${status === 'revise' ? esc(criterion.revision) : ''}</p>
      </div>`;
    }).join('')}</fieldset>`;
}

function answerFeedback(q, answer, result = '') {
  const feedback = [...new Set([q.feedback, q.explanation].filter(text => text && text !== q.answer))];
  const optionNote = q.optionFeedback && Object.hasOwn(q.optionFeedback, answer.response) && q.optionFeedback[answer.response];
  const matches = q.kind === 'match';
  const title = !answer.rating ? 'Modelantwoord' : answer.rating === 'again' ? 'Bekijk de uitwerking' :
    evidenceFor(q, answer) === 'self' ? 'Zelf beoordeeld' : answer.rating === 'help' ? 'Goed met hulp' : 'Goed';
  return `<div class="feedback stack ${answer.rating === 'again' ? 'again' : ''}" tabindex="-1" role="status">
    <h3>${title}</h3>
    ${matches ? `<ul class="match-feedback">${q.pairs.map((pair, i) => {
      const selected = q.pairs[answer.selection?.[i]];
      return `<li><strong>${esc(pair.prompt)}</strong><p>${esc(pair.answer)}</p>
        ${selected && selected !== pair ? '<p class="small-text">Jouw keuze · ' + esc(selected.answer) + '</p>' : ''}
        ${pair.note ? '<p class="small-text">' + esc(pair.note) + '</p>' : ''}
        ${sourceView(pair.source)}</li>`;
    }).join('')}</ul>` : '<p class="model-answer">' + esc(q.answer) + '</p>'}
    ${!matches && answer.rating === 'again' && answer.response ? '<p class="small-text">Jouw antwoord · ' + esc(answer.response) + '</p>' : ''}
    ${optionNote ? '<p><strong>Over je keuze</strong> ' + esc(optionNote) + '</p>' : ''}
    ${!matches && feedback.length ? '<div class="lesson-copy"><h3>Uitleg</h3>' +
      feedback.flatMap(paragraphs).map(emphasizedParagraph).join('') + '</div>' : ''}
    ${rubricView(q, answer, result)}
    ${q.criteria?.length ? '<div><h3>Waarop let je?</h3><ul>' + q.criteria.map(text => '<li>' + esc(text) + '</li>').join('') + '</ul></div>' : ''}
    ${q.prerequisites?.length ? '<div class="row" role="group" aria-label="Begrippen om te herhalen">' +
      q.prerequisites.map(studyConcept).filter(Boolean).map(term => conceptButton(term.id, term.label)).join('') + '</div>' : ''}
    ${difficultyLink(q)}
    ${matches ? '' : sourceView(q.source)}${q.audio ?
      button(result ? 'result-listen' : 'listen', 'Luister naar het antwoord', 'small quiet', result) : ''}
  </div>`;
}

function difficultyLink(q) {
  if (!q.lesson || !studyLevel(q) || q.kind === 'match') return '';
  return '<div><a class="text-link" href="#les/' + encodeURIComponent(q.lesson) + '">Lees de bijbehorende uitleg</a></div>';
}

export function resultPage(id, data, reward = 0) {
  const placement = data.mode === 'placement';
  const practice = !placement && data.mode !== 'exam';
  const revisit = practice && data.answers.some(answer => ['again','help'].includes(answer?.rating));
  const back = typeof data.back === 'string' && data.back ? data.back : 'vandaag';
  const backText = back.startsWith('les/') || back.startsWith('dagles/') ? 'Terug naar de les' :
    back === 'scriptorium/oefenen' ? 'Terug naar het Oefenatelier' :
    back === 'vandaag' ? 'Naar Vandaag' : 'Terug naar het overzicht';
  return heading(placement ? 'Jouw startniveau' : data.title, placement ? 'Deze korte leestoets geeft een richtpunt. Je kunt daarna zelf een niveau kiezen.' : '') + `
    <section class="panel stack">
      ${placement ? '<h2>' + esc(data.estimate.recommended) + '</h2><div class="row">' + data.estimate.rows.filter(row => row.total).map(row => '<span class="chip">' + esc(row.level) + ' · ' + esc(row.correct) + '/' + esc(row.total) + '</span>').join('') + '</div>' :
        '<h2>' + esc(scoreText(data)) + '</h2>' +
        (data.assisted ? '<p>' + data.assisted + (data.assisted === 1 ? ' vraag juist' : ' vragen juist') + ' met hulp.</p>' : '') +
        (data.selfAssessed ? '<p>' + data.selfAssessed + (data.selfAssessed === 1 ? ' antwoord zelf beoordeeld.' : ' antwoorden zelf beoordeeld.') + '</p>' : '') +
        (data.reviewed < data.total ? '<p class="muted">Beoordeel hieronder de open antwoorden om je resultaat af te werken.</p>' : '')}
      ${reward ? `<p class="exam-ice">🧊 Je hebt ${reward} ${reward === 1 ? 'ijsklontje' : 'ijsklontjes'} verdiend!</p>` : ''}
      <div class="row">
        ${placement ? button('use-level', 'Kies ' + data.estimate.recommended, 'primary', data.track + '/' + data.estimate.recommended) :
          (revisit ? button('practice-again', 'Oefen lastige vragen opnieuw', 'primary', id) : '') +
          '<a class="button ' + (revisit ? 'quiet' : 'primary') + '" href="#' + esc(back) + '">' + backText +
          '</a><a class="button quiet" href="#voortgang">Voortgang</a>'}
      </div>
    </section>
    <section class="block"><div class="topline"><h2>Correctie</h2></div><div class="unit-list">${data.questions.map((q, i) => {
    const answer = data.answers[i] ?? {};
      return `<details ${!answer.rating && data.mode === 'exam' ? 'open' : ''}><summary>${esc(q.text)}</summary>
        ${q.passage ? primaryPassage(q.passage) : ''}
        ${evidenceNotes(q)}
        ${q.context ? '<p class="question-context">' + esc(q.context) + '</p>' : ''}
        ${answer.rating !== 'again' && q.kind !== 'match' ? '<p class="small-text muted">Jouw antwoord · ' + esc(answer.response || '—') + '</p>' : ''}
        ${answerFeedback(q, answer, id + '/' + i)}
        ${!answer.rating && data.mode === 'exam' ? '<div class="row" style="margin-top:10px">' +
          button('exam-rate', 'Nog niet', 'small', id + '/' + i + '/again') + button('exam-rate', 'Voldoet aan de criteria', 'small primary', id + '/' + i + '/good') + '</div>' : ''}
      </details>`;
    }).join('')}</div></section>`;
}

export function importPage(draft, preview, track) {
  const chosen = draft.track ?? track;
  const selected = Object.hasOwn(TRACKS, chosen) ? chosen : 'greek';
  const base = sectionHeading('importeren', 'Plak een tekst of voeg een leesbare PDF of woordenlijst toe. Je krijgt een voorstel dat je kunt aanpassen.');
  if (preview.length) {
    const count = preview.reduce((n, lesson) => n + lesson.items.length, 0);
    return base + `<section class="panel stack"><h2>Controleer je ${count} leerdoelen</h2>
      <p class="muted">Pas de titel of uitleg aan en schrap vragen die je niet wil bewaren.</p>
      <div class="row">${button('save-preview', 'Bewaar als leerstof', 'primary')}${button('cancel-preview', 'Terug naar invoer', 'quiet')}</div>
    </section><section class="block"><div class="unit-list">
      ${preview.map((lesson, li) => `<details><summary>${esc(lesson.title)} · ${lesson.items.length} leerdoelen</summary><div class="stack">
        <div class="field"><label for="preview-title-${li}">Titel</label><input id="preview-title-${li}" value="${esc(lesson.title)}" data-edit="title" data-lesson="${li}" maxlength="130"></div>
        ${lesson.items.map((item, ii) => `<details><summary>${esc(item.label)}</summary>
          <label class="field"><span class="field-label">Uitleg</span><textarea data-edit="explanation" data-lesson="${li}" data-item="${ii}" maxlength="700">${esc(item.explanation)}</textarea></label>
          <div class="stack">${item.questions.map((q, qi) => `<div><p class="eyebrow">${KINDS[q.kind]}</p>
            <label class="field"><span class="field-label">Vraag</span><input data-edit="text" data-lesson="${li}" data-item="${ii}" data-question="${qi}" value="${esc(q.text)}" maxlength="700"></label>
            <label class="field"><span class="field-label">Antwoord</span><input data-edit="answer" data-lesson="${li}" data-item="${ii}" data-question="${qi}" value="${esc(q.answer)}" maxlength="700"></label>
            ${button('remove-question', 'Verwijder vraag', 'small danger quiet', li + '/' + ii + '/' + qi)}
          </div>`).join('')}</div>
        </details>`).join('')}
      </div></details>`).join('')}
    </div></section>`;
  }
  const language = TRACKS[selected].section === 'language';
  return base + `<form id="import-form" class="panel stack">
    <div class="columns">
      <div class="field"><label for="import-title">Titel</label><input id="import-title" name="title" value="${esc(draft.title)}" placeholder="Bv. Romeinse magistraturen" maxlength="100" required></div>
      <div class="field"><label for="import-track">Leerpad</label><select id="import-track" name="track">${Object.entries(TRACKS).map(([key, model]) => `<option value="${key}" ${key === selected ? 'selected' : ''}>${model.name}</option>`).join('')}</select></div>
    </div>
    <div class="columns" id="import-language" ${language ? '' : 'hidden'}>
      <div class="field"><label for="import-level">Niveau</label><select id="import-level" name="level">${LEVELS.map(level => `<option ${(draft.level ?? 'A1') === level ? 'selected' : ''}>${level}</option>`).join('')}</select></div>
      <div class="field"><label for="import-route">Situatie</label><select id="import-route" name="route">${Object.entries(ROUTES).map(([key, label]) => `<option value="${key}" ${draft.route === key ? 'selected' : ''}>${label}</option>`).join('')}</select></div>
    </div>
    <div class="field"><label for="import-text">Tekst of woordenlijst</label><textarea id="import-text" name="text" placeholder="Bv. la spesa | de boodschappen" rows="8">${esc(draft.text)}</textarea><small class="muted">Een regel per paar met een streepje of | tussen begrip en uitleg werkt ook offline.</small></div>
    <div class="field"><label for="import-file">Bestand kiezen</label><input id="import-file" type="file" accept=".pdf,.txt,.md,.csv,.tsv,application/pdf,text/plain"><small class="muted">Je kunt via het bestandsvenster ook een bestand uit Drive kiezen.</small></div>
    ${draft.fileName ? '<p class="notice">' + esc(draft.fileName) + ' · ' + (draft.pages?.length ?? 0) + ' deel/delen gelezen</p>' : ''}
    <details><summary>PDF-pagina’s en bronvermelding</summary><div class="stack">
      <p class="muted small-text">Kies desgewenst maximaal 80 PDF-pagina’s vóór je het bestand opent.</p>
      <div class="columns">
        <div class="field"><label for="pdf-start">PDF van pagina</label><input id="pdf-start" name="pdfStart" type="number" min="1" value="${esc(draft.pdfStart ?? 1)}"></div>
        <div class="field"><label for="pdf-end">Tot en met (optioneel)</label><input id="pdf-end" name="pdfEnd" type="number" min="1" value="${esc(draft.pdfEnd)}"></div>
        <div class="field"><label for="import-author">Auteur</label><input id="import-author" name="author" maxlength="120" value="${esc(draft.author)}"></div>
        <div class="field"><label for="import-work">Werk</label><input id="import-work" name="work" maxlength="160" value="${esc(draft.work)}"></div>
        <div class="field"><label for="import-year">Jaar</label><input id="import-year" name="year" maxlength="30" value="${esc(draft.year)}"></div>
        <div class="field"><label for="import-locator">Gedrukte pagina of bronnummer voor geplakte tekst</label><input id="import-locator" name="locator" maxlength="100" value="${esc(draft.locator)}"></div>
      </div>
    </div></details>
    <p id="import-message" class="notice" hidden role="status"></p>
    <div class="row"><button type="submit" class="button primary">Maak oefeningen</button>${draft.fileName ? button('remove-file', 'Bestand verwijderen', 'quiet') : ''}</div>
  </form>`;
}

export function settings(info) {
  const p = info.profile;
  return sectionHeading('meer', 'Beheer je account, meldingen en gegevens.') + `
    <section class="panel stack settings-tools"><h2>Onderzoek en studiegegevens</h2>
      <div class="row"><a class="button quiet" href="#onderzoek">Onderzoek openen</a>
      <a class="button quiet" href="#voortgang">Voortgang</a><a class="button quiet" href="#importeren">Eigen leerstof toevoegen</a></div>
    </section>
    <div class="columns">
      <section class="panel stack">
        <h2>Account</h2><p class="muted">${info.cloud ? 'Je gegevens worden op je toestellen bijgewerkt als je dezelfde aanmelding gebruikt.' :
          'Oefen meteen op dit toestel. Met een cloudaccount neem je je leerstof en voortgang mee.'}</p>
        ${p ? '<p class="small-text"><strong>' + esc(p.name) + '</strong> · ' + (info.cloud ? esc(info.syncLabel) : 'Op dit toestel') + '</p>' : ''}
        <div class="row">${info.cloud ? button('sync', 'Nu bijwerken', 'primary') + button('logout', 'Afmelden', 'quiet') :
          button('auth-mode', 'Maak een account', 'primary', 'signup') + button('account', 'Aanmelden', 'quiet')}</div>
        ${info.profileCount > Number(!!p) ? button('profiles', 'Ander profiel kiezen', 'small quiet') : ''}
      </section>
      <section class="panel stack">
        <h2>App installeren</h2><p class="muted">Zet Athenaeum op je startscherm. Met gedownloade lessen kun je ook zonder verbinding leren.</p>
        <div class="row">${button('install', 'App installeren', 'primary')}${button('offline', 'Lessen downloaden', 'quiet')}</div>
        <p class="muted small-text" id="offline-state">${info.offlineReady ? 'Lessen op dit toestel beschikbaar' : 'Online openen om te downloaden'}</p>
      </section>
      <section class="panel stack">
        <h2><span lang="la">Nuntii</span> · Appmeldingen</h2><p class="muted">Stel herinneringen in voor je volgende studiemoment.</p>
        <div><a class="button quiet" href="#meer/meldingen">Beheer appmeldingen</a></div>
      </section>
      <section class="panel stack">
        <h2>Je gegevens</h2><p class="muted">Maak een back-up van lessen en voortgang of laad een eerdere back-up in.</p>
        <div class="row">${button('export', 'Back-up downloaden', 'quiet')}${button('restore', 'Back-up terugzetten', 'quiet')}</div>
        <input type="file" id="backup-input" accept=".json,application/json" hidden>
        <details><summary>Privacy en gegevens wissen</summary><p class="muted small-text">Ingevoerde tekst wordt op je toestel verwerkt. Als je je aanmeldt, bewaart Athenaeum je oefensets en voortgang bij jouw cloudaccount.</p>
          ${p ? button('clear-data', 'Leergegevens wissen', 'small danger quiet') : ''}</details>
      </section>
    </div>
    <section class="block">
      <form id="paths-form" class="panel stack">
        <h2>Leerpaden voor sneloefeningen</h2><p class="muted">Kies de vakken en talen die je in je sneloefeningen wilt zien.</p>
        <div class="columns">
          ${Object.entries(TRACKS).map(([key, track]) => `<label class="path-check"><input type="checkbox" name="track" value="${key}" ${info.prefs['quick-' + key] !== false ? 'checked' : ''}> ${track.name}</label>`).join('')}
        </div>
        <div><button type="submit" class="button primary">Leerpaden bewaren</button></div>
      </form>
    </section>`;
}

export function notificationTimeRow(id, time = '') {
  return '<div class="reminder-time field">' +
    '<label for="reminder-time-' + id + '">Tijdstip</label>' +
    '<div class="reminder-time-controls"><input id="reminder-time-' + id + '" type="time" name="reminder-time" value="' +
      esc(time) + '" required>' + button('push-remove-time', 'Verwijder', 'quiet', id) + '</div></div>';
}

export function notificationsPage(info) {
  const active = info.setup?.subscription && info.preference;
  let controls;
  if (info.support === 'install') {
    controls = '<p>Voeg Athenaeum via het deelmenu toe aan je beginscherm. Open daarna de webapp en zet hier meldingen aan.</p>';
  } else if (!info.cloud) {
    controls = `<p>Meld je aan om appmeldingen op dit toestel in te stellen.</p><div>${button('account', 'Aanmelden', 'primary')}</div>`;
  } else if (info.support === 'blocked') {
    controls = '<p>Je browser of toestel blokkeert meldingen. Geef Athenaeum toestemming in de meldingsinstellingen en open deze pagina opnieuw.</p>';
  } else if (info.support === 'unsupported') {
    controls = '<p>Deze browser ondersteunt appmeldingen niet. Open Athenaeum in een recente browser.</p>';
  } else if (!info.online) {
    controls = '<p>Verbind met internet om je appmeldingen te beheren.</p>';
  } else if (info.error) {
    controls = `<p>De meldingsinstellingen konden niet worden geladen.</p><div>${button('push-retry', 'Opnieuw proberen', 'primary')}</div>`;
  } else if (!info.setup) {
    controls = '<p role="status">Meldingen voorbereiden…</p>';
  } else if (!info.setup.customSchedule) {
    controls = `<form id="push-form" class="stack">
      <div class="field"><label for="push-frequency">Hoe vaak per dag?</label>
        <select id="push-frequency" name="frequency">${[1, 2, 3].map(count =>
          '<option value="' + count + '"' + (count === (info.preference?.times.length ?? 3) ? ' selected' : '') +
          '>' + count + '× · ' + LEGACY_TIMES.slice(-count).join(' · ') + '</option>').join('')}</select>
      </div>
      <div><button type="submit" class="button primary">${active ? 'Bewaar voorkeur' : 'Zet appmeldingen aan'}</button></div>
    </form>`;
  } else {
    const times = info.preference?.times ?? [''];
    const days = info.preference?.days;
    controls = `<form id="push-form" class="stack">
      <fieldset class="reminder-days"><legend>Dagen</legend>
        <div class="row">${REMINDER_DAYS.map((label, index) => `<label class="reminder-day">
          <input type="checkbox" name="reminder-day" value="${index + 1}" ${!days || days.includes(index + 1) ? 'checked' : ''}>
          <span>${label}</span></label>`).join('')}</div>
      </fieldset>
      <div class="stack">
        <div><h3>Tijdstippen</h3><p class="muted small-text">Voeg een tijdstip toe voor elke melding die je op deze dagen wilt krijgen.</p></div>
        <div id="push-times" class="stack" data-next="${times.length}">${times.map((time, index) => notificationTimeRow(index, time)).join('')}</div>
        <div><button class="button quiet" type="button" data-action="push-add-time" ${times.length >= MAX_REMINDERS ? 'disabled' : ''}>Tijdstip toevoegen</button></div>
      </div>
      <div class="row"><button type="submit" class="button primary">${active ? 'Bewaar planning' : 'Zet appmeldingen aan'}</button></div>
    </form>`;
  }
  if (info.setup && active && info.online && info.support === 'available') controls += `<p class="small-text muted">Appmeldingen staan aan op dit toestel.</p>
    <div class="row">${button('push-test', 'Stuur een testmelding', 'quiet')}${button('push-off', 'Zet uit op dit toestel', 'quiet')}</div>`;
  const description = info.setup?.customSchedule === false ? 'Kies hoeveel appmeldingen je op dit toestel wilt krijgen.' :
    'Kies de dagen, tijden en het aantal appmeldingen op dit toestel.';
  return '<p class="back-link"><a class="text-link" href="#meer">Terug naar Optiones</a></p>' +
    sectionHeading('meldingen', description) + `
    <section class="panel stack notifications-panel">
      <h2>Studieherinneringen</h2>
      <p class="muted">Athenaeum gebruikt de lokale tijd van dit toestel. Na je eerste afgeronde oefening stopt de planning voor die dag.</p>
      ${controls}<p id="push-message" class="notice" role="status" hidden></p>
    </section>`;
}

export function accountDialog(mode, email = '') {
  const signup = mode === 'signup';
  return `<div class="dialog-inner stack"><div class="topline"><h2 id="dialog-title">${signup ? 'Maak een account' : 'Aanmelden'}</h2>
    <button type="button" class="button icon-only" aria-label="Sluiten" data-action="close-dialog">${icon('close')}</button></div>
    <p class="small-text muted">${signup ? 'Kies een wachtwoord van minstens 10 tekens en bevestig daarna je e-mailadres.' : 'Meld je aan om verder te oefenen op je andere toestellen.'}</p>
    <form id="account-form" data-mode="${signup ? 'signup' : 'login'}" class="stack">
      <div class="field"><label for="email">E-mail</label><input id="email" name="email" value="${esc(email)}" type="email" required autocomplete="username"></div>
      <div class="field"><label for="password">Wachtwoord</label><input id="password" name="password" type="password" required ${signup ? 'minlength="10" autocomplete="new-password"' : 'autocomplete="current-password"'}></div>
      <p id="auth-message" class="notice" hidden role="status"></p>
      <button type="submit" class="button primary">${signup ? 'Account maken' : 'Aanmelden'}</button>
    </form>
    <div class="row">
      ${signup ? button('auth-mode', 'Ik heb al een account', 'quiet', 'login') : button('auth-mode', 'Maak een account', 'quiet', 'signup')}
      ${button('close-dialog', 'Verder zonder account', 'quiet')}
    </div>
  </div>`;
}

export function summarizeSession(session) {
  return {
    ...tally(session.questions, session.answers), scoreVersion: SCORE_VERSION, mode: session.mode, title: session.title,
    track: session.track ?? '', back: session.back,
    questions: session.questions.map(({ options, accepted, optionOrder, ...question }) => question), answers: session.answers,
  };
}

export function readingGuidePage(courses, failed) {
  const title = '<p class="back-link"><a class="text-link" href="#paideia/leerplan/alles">Terug naar Curriculum</a></p>' +
    heading('Universitaire studiegids', 'Open een vak voor de bron, het academiejaar en de status van de opgegeven literatuur.');
  if (!courses) return title + (failed ? button('retry-content','Studiegids opnieuw laden','quiet') : '<p role="status" class="content-loading">Studiefiches laden…</p>');
  const institutions = new Map();
  for (const entry of courses) {
    if (!institutions.has(entry.institution)) institutions.set(entry.institution, []);
    institutions.get(entry.institution).push(entry);
  }
  return title + [...institutions].map(([name,rows]) => '<section class="block stack"><h2>' + esc(name) + '</h2>' + rows.map(entry =>
    '<details class="panel"><summary><strong>' + esc(entry.course) + '</strong> · ' + esc(entry.level) + '</summary><div class="stack"><p>' +
    esc(entry.scope) + '</p><p>' + esc(entry.note) + '</p>' + sourceView({author:name,title:'Officiële vak- of programmafiche',url:entry.url}) +
    entry.readings.map(book => '<div><strong>' + esc(book.status) + '</strong> ' + sourceView({...book,locator:[book.edition,book.locator].filter(Boolean).join(' · ')}) + '</div>').join('') +
    '</div></details>').join('') + '</section>').join('');
}
