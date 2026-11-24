import { reference } from './history-academic-model.js?v=14r3';
import { application as choice, courseUnit, essay } from './history-course-model.js?v=160';

const dartmouth = (lesson, title, section) => reference('Jeremy B. Rutter', title, 'Les ' + lesson + ', ' + section,
  'https://sites.dartmouth.edu/aegean-prehistory/lessons/lesson-' + lesson + '-narrative/');
const crete = reference('Sturt W. Manning', 'Formation of the Palaces', 'The Cambridge Companion to the Aegean Bronze Age, pp. 105–120, Introduction',
  'https://doi.org/10.1017/CCOL9780521814447.005', '2008');
const knossos = dartmouth(18, 'The Nature and Extent of Neopalatial Minoan Influence in the Aegean and Eastern Mediterranean Worlds', 'paleisfasen en oostelijke Middellandse Zee');
const cult = dartmouth(15, 'Minoan Religion', 'cultusplaatsen en de sarcofaag van Hagia Triada');
const signs = reference('Ester Salgarella', 'Writing in Bronze Age Crete: “Minoan” Linear A', '§§ 2–3, het schrift en zijn gebruik',
  'https://doi.org/10.1017/9781009520041', '2025');
const economy = reference('Cynthia W. Shelmerdine & John Bennet', 'Economy and Administration', 'The Cambridge Companion to the Aegean Bronze Age, pp. 289–309, inleiding en paleisadministratie',
  'https://www.cambridge.org/core/books/abs/cambridge-companion-to-the-aegean-bronze-age/economy-and-administration/78B9F1C2DDA5BB5CC83D06F150EA468B', '2008');
const maps = reference('Jeremy B. Rutter', 'Chronology Overview', 'tabellen Middle–Late Bronze Age en Neopalatial–Postpalatial',
  'https://sites.dartmouth.edu/aegean-prehistory/chronology/');
const ships = reference('The Metropolitan Museum of Art', 'Copper ingot', 'collectieobject 2001.370.1, objectbeschrijving over Uluburun',
  'https://www.metmuseum.org/art/collection/search/248493');
const contacts = reference('Joan Aruz, Sarah B. Graff & Yelena Rakic (red.)', 'Cultures in Contact', 'inleiding bij de digitale uitgave en bijdragen over paleisarchieven',
  'https://www.metmuseum.org/met-publications/cultures-in-contact-from-mesopotamia-to-the-mediterranean-in-the-second-millennium-bc', '2013');
const wilusa = reference('Trevor Bryce', 'Hittite Literary Evidence', 'The Cambridge Guide to Homer, pp. 339–340',
  'https://www.cambridge.org/core/books/abs/cambridge-guide-to-homer/hittite-literary-evidence/37462517BA9895BCE28F55C5F7A94924', '2020');
const crisis = reference('A. Bernard Knapp & Sturt W. Manning', 'Crisis in Context', 'American Journal of Archaeology 120.1, pp. 99–149, regionale casussen en conclusie',
  'https://doi.org/10.3764/aja.120.1.0099', '2016');
const collapse = dartmouth(28, 'The Collapse of Mycenaean Palatial Civilization and the Coming of the Dorians', 'bewijsmateriaal en verklaringen');
const after = dartmouth(29, 'The Aegean in the Twelfth Century B.C.', 'regionale veranderingen in de postpalatiale periode');
const lefkandi = reference('University of Oxford, Faculty of Classics', 'Lefkandi', 'onderzoek naar Xeropolis en de begraafplaatsen bij Toumba',
  'https://www.classics.ox.ac.uk/lefkandi');
const iron = reference('The Metropolitan Museum of Art', 'Ancient Greece, 1000 B.C.–1 A.D.', 'Key Events, ca. 1000–700 v.Chr.',
  'https://www.metmuseum.org/toah/ht/04/eusb.html', '2000');

