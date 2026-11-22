import { belongsToHistoryTrack, chronologyYear, HISTORICAL_TRACKS, timelineScope } from './history-chronology.js?v=13r9';

export const HISTORY_SECTIONS = {
  chronologie: ['Chronologia', 'Tijdlijn', 'clock'],
  atlas: ['Atlas historicus', 'Wereldbol', 'globe'],
  bronnen: ['Officina fontium', 'Bronnenatelier', 'scriptorium'],
  tijdvakken: ['Aetates', 'Tijdvakken', 'castle'],
  leerplan: ['Curriculum', 'Thematisch leerplan', 'knowledge'],
};
export const EXPLORER_PAGES = Object.fromEntries(Object.entries(HISTORY_SECTIONS)
  .filter(([page]) => page !== 'chronologie').map(([page, [title]]) => [page, title]));

export const ATLAS_VIEWS = {
  wereld: { label: 'Wereld', center: [14, 28], zoom: 1 },
  europa: { label: 'Europa', center: [12, 48], zoom: 4.6 },
  frankrijk: { label: 'Frankrijk', center: [2.4, 46.7], zoom: 9 },
  iberie: { label: 'Iberisch Schiereiland', center: [-3.5, 41], zoom: 8 },
  middellandsezee: { label: 'Middellandse Zee', center: [16, 38], zoom: 4.8 },
};

