import { additionalStories } from './traditio-stories.js?v=14r3';

// Each narrative is attached to a particular written or material witness. Story order is local to its cycle.
const book = (author, title, locator, url, type = 'Primaire tekst', year = '') =>
  ({ author, title, locator, url, type, year });
const bible = (title, chapter, verses) => book('Bijbelse overlevering', title, chapter + ':' + verses,
  'https://www.sefaria.org/' + encodeURIComponent(title) + '.' + chapter + '.' + verses.replace('–','-'),
  'Hebreeuwse tekst en vertaling');
const gospel = (author, code, chapter, verses) => book(author, code === 'acts' ? 'Handelingen van de apostelen' : 'Evangelie volgens ' + author,
  chapter + ':' + verses, 'https://bible.usccb.org/bible/' + code + '/' + chapter, 'Moderne vertaling met noten');
const quran = (title, chapter, verses) => book('Koran', title, 'soera ' + chapter + ':' + verses,
  'https://quran.com/' + chapter + '/' + verses.replace('–','-'), 'Arabische tekst en vertalingen');
const hesiod = (verses) => book('Hesiodus', 'Theogonie', 'vv. ' + verses,
  'https://chs.harvard.edu/primary-source/hesiod-theogony-sb/', 'Vertaling uit het Oudgrieks');
const iliad = (number, verses) => book('Homerus', 'Ilias', number + '.' + verses,
  'https://classics.mit.edu/Homer/iliad.' + number + '.' + ({1:'i',16:'xvi',22:'xxii',24:'xxiv'}[number]) + '.html', 'Engelse vertaling');
const virgil = (number, verses) => book('Vergilius', 'Aeneis', number + '.' + verses,
  'https://www.thelatinlibrary.com/vergil/aen' + number + '.shtml', 'Latijnse tekst');
const classicalLatin = (title, locator, part) => book('Vergilius', title, locator,
  'https://dcc.dickinson.edu/vergil-aeneid/vergil-aeneid-' + part, 'Latijnse tekst met commentaar');
const sources = {
  hymn: book('Egyptische hymnedichter, naam onbekend', 'Grote hymne aan Osiris op de stèle van Amenmose',
    'Louvre C 286, inscriptie onder de offerscènes', 'https://collections.louvre.fr/ark:/53355/cl010026515', 'Object en inscriptie'),
  hymnEdition: book('Miriam Lichtheim (vert.)', 'Ancient Egyptian Literature II. The New Kingdom', 'pp. 81–86',
    'https://www.jstor.org/stable/10.1525/j.ctt1ppr00', 'Wetenschappelijke vertaling', '1976'),
  plutarch: book('Plutarchus', 'De Iside et Osiride', '§§ 13–19', 'https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Plutarch/Moralia/Isis_and_Osiris*/A.html#13', 'Engelse vertaling van het Griekse traktaat'),
  papyrus: book('Egyptische schrijver, naam onbekend', 'De strijd van Horus en Seth', 'Papyrus Chester Beatty I, recto 1,1–16,8',
    'https://www.ucl.ac.uk/museums-static/digitalegypt/writing/library/dem.html', 'Manuscriptbeschrijving'),
  contendings: book('Miriam Lichtheim (vert.)', 'Ancient Egyptian Literature II. The New Kingdom', 'pp. 214–223',
    'https://www.jstor.org/stable/10.1525/j.ctt1ppr00', 'Wetenschappelijke vertaling', '1976'),
  hunefer: book('Schilder van het dodenboek van Hunefer, naam onbekend', 'Het oordeel van Hunefer',
    'British Museum EA9901,3, oordeelsscène', 'https://artsandculture.google.com/asset/page-from-the-book-of-the-dead-of-hunefer/-gFGdB-pjqRpeg', 'Object en toelichting van het British Museum'),
  livy: book('Titus Livius', 'Ab urbe condita', '1.3–7', 'https://www.thelatinlibrary.com/livy/liv.1.shtml#3','Latijnse tekst'),
  inana: book('Sumerische overlevering', 'Inana’s afdaling naar de onderwereld', 'ETCSL 1.4.1', 'https://etcsl.orinst.ox.ac.uk/section1/tr141.htm','Wetenschappelijke vertaling met handschriftvarianten'),
  flood: book('Babylonische Gilgamesj-traditie', 'Het vloedtablet uit Nineve', 'standaardversie, tablet XI, fragment K.3375',
    'https://artsandculture.google.com/asset/the-flood-tablet-relating-part-of-the-epic-of-gilgamesh/wQGL1dmyVmXRYA','Object en toelichting van het British Museum'),
  reynolds: book('Gabriel Said Reynolds', 'The Qurʾān and the Bible. Text and Commentary',
    'Thematisch commentaar, gerangschikt volgens soera en vers', 'https://yalebooks.yale.edu/book/9780300181326/the-quran-and-the-bible/', 'Wetenschappelijk commentaar','2018'),
  hayes: book('Christine Hayes', 'The Hebrew Bible in Its Ancient Near Eastern Setting', 'college 3, vanaf 12:44',
    'https://oyc.yale.edu/religious-studies/rlst-145/lecture-3','Universitair hoorcollege','2006'),
  martin: book('Dale B. Martin', 'The Gospel of Luke', 'college 9, onderdelen 1–2',
    'https://oyc.yale.edu/religious-studies/rlst-152/lecture-9', 'Universitair hoorcollege','2009'),
  nag: book('Gregory Nagy', 'A sampling of comments on Iliad Rhapsody 24', 'commentaar op boek 24',
    'https://classical-inquiries.chs.harvard.edu/a-sampling-of-comments-on-iliad-rhapsody-24/', 'Wetenschappelijk commentaar','2017'),
};

export const TRADITIONS = [
  { id:'egypte', name:'Het oude Egypte', corpus:'Hymne, godenverhaal en grafpapyrus', intro:'Wat geeft Horus recht op de troon? Leg een koninklijke lofzang naast de twisten van een godenvergadering. Lees daarna het oordeel van Hunefer als beeld dat voor één overledene bestemd was.', context:'In het Egyptische Nieuwe Rijk circuleerden lofzangen, verhalen op papyrus en rituele teksten naast elkaar. Wie over Osiris spreekt, doet iets anders in een graf dan in een vertelling voor lezers of toehoorders.', links:[['Paideia · Egypte onder de Ptolemeeën','les/ptolemaisch-egypte']] },
  { id:'griekenland', name:'De Griekse wereld', corpus:'Theogonie, leerdicht en heldenepos', intro:'Volg de strijd om het goddelijke koningschap en lees hoe de Ilias van een ruzie in het legerkamp naar een begrafenis in Troje voert.', context:'De aan Hesiodus en Homerus toegeschreven gedichten kregen hun vorm in de archaïsche Griekse wereld. Een genealogisch gedicht, een leerdicht en een oorlogsepos kiezen elk andere hoofdpersonen, ordeningen en eindpunten.', links:[['Paideia · Griekse religieuze praktijken','les/griekse-rituelen'],['Atlas · Athene','paideia/atlas/alles/athene']] },
  { id:'rome', name:'Romeinse overlevering', corpus:'Augusteeuws epos en geschiedschrijving', intro:'Lees Aeneas’ terugblik op de vlucht uit Troje, hoor waarom Dido zijn vertrek betwist en vergelijk Livius’ versies van de stichting van Rome.', context:'Vergilius en Livius schrijven eeuwen na de gebeurtenissen die zij aan Romes oorsprong verbinden. Het epos laat personages hun handelen verdedigen. De geschiedschrijver kan verschillende tradities naast elkaar zetten.', links:[['Paideia · Het vroege Rome','les/rome-ontstaan'],['Atlas · Rome','paideia/atlas/alles/rome']] },
  { id:'tenach', name:'Hebreeuwse Bijbel', corpus:'Genesis en Exodus', intro:'Lees hoe scheppingsrust, familierivaliteit en een opdracht aan een herder betekenis krijgen in hun eigen passages. Vergelijk de rollen van Mozes en Musa in twee teksttradities.', context:'Genesis en Exodus behoren tot de Tora, de eerste afdeling van de Tenach. Beide staan ook in christelijke Oude Testamenten. Die gedeelde boeken hebben binnen verschillende canons een eigen leesgeschiedenis.', links:[['Paideia · Jeruzalem in 70','les/r2-jeruzalem-70']] },
  { id:'christendom', name:'Nieuwe Testament', corpus:'Evangelies en Handelingen', intro:'Vergelijk wie de geboorteboodschap ontvangt, hoe een gewonde reiziger hulp krijgt en waarom een menigte in Jeruzalem verschillende talen hoort.', context:'De evangelies en Handelingen zijn vroegchristelijke Griekse geschriften. Hun woordkeus, compositie en verwijzingen naar de Schriften van Israël geven toegang tot de denkwereld van de vertellers en hun gemeenschappen.', links:[['Paideia · Religie in het Romeinse Rijk','les/rome-religie'],['Paideia · Jeruzalem in 70','les/r2-jeruzalem-70']] },
  { id:'islam', name:'Koran en islamitische traditie', corpus:'Verhalen in de Koran', intro:'Lees wat Musa’s moeder wordt beloofd, hoe Musa zijn broer betrekt bij zijn opdracht en waarom het kind van Maryam in de wieg spreekt.', context:'In de islam geldt de Koran als openbaring. De Arabische tekst spreekt toehoorders rechtstreeks aan en kan een profeet in verschillende soera’s opnieuw opvoeren. Latere uitleg, tafsīr, vormt een afzonderlijke laag in de overlevering.', links:[['Paideia · De kalifaten en Bagdad','les/kalifaten-bagdad']] },
  { id:'mesopotamie', name:'Mesopotamië', corpus:'Sumerische poëzie en Babylonisch epos', intro:'Daal met Inana af langs de poorten van de onderwereld. Lees vervolgens waarom een vloedoverlevende zijn verhaal aan de sterfelijke Gilgamesj vertelt.', context:'Sumerische en Akkadische spijkerschriftteksten bereikten ons via kleitabletten. Een moderne composiettekst kan lezingen uit verschillende exemplaren samenbrengen. Een afzonderlijk museumfragment vertegenwoordigt maar een deel van de compositie.', links:[['Paideia · Steden en schrift','les/mesopotamie-stad-en-schrift']] },
  { id:'noords', name:'Noordse overlevering', corpus:'De Edda’s', intro:'Volg de strijd en de herverschijning van de aarde in de vertelling over Ragnarök.', context:'De Proza-Edda en de Poëtische Edda bewaren middeleeuwse IJslandse overleveringen. Een prozaschrijver kan verzen aanhalen en tegelijk een eigen ordening aan het verhaal geven.', links:[] },
];

export const TRADITIO_READING = [
  book('Nadia Sels · Universiteit Gent', 'Klassieke mythologie, A000619', 'studiefiche 2026–2027, pp. 2–3. Slides zijn verplicht; een bloemlezing is optioneel. De voorkeur gaat uit naar Ovidius.', 'https://studiekiezer.ugent.be/2026/studiefiche/nl/A000619','Studiefiche'),
  book('Françoise Dunand en Christiane Zivie-Coche', 'Gods and Men in Egypt, 3000 BCE to 395 CE', 'Universiteit Leiden, Religion of Ancient Egypt 2025–2026. De leeslijst vermeldt de eerste helft van het boek.', 'https://studiegids-archief.leidenuniv.nl/courses/134583/religion-of-ancient-egypt','Universitaire leeslijst','2004'),
  book('Hans Ausloos', 'Oud maar niet verouderd. Een inleiding tot de studie van het Oude Testament', 'KU Leuven, Inleiding Oude en Nieuwe Testament, A00A0B. Handboek voor het onderdeel Oude Testament, tweede druk 2010 of derde druk 2014.', 'https://onderwijsaanbod.kuleuven.be/syllabi/n/A00A0BN.htm','Universitair handboek'),
  book('University of Colorado Boulder, Department of Classics', 'Greek Myth & Religion M.A. Reading List', 'Masterlijst met onder meer Fritz Graf, Greek Mythology (1993), en Walter Burkert, Greek Religion (1985).','https://www.colorado.edu/classics/graduate/graduate-exams/ma-reading-lists/greek-myth-religion-ma-reading-list','Universitaire leeslijst'),
  sources.hymnEdition, sources.hayes, sources.martin, sources.nag, sources.reynolds,
];

