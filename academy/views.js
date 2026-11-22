import { EXAM_GOALS, formatSource, KINDS, LEVELS, ROUTES, TRACKS, tally } from './learning.js?v=13r1';
import { tipsFor } from './daily.js?v=13r1';
import { instructionFor, PRACTICE_KINDS, practiceOptions, workedExample } from './practice.js?v=13r1';
import { LANGUAGE_TOPICS, isLanguageTopic } from './language-topics.js?v=13r1';
import { EXAM_ICE, EXAM_PASS, MAX_ICE, STARTING_ICE } from './streak.js?v=13r4';
import { NOTIFICATION_TIMES } from './notifications.js?v=13r4';

const SECTION_NAMES = {
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
export const APP_NAV = navigation(['paideia', 'talen', 'scriptorium']);
export const SECONDARY_NAV = navigation(['onderzoek', 'voortgang', 'importeren']);

const TRACK_NAMES = {
  greek: 'Graecia antiqua',
  roman: 'Roma antiqua',
  history: 'Historia generalis',
  knowledge: 'Scientia generalis',
  it: 'Lingua Italiana',
  fr: 'Lingua Francogallica',
};

const icons = {
  home: '<path d="M3 11 12 3l9 8v9a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
  greek: '<path d="M3 8l9-5 9 5v2H3zm2 4v6m14-6v6m-9-6v6m4-6v6M3 21h18"/>',
  roman: '<path d="M3 21h18M5 21v-9a7 7 0 0 1 14 0v9M9 21v-8a3 3 0 0 1 6 0v8M3 7h18"/>',
  language: '<path d="M3 4h13v10H9l-4 3v-3H3zm14 4h4v11h-2v2l-3-2h-4v-3"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18m-9-9c5 5 5 13 0 18-5-5-5-13 0-18z"/>',
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

function card(track, lessons, info) {
  const model = TRACKS[track];
  const count = lessons.filter(lesson => lesson.track === track).length;
  return `<a class="panel track-card" href="#${model.section === 'history' ? 'paideia' : 'talen'}/${track}">
    ${trackIcon(track)}
    <div><h3 lang="la">${TRACK_NAMES[track]}</h3><p class="track-meaning">${model.name}</p></div>
    <p class="muted small-text">${model.desc}</p>
    <span class="caption">${count} lessen${info ? ' · ' + esc(info) : ''}</span>
  </a>`;
}

function metrics(overview) {
  return `<div class="metrics">
    <div class="metric"><strong>${overview.today}</strong><span>Vandaag geoefend</span></div>
    <div class="metric"><strong>${overview.due}</strong><span>Klaar voor herhaling</span></div>
    <div class="metric"><strong>${overview.goals}</strong><span>Leerdoelen geoefend</span></div>
  </div>`;
}

function unit(lesson, studied) {
  const info = [lesson.period, lesson.level, ROUTES[lesson.route]].filter(Boolean).join(' · ');
  const search = [lesson.title, lesson.period, lesson.summary, ...lesson.items.map(item => item.label)]
    .filter(Boolean).join(' ').toLocaleLowerCase('nl').normalize('NFD').replace(/\p{M}/gu,'');
  return `<a class="unit" data-unit-search="${esc(search)}" href="#les/${esc(lesson.id)}">
    ${trackIcon(lesson.track)}<div><h3>${esc(lesson.title)}</h3>${info ? '<small>' + esc(info) + '</small>' : ''}</div>
    <span class="unit-trailing">${studied.has(lesson.id) ? 'Geoefend' : lesson.items.length + ' leerdoelen'}</span>
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
      <div class="hero-mark" aria-hidden="true"><img src="./assets/logos/athenaeum-192.png" alt="" width="146" height="146"></div>
    </section>
    ${streakPanel(info.streak)}
    <section class="block" aria-label="Voortgang vandaag">${metrics(info)}</section>
    <section class="block">
      <div class="topline"><h2>Jouw leerpaden</h2><div class="row">
        <a class="text-link" href="#voortgang">Bekijk voortgang</a>
        <a class="button small quiet" href="#onderzoek">Onderzoek openen</a>
      </div></div>
      <div class="columns three">${['greek', 'roman', 'history', 'knowledge', 'it', 'fr'].map(key =>
        card(key, info.lessons, TRACKS[key].section === 'language' ? info.prefs[key] ?? 'A1' : '')).join('')}</div>
    </section>
    ${info.next.length ? '<section class="block"><div class="topline"><h2>Een volgende les</h2></div><div class="unit-list">' +
      info.next.map(lesson => unit(lesson, info.studied)).join('') + '</div></section>' : ''}`;
}

export function catalogue(section, lessons) {
  const language = section === 'talen';
  const desc = language ? 'Kies een taal en oefen woorden, grammatica en zinnen die je meteen kunt gebruiken.' :
    'Bouw kennis op met lessen, oefeningen en bronnen. Verdiep je in de oudheid of verbind grotere historische ontwikkelingen.';
  return sectionHeading(section, desc) +
    `<div class="columns ${language ? 'language-catalogue' : ''}">${(language ? ['it','fr'] : ['greek','roman','history','knowledge']).map(track => card(track, lessons)).join('')}</div>`;
}

export function course(track, lessons, studied, prefs, route, search = '', topic = '') {
  const model = TRACKS[track];
  const language = model.section === 'language';
  const level = prefs[track] ?? 'A1';
  if (language && isLanguageTopic(track, topic)) return topicPage(track, topic, lessons, studied);
  const all = lessons.filter(lesson => lesson.track === track && (!language || !lesson.languageTopic));
  const shown = language ? all.filter(lesson => lesson.level === level && (!route || route === lesson.route)) : all;
  const routes = [...new Set(all.filter(lesson => lesson.level === level).map(lesson => lesson.route))].filter(r => ROUTES[r]);
  const next = shown.find(lesson => !studied.has(lesson.id)) ?? shown[0];
  return heading(TRACK_NAMES[track], model.desc, model.name, 'la') +
    (language ? topicCards(track, lessons) + '<section class="block"><div class="topline"><h2>Algemene lessen per niveau</h2></div></section>' : '') + `
    <section class="panel stack course-start">
      <div><h2>${next ? esc(next.title) : 'Aan de slag'}</h2>
        <p class="muted">${next ? 'Lees de uitleg, bekijk een uitgewerkt voorbeeld en oefen de kern in maximaal zes vragen.' :
          'Kies hieronder een ander niveau of een andere leersituatie.'}</p></div>
      <div class="row">
        ${next ? '<a class="button primary" href="#les/' + esc(next.id) + '">Open les</a>' +
          button('drill', 'Oefen 5 vragen', '', track + '/5') : ''}
        ${language ? button('placement', 'Bepaal je niveau', 'quiet', track) : ''}
      </div>
      <details><summary>Meer oefenopties</summary><div class="row">
        ${next ? button('quick-track', 'Sneloefening · 2 min', 'quiet', track) +
          button('drill', 'Oefen 15 vragen', 'quiet', track + '/15') +
          button('drill', 'Oefen 30 vragen', 'quiet', track + '/30') : ''}
        <a class="button quiet" href="#importeren/${track}">Eigen leerstof toevoegen</a>
      </div></details>
    </section>
    ${language ? `<section class="block stack">
      <div class="row" aria-label="Taalniveau">${LEVELS.map(l => `<button type="button" class="chip" data-action="level" data-value="${track}/${l}" aria-pressed="${level === l}">${l}</button>`).join('')}</div>
      <div class="row" aria-label="Leersituatie">${['', ...routes].map(r => `<button type="button" class="chip outline" data-action="route-filter" data-value="${r}" aria-pressed="${route === r}">${r ? ROUTES[r] : 'Alle situaties'}</button>`).join('')}</div>
    </section>` : ''}
    <section class="block">
      <div class="topline"><h2>${language ? 'Lessen op ' + level : 'Lessen'}</h2><p class="muted small-text" id="lesson-count" aria-live="polite">${shown.length} lessen</p></div>
      <div class="field course-search"><label for="course-search">Zoek in dit leerpad</label>
        <input type="search" id="course-search" value="${esc(search)}" placeholder="Titel, datering of begrip"></div>
      <p class="empty" id="lesson-no-match" ${shown.length ? 'hidden' : ''}>Geen lessen met deze keuze. Pas je zoekterm of filter aan.</p>
      <div class="unit-list">${shown.map(lesson => unit(lesson, studied)).join('')}</div>
    </section>`;
}

export function lessonPage(lesson) {
  if (lesson.languageTopic) return languageLessonPage(lesson);
  const courseHref = TRACKS[lesson.track].section === 'history' ? 'paideia' : 'talen';
  return `<p><a class="text-link" href="#${courseHref}/${lesson.track}">${TRACKS[lesson.track].name}</a></p>
    <div class="block"><br>${heading(lesson.title, '', [lesson.period, lesson.level, ROUTES[lesson.route]].filter(Boolean).join(' · '))}</div>
    <article class="panel stack">
      <h2>Uitleg</h2>
      <div class="lesson-copy">${String(lesson.summary ?? '').split(/\n\s*\n/).filter(Boolean).map(p => '<p>' + esc(p) + '</p>').join('')}</div>
      ${exampleView(workedExample(lesson))}
      ${lesson.dialogue?.length ? `<div class="dialogue"><h3>Dialoog</h3>${lesson.dialogue.map((line, i) => `<div class="dialogue-line">
        <div class="row"><p lang="${esc(lesson.track)}"><strong>${esc(line.speaker)}</strong> · ${esc(line.text)}</p>
        ${button('speak-line', 'Luister', 'small quiet', lesson.id + '/' + i)}</div><p class="muted small-text">${esc(line.translation)}</p>
      </div>`).join('')}</div>` : ''}
      ${lesson.sources?.length ? `<details><summary>Bronnen</summary><div class="stack">${lesson.sources.map(sourceView).join('')}</div></details>` : ''}
    </article>
    <section class="block"><div class="topline"><h2>Kernbegrippen</h2></div><div class="unit-list">
      ${lesson.items.map((item, index) => `<details ${index === 0 ? 'open' : ''}><summary>${esc(item.label)}</summary><p>${esc(item.explanation)}</p>${sourceView(lesson.sources?.[item.source ?? (TRACKS[lesson.track].section !== 'language' ? 0 : -1)])}</details>`).join('')}
    </div></section>
    <section class="panel block stack lesson-practice">
      <h2>Oefenen</h2>
      <p class="muted">Begin met korte vragen. Gebruik een tip wanneer je vastloopt en bekijk de uitleg bij elk antwoord.</p>
      <div class="row">${button('lesson-quiz', 'Start korte oefenreeks', 'primary', lesson.id)}
        ${button('lesson-more', 'Meer oefeningen', '', lesson.id)}</div>
    </section>
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

function topicPage(track, topic, lessons, studied) {
  const theme = LANGUAGE_TOPICS[track][topic];
  const shown = lessons.filter(lesson => lesson.track === track && lesson.languageTopic === topic);
  return `<p class="back-link"><a class="text-link" href="#talen/${track}">Terug naar ${TRACKS[track].name}</a></p>` +
    heading(theme.title, theme.text, TRACKS[track].name) + `
    <section class="unit-list topic-units" aria-label="Lessen over ${esc(theme.title)}">${shown.map(lesson => unit(lesson, studied)).join('')}</section>`;
}

export function languageGrammar(lesson) {
  const { grammar } = lesson;
  if (!grammar) return '';
  return `<div class="grammar-example stack">
    <h3>${esc(grammar.title)}</h3><p>${esc(grammar.rule)}</p>
    <p lang="${esc(lesson.track)}"><strong>${esc(grammar.example)}</strong></p><p class="muted">${esc(grammar.translation)}</p>
    ${button('speak-grammar', 'Luister naar het voorbeeld', 'small quiet', lesson.id)}</div>`;
}

export function languageVocabulary(lesson, limit) {
  const words = limit ? lesson.vocabulary.slice(0, limit) : lesson.vocabulary;
  return `<dl class="word-list">${words.map(([term, meaning], index) => `<div class="word-row">
    <dt lang="${esc(lesson.track)}">${esc(term)}</dt><dd>${esc(meaning)}</dd>
    <button class="button icon-only audio-word" type="button" data-action="speak-vocab" data-value="${esc(lesson.id)}/${index}" aria-label="Luister naar ${esc(term)}">${icon('volume')}</button></div>`).join('')}</dl>`;
}

function languageLessonPage(lesson) {
  const { track, id, languageTopic, dialogue } = lesson;
  return `<p class="back-link"><a class="text-link" href="#talen/${track}/${esc(languageTopic)}">
    ${esc(LANGUAGE_TOPICS[track][languageTopic].title)}</a></p>` +
    heading(lesson.title, lesson.summary, TRACKS[track].name + ' · ' + lesson.level) + `
    <section class="panel course-start row language-actions" aria-label="Oefenen">
      ${button('language-practice', 'Woordenschat oefenen', 'primary', id + '/vocabulary')}
      ${button('language-practice', 'Grammatica oefenen', '', id + '/grammar')}
      ${button('language-practice', track === 'it' ? 'Spreken en zinnen maken' : 'Zinnen maken', '', id + '/sentence')}
    </section>
    <div class="language-lesson-grid block">
      <section class="panel stack"><h2>Woordenschat</h2>${languageVocabulary(lesson)}</section>
      <div class="stack language-lesson-aside">
        <section class="panel stack"><h2>Grammatica</h2>${languageGrammar(lesson)}</section>
        <section class="panel stack"><h2>In gesprek</h2>
          ${dialogue.map((line, i) => `<div class="dialogue-line stack"><p lang="${esc(track)}"><strong>${esc(line.text)}</strong></p>
            <p class="muted">${esc(line.translation)}</p>
            <div>${button('speak-line', 'Luister', 'small quiet', id + '/' + i)}</div></div>`).join('')}
        </section>
        ${lesson.sources.length ? `<section class="panel stack"><h2>Bron</h2>${lesson.sources.map(sourceView).join('')}</section>` : ''}
      </div>
    </div>`;
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

export function outcomes(rows, emptyText) {
  return rows.length ? `<div class="unit-list">${rows.map(row => `<a class="unit" href="#resultaat/${esc(row.id)}">${icon('check')}
    <div><h3>${esc(row.data.title)}</h3><small>${examDate(row.at)}</small></div>
    <span class="unit-trailing">${row.data.reviewed < row.data.total ? 'Correctie open' : esc(row.data.correct + ' / ' + row.data.total)}</span>
  </a>`).join('')}</div>` : `<p class="empty">${esc(emptyText)}</p>`;
}

export function exams(info) {
  return sectionHeading('toetsen', 'Bereid je voor met een korte oefentoets of kies een toets over behandelde leerstof uit Paideia.') + `
    <section class="panel course-start stack">
      <h2>Oefentoets</h2><p>Probeer maximaal vijf voorbeeldvragen. Je kunt tips gebruiken en krijgt na elke vraag de uitwerking. Je kunt meteen beginnen.</p>
      <div>${button('exam-practice', 'Start oefentoets', 'primary')}</div>
    </section>
    <div class="columns block">
      <section class="panel stack"><h2>Weekexamen</h2><p class="muted">Tot 10 vragen · 45 minuten. Beschikbaar na ${EXAM_GOALS.week} geoefende leerdoelen uit Paideia.</p>
        <p class="exam-ice">🧊 +${EXAM_ICE.week} ijsklontje bij ${EXAM_PASS}% of meer, eenmaal per week.</p>
        ${button('exam', 'Bekijk weekexamen', '', 'week')}</section>
      <section class="panel stack"><h2>Maandtoets</h2><p class="muted">Tot 18 vragen · 75 minuten. Beschikbaar na ${EXAM_GOALS.month} geoefende leerdoelen uit Paideia.</p>
        <p class="exam-ice">🧊 +${EXAM_ICE.month} ijsklontjes bij ${EXAM_PASS}% of meer, eenmaal per maand.</p>
        ${button('exam', 'Bekijk maandtoets', '', 'month')}</section>
    </div>
    <section class="block"><div class="topline"><h2>Vorige toetsen</h2></div>${outcomes(info.results.filter(row => row.data.mode === 'exam'), 'Je hebt nog geen toets afgerond.')}</section>`;
}

export function progressPage(info) {
  return sectionHeading('voortgang', 'Bekijk wat je al hebt geoefend en welk leerpad klaarstaat voor herhaling.') +
    `<div class="panel">${metrics(info)}<p class="small-text muted">${info.days} ${info.days === 1 ? 'dagles' : 'daglessen'} afgerond · <a class="text-link" href="#dagles">Daglessen openen</a></p></div>
    ${streakPanel(info.streak, true)}<section class="block">
      <div class="topline"><h2>Per leerpad</h2></div>
      <div class="columns">${Object.keys(TRACKS).map(track => `<div class="panel stack">
        <div class="path-head">${trackIcon(track)}<div><h3>${TRACKS[track].name}</h3><p class="muted small-text">${info.byTrack[track].goals} geoefend · ${info.byTrack[track].due} klaar</p></div></div>
        ${info.byTrack[track].due ? button('quick-track', 'Herhaal nu', 'small', track) : ''}
      </div>`).join('')}</div>
    </section><section class="block"><div class="topline"><h2>Recente sessies</h2></div>${outcomes(info.results, 'Je eerste afgeronde sessie verschijnt hier.')}</section>`;
}

export function quizIntro(session) {
  const placement = session.mode === 'placement';
  const exam = session.mode === 'exam';
  const count = session.questions.length;
  const { topic, explanation, example } = session.guide ?? {};
  const description = placement
    ? 'Je begint op A1. De vragen gaan omhoog tot je een niveau nog moeilijk vindt. Je krijgt een startadvies en kiest zelf je niveau.'
    : exam ? 'Lees elke vraag rustig. Een open antwoord kun je na afloop beoordelen met de uitwerking en de criteria.'
      : 'Bekijk het voorbeeld. Daarna ga je zelf aan de slag met tips en uitleg bij je antwoorden.';
  return `<div class="quiz"><section class="panel stack quiz-intro" aria-labelledby="quiz-title">
    <p class="eyebrow">Voor je begint</p>
    <div><h1 id="quiz-title">${esc(session.title)}</h1><p class="muted">${description}</p></div>
    <div class="row"><span class="chip">${placement ? 'Maximaal ' : ''}${count} ${count === 1 ? 'vraag' : 'vragen'}</span>
      ${exam ? '<span class="chip">' + esc(session.duration) + ' minuten</span>' :
        placement ? '<span class="chip">Lezen en invullen</span>' : '<span class="chip">Op eigen tempo</span>'}</div>
    ${exam ? '<p>De tijd begint wanneer je op Start toets drukt. Na afloop kun je alle antwoorden bekijken.</p>' : ''}
    ${(topic || explanation) && !exam && !placement ? '<div class="stack">' + (topic ? '<h2>' + esc(topic) + '</h2>' : '') +
      (explanation ? '<p>' + esc(explanation) + '</p>' : '') + '</div>' : ''}
    ${exampleView(example)}
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
  return `<div class="quiz">
    <div class="quiz-top"><div><p class="eyebrow">${esc(session.title)}</p><span class="quiz-count">Vraag ${index + 1} van ${count}</span></div>
      <div class="row">${session.deadline ? '<span class="chip quiz-timer" id="timer"></span>' : ''}${button('pause', 'Pauzeren', 'small quiet')}</div></div>
    <div class="progress" role="progressbar" aria-label="Sessievoortgang" aria-valuenow="${index + 1}" aria-valuemin="0" aria-valuemax="${count}">
      <div style="width:${(index + Number(!!answered)) / count * 100}%"></div></div>
    <div class="panel question stack">
      <div>${!formal && q.title && q.title !== session.title ? '<p class="muted small-text quiz-topic">' + esc(q.title) + '</p>' : ''}
        <span class="chip">${format}</span><h1>${esc(q.text)}</h1></div>
      ${q.context ? '<p class="question-context">' + esc(q.context) + '</p>' : ''}
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
          <b aria-hidden="true">${'ABCD'.charAt(i) || i + 1}</b><span>${esc(option)}</span></button>`).join('')}</div>` : ''}
      ${interactive ? '<div class="practice-controls stack">' + practiceControls(q, session) + '</div>' : ''}
      ${!choice && !interactive ? `<div class="field answer-field"><label for="answer">Jouw antwoord</label>
        ${multiline ? `<textarea class="answer-input" id="answer" rows="${q.kind === 'open' ? 3 : 2}" maxlength="3000"${fieldAttributes}>${esc(selected)}</textarea>` :
        `<input type="text" id="answer" maxlength="300" value="${esc(selected)}" enterkeyhint="done"${fieldAttributes}>`}</div>` : ''}
      ${canTypeOrder && !answered ? '<div>' + button('toggle-type-order', typeOrder ? 'Gebruik woordblokken' : 'Typ de zin zelf', 'small quiet') + '</div>' : ''}
      ${session.retry && !answered ? `<div class="notice retry stack" tabindex="-1" role="status">
        <strong>Probeer nog eens</strong>
        <p>${session.retry === 'accent' ? 'De letters kloppen. Let nog op de accenten.' : q.kind === 'match'
          ? 'Een of meer koppelingen komen nog niet overeen.' : esc(hints[0] ?? 'Lees de opgave nog eens rustig.')}</p></div>` : ''}
      ${!answered && hints.length ? `<div class="quiz-hints stack">
        ${visibleHints ? '<ol class="hint-list" tabindex="-1" aria-label="Tips bij deze vraag">' + hints.slice(0, visibleHints).map(h => '<li>' + esc(h) + '</li>').join('') + '</ol>' : ''}
        ${visibleHints < hints.length ? '<div class="row">' +
          (visibleHints < hints.length - 1 ? button('hint', visibleHints ? 'Een tweede tip' : 'Geef een tip', 'small quiet') : '') +
          button('hint', 'Bekijk uitleg', 'small quiet', 'full') + '</div>' : ''}
      </div>` : ''}
      ${answered && !formal ? answerFeedback(q, answered) : ''}
      <div class="quiz-actions">
        ${formal ? button('skip-question', 'Overslaan', 'quiet') + button('submit-answer', index + 1 === count ? 'Indienen' : 'Volgende vraag', 'primary') : ''}
        ${!formal && !answered ? (isCard ? button('reveal', 'Bekijk de uitwerking', 'quiet') :
          button('skip-question', 'Bekijk de uitwerking', 'quiet')) +
          button('submit-answer', q.kind === 'open' || isCard ? 'Vergelijk mijn antwoord' : 'Controleer', 'primary') : ''}
        ${!formal && answered && !answered.rating ? (q.kind === 'open' || isCard ?
          button('rate', 'Nog oefenen', '', 'again') +
          button('rate', q.kind === 'open' ? 'Voldoet aan de criteria' : 'Ik had het goed', 'primary', 'good') : '') : ''}
        ${!formal && answered?.rating ? button('next-question', index + 1 === count ? 'Afronden' : 'Volgende vraag', 'primary') : ''}
      </div>
    </div>
  </div>`;
}

