import { EXPLORER_PAGES, explorerHref, explorationLessonHref } from './history-links.js?v=14r4';
export { EXPLORER_PAGES, HISTORY_SECTIONS, explorerHref, explorationLessonHref } from './history-links.js?v=14r4';
import { belongsToHistoryTrack, chronologyYear, HISTORICAL_TRACKS, timelineScope } from './history-chronology.js?v=14r3';
import { ATLAS_PLACES } from './atlas-catalog.js?v=14r3';
export { ATLAS_PLACES, ATLAS_VIEWS } from './atlas-catalog.js?v=14r3';

export const HISTORICAL_ERAS = [
  { id: 'sporen', from: -300000, to: -3501, date: 'Ca. 300.000–3501 v.Chr.', name: 'Menselijke sporen en vroege landbouw', text: 'Materiële bronnen, migraties, voedselproductie en sedentaire gemeenschappen.' },
  { id: 'eerste-steden', from: -3500, to: -1601, date: 'Ca. 3500–1601 v.Chr.', name: 'Steden, schrift en vroege staten', text: 'Opslag, stedelijke organisatie en schrift van Mesopotamië tot de Nijl en de Indus.' },
  { id: 'bronstijd', from: -1600, to: -1101, date: 'Ca. 1600–1101 v.Chr.', name: 'Paleizen en verbonden bronstijdwerelden', text: 'Administratie, uitwisseling, diplomatie en de afbraak van paleisnetwerken.' },
  { id: 'ijzertijd', from: -1100, to: -500, date: 'Ca. 1100–500 v.Chr.', name: 'Nieuwe gemeenschappen in de ijzertijd', text: 'Migratie, polisvorming, vroege Romeinse instellingen en regionale contacten.' },
  { id: 'klassieke-wereld', from: -499, to: -335, date: '499–335 v.Chr.', name: 'Klassieke poleis, conflict en burgerschap', text: 'Oorlog, democratie, arbeid, rituelen en bevoorrading in het klassieke Middellandse Zeegebied.' },
  { id: 'rijken-oudheid', from: -334, to: -32, date: '334–32 v.Chr.', name: 'Hellenistische, Romeinse en Aziatische rijken', text: 'Koninkrijken, de Romeinse Republiek en de veranderende staat in Qin- en Han-China.' },
  { id: 'keizertijd', from: -31, to: 234, date: '31 v.Chr.–234 n.Chr.', name: 'Keizertijd, provincies en stedelijke wereld', text: 'Rijksbestuur, grondgebruik, soorten arbeid, stadscultuur en sociale rechten.' },
  { id: 'late-oudheid', from: 235, to: 749, date: '235–749', name: 'Late oudheid en nieuwe machtscentra', text: 'Veranderingen in het Romeinse bestuur, religie, opvolgende koninkrijken en de vroege islam.' },
  { id: 'vroeg-middeleeuws', from: 750, to: 999, date: '750–999', name: 'Hoven, handelsroutes en geschreven kennis', text: 'Het Abbasidische Bagdad, Karolingische culturen, Scandinavische handel en het Japanse hof.' },
  { id: 'middeleeuwse-steden', from: 1000, to: 1346, date: '1000–1346', name: 'Middeleeuwse steden, productie en verbindingen', text: 'Stedelijke groei, heerlijkheden, de Indische Oceaan, kruistochten en de trans-Saharahandel.' },
  { id: 'late-middeleeuwen', from: 1347, to: 1491, date: '1347–1491', name: 'Arbeid, rijken en stedelijke verandering', text: 'Demografische omslagen, nieuwe stedelijke rivaliteit en de opkomst van wereldrijken.' },
  { id: 'reformaties', from: 1492, to: 1647, date: '1492–1647', name: 'Oceaannetwerken, hervormingen en verovering', text: 'Contact rond de oceanen, religieuze hervormingen, wereldrijken en Europese handelscompagnieën.' },
  { id: 'belasting-en-handel', from: 1648, to: 1788, date: '1648–1788', name: 'Oorlog, wereldhandel en staatsinkomsten', text: 'Handelscompagnieën, dwangarbeid, staatskrediet en omslagen in productie en consumptie.' },
  { id: 'revolutionair', from: 1789, to: 1847, date: '1789–1847', name: 'Revoluties, natiestaten en industrialisering', text: 'Omwentelingen in burgerschap, politieke mobilisatie en de eerste industriële veranderingen.' },
  { id: 'industriele-wereld', from: 1848, to: 1913, date: '1848–1913', name: 'Massapolitiek, imperialisme en hervorming', text: 'Ongelijke staatsvorming, koloniale macht en de versnelling van arbeid, transport en communicatie.' },
  { id: 'wereldoorlogen', from: 1914, to: 1944, date: '1914–1944', name: 'Wereldoorlogen, crises en vervolging', text: 'Totale oorlog, economische ontwrichting, nieuwe staatsmacht en de vervolging van burgers.' },
  { id: 'na-1945', from: 1945, to: 1988, date: '1945–1988', name: 'Dekolonisatie, Koude Oorlog en integratie', text: 'Onafhankelijkheid, naoorlogse instellingen, sociale rechten en supranationale samenwerking.' },
  { id: 'recente-geschiedenis', from: 1989, to: Infinity, date: 'Vanaf 1989', name: 'Hedendaagse geschiedenis', text: 'Het einde van de Koude Oorlog, internationale productieketens, nieuwe lidstaten en digitalisering.' },
];

