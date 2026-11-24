import { reference } from './history-academic-model.js?v=14r3';
import { application as choice, courseUnit, essay } from './history-course-model.js?v=160';

const west = reference('Ann Kordas, Ryan J. Lynch, Brooke Nelson & Julie Tatlock', 'World History, Volume 1: to 1500',
  '§ 13.1, The Post-Roman West in the Early Middle Ages', 'https://openstax.org/books/world-history-volume-1/pages/13-1-the-post-roman-west-in-the-early-middle-ages', '2023');
const life = reference('Einhard', 'Vita Karoli Magni', '§§ 3, 6–9, 15 en 28, vert. S. E. Turner, Internet Medieval Sourcebook',
  'https://sourcebooks.fordham.edu/basis/einhard.asp', '9e eeuw');
const rule = reference('Karolingisch hof', 'Capitulare de villis', 'BK 32, c. 62–63 en 70, Capitularia',
  'https://capitularia.uni-koeln.de/en/capit/pre814/bk-nr-032/', 'ca. 800');
const production = reference('Adriaan Verhulst', 'The Carolingian Economy', 'The Economy and the State, pp. 126–131',
  'https://doi.org/10.1017/CBO9780511817083.010', '2002');
const reform = reference('Karel de Grote en zijn raadgevers', 'Admonitio generalis', '789, c. 72, BK 22, Capitularia',
  'https://capitularia.uni-koeln.de/capit/pre814/bk-nr-022/');
const psalms = reference('Evina Steinová', 'Psalmos, notas, cantus', 'Speculum 90.2, pp. 424–457, inleiding en bespreking van c. 72',
  'https://pure.knaw.nl/ws/files/1752183/EvinaSteinova_PsalmusNotasCantus_SpcApr2015.pdf', '2015');

