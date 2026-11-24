# Athenaeum 1.5.0 · Dagelijkse leercyclus

Vertrekpunt is de gepubliceerde versie 1.4.2, commit `04216f8`. Alle 548 les-ID’s, bestaande leerdoelen en oorspronkelijke vragen zijn behouden.

## Bevindingen en wijzigingen

| Onderdeel | Bevinding in 1.4.2 | Wijziging |
| --- | --- | --- |
| Hodie en planning | De herhaling kon eerder gestarte doelen vragen die verder buiten de dagles vielen. | De voorbereidingsstap toont de begrippen die in de geplande vragen voorkomen. Vragen na het lezen horen bij de beschikbare lesuitleg. Herhaling vóór het lezen vraagt eerder behandelde stof waarvan het interval is verlopen. |
| Uitleg en begrippen | De les- en vraagdata beschikten over toelichtingen per leerdoel. Begrippen stonden verspreid over de catalogus. | Het begrippenregister is vanuit Hodie en Paideia te openen. Een dagles maakt onderscheid tussen nieuwe begrippen en eerder zelfstandig opgehaalde termen. |
| Bronanalyse en academische toepassing | Gegenereerde vergelijkingen gebruikten soms lesuitleg als modelantwoord. | Uitgewerkte casussen bevatten een voorbereiding, een afzonderlijk voorbeeld, bronmateriaal, een toepassingsvraag en een open onderzoeksopdracht. |
| Feedback | De meeste vragen toonden dezelfde toelichting voor iedere keuze. Open antwoorden hadden algemene criteria. | De nieuwe bronvragen lichten afleiders afzonderlijk toe. Open opdrachten gebruiken criteria met concrete aanknopingspunten voor een herwerking. Antwoorden, feedback en zelfbeoordeling blijven terugleesbaar na de dagles. |
| Hulp en voortgang | Twee hints en de volledige aanpak waren tegelijk toegankelijk. | Drie tips worden opeenvolgend getoond en bewaard bij de poging. Zelfstandige herkenning, reproductie en toepassing tellen afzonderlijk. Een volgende dagles selecteert bij voorkeur een andere vraag rond een leerdoel dat hulp vergde. |
| Toetsen | De maandtoets keek naar geoefende doelen uit de volledige historie. | De week- en maandtoets gebruiken de stof die in hun eigen kalenderperiode is gelezen of geoefend. |
| Offline en synchronisatie | Daglessen laadden alle lespakketten, ook bij hervatten. | Hervatten laadt de betrokken pakketten. De offlinecache bevat de begrippen en casussen. De nieuwe dagrecords gebruiken de bestaande IndexedDB- en Supabase-structuren. |

## Inhoud

Het voorbereidingsmodel wordt gebruikt door 349 lessen in geschiedenis, algemene kennis en Traditio. Er zijn 30 begripsfiches. Dertien broncasussen zijn gekoppeld aan 25 bestaande lessen. Ze behandelen onder meer Polybius over de Romeinse constitutie, Hadrianus over Aphrodisias, de Atheense burgerinschrijving, Massalia bij Strabo, arbeidswetgeving na de pest, de Caïro-geniza, Song-China, Mali, aflaatprediking, Atlantische slavernij, Haïti in 1804, Britse fabrieksinspectie en Bandung.

| Waar | Onderhoud |
| --- | --- |
| [Begrippen](../academy/content/study-concepts.js) | Definitie, historische reikwijdte, voorbeeld, verwante begrippen en vindplaats. |
| [Bronverwijzingen](../academy/content/study-sources.js) | Auteur, werk en verifieerbare sectie, regel, pagina of archiefcode. |
| [Broncasussen](../academy/content/history-seminars.js) | Bronvoorbereiding en vragen koppelen via bestaande les- en leerdoelsleutels. |
| [Daglestests](../scripts/verify-daily.mjs) | Controle op voorbereiding, rubrics, hints, herhaling, gedeeltelijk laden, toetsselectie en omvang van opgeslagen plannen. |
| [Browsertests](../scripts/verify-browser.mjs) | Controle op mobiel en desktop, bewaarde feedback, herladen, oude profielen en offline. |

Open antwoorden worden door de gebruiker beoordeeld. De rubrics geven criteria en voorbeelden. Er is geen automatische beoordeling van historische argumentatie.

## Validatie en vervolg

De lokale controles van catalogus, scripts, begrippen, lesopbouw en scoring zijn geslaagd. De [GitHub Actions-uitvoering](https://github.com/loic1311/Athenaeum/actions) bevat de browser-, PostgreSQL- en Supabase-controles voor deze versie.

De volgende inhoudelijke uitbreidingen kunnen bestaande les-ID’s en leerdoelsleutels gebruiken. De individuele broncontrole en herwerking van de oudere vragen buiten de 25 gekoppelde lessen staan nog open. De vaste herhaalintervallen vragen nog longitudinale validatie. Voor zeer grote toetsen blijft de bestaande Supabase-grens van 250.000 UTF-8-bytes per record gelden. Fysieke tests van appmeldingen en de geïnstalleerde iOS- en Android-app blijven afzonderlijke controles.