const narratives = [];
// Index into this lesson's witnesses for a relationship that uses a different passage.
const relationWitnesses = {
  isis: [1,0], horus: [2,2,1,1], hunefer: [0,0,1,0], prometheus: [1,0,1],
  achilles: [1,0,1], priamus: [1,0,1,1], aeneas: [0,0,1], dido: [0,0,1],
  schepping: [2,2], hagar: [0,0,1,1,0], 'mozes-kind': [1,1,1], bezoekers: [0,1,0],
};
// Each step has a short label for ordering practice and its own paragraph for reading.
function story(tradition, id, cycle, title, setting, stages, reading, witnesses, ties, recognition, interpretation) {
  const structure = [
    {heading:'Situering', text:setting},
    ...stages.map(([heading,text]) => ({heading,text})),
    {heading:'Bronnenkritiek', text:reading},
  ];
  const [prompt,correct,...alternatives] = recognition;
  const [essay,model] = interpretation;
  const parts = stages.map(([label]) => label);
  narratives.push({
    id:'trad-' + id, track:'traditio', tradition, cycle, title, period:cycle,
    summary:setting, structure, sources:witnesses,
    ties:ties.map((tie,index) => [...tie.slice(0,4), tie[4] ?? relationWitnesses[id]?.[index] ?? 0]), stages, reading,
    items:[
      {id:'bron', label:'Bron en personages', explanation:correct, questions:[{kind:'choice',text:prompt,answer:correct,options:[correct,...alternatives]}]},
      {id:'volgorde', label:'Verhaalvolgorde', explanation:parts.join(' → '), questions:[{kind:'order',text:'Zet de stappen in de volgorde van deze vertelling.',parts,answer:parts.join(' → ')}]},
      {id:'interpretatie', label:'Bronnenkritiek', explanation:model, questions:[{kind:'open',text:essay,answer:model}]},
    ],
  });
}

story('egypte','isis','De erfenis van Osiris','Isis zoekt Osiris',
'Een hymne uit de achttiende dynastie prijst Osiris op de stèle van Amenmose. Ruim duizend jaar later vertelt de Griekstalige Plutarchus onder het Romeinse keizerrijk uitvoerig hoe een lichaam verloren raakt en teruggevonden wordt. Lees eerst zijn versie en leg de hymne ernaast.', [
  ['De kist op de Nijl','Bij een gastmaal laat Typhon, Plutarchus’ naam voor Seth, de aanwezigen een kostbare kist passen. Alleen Osiris past erin. De samenzweerders sluiten het deksel en laten de kist met de rivier wegdrijven. Door deze list verdwijnt tegelijk een echtgenoot en een koning.'],
  ['De tocht naar Byblos','Isis volgt aanwijzingen tot in Byblos aan de Fenicische kust. Een boom is rond de kist gegroeid en als zuil in het paleis beland. Na haar verblijf aan het hof verkrijgt Isis de zuil. Zij bevrijdt de kist uit het hout en neemt haar mee.'],
  ['Een nieuwe zoektocht','Terug in Egypte ontdekt Typhon het lichaam en verspreidt de delen. Isis zoekt ze opnieuw. Plutarchus brengt de veelheid van graven die met Osiris verbonden waren in verband met verschillende verklaringen van die zoektocht.'],
], 'De Egyptische hymne legt een ander accent. Zij prijst Isis die haar broer zoekt, hem beschermt en een erfgenaam voortbrengt. De kist en de paleiszuil staan niet in deze hymne. Behandel de Griekstalige details als getuigenis van een latere verteller. Een vroegere tekst kan een motief weglaten omdat het doel van de hymne anders is.',
[sources.plutarch,sources.hymn,sources.hymnEdition],[['Isis','Osiris','zus en echtgenote van','broer en echtgenoot van'],['Seth','Osiris','tegenstander van','tegenstander van']],
['Welke bron maakt van de kist in Byblos een uitvoerige episode?','Plutarchus, De Iside et Osiride','De hymne op Louvre C 286','Het dodenboek van Hunefer'],
['Hoe toets je de stelling dat de achttiende dynastie het volledige kistverhaal al kende?','De stèle bewijst dat de zoektocht en de dynastieke rol van Isis toen bekend waren. Plutarchus attesteert de paleiszuil veel later. De stèle bevestigt die scène niet. Het ontbreken ervan bewijst evenmin dat niemand ze kende.']);

story('egypte','horus','De erfenis van Osiris','Wie erft de troon van Osiris?',
'In een Egyptisch verhaal uit de Ramessidentijd moeten de goden een opvolger aanwijzen. Het handschrift Chester Beatty I bevat op de rectozijde hun lang aanslepende geding. Horus is de zoon van Osiris. Seth kan zich beroepen op zijn kracht en zijn dienst aan de zonnegod.',[
  ['Een verdeelde vergadering','Horus maakt aanspraak op het ambt van zijn vader. Zijn tegenstander heeft voorstanders in de vergadering. De goden raadplegen de godin Neith. Haar antwoord steunt Horus en voorziet een vergoeding voor Seth. Daarmee is de strijd nog lang niet afgelopen.'],
  ['Een wedvaart op de rivier','Seth stelt een wedstrijd met stenen boten voor. Horus maakt een houten boot die eruitziet alsof ze van steen is. Seths echte stenen vaartuig zinkt. Zulke krachtproeven en listen rekken het geschil. Een wedstrijd bezorgt de winnaar op zichzelf geen erkend ambt.'],
  ['Een uitspraak over het ambt','Osiris wordt geraadpleegd vanuit het dodenrijk. Uiteindelijk wordt Horus als koning aangesteld. Seth krijgt ook een plaats bij de zonnegod. De uitkomst scheidt twee zaken die het geding lang vermengde, namelijk wie Osiris opvolgt en waar Seths kracht thuishoort.'],
], 'Op de stèle van Amenmose staat het recht van Horus al vast. De lange literaire vertelling laat zien hoeveel verdeeldheid dezelfde uitkomst kan opleveren. De humor en omwegen maken de papyrus tot een verhalende bron. Een Egyptische rechtszitting kan er niet letterlijk uit worden gereconstrueerd.',
[sources.papyrus,sources.contendings,sources.hymn],[['Horus','Osiris','zoon van','vader van'],['Horus','Isis','zoon van','moeder van'],['Seth','Horus','rivaal van','rivaal van'],['Neith','Horus','adviseert ten gunste van','krijgt steun van']],
['Waarom volstaat de bootwedstrijd niet om de troonopvolging te regelen?','Het ambt vereist een erkende uitspraak van de goden.','De boot van Horus is van echt steen.','Neith wijst vooraf uitsluitend Seth aan.'],
['Welk verschil verwacht je tussen een lofhymne en een twistverhaal over dezelfde opvolging?','De hymne bevestigt de rechtmatige dynastie. Het verhaal kan het uitstel, de botsende argumenten en de humor van de godenvergadering uitwerken. Het verschil zegt iets over genre en publiek.']);

story('egypte','hunefer','Het oordeel van de doden','Hunefer voor de weegschaal',
'Op een beschilderd papyrusblad uit de negentiende dynastie staat één man meermaals afgebeeld. Het gaat telkens om de Egyptische schrijver Hunefer. In het onderste register kun je zijn weg van de ingang naar Osiris van links naar rechts volgen.',[
  ['Anubis begeleidt Hunefer','De god met de jakhalskop neemt de overledene bij de hand. Iets verder keert hij bij de weegschaal terug. Zijn herhaling maakt twee handelingen binnen één beeldvlak zichtbaar. In het bovenste register richt Hunefer zich tot een rij godheden.'],
  ['Het hart wordt gewogen','Aan een kant staat het hart, aan de andere de veer van Maät. Zij verwijst naar de juiste orde en rechtvaardigheid. Thoth registreert het resultaat. Naast de weegschaal wacht de verslindster op een ongunstige uitkomst.'],
  ['Horus leidt hem voor Osiris','Rechts brengt Horus de gestorvene bij de zittende Osiris. Het slot toont welke toekomst deze papyrus voor de eigenaar moest helpen verzekeren. De toeschouwer krijgt het goede gevolg te zien, terwijl de dreiging bij de weegschaal zichtbaar blijft.'],
], 'De papyrus is sterk bewijs voor de voorstellingswijze op dit specifieke grafgoed. Hij toont geen waargenomen gebeurtenis en evenmin het lot van een willekeurige Egyptenaar. Het verschil tussen de dreigende verslindster en het gunstige slot helpt de functie van de voorstelling te begrijpen.',
[sources.hunefer,sources.hymn],[['Anubis','Hunefer','begeleidt','wordt begeleid door'],['Thoth','Hunefer','registreert het oordeel over','krijgt een oordeel geregistreerd door'],['Horus','Osiris','zoon van','vader van'],['Horus','Hunefer','leidt voor Osiris','wordt naar Osiris gebracht door']],
['Welke figuur registreert bij de weegschaal de uitkomst?','Thoth','Anubis','Horus'],
['Waarom geeft het gelukkige slot geen betrouwbaar cijfer voor het aantal gunstige oordelen?','Het papyrusblad was voor Hunefer gemaakt om zijn voortbestaan te verzekeren. Het stelt de beoogde uitkomst voor en biedt geen verzameling onafhankelijke gevallen.']);

story('griekenland','gaia','De opvolging van de goden','Gaia, Uranus en de eerste machtsstrijd',
'Hoe ontstaat een wereld waarin goden geboren kunnen worden? Hesiodus’ Theogonie verbindt het ontstaan van ruimten aan een conflict binnen één familie. De dichter beroept zich aan het begin van zijn gedicht op de Muzen. De stem die hier ordent en vertelt, maakt deel uit van het gedicht.',[
  ['Ruimte en verwantschap','Eerst noemt de dichter Chaos, vervolgens onder meer Gaia, Tartaros en Eros. Niet alles is een kind van Chaos. Gaia brengt zelf de hemel Uranus voort, even groot als zijzelf. De tekst behandelt plaats en persoon tegelijk. De aarde draagt en baart.'],
  ['Kinderen onder de aarde','Uit Gaia en Uranus komen onder meer de Titanen voort. Uranus verbergt zijn kinderen zodra zij geboren zijn. Gaia ervaart die opsluiting lichamelijk. Zij maakt een sikkel en vraagt haar kinderen tegen hun vader op te treden. Kronos durft het aan.'],
  ['Kronos grijpt in','Wanneer Uranus Gaia nadert, castreert Kronos zijn vader vanuit zijn schuilplaats. Wat uit het lichaam van Uranus voortkomt, leidt tot nieuwe geboorten. Een daad die de voortplanting moest doorbreken, brengt zo andere machten in de kosmos.'],
], 'Een stamboom maakt de generaties zichtbaar, maar verklaart de handeling niet. Lees naast de verwantschap ook wie een geboorte verhindert en wie de gevolgen draagt. Chaos in hedendaags taalgebruik geeft geen sluitende vertaling van Hesiodus’ eerste kosmische werkelijkheid.',
[hesiod('116–210')],[['Gaia','Uranus','moeder van','zoon van'],['Kronos','Uranus','zoon van','vader van'],['Kronos','Gaia','zoon van','moeder van']],
['Waarom geeft Gaia de sikkel aan Kronos?','Uranus houdt hun kinderen verborgen en Gaia wil aan de verdrukking ontsnappen.','Kronos wil de zonnewagen besturen.','De mensen hebben het vuur gestolen.'],
['Hoe kan Gaia tegelijk een plaats en een handelende figuur zijn?','Hesiodus beschrijft de ruimte waar de kinderen verborgen blijven als het lichaam van hun moeder. Haar pijn en haar plan maken een kosmische scheiding begrijpelijk als familieconflict.']);

story('griekenland','zeus','De opvolging van de goden','Een steen in plaats van Zeus',
'Hesiodus herneemt in Theogonie 453–506 een gevaar uit de generatie van Uranus. Wie nu regeert, vreest zijn eigen nageslacht. Rhea krijgt onder meer Hestia, Demeter, Hera, Hades, Poseidon en Zeus. De vraag is hoe een kind kan opgroeien als zijn vader ieder pasgeboren kind inslikt.',[
  ['Kronos slikt zijn kinderen in','Kronos wil verhinderen dat een van zijn zonen hem de heerschappij ontneemt, zoals hem is voorzegd. Hij slikt de kinderen in zodra Rhea ze ter wereld brengt. De tekst voert de kosten voor Rhea op. Zij verliest achtereenvolgens al haar pasgeborenen.'],
  ['Rhea verbergt het kind','Voor de geboorte van Zeus zoekt Rhea raad bij haar ouders Gaia en Uranus. Op Kreta wordt Zeus verborgen. Rhea wikkelt een steen in doeken en geeft die aan Kronos. Hij slikt het voorwerp zonder het bedrog te doorzien.'],
  ['De steen komt terug','Zeus groeit op. Kronos moet zijn kinderen teruggeven en braakt eerst de steen uit. Zeus stelt die in Pytho, het latere Delphi, op als teken. De Cyclopen geven Zeus later de donder en de bliksem. Zijn macht stoelt daardoor ook op de hulp van bevrijde verwanten.'],
], 'Het heiligdom van Delphi wordt in de tekst verbonden met een teken dat mensen kunnen zien. Dat is bewijs voor de manier waarop een gedicht een plaats betekenis geeft. Het verhaal dateert de aanleg van het historische heiligdom op zichzelf niet.',
[hesiod('453–506'),book('Hesiodus','Theogonie','vv. 453–458, Grieks en vertaling','https://polyglotta.uio.no/index.php?cid=457347&level=2&page=record&vid=485','Griekse tekst met parallelle vertalingen')],[['Zeus','Rhea','zoon van','moeder van'],['Zeus','Kronos','zoon van','vader van'],['Zeus','Hera','broer van','zus van'],['Zeus','Demeter','broer van','zus van'],['Zeus','Poseidon','broer van','broer van'],['Zeus','Hades','broer van','broer van'],['Zeus','Hestia','broer van','zus van']],
['Welk tastbaar teken verbindt Hesiodus met Pytho?','De steen die Kronos had ingeslikt.','De sikkel die Gaia had gemaakt.','De urn met de as van Hektor.'],
['Waarin lijken Uranus en Kronos op elkaar en wat verandert onder Zeus?','Beiden blokkeren hun nakomelingen om hun positie te behouden. Rhea en Gaia laten een opvolger ontkomen. Zeus krijgt vervolgens steun van andere verwanten. Opvolging vraagt in dit verhaal ook bondgenoten.']);