export const STUDY_THEMES = [
  { id: 'economie', name: 'Economie, arbeid en handel', text: 'Volg productie, markten, financiën, dwangarbeid en gezinsinkomens over meerdere periodes.',
    lessons: ['struct-wo-steden', 'struct-gr-polis', 'attische-economie', 'rome-testaccio', 'struct-me-steden', 'zwarte-dood-en-arbeid', 'struct-vm-atlantic', 'struct-wo-industrie', 'atlas-marseille-industrie', 'deep-wereld-na1989', 'deep-azie-1997'] },
  { id: 'maatschappij', name: 'Maatschappij, gender en burgerschap', text: 'Vergelijk de verdeling van juridische rechten, werk, status, eigendom en politieke deelname.',
    lessons: ['g2-gortyn-erfenissen', 'rome-slavernij', 'r2-tutela-vrouwen', 'src-magna-carta', 'deep-vrouwen', 'struct-vm-burgerschap', 'src-vrijheid', 'deep-belgie', 'deep-belgie-na45'] },
  { id: 'macht', name: 'Bestuur, staten en imperia', text: 'Onderzoek hoe instellingen ontstaan en hoe lokale en bovenlokale macht elkaar beïnvloeden.',
    lessons: ['deep-egypte', 'deep-han', 'struct-ro-provincies', 'struct-me-heerlijkheid', 'atlas-istanbul', 'struct-vm-rijken', 'deep-japan', 'deep-india', 'deep-europese-integratie', 'deep-zuidafrika'] },
  { id: 'cultuur', name: 'Cultuur, religie en kennis', text: 'Verbind religieuze praktijken, archieven, onderwijs, beelden en media met hun makers en publiek.',
    lessons: ['griekse-rituelen', 'g2-epidauros-iamata', 'rome-religie', 'deep-kennis', 'atlas-timbuktu', 'struct-vm-reformatie', 'atlas-antwerpen', 'struct-wo-massapolitiek'] },
  { id: 'stad', name: 'Stad, ruimte en mobiliteit', text: 'Lees havens, woonwijken, infrastructuur, migratie en landschappen als historische bronnen.',
    lessons: ['h2-indus-steden', 'atlas-marseille-massalia', 'atlas-athene', 'atlas-rome', 'atlas-kilwa', 'atlas-gent', 'atlas-mexico', 'atlas-delhi', 'atlas-marseille-industrie'] },
  { id: 'wereld', name: 'Wereldgeschiedenis en kolonisatie', text: 'Onderzoek verbindingen rond oceanen en de verhouding tussen rijk, arbeid en koloniale macht.',
    lessons: ['deep-brons', 'deep-indische-oceaan', 'deep-afrika', 'struct-vm-oceaan', 'atlas-cuzco', 'deep-congo', 'deep-india', 'deep-dekolonisatie', 'h2-nieo-1974', 'deep-pacific', 'deep-amerikas'] },
  { id: 'politiek-geweld', name: 'Oorlog, politieke breuk en herinnering', text: 'Onderzoek mobilisatie, vervolging, maatschappelijke ontwrichting en de keuzes van bronnenmakers.',
    lessons: ['perzische-oorlogen', 'peloponnesische-oorlog', 'rome-punische-oorlogen', 'struct-me-kruistochten', 'eerste-wereldoorlog', 'deep-vervolging', 'struct-wo-na-1945', 'deep-dekolonisatie'] },
  { id: 'materiaal', name: 'Materiële bronnen, ecologie en techniek', text: 'Gebruik voorwerpen, landschappen, demografische trends en technische infrastructuur als bewijs.',
    lessons: ['deep-mensen', 'deep-landbouw', 'struct-gr-paleis', 'rome-wegen', 'atlas-marseille-quarantaine', 'deep-ecologie', 'struct-wo-industrie'] },
  { id: 'methodes', name: 'Heuristiek, bronkritiek en historiografie', text: 'Oefen de stap van bron naar uitspraak, van hypothese naar vergelijking en van historiografisch debat naar een afgebakende vraag.',
    lessons: ['deep-historiografie', 'src-thucydides', 'src-augustus', 'src-justinianus', 'src-magna-carta', 'src-vrijheid', 'src-haiti', 'src-meiji', 'src-vn'] },
];

