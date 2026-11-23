import { LANGUAGE_TOPICS } from './language-topics.js?v=14r1';

const nameFor = { la: 'Latijn', grc: 'Oudgrieks' };
const esc = value => String(value ?? '').replace(/[&<>"']/gu, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const lessonHref = id => '#les/' + encodeURIComponent(id);
const action = (name, label, value, main = false) => '<button type="button" class="button ' + (main ? 'primary' : 'quiet') + '" data-action="' + name + '" data-value="' + esc(value) + '">' + esc(label) + '</button>';
function sourceLink(s) {
  const label = [s.author, s.title, s.year, s.locator].filter(Boolean).join(' · ');
  return /^https:\/\//.test(s.url) ? '<a class="source" target="_blank" rel="noopener noreferrer" href="' + esc(s.url) + '">' + esc(label) + '</a>' : '<span class="source">' + esc(label) + '</span>';
}

const readings = {
  faculty: {
    author:'Universiteit Gent', title:'Bachelor taal- en letterkunde, Latijn–Grieks', year:'2026–2027',
    locator:'Programma, Taalbeheersing I en II en de lectuurvakken',
    url:'https://studiekiezer.ugent.be/2026/bachelor-of-arts-in-de-taal-en-letterkunde-latijn-grieks-ABTALKLG/programma',
  },
  la: {author:'KU Leuven',title:'Klassiek Latijn: taalverwerving',locator:'Studiemateriaal in de oudere fiche F0AK4BN',url:'https://onderwijsaanbod.kuleuven.be/syllabi/n/F0AK4BN'},
  grc: {author:'KU Leuven',title:'Klassiek Grieks taalverwerving, deel 1',locator:'F0ZG7AN, Inhoud en Studiemateriaal',url:'https://onderwijsaanbod.kuleuven.be/syllabi/n/F0ZG7AN'},
};

export function classicalCourse(track, lessons, studied = new Set(), topic = '') {
  const list = lessons.filter(l => l.track === track);
  const core = list.filter(l => l.classical);
  const groups = LANGUAGE_TOPICS[track];
  const active = Object.hasOwn(groups, topic) ? topic : '';
  const units = active ? core.filter(l => l.languageTopic === active) : core;
  const next = units.find(l => !studied.has(l.id));
  const blocks = Object.entries(groups).filter(([id]) => !active || active === id).map(([id,g]) => {
    const members = core.filter(l => l.languageTopic === id);
    const worked = members.filter(l => studied.has(l.id)).length;
    return '<section class="panel stack classical-module"><div class="topline"><h2>' + esc(g.title) + '</h2><span class="muted small-text">' + worked + ' / ' + members.length + ' geoefend</span></div>' +
      '<p>' + esc(g.text) + '</p><ol class="classical-units">' + members.map(l => '<li><a href="' + lessonHref(l.id) + '">' + esc(l.title) + '</a>' +
        (studied.has(l.id) ? ' <span class="small-text muted">Geoefend</span>' : '') + '</li>').join('') + '</ol></section>';
  }).join('');
  const own = list.filter(l => !l.classical);
  return '<p class="back-link"><a class="text-link" href="#talen' + (active ? '/' + track : '') + '">' + (active ? nameFor[track] : 'Linguae · Talen') + '</a></p>' +
    '<div class="headline"><p class="eyebrow" lang="la">' + (track === 'la' ? 'Lingua Latina' : 'Lingua Graeca antiqua') + '</p><h1>' + esc(active ? groups[active].title : nameFor[track]) +
    '</h1><p>' + (track === 'la' ? 'Van de letters op een Romeinse inscriptie tot een eigen vertaling van Caesar, Cicero en Vergilius.' : 'Leer het Griekse alfabet, bouw Attische zinnen op en lees daarna proza, epos en koinè.') +
    '</p></div><section class="panel stack course-start"><div><h2>' + esc(next?.title ?? 'Verder oefenen') + '</h2><p class="muted">' +
    (next ? 'Je volgende les in dit leerpad.' : 'Keer terug naar een passage of herhaal woorden en vormen uit de afgelegde lessen.') + '</p></div><div class="row">' +
    (next ? '<a href="' + lessonHref(next.id) + '" class="button primary">Open les</a>' : '') + action('quick-track','Korte herhaling',track) +
    '<a class="text-link" href="#voortgang">Mijn voortgang</a></div></section><div class="classical-modules block">' + blocks + '</div>' +
    (own.length ? '<section class="panel block stack"><h2>Eigen lessen</h2>' + own.map(l => '<a class="text-link" href="' + lessonHref(l.id) + '">' + esc(l.title) + '</a>').join('') + '</section>' : '') +
    '<details class="block panel"><summary>Universitaire cursusfiches en leermiddelen</summary><div class="stack"><p>' +
    (track === 'la' ? 'De oudere Leuvense studiefiche noemt Dirk Panhuis, Latijnse grammatica (2005) als studiemateriaal. Voor de uitleg in deze lessen verwijzen we naar de vrij raadpleegbare referentiegrammatica van Allen en Greenough.' :
      'De Leuvense cursus begint met alfabet en basisvormen en werkt via oefeningen naar vereenvoudigd proza. De fiche vermeldt materiaal van de docent. Onze aanvullende referentie is Ancient Greek for Everyone van Major en Laughy.') +
    '</p>' + sourceLink(readings.faculty) + sourceLink(readings[track]) + '</div></details>';
}

export function classicalLesson(lesson, lessons = []) {
  const { track, languageTopic: topic, id, reading, title } = lesson;
  const group = LANGUAGE_TOPICS[track][topic];
  const units = lessons.filter(l => l.track === track && l.classical);
  const index = units.findIndex(l => l.id === id);
  const next = index >= 0 ? units[index+1] : null;
  const previous = index > 0 ? units[index-1] : null;
  const related = lessons.find(l => l.id === lesson.historyLink);
  return '<p class="back-link"><a class="text-link" href="#talen/' + track + '">' + nameFor[track] + '</a> · <a class="text-link" href="#talen/' + track + '/' + topic + '">' + esc(group.title) + '</a></p>' +
    '<div class="headline"><p class="eyebrow">' + esc(group.title) + '</p><h1>' + esc(title) + '</h1></div>' +
    '<article class="panel stack classical-reading"><h2>Lees en onderzoek</h2>' + lesson.summary.split('\n\n').map(p => '<p>' + esc(p) + '</p>').join('') +
    '<figure><figcaption>' + (reading.original ? 'Bronpassage' : 'Oefentekst') + '</figcaption><blockquote lang="' + track + '">' + esc(reading.line) + '</blockquote></figure>' +
    '<details><summary>Bekijk de ontleding en vertaling</summary><div class="stack"><p>' + esc(reading.analysis) + '</p><p><strong>Mogelijke vertaling</strong> · ' + esc(reading.nl) + '</p></div></details></article>' +
    '<section class="panel block stack"><h2>' + (lesson.letters ? 'Letters oefenen' : 'Woorden in hun context') + '</h2><dl class="classical-words">' +
    lesson.vocabulary.map(([term,meaning,context]) => '<div><dt lang="' + track + '">' + esc(term) + '</dt><dd>' + esc(meaning) + (context ? '<small lang="' + track + '">' + esc(context) + '</small>' : '') + '</dd></div>').join('') +
    '</dl></section><section class="panel block stack"><h2>Zelf oefenen</h2><div class="row">' +
    action('language-practice', lesson.letters ? 'Herken en schrijf' : 'Woordenschat',id+'/vocabulary',true) + action('language-practice','Vormen ontleden',id+'/grammar') +
    action('language-practice',lesson.letters ? 'Schrift toepassen' : 'Zelf vertalen',id+'/sentence') + '</div></section>' +
    '<details class="panel block"><summary>Bronnen bij deze les</summary><div class="stack">' + lesson.sources.map(sourceLink).join('') + '</div></details>' +
    (related ? '<p class="block"><a class="text-link" href="' + lessonHref(related.id) + '">Historische context · ' + esc(related.title) + '</a></p>' : '') +
    '<nav class="row block" aria-label="Verder in het taaltraject">' + (previous ? '<a class="button quiet" href="' + lessonHref(previous.id) + '">Vorige les</a>' : '') +
    (next ? '<a class="button" href="' + lessonHref(next.id) + '">Volgende les</a>' : '<a class="button" href="#talen/' + track + '">Terug naar het leerpad</a>') + '</nav>';
}

const greekLetters = [...'αβγδεζηθικλμνξοπρσςτυφχψω'];
const marks = [['\u0313','Spiritus lenis'],['\u0314','Spiritus asper'],['\u0301','Acuut'],['\u0300','Gravis'],['\u0342','Circumflex'],['\u0345','Iota subscriptum'],['\u0308','Trema']];
export function greekKeyboard() {
  const key = (value,label) => '<button type="button" class="button small quiet" data-greek-key="' + esc(value) + '" aria-label="' + esc(label) + '">' + esc(label) + '</button>';
  return '<details class="greek-keyboard"><summary>Grieks toetsenbord</summary><p class="muted small-text">Kies eerst een letter en voeg daarna het ademteken of accent toe.</p><div class="row">' +
    greekLetters.map(l => key(l,l)).join('') + '</div><div class="row">' + marks.map(([v,n]) => key(v,n)).join('') +
    key(' ','Spatie') + key('backspace','Wis teken') + '</div></details>';
}

export function editGreek(value, start, end, key) {
  let before = value.slice(0,start);
  const after = value.slice(end);
  if (key === 'backspace') {
    if (start === end) before = [...before.normalize('NFD')].slice(0,-1).join('').normalize('NFC');
  } else {
    before = (before + key).normalize('NFC');
  }
  return { value:before + after, caret:before.length };
}

if (typeof document !== 'undefined') document.addEventListener('click', event => {
  const key = event.target.closest?.('[data-greek-key]');
  const input = key?.closest('.question')?.querySelector('#answer');
  if (!input || input.readOnly || input.disabled) return;
  const edited = editGreek(input.value,input.selectionStart,input.selectionEnd,key.dataset.greekKey);
  input.value = edited.value;
  input.focus({preventScroll:true});
  input.setSelectionRange(edited.caret, edited.caret);
  input.dispatchEvent(new Event('input',{bubbles:true}));
});