story('griekenland','prometheus','Prometheus en de mensen','Het offer, het vuur en de kruik',
'Hesiodus vertelt over Prometheus in twee gedichten met een eigen publiek en doel. De Theogonie situeert de verdeling van een rund in Mekone. Werken en dagen richt zich tot Perses en legt uit waarom het mensen moeite kost in hun levensonderhoud te voorzien.',[
  ['Twee ongelijke porties','Prometheus haalt een rund uiteen. Onder een aantrekkelijk uitziende vetlaag gaan kale botten schuil, terwijl het vlees en de ingewanden anders worden verpakt. Zeus kiest de bedrieglijke portie. De verteller zegt uitdrukkelijk dat Zeus de list doorzag. Zo verklaart het gedicht een verdeling van vlees en beenderen bij het offer.'],
  ['Prometheus brengt vuur','Zeus onthoudt de mensen vuur. Prometheus haalt het terug in een holle venkelstengel. De mensen kunnen weer vuur gebruiken, maar de onderlinge tegenzet beëindigt het conflict niet. Zeus bereidt een geschenk voor dat de mensen duur zal komen te staan.'],
  ['Pandora opent de kruik','In Werken en dagen rusten verschillende goden Pandora toe. Epimetheus aanvaardt haar ondanks de waarschuwing van zijn broer. Wanneer de kruik opengaat, verspreiden de kwaden zich. Elpis, verwachting of hoop, blijft onder de rand achter. De verteller laat ruimte voor onenigheid over wat dit voor mensen betekent.'],
], 'De naam Pandora en de kruik moeten aan Werken en dagen worden toegeschreven. Lees de negatieve voorstelling van de eerste vrouw als onderdeel van de redenering van de dichter. Zij bewijst op zichzelf niet hoe alle Griekse vrouwen werden gezien of hoe zij leefden.',
[hesiod('535–616'),book('Hesiodus','Werken en dagen','vv. 42–105','https://chs.harvard.edu/primary-source/hesiod-works-and-days-sb/','Engelse vertaling van Gregory Nagy')],[['Prometheus','Epimetheus','broer van','broer van'],['Prometheus','Zeus','daagt uit','wordt uitgedaagd door'],['Epimetheus','Pandora','ontvangt','wordt ontvangen door']],
['In welke passage staat de kruik waaruit de kwaden ontsnappen?','Hesiodus, Werken en dagen 90–105','Homerus, Ilias 1','Livius, Ab urbe condita 1.7'],
['Waarom verarmt een vertelling dat Prometheus Zeus simpelweg slimmer af was de brontekst?','De Theogonie zegt dat Zeus de list doorzag. De schijn van bedrog en de macht van Zeus blijven naast elkaar staan. De verdeling verklaart ook waarom mensen en goden bij het offer verschillende delen krijgen.']);

story('griekenland','achilles','De toorn van Achilles','Van de twist om Briseïs naar de dood van Patroklos',
'De Ilias begint tijdens de belegering van Troje. In de openingsscène vraagt de dichter de godin om te zingen over de toorn van Achilles. Wie bij het begin van dit epos naar het oordeel van Paris zoekt, verwart het begin van de hele oorlog met het begin dat de dichter koos.',[
  ['Een conflict over buit','Wanneer Agamemnon de priester Chryses afwijst, brengt Apollo een plaag over het leger. Agamemnon moet Chryseïs aan haar vader teruggeven. Hij eist Achilles’ buitgemaakte gevangene Briseïs op. De aantasting van zijn eer brengt Achilles ertoe zich van de strijd afzijdig te houden.'],
  ['Patroklos vraagt de wapens','Als de Trojanen de schepen bedreigen, wil Patroklos zijn kameraden helpen. Hij krijgt Achilles’ wapenrusting en mag de Trojanen bij de schepen wegdrijven. Zijn verschijning heeft een militair effect doordat de tegenstander hem voor Achilles kan aanzien.'],
  ['Hektor doodt Patroklos','Patroklos drijft de aanval ver door. Apollo ontregelt hem, Euphorbos verwondt hem en Hektor brengt de dodelijke slag toe. De opeenvolging verdeelt de verantwoordelijkheid tussen goddelijke tussenkomst en menselijke strijders. Hektors overwinning roept de terugkeer van de rouwende Achilles op.'],
], 'De ruzie en de dood liggen vijftien boeken uit elkaar. Dat is een bewuste selectie van scharnierpunten. Lees bij Briseïs ook het verschil in positie. Waar de leiders over eer redetwisten, beschikt de gevangene zelf niet over haar overplaatsing.',
[iliad(1,'1–348'),iliad(16,'1–100, 784–867')],[['Achilles','Patroklos','wapenmakker van','wapenmakker van'],['Agamemnon','Achilles','bestrijdt de aanspraak van','betwist het gezag van'],['Hektor','Patroklos','doodt','wordt gedood door']],
['Welk gevolg heeft de overname van Briseïs voor de Griekse strijdmacht?','Achilles trekt zich uit de strijd terug.','Patroklos sluit onmiddellijk vrede met Hektor.','Chryses wordt koning van de Trojanen.'],
['Hoe verdeelt boek 16 de verantwoordelijkheid voor Patroklos’ dood?','Apollo ontregelt hem, Euphorbos treft hem en Hektor brengt de laatste slag toe. Wie enkel de winnaar van het duel noemt, laat de menselijke en goddelijke voorwaarden voor de overwinning verdwijnen.']);

story('griekenland','priamus','De toorn van Achilles','Priamos vraagt het lichaam van Hektor',
'Achilles wreekt Patroklos door Hektor te doden. Het probleem aan het einde van de Ilias is nu of de Trojanen hun dode kunnen begraven. Boek 24 verplaatst het verhaal van het slagveld naar de tent van de man die het lichaam in handen heeft.',[
  ['Een vader betreedt het kamp','Na de dood van Hektor blijft Achilles het lichaam aan de begrafenis onttrekken. Priamos vertrekt met een losprijs. Hermes helpt hem de Griekse bewaking te passeren. De koning staat ten slotte voor de man die zijn zoon gedood heeft.'],
  ['Een vijand herkent verdriet','Priamos grijpt Achilles bij de knieën en herinnert hem aan zijn eigen oude vader Peleus. Beide mannen huilen om verschillende geliefden. Achilles laat het lichaam klaarmaken. Hij houdt dit buiten Priamos’ gezichtsveld om een nieuwe uitbarsting van woede te voorkomen.'],
  ['Hektor wordt begraven','Achilles gunt de Trojanen tijd voor de uitvaart. Bij de terugkeer in Troje klinkt onder meer de rouw van Andromache, Hekabe en Helena. De laatste handeling van de Ilias is het grafritueel voor Hektor. Voor het houten paard en de inname van de stad moet de lezer elders zijn.'],
], 'De episode beëindigt de vijandschap tussen de legers niet. Zij maakt zichtbaar dat zelfs tegengestelde verplichtingen tijdelijk plaats kunnen laten voor rouw en begrafenis. Priamos’ beroep op Peleus is een concrete reden voor Achilles’ omslag.',
[iliad(22,'247–515'),iliad(24,'334–804'),sources.nag],[['Priamos','Hektor','vader van','zoon van'],['Hektor','Andromache','echtgenoot van','echtgenote van'],['Achilles','Peleus','zoon van','vader van'],['Hermes','Priamos','begeleidt','wordt begeleid door']],
['Met welke gebeurtenis eindigt de Ilias?','De begrafenis van Hektor.','De val van Troje.','De dood van Achilles.'],
['Hoe verandert Priamos’ beroep op Peleus de verhouding tussen beide mannen?','Priamos vraagt Achilles zijn eigen vader voor ogen te halen. Zo raakt de rouw van de vijand aan Achilles’ verlies. De teruggave en de tijd voor de uitvaart volgen daaruit, zonder vredesverdrag.']);

story('rome','aeneas','Van Troje naar Italië','Wie draagt wat bij de vlucht uit Troje?',
'Aeneas vertelt in het tweede boek van de Aeneis aan Dido hoe Troje viel. Vergilius laat de vluchteling zelf terugblikken. Pas vanuit die latere vertelsituatie krijgt de toehoorder te horen wie weken onder de gevaren, wie achterblijft en wie de tocht een bestemming geeft.',[
  ['Anchises laat zich overtuigen','De oude Anchises weigert aanvankelijk te vertrekken. Een vuurverschijnsel rond de jonge Ascanius en een hemels teken bewegen hem tot instemming. De vlucht vraagt dus meer dan militaire daadkracht. Ook de oudste generatie moet besluiten mee te gaan.'],
  ['De huisgoden reizen mee','Aeneas neemt zijn vader op zijn schouders en leidt het kind aan de hand. Anchises neemt de heilige voorwerpen en de Penaten. Aeneas is pas uit de strijd gekomen en wil ze niet met ongewassen handen aanraken. Voor Creusa is een plaats achter hen afgesproken.'],
  ['Creusa verdwijnt','Bij de afgesproken verzamelplaats ontbreekt Creusa. Aeneas keert door het bezette Troje terug en roept haar naam. Haar schim kondigt hem een toekomst in het westen aan. Wanneer hij haar wil omhelzen, glipt zij hem ontastbaar door de armen. Hij vertrekt als overlevende en als weduwnaar.'],
], 'Een lezing over plicht tegenover familie en goden steunt op concrete tekstkeuzes. De taakverdeling rond de Penaten en het vergeefse terugkeren naar de vrouw maken de prijs van overleven zichtbaar. Het Augusteeuwse epos vertelt hoe Romeinse oorsprong denkbaar werd. Het documenteert geen historische tocht van dit gezin.',
[classicalLatin('Aeneis','2.692–729','ii-692-729'),classicalLatin('Aeneis','2.752–794','ii-752-794'),virgil(2,'679–804')],[['Aeneas','Anchises','zoon van','vader van'],['Aeneas','Ascanius','vader van','zoon van'],['Aeneas','Creusa','echtgenoot van','echtgenote van']],
['Wie krijgt de Penaten in handen bij het vertrek?','Anchises','Ascanius','Creusa'],
['Hoe kun je met twee details betogen dat Vergilius de vlucht ook als religieuze handeling vertelt?','Aeneas weigert de heilige voorwerpen aan te raken voordat hij zich heeft gereinigd. Anchises krijgt ze daarom mee. Het bewaren van de cultusvoorwerpen maakt deel uit van het redden van het huishouden.']);

story('rome','dido','Van Troje naar Italië','Waarom vertrekt Aeneas uit Carthago?',
'In boek 4 brengt Vergilius de belangen van twee leiders bij elkaar. Dido bouwt een stad in Noord-Afrika. Aeneas moet met de Trojanen verder naar Italië. Hun conflict ontstaat omdat dezelfde verhouding een andere betekenis krijgt voor elk van beiden.',[
  ['Een verbintenis met twee lezingen','Dido bespreekt haar belangstelling voor Aeneas met haar zus Anna. Tijdens een jacht schuilen Dido en Aeneas voor een storm in dezelfde grot. De verteller meldt hoe Dido de gebeurtenis als een huwelijk beschouwt. De status van hun verhouding wordt daardoor een vraag binnen het gedicht.'],
  ['Het vertrek wordt voorbereid','Mercurius herinnert Aeneas aan zijn opdracht en aan de toekomst van zijn zoon. Aeneas laat voorbereidingen treffen. Dido ontdekt ze en spreekt hem aan op hun band en op de gevolgen voor haar positie. Hij beroept zich op zijn opdracht en erkent haar opvatting over het huwelijk niet.'],
  ['Een vloek voor de toekomst','Na het vertrek roept Dido toekomstige vijandschap af over beide volken. Zij sterft op de brandstapel. Voor een Romeins publiek dat de latere oorlogen met Carthago kende, kan de vloek achteraf betekenis geven aan dat conflict. Voor Dido loopt een persoonlijke en politieke crisis ten einde.'],
], 'Vergelijk Dido’s verwijt met Aeneas’ antwoord voordat je diens plichtsbesef als volledige verklaring aanvaardt. Het epos laat die twee perspectieven botsen. Dido’s vloek verklaart binnen dit gedicht vijandschap. Historisch onderzoek naar de Punische oorlogen vraagt heel andere bronnen.',
[virgil(4,'1–172, 219–392, 584–705'),classicalLatin('Aeneis','4.296–330','iv-296-330')],[['Dido','Anna','zus van','zus van'],['Mercurius','Aeneas','brengt een opdracht aan','ontvangt een opdracht van'],['Dido','Aeneas','betwist het vertrek van','wordt aangesproken door']],
['Waarop beroept Aeneas zich tegenover Dido?','Zijn opdracht om Italië te bereiken en de toekomst van zijn zoon.','Een militair verbod van de Romeinse senaat.','Een vredesverdrag tussen Troje en Carthago.'],
['Hoe geef je de vloek van Dido plaats in twee verschillende tijdsperspectieven?','Voor het personage is de vloek een laatste antwoord op verlies. Voor het Romeinse publiek verwijst hij vooruit naar al bekende vijandschap met Carthago. Deze literaire verbinding is geen historische oorzaak van de Punische oorlogen.']);