export const historyInScope = (lesson, scope) => HISTORICAL_TRACKS.includes(lesson.track) &&
  (scope === 'alles' || belongsToHistoryTrack(lesson, scope));

export function inEra(lesson, era) {
  const year = chronologyYear(lesson);
  return Number.isInteger(year) && year !== 0 && year >= era.from && year <= era.to;
}

function explicitPath(lessons, items, key) {
  const paths = key ? items.filter(place => place.id === key) : items;
  const ids = new Set(paths.flatMap(place => place.lessons));
  return lessons.filter(lesson => ids.has(lesson.id));
}

export const byDate = (a, b) => (chronologyYear(a) ?? Infinity) - (chronologyYear(b) ?? Infinity) ||
  a.title.localeCompare(b.title, 'nl');

export function themeSelection(key) {
  const [themeId, eraId] = (key || '').split('~');
  return {
    theme: STUDY_THEMES.find(entry => entry.id === themeId),
    era: HISTORICAL_ERAS.find(entry => entry.id === eraId),
  };
}

export function hasTheme(lesson, theme) {
  return theme.lessons.includes(lesson.id) || lesson.themes?.includes(theme.id);
}

export function explorationLessons(lessons, page, scope = 'alles', key = '') {
  let list = lessons.filter(lesson => historyInScope(lesson, scope));
  if (page === 'atlas') {
    const places = key ? ATLAS_PLACES.filter(place => place.id === key) : ATLAS_PLACES;
    const ids = new Set(places.map(place => place.id));
    const mapped = new Set(places.flatMap(place => place.lessons));
    list = list.filter(lesson => mapped.has(lesson.id) || lesson.places?.some(id => ids.has(id)));
  }
  if (page === 'bronnen') list = list.filter(lesson => lesson.primary);
  if (page === 'tijdvakken' || page === 'chronologie') {
    const era = HISTORICAL_ERAS.find(period => period.id === key);
    list = list.filter(lesson => era ? inEra(lesson, era) : Number.isInteger(chronologyYear(lesson)));
  }
  if (page === 'leerplan' && key) {
    const { theme, era } = themeSelection(key);
    list = theme ? list.filter(lesson => hasTheme(lesson, theme) && (!era || inEra(lesson, era))) : [];
  }
  return list.sort(byDate);
}

export function explorationJourney(lessons, lesson, path) {
  const [, , segment, requestedPage, requestedScope, requestedKey = ''] = path;
  const explicit = segment === 'verkenning' && Object.hasOwn(EXPLORER_PAGES, requestedPage);
  if (!explicit && !lesson.extension) return null;
  const place = lesson.extension === 'atlas' && ATLAS_PLACES.find(entry => entry.lessons.includes(lesson.id));
  const era = lesson.extension === 'verdieping' && HISTORICAL_ERAS.find(entry => inEra(lesson, entry));
  const page = explicit ? requestedPage : place ? 'atlas' : lesson.primary ? 'bronnen' : 'tijdvakken';
  const key = explicit ? requestedKey : place?.id ?? era?.id ?? '';
  const scope = explicit ? timelineScope(requestedScope) : 'alles';
  const list = explorationLessons(lessons, page, scope, key);
  const index = list.findIndex(candidate => candidate.id === lesson.id);
  if (index < 0) return null;
  const target = { atlas: ATLAS_PLACES, tijdvakken: HISTORICAL_ERAS, chronologie: HISTORICAL_ERAS }[page]?.find(entry => entry.id === key);
  const { theme, era: themeEra } = page === 'leerplan' ? themeSelection(key) : {};
  return {
    inRoute: true,
    index,
    listSize: list.length,
    previous: list[index - 1],
    next: list[index + 1],
    back: explorerHref(page, scope, key),
    label: target?.name || [theme?.name, themeEra?.date].filter(Boolean).join(' · ') || EXPLORER_PAGES[page],
    link: id => explorationLessonHref(id, page, scope, key),
  };
}