export const ATLAS_PLACES = [
  {
    id: 'marseille', name: 'Marseille', region: 'Zuid-Frankrijk · Middellandse Zee', coordinates: [5.3698, 43.2965],
    text: 'Van de Griekse haven Massalia tot quarantaine, industriële dokken, wederopbouw en migratie in de twintigste eeuw.',
    lessons: ['atlas-marseille-massalia', 'atlas-marseille-rome', 'atlas-marseille-provence', 'atlas-marseille-quarantaine', 'atlas-marseille-industrie', 'atlas-marseille-hedendaags'],
  },
  {
    id: 'parijs', name: 'Parijs', region: 'Frankrijk · Seine', coordinates: [2.3522, 48.8566], aliases: 'Paris Lutèce Lutetia Île-de-France',
    text: 'Bekijk de Romeinse stad aan de Seine en onderzoek hoe de ingrepen van Haussmann Parijs in de negentiende eeuw veranderden.',
    lessons: ['atlas-parijs-lutece', 'atlas-parijs-haussmann'],
  },
  {
    id: 'toulouse', name: 'Toulouse', region: 'Zuid-Frankrijk · Occitanië', coordinates: [1.4442, 43.6047], aliases: 'Tolosa Garonne Canal du Midi',
    text: 'Volg het tracé van de Romeinse stadswal en onderzoek hoe het Canal du Midi nieuwe routes voor handel schiep.',
    lessons: ['atlas-toulouse-tolosa', 'atlas-toulouse-canal'],
  },
  {
    id: 'madrid', name: 'Madrid', region: 'Spanje · Meseta', coordinates: [-3.7038, 40.4168], aliases: 'Mayrit Mairit Manzanares',
    text: 'Volg Madrid van Mayrit, een versterking aan de grens van al-Andalus, tot de vestiging van het koninklijk hof.',
    lessons: ['atlas-madrid-mayrit', 'atlas-madrid-hof'],
  },
  {
    id: 'barcelona', name: 'Barcelona', region: 'Spanje · Catalonië', coordinates: [2.1734, 41.3851], aliases: 'Barcino Bàrcino Catalunya Eixample Cerdà',
    text: 'Lees de archeologische resten van Barcino en vergelijk het negentiende-eeuwse uitbreidingsplan met de gebouwde stad.',
    lessons: ['atlas-barcelona-barcino', 'atlas-barcelona-cerda'],
  },
  {
    id: 'lyon', name: 'Lyon', region: 'Frankrijk · Rhône en Saône', coordinates: [4.8357, 45.7640], aliases: 'Lugdunum Fourvière',
    text: 'Onderzoek hoe twee rivieren, een Romeinse stichting en publieke gebouwen de stad vormgaven.',
    lessons: ['atlas-lyon-lugdunum'],
  },
  {
    id: 'lissabon', name: 'Lissabon', region: 'Portugal · Taag', coordinates: [-9.1393, 38.7223], aliases: 'Lisboa Lisbon Baixa Pombalina',
    text: 'Bekijk hoe Lissabon na de aardbeving van 1755 het handelscentrum opnieuw inrichtte.',
    lessons: ['atlas-lissabon-wederopbouw'],
  },
  {
    id: 'athene', name: 'Athene', region: 'Griekenland · Attica', coordinates: [23.7275, 37.9838],
    text: 'Van land en mijnen in Attica via de haven van Piraeus naar de inkomsten en besluiten van de polis.',
    lessons: ['struct-gr-klassiek', 'atlas-athene', 'src-thucydides', 'attische-economie', 'g2-bosporus-graan', 'g2-zea-scheepshuizen'],
  },
  {
    id: 'rome', name: 'Rome', region: 'Italië · Latium', coordinates: [12.4964, 41.9028],
    text: 'Een hoofdstad die grondstoffen, arbeid en mensen aantrok. Volg de politieke omwentelingen en onderzoek de sporen van het dagelijks leven.',
    lessons: ['rome-ontstaan', 'struct-ro-principaat', 'src-augustus', 'atlas-rome', 'rome-annona', 'r2-frontinus-water', 'rome-testaccio'],
  },
  {
    id: 'gent', name: 'Gent', region: 'België · Vlaanderen', coordinates: [3.7174, 51.0543],
    text: 'In middeleeuwse ambachten en industriële fabrieken veranderde wie het werk organiseerde, welke goederen de stad verlieten en wie politiek gewicht kreeg.',
    lessons: ['atlas-gent', 'deep-belgie', 'industrie-en-kinderarbeid'],
  },
  {
    id: 'antwerpen', name: 'Antwerpen', region: 'België · Scheldebekken', coordinates: [4.4025, 51.2194],
    text: 'Handelsnetwerken, migratie en oorlog veranderden Antwerpen. Volg de haven en de opdrachten aan Vlaamse kunstenaars doorheen die veranderingen.',
    lessons: ['atlas-antwerpen', 'struct-vm-lage-landen', 'drukpers-en-reformaties', 'deep-belgie'],
  },
  {
    id: 'istanbul', name: 'Istanbul', region: 'Turkije · Bosporus', coordinates: [28.9784, 41.0082],
    text: 'Byzantion, Constantinopel en Istanbul lagen op dezelfde strategische doorgang. Vergelijk stedelijke instellingen van verschillende regimes.',
    lessons: ['atlas-istanbul', 'h2-justinianus-recht', 'r2-nika', 'r2-hagia-sophia', 'struct-vm-rijken', 'h2-tanzimat-burgerschap'],
  },
  {
    id: 'alexandrie', name: 'Alexandrië', region: 'Egypte · Nijldelta', coordinates: [29.9187, 31.2001],
    text: 'Ontdek hoe een Middellandse Zeehaven met een rivierlandschap, een vorstelijk hof en verschillende stedelijke gemeenschappen verbonden was.',
    lessons: ['atlas-alexandrie', 'ptolemaisch-egypte', 'struct-gr-hellenisme', 'deep-indische-oceaan'],
  },
  {
    id: 'bagdad', name: 'Bagdad', region: 'Irak · Tigris', coordinates: [44.3661, 33.3152],
    text: 'Van de stichting van een Abbasidische hoofdstad naar vertalingen en kennisnetwerken waarvan de invloed over politieke grenzen heen reikte.',
    lessons: ['kalifaten-bagdad', 'atlas-bagdad', 'deep-kennis'],
  },
  {
    id: 'kilwa', name: 'Kilwa Kisiwani', region: 'Tanzania · Swahilikust', coordinates: [39.521, -8.957],
    text: 'Oost-Afrikaanse kuststeden verbonden productie in het binnenland met havens aan de Indische Oceaan.',
    lessons: ['deep-indische-oceaan', 'indische-oceaan-swahili', 'atlas-kilwa'],
  },
  {
    id: 'timbuktu', name: 'Timboektoe', region: 'Mali · Sahel', coordinates: [-3.0026, 16.7666],
    text: 'Een stad van handel, leren en handschriftcultuur tussen Niger en Sahara. Onderzoek hoe instellingen de netwerken mee vormgaven.',
    lessons: ['ghana-mali-sahel', 'deep-afrika', 'atlas-timbuktu'],
  },
  {
    id: 'kyoto', name: 'Kyoto', region: 'Japan · Kansai', coordinates: [135.7681, 35.0116],
    text: 'Volg het hof, religieuze instellingen en krijgersbestuur vanaf de stichting van Heian-kyō tot de omwentelingen van de negentiende eeuw.',
    lessons: ['atlas-kyoto', 'h2-heian-kamakura', 'h2-dejima-nagasaki', 'deep-japan', 'src-meiji'],
  },
  {
    id: 'delhi', name: 'Delhi', region: 'India · Yamuna', coordinates: [77.2090, 28.6139],
    text: 'De stedelijke ruimte bewaarde opeenvolgende hoofdsteden, markten en monumenten van het sultanaat tot de onafhankelijke staat.',
    lessons: ['atlas-delhi', 'struct-vm-rijken', 'deep-india'],
  },
  {
    id: 'mexico', name: 'Mexico-Stad', region: 'Mexico · Bekken van Mexico', coordinates: [-99.1332, 19.4326],
    text: 'Aanleg op het meer, tribuut en koloniale herinrichting maken zichtbaar hoe machthebbers dezelfde plek op uiteenlopende manieren gebruikten.',
    lessons: ['h2-teotihuacan', 'atlas-mexico', 'mexica-inca-rijksbestuur', 'atlantische-ontmoeting'],
  },
  {
    id: 'cuzco', name: 'Cuzco', region: 'Peru · Andes', coordinates: [-71.9689, -13.5320],
    text: 'Bekijk hoe de Inka arbeid en routes organiseerden en hoe koloniale machthebbers bestaande gebouwen en netwerken hergebruikten.',
    lessons: ['atlas-cuzco', 'mexica-inca-rijksbestuur', 'struct-vm-oceaan'],
  },
];

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