function answerFeedback(q, answer, result = '') {
  const feedback = q.feedback || q.explanation;
  const matches = q.kind === 'match';
  return `<div class="feedback stack ${answer.rating === 'again' ? 'again' : ''}" tabindex="-1" role="status">
    <h3>${answer.rating === 'again' ? 'Bekijk de uitwerking' : answer.rating === 'help' ? 'Goed met hulp' : answer.rating ? 'Goed' : 'Modelantwoord'}</h3>
    ${matches ? `<ul class="match-feedback">${q.pairs.map((pair, i) => {
      const selected = q.pairs[answer.selection?.[i]];
      return `<li><strong>${esc(pair.prompt)}</strong><p>${esc(pair.answer)}</p>
        ${selected && selected !== pair ? '<p class="small-text">Jouw keuze · ' + esc(selected.answer) + '</p>' : ''}
        ${pair.note ? '<p class="small-text">' + esc(pair.note) + '</p>' : ''}
        ${sourceView(pair.source)}</li>`;
    }).join('')}</ul>` : '<p class="model-answer">' + esc(q.answer) + '</p>'}
    ${!matches && answer.rating === 'again' && answer.response ? '<p class="small-text">Jouw antwoord · ' + esc(answer.response) + '</p>' : ''}
    ${!matches && feedback && feedback !== q.answer ? '<div><h3>Uitleg</h3><p>' + esc(feedback) + '</p></div>' : ''}
    ${q.criteria?.length ? '<div><h3>Waarop let je?</h3><ul>' + q.criteria.map(text => '<li>' + esc(text) + '</li>').join('') + '</ul></div>' : ''}
    ${matches ? '' : sourceView(q.source)}${q.audio ?
      button(result ? 'result-listen' : 'listen', 'Luister naar het antwoord', 'small quiet', result) : ''}
  </div>`;
}