story('rome','romulus','De stichting van Rome','Een tweeling, een voorteken en een grens',
'In het openingsboek van zijn geschiedenis verzamelt Livius overleveringen over Romes oorsprong. Lees zijn manier van vertellen even aandachtig als de namen. Zowel bij de redding van de tweeling als bij de dood van Remus laat hij ruimte voor varianten.',[
  ['Twee kinderen aan de Tiber','Na de machtsgreep van Amulius baart Rhea Silvia een tweeling. Zij noemt Mars als vader. De kinderen worden bij de Tiber achtergelaten. Een wolvin zoogt hen volgens de bekende overlevering. Livius geeft ook een andere uitleg voor het woord lupa, verbonden met de vrouw die de jongens opvoedt.'],
  ['De familie wordt herkend','De broers groeien op bij de herder Faustulus. Tijdens een conflict komt Remus bij Numitor terecht. De herkenning van hun afkomst leidt tot gezamenlijk optreden tegen Amulius. Hun grootvader Numitor wordt in Alba hersteld. De broers besluiten vervolgens zelf een stad te stichten.'],
  ['De strijd om het voorteken','Een waarneming van vogels moet uitmaken aan wie het gezag toekomt. Remus ziet volgens het verhaal het eerst gieren, Romulus ziet er meer. Beide groepen leggen de uitkomst in eigen voordeel uit. Livius vermeldt zowel een fatale vechtpartij als de versie waarin Romulus Remus doodt nadat deze over de nieuwe muur springt.'],
], 'De keuze tussen het eerste teken en het grootste aantal is een probleem van interpretatie binnen het verhaal. Het historisch probleem is anders. Livius schrijft eeuwen later. Archeologische resten van bewoning of omwalling kunnen een stedelijk proces documenteren, zonder een individuele broedermoord te bewijzen.',
[sources.livy],[['Romulus','Remus','tweelingbroer van','tweelingbroer van'],['Rhea Silvia','Romulus','moeder van','zoon van'],['Numitor','Rhea Silvia','vader van','dochter van'],['Faustulus','Remus','pleegvader van','pleegzoon van']],
['Waarom kunnen de aanhangers van beide broers zich op de vogeltekens beroepen?','De ene groep telt de eerste waarneming, de andere het grootste aantal.','Alleen Remus zag vogels.','Livius vermeldt geen vogels.'],
['Wat win je door beide lezingen van Remus’ dood naast elkaar te laten staan?','Ze leggen andere accenten op groepsgeweld en op de schending van een stadsgrens. Livius geeft hun bestaan door zonder een eigentijds verslag van het voorval te bezitten.']);

story('tenach','schepping','De vroegste mensheid','De zeven dagen en de tuin in Eden',
'Genesis zet twee voorstellingen van het begin naast elkaar. Lees Genesis 1:1–2:3 eerst als een afgerond geheel. Begin daarna opnieuw bij de tuin in Genesis 2. Welke vragen over mens, aarde en God beantwoordt iedere passage met haar eigen vertelwijze?',[
  ['Een wereld wordt geordend','In het eerste relaas laten Gods uitspraken licht en duisternis, water en land van elkaar onderscheiden. Nieuwe bewoners krijgen hun plaats. Planten verschijnen vóór de landdieren en de mens. De herhaalde waarderingen van het geschapene en de afwisseling van avond en morgen geven de dagen een ritme.'],
  ['De zevende dag','De mens verschijnt als mannelijk en vrouwelijk, naar Gods beeld. De zevende dag brengt het scheppingswerk tot voltooiing. God rust, zegent de dag en maakt hem heilig. De climax van deze compositie is daardoor een tijd die apart gezet wordt.'],
  ['Een mens in een tuin','De tuinvertelling opent op een aarde die nog bewerking en water nodig heeft. God vormt de mens uit grond, blaast hem levensadem in en geeft hem een verblijf en een opdracht. De dieren krijgen namen. De ontmoeting met de vrouw beantwoordt aan het probleem van het alleen-zijn.'],
], 'De dagen en de tuin vormen een volgorde van passages in het boek. De tweede passage beschrijft niet nog een week na de eerste. Historisch-kritische uitleggers onderscheiden literaire tradities. Voor hun precieze datering en onderlinge verhouding is aanvullend tekstonderzoek nodig.',
[bible('Genesis',1,'1–31'),bible('Genesis',2,'1–3'),bible('Genesis',2,'4–25'),sources.hayes],[['De mens','God','wordt gevormd door','vormt'],['De vrouw','De mens','treft als partner','treft als partner']],
['Wat geeft het slot van Genesis 1:1–2:3 een eigen plaats in het weekritme?','God heiligt de zevende dag.','De mensen bouwen op de zevende dag een tempel.','De dieren geven de dagen namen.'],
['Welke verschillen zie je als je de twee passages ieder op hun eigen vraag leest?','In het eerste relaas hoort de mens bij een geordende kosmos met een heilige zevende dag. In de tuin staan arbeid, grenzen en gezelschap centraal. Hun volgorde in Genesis is niet die van twee opeenvolgende scheppingsweken.']);

story('tenach','hagar','De familie van Abraham','Hagar tussen huishouden en woestijn',
'Lees Genesis 16 met de eerdere namen Abram en Sarai en daarna Genesis 21 met Abraham en Sara. In beide passages verlaat Hagar het huishouden en wordt zij in de woestijn aangesproken. Toch verschillen aanleiding, toestand van haar kind en afloop van de tocht.',[
  ['Een gezin met ongelijke posities','Sarai geeft haar Egyptische slavin Hagar aan Abram omdat zij zelf geen kinderen krijgt. Wanneer Hagar zwanger is, verscherpt de spanning. Sarai behandelt haar hard. Hagar vlucht. Het verhaal toont wie over de seksuele en sociale plaats van de slavin kan beslissen.'],
  ['Een belofte bij de bron','Een bode ontmoet Hagar bij een bron onderweg. Hij draagt haar op terug te keren en kondigt de geboorte van Ismaël aan. De naam wordt in verband gebracht met Gods horen van haar nood. Hagar geeft op haar beurt woorden aan haar ervaring gezien te zijn.'],
  ['Een tweede vertrek','Na de geboorte van Isaak worden Hagar en haar zoon weggestuurd. Als het water opraakt, legt zij de jongen neer en gaat op afstand zitten. God hoort de jongen en Hagar ontdekt een waterput. Ismaël overleeft en groeit in de woestijn op. Deze keer is er geen terugkeer naar Sara.'],
], 'De gelijkaardige woestijnscènes verliezen hun eigen betekenis wanneer ze tot één tocht worden samengevoegd. In de ene passage ontvangt de zwangere Hagar de opdracht terug te keren. In de andere staat het leven van de reeds geboren jongen op het spel. Neem Hagars ervaring mee naast de aandacht voor Abrahams nageslacht.',
[bible('Genesis',16,'1–16'),bible('Genesis',21,'1–21')],[['Abraham','Ismaël','vader van','zoon van'],['Hagar','Ismaël','moeder van','zoon van'],['Abraham','Isaak','vader van','zoon van'],['Sara','Isaak','moeder van','zoon van'],['Sara','Abraham','echtgenote van','echtgenoot van']],
['Welke tegenstelling onderscheidt Genesis 16 en Genesis 21?','Eerst vlucht Hagar zwanger, later wordt ze met haar zoon weggestuurd.','Eerst reist Hagar met Isaak, later met Sara.','Beide passages eindigen met de opdracht naar Sara terug te keren.'],
['Welke rol speelt horen in de twee passages over Hagar?','Bij de eerste ontmoeting wordt Ismaëls naam verbonden met het horen van haar nood. In de tweede passage hoort God de jongen op het moment dat het water op is. De motieven verbinden twee verschillende crisissen.']);

story('tenach','mozes-kind','Mozes en de uittocht','Drie vrouwen en een kind aan de Nijl',
'Exodus 1 eindigt met een bevel dat pasgeboren Hebreeuwse jongens bedreigt. Exodus 2 verschuift van de politiek van de koning naar één huishouden. Wie het kleine verhaal leest, kan volgen hoe juist aan het Egyptische hof de uitvoering van het koninklijke bevel faalt.',[
  ['Een mand tussen het riet','Een vrouw uit de stam Levi verbergt haar zoon en maakt daarna een waterdicht gemaakte mand. Zij zet die tussen het riet aan de oever. De zus van het kind blijft op afstand om te zien wat er zal gebeuren. Haar plaats in het verhaal lijkt aanvankelijk die van een toeschouwer.'],
  ['De dochter van de farao beslist','De dochter van de farao ontdekt de mand. Wanneer zij de jongen hoort huilen, heeft zij medelijden. Dat zij hem voor een Hebreeuws kind houdt, verhindert de redding niet. De zus biedt aan een Hebreeuwse voedster te zoeken.'],
  ['Een voedster herkent haar zoon','De zus haalt de moeder van het kind. Zij krijgt de opdracht en een vergoeding om hem te voeden. Als hij groter is, brengt zij hem bij de dochter van de farao. Deze neemt hem als zoon aan en geeft hem de naam Mozes. Hij groeit op tussen het volk waaruit hij geboren is en het huis dat het bedreigde.'],
], 'De personages blijven hier grotendeels naamloos. Latere passages en overleveringen vullen namen en details in. Noteer wat de keuze voor hun rollen in deze scène doet. De farao vaardigt het bevel uit, maar de handelingen van drie vrouwen bepalen het lot van dit kind.',
[bible('Exodus',1,'15–22'),bible('Exodus',2,'1–10')],[['Moeder van Mozes','Mozes','moeder van','zoon van'],['Zus van Mozes','Mozes','zus van','broer van'],['Dochter van de farao','Mozes','neemt aan als zoon','wordt aangenomen door']],
['Wie neemt in Exodus 2 de beslissing het gevonden kind groot te brengen?','De dochter van de farao.','De vrouw van de farao.','Een Egyptische priester.'],
['Hoe slagen de drie vrouwen erin het bevel van de koning te doorkruisen?','De moeder houdt het kind in leven, de dochter van de farao toont mededogen en de zus verbindt beide huishoudens door een voedster voor te stellen. De verteller verdeelt de redding over drie handelende personen.']);

story('tenach','mozes-roeping','Mozes en de uittocht','Een opdracht bij de brandende struik',
'Mozes heeft Egypte verlaten en hoedt de kudde van zijn schoonvader. Bij de Horeb wordt het gewone werk onderbroken door een vuur dat de struik niet verteert. Het grote conflict tussen de farao en de Israëlieten bereikt deze herder via een gesprek.',[
  ['Mozes nadert het vuur','Mozes wil het vreemde verschijnsel van dichtbij zien. Een stem roept hem bij zijn naam en draagt hem op zijn sandalen uit te doen. De grond is heilig. God maakt zich bekend via de voorouders Abraham, Isaak en Jakob. Mozes bedekt zijn gezicht.'],
  ['De nood van het volk','God heeft het lijden gezien en het geroep gehoord en kondigt bevrijding uit Egypte aan. Mozes krijgt de opdracht naar de farao te gaan. Zijn eerste bezwaar betreft zijn geschiktheid. Het antwoord belooft aanwezigheid en richt de aandacht op wat het verzamelde volk later op deze berg zal doen.'],
  ['Een naam voor de gezonden bode','Mozes voorziet dat men naar de naam van de zender zal vragen. In de Hebreeuwse tekst volgt de uitdrukking ehyeh asher ehyeh, gevolgd door een verwijzing naar de God van de voorouders. Nederlandse weergaven leggen verschillende accenten op zijn of zullen zijn.'],
], 'De passage helpt de lezer te begrijpen waarop Mozes’ gezag binnen de vertelling berust. Voor het vaststellen van een historische reisroute of de identificatie van een berg zou men ander bewijs nodig hebben. Vergelijk de formulering van Mozes’ vraag met de aandacht voor spreken en bijstand in soera 20.',
[bible('Exodus',3,'1–15')],[['God','Mozes','geeft een opdracht aan','ontvangt een opdracht van'],['Mozes','Abraham','hoort over de God van','wordt als voorouder genoemd tegenover']],
['Op welke concrete vraag van Mozes volgt de formulering ehyeh asher ehyeh?','Wat moet ik antwoorden wanneer de Israëlieten naar de naam van mijn zender vragen?','Hoeveel dagen duurt de tocht?','Wie heeft de struik geplant?'],
['Waarom helpt de verwijzing naar de voorouders bij de opdracht aan Mozes?','De zender verbindt zich aan een verbondsgeschiedenis die het aangesproken volk kent. Mozes beroept zich zo op iets anders dan eigen kracht. De passage legitimeert zijn optreden binnen het verhaal.']);

