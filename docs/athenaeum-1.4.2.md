# Voortgangsregister Athenaeum 1.4.2

Bijgewerkt op 24 november 2026. GitHub Pages serveert 1.4.1 vanaf `main` (`56ef684681a383ad5399e791a06f1c6a32f821a4`). De wijzigingen staan op `codex/athenaeum-1-4-2` met kanaal `test`.

De basis voor K01–K90 is *Athenaeum — KILLCRITIC-foutenregister*, 23 november 2026, sectie «Geprioriteerd issue-register» (Markdown zonder paginering). Bij «Overgenomen» is de auditbevinding bewaard voor latere hertoetsing. «Getest» verwijst naar het expliciet genoemde scenario. Een productieadvies op zich bewijst geen uitval of gegevenstoegang.

## Uitgevoerde wijziging en bewijs

| Werkpakket | Bestanden en besluit | Controles en afhankelijkheden |
| --- | --- | --- |
| Atlas en laden | `academy/atlas-view.js`, `atlas-globe.js`, `atlas-catalog.js`, `content/atlas-sites.js`. Herstart de kaart binnen de pagina. Toetsenbord en kaartknoppen worden beschikbaar zodra het canvas getekend is. Geef 33 huidige naamperiodes een open einddatum. | In Chromium trad een gesimuleerde HTTP 503 op. Na ‘Kaart opnieuw laden’ verscheen Massilia bij 100 n.Chr., met behouden filters en een werkende stedenlijst. De releasecontrole toetst 2100, een leemte bij Marseille en de gesloten periode van Pompeï. |
| Lespakketten en cache | `academy/catalog.js`, `fetch-json.js`, `app.js`, `scripts/build-offline.mjs`, `sw.js`, `sw-assets.js`. Controleer dubbele sleutels en behoud de oorzaak van laadfouten. De worker gebruikt de entry uit het gegenereerde bestand. | Tests voor 503, een ongeldig pakket en geslaagde herlaadpoging. Gegenereerde bestanden zijn opnieuw opgebouwd. Een update vanuit een eerder geïnstalleerde 1.4.1 vereist nog een volledige controle. |
| Kennis en toetsing | `academy/assessment.js`, `learning.js`, `app.js`, `views.js`, `progress-overview.js`, `daily-view.js`, `streak.js`. Registreer afzonderlijk herkenning, zelfstandige reproductie, hulp en zelfbeoordeling. Twee zelfstandige pogingen met minstens 24 uur ertussen vormen een indicator voor herhaling. Eerdere uitslagen behouden hun opgeslagen score en krijgen het label ‘toenmalige telling’. | Unittests voor hulp, zelfbeoordeling, overslaan, leesactiviteit, minimuminterval, bestaande scores en ijsklontjes. Chromium liet na zelfcorrectie 0 van 2 automatisch juist en 1 zelf beoordeeld zien. Beide waarden bleven beschikbaar na herladen. |
| Synchronisatie | `academy/storage.js`, `shared/sync.js`, `app.js`. Deel tokenvernieuwing binnen een tabblad. Blokkeer een late sessievernieuwing na afmelden. Houd afgewezen items lokaal en verwerk de andere records. De IndexedDB-sleutels en Supabase-structuur blijven compatibel met 1.4.1. | Bij twee gelijktijdige aanroepen daalde het aantal gesimuleerde vernieuwingsverzoeken van twee naar één. Afmelding bleef actief bij een late reactie. De browsertest oefent vijf geïsoleerde profielen met testrecords. Een test met vijf echte accounts en meerdere toestellen volgt op staging. |
| Supabase | `supabase/functions/telegram-bot/index.ts` en `authorization.ts`. Valideer gedeelde autorisatie vóór meldingsacties. | Bevestigd in productiemetadata dat de oude Telegram-planning inactief is en webpush elke minuut gepland staat. Gecontroleerde productieadvisering en bronlezing, zonder schema- of accountwijziging. De unittests gebruiken fictieve waarden. Staginguitrol en productieverificatie staan open. |
| Automatische verificatie | `scripts/verify-release.mjs`, `scripts/verify-stability.mjs`, `scripts/verify-browser.mjs`, `.github/workflows/verify.yml`. | Codecontrole, reproduceerbare catalogusrun en zeven geslaagde Node-tests. De browserworkflow dekt drie schermbreedtes, herladen na storing, offline herstart, examen en vijf lokale synchronisaties. Status van die workflow staat bij de pull request. |

