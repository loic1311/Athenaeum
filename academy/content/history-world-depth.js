import { reference } from './history-academic-model.js?v=14r3';
import { application as choice, courseUnit, essay } from './history-course-model.js?v=160';
const text = (chapter, slug) => reference('Ann Kordas, Ryan J. Lynch, Brooke Nelson & Julie Tatlock', 'World History, Volume 1: to 1500', chapter,
  'https://openstax.org/books/world-history-volume-1/pages/' + slug, '2023');
const shang = text('§ 5.1, Ancient China, onderdeel The Shang Dynasty', '5-1-ancient-china');
const china = reference('UNESCO World Heritage Centre', 'Yin Xu', 'Outstanding Universal Value', 'https://whc.unesco.org/en/list/1114/');
const olmecs = text('§ 8.2, Early Cultures and Civilizations in the Americas, onderdeel The Olmec', '8-2-early-cultures-and-civilizations-in-the-americas');
const lorenzo = reference('The Metropolitan Museum of Art', 'Mesoamerica and Central America, 2000–1000 B.C.',
  'Heilbrunn Timeline, Key Events, item 1200–900 v.Chr.', 'https://www.metmuseum.org/toah/ht/03/ca.html', '2000');
const wari = reference('The Metropolitan Museum of Art', 'Central and Southern Andes, 500–1000 A.D.',
  'Heilbrunn Timeline, Key Events, Wari en Tiwanaku', 'https://www.metmuseum.org/toah/ht/06/sac.html');
const appian = reference('Appianus', 'Burgeroorlogen', 'Boek 1, §§ 7–13, vert. Horace White, LacusCurtius',
  'https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Appian/Civil_Wars/1*.html', '2e eeuw n.Chr.');
const plutarch = reference('Ploutarchos', 'Tiberius Gracchus', '§§ 8–12, vert. Bernadotte Perrin, LacusCurtius',
  'https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Plutarch/Lives/Tiberius_Gracchus*.html', 'ca. 100 n.Chr.');
const votes = reference('Belgische Senaat', 'Parlementsverkiezingen', 'Historische toelichting, 1831–1948', 'https://www.senate.be/doc/parlementsverkiezingen_nl.html');
const mobilization = reference('Belgische Senaat', '1831 tot 1893: Wie genoeg betaalt, beslist', 'De afschaffing van het cijnskiesstelsel',
  'https://www.senate.be/home/sections/geschiedenis_en_erfgoed/AES-SU/art-2-8_nl.html');

const haiti = reference('Ann Kordas, Ryan J. Lynch, Brooke Nelson & Julie Tatlock', 'World History, Volume 2: from 1400',
  '§ 7.3, Revolutions: America, France, and Haiti, onderdeel The Haitian Revolution',
  'https://openstax.org/books/world-history-volume-2/pages/7-3-revolutions-america-france-and-haiti', '2022');
const foreign = reference('Office of the Historian', 'The United States and the Haitian Revolution, 1791–1804',
  'Milestones in the History of U.S. Foreign Relations, revolutie en erkenning',
  'https://history.state.gov/milestones/1784-1800/haitian-rev');