story('christendom','geboorte','De geboorte van Jezus','Maria ontvangt een boodschap in Nazaret',
'Het evangelie van Lucas vertelt eerst aan Zacharias dat hij vader zal worden en richt de aandacht daarna op Maria. De aankondiging aan haar en de ontmoeting met Elisabet hebben een eigen volgorde en woordkeus. Lees de scènes eerst binnen Lucas voordat je ze naast Matteüs of de Koran legt.',[
  ['Gabriël spreekt Maria aan','In Nazaret groet de engel Gabriël Maria. Zij schrikt en vraagt zich af wat die groet betekent. Haar wordt een zoon aangekondigd die zij Jezus zal noemen. De beschrijving van zijn koningschap verwijst naar David en geeft de aankondiging een ruimere betekenis dan een individuele geboorte.'],
  ['Maria stelt een vraag','Maria vraagt hoe de geboorte kan plaatsvinden. Het antwoord spreekt over de heilige Geest en verwijst ook naar de zwangerschap van Elisabet. Een gebeurtenis bij een verwante versterkt de boodschap. Maria aanvaardt wat haar is aangekondigd.'],
  ['Elisabet ontvangt Maria','Maria reist naar het bergland van Juda. Zodra Elisabet haar begroeting hoort, beweegt het kind in haar schoot. Elisabet prijst Maria. Maria’s lofzang geeft haar ervaring een bredere plaats door te spreken over hongerigen, machtigen, vernedering en verheffing.'],
], 'De naam Gabriël komt in deze Lucaanse scène uitdrukkelijk voor. Wie hem in een andere tekst identificeert, moet nagaan of die tekst hem zelf zo noemt. De literaire opbouw in Lucas maakt een vergelijking mogelijk zonder de geloofsduiding van de verschillende gemeenschappen gelijk te stellen.',
[gospel('Lucas','luke',1,'26–56'),sources.martin],[['Gabriël','Maria','brengt een boodschap aan','ontvangt een boodschap van'],['Elisabet','Maria','verwante van','verwante van'],['Maria','Jezus','moeder van','zoon van']],
['Naar wie verwijst Gabriël als teken binnen de aankondiging?','Elisabet.','Herodes.','De herders van Betlehem.'],
['Welke rol speelt de ontmoeting met Elisabet na de aankondiging?','Wat eerst in een persoonlijk gesprek tot Maria komt, wordt door een verwante herkend en uitgesproken. De lofzang verbindt het persoonlijke nieuws vervolgens met de positie van de kleinen en met Israël.']);

story('christendom','bezoekers','De geboorte van Jezus','Herders bij Lucas, wijzen bij Matteüs',
'Twee evangelies leggen de plaats van Jezus’ geboorte in Betlehem en vertellen toch verschillende verhalen. Vergelijk hier drie passages in de volgorde waarin je ze leest. De twee groepen bezoekers horen bij verschillende vertellers. Hun onderlinge volgorde is niet uit de tekst af te leiden.',[
  ['Lucas brengt de familie naar Betlehem','In Lucas 2 gaat Jozef wegens een inschrijving met Maria van Nazaret naar Betlehem. De geboorte krijgt vorm met enkele tastbare details, waaronder doeken en een voederbak. Doordat de verteller sober blijft, worden die details herkenningstekens voor mensen buiten het gezin.'],
  ['Herders horen het nieuws','Herders in het veld krijgen een aankondiging. Het teken dat zij ontvangen, stelt hen in staat het kind te herkennen. Zij gaan kijken en vertellen wat over het kind is gezegd. Maria bewaart hun woorden. De bezoekers worden zo getuigen en boodschappers.'],
  ['Matteüs voert wijzen op','In Matteüs 2 gaan wijzen uit het oosten langs Jeruzalem. Hun vraag naar een pasgeboren koning verontrust Herodes. In Betlehem vinden zij het kind met Maria, bieden geschenken aan en keren na een droom via een andere weg terug. De tekst geeft hun aantal en namen niet.'],
], 'De eerste twee stappen behoren tot hetzelfde Lucaanse verhaal. De derde is een parallelle lezing, geen volgend bezoek volgens Lucas. De wijze van bekendmaking en de reactie op de geboorte verschillen. Het samenbrengen van beide groepen in een kerststal getuigt van latere receptie.',
[gospel('Lucas','luke',2,'1–20'),gospel('Matteüs','matthew',2,'1–12')],[['Jozef','Maria','reist samen met','reist samen met'],['Herodes','Wijzen','ondervraagt','worden ondervraagd door'],['Herders','Jezus','bezoeken','krijgt bezoek van']],
['Welk detail vermeldt Matteüs zelf over de wijzen?','Zij keren na een waarschuwing via een andere weg terug.','Hun aantal is drie.','Zij worden door de herders naar de voederbak geleid.'],
['Hoe voorkom je dat een vergelijking van de geboorteverhalen ongemerkt een derde verhaal oplevert?','Wijs de inschrijving, de voederbak en de herders aan Lucas toe. Lees de wijzen, het huis en Herodes in Matteüs. Vergelijk dan hun functie zonder een gezamenlijke volgorde of nieuwe ontmoeting toe te voegen.']);

story('christendom','samaritaan','Gelijkenissen onderweg','Wie werd de naaste van de gewonde man?',
'Op weg naar Jeruzalem krijgt Jezus volgens Lucas een vraag van een wetgeleerde. Het gesprek begint bij de interpretatie van de Tora. Pas na een vervolgvraag vertelt Jezus over een gevaarlijke reis en iemand die zich over een onbekende ontfermt.',[
  ['Een vraag over de wet','De wetgeleerde vraagt wat hij moet doen om eeuwig leven te beërven. Wanneer Jezus terugvraagt wat er in de wet staat, noemt de man de liefde voor God en de naaste. Vervolgens vraagt hij wie zijn naaste is. Die vraag lijkt om de afbakening van een groep te vragen.'],
  ['Een reiziger verzorgt de gewonde','Op de weg naar Jericho wordt een man beroofd en halfdood achtergelaten. Een priester en een Leviet passeren. Een Samaritaan ziet hem, krijgt medelijden en verzorgt hem met olie en wijn. Hij brengt hem op zijn eigen rijdier naar een herberg.'],
  ['De vraag keert om','De Samaritaan betaalt de herbergier en verbindt zich ertoe eventuele verdere kosten te dragen. Jezus vraagt nu wie van de drie zich als naaste van de gewonde heeft gedragen. De wetgeleerde moet antwoorden met een handeling van barmhartigheid. Daarop volgt een opdracht voor zijn eigen handelen.'],
], 'Lucas geeft geen motieven voor de twee voorbijgangers. Hun stilzwijgen invullen met een vermeende religieuze tekortkoming voegt een verklaring toe die ontbreekt. De gelijkenis laat de lezer nadenken over het verschil tussen een groep definiëren en verantwoordelijkheid nemen.',
[gospel('Lucas','luke',10,'25–37')],[['Wetgeleerde','Jezus','ondervraagt','antwoordt aan'],['Samaritaan','Gewonde reiziger','verzorgt','wordt verzorgd door'],['Samaritaan','Herbergier','vertrouwt de verzorging toe aan','neemt de zorg over van']],
['Wat verandert tussen de oorspronkelijke vraag en de slotvraag?','De slotvraag vraagt wie zelf als naaste handelde.','De slotvraag vraagt naar de identiteit van de rovers.','De slotvraag vraagt waarom iedere priester voorbijliep.'],
['Waarom is het methodologisch riskant de priester en de Leviet een vast motief toe te schrijven?','De verteller vermeldt hun optreden maar verzwijgt de reden. Een motief uit latere uitleg is een interpretatie. Men kan het effect van de tegenstelling wel uit de tekst zelf onderbouwen.']);

story('christendom','pinksteren','De gemeenschap in Jeruzalem','Pinksteren in Jeruzalem',
'De opening van Handelingen sluit aan bij het einde van het Lucasevangelie. Jeruzalem vormt het vertrekpunt. In Handelingen 2 verandert een bijeenkomst van de volgelingen van Jezus in een openbare gebeurtenis met luisteraars uit zeer verschillende gebieden.',[
  ['Wind en verdeelde tongen','De leerlingen bevinden zich bijeen wanneer een geluid als van een heftige wind het huis vervult. Zij zien wat op tongen van vuur lijkt. Volgens het verhaal vervult de heilige Geest hen en beginnen zij in andere talen te spreken.'],
  ['Een menigte hoort eigen talen','Joodse toehoorders met uiteenlopende herkomsten horen de sprekers ieder in de eigen taal. De verteller somt gebieden en groepen op. De reacties lopen uiteen van verwondering tot spot. De vraag hoe deze mensen verstaanbaar kunnen zijn, opent de weg naar Petrus’ toespraak.'],
  ['Petrus duidt de gebeurtenis','Petrus verwijst naar de profeet Joël om de gebeurtenis als uitgieting van de Geest te lezen. Hij spreekt daarna over Jezus. Op de vraag hoe te reageren volgen een oproep, doop en aansluiting bij de gemeenschap. Het slot beschrijft onderricht, gedeeld eten, gebed en bezit.'],
], 'De landenlijst en het afsluitende gemeenschapsbeeld maken een vroege christelijke overtuiging over verspreiding en samenleven zichtbaar. Wie feitelijke aantallen of dagelijkse economische praktijken wil reconstrueren, moet ook genre en onafhankelijke getuigenissen wegen.',
[gospel('Lucaanse overlevering','acts',2,'1–47'),book('Dale B. Martin','The Acts of the Apostles','college 10, deel over de eerste hoofdstukken','https://oyc.yale.edu/religious-studies/rlst-152/lecture-10','Universitair hoorcollege','2009')],[['Petrus','Joël','legt de gebeurtenis uit met woorden van','wordt aangehaald door'],['Petrus','Toehoorders','spreekt tot','luisteren naar']],
['Welke profeet haalt Petrus aan wanneer hij het spreken in talen verklaart?','Joël.','Jona.','Elisa.'],
['Hoe helpt de landenlijst de auteur zijn verhaal op te bouwen?','De setting blijft Jeruzalem, maar in de menigte klinken stemmen uit vele gebieden. Daardoor wordt verspreiding al voorstelbaar vóór de latere reizen. De lijst draagt bij aan de literaire geografie van Handelingen.']);


story('islam','musa-kind','Musa en de farao','Waarom Musa bij zijn moeder terugkomt',
'Soera 28 vertelt Musa’s jeugd vanuit de dreiging die de farao voor een deel van de bevolking vormt. Een belofte aan zijn moeder zet het verhaal in beweging. In de islamitische traditie is Musa een boodschapper van God. Die toekomstige opdracht wordt hier al genoemd terwijl hij nog een kwetsbaar kind is.', [
  ['Een belofte aan de moeder','De moeder van Musa krijgt de opdracht haar zoon te voeden. Als ze voor zijn leven vreest, moet ze hem aan het water toevertrouwen. God belooft haar het kind terug te brengen en hem tot de boodschappers te laten behoren. De lezer kent de belofte. De moeder die haar kind uit handen geeft, moet nog ondervinden hoe ze wordt vervuld.'],
  ['Het kind in het huis van de farao','Mensen van de farao nemen het kind op. Zijn vrouw pleit voor het leven van de jongen. Hij zou hun tot vreugde kunnen zijn en ze zouden hem als zoon kunnen aannemen. De verteller kent de ironie van dit besluit. Het huis van de heerser helpt degene te beschermen die het later zal uitdagen. Musa’s moeder draagt zijn zus op hem van een afstand te volgen.'],
  ['De vraag naar een voedster','Musa accepteert de andere voedsters niet. Zijn zus biedt het huishouden aan dat wel voor hem kan zorgen. Zo krijgt zijn moeder haar zoon terug. Het slot neemt haar verdriet en onzekerheid opnieuw op en verbindt de hereniging uitdrukkelijk met de betrouwbaarheid van Gods belofte.'],
], 'In Exodus 2 treedt de dochter van de farao op. Soera 28 noemt zijn vrouw. Bij een vergelijking is juist dat verschil informatief. De Koranpassage legt bovendien van bij het begin uit waarop de moeder mag vertrouwen. Een naam voor de vrouw van de farao komt hier niet voor. Latere uitleg moet afzonderlijk worden geciteerd.',
[quran('Al-Qaṣaṣ',28,'4–13'),bible('Exodus',2,'1–10')], [['Moeder van Musa','Musa','moeder van','zoon van'],['Zus van Musa','Musa','zus van','broer van'],['Vrouw van de farao','Musa','pleit voor het leven van','wordt verdedigd door']],
['Wie verdedigt het kind volgens soera 28 in het huis van de farao?','De vrouw van de farao.','De dochter van de farao.','De vrouw van Musa.'],
['Hoe hangt het optreden van Musa’s zus samen met de belofte aan zijn moeder?','De zus observeert wat er gebeurt en stelt een huishouden voor zodra andere voedsters worden afgewezen. Haar handelen maakt de terugkeer mogelijk die de moeder in vers 7 is toegezegd en die vers 13 als vervulling uitlegt.']);