export function explorerHref(page, scope = 'alles', key = '') {
  return 'paideia/' + page + '/' + timelineScope(scope) + (key ? '/' + encodeURIComponent(key) : '');
}

export function explorationLessonHref(lessonId, page, scope, key = '') {
  return 'les/' + encodeURIComponent(lessonId) + '/verkenning/' + page + '/' + timelineScope(scope) + (key ? '/' + encodeURIComponent(key) : '');
}

export const historyInScope = (lesson, scope) => HISTORICAL_TRACKS.includes(lesson.track) &&
  (scope === 'alles' || belongsToHistoryTrack(lesson, scope));

export function inEra(lesson, era) {
  const year = chronologyYear(lesson);
  return year >= era.from && year <= era.to;
}

function explicitPath(lessons, items, key) {
  const paths = key ? items.filter(place => place.id === key) : items;
  const ids = new Set(paths.flatMap(place => place.lessons));
  return lessons.filter(lesson => ids.has(lesson.id));
}

export const byDate = (a, b) => (chronologyYear(a) ?? Infinity) - (chronologyYear(b) ?? Infinity) ||
  a.title.localeCompare(b.title, 'nl');

export function explorationLessons(lessons, page, scope = 'alles', key = '') {
  let list = lessons.filter(lesson => historyInScope(lesson, scope));
  if (page === 'atlas') list = explicitPath(list, ATLAS_PLACES, key);
  if (page === 'bronnen') list = list.filter(lesson => lesson.primary);
  if (page === 'tijdvakken') {
    const era = HISTORICAL_ERAS.find(period => period.id === key);
    list = list.filter(lesson => era ? inEra(lesson, era) : Number.isInteger(chronologyYear(lesson)));
  }
  if (page === 'leerplan' && key) list = explicitPath(list, STUDY_THEMES, key);
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
  const target = { atlas: ATLAS_PLACES, tijdvakken: HISTORICAL_ERAS, leerplan: STUDY_THEMES }[page]?.find(entry => entry.id === key);
  return {
    inRoute: true,
    index,
    listSize: list.length,
    previous: list[index - 1],
    next: list[index + 1],
    back: explorerHref(page, scope, key),
    label: target?.name || EXPLORER_PAGES[page],
    link: id => explorationLessonHref(id, page, scope, key),
  };
}
