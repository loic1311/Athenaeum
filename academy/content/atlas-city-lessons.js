import { atlasAdditions } from './atlas-sites.js?v=142';

// The different stages of a city dossier constitute one study, with a stable progress ID.
function cityLesson(place, id = 'atlas-stad-' + place.id) {
  const [question, answer] = place.exercise;
  const stages = place.stages;
  const options = stages.map(([period, title]) => period + ' · ' + title);
  return {
    id, track: place.track, year: place.year, period: stages[0][0] + ' · ' + stages.at(-1)[0],
    title: place.name + ' · ' + (place.lessonTitle || stages[0][1]), summary: place.focus,
    extension: 'atlas', places: [place.id], caseIds: place.related || [], sources: place.sources,
    structure: stages.map(([heading, lead, text]) => ({heading, lead, text})),
    items: [
      {id: 'situering', label: 'Stappen in het stadsverhaal', source: 0, explanation: stages[0][2], questions: [{
        kind: 'choice', text: 'Welke stap vormt het vertrekpunt van deze studie over ' + place.name + '?',
        answer: options[0], options, feedback: stages[0][2],
      }]},
      {id: 'interpretatie', label: 'Bewijsmateriaal interpreteren', source: 0, explanation: answer, questions: [{
        kind: 'open', text: question, answer, feedback: answer, criteria: ['Benoem het concrete bewijs in deze stad.', 'Verklaar welke conclusie je uit dat bewijs kunt trekken.'],
      }]},
    ],
  };
}