story('islam','musa-roeping','Musa en de farao','Een teken bij het vuur en een broer als helper',
'In soera 20 wordt een toehoorder aangesproken met de vraag of het verhaal over Musa hem heeft bereikt. De vertelling opent met een reisgezelschap dat vuur nodig heeft. Wat Musa als een praktische onderbreking van de tocht ziet, blijkt het begin van zijn opdracht te zijn.', [
  ['Vuur in de verte','Musa ziet vuur en vraagt zijn familie te wachten. Hij hoopt een gloeiend stuk hout of wegwijzing te vinden. Bij zijn aankomst wordt hij bij naam geroepen. De stem geeft hem opdracht zijn sandalen uit te trekken in het heilige dal Ṭuwā. Musa hoort wie tot hem spreekt en wordt tot gebed opgeroepen.'],
  ['Een gewone staf wordt een teken','Gevraagd wat hij in zijn hand houdt, noemt Musa de staf waarop hij leunt en waarmee hij bladeren voor zijn dieren afslaat. Op bevel gooit hij hem neer. Hij ziet een bewegende slang en krijgt de verzekering dat hij hem weer kan opnemen. Ook het teken met zijn hand bereidt hem voor op de ontmoeting met de farao.'],
  ['Musa vraagt om Harun','Nu krijgt Musa de opdracht naar de farao te gaan. Hij vraagt verruiming van zijn borst, verlichting van zijn taak en het losmaken van een knoop in zijn tong opdat anderen hem begrijpen. Hij wil zijn broer Harun als helper en medestander. De passage eindigt met de toezegging dat zijn verzoek is ingewilligd.'],
], 'De staf krijgt betekenis doordat de tekst eerst haar gewone toepassingen noemt. Lees de passage in haar eigen volgorde. Het verzoek om hulp volgt op de tekenen en op het bevel naar de farao te gaan. Soera 20:29–32 benoemt de familieband en de functie van Harun. Voor onderzoek naar historische locaties of bewijsmateriaal over een uittocht is deze verhalende passage op zichzelf onvoldoende.',
[quran('Ṭā Hā',20,'9–36'),book('Quranic Arabic Corpus','Arabische woordvormen en vertalingen','soera 20:30','https://corpus.quran.com/translation.jsp?chapter=20&verse=30','Arabisch en parallelle vertalingen')], [['Musa','Harun','broer van','broer van'],['Musa','Farao','krijgt opdracht te gaan naar','zal worden aangesproken door']],
['Op welk moment vraagt Musa of Harun hem mag bijstaan?','Nadat hij naar de farao is gestuurd.','Voordat hij het vuur opmerkt.','Wanneer de andere voedsters Musa niet kunnen voeden.'],
['Hoe verbindt de verteller de gewone staf met Musa’s nieuwe opdracht?','De vraag naar wat hij vasthoudt lokt een concrete beschrijving van dagelijks gebruik uit. Vervolgens verandert de staf in een teken. Dat contrast bereidt Musa en de toehoorder voor op de zending naar de farao.']);

story('islam','maryam','Maryam en Isa','Een geboorte bij een palm en de woorden van het kind',
'Soera 19 vertelt over Maryam en de geboorte van Isa. De scène verschuift van haar afzondering naar de pijn van de bevalling en daarna naar de confrontatie met haar eigen mensen. Let tijdens de lectuur op de wisseling van sprekers. Juist wanneer Maryams omgeving een verklaring verwacht, neemt haar kind het woord.', [
  ['Een boodschapper in afzondering','Maryam trekt zich terug en schermt zich af van haar familie. Een gestalte verschijnt in de vorm van een mens. Zij zoekt bescherming bij de Barmhartige. De gestalte maakt zich bekend als gezant van haar Heer en kondigt een zoon aan. Op haar vraag hoe dat mogelijk is, volgt het antwoord dat het kind een teken en een blijk van barmhartigheid zal zijn.'],
  ['Dorst en pijn bij een palm','Maryam draagt het kind en trekt zich op een afgelegen plek terug. Barensweeën drijven haar naar een palm. In haar ontreddering wenst zij vergeten te zijn. Een stem van onder haar stelt haar gerust. Zij krijgt aanwijzingen voor drinken en verse dadels. Bij ontmoeting met mensen moet zij laten weten dat zij zich van spreken onthoudt.'],
  ['De woorden van Isa','Maryam draagt haar kind terug. Haar omgeving reageert met verwijten. Zij wijst naar het kind en dat stuit op ongeloof. Isa noemt zichzelf Gods dienaar en profeet. Hij spreekt over gebed, de zorg voor zijn moeder en vrede bij zijn geboorte, dood en opwekking. Zijn woorden geven de aangesproken gemeenschap een antwoord en tekenen zijn plaats binnen de koranische boodschap.'],
], 'De passage identificeert de spreker van vers 24 niet met een eigennaam. Bij vertaling kunnen toevoegingen tussen haakjes die onzekerheid aan het oog onttrekken. Vergelijk de Arabische tekst en verschillende vertalingen. Lucas 1 biedt een ander literair verband voor de aankondiging aan Maria. Het sprekende kind en de palm behoren in deze vergelijking tot het relaas van soera 19.',
[quran('Maryam',19,'16–36'),gospel('Lucas','luke',1,'26–38'),sources.reynolds], [['Maryam','Isa','moeder van','zoon van'],['Gezant tot Maryam','Maryam','kondigt een zoon aan bij','ontvangt een boodschap van']],
['Wie beantwoordt de verwijten van de gemeenschap wanneer Maryam naar het kind wijst?','Isa.','De moeder van Musa.','Harun.'],
['Welke verandering in de sprekers maakt de terugkeer van Maryam dramatisch?','De gemeenschap vraagt een verklaring van Maryam. Zij wijst en spreekt zelf geen verdediging uit. Het kind doorbreekt de verwachting dat het zich niet kan verantwoorden en benoemt zijn opdracht.']);

const inanaText = lines => book('Sumerische overlevering','De afdaling van Inana naar de onderwereld', 'ETCSL 1.4.1, rr. ' + lines, sources.inana.url,'Wetenschappelijke vertaling met manuscriptvarianten');
const inanaEdition = book('Electronic Pennsylvania Sumerian Dictionary','De afdaling van Inana naar de onderwereld','Q000343, Sumerische tekst','https://oracc.museum.upenn.edu/epsd2/Q000343','Transcriptie van de brontekst');
story('mesopotamie','inana-poorten','De afdaling van Inana','Waarom Inana haar macht verliest aan zeven poorten',
'Een Sumerisch gedicht laat Inana de heiligdommen van de bovenwereld verlaten en naar het rijk van haar zus Ereškigal trekken. De editie van het Electronic Text Corpus of Sumerian Literature brengt tekstgetuigen samen. Soms geeft zij aan welke woorden slechts in één handschrift staan. De episode bij de poorten laat zo’n verschil zien.', [
  ['Uitgerust voor vertrek','Inana verlaat een reeks steden en heiligdommen en kleedt zich met de tekenen van haar positie. Ze vertelt haar dienaar Ninšubur wat hij moet doen als zij uitblijft. Hij moet om haar rouwen en achtereenvolgens bij de goden Enlil, Nanna en Enki hulp zoeken. Door de instructie weet de lezer dat zelfs een machtige godin geen veilige terugkeer kan veronderstellen.'],
  ['Een poortwachter raadpleegt zijn vorstin','Bij de toegang eist Inana dat de poort wordt geopend. Poortwachter Neti vraagt haar wie zij is en brengt verslag uit aan Ereškigal. Die bepaalt hoe haar zus binnengelaten moet worden. Bij elke doorgang raakt Inana een voorwerp of kledingstuk kwijt. Haar protest brengt de doorgang tot de volgende poort nooit dichterbij. Ze moet zich voegen naar wat daar geldt.'],
  ['Zonder tekenen van gezag','De laatste poort ontneemt haar ook het gewaad dat haar rang aanduidt. Toch probeert zij de troon van haar zus in te nemen. De zeven rechters, de Anuna, spreken een vernietigend oordeel. Inana’s lichaam wordt aan een haak gehangen. De opeenvolging van handelingen verklaart waarom haar gezag in de bovenwereld aan deze kant van de poorten geen bescherming biedt.'],
], 'De bron kan hier vrij nauwkeurig worden gevolgd. ETCSL vermeldt onder andere bij de eerste poort een extra lezing uit een handschrift. Wie tekens van macht gaat tellen, moet dus bij de gebruikte editie blijven. De plaatsing van de dood aan het einde van een reeks poorten is goed te onderzoeken. Een algemene uitspraak over wat iedere inwoner van Mesopotamië na zijn dood verwachtte vergt ander en ruimer bewijsmateriaal.',
[inanaText('1–172'),inanaEdition], [['Inana','Ereškigal','zus van','zus van'],['Ninšubur','Inana','dient','wordt vergezeld door'],['Neti','Ereškigal','brengt verslag uit aan','ontvangt bericht van']],
['Wie bepaalt hoe Inana de poorten mag passeren?','Ereškigal geeft de poortwachter instructies.','Ninšubur opent alle poorten.','Enki haalt haar langs een andere weg binnen.'],
['Hoe draagt de herhaling bij de poorten bij tot de afloop op de troon?','Bij elke overgang raakt Inana iets kwijt dat bij haar aanzien hoort. Haar protest doorbreekt de regels niet. Daardoor komt haar poging de troon te bezetten na een zichtbare ontmanteling van haar positie.']);

story('mesopotamie','inana-terugkeer','De afdaling van Inana','Terugkeren uit het dodenrijk heeft een prijs',
'Nadat Inana in de onderwereld is gestorven, verschuift het verhaal naar haar dienaar. Bij vertrek had zij Ninšubur voorbereid op haar afwezigheid. De redding vereist meerdere handelingen. Rouw brengt het probleem onder de aandacht van de goden. Herleving en vrijlating blijken vervolgens twee verschillende zaken.', [
  ['De dienaar zoekt gehoor','Wanneer Inana wegblijft, rouwt Ninšubur en bezoekt hij de in haar instructie genoemde goden. De eerste twee bieden geen uitkomst. Enki laat twee wezens ontstaan en leert hun hoe zij Ereškigal moeten benaderen. Het omzetten van Inana’s noodplan in concrete handelingen vergt zo zowel trouw van een dienaar als bereidheid van een god om in te grijpen.'],
  ['Een lichaam in plaats van geschenken','De helpers antwoorden meelevend op de pijn van Ereškigal. Ze wijzen mogelijke geschenken af en vragen om het lichaam aan de haak. Met levengevend water en een levengevende plant herstellen ze Inana. Aan de grens van het dodenrijk stuit ze daarna op een voorwaarde. Om terug te keren moet ze een vervanger leveren. Geleiders gaan met haar mee om die op te eisen.'],
  ['De keuze valt op Dumuzid','De geleiders zien eerst dienaren die om Inana hebben gerouwd. Ze beschermt hen. Bij Dumuzid zien zij een heel ander beeld. Hij draagt pronkkleding en zit op een troon. Zij geeft hem prijs. Verderop betreurt zij zijn lot. Het beschadigde slot spreekt een verdeling van telkens een half jaar uit. De wisseling van woede naar rouw past slecht in een simpele voorstelling van een ondubbelzinnige bestraffing.'],
], 'Een vertaling geeft lacunes aan waar de tabletten tekst missen. Vooral bij het besluit over Dumuzid en zijn zus zijn regels onvolledig. Het is verantwoord de halvering van het jaar te bespreken. Een precieze toespraak of een volledig doorlopend slot uit de ontbrekende regels reconstrueren gaat verder dan de tekst. De Sumerische versie en de Akkadische afdaling van Ištar hebben elk een eigen overlevering.',
[inanaText('173–412'),inanaEdition], [['Ninšubur','Inana','rouwt om','wordt betreurd door'],['Enki','Inana','stuurt helpers voor','krijgt hulp van'],['Dumuzid','Inana','echtgenoot van','echtgenote van']],
['Waarom kan Inana na haar herleving nog niet zomaar teruggaan?','De onderwereld verlangt een vervanger.','Alle poorten moeten opnieuw gebouwd worden.','Haar dienaar weigert te rouwen.'],
['Wat rechtvaardigt het om bij het einde meer onzekerheid te laten dan bij de poortenscènes?','De editie toont lacunes in de beslissende regels over Dumuzid. De beschikbare woorden ondersteunen een verdeling van het jaar. Voor de precieze formulering en voor iedere ontbrekende handeling is het tekstbewijs onvolledig.']);