Verificatie van de bestaande basis toonde 548 lessen, 4.769 vragen uit de lespakketten, 65 atlasplaatsen, 26 afzonderlijke gebeurtenissen en 41 Traditio-lessen. Het startscherm, Apps, onderbalk, `/leer`, bestaande routes en les-ID’s gebruiken dezelfde structuur. De testbrowser tekende het canvas op desktop (574 × 525 px) en in telefoon- en tabletweergaves (329 × 310 px en 526 × 377 px). Binnen die atlasweergaves bleef de documentbreedte gelijk aan de viewport. In de testversie zijn ook Massilia, leesmarkering na herstart, weekexamen, 44 v.Chr. in Chronologia en de Scriptorium-werkruimte geopend.

## Reproduceerbare controle

```sh
node scripts/build-catalog.mjs
node scripts/build-offline.mjs
node scripts/verify-release.mjs
node --test scripts/verify-stability.mjs
npm install --no-save --package-lock=false playwright@1.62.1
npx playwright install --with-deps chromium
node --test scripts/verify-browser.mjs
```

De wijzigingsreferentie per bestand staat in de geschiedenis van de 1.4.2-pull request. De testbranch is terug te zetten door vanaf de GitHub Pages-basis te werken. Verifieer vóór samenvoegen browsers op een gewone telefoon of tablet, een herstelproef op staging en een cloudtest met onafhankelijke accounts. Voor de volledige cache-upgrade is zowel een bestaande als een schone installatie nodig.

## Volgorde van de volgende werkpakketten

1. Herstelproef en vijf aparte testaccounts op staging. Test offline bewerken, sync, profielwissel, gelijktijdige writes en verlies van verbinding.
2. Verifieer de Edge Function na staginguitrol en toets de actuele Supabase-adviezen aan het gebruikte platform. Hou de bestaande webpushroute in de regressietests.
3. Valideer de upgrade vanuit 1.4.1 en de laadprestaties op echte toestellen. Publiceer 1.4.2 wanneer de vrijgavecontroles zijn geslaagd.
4. Werk in 1.5 het kennismodel, volledig curriculum, bronverificatie, klassieke talen, Traditio en Scriptorium uit.
5. Verbind in 1.6 de atlas, kaartlagen, Chronologia en kennisgraaf met controleerbare data.

## Geïnventariseerde auditpunten