const stam = locator => ({
  author: 'STAM – Stadsmuseum Gent', title: 'From dot to dot. The Story of Ghent in 15 objects',
  locator, url: 'https://stamgent.be/en/digi-expos/van-punt-naar-punt-het-verhaal-van-gent',
});
const industrial = (title, locator, url) => ({author: 'Industriemuseum Gent', title, locator, url});
const guide = locator => ({
  author: 'Ann Blanchet, Jeanne-Marie David-Frank, Jean-Jacques Jordi, Manuel Moliner, Solange Rizoulières, Ingrid Sénépart en Laurent Vedrine',
  title: 'Journal de visite du musée d’Histoire de Marseille. Tour diary', year: '2013', locator,
  url: 'https://musee-histoire.marseille.fr/sites/default/files/2024-03/journal_musee_dhistoire-anglais.pdf',
});
const gent = {id: 'gent', name: 'Gent'};
const studies = [
  ['atlas-gent-bewoning', {
    ...gent, track: 'medieval', year: 876, lessonTitle: 'Een waterput, twee abdijen en het begin van een stad',
    focus: 'Gent ontstond geleidelijk bij Schelde en Leie. Het oudste spoor van mensen in de regio, een vroegmiddeleeuwse boerderij en de eerste stad zijn drie verschillende antwoorden op de vraag wanneer de geschiedenis van Gent begon.',
    stages: [
      ['Vóór de stad', 'Beweging en bewoning in de rivierstreek', 'Lang voordat er een stad bestond, zochten mensen voedsel en beschutting in de streek waar Schelde en Leie samenkomen. Voor het ontstaan van de stad zelf moet je kleinere, gelijktijdig bewoonde kernen kunnen situeren. De ouderdom van een vondst uit de regio volstaat daarvoor niet.'],
      ['7e–9e eeuw', 'Een abdijsite en een landelijke waterput', 'Amandus stichtte bij de Blandijnberg een religieuze gemeenschap. In Ganda kwam een kerk waaruit de latere Sint-Baafsabdij groeide. In de winter van 876–877 werd op de site The Loop een eik gekapt en uitgehold voor een waterput. Dat hout dateert een concrete ingreep door landbouwers in het ommeland. Het geeft geen datum voor de stichting van Gent.'],
      ['10e eeuw en later', 'Van kernen naar stad', 'Nederzettingen rond de abdijen, bij de latere kathedraal en bij de Leie groeiden naar elkaar toe. Deze ontwikkeling is een betere aanwijzing voor verstedelijking dan de eerste religieuze stichting afzonderlijk. Vergelijk de verspreiding van woonsporen met een plattegrond van de latere instellingen.'],
    ],
    exercise: ['Een gids noemt 876–877 als stichtingsdatum van Gent op grond van de boomstamwaterput. Wat dateert de vondst wél en wat heb je nog nodig?',
      'De jaarringen dateren het vellen van een boom die voor een put op een landelijke site werd gebruikt. Voor de vorming van de stad zijn gedateerde nucleï van bewoning, hun groei en hun onderlinge verbindingen nodig.'],
    sources: [stam('Objecten 1, 2 en 4, zonder paginering')], related:['atlas-gent'],
  }],
  ['atlas-gent-autonomie', {
    ...gent, track:'earlymodern', year:1540, lessonTitle:'De Sint-Baafsabdij en het verlies van stedelijke autonomie',
    focus:'Een verdwenen abdij kan getuigen van een conflict over gezag. Leg het stadsgezicht van 1534 naast de overgebleven muren en de gevolgen van de Gentse opstand. Zo wordt zichtbaar welke plaats Karel V koos om verzet tegen zijn bestuur te bemoeilijken.',
    stages:[
      ['15e eeuw', 'Een stad verdedigt haar rechten', 'De Gentse stadsmilitie voerde een eigen vaandel. De Maagd en de Leeuw van Gent maakten het stedelijke collectief herkenbaar in een tijd van botsingen met de graven en Bourgondische hertogen. Zo’n vaandel toont hoe de militie zich presenteerde. Het vertelt minder over onenigheid tussen Gentse ambachten en bestuurders.'],
      ['1534–1540', 'Van abdij naar dwangburcht', 'Op het panoramische stadsgezicht van 1534 is de Sint-Baafsabdij nog herkenbaar. Na de opstand tegen Karel V werden in 1540 privileges ingeperkt. De keizer liet op de plaats van de abdij een vesting aanleggen. Ook de omgeving ondervond de gevolgen. Om ruimte te maken verdwenen gebouwen en delen van de nederzetting.'],
      ['De sporen vandaag', 'Een reconstructie in de openlucht', 'De overgebleven abdijmuren en de omtrek van de kerk tonen welke archieffoto’s en grondplannen je naast elkaar moet leggen. De huidige groene aanduidingen maken vroegere volumes zichtbaar voor bezoekers. Een moderne reconstructie en een bewaarde middeleeuwse muur hebben daarom elk een andere bewijswaarde.'],
    ],
    exercise:['Hoe verbind je een keizerlijk besluit aan de afbraak op een concrete plek?',
      'Het stadsgezicht van 1534 toont de vroegere abdij. De besluiten naar aanleiding van de opstand en de gedateerde resten van de vesting verbinden de gewijzigde bebouwing met de ingreep van Karel V. Een later beeld van ruïnes geeft op zichzelf geen motief voor de afbraak.'],
    sources:[stam('Objecten 6–8, panorama, krijgsvaandel en keizerbuste, zonder paginering'),
      {author:'Historische Huizen Gent',title:'St Bavo’s Abbey. History and stories',locator:'Het besluit van 1540 en de huidige site, zonder paginering',url:'https://historischehuizen.stad.gent/en/st-bavos-abbey/history-and-stories'}], related:['atlas-gent'],
  }],
  ['atlas-gent-fabrieken', {
    ...gent, track:'history', year:1810, lessonTitle:'De oorsprong van een spinmachine onderzoeken',
    focus:'De Gentse textielindustrie gebruikte kapitaal, arbeid en kennis uit verschillende plaatsen. Het verhaal over Lieven Bauwens draait dikwijls om één gesmokkelde machine. Wat verandert er wanneer onderzoekers het bewaarde werktuig opnieuw dateren?',
    stages:[
      ['Eind 18e eeuw', 'Vezels en werktuigen', 'De vraag naar katoen verbond Europese consumenten en fabrieken met grondstofproducenten overzee. Het Industriemuseum wijst onder meer op Amerikaanse katoen die door tot slaaf gemaakte mensen werd geproduceerd. Lieven Bauwens haalde onderdelen en kennis over mechanisch spinnen uit Engeland naar het vasteland en richtte spinnerijen op.'],
      ['Ca. 1800–1810', 'Een techniek wordt een stedelijke bedrijfstak', 'Voor een spinnerij waren ook gebouwen, financiering, monteurs en arbeidskrachten nodig. In Gent ontwikkelden zich ateliers voor de bouw van spintoestellen. In 1810 gingen Pieter Van Huffel, Henry Van Noppen en Louis Daenens samen een katoenbedrijf opzetten. Hun verschillende achtergronden maken duidelijk dat een industrieel bedrijf van meer afhing dan van één uitvinding.'],
      ['Modern collectieonderzoek', 'Welke machine bleef bewaard?', 'Onderzoekers combineerden technische analyse met archiefonderzoek. Het bewaarde toestel in de museumcollectie is waarschijnlijk een ander exemplaar dan de machine waarvan het transport in 1798 bekend werd. Mogelijk werd het omstreeks 1810 door Bauwens gebruikt. De onzekerheid over de identificatie van dit object verandert het ruimere bewijs voor mechanisering niet.'],
    ],
    exercise:['Verandert de herdatering van het museumstuk ook de datering van de invoering van mechanisch spinnen in Gent?',
      'Het onderzoek heropent de vraag welk exemplaar het museum bezit en wanneer het werd gebruikt. Andere bewijzen, zoals bedrijfsarchieven en de aanwezigheid van ateliers, blijven onafhankelijk bewijs leveren voor de invoering van de techniek.'],
    sources:[industrial('Lieven Bauwens. Ondernemer en spion','Katoen wordt koning en de eerste spinnerijen, zonder paginering','https://www.industriemuseum.be/nl/collectie-item/lieven-bauwens-ondernemer-en-spion'),
      industrial('Het museumgebouw','De spinnerij van 1810, zonder paginering','https://www.industriemuseum.be/nl/collectie-item/het-museumgebouw'),
      industrial('Topstukken grondig onderzocht','De Mule Jenny die niét door Lieven Bauwens naar Gent werd gesmokkeld, zonder paginering','https://www.industriemuseum.be/nl/collectie-item/topstukken-grondig-onderzocht')], related:['industrie-en-kinderarbeid'],
  }],
  ['atlas-marseille-laatantiek', {
    id:'marseille', name:'Marseille', track:'roman', year:450, lessonTitle:'Een grafkerk en een haven in de late oudheid',
    focus:'Twee opgravingen belichten het Marseille van de vijfde en zesde eeuw. Aan de rue Malaval onderzochten archeologen een grafkerk. Bij de Bourse vonden zij kades en sporen van bedrijvigheid. De combinatie maakt een geschiedenis van de stad mogelijk waarin nieuwe religieuze gebruiken en havenhandel naast elkaar staan.',
    stages:[
      ['4e–5e eeuw', 'Christenen bouwen in en buiten de stad', 'Deelname van bisschop Oresius aan het concilie van Arles in 314 getuigt van een georganiseerde christelijke gemeenschap. Vanaf omstreeks 400 kwamen binnen de muren gebouwen voor de bisschop en de doop tot stand. Aan de rand van de stad vormden begraafplaatsen en grafkerken andere religieuze centra. Een gedateerde vermelding van een bisschop en de bouw van een afzonderlijke kerk zijn verschillende soorten bewijs.'],
      ['5e–6e eeuw', 'Een dubbele bijzetting aan de rue Malaval', 'De grafkerk bevatte een vereerd graf met twee overledenen. Talrijke andere mensen werden rondom het graf begraven. Verschillen in ligging en inrichting laten zien dat nabestaanden de afstand tot het vereerde graf belangrijk vonden. De namen van de twee overledenen kunnen uit deze rangschikking alleen niet worden afgeleid.'],
      ['5e–6e eeuw', 'Amforen in de haven en op de begraafplaats', 'Amforen uit onder meer Noord-Afrika en het oostelijke Middellandse Zeegebied documenteren Marseille als bestemming in handelsnetwerken. Sommige exemplaren eindigden als kinderkist. Hetzelfde vaatwerk kan zo sporen dragen van twee heel verschillende handelingen. Een amfoor in een graf telt niet automatisch als het residu van een handelsmagazijn op die vindplaats.'],
    ],
    exercise:['Hoe toets je de bewering dat het einde van het West-Romeinse keizerschap de havenhandel in Marseille meteen stillegde?',
      'Vergelijk gedateerde kades en opeenvolgende vondstcontexten met de herkomst van laatantieke amforen. De aanvoer en opslag in de vijfde en zesde eeuw laten voortzetting zien. Hergebruikte amforen uit graven moeten apart worden geïnterpreteerd.'],
    sources:[guide('p. 12, reeks 5, onderdelen 5.1–5.4'),
      {author:'Musées de Marseille',title:'Le Port antique',locator:'Bourse, opgravingen en late oudheid, zonder paginering',url:'https://musees.marseille.fr/le-port-antique'}], related:['atlas-marseille-rome'],
  }],
];
export const atlasCityLessons = [
  ...atlasAdditions.map(place => cityLesson(place)),
  ...studies.map(([id, place]) => cityLesson(place, id)),
];