const floodText = book('Babylonische overlevering, editie Andrew R. George','Gilgamesj-epos','Standaard-Babylonische versie, tablet XI','https://www.ebl.lmu.de/corpus/L/1/4/SB/XI','Kritische teksteditie en vertaling');
const floodTablet = book('British Museum, verzameling uit Nineve','Fragment van het Gilgamesj-epos','K.3375, tablet XI','https://www.ebl.lmu.de/library/K.3375','Foto en transliteratie van het voorwerp');
story('mesopotamie','gilgamesj-vloed','Gilgamesj en de sterfelijkheid','Waarom de overlevende van de vloed zijn verhaal vertelt',
'Gilgamesj bezoekt Uta-napishti met een persoonlijke vraag. De man tegenover hem ziet er menselijk uit. Hoe kon hij toch het leven verkrijgen dat aan stervelingen ontglipt? Het antwoord vormt in tablet XI van het Standaard-Babylonische epos een verhaal binnen het verhaal. Uta-napishti is nu zelf de verteller.', [
  ['Een boodschap voor een wand van riet','Uta-napishti verplaatst de handeling naar Šuruppak aan de Eufraat. De goden besluiten tot een vloed en hebben een eed gezworen. Ea richt zijn waarschuwing tot een rieten wand. De man die aan de andere kant meeluistert moet een boot bouwen en leven aan boord nemen. Zo krijgt Uta-napishti kennis die de andere goden onderling geheim wilden houden.'],
  ['Drie vogels en een offer','Het vaartuig blijft na de ramp tegen een berg steken. Uta-napishti laat eerst een duif en daarna een zwaluw uitvliegen. Beide keren terug. Een raaf vindt voedsel en keert niet terug. De overlevende brengt een offer. Het onderscheid tussen wat hij vanaf de boot kan zien en wat hij uit het gedrag van de vogels afleidt, maakt hun herhaling zinvol.'],
  ['Een eenmalig besluit','Enlil ontdekt dat mensen zijn ontkomen. Na een discussie tussen de goden krijgen Uta-napishti en zijn vrouw een uitzonderlijke plaats en leven zij ver weg. Gilgamesj hoort dus over een bijzonder goddelijk besluit. Hij kan zo’n besluit niet eenvoudig herhalen. Wanneer hij wordt uitgedaagd wakker te blijven, valt hij in slaap. Zijn eigen lichaam trekt de grens waarover hij de vloedoverlevende kwam ondervragen.'],
], 'Het fragment K.3375 uit Nineve is één materiële getuige. De moderne editie van tablet XI steunt op meer handschriften. Wie in de editie een doorlopende episode kan lezen, mag daaruit niet besluiten dat iedere regel op dit fragment bewaard is. Onderscheid ook de rampherinnering van het literaire gebruik van een vloedverhaal om de grenzen van een sterfelijke held te onderzoeken.',
[floodText,floodTablet], [['Uta-napishti','Gilgamesj','vertelt het vloedverhaal aan','ondervraagt'],['Ea','Uta-napishti','laat een waarschuwing horen voor','ontvangt een waarschuwing van'],['Enlil','Uta-napishti','verleent uitzonderlijk leven aan','ontvangt uitzonderlijk leven van']],
['Welke vogel keert in tablet XI als laatste niet terug?','Een raaf.','Een zwaluw.','Een duif.'],
['Welke betekenis krijgt de vloedvertelling door de vraag waarmee Gilgamesj bij Uta-napishti komt?','Gilgamesj wil weten hoe een mens toegang kreeg tot blijvend leven. Zijn gastheer vertelt over een bijzondere goddelijke beslissing na de vloed. De vergeefse poging wakker te blijven onderstreept dat de held die uitzondering niet op eigen kracht kan herhalen.']);

story('tenach','noach','De vroegste mensheid','Noach en het verbond na de vloed',
'Genesis 6–9 verbindt het verhaal van een vloed met de vraag hoe mensen en dieren na een ramp opnieuw kunnen leven. Binnen de Tora vormt de vloed een schakel tussen de eerste generaties en de latere familieverhalen. De Hebreeuwse tekst is via Sefaria naast vertalingen te lezen.', [
  ['De ark voorbereiden','De aarde is in de vertelling vol geweld. God geeft Noach aanwijzingen om een ark te bouwen voor zijn gezin en voor dieren. In Genesis 6:19–20 klinkt een algemene opdracht over paren, terwijl 7:2–3 verder onderscheid maakt tussen groepen dieren. Het verloop bevat meerdere aanwijzingen voor het instappen en voor het begin van de vloed.'],
  ['Zoeken naar droge grond','Als de ark is vastgelopen wacht Noach op nieuwe tekenen. Hij stuurt een raaf uit en laat daarna meermaals een duif vertrekken. Die vindt eerst geen rustplaats. Bij een volgende poging keert zij terug met een olijfblad. De laatste keer blijft ze weg. De reeks maakt zichtbaar hoe het water geleidelijk afneemt.'],
  ['Een verbond met de levenden','Noach verlaat met zijn gezin en de dieren de ark. Na het offer sluit God een verbond met Noach, zijn nakomelingen en de dieren. God belooft de aarde niet opnieuw met een vloed te verwoesten. De boog in de wolken krijgt in de tekst de functie van een teken van dat verbond.'],
], 'Vergelijk de tellingen en herhalingen rechtstreeks in Genesis 6:19–20 en 7:2–3. Ze hebben geleid tot verschillende voorstellen over de samenstelling van het verhaal. Genesis en tablet XI van Gilgamesj combineren onder meer een vaartuig, vogels en een offer. De volgorde en functie van de vogels verschillen. Voor de precieze historische overdracht moet je naast de motieven ook de ouderdom, verspreiding en overlevering van de teksten in rekening brengen.',
[bible('Genesis',6,'9–22'),bible('Genesis',7,'1–24'),bible('Genesis',8,'1–22'),bible('Genesis',9,'1–17'),floodText],
[['Noach','Sem','is de vader van','is een zoon van',1],['Noach','God','ontvangt een verbond van','sluit een verbond met',3]],
['Welk teken krijgt het verbond in Genesis 9?','Een boog in de wolken.','Het olijfblad.','Het verlaten nest van de raaf.'],
['Welk bewijs heb je nodig om de gelijkenis tussen Genesis en Gilgamesj historisch te verklaren?','Wijs een concreet gedeeld motief en een verschil aan. Onderzoek welke tekstgetuigen en overdrachtsroutes wanneer beschikbaar waren. Een overeenkomend motief alleen laat meerdere verklaringen open.']);

story('christendom','pasen-marcus','De paasverhalen','De vrouwen en het open graf bij Marcus',
'Marcus 16:1–8 vertelt hoe drie vrouwen na de sabbat naar het graf van Jezus gaan. De vertelling volgt hun verwachtingen en reacties. De manuscripten bewaren verschillende slotvormen. Moderne uitgaven geven lezers daarom tekstkritische informatie bij het hoofdstuk.', [
  ['Voor dag en dauw','Maria Magdalena, Maria van Jakobus en Salome hebben geurige stoffen gekocht. Ze willen het lichaam zalven en verwachten een praktisch probleem bij de ingang. Onderweg vragen zij zich af wie de steen voor hen kan wegrollen. Bij aankomst ligt de steen al opzij.'],
  ['De opdracht in het graf','In het graf zien de vrouwen een jongeman in het wit. Hij wijst hun de plaats waar Jezus had gelegen. Hij draagt hun op om Petrus en de andere leerlingen te vertellen dat Jezus hun zal voorgaan naar Galilea. Het graf is in het verhaal het vertrekpunt voor een nieuwe verwachting.'],
  ['Angst aan het slot','De vrouwen verlaten het graf bevend. In vers 8 brengt hun angst hen tot zwijgen. Een lezer die op dat punt stopt, houdt zowel de opdracht om te spreken als het stilzwijgen van de eerste getuigen voor ogen. Bij verder lezen in uitgaven met een langer slot verandert de verteluitkomst.'],
], 'Een aantal oude Griekse handschriften eindigt bij vers 8. Andere getuigen voegen een korter slot of de verzen 9–20 toe. Beschrijf welke verzen je leest voordat je het einde van Marcus met een ander evangelie vergelijkt. Vers 8 en de handschriftvarianten documenteren de tekstoverlevering. In de christelijke geloofstraditie hebben de verhalen ook een eigen liturgische en theologische betekenis.',
[gospel('Marcus','mark',16,'1–8 en tekstkritische noten bij 9–20'),gospel('Lucas','luke',24,'1–12')],
[['Maria Magdalena','Salome','gaat naar het graf met','gaat naar het graf met'],['Jongeman','Maria Magdalena','spreekt in het graf tot','wordt aangesproken door']],
['Welke bestemming noemt de jongeman in het graf?','Galilea.','Emmaüs.','Nazaret.'],
['Waarom kun je bij Marcus twee verschillende leeservaringen aan het einde verantwoorden?','Het slot bij vers 8 laat de lezer achter met angst en stilte. Sommige handschriften bevatten extra passages waarin het verhaal verdergaat. Verwijs daarom naar de gelezen verzen én de gevolgde editie.']);

story('christendom','pasen-lucas','De paasverhalen','Herkenning onderweg naar Emmaüs',
'Lucas 24 verbindt het graf met een tocht van twee leerlingen naar Emmaüs. Het verhaal vertraagt de herkenning onderweg. Zo krijgen hun verwachtingen, de uitleg van de Schriften en hun maaltijd elk een eigen rol.', [
  ['Een reiziger vraagt uitleg','Twee leerlingen verlaten Jeruzalem en spreken over wat er gebeurd is. Een onbekende reiziger laat hen vertellen waarom zij teleurgesteld zijn. Kleopas en zijn metgezel hadden gehoopt op Israëls bevrijding. Het bericht over het open graf en de woorden van de vrouwen hebben hun onzekerheid nog niet weggenomen.'],
  ['De reiziger leest de Schriften','De reiziger legt hun uit hoe passages uit Mozes en de profeten betrekking hebben op wat de leerlingen vertelden. Bij Emmaüs nodigen zij hem uit te blijven. De maaltijd krijgt daardoor ruimte in een verhaal dat begon als een gesprek tussen reizigers.'],
  ['Brood breken en terugkeren','Aan tafel herkennen de leerlingen Jezus wanneer hij brood neemt, zegent en breekt. Hij verdwijnt uit hun gezicht. Ze herinneren zich nu anders hoe het gesprek onderweg verliep. Daarna keren zij naar Jeruzalem terug en vertellen wat er onderweg en aan tafel gebeurd was.'],
], 'Lees de verwachtingen in vers 21, het beroep op de Schriften in vers 27 en de herkenning in de verzen 30–35 samen. Lucas ordent die scènes rond opnieuw leren begrijpen. Johannes 20:11–18 plaatst een herkenning in de omgeving van het graf en laat de aanspreking bij naam een andere rol spelen. Het verschil is controleerbaar in de vertellingen zelf.',
[gospel('Lucas','luke',24,'13–35'),gospel('Johannes','john',20,'11–18')],
[['Kleopas','Jezus','ontmoet onderweg','ontmoet onderweg']],
['Waar keert de groep na de maaltijd naartoe?','Jeruzalem.','Galilea.','Bethlehem.'],
['Vergelijk langs welke weg Lucas en Johannes herkenning voorstellen.','Lucas bouwt het gesprek en de uitleg op naar het breken van brood. Johannes laat Maria reageren op de aanspreking bij haar naam. Benoem plaats, volgorde en wie herkenning ervaart.']);

story('islam','yusuf-put','Het verhaal van Yusuf','Van een droom naar een put en een Egyptisch huishouden',
'Soera 12 verbindt Yusufs lot via dromen, geheimhouding en herkenning. Het eerste deel volgt een familieconflict en de overbrenging van Yusuf naar Egypte. De herinnering aan zijn eerste droom krijgt later in dezelfde soera een nieuwe betekenis.', [
  ['Een droom binnen het gezin','Yusuf vertelt zijn vader dat hij elf sterren, de zon en de maan zich heeft zien neerbuigen. Zijn vader voorziet dat de broers vijandig op de droom zouden kunnen reageren en raadt hem aan te zwijgen. Zo komt de lezer te weten welke kennis binnen het gezin gevoelig is.'],
  ['De broers brengen Yusuf weg','De broers vinden dat hun vader Yusuf voortrekt. Een van hen stelt voor Yusuf in een put te laten, zodat voorbijtrekkende reizigers hem meenemen. Na hun terugkeer zeggen de broers dat een wolf Yusuf heeft aangevallen. Zij tonen een hemd met vals bloed. Hun vader aanvaardt de voorstelling van de broers met wantrouwen.'],
  ['Een nieuw huis','Een karavaan ontdekt Yusuf bij het putten. Hij wordt voor weinig geld verkocht. In Egypte krijgt hij een plaats in het huis van een koper die zijn vrouw vraagt Yusuf goed op te nemen. Het verhaal laat daarna zien hoe Yusuf in dat huishouden terechtkomt in een conflict waar uiteenlopende getuigenissen over ontstaan.'],
], 'Leg 12:4–22 naast Genesis 37. Beide passages vertellen een droom en een poging van de broers om een verdwijning te verklaren. De vorm van de droom en de rollen van de betrokkenen verschillen per tekst. De gemene motieven maken een tekstuele vergelijking mogelijk. Een vraag over de precieze overdracht vraagt ook kennis van de joodse, christelijke en Arabischtalige overleveringen.',
[quran('Yusuf',12,'4–22'),bible('Genesis',37,'1–36')],
[['Yusuf','Ya’qub','vertelt zijn droom aan','hoort de droom van'],['Broers van Yusuf','Yusuf','laten hem achter in de put','wordt achtergelaten door']],
['Wat moeten de broers met het bebloede hemd aannemelijk maken?','Dat een wolf Yusuf heeft aangevallen.','Dat Yusuf bevorderd is aan het hof.','Dat een karavaan terugkeert.'],
['Hoe helpt de eerste droom bij het lezen van de episode over de put?','De droom en de raad van de vader maken de onderlinge concurrentie zichtbaar. De put voert weg van de voorgestelde toekomstige erkenning en maakt de latere wending des te belangrijker.']);