export const worldDepthLessons = [
  courseUnit({
    id: 'wereld-shang-anyang', track: 'history', year: -1220, period: 'Ca. 1250–1045 v.Chr.', themes: ['macht', 'cultuur', 'materiaal'],
    title: 'Late Shang: orakelbotten, hof en productie bij Anyang',
    summary: 'De vindplaatsen bij Anyang belichten een late hoofdstad van de Shang. Graven, paleisresten en inscripties gaan over verschillende aspecten van het hof. Hun combinatie helpt mobilisatie van arbeid, rituele macht en het bereik van koninklijke belangstelling onderscheiden.',
    sources: [shang, china],
    sections: [
      ['Van vindplaats naar hof', 'Yin Xu bevat materiële resten met uiteenlopende functies',
        'Paleis- en cultusruimten, graven en werkplaatsen zijn onderscheiden contexten. De context en concentratie van vondsten helpen een koninklijk centrum herkennen. De omvang van het hele machtsgebied is moeilijker af te leiden. Daarvoor moet je onderzoeken welke plaatsen grondstoffen aanleverden, waar elites vergelijkbare praktijken volgden en hoe relaties veranderden.', 0, 1],
      ['Wat orakelbotten registreren', 'Schrift diende onder meer voor vragen en rituele besluitvorming aan het hof',
        'Schildpadschilden en runderbotten werden voorbereid en verhit. Barsten werden geïnterpreteerd. Inscripties kunnen vragen, voorspellingen of uitkomsten vastleggen. Onderwerpen zoals oogst, offers en oorlog maken koninklijke belangen zichtbaar. Het corpus weerspiegelt de bewaarde activiteit van specifieke schrijvers en waarzeggers. Andere groepen komen vooral in beeld wanneer ze relevant waren voor het hof.', 0, 1],
      ['Brons, arbeid en positie', 'Gespecialiseerde productie en kostbare grafgiften maken investeringen zichtbaar',
        'Bronzen vaten vroegen toegang tot metaal, mallen, vakkennis en arbeid. Hun latere plaats in een graf laat zien wie erover kon beschikken op een bijzonder moment. Een graf biedt sterk bewijs voor selectieve consumptie en rituele inzet. De precieze route van metaal en arbeidsverhoudingen vragen onderzoek bij productiezones en herkomstgegevens.', 0, 1],
    ],
    questions: [
      ['divinatie', 'Koninklijke belangen onderscheiden van algemene maatschappelijke praktijken', 0, choice(
        'In meerdere inscripties wordt gevraagd naar de oogst. Welke conclusie wordt hierdoor gedragen?',
        'De oogst speelde een rol in de gedocumenteerde rituele vragen van het hof.',
        'De herhaalde vraag documenteert een belang en praktijk bij de makers van de bron.',
        [['De daadwerkelijke opbrengst van alle dorpen is bekend.', 'Een vraag naar de toekomst levert zo’n telling niet.'],
         ['Alle boeren in hetzelfde gebied gebruikten hetzelfde schrift.', 'Het corpus heeft een begrensde institutionele herkomst.'],
         ['Alle oogsten werden centraal verzameld.', 'Daarvoor zijn concrete gegevens over overdracht nodig.']])],
      ['bronnen', 'Rituele en materiële bronnen vergelijken', 1, essay(
        'Leg uit hoe orakelbotten, een rijk graf en een bronswerkplaats bij Anyang verschillende vormen van koninklijke macht zichtbaar maken. Noem een conclusie waarvoor alle drie samen nog onvoldoende zijn.',
        'Orakelbotten documenteren rituele vragen en besluitvorming. Een graf toont concentratie en inzet van middelen bij de begrafenis. De werkplaats toont de plaats en middelen van vervaardiging. Samen ondersteunen ze gespecialiseerde productie en een elite met toegang tot rituele middelen. Ze leggen de juridische verplichtingen van producenten of de grenzen van het machtsgebied niet rechtstreeks vast.',
        [['Functie en context', 'Noem voor elke bron een andere productiewijze of gebruikssituatie.', 'Vraag wie de bron maakte of gebruikte en waarvoor.'],
         ['Samenhang', 'Verbind productie met rituele of sociale inzet van middelen.', 'Voeg een mogelijke stap van de werkplaats naar de eliteconsumptie toe.'],
         ['Reikwijdte', 'Formuleer één nog open onderzoeksvraag.', 'Scheid bewijs van concentratie van bewijs over bestuurlijke controle.']])],
    ],
  }),
  courseUnit({
    id: 'wereld-san-lorenzo', track: 'history', year: -1200, period: 'Ca. 1200–900 v.Chr.', themes: ['macht', 'maatschappij', 'materiaal'],
    title: 'San Lorenzo: landschap en elitevorming in de Golfregio',
    summary: 'In de Golfregio van Meso-Amerika groeide San Lorenzo uit tot een monumentaal centrum. Bewerking van het landschap en zware basaltbeelden geven zicht op grootschalige mobilisatie. De identiteit van gezagsdragers en de verhoudingen met andere gemeenschappen blijven indirect afleidbaar.',
    sources: [olmecs, lorenzo],
    sections: [
      ['Ligging en datering', 'De archeologische casus situeert zich in het laagland van het huidige Veracruz',
        'De politieke en economische positie van de nederzetting hing samen met een landschap van rivieren, overstromingszones en hoger gelegen terrein. Gedateerde bouw- en vondstcontexten helpen reconstrueren wanneer investeringen in het centrum toenamen. De gebruikte periode vat veranderingen in verschillende delen van de vindplaats samen.', 0, 1],
      ['Basalt en organisatie', 'Zware monumenten veronderstellen een keten van activiteiten',
        'Grondstof winnen, blokken verplaatsen, afwerken en plaatsen vragen tijd, deskundigheid en arbeid. Daardoor is de mobilisatie van middelen aannemelijk. De organisatievorm is minder direct zichtbaar. Samenwerking tussen groepen, verplichtingen aan een centrale elite en combinaties daarvan vragen verschillende aanvullende aanwijzingen.', 0, 1],
      ['Het begrip Olmeeks', 'Materiële gelijkenissen stellen vragen over relaties en verspreiding',
        'In verschillende regio’s verschijnen voorwerpen met verwante motieven. Overeenkomsten kunnen voortkomen uit verspreiding van voorwerpen, verplaatsing van makers of aangepaste plaatselijke navolging. Onderzoek herkomst, datering en gebruik samen voordat je daaruit de reikwijdte van één politiek centrum afleidt.', 0, 1],
    ],
    questions: [
      ['mobilisatie', 'Archeologische aanwijzingen voor collectieve arbeid interpreteren', 1, choice(
        'Wat is de meest directe gevolgtrekking uit een groot basaltbeeld waarvan de steen van buiten de nederzetting kwam?',
        'Materiaal en arbeid konden over enige afstand worden gemobiliseerd voor een monument.',
        'Herkomst en vervaardiging ondersteunen een reconstructie van de benodigde middelen. De verhouding tussen uitvoerders en opdrachtgevers is een volgende vraag.',
        [['De steenhouwers hadden overal dezelfde rechten.', 'Rechten worden niet rechtstreeks geregistreerd door steensoort.'],
         ['Alle omliggende vindplaatsen waren politiek ondergeschikt.', 'Politieke controle vergt zelfstandig bewijs.'],
         ['Alle monumenten kwamen via dezelfde route aan.', 'Een enkele herkomstbepaling stelt geen algemene reisweg vast.']])],
      ['vergelijking', 'Een hypothese over regionale invloed toetsen', 0, essay(
        'Stel een onderzoeksopzet voor waarmee je politiek gezag vanuit San Lorenzo onderscheidt van verspreiding van beeldtaal via uitwisseling.',
        'Vergelijk tijd en gebruik van voorwerpen, de herkomst van materiaal en hun spreiding ten opzichte van het centrum. Voorwerpen kunnen langs verschillende routes terechtkomen in onafhankelijke gemeenschappen. Een hypothese van politiek gezag vraagt daarnaast herhaalde afhankelijkheid, bijvoorbeeld herkenbare organisatie van leveringen of plaatselijke inrichting die systematisch met het centrum verandert.',
        [['Twee hypothesen', 'Geef per hypothese eigen verwachtingen over verspreiding of organisatie.', 'Vermijd dezelfde soort bewijs als sluitend criterium voor beide hypothesen.'],
         ['Aanvullend bewijs', 'Benoem gerichte gegevens over herkomst, datering en context.', 'Maak duidelijk hoe de gegevens de ene uitleg kunnen versterken.']])],
    ],
  }),
  courseUnit({
    id: 'wereld-wari-andes', track: 'history', year: 800, period: 'Ca. 600–1000', themes: ['macht', 'materiaal', 'wereld'],
    title: 'Wari en Tiwanaku: politieke invloed tijdens de Middenhorizon',
    summary: 'Tijdens de Middenhorizon ontwikkelden Wari en Tiwanaku belangrijke machtscentra in verschillende delen van de Andes. Materiële overeenkomsten en regionale verschillen geven zicht op mobiliteit, ritueel en de organisatie van vestigingen. De mate van centraal gezag beoordeel je per casus.',
    sources: [wari],
    sections: [
      ['Hoogland en verschillende centra', 'Ligging beïnvloedde verbindingen en toegang tot hulpbronnen',
        'Huari groeide uit bij Ayacucho. Tiwanaku had zijn kern bij het Titicacameer. Beide centra maakten deel uit van landschappen waarin hoogte, water en routes het gebruik van grond en de bereikbaarheid van andere plaatsen beïnvloedden. De twee machtsvelden hadden verschillende geografische zwaartepunten.', 0],
      ['Bouw en lokale organisatie', 'De verspreiding van bouwwijzen maakt verschillende mechanismen denkbaar',
        'Een gebouw dat functies en ruimten op een herkenbare manier organiseert, kan wijzen op overdracht van ontwerp of bestuurlijke aanwezigheid. Aanwijzingen uit opslag, datering van gebruik en plaatselijke vondsten helpen dit beoordelen. De stijl alleen blijft verenigbaar met navolging of met mobiliteit van bouwers.', 0],
      ['Rituele vormen en historische grenzen', 'Gedeelde motieven steunen een uitspraak over contact op een lagere drempel dan over bestuurlijke controle',
        'Een thema op textiel of aardewerk kan door personen, voorwerpen en lokale interpretaties circuleren. De verspreiding is sterker bewijs voor herhaalde relaties wanneer vindplaatsen aantoonbaar gelijktijdig zijn. Verschillen in materiaal, cultus of ruimtegebruik kunnen wijzen op lokale keuzes binnen dezelfde contactzone.', 0],
    ],
    questions: [
      ['gezag', 'De reikwijdte van materieel bewijs afbakenen', 0, choice(
        'Twee sites gebruiken op hetzelfde moment een verwant motief. Wat maakt de stap naar bestuurlijke invloed sterker?',
        'Onafhankelijke aanwijzingen voor georganiseerde leveringen of herhaalde bestuurlijke aanwezigheid bij die sites.',
        'Gedeelde vormgeving is verenigbaar met verschillende processen. De bestuurlijke hypothese vraagt eigen bewijs.',
        [['De frequentie van het motief verhogen door latere stukken mee te tellen.', 'Latere datering verzwakt de vergelijking voor het gekozen tijdvak.'],
         ['De sites uitsluitend op afstand tot de moderne hoofdstad rangschikken.', 'Die afstand is geen historisch bewijs van organisatie.'],
         ['Alle motieven aan dezelfde individuele maker toeschrijven.', 'Stijlgelijkenis identificeert de maker niet.']])],
      ['vergelijking', 'Politieke invloed via meerdere bronnen vergelijken', 0, essay(
        'Vergelijk hoe architectuur en verplaatsbare voorwerpen gebruikt kunnen worden om Wari-invloed te onderzoeken. Welke observatie zou lokale navolging aannemelijker maken?',
        'Architectuur kan plaatselijke investering, gebruik en ruimteverdeling tonen. Voorwerpen maken verplaatsing van goederen of van beeldtaal onderzoekbaar. Lokale varianten in functie, productiewijze en materiaal, samen met afwezigheid van andere aanwijzingen voor bestuurlijk personeel of overdracht, maken navolging aannemelijker. De bewaring van de site bepaalt hoe zwaar afwezigheid telt.',
        [['Bronvorm', 'Geef per bronsoort aan waarom die een andere schaal belicht.', 'Noem een lokale vindcontext voor een gebouw en een mogelijke reisweg voor een voorwerp.'],
         ['Alternatieven', 'Formuleer toetsbare voorspellingen voor navolging en controle.', 'Maak duidelijk welke waarneming tussen de twee helpt kiezen.']])],
    ],
  }),
  courseUnit({
    id: 'rome-gracchus-land-en-politiek', track: 'roman', year: -133, period: '2e eeuw v.Chr.', themes: ['maatschappij', 'macht', 'economie'],
    title: 'Tiberius Gracchus: grondgebruik en politieke strijd in de republiek',
    summary: 'Het tribunaat van Tiberius Gracchus in 133 v.Chr. biedt een casus om grondgebruik, militaire verplichtingen en politieke besluitvorming samen te onderzoeken. Appianus en Ploutarchos leggen verschillende accenten in hun beschrijving. Hun verhalen krijgen betekenis binnen een debat over de reikwijdte van een landhervorming.',
    sources: [appian, plutarch],
    sections: [
      ['Publieke grond en gebruik', 'Romeinse expansie had de staat grond ter beschikking gesteld',
        'Publieke grond kon door gebruikers bezet worden. Daardoor kunnen officieel eigendom en feitelijk langdurig gebruik uiteenlopen. De hervorming wilde de bezetting van dergelijke grond beperken en ruimte maken voor herverdeling. De politieke vraag was mede wie baat had bij het voortzetten of omvormen van bestaande verhoudingen.', 0, 1],
      ['Verklaringen over arbeid en burgers', 'De antieke auteurs verbinden grondverhoudingen met sociale en militaire zorgen',
        'Appianus beschrijft de rol van vermogende gebruikers en slavenarbeid. In de biografie krijgt de persoonlijke waarneming en keuze van Tiberius meer plaats. De beeldvorming vertelt hoe antieke schrijvers de hervorming verklaarden. Voor de demografische omvang van veranderingen in heel Italië zijn regionaal archeologisch bewijs en voorzichtig gebruik van indirecte gegevens nodig.', 0, 1],
      ['Besluitvorming en conflict', 'Tegenstand over de maatregel werd ook strijd over bevoegdheden',
        'Het optreden van de medetribuun Octavius liet zien dat procedures het voorstel konden blokkeren. Zijn afzetting verscherpte het conflict over de verhouding tussen een tribuun, de volksvergadering en tegenstanders uit de elite. Onderzoek de aanleiding voor de maatregel afzonderlijk van de escalatie tijdens de besluitvorming.', 0, 1],
    ],
    questions: [
      ['land', 'Publieke grond, gebruik en individueel bezit onderscheiden', 0, choice(
        'Welke spanning staat centraal bij een maatregel die bezitters het gebruik van een deel van de ager publicus ontneemt?',
        'De publieke status van de grond kon botsen met lang opgebouwde verwachtingen van de gebruikers.',
        'Eigendomstitel en gebruiksduur zijn verschillende gegevens. Beide beïnvloeden de politieke belangen.',
        [['De maatregel schafte alle vormen van particulier grondbezit af.', 'De categorie publieke grond begrenst de maatregel.'],
         ['De maatregel draaide uitsluitend om de prijs van ingevoerd graan.', 'Grondgebruik en herverdeling staan in de voorgelegde uitleg centraal.'],
         ['Het conflict betrof alleen de grenzen tussen Rome en Carthago.', 'De institutionele discussie vond plaats binnen de republiek over Italiaans grondgebruik.']])],
      ['antwoord', 'Een causale verklaring verbinden met kritiek van de traditie', 1, essay(
        'Verklaar de opkomst van het landvoorstel en de escalatie van het politieke conflict in 133 v.Chr. Maak duidelijk wat de latere antieke verhalen kunnen staven.',
        'Romeinse expansie vormde de achtergrond voor gebruik van publieke grond. Langdurige toe-eigening van gebruiksvoordelen maakte een beperking en herverdeling politiek omstreden. Antieke auteurs koppelen land aan ongelijkheid en burgerrekrutering. De procedure rond Octavius voegde strijd over besluitvorming toe. De overlevering steunt reconstructie van het conflict en latere interpretaties. De toestand in verschillende regio’s vereist eigen bewijs.',
        [['Causale situering', 'Leg een verband tussen de status van de grond en botsende belangen.', 'Noem voor beide kanten een concreet belang.'],
         ['Institutie', 'Neem het tribunaat en een concrete procedure in de verklaring op.', 'Geef aan hoe het veto of de afzetting de escalatie hielp verklaren.'],
         ['Bronkritiek', 'Benoem datering en genre en begrens een brede sociaal-economische conclusie.', 'Formuleer welke aanvullende aanwijzing uit Italië de conclusie zou versterken.']])],
    ],
  }),
  courseUnit({
    id: 'wereld-belgie-kiesrecht', track: 'history', year: 1831, period: '1831–1919', themes: ['macht', 'maatschappij'],
    title: 'België: van cijnskiesrecht naar enkelvoudig mannenkiesrecht',
    summary: 'De Belgische grondwettelijke instellingen van 1831 verdeelden politieke bevoegdheden, terwijl stemrecht aan specifieke voorwaarden was gebonden. De hervorming van 1893 breidde de kiesgroep uit en kende sommige kiezers meer stemmen toe. Vergelijk wie mocht stemmen met het gewicht van elke stem.',
    sources: [votes, mobilization],
    sections: [
      ['Vertegenwoordiging en toegang', 'Het parlementair systeem en de omvang van het electoraat zijn afzonderlijke vragen',
        'Bij het cijnskiesstelsel hing de toegang tot verkiezingen af van belastingvoorwaarden. Dat koppelde formele vertegenwoordiging aan een beperkte groep mannen. Een bron kan daarom tegelijk politieke vrijheden vooropstellen en een bijzonder selectieve toegang tot de stembus vastleggen.', 0, 1],
      ['Collectieve druk en hervorming', 'De hervorming kwam voort uit politieke mobilisatie en parlementaire besluitvorming',
        'De eisen voor ruimer stemrecht kregen gewicht in de sociale en politieke strijd aan het einde van de negentiende eeuw. De regeling van 1893 maakte veel meer mannen kiesgerechtigd, terwijl voorwaarden voor extra stemmen bleven bestaan. Het compromis blijkt dus zowel uit de verruimde deelname als uit het verschil in stemgewicht.', 1],
      ['Ongelijkheid op verschillende assen', 'Toegang, aantal stemmen en feitelijke vertegenwoordiging veranderen niet tegelijk',
        'Vanaf 1919 werd het enkelvoudig mannenkiesrecht toegepast. Vrouwen verkregen algemeen parlementair stemrecht later. Verhouding tussen inwoners, ingeschreven kiezers, afgegeven stemmen en verkozen vertegenwoordigers vergt afzonderlijke tellingen. Alleen de wettelijke toegang lezen levert nog geen verkiezingsuitslag of verdeling van invloed op.', 0],
    ],
    questions: [
      ['toegang', 'Toegang tot de stembus en gewicht van stemmen onderscheiden', 0, choice(
        'Wat veranderde in 1893 ten opzichte van het cijnskiesrecht?',
        'De groep mannelijke kiezers werd ruimer en sommige kiesgerechtigden kregen meerdere stemmen.',
        'De toelatingsregel en het gewicht van afzonderlijke stemmen moeten apart vergeleken worden.',
        [['Alle inwoners kregen één stem.', 'De regeling kende extra stemmen toe en het algemeen vrouwenkiesrecht kwam later.'],
         ['De kiesgroep kromp tot uitsluitend bezitters.', 'De hervorming verruimde de kiesgroep.'],
         ['Verkiezingen werden vervangen door loting.', 'Kiesprocedures bleven bestaan en de voorwaarden veranderden.']])],
      ['diachronie', 'Een ontwikkeling in democratische vertegenwoordiging historisch verklaren', 1, essay(
        'Vergelijk de Belgische stembusregeling in 1831, 1893 en 1919. Verklaar waarom “meer kiezers” en “gelijk stemgewicht” verschillende uitspraken zijn.',
        'In 1831 beperkte de cijns toegang tot een deel van de mannen. In 1893 verruimde mobilisatie en hervorming die toegang, maar extra stemmen gaven bepaalde kiezers meer gewicht. In 1919 gold enkelvoudig algemeen mannenkiesrecht. Een nieuwe groep kan stemrecht verkrijgen terwijl haar leden een verschillend aantal stemmen uitbrengen. Vrouwen bleven buiten dit algemene parlementaire stemrecht tot een latere hervorming.',
        [['Chronologie', 'Maak het verschil tussen alle drie de momenten concreet.', 'Vergelijk dezelfde eigenschappen voor elke regeling.'],
         ['Historische verklaring', 'Verbind politieke hervorming en sociale druk zonder een automatische ontwikkeling te veronderstellen.', 'Voeg de rol van het compromis van 1893 toe.']])],
    ],
  }),
  courseUnit({
    id: 'atlantisch-saint-domingue-vrijheid', track: 'earlymodern', year: 1791, period: '1789–1804', themes: ['maatschappij', 'economie', 'wereld'],
    title: 'Van Saint-Domingue naar Haïti: slavernij, afschaffing en onafhankelijkheid',
    summary: 'De revolutie in Saint-Domingue veranderde de organisatie van arbeid, de rechten van bewoners en de verhouding tot Frankrijk. Volg de beslissingen over burgerrechten en slavernij tussen 1789 en 1804. De emancipatie, de status van de kolonie en diplomatieke erkenning hebben elk een eigen chronologie.',
    sources: [haiti, foreign],
    sections: [
      ['Sociale verhoudingen vóór de opstand', 'De plantage-economie berustte op gedwongen arbeid en ongelijke rechten',
        'De productie van suiker en andere exportproducten bracht economische belangen van plantagehouders, kooplieden en koloniale bestuurders samen. Vrije mensen van kleur hadden een uiteenlopende maatschappelijke positie. Hun eisen rond burgerrechten verschilden van de strijd van mensen die in slavernij leefden. Na 1789 veranderden de mogelijkheden om die eisen politiek te formuleren.', 0],
      ['Opstand en afschaffing', 'De opstand vanaf 1791 maakte de positie van koloniale gezagsdragers onzeker',
        'Mobilisatie op de plantages en oorlog met andere imperiale machten beïnvloedden de keuzes van bestuurders en strijdende groepen. Franse commissarissen kondigden in 1793 emancipatiemaatregelen in Saint-Domingue af. De Franse Conventie schafte in 1794 de slavernij in de Franse koloniën af. Datum, beslissingsniveau en uitvoering moeten per maatregel worden onderscheiden.', 0, 1],
      ['Van Franse kolonie naar zelfstandige staat', 'Afschaffing bood een ander antwoord dan onafhankelijkheid',
        'Toussaint Louverture bouwde zijn macht uit terwijl de band met Frankrijk formeel bleef bestaan. In 1802 stuurde Napoleon een expeditie. De herinvoering van slavernij elders in de Franse Caraïben gaf vrees voor een vergelijkbare afloop in Saint-Domingue extra gewicht. Na de nederlaag van de Fransen werd in 1804 de onafhankelijkheid uitgeroepen. Dit besluit legde de grondslag voor buitenlandse betrekkingen vanuit een nieuwe staat, terwijl erkenning een afzonderlijk diplomatiek proces bleef.', 0, 1],
    ],
    questions: [
      ['chronologie', 'Afschaffing en staatsvorming chronologisch vergelijken', 0, choice(
        'Welke gevolgtrekking past bij de afschaffing in 1794 en de onafhankelijkheidsverklaring in 1804?',
        'Rechten en arbeid veranderden onder Frans gezag voordat de revolutie uitmondde in een zelfstandige staat.',
        'De gebeurtenissen hadden uiteenlopende beslissers en veranderden verschillende verhoudingen.',
        [['Het besluit in 1794 legde de internationale erkenning van Haïti vast.', 'Het besluit ging over slavernij in Franse koloniën.'],
         ['De onafhankelijke staat bestond reeds vóór de opstand in 1791.', 'De onafhankelijkheidsverklaring volgde op de strijd tegen Frankrijk.'],
         ['De status van arbeid en koloniale soevereiniteit veranderden op dezelfde dag.', 'De twee beslissingen behoren tot verschillende jaren en processen.']])],
      ['synthese', 'Sociale strijd, imperiale politiek en onafhankelijkheid verbinden', 1, essay(
        'Verklaar waarom de afschaffing van 1794 het conflict in Saint-Domingue slechts gedeeltelijk oploste. Betrek arbeid, de expeditie van 1802 en de onafhankelijkheid.',
        'De algemene afschaffing veranderde de juridische positie van mensen in slavernij maar liet de staatkundige band met Frankrijk bestaan. Arbeidsorganisatie en politieke autonomie bleven omstreden. Het optreden van de expeditie en het Franse beleid elders maakten de veiligheid van de emancipatie opnieuw onzeker. De onafhankelijkheid maakte een einde aan Frans koloniaal gezag. Buitenlandse erkenning en de organisatie van arbeid bleven afzonderlijke vraagstukken.',
        [['Chronologie', 'Onderscheid 1791, 1794, 1802 en 1804.', 'Koppel elke datum aan de betrokken actoren en beslissingen.'],
         ['Mechanisme', 'Verbind politieke en militaire keuzes met de zekerheid van verworven rechten.', 'Geef aan waarom de koloniale band na 1794 nog gevolgen kon hebben.'],
         ['Reikwijdte', 'Maak onderscheid tussen onafhankelijkheid, arbeidsverhoudingen en erkenning.', 'Benoem wie over elk proces besliste.']])],
    ],
  }),

];