export const aegeanLessons = [
  courseUnit({
    id: 'egeisch-kretenzische-centra', track: 'greek', year: -1590, period: 'Ca. 1600–1450 v.Chr.', themes: ['macht', 'economie', 'materiaal'],
    title: 'Kreta: paleiscentra, nederzettingen en productie',
    summary: 'Omstreeks 1600 v.Chr. functioneerden op Kreta verscheidene monumentale centra. Knossos, Phaistos en Malia waren onderdeel van nederzettingslandschappen. Vergelijk hun bouw, opslag en schriftgebruik om te bepalen welke organisatie er aantoonbaar is en waar de reconstructie begint.',
    sources: [crete, knossos, signs, maps],
    sections: [
      ['Van eerste naar nieuwe paleizen', 'De vroegste paleiscomplexen zijn ouder dan de periode die we hier bestuderen',
        'Archeologen onderscheiden protopalatiale en neopalatiale fasen met behulp van aardewerk, bouwvolgorden en stratigrafie. De scheidslijn valt niet op alle sites op hetzelfde kalenderjaar. Bij Phaistos veranderden bouwdelen na beschadiging of herbouw. In Knossos pasten bouwers een ouder complex herhaaldelijk aan. Wie twee plattegronden vergelijkt, moet daarom eerst vaststellen welke muren werkelijk gelijktijdig waren.', 0, 1, 3],
      ['Hoe een paleis functioneerde', 'De centrale hofruimte verbond vertrekken met verschillende functies',
        'Grote opslagvaten en magazijnen wijzen op georganiseerde voorraad. Werksporen en afgewerkte voorwerpen geven aanwijzingen voor gespecialiseerde productie. Dergelijke voorzieningen vragen arbeid en enige coördinatie. De schaal van de opslag zegt op zichzelf weinig over het aandeel van de totale oogst dat er terechtkwam. Opslag bij huishoudens of in andere gebouwen kan naast opslag in het complex hebben bestaan.', 0],
      ['Phaistos, Malia en Knossos', 'Het monumentale gebouw vormde slechts één onderdeel van het lokale landschap',
        'Buurten, werkplaatsen en kleinere centra geven redenen om ook buiten het paleisterrein te zoeken naar economische en administratieve activiteit. Een gebouw kan publieke samenkomsten, cultus en opslag combineren. Uit een gedeelde bouwvorm volgt geen rechtstreeks bewijs voor één bestuurscentrum dat het hele eiland controleerde. Wie politieke samenwerking of concurrentie wil aantonen, moet ook verspreiding, datering en toegang tot goederen vergelijken.', 0, 1],
      ['Schrift en overdracht van goederen', 'Lineair A documenteert handelingen selectief',
        'De tekens staan onder meer op kleitabletten en administratieve dragers. Cijfer- en goederentekens helpen om reeksen en hoeveelheden te herkennen. Onzekere lezing van veel tekens en vooral van de taal beperkt de reconstructie van eigendom, functies en gezagsrelaties. Dat vormt een wezenlijk verschil met het latere Lineair B.', 2],
    ],
    questions: [
      ['macht', 'Paleisinfrastructuur en politieke organisatie onderscheiden', 0, choice(
        'In twee Kretenzische centra liggen magazijnen naast een centrale hofruimte. Welke uitspraak blijft dicht bij dit bewijs?',
        'Beide centra beschikten over infrastructuur voor georganiseerde opslag. De politieke verhouding tussen de centra vraagt aanvullende gegevens.',
        'De combinatie van opslag en monumentale bouw ondersteunt lokale coördinatie. Voor politieke onderwerping heb je aanwijzingen voor afhankelijkheid of gezagsuitoefening nodig.',
        [['Hetzelfde grondplan bewijst dat het ene centrum het andere bestuurde.', 'Gelijkenis kan ook voortkomen uit gedeelde bouwpraktijken.'],
         ['Magazijnen bewijzen dat alle huishoudens hun complete oogst afdroegen.', 'De totale productie en verschillende vormen van opslag blijven onbekend.'],
         ['De centrale hofruimte identificeert een concrete vorst.', 'Een plattegrond vermeldt geen naam, titel of regeringsgebied.']])],
      ['opslag', 'Een hypothese over redistributie toetsen', 0, essay(
        'Formuleer een hypothese over paleisgebonden redistributie in een Kretenzisch centrum. Geef aan welke vondsten je nodig hebt om de reikwijdte ervan te beoordelen.',
        'Magazijnen en registratiedragers wijzen op opslag en het volgen van goederen. Een toetsbare hypothese is dat het centrum een deel van bepaalde producten verzamelde en naar werkplaatsen of ontvangers doorgaf. Vergelijk capaciteit en verspreiding van opslag tussen paleis en woonwijken en zoek aanwijzingen voor in- en uitgaande goederen. Een inventaris alleen toont ontvangst of voorraad, terwijl voor herverdeling ook uitgifte moet worden aangetoond.',
        [['Definitie', 'Maak ontvangst, opslag en uitgifte afzonderlijk herkenbaar.', 'Benoem wat het centrum met ontvangen goederen zou doen.'],
         ['Vergelijking', 'Gebruik bewijs uit minstens twee ruimtelijke contexten.', 'Vergelijk het complex met huishoudens of werkplaatsen in hetzelfde tijdvak.'],
         ['Reikwijdte', 'Leg uit wat nodig is om het aandeel van het centrum te schatten.', 'Bespreek welke lokale productie en opslag door jouw bronnen buiten beeld blijven.']])],
    ],
  }),
  courseUnit({
    id: 'egeisch-kreta-1450', track: 'greek', year: -1450, period: 'Ca. 1500–1200 v.Chr.', themes: ['macht', 'cultuur', 'materiaal'],
    title: 'Kreta na ca. 1450 v.Chr.: verwoesting, bestuur en ritueel',
    summary: 'De verwoestingen op Kreta tegen het einde van Laat-Minoïsch IB gingen samen met ingrijpende veranderingen. Knossos volgde een eigen traject. De datering van de verschillende archieven en bouwfasen bepaalt welke uitspraken over macht en culturele continuïteit houdbaar zijn.',
    sources: [knossos, signs, cult, crisis],
    sections: [
      ['Het ritme van de verwoestingen', 'De overgang moet per vindplaats worden gereconstrueerd',
       'Brand, instorting en het beëindigen van gebruik laten verschillende archeologische sporen achter. Een laag aan het einde van een aardewerkfase geeft een volgorde en een benadering in kalenderjaren. Ze identificeert op zichzelf geen aanvaller. Sommige gebouwen kregen een nieuwe functie of werden opnieuw bewoond. Voor een verklaring moet men dus de omstandigheden vóór en na elke breuk vergelijken.', 0, 3],
      ['Knossos en Lineair B', 'De taal van de administratie vormt een concreet aanknopingspunt',
       'In een latere fase gebruikte het centrum van Knossos Lineair B, waarin een vroege vorm van het Grieks is opgetekend. Dat ondersteunt een verschuiving in de paleisadministratie. De schrijftaal kan samengaan met mobiliteit, nieuwe elites of nieuwe bestuurlijke gewoonten. Ze volstaat niet om de bevolkingssamenstelling van het eiland vast te stellen. Ook de onderlinge datering van de archiefgroepen is belangrijk voor de vraag hoe lang bepaalde praktijken voortduurden.', 0, 1],
      ['Ritueel en beeldtaal', 'Een grafvoorwerp laat keuzes zien die samenhangen met zijn gebruik',
       'De beschilderde sarcofaag van Hagia Triada toont rituele handelingen, waaronder offers. Het tafereel helpt om te vragen welke handelingen in een bijzondere grafcontext benadrukt werden. Het vertelt minder rechtstreeks wie elders rituelen uitvoerde, wie deelnam en welke namen men voor godheden gebruikte. Dat vergt vergelijking met vindcontexten en andere bronnen.', 2],
      ['Verder na het paleis', 'Het einde van een archief en het einde van bewoning zijn verschillende dateringen',
       'Een paleiscentrum kan zijn bovenlokale bestuur verliezen terwijl de omgeving bewoond blijft. De vraag naar het Knossos van rond 1200 v.Chr. vraagt daarom om afzonderlijk bewijs voor actief bestuur, bewoning en contacten. De neopalatiale situatie uit een eerdere eeuw kan niet zonder meer worden teruggeprojecteerd.', 0, 3],
    ],
    questions: [
      ['schrift', 'De bewijskracht van een schrijftaal afbakenen', 1, choice(
        'Welke conclusie over Knossos wordt rechtstreeks gedragen door in Lineair B geschreven administratieve tabletten?',
        'Een deel van de administratie hield registraties bij in een vroege vorm van het Grieks.',
        'Taal en administratieve inhoud zijn leesbaar. Groepsidentiteiten en de verdeling van gesproken talen vragen ander bewijs.',
        [['De bevolking van heel Kreta sprak uitsluitend Grieks.', 'Een archief vertegenwoordigt een specifieke institutionele praktijk.'],
         ['De datering van alle brandlagen op het eiland ligt hiermee vast.', 'Per gebeurtenis is een onafhankelijk gedateerde context nodig.'],
         ['Alle oudere administratieve termen kregen dezelfde betekenis.', 'Gelijksoortige tekens of praktijken verzekeren geen overeenkomst van betekenissen.']])],
      ['verandering', 'Continuïteit en breuk onderbouwen', 0, essay(
        'Verklaar waarom een combinatie van een verwoestingslaag, een later archief en een elitegraf een betere reconstructie oplevert dan één van die bronnen apart.',
        'Een verwoestingslaag dateert een plaatselijke materiële breuk. Het nieuwe archief geeft een aanwijzing voor bestuurlijke praktijk en schrijftaal. De grafcontext toont keuzes van een bepaalde groep. Controleer eerst of de drie vondsten dicht genoeg bij elkaar liggen in plaats en tijd. Een model kan bestuurlijke verandering combineren met continuïteit in sommige rituelen. Andere scenario’s blijven mogelijk zolang een directe identificatie van migranten of machthebbers ontbreekt.',
        [['Datering', 'Behandel de drie vondsten als afzonderlijk gedateerde contexten.', 'Geef aan welke chronologische relatie je nodig hebt voor een causale conclusie.'],
         ['Bewijskracht', 'Benoem één concrete vaststelling die elke bron ondersteunt.', 'Maak onderscheid tussen gebouwen, administratieve taal en ritueel.'],
         ['Alternatieven', 'Verklaar welke verschillende scenario’s dezelfde gegevens zouden kunnen opleveren.', 'Vergelijk bijvoorbeeld personeel, politieke controle en bevolkingsmobiliteit.']])],
    ],
  }),
  courseUnit({
    id: 'egeisch-myceense-paleizen', track: 'greek', year: -1350, period: 'Ca. 1600–1200 v.Chr.', themes: ['macht', 'economie', 'maatschappij'],
    title: 'Myceense macht: Mycene, Tiryns, Pylos en Thebe',
    summary: 'De Myceense wereld bestond uit meerdere politieke centra en uit gebieden zonder monumentaal paleis. De combinatie van gebouwen, graven en administratieve archieven maakt de organisatie van enkele machtscentra zichtbaar. Pylos biedt een gedetailleerde, plaatselijke inkijk in een paleiseconomie.',
    sources: [economy, maps, knossos],
    sections: [
      ['Een ongelijke opkomst', 'Vroege elitegraven en latere paleiscomplexen tonen verschillende vormen van machtsvorming',
       'De concentratie van kostbaarheden in vroege graven wijst op ongelijkheid en de toegang van elites tot goederen en vaklieden. Voor een territoriale administratie is ander bewijs nodig. In de latere bronstijd beschikten verschillende centra, onder meer Mycene en Tiryns in de Argolis, Pylos in Messenië en Thebe in Boeotië, over monumentale gebouwen en in een aantal gevallen omvangrijke archieven. Hun relaties en territoriale reikwijdte verschillen per regio.', 0, 1],
      ['Titels en personeel', 'De functie van de wanax wordt uit vermeldingen en context afgeleid',
       'In Lineair B verwijst wa-na-ka naar een hooggeplaatste figuur. De vindcontext en combinaties met grond, goederen en rituele verplichtingen maken een centrale positie aannemelijk. Het bronnenmateriaal biedt geen systematisch overzicht van opvolging, de verhouding tot andere vorsten of alle besluitvorming. Ook andere functionarissen, lokale groepen en producenten krijgen een plaats in de administratie.', 0],
      ['Pylos en zijn districten', 'Administratieve categorieën maakten lokale middelen bestuurbaar',
       'Tabletten groeperen plaatsen en verplichtingen. Door toponiemen, distributie van grond en leveringen naast elkaar te leggen is een bestuursgebied te reconstrueren dat verder reikte dan het paleis. Grenzen op een moderne kaart blijven benaderingen. Dorpen verschijnen vooral voor zover zij in een concrete telling of opdracht relevant waren.', 0],
      ['Monumenten en organisatie', 'Tiryns en Pylos maken uiteenlopende keuzes in zichtbaarheid en verdediging',
       'Vestingbouw in de Argolis vraagt aanzienlijke coördinatie van materiaal en arbeid. De plattegrond van het paleis bij Pylos laat beheer, opslag en representatie onderzoeken met een grotendeels ander soort bewijsmateriaal. Een vergelijking moet de lokale ligging en het doel van bouwwerken meenemen. Monumentaliteit is een indicatie van middelen en organisatie, geen maat voor bevolkingsomvang of territoriale grootte.', 0, 1],
    ],
    questions: [
      ['organiseren', 'Het bereik van de Myceense paleizen verklaren', 0, choice(
        'Pylische tabletten groeperen bijdragen per plaats. Wat kan deze groepering helpen aantonen?',
        'Bijdragen werden administratief naar herkomst gevolgd. De gegevens kunnen helpen het netwerk van aangesloten plaatsen te reconstrueren.',
        'De ruimtelijke spreiding van toponiemen en verplichtingen maakt aansluiting bij het paleis onderzoekbaar.',
        [['Elke plaats had dezelfde rechten en hetzelfde bestuur.', 'De registratie-instelling uniformiseert haar categorieën. Plaatselijke regels worden niet beschreven.'],
         ['De volledige grens valt samen met de buitenste genoemde dorpen.', 'Een archief bevat een selectie. Vermelde plaatsen leggen geen grenslijn vast.'],
         ['Alle Myceense paleizen ressorteerden onder Pylos.', 'Deze tabletten registreren een plaatselijke administratie.']])],
      ['macht', 'Institutionele verklaringen vergelijken', 0, essay(
        'Vergelijk de mogelijkheden om machtsuitoefening te reconstrueren voor Pylos en voor een regio zonder bewaard paleisarchief. Betrek architectuur en sociale organisatie.',
        'Voor Pylos kunnen plaatsen, bijdragen en categorieën uit het archief verbonden worden met opslag, werkplaatsen en publieksruimtes. In een regio zonder archief kunnen de spreiding van nederzettingen, bouwkosten en begrafenispraktijken ongelijkheid en coördinatie zichtbaar maken. Een sterker centraal bestuur blijft een hypothese zolang aanwijzingen voor terugkerende afdrachten of ondergeschikte vestigingen schaars zijn. Verschillen in bewaring kunnen een deel van het contrast verklaren.',
        [['Pylos', 'Verbind een administratief spoor met een mechanisme van coördinatie.', 'Noem een registercategorie en leg uit waarvoor die kon worden gebruikt.'],
         ['Vergelijkingsgebied', 'Gebruik twee relevante materiële indicatoren.', 'Vergelijk bouwinvesteringen en rijkdomsspreiding in gelijktijdige vindcontexten.'],
         ['Archiefbias', 'Maak verschil tussen bestuurlijk bereik en overlevering.', 'Benoem onder welke omstandigheden een archief bewaard kan blijven.']])],
    ],
  }),
  courseUnit({
    id: 'egeisch-lineair-b-economie', track: 'greek', year: -1280, period: 'Ca. 1400–1200 v.Chr.', themes: ['economie', 'maatschappij', 'cultuur'],
    title: 'Lineair B: productie, arbeid en ritueel in de Myceense economie',
    summary: 'Lineair B-tabletten registreren goederen, toegewezen werk en mensen die voor de administratie relevant waren. Ze laten zien hoe een paleis tussen grondstoffen, personeel en ontvangers bemiddelde. De bewaarde teksten tonen slechts geselecteerde verrichtingen en een korte tijdshorizon.',
    sources: [economy, cult, signs],
    sections: [
      ['Van klei naar archief', 'De overlevering hangt samen met het gebruik en de vondstomstandigheden',
       'Veel tabletten werden op klei geschreven voor kortdurend gebruik. Bij verwoestingsbranden konden tabletten hard worden. Daardoor ziet de historicus op sommige sites een momentopname van de laatste administratie. Ontbrekende reeksen kunnen vroeger zijn gewist of ongebakken verloren zijn gegaan. Het is riskant drie jaar productie uit één toevallig bewaarde dossiergroep af te leiden.', 0],
      ['Grond, kudden en werk', 'Registratie maakte toegewezen productie controleerbaar',
       'In verschillende dossiers komen kudden, textiel, land en personeel voor. Bij registratie van textiel kunnen de toewijzing van grondstoffen en de verwachtingen over afgewerkt product uit elkaar worden gehouden. Vrouwen verschijnen in bepaalde werk- en rantsoengroepen. Die beschrijvingen leveren bewijs voor paleisgebonden arbeid, terwijl status, woonplaats en vrijheid afzonderlijk gereconstrueerd moeten worden.', 0],
      ['Redistributie en marktvragen', 'Het archief belicht transacties waarbij het paleis betrokken was',
       'Het kan ontvangsten, toewijzingen, verplichtingen en voorraden documenteren. Het laat weinig ruimte voor ongeregistreerde uitwisseling tussen huishoudens of gemeenschappen. Een dominant paleis in het eigen archief bewijst dus op zichzelf geen monopolie op verkrijging, ambacht of handel. Vergelijk ambachtelijke resten en consumptiepatronen buiten het paleis alvorens de reikwijdte te bepalen.', 0],
      ['Offergaven en ontvangers', 'Religieuze verplichtingen komen in administratieve categorieën terecht',
       'Geregistreerde leveringen aan cultische ontvangers verbinden ritueel met productie en bestuur. De teksten zijn geen liturgische handleiding. Gebouwen, depots, offerresten en afbeeldingen kunnen andere delen van de handeling verduidelijken. Een vermelding van een goddelijke ontvanger zegt bijvoorbeeld weinig over wie het ritueel mocht bijwonen.', 0, 1],
    ],
    questions: [
      ['arbeid', 'Toewijzingen en economische afhankelijkheid uitleggen', 0, choice(
        'Een reeks vermeldt grondstoffen en een verwachte hoeveelheid eindproducten. Welke verklaring past bij het bewijs?',
        'Het paleis controleerde deze toegewezen productie langs twee kanten, bij de uitgifte van middelen en bij de verwachte opbrengst.',
        'Grondstoffen en output in hetzelfde dossier ondersteunen administratieve controle over de genoemde arbeid.',
        [['Het paleis controleerde daardoor alle textielproductie.', 'De omvang van productie buiten de geregistreerde opdracht blijft onbekend.'],
         ['De teksten geven een volledig verslag over meerdere jaren.', 'Een afgebakende reeks kan één verslagperiode bestrijken.'],
         ['De hoeveelheid grondstof volstaat om de juridische status van de arbeiders af te leiden.', 'Juridische status vereist eigen aanwijzingen.']])],
      ['archief', 'Een selectief archief gebruiken voor economische geschiedenis', 0, essay(
        'Een onderzoeker stelt dat de paleizen alle textielproductie beheerden. Hoe toets je dit met Lineair B en archeologisch bewijs?',
        'Lineair B ondersteunt beheer van geregistreerde opdrachten via grondstoffen, arbeid en opbrengst. Voor de totale productie moet je weten welke activiteiten buiten de registratie vielen. Vergelijk daarom datering, verspreiding en hoeveelheden van spin- en weefgereedschap binnen en buiten het paleis. Gereedschap in een woning kan eigen productie of uitvoering van een paleisopdracht aantonen. De combinatie maakt het mogelijk de sterkste stelling af te zwakken of nader te toetsen.',
        [['Archief', 'Maak de gedocumenteerde verhouding tussen administratie en productie concreet.', 'Noem welke middelen en welk resultaat worden gevolgd.'],
         ['Archeologie', 'Stel een ruimtelijke vergelijking voor en bespreek een tweede verklaring.', 'Zet huishoudelijke vondsten naast paleisvondsten en controleer gelijktijdigheid.'],
         ['Schaal', 'Formuleer een conclusie met een begrensde reikwijdte.', 'Leg uit welk bewijs voor een monopolie nog ontbreekt.']])],
    ],
  }),
  courseUnit({
    id: 'egeisch-uiluburun-amarnanetwerk', track: 'history', year: -1330, period: 'Ca. 1500–1200 v.Chr.', themes: ['wereld', 'economie', 'macht'],
    title: 'Egypte, Cyprus en de Levant: diplomatie en maritieme uitwisseling',
    summary: 'De contacten rond de oostelijke Middellandse Zee liepen via hoven, havensteden en routes naar het binnenland. Het Amarna-archief en het wrak van Uluburun belichten verschillende schakels. Een vergelijking maakt inzichtelijk hoe politieke relaties, toegang tot grondstoffen en transport op elkaar konden inwerken.',
    sources: [contacts, ships, crisis],
    sections: [
      ['Een archief in Egypte', 'De Amarnabrieven laten internationale betrekkingen vanuit één hof zien',
       'Koningen uit Egypte, Babylonië, Assyrië, Mitanni en het Hettitische rijk gingen in deze wereld relaties aan met wisselende macht en belangen. Correspondentie behandelde gezanten, geschenken en huwelijksrelaties. Kleinere machthebbers in de Levant gebruikten brieven onder meer om steun te vragen. Wie verschillende brieven vergelijkt, moet letten op de status van afzender en ontvanger en op de formule waarmee een verzoek wordt voorgesteld.', 0],
      ['De rol van Cyprus en havens', 'Grondstoffen verbonden productie en transport',
       'Cyprus leverde in de late bronstijd koper voor netwerken waarin ook de Levant, Anatolië, Egypte en de Egeïsche wereld een rol speelden. Uluburun documenteert vervoer van omvangrijke hoeveelheden koper naast andere producten en kostbaarheden. De lading maakt specifieke materiaalstromen zichtbaar. Het precieze reisplan en de politieke identiteit van reder, klanten of opvarenden blijven moeilijker te achterhalen.', 0, 1],
      ['Geschenk, levering en handel', 'Eenzelfde soort voorwerp kan in verschillende verhoudingen circuleren',
       'Een koning kon kostbaarheden aan een ander hof sturen om status en wederkerigheid te bevestigen. Een producent, tussenpersoon of schipper kon goederen rechtstreeks doorgeven of vervoeren. De archeologische verspreiding maakt de bestemming van een voorwerp soms aannemelijk, terwijl de overeenkomst achter de transactie meestal bijkomend bewijs vraagt. Vergelijk formuleringen over geschenken met de materiële samenstelling van de lading.', 0, 1],
      ['Kwetsbaarheid en aanpassing', 'Het verdwijnen van een afnemer veranderde bepaalde circuits',
       'Wie de gevolgen van politieke breuken onderzoekt, moet onderscheid maken tussen de val van individuele paleizen, veranderingen in havenactiviteiten en de voortzetting van regionale uitwisseling. Sommige routes werden verlegd en verschillende centra bleven actief. Daaruit volgt een onderzoeksopdracht per product, regio en tijdvak.', 2],
    ],
    questions: [
      ['contact', 'Diplomatieke en materiële sporen vergelijken', 1, choice(
        'Het wrak bevat koper van Cypriotische herkomst. Wat kan met deze vaststelling op zichzelf worden geconcludeerd?',
        'Koper met die herkomst viel in dit geval binnen een maritieme goederencirculatie.',
        'De herkomst van het metaal is een andere aanwijzing dan de juridische verhouding tussen de partijen op het schip.',
        [['Cyprus bestuurde de haven die het schip als laatste verliet.', 'Herkomst van het metaal en politieke controle over de haven zijn verschillende vragen.'],
         ['Het schip voer uitsluitend om koninklijke geschenken af te leveren.', 'Doel en eigenaar vereisen gegevens over de organisatie van de reis.'],
         ['De handel werd door het Egyptische hof gemonopoliseerd.', 'Een lading kan geen uitspraak over een netwerkmonopolie dragen.']])],
      ['synthese', 'Een netwerk verklaren aan de hand van twee soorten bronnen', 0, essay(
        'Vergelijk wat het Amarna-archief en de lading van Uluburun tonen over macht en internationale uitwisseling in de late bronstijd. Welke schakel blijft het moeilijkst te reconstrueren?',
        'Brieven verduidelijken de taal van relaties tussen hoven en de functie van gezanten en geschenken. Het wrak laat zien welke soorten producten en hoeveelheden schippers konden vervoeren. Voeg voorbeelden toe voor de politieke verhouding in correspondentie en de herkomst van koper. Een lastige schakel is wie in een individueel geval transport en overdracht organiseerde. Daarvoor moet je een transactie aan zowel een lading als een archief kunnen koppelen.',
        [['Vergelijking', 'Beschrijf voor beide bronnen een concreet mechanisme van contact.', 'Gebruik de relatie tussen afzender en ontvanger en de herkomst van het materiaal.'],
         ['Schaal', 'Leg uit welke delen van het netwerk beide bronnen wel documenteren.', 'Maak hun geografische en institutionele uitgangspunten duidelijk.'],
         ['Onzekerheid', 'Benoem een gerichte vraag waarvoor de bronnen onvoldoende samenkomen.', 'Formuleer bewijs waarmee één bepaalde transactie te identificeren zou zijn.']])],
    ],
  }),
  courseUnit({
    id: 'egeisch-wilusa-hatti', track: 'history', year: -1260, period: 'Ca. 1400–1180 v.Chr.', themes: ['macht', 'wereld', 'methodes'],
    title: 'Anatolië: Hatti, Wilusa en de grenzen van het Troje-bewijs',
    summary: 'Vanuit Hattusa sloot het Hettitische hof verdragen met vorsten in verschillende delen van Anatolië. Wilusa komt voor in dat politieke landschap. De identificatie met Troje is een historisch-geografische hypothese waarvan de argumenten onderscheiden moeten worden van latere epische tradities.',
    sources: [wilusa, contacts, crisis],
    sections: [
      ['Hatti en westelijk Anatolië', 'Invloed werd uitgeoefend via relaties met plaatselijke machthebbers',
       'Een verdrag kon verplichtingen vastleggen rond trouw, wederzijdse bescherming en conflicten. Voor Wilusa biedt het verdrag met Alaksandu een aanwijzing voor een relatie met het Hettitische hof. Het document vertelt welke verhouding de partijen wilden vastleggen. De dagelijkse mate van zelfstandigheid en het verloop van alle conflicten vragen afzonderlijk bewijs.', 0],
      ['De identificatie van Wilusa', 'Taal en historische geografie versterken elkaar alleen als ze onafhankelijk toetsbaar zijn',
       'De mogelijke verwantschap van Wilusa met Grieks (W)ilios is één argument. Plaatsing in het noordwesten van Anatolië op grond van de relatieve ligging van genoemde plaatsen is een ander. De identificatie is gangbaar maar de interpretatie steunt op indirecte bewijsvoering. Zij verzekert geen identificatie van ieder in de teksten genoemde persoon of gebeurtenis.', 0],
      ['Ahhiyawa en toezicht op de kust', 'Een naam in Hettitische teksten verwijst naar een relatie die van document tot document varieert',
       'Ahhiyawa wordt vaak met een Myceense macht in verband gebracht. De precieze kern, de reikwijdte en de mate waarin de rol veranderde blijven voor discussie vatbaar. Contacten en rivaliteit langs de kust zijn beter onderzoekbaar dan de projectie van één verenigd Grieks rijk op heel de Egeïsche wereld.', 0, 1],
      ['Opgraving en epos', 'Verwoestingslagen en literaire motieven ondersteunen verschillende claims',
       'Stratigrafie geeft volgorde, materiële verandering en mogelijke schadeoorzaken. Het Griekse epos kreeg vorm en werd doorgegeven lang na het paleistijdvak. Overeenkomst van een naam of een belegeringsmotief maakt een episode onderzoekbaar als receptie. Een concrete gebeurtenis vereist aantoonbare verbanden tussen onafhankelijke, voldoende nauwkeurig gedateerde aanwijzingen.', 0, 2],
    ],
    questions: [
      ['geografie', 'Onafhankelijke aanwijzingen voor een plaatsidentificatie combineren', 0, choice(
        'Welke combinatie levert de sterkste argumentatie voor de identificatie Wilusa–Troje?',
        'Een verdedigbare taalkundige overeenkomst samen met een onafhankelijk gereconstrueerde ligging in noordwestelijk Anatolië.',
        'Geografie en taal kunnen elkaar ondersteunen als de ene redenering de andere niet als uitgangspunt neemt.',
        [['Een gelijkklinkende naam en herhaling van dezelfde naam in een moderne vertaling.', 'De vertaling herhaalt de eerste aanwijzing.'],
         ['Eén brandlaag en een veel later opgeschreven verhaal over een brand.', 'Een veelvoorkomend verwoestingsmotief identificeert een plaats niet.'],
         ['Een Griekse scherf in Anatolië en een naam uit een Hettitisch document.', 'Een scherf heeft zonder precieze context weinig bewijskracht voor een plaatsnaam.']])],
      ['kritiek', 'Een bronvergelijking opbouwen voor Troje', 0, essay(
        'Leg uit hoe verdragstekst, stratigrafie en epische traditie elk bijdragen aan een studie van Troje. Wat zou nodig zijn om één specifiek conflict historisch te identificeren?',
        'Een verdrag laat formele politieke relaties zien, een verwoestingslaag dateert materiële verandering en het epos maakt latere verhalen en waarden onderzoekbaar. Voor één conflict heb je onafhankelijke aanwijzingen nodig die in tijd en plaats samenkomen en de betrokken actoren of gebeurtenissen voldoende specifiek beschrijven. Chronologische of taalkundige overeenkomst alleen levert daarvoor onvoldoende precisie.',
        [['Bronsoorten', 'Geef per bron een verdedigbare onderzoeksvraag.', 'Vertrek van de functie en de context van elke bron.'],
         ['Datering', 'Maak duidelijk waarom een breed tijdvak onvoldoende is voor identificatie.', 'Noem welk smaller chronologisch verband je zou toetsen.'],
         ['Onafhankelijkheid', 'Vermijd cirkelredenering bij het samenbrengen van de bronnen.', 'Pas verschillende criteria toe vóór je een overeenkomst als bevestiging gebruikt.']])],
    ],
  }),
  courseUnit({
    id: 'egeisch-transformaties-rond-1200', track: 'greek', year: -1190, period: 'Ca. 1250–1050 v.Chr.', themes: ['macht', 'materiaal', 'wereld'],
    title: 'Rond 1200 v.Chr.: afbraak van paleissystemen en regionale veranderingen',
    summary: 'Aan het einde van de late bronstijd verdwenen verschillende paleisadministraties, onder meer op het Griekse vasteland. De verandering had een uiteenlopend ritme in de Egeïsche wereld, Cyprus, Anatolië en de Levant. Beoordeel afzonderlijk het politieke systeem, bewoning, productie, contacten en de beschikbaarheid van geschreven bronnen.',
    sources: [crisis, collapse, after, economy],
    sections: [
      ['Wat eindigde', 'De herkenbaarste breuk ligt in de instellingen die paleizen organiseerden',
       'In Pylos bleven na de verwoesting geen vergelijkbare reeksen lokale paleistabletten in gebruik. Elders zijn vernieling, herbouw of voortzetting anders gedateerd. Aardewerk en andere vormen van materiële cultuur bleven gedeeltelijk herkenbaar in de postpalatiale periode. Het verlies van het archief maakt sommige veranderingen juist moeilijker zichtbaar.', 0, 1, 3],
      ['Regionale tijdlijnen', 'De Levant en Cyprus bieden een vergelijking met andere uitkomsten',
       'Ugarit verdween als paleis- en archiefcentrum. Op Cyprus veranderde het nederzettingslandschap met zowel breuken als nieuwe of voortgezette activiteiten. Egypte documenteerde conflicten in koninklijke bronnen, maar behield na ca. 1200 v.Chr. belangrijke instellingen. De chronologie en schaal van veranderingen moeten voor iedere regio afzonderlijk worden onderzocht.', 0],
      ['Causale verklaringen', 'Oorzaak, versneller en gevolg kunnen op verschillende momenten optreden',
       'Voor kennis van droogte zijn plaatselijke klimaatarchieven en robuuste dateringen nodig. Een droogte kan opbrengsten aantasten, waarna schaarste, politieke rivaliteit of het wegvallen van leveringen elkaar versterken. Oorlog en mobiliteit vragen bewijs uit teksten en materiële contexten. Zelfs wanneer twee processen in dezelfde eeuw vallen, moet je aantonen welk mechanisme ze koppelt.', 0, 1],
      ['Wat “instorting” verklaart', 'Gebruik het begrip voor een expliciet omschreven verlies van organisatie',
       'Verdwijnen van een administratieve hiërarchie, terugval in specialistische productie en verandering in nederzettingen zijn afzonderlijke verschijnselen. Een model van een systeemcrisis kan nuttig zijn wanneer die veranderingen elkaar aantoonbaar versterken. Het model moet ook verklaren waarom uiteenlopende gemeenschappen verschillend reageerden.', 0, 2],
    ],
    questions: [
      ['oorzaken', 'Causale verbanden toetsen met onafhankelijke gegevens', 0, choice(
        'Een strandmeer registreert een droge fase nabij een haven die in dezelfde eeuw verlaten raakt. Welke vervolgstap is nodig om een verband aannemelijk te maken?',
        'Vergelijk de dateringsmarges en zoek onafhankelijk bewijs voor veranderde voedselproductie of aanvoer vóór de verlating.',
        'Samenloop helpt een hypothese formuleren. De chronologie en een mechanisme bepalen de sterkte van het causale argument.',
        [['Alle verwoestingen in de oostelijke Middellandse Zee aan dezelfde droogte toeschrijven.', 'De gegevens komen uit één regio en dateren slechts benaderend.'],
         ['De politieke structuur afleiden uit de hoeveelheid pollen.', 'Pollen geeft omgevingsinformatie en geen directe registratie van bestuur.'],
         ['De gemiddelde datering als exacte datum van alle gebeurtenissen gebruiken.', 'Daarmee verdwijnt de onzekerheid die juist relevant is voor de volgorde.']])],
      ['synthese', 'Regionale verschillen gebruiken om een instortingsmodel te beoordelen', 2, essay(
        'Beoordeel de stelling dat er rond 1200 v.Chr. één bronstijdinstorting was. Vergelijk een Egeïsche casus met Cyprus of de Levant en behandel de grenzen van het bewijs.',
        'Pylos toont via het verdwijnen van palatiale registraties een institutionele breuk. Het veranderende nederzettingsbeeld van Cyprus documenteert lokaal uiteenlopende uitkomsten, waaronder nieuwe activiteit. Dezelfde brede periode omvat dus verschillende processen. Een gedeeld mechanisme, zoals verstoring van leveringen of politieke samenwerking, moet met eigen chronologie en gegevens per regio getoetst worden.',
        [['Chronologie', 'Omschrijf de veranderingen met dateringsmarges en vergelijk dezelfde soort periode.', 'Geef per casus één dateerbaar spoor en de kwaliteit van die datering.'],
         ['Mechanisme', 'Onderscheid instituties, bevolking en uitwisseling.', 'Gebruik minstens twee van deze dimensies om het model te toetsen.'],
         ['Alternatieven', 'Formuleer een alternatieve verklaring of een concrete beperking.', 'Laat zien waarom één type bewijs verschillende ontwikkelingen kan weerspiegelen.']])],
    ],
  }),
  courseUnit({
    id: 'egeisch-vroege-ijzertijd', track: 'greek', year: -1050, period: 'Ca. 1100–800 v.Chr.', themes: ['maatschappij', 'cultuur', 'materiaal'],
    title: 'De vroege ijzertijd: bewoning, elitevorming en nieuwe netwerken',
    summary: 'Na het verdwijnen van de paleisadministraties bleven gemeenschappen in het Egeïsche gebied aardewerk produceren, land gebruiken en goederen uitwisselen. Vroege-ijzertijdsites zoals Lefkandi helpen om continuïteit, regionale verschillen en nieuwe vormen van elitevorming concreet te bestuderen.',
    sources: [after, lefkandi, iron, maps],
    sections: [
      ['Periodisering uit materiële cultuur', 'Submyceens, protogeometrisch en geometrisch zijn archeologische indelingen',
       'Veranderingen in vormen, decoratie en productie van aardewerk helpen lagen en contexten vergelijken. De overgang verschilt per regio en de benoemde categorieën stemmen niet één op één overeen met bevolkingsgroepen of politieke instellingen. Afwezigheid van import kan zowel minder contacten als een verandering in consumptiepatronen of vondstomstandigheden weerspiegelen.', 0, 2, 3],
      ['Archeologie van bewoning', 'Continuïteit kan op één schaal samengaan met verandering op een andere',
       'Een nederzetting kan verhuizen zonder dat de regio wordt verlaten. Verschillen in bevolkingsomvang worden onder meer afgeleid uit spreiding van sites en grafvelden. Kleine of kort bewoonde locaties zijn vaak moeilijker te vinden dan permanente huizen of monumentale graven. Het aantal vindplaatsen blijft daarom een indirecte maat voor demografie.', 0, 3],
      ['Lefkandi en Toumba', 'Een uitzonderlijke grafcontext geeft een specifiek zicht op middelen en contacten',
       'Op Euboia bestond bij het huidige Lefkandi een langdurige nederzetting. De grafcontext bij Toumba, met uitzonderlijke offers en voorwerpen, maakt een hoge concentratie van middelen in een plaatselijke groep zichtbaar. Voorwerpen met externe herkomst wijzen op connecties. Zij geven geen direct bewijs voor de frequentie van handelsreizen of voor deelname van alle bewoners aan dezelfde contacten.', 1],
      ['Schrift, netwerken en terminologie', 'Het bronnenverlies is ongelijk verdeeld',
       'De administratieve schriftpraktijk van Lineair B verdween met de paleizen. In de achtste eeuw leveren vroeg-Griekse alfabetische inscripties andere gebruikscontexten. Het begrip “Dark Ages” wijst op beperkte geschreven bronnen en werkt misleidend wanneer het voor algemene maatschappelijke stilstand staat. Leg daarom per onderwerp uit welk soort bron beschikbaar is.', 0, 1, 2],
    ],
    questions: [
      ['elite', 'De draagwijdte van een uitzonderlijk graf beoordelen', 1, choice(
        'Een opvallend graf bevat goederen met externe herkomst. Welke gevolgtrekking is het sterkst?',
        'De betrokken groep kon goederen uit externe netwerken bijeenbrengen. Het graf toont hoe die toegang in een bijzondere rituele context werd uitgedrukt.',
        'Herkomst en begrafeniscontext zijn specifiek. Om algemene handelsvolumes te schatten zijn nederzettingsreeksen en meerdere vondstcontexten nodig.',
        [['Ieder huishouden bezat vergelijkbare importgoederen.', 'Een uitzonderlijk graf vormt geen representatieve huishoudensteekproef.'],
         ['Er bestond op het eiland weer een gecentraliseerd paleisbestuur.', 'Een rijk graf levert geen direct bewijs voor een bestuurlijke instelling.'],
         ['De eigenaar van het graf heeft alle goederen zelf opgehaald.', 'Herkomst bewijst geen individuele reisroute.']])],
      ['vergelijk', 'De vroege ijzertijd verklaren zonder de paleistijd als enige maatstaf te nemen', 1, essay(
        'Vergelijk de bronnen voor maatschappelijke organisatie in Myceens Pylos en in Lefkandi. Hoe verandert je historische vraag wanneer het soort bewijs verandert?',
        'In Pylos documenteren dossiers functies, productiegroepen en verplichtingen binnen het bereik van een paleis. In Lefkandi geven context en verspreiding van graven, gebouwen en voorwerpen aanwijzingen voor lokale elitevorming en contacten. In plaats van dezelfde administratieve hiërarchie te zoeken, kun je vergelijken hoe arbeid en middelen zichtbaar worden gemaakt en welke groepen het bronnenbestand selecteert.',
        [['Pylos', 'Gebruik een administratief mechanisme als voorbeeld met beperkte reikwijdte.', 'Verbind een registratie met arbeid of grondstoffen.'],
         ['Lefkandi', 'Verbind materiële context met een toetsbare claim over ongelijkheid of connecties.', 'Maak duidelijk wie in een uitzonderlijk graf vermoedelijk vertegenwoordigd is.'],
         ['Vergelijkbaarheid', 'Benoem welke vraag door beide soorten bewijs gedragen kan worden.', 'Vermijd een rechtstreekse vergelijking van instellingen die in slechts één bron voorkomen.']])],
    ],
  }),
].map(lesson => ({ ...lesson, curriculum: 'aegean' }));
