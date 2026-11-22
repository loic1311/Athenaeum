import { choose, reason } from './history-source.js?v=13r8';
import { extension, source } from './history-extension.js?v=13r9';

const paris = section => source('Musée Carnavalet – Histoire de Paris', 'Le parcours', '', section, 'https://carnavalet.paris.fr/le-nouveau-parcours');
const tolosa = source('Musée Saint-Raymond', 'Sur les traces du rempart romain de Tolosa', '', 'Beschrijving van het tracé en de bewaarde resten', 'https://saintraymond.toulouse.fr/sur-les-traces-du-rempart-romain-de-tolosa-2/');
const madrid = section => source('Madrid Destino', 'The origins of Madrid', '', section, 'https://www.esmadrid.com/en/history-madrid');
const heritage = (title, id) => source('UNESCO World Heritage Centre', title, '', 'Outstanding Universal Value · Brief synthesis', 'https://whc.unesco.org/en/list/' + id + '/');

export const westernCityHistory = extension('atlas', [
  {
    id: 'atlas-parijs-lutece', track: 'roman', year: 1, period: 'Ca. 1–400 n.Chr.',
    title: 'Parijs · Lutetia aan de Seine',
    summary: 'Reconstrueer de Romeinse stad aan de Seine aan de hand van monumenten, munten en grafvondsten. Betrek de onzekerheid over de ligging van de vroegere nederzetting van de Parisii in je verklaring.',
    sources: [paris('Antiquité')], caseIds: [],
    dimensions: [
      ['De Seine verbond de stad met haar omgeving', 'Watertransport, aanlegplaatsen en wegen maakten het mogelijk goederen en mensen samen te brengen. Het Pilier des Nautes verwijst naar schippers, maar zegt op zichzelf weinig over vrachtvolumes of de herkomst van alle goederen.'],
      ['Grafvondsten tonen een selectie van bewoners', 'Sieraden, munten en gebruiksvoorwerpen uit graven geven aanwijzingen over grafrituelen en materiële cultuur. Gebruik de ligging, datering en omstandigheden van opgravingen om te bepalen welke groepen de vondsten kunnen vertegenwoordigen.'],
      ['Publieke bouwwerken vroegen organisatie', 'Thermen, forum en amfitheater veronderstellen bouwmateriaal, financiering en onderhoud. Hun aanwezigheid toont publieke investeringen. Onderzoek met inscripties en bouwfasen wie opdracht gaf en op welke momenten de functies van gebouwen veranderden.'],
      ['Een gedenkzuil verenigt verschillende religieuze tradities', 'Op het Pilier des Nautes staan figuren uit Gallische en Romeinse tradities. De combinatie toont hoe de opdrachtgevers beide beeldtalen konden gebruiken. Andere vindplaatsen zijn nodig om de spreiding van zulke praktijken te beoordelen.'],
    ],
    connection: ['Houd twee vragen uit elkaar', 'Sporen van de Romeinse stad helpen haar inrichting reconstrueren. De precieze ligging van de eerdere nederzetting van de Parisii blijft onderwerp van debat. Vergelijk gedateerde vondstlagen voor je continuïteit van locatie aanneemt.'],
    tasks: [
      choose('Bewijs afbakenen', 'Wat toont het Pilier des Nautes rechtstreeks?', 'Dat de opdrachtgevers Gallische en Romeinse religieuze beeldtaal combineerden.', ['De hoeveelheid graan die door de schippers werd vervoerd.', 'De precieze grens van de vroegere nederzetting.', 'Het geloof van alle bewoners.'], 'Het monument geeft rechtstreeks informatie over de beeldkeuzes van zijn opdrachtgevers.'),
      reason('Een stad reconstrueren', 'Welke twee soorten bronnen gebruik je om de inrichting van Lutetia te reconstrueren?', 'Ik vergelijk gedateerde bouwsporen van openbare gebouwen met vindplaatsen en inscripties. Bouwsporen tonen waar voorzieningen stonden, inscripties geven soms een aanwijzing over gebruik of opdrachtgever.', ['Geef twee soorten bronnen.', 'Leg uit wat elke bron oplevert.', 'Benoem een beperking.'], 'Plaats, functie en opdrachtgever vragen elk specifiek bewijs.'),
    ],
  },
  {
    id: 'atlas-parijs-haussmann', year: 1853, period: '1853–1870',
    title: 'Parijs · De stedelijke ingrepen van Haussmann',
    summary: 'Bestudeer hoe de ingrepen onder Napoleon III en prefect Haussmann straten, voorzieningen en woonruimte veranderden. Vergelijk de doelen van het bestuur met gevolgen die per wijk konden verschillen.',
    sources: [paris('XIXe siècle')], caseIds: [],
    dimensions: [
      ['Infrastructuur veranderde de bereikbaarheid', 'Brede straten en nieuwe verbindingen veranderden de bereikbaarheid van woningen, werkplekken en handelszaken. Vergelijk kaarten van vóór en na de ingrepen en onderzoek waar verkorting van routes economische gevolgen kon hebben.'],
      ['De woongevolgen verschilden per huishouden', 'Onteigening en sloop brachten voor sommige bewoners een verhuizing mee. Eigenaars, huurders en winkeliers hadden uiteenlopende belangen. Huurprijzen, adresboeken en onteigeningsdossiers kunnen tonen waar zij terechtkwamen en wie kosten droeg.'],
      ['Bestuurlijke ambitie vroeg uitvoeringsmiddelen', 'Napoleon III en prefect Haussmann konden plannen uitwerken met bestuurlijke bevoegdheden en financiering. De opeenvolging van beslissingen, werken en betalingen laat zien welke ingrepen prioriteit kregen en waar onderhandelingen of vertraging optraden.'],
      ['Stadsbeelden brengen verschillende perspectieven in beeld', 'Plannen en officiële afbeeldingen leggen nadruk op de bedoelde ordening van straten en monumenten. Foto’s, klachten en dossiers over verplaatsing maken andere ervaringen zichtbaar. Vraag telkens welke verandering de maker wilde tonen.'],
    ],
    connection: ['Volg één ingreep in twee wijken', 'Neem een vergelijkbare straatverbreding in twee buurten. Volg wie werd onteigend, hoe huren veranderden en welke bewoners of activiteiten terugkwamen. Zo kan je een algemene bestuurlijke ingreep verbinden met lokaal uiteenlopende gevolgen.'],
    tasks: [
      choose('Woongevolgen meten', 'Welke broncombinatie biedt het beste vertrekpunt om gedwongen verhuis te onderzoeken?', 'Onteigeningsdossiers en opeenvolgende adresgegevens van bewoners.', ['Een foto van een nieuwe boulevard.', 'Een plattegrond van heel Frankrijk.', 'Een portret van de prefect.'], 'Deze combinatie koppelt een gedocumenteerde ingreep aan de bestemming van huishoudens.'),
      reason('Ambitie en effect', 'Hoe onderzoek je of een boulevard ook de handelsfunctie van een wijk veranderde?', 'Ik vergelijk de ligging en types van handelszaken vóór en na de werken met een vergelijkbare wijk zonder gelijktijdige ingreep. Ik let op stadstrends en op mogelijke verandering in de registratie.', ['Maak een vergelijking door de tijd.', 'Benoem vergelijkbare handelsgegevens.', 'Geef een alternatieve verklaring of controle.'], 'De vergelijking helpt algemene groei te onderscheiden van lokale effecten.'),
    ],
  },
  {
    id: 'atlas-toulouse-tolosa', track: 'roman', year: 30, period: 'Vroege keizertijd',
    title: 'Toulouse · Het Romeinse Tolosa en zijn stadswal',
    summary: 'Lees de resten van de Romeinse stadswal in het huidige Toulouse. Scheid wat de archeologie rechtstreeks toont van hypothesen over verdediging, status en de functies van een stadsgrens.',
    sources: [tolosa], caseIds: [],
    dimensions: [
      ['Een stadswal is ook een bouwproject', 'Een ommuring vroeg materiaal, transport en arbeid. Vergelijk bouwtechnieken en materiaalsporen om te onderzoeken hoe de werken werden georganiseerd. Een bewaard muurfragment zegt weinig over de totale kost of de financiering.'],
      ['Een muur ordende de toegang tot de stad', 'Poorten en straten sturen verkeer tussen stad en omgeving. Hun ligging kan iets zeggen over belangrijke routes. Voor de samenstelling van de reizigers heb je andere bronnen nodig, zoals gebruikssporen of inscripties.'],
      ['Functies kunnen naast elkaar bestaan', 'Een wal kon een defensieve functie combineren met afbakening en zichtbare status. Let op het tracé, toegangspunten en eventuele herstellingen. Zulke kenmerken helpen alternatieve verklaringen tegen elkaar af te wegen.'],
      ['De moderne stad bewaart een selectie', 'Bouw en afbraak hebben bepaald welke delen van de antieke muur nog toegankelijk zijn. Het museum brengt de bekende delen samen op een model. Een reconstructie moet aangeven waar waarneming eindigt en aanvulling begint.'],
    ],
    connection: ['Reconstrueer het tracé voordat je het verklaart', 'Leg gedateerde vondstpunten op een kaart en markeer de delen waar het verloop onbekend is. Toets mogelijke routes langs de muur met andere vondsten. Pas daarna kun je preciezer vragen hoe de wal het stedelijk verkeer stuurde.'],
    tasks: [
      choose('Archeologisch bewijs', 'Wat toont één bewaard en gedateerd muursegment rechtstreeks?', 'Waar op dat moment een deel van de ommuring stond en hoe het was gebouwd.', ['Dat alle poorten permanent gesloten waren.', 'Hoe zwaar de lokale belasting was.', 'Welke groepen de stad bestuurden.'], 'Het fragment documenteert een concrete locatie en bouwwijze.'),
      reason('Functie toetsen', 'Welke gegevens helpen beoordelen of verdediging een belangrijke functie van de ommuring was?', 'Ik kijk naar toegangspunten, torens en aanpassingen, en vergelijk ze met lokale dreiging of herstelsporen. Ik controleer ook of toegang en representatie andere eigenschappen van het tracé verklaren.', ['Benoem concrete kenmerken.', 'Voeg onafhankelijk contextbewijs toe.', 'Geef een aanvullende functie.'], 'Vergelijk meerdere eigenschappen voordat je een functie aan het geheel toeschrijft.'),
    ],
  },
  {
    id: 'atlas-toulouse-canal', track: 'earlymodern', year: 1667, period: 'Late 17e eeuw',
    title: 'Toulouse · Het Canal du Midi als handelsroute',
    summary: 'Volg het kanaal van Toulouse naar het Étang de Thau. Onderzoek hoe waterbeheer, bestuurlijke steun en transportkosten bepaalden wat de nieuwe vaarweg kon betekenen voor de stad.',
    sources: [heritage('Canal du Midi', 770)], caseIds: [],
    dimensions: [
      ['Een vaarweg veranderde mogelijke routes', 'Het kanaal verbond Toulouse met de Middellandse Zeekust via het Étang de Thau. Voor de handelsbetekenis tellen vaartijd, tarieven, overslag en betrouwbaarheid. Een verbinding op de kaart geeft op zichzelf geen gemeten besparing.'],
      ['Infrastructuur steunde op plaatselijk werk', 'Sluizen en wateraanvoer vroegen bouw en blijvend onderhoud. Schippers en arbeiders ervoeren vertragingen rechtstreeks. Loongegevens en klachten kunnen laten zien wie het werk deed en hoe onderbrekingen verschillende groepen troffen.'],
      ['Een groot project bracht privé-initiatief en koninklijk gezag samen', 'Pierre-Paul Riquet droeg het project onder Lodewijk XIV. De betekenis van de koninklijke steun wordt concreet als je toestemming, financiering en uitvoering per fase nagaat en onderscheid maakt tussen verschillende delen van het netwerk.'],
      ['Ingenieurs pasten het landschap aan', 'Water uit de Montagne Noire werd via toevoerkanalen ingezet om het bevaarbare peil te helpen handhaven. Een kaart van sluizen, reservoir en aanvoer laat zien hoeveel van de verkeersfunctie buiten de eigenlijke vaarweg werd georganiseerd.'],
    ],
    connection: ['Meet gebruik en betrouwbaarheid', 'Vergelijk ladingen en vertragingen in jaren met verschillende waterstanden of onderhoudsproblemen. Leg de uitkomst naast prijzen en beschikbare landroutes. Zo kan je onderscheiden of een nieuwe route verkeer aantrok of vooral bestaande stromen verplaatste.'],
    tasks: [
      choose('Handelseffect toetsen', 'Wat geeft de beste aanwijzing dat het kanaal goederenvervoer aantrok?', 'Gedateerde vrachtregistraties en tarieven op het kanaal en op alternatieve routes.', ['Een herinneringsplaat voor Riquet.', 'Het aantal bewaarde bruggen.', 'Een moderne kaart zonder vervoersgegevens.'], 'Vracht en tarieven geven informatie over keuze en kosten.'),
      reason('Techniek en bestuur', 'Waarom was de wateraanvoer ook een bestuurlijke kwestie?', 'Aanleg en onderhoud van de toevoer vergden werk en middelen op meerdere locaties. Afspraken over gebruik en verantwoordelijkheid beïnvloedden of voldoende water beschikbaar bleef voor de scheepvaart.', ['Benoem een technisch probleem.', 'Koppel het aan beheer of financiering.', 'Leg het gevolg voor de vaarweg uit.'], 'Een stabiele verbinding vereist dat de beheerketen blijft functioneren.'),
    ],
  },
  {
    id: 'atlas-madrid-mayrit', track: 'medieval', year: 850, period: '9e–11e eeuw',
    title: 'Madrid · Mayrit aan de grens van al-Andalus',
    summary: 'Begin bij de resten van de islamitische stadsmuur. Onderzoek wat ze tonen over een versterkte nederzetting en welke andere bronnen nodig zijn om bewoning en stedelijke groei te begrijpen.',
    sources: [source('Madrid Destino', 'Muslim Madrid', '', 'Sporen van de islamitische stadsmuur en oorsprong van Mayrit', 'https://www.esmadrid.com/en/in-the-footsteps-of-muslim-madrid')], caseIds: [],
    dimensions: [
      ['Een versterking stond in verbinding met haar omgeving', 'De ligging bij de Manzanares bepaalde mede welke routes bereikbaar waren. Vergelijk het reliëf en bekende wegen met herkomst van materiaal om te toetsen welke verbindingen in de praktijk gebruikt werden.'],
      ['Een garnizoen verklaart maar een deel van de nederzetting', 'Naast militaire functies kun je bewoning, opslag en ambacht onderzoeken. Afval, keramiek en gebouwsporen kunnen wijzen op dagelijkse activiteiten. De datering ervan is nodig om gelijktijdigheid met de muur te toetsen.'],
      ['De ommuring hielp een grensgebied organiseren', 'Mayrit wordt in verband gebracht met de verdedigingspolitiek van het emiraat Córdoba. De muur geeft archeologisch bewijs voor fortificatie. Voor de bestuurlijke verhouding met andere versterkingen zijn geschreven getuigenissen en vergelijking nodig.'],
      ['Namen en bouwsporen veranderen op verschillende tempi', 'Latere namen, teksten en hergebruikte muren bewaren aspecten van eerdere bewoning. Ze kunnen uit uiteenlopende perioden stammen. Leg per spoor vast wanneer het ontstond en wie er in de latere periode betekenis aan gaf.'],
    ],
    connection: ['Toets groei rond de versterking', 'Vergelijk vondstcomplexen binnen en buiten de ommuring en bepaal of hun gebruik overlapt. Verspreiding van dezelfde soorten materiaal kan op uitwisseling wijzen, terwijl bouwsporen kunnen helpen de uitbreiding van bewoning te dateren.'],
    tasks: [
      choose('Een versterking interpreteren', 'Welke conclusie volgt het directst uit een gedateerd stuk stadsmuur?', 'Een specifieke plek was in die fase versterkt.', ['Alle bewoners hadden militaire taken.', 'De handelsinkomsten daalden jaarlijks.', 'De stad had al de functie van koninklijke hoofdstad.'], 'Voor claims over bewoners en stedelijke functies is aanvullend bewijs nodig.'),
      reason('Militair en stedelijk', 'Hoe toets je of buiten de versterking gewone woonactiviteiten plaatsvonden?', 'Ik zoek gedateerde huisplattegronden, kookgerei en afvalzones buiten de muur. Ik vergelijk de vondstcontext en datering met de gebruiksperiode van de versterking.', ['Benoem materiële sporen.', 'Leg uit waar je vergelijkt.', 'Controleer gelijktijdigheid.'], 'De ruimtelijke spreiding en datering maken het mogelijk bewoning te onderscheiden van incidenteel gebruik.'),
    ],
  },
  {
    id: 'atlas-madrid-hof', track: 'earlymodern', year: 1561, period: '1561–1700',
    title: 'Madrid · De komst van het koninklijk hof',
    summary: 'Filips II vestigde zijn hof in 1561 in Madrid. Volg hoe de nabijheid van bestuur en vorst de vraag naar woningen, voedsel, diensten en politieke toegang kon veranderen.',
    sources: [madrid('The Madrid of the Hapsburgs'), source('Madrid Destino', 'History of Madrid Museum', '', 'Description · Madrid vanaf 1561', 'https://www.esmadrid.com/en/tourist-information/museo-de-historia')], caseIds: [],
    dimensions: [
      ['Het hof bracht extra stedelijke vraag', 'Dienaren, bestuurders en bezoekers hadden voedsel, onderdak en diensten nodig. Om de omvang van een effect te bepalen vergelijk je productie en prijzen met andere steden en let je op oogsten en bevolkingsgroei.'],
      ['Toegang tot de vorst en tot woonruimte waren verschillend verdeeld', 'Vestiging van bestuur bracht kansen voor leveranciers en ambtenaren. Extra vraag kon tegelijk op woningen drukken. Contracten, loonlijsten en verzoekschriften tonen verschillende onderdelen van de gevolgen voor bewoners.'],
      ['Een besluit van de vorst veranderde de stad geleidelijk', 'Het jaar 1561 dateert de vestiging van het hof. Huisvesting, bouwprojecten en nieuwe functies volgden op verschillende tempi. Datering van bouw en administratieve aanwezigheid helpt een formeel besluit van uitvoering te onderscheiden.'],
      ['Een hoofdstad kreeg nieuwe publieke en representatieve ruimten', 'Pleinen en hofgebouwen boden ruimte voor handel, ceremonies en machtsvertoon. Een stadsplan toont de ligging. Verslagen van gebeurtenissen en stedelijke voorschriften vertellen hoe verschillende actoren zulke plekken gebruikten.'],
    ],
    connection: ['Vergelijk de gevolgen van extra vraag', 'Volg twee sectoren, bijvoorbeeld huisvesting en voedselvoorziening, over eenzelfde periode. Vergelijk prijzen, capaciteit en regels. Zo zie je welke problemen beide sectoren deelden en waar de organisatie van een specifieke markt doorslaggevend was.'],
    tasks: [
      choose('Een effect meten', 'Welk gegeven is het nuttigst om de invloed van het hof op huisvesting te schatten?', 'Huren en bewoningsgegevens vóór en na de hofvestiging, met een vergelijkingsstad.', ['Een chronologie van de monarchen.', 'Een schilderij van de vorst.', 'Een stadsplattegrond uit één jaar.'], 'De vergelijking maakt toetsbaar welke verandering samenvalt met de komst van het hof.'),
      reason('Besluit en uitvoering', 'Waarom dateren stedelijke gevolgen van de hofvestiging niet allemaal uit 1561?', 'De beslissing kon snel vallen, maar gebouwen, bevoorrading en de verplaatsing van personeel vroegen tijd. Ik dateer die gevolgen afzonderlijk met contracten, vergunningen en aanwijzingen voor feitelijk gebruik.', ['Scheid een besluit van uitvoering.', 'Noem concrete uitvoeringsstappen.', 'Kies geschikte bronnen.'], 'Een ijkpunt op de tijdlijn geeft niet de duur van het veranderingsproces aan.'),
    ],
  },
  {
    id: 'atlas-barcelona-barcino', track: 'roman', year: -10, period: 'Late 1e eeuw v.Chr.–late oudheid',
    title: 'Barcelona · Barcino onder de Plaça del Rei',
    summary: 'Bekijk de Romeinse kolonie via muren, straten en werkruimten die onder de huidige stad bewaard bleven. Volg hoe archeologen functies en verandering uit opeenvolgende lagen afleiden.',
    sources: [source('Ajuntament de Barcelona', 'Roman Barcino', '', 'Beschrijving van de kolonie en de archeologische resten', 'https://www.meet.barcelona/en/visit-and-love-it/barcelona-history/roman-barcino')], caseIds: [],
    dimensions: [
      ['Productiesporen helpen werkplaatsen identificeren', 'Installaties, resten en afmetingen van ruimtes geven aanwijzingen voor productie en opslag. Vergelijk verschillende interpretaties met het materiaal ter plaatse. Een lokaal complex maakt een activiteit zichtbaar zonder haar totale omvang te meten.'],
      ['Opeenvolgende bewoners gebruikten dezelfde ruimte anders', 'Onder het huidige stadscentrum liggen bouwfasen uit verschillende perioden. Wanden, doorgangen en afvallagen helpen gebruik te onderscheiden. De datering bepaalt welke activiteiten naast elkaar bestonden en welke elkaar opvolgden.'],
      ['Het statuut van kolonie en de gebouwde ruimte leveren verschillend bewijs', 'Formele titels of inscripties geven informatie over instellingen. Wegen, publieke gebouwen en ommuring helpen hun ruimtelijke context reconstrueren. Voor dagelijks gebruik zoek je aanvullend naar sporen die buiten de institutionele beschrijving vallen.'],
      ['Opgravingen bepalen wat zichtbaar wordt', 'Archeologische resten onder de Plaça del Rei vormen een ruimtelijk beperkte selectie. Andere onderzoekslocaties kunnen een afwijkend beeld geven. Noteer daarom welke wijk of vindplaats elke historische uitspraak feitelijk ondersteunt.'],
    ],
    connection: ['Vergelijk dezelfde plek in meerdere fasen', 'Volg een doorgang of gebouw door opeenvolgende bouwlagen. Leg vast of de plattegrond, toegang of gebruikssporen veranderen. Benoem pas een functiewijziging als de combinatie van aanwijzingen overtuigender is dan eenvoudige herstelling.'],
    tasks: [
      choose('Gebruik beschrijven', 'Wat is het sterkste bewijs dat een ruimte in een bepaalde fase als werkplaats diende?', 'Samenhangende installaties en productieafval uit dezelfde gedateerde laag.', ['Een moderne naam van de straat.', 'De aanwezigheid van een muur elders in de stad.', 'Een plattegrond zonder vindgegevens.'], 'De combinatie van vaste inrichting en afval koppelt een activiteit aan een plaats en fase.'),
      reason('Een opgraving interpreteren', 'Waarom kan een kleine opgraving de economie van Barcino maar gedeeltelijk verklaren?', 'Een werkplaats toont activiteit op één plek. Ik vergelijk gelijktijdige vondsten uit andere wijken en let op verschillen in bewaring en opgravingsomvang voordat ik naar de stad als geheel generaliseer.', ['Noem de ruimtelijke beperking.', 'Beschrijf een vergelijking.', 'Benoem een vertekening in het bewijs.'], 'Een goed gedocumenteerde vindplaats kan sterk bewijs leveren voor een beperkte bewering.'),
    ],
  },
  {
    id: 'atlas-barcelona-cerda', year: 1859, period: 'Vanaf 1859',
    title: 'Barcelona · Het Eixample van Ildefons Cerdà',
    summary: 'Lees het uitbreidingsplan van 1859 als een voorstel voor straten en bouwblokken. Vergelijk de ontworpen ruimte met de gebouwde stad en zoek verklaringen voor verschillen.',
    sources: [source('Ildefons Cerdà Sunyer', 'Pla Cerdà · Plans d’Eixample', '1859', 'Oorspronkelijk plan · kaart, Gemeentearchief Barcelona', 'https://catalegarxiumunicipal.bcn.cat/detail/270417534?lang=en')], caseIds: [],
    dimensions: [
      ['Het raster verdeelde grond en toegang', 'Brede straten, hoekafschuiningen en herhaalde bouwblokken organiseerden de beschikbare grond. De kaart toont een beoogde indeling. Kadastrale gegevens en bouwvergunningen zijn nodig om investeringen en grondprijzen te volgen.'],
      ['Een plan biedt mogelijkheden voor dagelijks gebruik', 'De afmetingen van straten en blokken hebben gevolgen voor verplaatsingen, toegang en ruimte rond woningen. Of bewoners die ruimte ook konden gebruiken hangt af van bebouwing, eigendom, regels en veranderende behoeften.'],
      ['Goedkeuring en uitvoering waren afzonderlijke stappen', 'Het plan van Cerdà dateert uit 1859. Vergelijk het vervolgens met gedateerde bouwgegevens en latere ruimtelijke regels. Zo plaats je verschillen tussen ontwerp en uitvoering bij een concrete fase of beslissing.'],
      ['Een kaart heeft een maker en een doel', 'Een uitbreidingsplan dient om een toekomstige ruimte voorstelbaar en uitvoerbaar te maken. Lees de legenda, schaal en lege plekken. Een foto van de latere stad geeft een ander soort bewijs en vereist eveneens plaats en datering.'],
    ],
    connection: ['Leg ontwerp en uitkomst naast elkaar', 'Kies twee blokken met vergelijkbare vorm op het plan. Volg hoe hun bebouwing door de tijd verschilt en zoek verklaringen in grondbezit, vergunningen en gebruik. Zo toets je de invloed van het ontwerp aan concrete keuzes.'],
    tasks: [
      choose('Plan als bron', 'Wat documenteert het plan van 1859 rechtstreeks?', 'De voorgestelde stratenstructuur en indeling van bouwblokken.', ['Wanneer elke woning precies is gebouwd.', 'Het inkomen van de bewoners.', 'Welke erven honderd jaar later publiek toegankelijk waren.'], 'Het plan documenteert ontwerpkeuzes. Uitvoering vraagt gedateerde aanvullende bronnen.'),
      reason('Ontwerp vergelijken', 'Hoe onderzoek je of geplande binnenruimten werkelijk open bleven?', 'Ik vergelijk het plan met latere kadasterkaarten, luchtfoto’s en vergunningen van dezelfde bouwblokken. Ik controleer welke verschillen voortkwamen uit latere regels of bouwbesluiten.', ['Gebruik bronnen op hetzelfde schaalniveau.', 'Vergelijk meerdere tijdstippen.', 'Benoem een mogelijke verklaring.'], 'Een reeks gedateerde bronnen maakt zichtbaar wanneer de inrichting afweek.'),
    ],
  },
  {
    id: 'atlas-lyon-lugdunum', track: 'roman', year: -43, period: 'Vanaf 43 v.Chr.',
    title: 'Lyon · Lugdunum bij Rhône en Saône',
    summary: 'Volg hoe ligging, verbindingen en Romeins bestuur samen bijdroegen aan de uitbouw van Lugdunum. Gebruik het antieke theater en de stedelijke topografie als vertrekpunt.',
    sources: [heritage('Historic Site of Lyon', 872)], caseIds: [],
    dimensions: [
      ['Rivieren boden routes en overslagmogelijkheden', 'De Rhône en de Saône verbonden de omgeving met andere regio’s. Geografie toont mogelijke verbindingen. Waren, verpakkingen en gedateerde vindplaatsen zijn nodig om te onderzoeken welke goederen de stad daadwerkelijk bereikten.'],
      ['Reliëf en routes verdeelden stedelijke functies', 'De resten op Fourvière en het rivierlandschap verwijzen naar verschillende gebruiksmogelijkheden. Vergelijk ligging en datering van openbare gebouwen met sporen van wonen en arbeid om ruimtelijke samenhang te bepalen.'],
      ['Een koloniale stichting is een duidelijk ijkpunt', 'UNESCO dateert de Romeinse stichting in 43 v.Chr. Een gedateerde stichting helpt de bestuurlijke geschiedenis ordenen. Chronologie van bebouwing en bewoning vereist daarnaast archeologische fasen op afzonderlijke locaties.'],
      ['Een theater gaf publieke bijeenkomsten een vaste plaats', 'De bouw en inrichting maken sommige vormen van publieke aanwezigheid herkenbaar. De samenstelling van het publiek en de financiering van gebeurtenissen kun je onderzoeken met inscripties of gedateerde veranderingen.'],
    ],
    connection: ['Onderzoek welke route welk gebruik mogelijk maakte', 'Breng verbindingen tussen hoogte, oever en achterland in kaart. Vergelijk de ligging van voorzieningen met gedateerde vondsten. Zo toets je of gunstige geografie op een bepaald moment ook de waargenomen economische functie verklaart.'],
    tasks: [
      choose('Goederenstromen aantonen', 'Welke vondst helpt het meest om een goederenverbinding te reconstrueren?', 'Gedateerde verpakkingen waarvan de herkomst via opschrift of materiaal bekend is.', ['Een moderne routeplanner.', 'Een ongedateerde prent van de stad.', 'Een lijst met alleen Romeinse keizers.'], 'Herkomst, vindplaats en datering leggen een toetsbare verbinding tussen twee gebieden.'),
      reason('Geografie en bestuur', 'Hoe onderscheid je de betekenis van rivierligging en koloniale stichting?', 'Ik vergelijk sporen van goederenverkeer met inscripties en gedateerde investeringen in openbare gebouwen. Zo kan ik nagaan wanneer bestuurlijke functies zichtbaar worden en welke verbindingen al zelfstandig bestonden.', ['Scheid beide verklaringen.', 'Noem bronnen voor elk.', 'Let op de volgorde.'], 'Beide factoren kunnen elkaar versterken en hoeven niet op hetzelfde moment doorslaggevend te zijn.'),
    ],
  },
  {
    id: 'atlas-lissabon-wederopbouw', track: 'earlymodern', year: 1755, period: 'Na 1755',
    title: 'Lissabon · De wederopbouw van de Baixa',
    summary: 'Onderzoek hoe de aardbeving en brand van 1755 de herinrichting van het centrum mogelijk maakten. Lees bouwwijze, stratenpatroon en bestuurlijke keuzes samen.',
    sources: [source('Câmara Municipal de Lisboa en Museu do Regimento dos Sapadores Bombeiros de Lisboa', 'Downtown Lisbon', '', 'History en Description · Baixa Pombalina', 'https://baroqueart.museumwnf.org/database_item.php?id=monument%3BBAR%3Bpt%3BMon11%3B28%3Ben')], caseIds: [],
    dimensions: [
      ['Wederopbouw betekende ook herstel van handel', 'De Baixa verbond commerciële straten met de Taag. Nieuwe plannen ordenden die ruimte. Koopmansarchieven, werkplaatsen en voorraden helpen vaststellen hoe snel de handel terugkeerde en waar activiteiten zich verplaatsten.'],
      ['De ramp had verschillende gevolgen per buurt en huishouden', 'Slachtoffers, schade en verlies van woonruimte waren ruimtelijk ongelijk verdeeld. Vergelijk schadeverslagen met adres- of eigendomsgegevens. Onderzoek ook wie zichtbaar blijft in de administratie en voor welke bewoners gegevens ontbreken.'],
      ['Het bestuur stelde nieuwe regels en ruimtelijke prioriteiten', 'De wederopbouw onder de regering van Pombal bracht standaardisering en een regelmatiger stratenpatroon. Verschillende plannen en besluitdata kunnen aantonen welke voorstellen werden gekozen en hoe hun uitvoering verliep.'],
      ['Technische oplossingen zitten in gebouwen verborgen', 'Bij de wederopbouw werd gebruikgemaakt van houten raamwerken in gebouwen. Bestudeer bouwsporen en technische stukken om het beoogde gebruik te achterhalen. Vergelijk panden met verschillende bouwfasen voordat je een techniek algemeen noemt.'],
    ],
    connection: ['Verbind een schok aan een besluit en een uitkomst', 'Vergelijk de kenmerken van een straat vóór en na de ramp. Onderzoek welke veranderingen voortkwamen uit schade, welke uit regels en welke uit latere aanpassingen. Zo blijven de ramp en wederopbouw verschillende momenten in de verklaring.'],
    tasks: [
      choose('Een plan vergelijken', 'Welke bronnencombinatie helpt te bepalen hoe de Baixa werd heringericht?', 'Gedateerde plannen van vóór en na de ramp met gegevens over gerealiseerde gebouwen.', ['Een ongedateerde beschrijving van een aardbeving.', 'Een reeks havenkaarten van andere steden.', 'Een portret van Pombal.'], 'Een vergelijking van plan en gebouwen onderscheidt de voorgestelde en gebouwde stad.'),
      reason('Ongelijke gevolgen', 'Hoe onderzoek je of de ramp alle stadswijken op dezelfde manier trof?', 'Ik vergelijk schade, bewoning en hersteltijd per wijk. Ik controleer of bronnen dezelfde soorten schade tellen en let op verschillen in brand, ligging en toegankelijkheid van krediet.', ['Gebruik gegevens per wijk.', 'Scheid schade van herstel.', 'Benoem een verklarende factor of bronprobleem.'], 'Vergelijkbare metingen maken verschillen in zowel blootstelling als herstel toetsbaar.'),
    ],
  },
]);
