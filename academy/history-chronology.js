export const HISTORICAL_TRACKS = ['greek', 'roman', 'medieval', 'earlymodern', 'history'];
export const PAIDEIA_TRACKS = [...HISTORICAL_TRACKS, 'knowledge'];

const caseDates = {
  'egezische-bronstijd': -1600, 'polis-en-chora': -750, 'griekse-nederzettingen': -775,
  'sparta': -600, 'perzische-oorlogen': -499, 'atheense-democratie': -508, 'delische-bond': -478,
  'peloponnesische-oorlog': -431, 'attische-economie': -370, 'griekse-rituelen': -450,
  'agora-architectuur': 150, 'thebe-macedonie': -371, 'alexander-diadochen': -334,
  'achaeische-federatie': -280, 'ptolemaisch-egypte': -300, 'teos-koninklijke-weldaden': -203,
  'aphrodisias-hadrianus': 125, 'g2-dreros-kosmos': -650, 'g2-gortyn-erfenissen': -450,
  'g2-solon-schuld': -594, 'g2-ostracisme-scherven': -485, 'g2-lotingsmachine': -350,
  'g2-bosporus-graan': -350, 'g2-argo-trierarchie': -350, 'g2-pasion-bank': -365,
  'g2-xenophon-metoiken': -355, 'g2-epidauros-iamata': -325, 'g2-ai-khanoum': -295,
  'g2-chremonides': -269, 'g2-delos-sarapis': -200, 'g2-hegeso': -400, 'g2-rhodos-aardbeving': -226,
  'g2-zea-scheepshuizen': -330, 'g2-gortyn-brons': -225, 'g2-plato-landschap': -350,
  'g2-olympia-eed': 175, 'g2-priene-dedicaties': -334, 'g2-crete-sparta-maaltijden': -350,

  'rome-ontstaan': -750, 'rome-constitutie': -175, 'rome-punische-oorlogen': -264,
  'rome-italische-bondgenoten': -133, 'rome-augustus': -44, 'rome-gouverneur': 110, 'rome-wegen': 35,
  'rome-stadsrecht': 91, 'rome-annona': 45, 'rome-testaccio': 100, 'rome-slavernij': -175,
  'rome-dieren': -55, 'rome-stoa': 55, 'rome-burgerrecht': 160, 'rome-derde-eeuw': 238,
  'rome-tetrarchie': 293, 'rome-religie': 300, 'rome-late-oudheid': 410,
  'r2-begrafenis': -150, 'r2-landgoed': -160, 'r2-arbeid-op-het-veld': -37, 'r2-siciliaanse-tiende': -70,
  'r2-claudius-gallie': 48, 'r2-agricola-britannia': 80, 'r2-grote-brand': 64, 'r2-vindolanda-uitnodiging': 100,
  'r2-frontinus-water': 97, 'r2-romeinse-baden': -25, 'r2-tungri-sterkte': 95, 'r2-vesuvius-brieven': 79,
  'r2-bataven': 69, 'r2-tutela-vrouwen': 160, 'r2-mutuum': 160, 'r2-munera': 533,
  'r2-constantius-rome': 357, 'r2-donau-oversteek': 376, 'r2-nika': 532, 'r2-caelius': -56,
  'r2-dacia-arbeidscontract': 164, 'r2-bu-njem': 250, 'r2-marius-werving': -107, 'r2-jeruzalem-70': 70,
  'r2-hagia-sophia': 532,

  'mesopotamie-stad-en-schrift': -3500, 'kalifaten-bagdad': 762, 'song-commerciele-revolutie': 960,
  'indische-oceaan-swahili': 1000, 'ghana-mali-sahel': 800, 'mexica-inca-rijksbestuur': 1400,
  'zwarte-dood-en-arbeid': 1347, 'ottomanen-mughals-qing': 1453, 'atlantische-ontmoeting': 1492,
  'drukpers-en-reformaties': 1450, 'atlantische-slavernij': 1500, 'atlantische-revoluties': 1776,
  'industrie-en-kinderarbeid': 1760, 'negentiende-eeuws-imperialisme': 1850, 'eerste-wereldoorlog': 1914,
  'depressie-en-tweede-wereldoorlog': 1929, 'koude-oorlog-en-dekolonisatie': 1945,
  'van-bretton-woods-tot-waardeketens': 1944, 'h2-indus-steden': -2600, 'h2-kush-nijl': -750,
  'h2-aksum-rode-zee': 100, 'h2-teotihuacan': -100, 'h2-maya-tikal': 250, 'h2-lapita-migratie': -1500,
  'h2-ashoka-edikten': -260, 'h2-silla-tang': 660, 'h2-heian-kamakura': 794, 'h2-justinianus-recht': 527,
  'h2-karolingische-schriftcultuur': 750, 'h2-viking-handelsknooppunten': 790, 'h2-crusade-jerusalem': 1099,
  'h2-dejima-nagasaki': 1636, 'h2-banda-monopolie': 1621, 'h2-nieuw-julfa-isfahan': 1604,
  'h2-asante-goud': 1700, 'h2-haiti-erkenning-schuld': 1804, 'h2-brazilie-keizerrijk': 1808,
  'h2-tanzimat-burgerschap': 1839, 'h2-samoa-mau': 1914, 'h2-apartheid-registratie-ruimte': 1948,
  'h2-nieo-1974': 1974,
};