export function resultPage(id, data, reward = 0) {
  const placement = data.mode === 'placement';
  const practice = !placement && data.mode !== 'exam';
  const assisted = data.answers.filter(answer => answer?.rating === 'help').length;
  const revisit = practice && data.answers.some(answer => ['again','help'].includes(answer?.rating));
  return heading(placement ? 'Jouw startniveau' : data.title, placement ? 'Deze korte leestoets geeft een richtpunt. Je kunt daarna zelf een niveau kiezen.' : '') + `
    <section class="panel stack">
      ${placement ? '<h2>' + esc(data.estimate.recommended) + '</h2><div class="row">' + data.estimate.rows.filter(row => row.total).map(row => '<span class="chip">' + esc(row.level) + ' · ' + esc(row.correct) + '/' + esc(row.total) + '</span>').join('') + '</div>' :
        '<h2>' + esc(data.correct - (practice ? assisted : 0)) + ' van ' + esc(data.total) + (practice ? ' op eigen kracht' : ' goed') + '</h2>' +
        (practice && assisted ? '<p>' + assisted + (assisted === 1 ? ' vraag goed' : ' vragen goed') + ' met hulp.</p>' : '') +
        (data.reviewed < data.total ? '<p class="muted">Beoordeel hieronder de open antwoorden om je resultaat af te werken.</p>' : '')}
      ${reward ? `<p class="exam-ice">🧊 Je hebt ${reward} ${reward === 1 ? 'ijsklontje' : 'ijsklontjes'} verdiend!</p>` : ''}
      <div class="row">
        ${placement ? button('use-level', 'Kies ' + data.estimate.recommended, 'primary', data.track + '/' + data.estimate.recommended) :
          (revisit ? button('practice-again', 'Oefen lastige vragen opnieuw', 'primary', id) : '') +
          '<a class="button ' + (revisit ? 'quiet' : 'primary') + '" href="#' + esc(data.back || 'vandaag') + '">' +
          (data.back === 'scriptorium/oefenen' ? 'Terug naar het Oefenatelier' : data.back && data.back !== 'vandaag' ?
            'Terug naar het overzicht' : 'Naar Vandaag') + '</a><a class="button quiet" href="#voortgang">Voortgang</a>'}
      </div>
    </section>
    <section class="block"><div class="topline"><h2>Correctie</h2></div><div class="unit-list">${data.questions.map((q, i) => {
      const answer = data.answers[i] ?? {};
      return `<details ${!answer.rating && data.mode === 'exam' ? 'open' : ''}><summary>${esc(q.text)}</summary>
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
  const classic = p ? './classic.html?resume=1&amp;profile=' + encodeURIComponent(p.id) : './classic.html';
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
        <h2>Leerpaden voor /leer</h2><p class="muted">Kies de vakken en talen die je in je sneloefeningen wilt zien.</p>
        <div class="columns">
          ${Object.entries(TRACKS).map(([key, track]) => `<label class="path-check"><input type="checkbox" name="track" value="${key}" ${info.prefs['quick-' + key] !== false ? 'checked' : ''}> ${track.name}</label>`).join('')}
        </div>
        <div><button type="submit" class="button primary">Leerpaden bewaren</button></div>
      </form>
    </section>
    <section class="block"><a class="text-link" href="${classic}">Athenaeum Classicum · Klassieke omgeving</a></section>`;
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
  } else {
    controls = `<form id="push-form" class="stack">
      <div class="field"><label for="push-frequency">Hoe vaak per dag?</label>
        <select id="push-frequency" name="frequency">${[1, 2, 3].map(count => {
          const times = NOTIFICATION_TIMES.slice(-count).join(' · ');
          return `<option value="${count}" ${count === (info.preference?.count ?? 3) ? 'selected' : ''}>${count}× · ${times} uur</option>`;
        }).join('')}</select>
      </div>
      <div class="row"><button type="submit" class="button primary">${active ? 'Bewaar voorkeur' : 'Zet appmeldingen aan'}</button></div>
    </form>${active ? `<p class="small-text muted">Appmeldingen staan aan op dit toestel.</p><div class="row">
      ${button('push-test', 'Stuur een testmelding', 'quiet')}${button('push-off', 'Zet uit op dit toestel', 'quiet')}
    </div>` : ''}`;
  }
  return '<p class="back-link"><a class="text-link" href="#meer">Terug naar Optiones</a></p>' +
    sectionHeading('meldingen', 'Kies hoeveel appmeldingen je op dit toestel wilt krijgen.') + `
    <section class="panel stack notifications-panel">
      <h2>Studieherinneringen</h2>
      <p class="muted">Op dagen zonder afgeronde oefening krijg je speelse herinneringen op de lokale tijd van dit toestel.</p>
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
    ...tally(session.questions, session.answers), mode: session.mode, title: session.title, track: session.track ?? '', back: session.back,
    questions: session.questions.map(({ options, accepted, optionOrder, ...question }) => question), answers: session.answers,
  };
}