| ID | Prioriteit | Domein | Bevinding | Status | Vervolg of bewijs |
| --- | --- | --- | --- | --- | --- |
| K01 | P0 | Beoordeling | Hulp beïnvloedde de automatische score | Getest | Kennis en toetsing |
| K02 | P0 | Beoordeling | Voltooide oefenactiviteit werd te makkelijk gelezen als beheersing | Getest | Kennis en toetsing |
| K03 | P0 | Beoordeling | Open vragen tellen uitsluitend als zelfbeoordeling | Getest | Kennis en toetsing |
| K04 | P1 | Beoordeling | Tien vragen in de standaardweektoets | Bevestigd | De uitgebreide toets heeft een optie voor alle leerdoelen. Onderzoek nog hoe grote toetsen worden opgeslagen. |
| K05 | P1 | Beoordeling | Achttien vragen in de standaardmaandtoets | Bevestigd | De uitgebreide toets heeft een optie voor alle geoefende leerdoelen. |
| K06 | P1 | Beoordeling | Week- en maandtoets vereisen respectievelijk twee en vier leerdoelen | Bevestigd | Toets later de ondergrenzen didactisch. |
| K07 | P1 | Didactiek | Herhalingsintervallen niet empirisch gekalibreerd op individuele retentie | Overgenomen | Kalibreer herhaling op onafhankelijke antwoorden per vaardigheid. |
| K08 | P1 | Didactiek | Herkenning en zelfstandige reproductie vergen aparte meetreeksen | Deels getest | Kennis en toetsing. Individuele kalibratie volgt in 1.5. |
| K09 | P1 | Didactiek | Studieduur en dagelijkse doelen niet verbonden met gevalideerde leeropbrengst | Overgenomen | Kalibreer herhaling op onafhankelijke antwoorden per vaardigheid. |
| K10 | P2 | Didactiek | Motivatiebeloningen uit resultaten scheiden van kennisbeheersing | Getest voor scores | Kennis en toetsing. Historische ijsklontjes blijven herleidbaar. |
| K11 | P1 | Leerinhoud | Vaste formule doorgaans 1 begripsvraag + 2 open taken | Overgenomen | Schrijf en verifieer nieuwe vraagvarianten aan echte leerdoelen. |
| K12 | P1 | Leerinhoud | Auto-gegenereerde meerkeuze vraagt vaak slechts welke fase eerst komt | Overgenomen | Schrijf en verifieer nieuwe vraagvarianten aan echte leerdoelen. |
| K13 | P1 | Curriculum | Dekking van het volledige historische curriculum | Open | 548 unieke lessen gecontroleerd. Inhoudelijke dekking valt onder 1.5. |
| K14 | P1 | Curriculum | Romeinse dekking overheerst vele andere perioden | Overgenomen | Werk regionale kerntrajecten uit met bronnen en voorkennis. |
| K15 | P1 | Curriculum | Globale tijdvakken gebruiken Europese ijkpunten als hoofdstructuur | Overgenomen | Werk regionale kerntrajecten uit met bronnen en voorkennis. |
| K16 | P1 | Curriculum | Geen volledig expliciet prerequisietennetwerk | Overgenomen | Werk regionale kerntrajecten uit met bronnen en voorkennis. |
| K17 | P1 | Curriculum | Academische lesinhoud blijft vaak korte drievoudige samenvatting | Overgenomen | Werk regionale kerntrajecten uit met bronnen en voorkennis. |
| K18 | P1 | Curriculum | Universitaire literatuurlijsten zijn niet hetzelfde als inhoudelijke validatie | Overgenomen | Werk regionale kerntrajecten uit met bronnen en voorkennis. |
| K19 | P1 | Bronnen | Controleert HTTPS-patroon maar niet feitelijke pagina en argument | Overgenomen | Koppel brontekst, editie en pagina aan afzonderlijke beweringen. |
| K20 | P1 | Bronnen | Lesbronnen staan niet altijd bij elke afzonderlijke historische uitspraak | Overgenomen | Koppel brontekst, editie en pagina aan afzonderlijke beweringen. |
| K21 | P1 | Bronnen | Broncorpus wordt niet als versievaste kritische editie beheerd | Overgenomen | Koppel brontekst, editie en pagina aan afzonderlijke beweringen. |
| K22 | P1 | Bronnen | Bronzekerheid in proza maar niet als machineleesbare claimstatus | Overgenomen | Koppel brontekst, editie en pagina aan afzonderlijke beweringen. |
| K23 | P1 | Bronnen | PDF-pagina en gedrukt paginanummer zijn onderscheiden maar niet automatisch geverifieerd | Overgenomen | Koppel brontekst, editie en pagina aan afzonderlijke beweringen. |
| K24 | P1 | Bronnen | DOCX-tekstextractie bevat geen stabiele gedrukte paginering | Overgenomen | Koppel brontekst, editie en pagina aan afzonderlijke beweringen. |
| K25 | P1 | Bronnen | Overleveringsstadia en tekstgetuigen missen geïntegreerde provenancegrafiek | Overgenomen | Koppel brontekst, editie en pagina aan afzonderlijke beweringen. |
| K26 | P1 | Atlas | Huidige plaatsnamen eindigden in 2026 | Getest | Atlas en laden |
| K27 | P1 | Atlas | Jaarfilter past plaatsaanwezigheid aan, geen reconstructie van territoria | Overgenomen | Valideer de uitbreiding en haar bron- of dateringgegevens vóór integratie. |
| K28 | P1 | Atlas | Eén lage-resolutie wereldvorm blijft dezelfde bij inzoomen | Overgenomen | Valideer de uitbreiding en haar bron- of dateringgegevens vóór integratie. |
| K29 | P1 | Atlas | Coördinaat modelleert huidig centrum, niet historische locatieversies | Overgenomen | Valideer de uitbreiding en haar bron- of dateringgegevens vóór integratie. |
| K30 | P1 | Atlas | Toponiemen missen eigen geattesteerde temporele taalrecords | Overgenomen | Valideer de uitbreiding en haar bron- of dateringgegevens vóór integratie. |
| K31 | P1 | Atlas | Clustering bij duizenden plaatsen | Open | 65 locaties gevalideerd. Volumetest valt onder 1.6. |
| K32 | P2 | Atlas | Kaart kon enkel herstellen met paginaherlading | Getest | Atlas en laden |
| K33 | P1 | Atlas | Geen gestructureerde route-, transport- en infrastructuurlagen | Overgenomen | Valideer de uitbreiding en haar bron- of dateringgegevens vóór integratie. |
| K34 | P1 | Atlas | Geen vergelijking twee periodes naast elkaar | Overgenomen | Valideer de uitbreiding en haar bron- of dateringgegevens vóór integratie. |
| K35 | P2 | Atlas | Kaartcanvas heeft alleen beperkte toegankelijkheidsalternatieven | Overgenomen | Valideer de uitbreiding en haar bron- of dateringgegevens vóór integratie. |
| K36 | P1 | Chronologie | Chronologia telt 26 afzonderlijke gebeurtenissen | Bevestigd | Uitbreiden in 1.6. |
| K37 | P1 | Chronologie | Veel lessen gekoppeld aan enkel ijkpunt i.p.v. procesinterval | Overgenomen | Voeg brongebonden gebeurtenissen en regionale intervallen toe. |
| K38 | P1 | Chronologie | Parallelle wereldregio-ontwikkelingen moeilijk zichtbaar | Overgenomen | Voeg brongebonden gebeurtenissen en regionale intervallen toe. |
| K39 | P2 | Chronologie | Tijdlijn is visueel aantrekkelijker dan structureel analytisch | Overgenomen | Voeg brongebonden gebeurtenissen en regionale intervallen toe. |
| K40 | P1 | Klassieke talen | Veel klassieke lesvragen gebruiken open zelfbeoordeelde vertaling | Overgenomen | Toets vormanalyse, uitspraak en open vertaling per leerniveau. |
| K41 | P1 | Klassieke talen | Diakritiek standaard genegeerd tenzij strict=true | Overgenomen | Toets vormanalyse, uitspraak en open vertaling per leerniveau. |
| K42 | P1 | Klassieke talen | Browserstemmen garanderen geen geschikte gereconstrueerde uitspraak | Overgenomen | Toets vormanalyse, uitspraak en open vertaling per leerniveau. |
| K43 | P1 | Klassieke talen | Latijn omvat 22 lessen | Bevestigd | Volledige lectuurtrajecten vallen onder 1.5. |
| K44 | P1 | Klassieke talen | Oudgrieks omvat 25 lessen | Bevestigd | Volledige lectuurtrajecten vallen onder 1.5. |
| K45 | P1 | Traditio | Traditio omvat 41 lessen | Bevestigd | Verdieping van verhalen en broncontrole volgen in 1.5. |
| K46 | P1 | Traditio | Historische gebeurtenis, religieuze claim en latere tekstlaag niet allemaal gestructureerd | Overgenomen | Breid de brongebonden cycli en leeractiviteiten uit. |
| K47 | P1 | Import | Woordselectie via langste/hoofdletterterm kan triviale vragen opleveren | Overgenomen | Meet gedrag bij grotere echte bestanden en werk verwerking in delen uit. |
| K48 | P1 | Import | Max 80p, 180k tekens, 18MB per verwerking | Overgenomen | Meet gedrag bij grotere echte bestanden en werk verwerking in delen uit. |
| K49 | P2 | Onderzoek | Max 60 primaire bronnen, 100 studies per dossier | Overgenomen | Test de omvangslimieten en werk paginering en bronkoppelingen uit. |
| K50 | P2 | Onderzoek | Max 24 vergelijkingregels per bord | Overgenomen | Test de omvangslimieten en werk paginering en bronkoppelingen uit. |
| K51 | P2 | Onderzoek | 700 leerprincipes in cache; 120 in overzicht | Overgenomen | Test de omvangslimieten en werk paginering en bronkoppelingen uit. |
| K52 | P1 | Onderzoek | Crossref-search maximaal 12 resultaten | Overgenomen | Test de omvangslimieten en werk paginering en bronkoppelingen uit. |
| K53 | P1 | Onderzoek | Zoeken via exacte tokens/prefix met beperkte synoniemen | Overgenomen | Test de omvangslimieten en werk paginering en bronkoppelingen uit. |
| K54 | P1 | Onderzoek | Synthetische onderzoeksvoorbeelden staan in dezelfde app als bronbeheer | Overgenomen | Test de omvangslimieten en werk paginering en bronkoppelingen uit. |
| K55 | P1 | Onderzoek | Bronnen en claims niet als universele grafische entiteiten gekoppeld | Overgenomen | Test de omvangslimieten en werk paginering en bronkoppelingen uit. |
| K56 | P0 | Architectuur | Feitelijke laadfouten van lespakketten gingen verloren | Getest | Atlas en laden |
| K57 | P1 | Architectuur | Hoofdcontroller combineert veel verantwoordelijkheden | Deels geïmplementeerd | Wereldbolcyclus in atlasmodule. Beoordeling in een afzonderlijke pure module. |
| K58 | P1 | Architectuur | Grote HTML-string rendering beperkt componenttests | Overgenomen | Controleer afhankelijkheden en splits verantwoordelijkheden in kleine stappen. |
| K59 | P1 | Architectuur | Monolithische scriptfile >5.000 regels | Overgenomen | Controleer afhankelijkheden en splits verantwoordelijkheden in kleine stappen. |
| K60 | P1 | Architectuur | Verwijst door terwijl oude paideia-code nog aanwezig | Overgenomen | Controleer afhankelijkheden en splits verantwoordelijkheden in kleine stappen. |
| K61 | P1 | Architectuur | Honderden !important en meerdere stijl-generaties | Overgenomen | Controleer afhankelijkheden en splits verantwoordelijkheden in kleine stappen. |
| K62 | P1 | Architectuur | 318 !important overschrijvingen | Overgenomen | Controleer afhankelijkheden en splits verantwoordelijkheden in kleine stappen. |
| K63 | P1 | Architectuur | Ingebedde oude en nieuwe stijlen naast aparte CSS | Overgenomen | Controleer afhankelijkheden en splits verantwoordelijkheden in kleine stappen. |
| K64 | P1 | Architectuur | Productieversie van de AI-docent mist een gekoppelde versiebeheerde bron | Bevestigd | Reproduceerbare uitrol en testgegevens in 1.5. |
| K65 | P1 | Architectuur | Diagnostica toont de oude testprocedure van 1.2.1 | Open | Actualiseren aan de hand van de gevalideerde browsertests. |
| K66 | P0 | Testing | Automatische browsercontrole en CI ontbreken op de basisversie | Deels getest | Zeven automatische componenttests slagen. De CI-configuratie bevat de Chromium-suite. |
| K67 | P1 | Testing | Bronchecks vooral structureel, geen inhoudelijke corroboratie | Overgenomen | Leg reproduceerbare tests en acceptatiecriteria vast. |
| K68 | P1 | Testing | Cacheversies liggen verspreid in imports | Deels getest | De worker leest zijn entry uit het gegenereerde bestand. Importversies blijven per module lopen. |
| K69 | P1 | Testing | Offline upgrade tussen releases moet worden getoetst | Open | Valideer upgrade vanuit een geïnstalleerde 1.4.1 en herstel met beide workers. |
| K70 | P0 | Security | Toegangscontrole van de oude meldingsfunctie is onvoldoende afgebakend | Broncode getest | Supabase. Productiecode nog apart te verifiëren en uit te rollen. |
| K71 | P1 | Security | Controle op gelekte wachtwoorden staat uit | Productieadvies bevestigd | Projectinstelling en beschikbaar abonnement verifiëren vóór wijziging. |
| K72 | P1 | Security | RLS-beleid evalueert functies per rij | 20 productieadviezen bevestigd | Equivalentie toetsen met de operationele tabellen en testaccounts. |
| K73 | P2 | Security | Controleer de plaatsing van de pg_net-extensie | Productieadvies bevestigd | Afhankelijkheden van bestaande deployments vaststellen. |
| K74 | P2 | Security | Bevestig toegangsmodel webpushapparaten | Productiemetadata gecontroleerd | RLS actief. Direct lezen door anonieme en aangemelde bezoekers uitgesloten. Servicefunctie en meldingen apart testen. |
| K75 | P1 | Security | Lokale pincode gebruikt een eenvoudige hash | Overgenomen | Verifieer migratie zonder verlies van profielen. |
| K76 | P1 | Security | Sessiegegevens worden in browseropslag bewaard | Overgenomen | Onderzoek een compatibel sessiemodel met Scriptorium. |
| K77 | P1 | Data | Synchronisatie kan botsen met sessievernieuwing en losse records | Deels getest | Synchronisatie. Serverisolatie en meer toesteltests blijven open. |
| K78 | P1 | Data | Herstel vanuit een onafhankelijke productieback-up | Open | Controleer back-up en herstel op staging. |
| K79 | P1 | Data | Statistieken moeten kennisbewijzen onderscheiden van activiteit | Getest voor herkenning en reproductie | Kennis en toetsing. Toepassing en langetermijnmetingen volgen in 1.5. |
| K80 | P1 | AI | LLM-beoordeling niet aantoonbaar menselijk gekalibreerd | Overgenomen | Verifieer brongetrouwheid en overeenstemming met menselijke beoordeling. |
| K81 | P2 | AI | Promptcontext begrensd en samengeperst, kan uitleg missen | Overgenomen | Verifieer brongetrouwheid en overeenstemming met menselijke beoordeling. |
| K82 | P1 | UX | Veel Latijnse namen zonder één uniforme leertaakhierarchie | Overgenomen | Controleer de bestaande modules op telefoon, tablet en desktop. |
| K83 | P1 | UX | Kleine 10-12px annotaties in bron-/UI-elementen | Overgenomen | Controleer de bestaande modules op telefoon, tablet en desktop. |
| K84 | P1 | UX | Kaartinteractie moet naast stedenlijst toegankelijk blijven | Overgenomen | Controleer de bestaande modules op telefoon, tablet en desktop. |
| K85 | P1 | UX | Veel kaarten/panels kunnen doorlopende lectuur fragmenteren | Overgenomen | Controleer de bestaande modules op telefoon, tablet en desktop. |
| K86 | P1 | UX | Voortgangsoverzicht laat leerwinst beperkt interpreteren | Overgenomen | Controleer de bestaande modules op telefoon, tablet en desktop. |
| K87 | P2 | UX | Meerdere historische ontwerpstaten veroorzaken inconsistentie | Overgenomen | Controleer de bestaande modules op telefoon, tablet en desktop. |
| K88 | P1 | Toegankelijkheid | A11y basis aanwezig, integrale WCAG audit ontbreekt | Overgenomen | Test met toetsenbord, schermlezer en verschillende schermgroottes. |
| K89 | P1 | Privacy | Synchronisatiestatus per record en toestel | Deels geïmplementeerd | Status voor gedeeltelijke sync beschikbaar. Recordstatus in volledige UX blijft open. |
| K90 | P1 | Strategie | Ambitie alle geschiedenis vs beperkte gedocumenteerde dekking | Overgenomen | Werk per leerlijn vanuit wetenschappelijk gecontroleerde minimumcriteria. |
| K91 | P0 | Laden | Lespakket kon dezelfde les dubbel bevatten en een andere les missen | Getest | Lespakketten en cache |
| K92 | P0 | Data | Een afgewezen record kon de resterende cloudsync ophouden | Geïmplementeerd | Synchronisatie. Valideer ook tegen de echte databasegrens op staging. |
| K93 | P0 | Data | Parallelle of late sessievernieuwing kon de actieve sessie opnieuw invullen | Getest | Synchronisatie |
| K94 | P0 | Beoordeling | Alleen overslaan kon oefenactiviteit verhogen | Getest | Kennis en toetsing |