story('islam','yusuf-koning','Het verhaal van Yusuf','Hoe een droom aan het hof een voorstel voor de oogst wordt',
'Yusuf belandt in gevangenschap. Soera 12 laat vervolgens zien hoe iemand van wie het hof niets verwacht nuttige kennis kan leveren. Lees de droom van de koning naast de voorstellen van Yusuf over de oogst en voedselvoorraad.', [
  ['Het woord van een huishouden','Wanneer de vrouw van zijn meester Yusuf benadert, probeert hij weg te komen. Bij de deur scheurt zijn hemd. De richting van de scheur wordt in de vertelling gebruikt om verschillende verklaringen te toetsen. Na bijeenkomsten en gesprekken in de stad komt Yusuf in gevangenschap terecht. De episode verklaart waarom hij later wil dat de koning de zaak opnieuw onderzoekt.'],
  ['Van gevangenis naar paleis','In gevangenschap legt Yusuf twee dromen uit. Een van de andere gevangenen komt weer bij de koning terecht. Wanneer de koning wil weten wat zijn eigen droom over koeien en aren betekent, herinnert deze dienaar zich uiteindelijk Yusuf en gaat hij hem spreken.'],
  ['Een uitleg met een gevolg','Yusuf verbindt de droom met een reeks productieve jaren en daarna jaren van schaarste. Hij raadt aan een groot deel van de oogst te bewaren. De voorspelling krijgt daarmee een concrete uitwerking voor wie over opslag, productie en verdeling kan beslissen.'],
  ['Erkenning en verantwoordelijkheid','Yusuf vraagt eerst aandacht voor wat hem eerder is aangedaan. De vrouwen worden bevraagd en de vrouw van zijn vroegere meester erkent haar rol. Daarna vertrouwt de koning Yusuf en vraagt Yusuf verantwoordelijkheid over de voorraden van het land. Het verhaal brengt bestuurlijke verantwoordelijkheid in verband met betrouwbaarheid.'],
], 'Soera 12 geeft de volgorde van droom, uitleg en benoeming. Daarmee kun je de keuzes van de vertelling onderzoeken. Voor een datering binnen de politieke geschiedenis van Egypte zouden onderzoekers andere bronnen nodig hebben. De aanbeveling over de oogst krijgt binnen het verhaal betekenis als voorbereiding op de ontmoeting met zijn broers.',
[quran('Yusuf',12,'23–42'),quran('Yusuf',12,'43–57')],
[['Dienaar','Yusuf','zoekt een uitleg bij','wordt geraadpleegd door',1],['Koning','Yusuf','vertrouwt hem verantwoordelijkheid toe','stelt zich beschikbaar voor',1]],
['Wat stelt Yusuf tijdens de productieve jaren voor?','Het grootste deel van de oogst bewaren.','Alle graan onmiddellijk gebruiken.','Het zaaien uitstellen tot na de schaarste.'],
['Waarom veranderen de uitleg en de maatregel samen Yusufs positie?','Het hof kan de droom aan toekomstige schaarste koppelen. Yusuf zet de uitleg om in een voorstel waarvoor organisatie nodig is. De beantwoording van de eerdere beschuldigingen draagt bij aan het vertrouwen dat hem toegang tot bestuur geeft.']);

story('islam','yusuf-herkenning','Het verhaal van Yusuf','De broers keren terug en de droom krijgt betekenis',
'In het slotdeel van soera 12 brengen voedselgebrek en reizen de broers opnieuw bij Yusuf. De toehoorder weet wie er over de uitgifte van voedsel beslist. De broers moeten die identiteit tijdens hun gesprekken en reizen nog ontdekken.', [
  ['De eerste ontmoeting','De broers komen voedsel halen. Yusuf herkent hen en vraagt hun bij een volgende reis een broer van vaderskant mee te brengen. De broers keren terug naar hun vader en overtuigen hem om die zoon mee te laten gaan. Hun reis heropent zo het oude conflict rond iemand die het gezin kan verliezen.'],
  ['Een beker en een onthulling','Yusuf neemt de andere broer apart en maakt zich aan hem bekend. Een beker wordt in diens bagage gelegd. Na de ontdekking blijft de broer achter. Later keren de anderen wegens de schaarste terug. Yusuf vraagt dan of zij nog weten wat zij hem en zijn broer hebben aangedaan. Daarop herkennen ze hem en spreekt hij hun vergeving toe.'],
  ['Het hemd en de eerste droom','Yusuf laat een hemd naar zijn vader brengen. In de vertelling keert vaders zicht terug. Uiteindelijk ontvangt Yusuf zijn ouders en broers. Wanneer zij zich neerbuigen, verklaart Yusuf dat de eerdere droom nu betekenis heeft gekregen. Een episode aan het slot herneemt zo de scène waarmee het verhaal begon.'],
], 'De droom staat in soera 12:4. Het slot gebruikt haar opnieuw in vers 100. Vergelijk ook de verschillende functies van een hemd in 12:18 en 12:93–96. De voorwerpen en herinneringen helpen om het verhaal als een geheel te lezen. Voor vragen over de receptie van die motieven kunnen latere commentaren afzonderlijk worden geraadpleegd.',
[quran('Yusuf',12,'58–79'),quran('Yusuf',12,'80–101'),quran('Yusuf',12,'4–6')],
[['Yusuf','Broers van Yusuf','maakt zich bekend aan','herkennen',1],['Yusuf','Ya’qub','stuurt een hemd naar','ontvangt een hemd van',1]],
['Welk eerder motief krijgt bij de hereniging een uitdrukkelijke uitleg?','De droom van de sterren, de zon en de maan.','De bouw van een ark.','De vlucht uit Troje.'],
['Vergelijk de betekenis van het hemd in beide scènes.','In 12:18 gebruiken de broers een hemd om hun versie van Yusufs verdwijning te ondersteunen. In 12:93–96 verbindt Yusuf een ander gebruik van een hemd met herstel en hereniging. De betekenis volgt telkens uit de handelingen en de kennis van de betrokkenen.']);

const edda = part => book('Snorri Sturluson, vert. Arthur G. Brodeur', 'Proza-Edda. Gylfaginning', part,
  'https://en.wikisource.org/wiki/The_Prose_Edda_(1916_translation_by_Arthur_Gilchrist_Brodeur)/Gylfaginning', 'Engelse vertaling', '1916');
story('noords','ragnarok','Ragnarök','De grote winter, de strijd en de ondergang',
'In de Gylfaginning vraagt Gangleri aan Hárr naar het lot van de goden. Het antwoord ordent een winter, de ontsnapping van tegenstanders en een beslissende strijd. De middeleeuwse prozatekst neemt ook oudere poëzie op.', [
  ['Een winter zonder zomer','Hárr beschrijft een verwoestende winter. De samenleving raakt ontwricht en de krachten die tot dan toe gebonden waren komen los. Fenrir breekt vrij en de wereldslang brengt de zee in beweging. Het landschap en de gemeenschap veranderen tegelijk.'],
  ['De tocht naar Vígríðr','Heimdall blaast op zijn hoorn. De goden trekken naar het strijdveld. Odin ontmoet Fenrir en Víðar reageert op de dood van zijn vader. Thor overwint de slang, maar bezwijkt door haar gif. Het verhaal geeft de gevechten verschillende uitkomsten.'],
  ['Het vuur van Surtr','Aan het einde verbrandt Surtr de wereld. De verteller laat de ondergang volgen op een reeks ontmoetingen waarvan de toehoorder de deelnemers al kent. Voor Gangleri blijft daarna de vraag wat er na deze wereld over kan blijven.'],
], 'Lees Gylfaginning LI naast de verzen die Snorri opvoert. De proza-uitleg geeft verbanden die de geciteerde poëzie niet altijd expliciet maakt. De bewaarde handschriften zijn middeleeuws. Zij ondersteunen onderzoek naar overlevering, compositie en religieuze voorstellingen met die eigen historische grenzen.',
[edda('LI')],[['Víðar','Odin','is de zoon van','is de vader van'],['Thor','Wereldslang','bestrijdt','wordt bestreden door']],
['Wie laat volgens deze vertelling het eindvuur los?','Surtr.','Heimdall.','Gangleri.'],
['Welke bijdrage levert de vertelsituatie aan het verhaal?','Gangleri’s vraag lokt een antwoord uit dat de gebeurtenissen ordent. Hárr gebruikt proza en poëzie. De lezer kan nagaan welk detail in het gesprek staat en welk detail in de aangehaalde verzen voorkomt.']);

story('noords','ragnarok-herstel','Ragnarök','Wat na de ondergang terugkeert',
'Gangleri wil weten of na vuur en strijd nog leven mogelijk is. Het slot van de Gylfaginning beschrijft een aarde waarop mensen en goden kunnen terugkeren. Het legt daarbij verbanden met de wereld van vóór de strijd.', [
  ['Een aarde komt weer tevoorschijn','In Hárrs vertelling rijst het land op uit de zee. Gewassen groeien zonder te zijn gezaaid. De achtergrond voor menselijk leven verschijnt zo voordat de verteller aangeeft wie er zal wonen.'],
  ['Overlevenden en terugkerende goden','Víðar en Váli bevinden zich op de nieuwe aarde. De zonen van Thor nemen zijn hamer mee. Baldr en Höðr keren terug uit het dodenrijk. De teruggekeerde figuren bespreken hun herinneringen en herkennen voorwerpen uit de vroegere wereld.'],
  ['Een nieuwe generatie','Líf en Lífþrasir hebben zich verborgen en kunnen een mensengeslacht voortbrengen. De dochter van de zon neemt de baan van haar moeder over. Het verhaal verbindt het herstel van kosmische orde en menselijk leven met concrete overlevenden.'],
], 'Het slot brengt een terugkerend landschap en een nieuw nageslacht samen. Vergelijk de aangehaalde verzen met de uitleg eromheen. Een afzonderlijke editie van de Poëtische Edda kan vervolgens laten zien of een vers op dezelfde plaats staat en hoe andere getuigen de passage weergeven.',
[edda('LIII'),book('Árni Magnússon Institute','Codex Regius van de Poëtische Edda','Digitale editie en manuscriptcontext','https://arnastofnun.is/en/news/new-electronic-edition-codex-regius-poetic-edda','Editie van een andere tekstgetuige')],
[['Líf','Lífþrasir','overleeft samen met','overleeft samen met'],['Baldr','Höðr','keert terug uit het dodenrijk met','keert terug uit het dodenrijk met']],
['Welk voorwerp verbinden de zonen van Thor met de vorige wereld?','Zijn hamer.','Een kopie van de Edda.','De hoorn van Heimdall.'],
['Hoe maakt de vertelling herkenbaar wat voortbestaat en wat opnieuw begint?','Neem een voorwerp of terugkerende god als aanwijzing voor continuïteit. Bespreek daarna een detail van de nieuwe wereld, bijvoorbeeld de terugkeer van vruchtbaar land of het nieuwe mensengeslacht.']);

const traditionCodes = new Map([
  ['Egyptische religie', 'egypte'], ['Griekse mythologie', 'griekenland'], ['Romeinse overleveringen', 'rome'],
  ['Hebreeuwse Bijbel', 'tenach'], ['Nieuwe Testament', 'christendom'], ['Koran', 'islam'],
]);
function sourceStory(row) {
  const tradition = traditionCodes.get(row.tradition);
  if (!tradition) throw new Error('Onbekende traditie voor ' + row.id);
  const sources = row.source.map(source => ({ title: source.label, url: source.url }));
  const stages = row.narrative.map((paragraph, index) => [index === 0 ? 'Het verhaal' : '', paragraph]);
  const criteria = row.essay.criteria.join('\n');
  const items = row.questions.map((q, index) => ({
    id: 'vraag-' + (index + 1), label: 'Verhaal en bron', explanation: q.explanation,
    questions: [{ kind: 'choice', text: q.prompt, options: q.options, answer: q.options[q.answer] }],
  }));
  items.push({ id: 'interpretatie', label: 'Bronnenkritiek', explanation: criteria,
    questions: [{ kind: 'open', text: row.essay.prompt, answer: criteria }] });
  return {
    id: row.id, track: 'traditio', tradition, cycle: row.cycle, period: row.cycle, title: row.title,
    summary: row.context, reading: row.interpretation, figures: row.figures, stages, sources, items,
    structure: [{ heading: 'Situering', text: row.context }, ...stages.map(([heading,text]) => ({ heading,text })),
      { heading: 'Bronnenkritiek', text: row.interpretation }],
    ties: row.relations.map(({ from, to, label, source }) => {
      const witness = row.source.findIndex(entry => entry.label === source);
      if (witness < 0) throw new Error('Onbekende bron bij figuurrelatie in ' + row.id);
      return [from, to, label, '', witness];
    }),
  };
}

export const TRADITIO_LESSONS = [...narratives, ...additionalStories.map(sourceStory)];