const scopes = {
  medieval: new Set([
    'kalifaten-bagdad', 'song-commerciele-revolutie', 'indische-oceaan-swahili', 'ghana-mali-sahel',
    'zwarte-dood-en-arbeid', 'h2-silla-tang', 'h2-heian-kamakura', 'h2-justinianus-recht',
    'h2-karolingische-schriftcultuur', 'h2-viking-handelsknooppunten', 'h2-crusade-jerusalem',
  ]),
  earlymodern: new Set([
    'mexica-inca-rijksbestuur', 'ottomanen-mughals-qing', 'atlantische-ontmoeting', 'drukpers-en-reformaties',
    'atlantische-slavernij', 'atlantische-revoluties', 'h2-dejima-nagasaki', 'h2-banda-monopolie',
    'h2-nieuw-julfa-isfahan', 'h2-asante-goud', 'h2-haiti-erkenning-schuld',
  ]),
};

export const timelineScope = value => HISTORICAL_TRACKS.includes(value) ? value : 'alles';
export const timelineMode = value => value === 'alle' ? value : 'kern';
export const timelineHref = (scope, mode = 'kern') => 'paideia/chronologie/' + timelineScope(scope) + '/' + timelineMode(mode);
export const historyLessonHref = (id, scope, mode) => 'les/' + encodeURIComponent(id) + '/chronologie/' + timelineScope(scope) + '/' + timelineMode(mode);
export const historyReadId = id => 'history-read-' + id;

export function belongsToHistoryTrack(lesson, track) {
  return lesson.track === track || (lesson.track === 'history' && Object.hasOwn(scopes, track) && scopes[track].has(lesson.id));
}

export function chronologyYear(lesson) {
  return Number.isInteger(lesson.year) ? lesson.year : caseDates[lesson.id];
}

export function chronologicalLessons(lessons, scope = 'alles', mode = 'kern') {
  return lessons.filter(lesson => HISTORICAL_TRACKS.includes(lesson.track) &&
    (scope === 'alles' || belongsToHistoryTrack(lesson, scope)) && (mode === 'alle' || lesson.structure) &&
    Number.isInteger(chronologyYear(lesson)))
    .sort((a, b) => chronologyYear(a) - chronologyYear(b) ||
      Number(Boolean(b.structure)) - Number(Boolean(a.structure)) || a.title.localeCompare(b.title, 'nl'));
}

const eras = [
  [-501, 'Vóór 500 v.Chr.'], [-1, '500–1 v.Chr.'], [499, '1–499 n.Chr.'], [999, '500–999'],
  [1449, '1000–1449'], [1799, '1450–1799'], [1913, '1800–1913'], [Infinity, 'Vanaf 1914'],
];

export function chronologyGroups(lessons) {
  const groups = new Map();
  for (const lesson of lessons) {
    const title = eras.find(([end]) => chronologyYear(lesson) <= end)[1];
    if (!groups.has(title)) groups.set(title, []);
    groups.get(title).push(lesson);
  }
  return [...groups];
}

export function chronologyForLesson(lessons, lesson, path) {
  if (!HISTORICAL_TRACKS.includes(lesson.track) || !Number.isInteger(chronologyYear(lesson))) return null;
  const inRoute = path[2] === 'chronologie';
  const scope = inRoute ? timelineScope(path[3]) : lesson.track;
  const mode = inRoute ? timelineMode(path[4]) : lesson.structure ? 'kern' : 'alle';
  const list = chronologicalLessons(lessons, scope, mode);
  const index = list.findIndex(candidate => candidate.id === lesson.id);
  return {
    inRoute: inRoute && index >= 0, scope, mode, index, listSize: list.length,
    previous: index > 0 ? list[index - 1] : undefined,
    next: index >= 0 ? list[index + 1] : undefined,
  };
}