export const carolingianLessons = [
  courseUnit({
    id: 'karolingisch-macht-en-keizerschap', track: 'medieval', year: 768, period: '768–814', themes: ['macht', 'cultuur', 'politiek-geweld'],
    title: 'Karel de Grote: expansie, aristocratie en keizerschap',
    summary: 'De heerschappij van Karel de Grote groeide uit een Frankische dynastieke opvolging en opeenvolgende oorlogen. Het koningschap steunde op bondgenoten, trouwrelaties en kerkelijke instellingen. De keizerkroning van 800 voegde een nieuwe vorm van legitimiteit aan bestaande machtspraktijken toe.',
    sources: [west, life],
    sections: [
      ['Dynastieke opvolging', 'Karel erfde in 768 een deel van het Frankische koninkrijk',
        'Zijn vader Pepijn had de Karolingische koninklijke positie gevestigd. Karel en Karloman regeerden aanvankelijk naast elkaar. Na Karlomans dood in 771 kwam de heerschappij samen onder Karel. Voor de verklaring van dat proces zijn de keuze van aristocratische medestanders, de plaats van de kerk en de toegang tot koninklijke middelen belangrijk.', 0, 1],
      ['Expansie en lokale machtsrelaties', 'De oorlogen in Italië en Saksen hadden verschillende uitkomsten',
        'Na de veldtocht tegen de Longobarden voerde Karel in 774 ook hun koninklijke titel. De oorlogen in Saksen strekten zich uit over meerdere decennia en gingen gepaard met dwang, verzet en de uitbreiding van christelijke instellingen. Een overwinnaar kon een gebied opeisen, maar had bestuurders, trouwe medestanders en toegang tot lokale middelen nodig om gezag werkelijk uit te oefenen.', 0, 1],
      ['Graven, gezanten en het hof', 'Koninklijke beslissingen bereikten regio’s via personen met eigen belangen',
        'Graven oefenden plaatselijke taken uit zoals rechtspraak en mobilisatie. Gezanten konden toezicht houden en klachten of instructies overbrengen. De schriftelijke instructie krijgt pas betekenis wanneer lokale actoren middelen en gelegenheid hadden om haar uit te voeren. De precieze effecten waren afhankelijk van de regio en van persoonlijke banden.', 0],
      ['De kroning van 800', 'Het keizerschap veranderde de manier waarop gezag werd voorgesteld',
        'Paus Leo III kroonde Karel op Kerstmis in Rome. Kerkelijke bescherming, de betekenis van Rome en de verhouding met Constantinopel geven context aan de nieuwe titel. Einhard schrijft achteraf vanuit de hofomgeving. Zijn voorstelling van Karels reactie op de kroning is ook een keuze van de biograaf en verdient kritiek naast andere getuigenissen.', 0, 1],
    ],
    questions: [
      ['bestuur', 'Militaire overwinning en duurzame machtsuitoefening verklaren', 0, choice(
        'Welk bewijs helpt het best om te toetsen of Frankisch gezag na een veldtocht in de regio bleef werken?',
        'Verspreide en gedateerde aanwijzingen voor lokale functionarissen, rechtspraak en blijvende samenwerking met regionale elites.',
        'De uitkomst van de veldtocht en daarna uitgeoefend bestuur zijn afzonderlijk aantoonbaar.',
        [['Alleen de titel die een vorst na de veldtocht aannam.', 'Een titel toont een aanspraak, met weinig detail over de uitvoering.'],
         ['De omvang van het leger bij het begin van de veldtocht.', 'Legergrootte zegt weinig over rechtspraak en samenwerking erna.'],
         ['Alleen een kaart van moderne landsgrenzen.', 'De kaart weerspiegelt andere politieke verhoudingen.']])],
      ['legitimiteit', 'Verschillende vormen van Karolingische legitimiteit verbinden', 1, essay(
        'Verklaar hoe opvolging, expansie en de kroning van 800 Karels positie versterkten. Toon ook waarom de militaire, lokale en kerkelijke context per voorbeeld verschilde.',
        'Na Karlomans dood kreeg Karel toegang tot een ruimer koninklijk machtsnetwerk. In Italië bood de Longobardische koningstitel een manier om een bestaand koninkrijk in zijn heerschappij op te nemen. In Saksen vergde langdurig verzet andere vormen van toezicht en vestiging van kerkelijke macht. De kroning door Leo III koppelde de Frankische macht aan Rome en een keizerlijke titel. De gevallen delen de nood aan plaatselijke medewerking, maar die had telkens een andere vorm.',
        [['Chronologische situering', 'Verbind 771, 774 en 800 met onderscheiden veranderingen.', 'Plaats de besluiten in een volgorde en geef het gevolg per datum.'],
         ['Institutionele verklaring', 'Vergelijk twee concrete vormen van lokale machtsvorming.', 'Beschrijf hoe functionarissen, elites of kerkelijke instellingen tussen vorst en regio handelden.'],
         ['Bronkritiek', 'Situeer Einhard bij het Karolingische hof en leg een beperking uit.', 'Maak onderscheid tussen gebeurtenis en de herinnering die de biograaf vormgeeft.']])],
    ],
  }),
  courseUnit({
    id: 'karolingisch-domeinen-en-arbeid', track: 'medieval', year: 790, period: '8e–9e eeuw', themes: ['economie', 'maatschappij', 'macht'],
    title: 'Karolingische domeinen: grond, arbeid en koninklijke middelen',
    summary: 'Veel middelen van het Karolingische hof kwamen uit landbouw en grondbezit. De exploitatie liep via beheerders en uiteenlopende vormen van arbeid en afdrachten. Het Capitulare de villis helpt de verwachtingen van het hof reconstrueren. Regionale documenten zijn nodig om de dagelijkse praktijk te begrijpen.',
    sources: [rule, production],
    sections: [
      ['Het domein als economische eenheid', 'Een landgoed kon verschillende percelen, werkplaatsen en afhankelijke huishoudens omvatten',
        'Een beheerder kon verplichtingen vastleggen, voorraden verzamelen en bepaalde producten laten afleveren. Mensen leverden arbeid of goederen afhankelijk van hun lokale positie en van de relatie tot het domein. De verhouding tussen de rechtstreeks beheerde gronden en de huishoudens moet per streek onderzocht worden.', 0, 1],
      ['Verslag uitbrengen', 'Verwachte informatie toont welke onderdelen van het beheer het hof wilde controleren',
        'De instructies over jaarlijkse opgaven gaan in op inkomsten, voorraden en goederen. Een opgave maakt beheer bespreekbaar en vergelijkbaar. Een voorschrift bewijst op zichzelf niet hoeveel werd afgeleverd of hoe vaak controle plaatsvond. Daarvoor zijn bewaarde inventarissen, rekeningen of vergelijkbare regionale bronnen nodig.', 0],
      ['Koninklijke uitgaven en distributie', 'Productie kon personeel, een reizend hof en plaatselijke voorzieningen ondersteunen',
        'Overdracht in natura vroeg opslag en transport. Daarvoor telden afstand, seizoensritme en bederfelijkheid. Ruil en marktverkeer konden naast afdrachten bestaan. De bedrijfsvorm van een groot koninklijk domein verklaart dus slechts een deel van de economie waarin dorpen, kleinere bezitters en handelaars ook actief waren.', 1],
      ['Schaal en variatie', 'Gebruik de bron op de schaal van de gezagsrelatie die ze beschrijft',
        'De voorwerpen en gewassen die een tekst opsomt, kunnen het gewenste beheer weerspiegelen. Klimaat, ligging en lokale vaardigheden beperkten de toepassing van zulke richtlijnen. Verschillen tussen inventarissen zijn relevante gegevens en vragen controle op periodes, soorten gronden en meeteenheden.', 0, 1],
    ],
    questions: [
      ['opgave', 'Een normatieve bron gebruiken voor economische geschiedenis', 0, choice(
        'Wat kan een bepaling die beheerders vraagt jaarlijks inkomsten te melden rechtstreeks aantonen?',
        'Het hof wilde periodieke informatie over het beheer. Voor de feitelijke uitvoering moet je opgaven en andere documenten vergelijken.',
        'De maatregel toont wat het hof wilde weten en organiseren.',
        [['Ieder domein leverde jaarlijks dezelfde hoeveelheid goederen.', 'Het document schrijft verslaggeving voor zonder een algemene opbrengst vast te leggen.'],
         ['De beheerders waren eigenaar van alle gerapporteerde bezittingen.', 'Een beheertaak houdt geen eigendom in.'],
         ['Het voorschrift geldt als steekproef voor alle boeren in het rijk.', 'De tekst beschrijft een beperkte institutionele verhouding.']])],
      ['vergelijking', 'Een verklaring over hofbevoorrading toetsen', 1, essay(
        'Leg uit hoe een koninklijk domein aan hofbevoorrading kon bijdragen. Ontwerp een bronnenvergelijking die nagaat welke verplichtingen in de praktijk werden uitgevoerd.',
        'De beheerder registreerde af te dragen goederen en organiseerde opslag of levering. Afstand en de route van het hof maakten gedeeltelijk plaatselijke verwerking of consumptie aannemelijk. Vergelijk categorieën in het Capitulare de villis met opgaven uit meerdere domeinen. Dateringen, maatstelsels en het doel van elk verslag moeten gecontroleerd worden. Een verschil kan wijzen op niet-naleving, maar ook op een andere lokale productie of registratie.',
        [['Mechanisme', 'Beschrijf de overdracht van een concreet goed of een dienst.', 'Verbind productie met een ontvanger via beheer, opslag en levering.'],
         ['Opzet', 'Vergelijk een voorschrift met minstens één soort praktisch administratief spoor.', 'Benoem hoe je overeenkomst of verschil zou herkennen.'],
         ['Nuance', 'Leg een alternatieve interpretatie van een ontbrekende categorie uit.', 'Controleer of de bron het gewas of de dienst überhaupt kon registreren.']])],
    ],
  }),
  courseUnit({
    id: 'karolingisch-kerk-onderwijs-en-schrift', track: 'medieval', year: 789, period: 'Ca. 780–850', themes: ['cultuur', 'maatschappij', 'methodes'],
    title: 'Kerk, onderwijs en handschriften in de Karolingische wereld',
    summary: 'Onder Karel de Grote werd kerkelijke hervorming verbonden met geleerdheid, correct tekstgebruik en liturgie. Bisschoppen, kloosters en hofkringen maakten deze keuzes praktisch. De Admonitio generalis en concrete handschriften helpen bepalen hoe ruim hun effecten reikten.',
    sources: [reform, psalms, west],
    sections: [
      ['Kerkelijke hervorming', 'Koninklijk gezag en bisschoppelijk toezicht kwamen samen rond correct gebruik van teksten en rituelen',
        'De Admonitio generalis van 789 maakt duidelijk dat vorming binnen kerkelijke instellingen een bestuurlijke en religieuze opdracht was. Instructies gingen onder andere over leren, liturgische vaardigheden en zorgvuldige boeken. Zij richten zich tot instellingen en hun personeel binnen een bepaalde gezagsstructuur.', 0, 1],
      ['Wat scholen inhielden', 'Leerpraktijken waren gekoppeld aan de behoeften van een instelling',
        'Leren lezen, zingen en schrijven maakte gebruik van specifieke teksten en oefeningen. Bij een kerk kon dat betekenen dat leerlingen psalmen instudeerden via herhaling en begeleiding. De bron geeft geen bevolkingsbrede statistiek over geletterdheid. Wie toegang onderzocht, moet achterhalen welke groepen in verschillende centra aanwezig konden zijn.', 0, 1],
      ['Handschriften maken en gebruiken', 'Een handschrift toont sporen van afzonderlijke handelingen',
        'Een kopiist selecteerde een exemplaar, bracht tekst over en kon correcties aanbrengen. Correcties in de marge, annotaties en hergebruik vertellen meer over het latere werk met een tekst dan over een voorgenomen norm. De verspreiding van een leesbare schriftvorm is te volgen via herkomst en datering van handschriften.', 0, 2],
      ['Reikwijdte van de verandering', 'Karolingische renaissance is een verzamelbegrip voor aantoonbare cultuuringrepen',
        'Hofkring, kerkelijk onderwijs en handschriftenproductie hadden oudere wortels en groeiden ongelijk. Het label maakt een samenhangende vraag mogelijk, maar vereist controle van wie deelnam en waar verandering daadwerkelijk zichtbaar was. Ook de betekenis van bepaalde woorden in voorschriften kan historiografisch omstreden zijn.', 1, 2],
    ],
    questions: [
      ['praktijk', 'Voorschrift en handschrift samen lezen', 1, choice(
        'Welke combinatie legt het best een verband tussen een oproep tot tekstcorrectie en de uitvoering ervan?',
        'Een gedateerd voorschrift naast nauwkeurig gesitueerde handschriften met aantoonbare correcties en aanwijzingen voor het gebruik.',
        'Beide bronnen krijgen eerst een eigen datering en herkomst. Pas daarna kun je de samenhang onderzoeken.',
        [['Dezelfde oproep in twee moderne samenvattingen.', 'Twee afgeleide teksten leveren geen bewijs voor de uitvoering.'],
         ['Eén goed leesbare letter in een manuscript zonder bekende herkomst.', 'Leesbaarheid verbindt het stuk nog niet met een bepaalde praktijk of plaats.'],
         ['Een later overzicht van de koningen van Frankrijk.', 'De bronsoort documenteert de schrijfpraktijk niet.']])],
      ['geletterdheid', 'De sociale reikwijdte van hervormingen beoordelen', 0, essay(
        'In welke zin kan de Karolingische hervorming het leren veranderd hebben? Leg uit welke uitspraak over geletterdheid je met de Admonitio generalis en een handschrift wel kunt verdedigen.',
        'De Admonitio generalis toont een gezagsimpuls om onderwijs en liturgische routines te verbeteren. Een lokaal handschrift kan laten zien dat een tekst er gecorrigeerd, bestudeerd of voor een opdracht gekopieerd werd. Die combinatie kan institutioneel leren zichtbaar maken. Zij laat niet tellen welk deel van alle inwoners kon lezen. Gegevens over productie en concreet gebruik moeten ook buiten een elitecentrum worden gezocht.',
        [['Broncontext', 'Situeer het voorschrift in 789 en het handschrift in zijn eigen gebruiksomgeving.', 'Vermeld de actoren en bepaal welke informatie elke bron levert.'],
         ['Reikwijdte', 'Maak onderscheid tussen een aantoonbare praktijk en verspreiding over de bevolking.', 'Formuleer een conclusie voor één instelling en zeg welke vergelijking nodig is om haar uit te breiden.']])],
    ],
  }),
  courseUnit({
    id: 'karolingisch-opvolging-en-regionale-macht', track: 'medieval', year: 843, period: '814–ca. 900', themes: ['macht', 'economie', 'cultuur'],
    title: 'Van Karolingische eenheid naar regionale koninkrijken',
    summary: 'De opvolging na Karel de Grote leidde tot conflicten, onderhandelingen en nieuwe machtscentra. Verdun in 843 is een keerpunt in de dynastieke verdeling. Rond 900 werkten Karolingische bestuurstradities door in een landschap waarvan de politieke verhoudingen op meerdere momenten veranderden.',
    sources: [west, production, reform],
    sections: [
      ['Erfgenamen en samenwerking', 'De erfenis omvatte uiteenlopende gebieden en rangen',
        'Lodewijk de Vrome erfde de keizerlijke positie in 814. Discussies over de plaats van zijn zonen leidden tot wisselende bondgenootschappen en gewapende conflicten. Aristocratische volgelingen hechtten belang aan ambten, bescherming en plaatselijke machtsbases. Een dynastieke regeling moest daarom door levende machtsverhoudingen worden gedragen.', 0],
      ['Verdun en daarna', 'Het akkoord van 843 verdeelde de heerschappij tussen drie broers',
        'West- en Oost-Francië waren afzonderlijke koninkrijken en Lotharius kreeg een middenrijk en de keizerlijke titel. Ook na Verdun werden gebieden overgedragen en opnieuw verdeeld. Wie rond 900 de politieke geografie wil beschrijven moet de afzonderlijke veranderingen na 843 volgen. Een kaart van Verdun is daarvoor een vertrekpunt.', 0],
      ['Welke structuren doorwerkten', 'Een wisseling van vorst beëindigde oudere plaatselijke instellingen niet automatisch',
        'Graven, bisschoppen, kloosters en domeinbeheerders bleven middelen en informatie organiseren. Hun onderlinge verhoudingen konden veranderen doordat de opvolging andere toegang tot een hof of bescherming schiep. Schriftelijke en kerkelijke praktijken konden regionaal verder leven terwijl een politieke eenheid verdween.', 0, 1, 2],
      ['Een historische synthese', 'Gebruik politieke breuk en institutionele continuïteit op verschillende schaalniveaus',
        'Volg eerst veranderingen in de verdeling van koninklijke macht. Vergelijk daarna de gevolgen voor één lokale instelling, de toegang tot arbeid en de overdracht van geleerdheid. Een rijk kan politiek uiteenvallen terwijl bepaalde instellingen en contacten gedeeld blijven. Die continuïteit moet voor de gekozen plaatsen met bronnen onderbouwd worden.', 0, 1, 2],
    ],
    questions: [
      ['dateren', 'Een kaart van een politieke verdeling historisch situeren', 0, choice(
        'Welke broncombinatie past bij de reconstructie van politieke verhoudingen rond 900?',
        'De verdeling van 843 naast latere verdragen, opvolgingsgegevens en lokaal bewijs van gezag.',
        'Nieuwe informatie tussen 843 en 900 is nodig om grenzen, titels en de feitelijke reikwijdte te onderscheiden.',
        [['Alleen de kaart van Karels rijk op het moment van zijn kroning.', 'Die kaart hoort bij een eerdere heerser en politieke situatie.'],
         ['De namen van de moderne staten op dezelfde plaatsen.', 'Moderne namen leggen geen vroegmiddeleeuwse aanspraken vast.'],
         ['Eén kloosterinventaris als precieze rijksgrens.', 'Een inventaris heeft een ander bereik dan een politieke kaart.']])],
      ['verbanden', 'Politieke breuk, productie en geleerdheid in één argument verbinden', 0, essay(
        'Vergelijk de Karolingische wereld van ca. 800 met die van ca. 900. Werk één politieke breuk en twee vormen van veranderende continuïteit uit via domeinbeheer en kerkelijke cultuur.',
        'Rond 800 versterkte het keizerschap een samengestelde Frankische heerschappij. Na Verdun en latere herverdelingen oefenden meerdere vorsten macht uit. Beheerders en kerkelijke instellingen bleven lokaal middelen organiseren, maar hun ontvangers en afhankelijkheden konden veranderen. Schrift, liturgie en boekcultuur konden institutioneel doorwerken over nieuwe politieke grenzen. Een regionaal dossier moet tonen welke praktijken in het gekozen geval daadwerkelijk zijn voortgezet.',
        [['Diachronie', 'Plaats minimaal één opvolging en één territoriale verandering in de chronologie.', 'Verbind datering met het politieke proces.'],
         ['Synchronie', 'Leg één concrete samenhang tussen bestuur, productie en kerkelijke organisatie uit.', 'Volg een lokale instelling of een beheerder als aanknopingspunt.'],
         ['Bronkritiek', 'Wijs aan waar voorschriften of kaarten de praktijk slechts bij benadering documenteren.', 'Stel passend regionaal materiaal voor om een conclusie te toetsen.']])],
    ],
  }),
];
