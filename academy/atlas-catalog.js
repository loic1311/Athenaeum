import { atlasAdditions, establishedHistories } from './content/atlas-sites.js?v=14r3';

export const ATLAS_VIEWS = {
  wereld: { label: 'Wereld', center: [14, 28], zoom: 1 },
  europa: { label: 'Europa', center: [12, 48], zoom: 4.6 },
  frankrijk: { label: 'Frankrijk', center: [2.4, 46.7], zoom: 9 },
  iberie: { label: 'Iberisch Schiereiland', center: [-3.5, 41], zoom: 8 },
  middellandsezee: { label: 'Middellandse Zee', center: [18, 37], zoom: 4.1 },
  afrika: { label: 'Afrika', center: [17, 1], zoom: 1.8 },
  azie: { label: 'Azië', center: [93, 28], zoom: 1.6 },
  amerika: { label: 'Amerika', center: [-83, 13], zoom: 1.3 },
  oceanie: { label: 'Oceanië', center: [152, -6], zoom: 2 },
};

const established = [
  {
    id: 'marseille', name: 'Marseille', region: 'Zuid-Frankrijk · Middellandse Zee', coordinates: [5.3698, 43.2965],
    text: 'Van de Griekse haven Massalia tot quarantaine, industriële dokken, wederopbouw en migratie in de twintigste eeuw.',
    lessons: ['atlas-marseille-massalia', 'atlas-marseille-rome', 'atlas-marseille-laatantiek', 'atlas-marseille-provence', 'atlas-marseille-quarantaine', 'atlas-marseille-industrie', 'atlas-marseille-hedendaags'],
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
    lessons: ['atlas-gent-bewoning', 'atlas-gent', 'atlas-gent-autonomie', 'atlas-gent-fabrieken', 'deep-belgie', 'industrie-en-kinderarbeid'],
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


export const ATLAS_PLACES = [
  ...established.map(place => ({...place, ...establishedHistories[place.id]})),
  ...atlasAdditions.map(place => ({...place, text: place.focus, lessons: ['atlas-stad-' + place.id, ...place.related]})),
];
export const atlasById = new Map(ATLAS_PLACES.map(place => [place.id, place]));
export function historicalName(place, year) {
  if (!Number.isInteger(year) || !year) return undefined;
  return place.windows.find(([from, to]) => year >= from && year <= to)?.[2];
}

export function readAtlasYear(value) {
  const raw = String(value).trim().toLowerCase().replaceAll('−', '-');
  if (!raw) return null;
  const match = raw.match(/^(-?\d{1,6})\s*(v\.?\s*(?:chr\.?)?|n\.?\s*(?:chr\.?)?|bc(?:e)?|ad|ce)?$/i);
  if (!match) return NaN;
  const n = Number(match[1]), suffix = match[2] || '';
  if (!n || (n < 0 && suffix)) return NaN;
  return /^(v|bc)/i.test(suffix) ? -n : n;
}
