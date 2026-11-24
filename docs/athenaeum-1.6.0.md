# Athenaeum 1.6.0

De update vertrekt van de productieversie 1.5.0, commit `351cc56`. De catalogus telt 570 lessen. De 548 les-ID’s uit 1.5.0 en hun leerdoelsleutels komen nog voor in de catalogus. Docenten kunnen de inhoud verder uitbreiden via losse pakketten en bronverwijzingen per lesonderdeel.

## Inhoud en voortgang

| Onderdeel | Stand | In deze versie | Openstaand |
| --- | --- | --- | --- |
| Catalogus | Geïnventariseerd, technische controles geslaagd | De inventaris doorloopt alle lespakketten en registreert per les leerdoelen, vragen, vindplaatsen, beoordelingscriteria en structurele kenmerken. | De les- en vraaginhoud van het oudere materiaal per vak redactioneel herlezen. Structurele aanwezigheid van een verwijzing zegt weinig over de bewijskracht. |
| Geschiedenis | Geïmplementeerd, getest in de modellen | 18 nieuwe lessen met uitgewerkte secties en bronnen. Acht behandelen de Egeïsche wereld en het Nabije Oosten in 1600–800 v.Chr., vier volgen de Karolingen en zes behandelen Shang, San Lorenzo, Wari en Tiwanaku, Tiberius Gracchus, Haïti en het Belgische kiesrecht. | Meer inhoudelijke revisies in de overige perioden en regio’s, inclusief het landelijk perspectief, politieke economie en gespecialiseerde historiografie. |
| Begrippen en toetsen | Geïmplementeerd, getest in de modellen | Laad de begrippenfiches voor Lineair A, Lineair B, wanax en redistributie via de les. Het oefenmodel gebruikt deze gecontroleerde fiches voor begripsvragen. De nieuwe bank bevat 36 geschreven geschiedenisvragen en twee vergelijkende synthesevragen. Thematische, cumulatieve en gevorderde examens staan bij Toetsen. Grote selecties zijn verdeeld over toetsdelen. De student beoordeelt open antwoorden met een rubric. | Nagaan welke oudere vragen historisch zwak of onvolledig zijn en ze vervangen met behoud van de leerdoelsleutels. |
| Talen | Geïmplementeerd, getest in de modellen | Vier lessen oefenen Franse deelwoordspelling, Italiaanse verleden tijden, de Latijnse accusativus cum infinitivo en Griekse participia. Frans en Italiaans bevatten een leesopgave en spreekprompt. De klassieke lessen werken met Caesar en Xenophon. | Dezelfde redactionele aanpak toepassen op de oudere lessen, meer doorlopende lectuur en volledige taalexamens toevoegen. |
| Atlas | Geïmplementeerd, getest in de modellen | Tijdschuif, jaartalinvoer, vergelijking, afspelen, regio- en soortfilter, aanklikbare punten en gebieden, brongegevens en leslinks. De nieuwe lagen tellen 33 historisch gesitueerde vermeldingen en 13 geometrieën. De invoer op Nu geeft toegang tot de bestaande wereldbol met steden. | Uitbreiding van de geografische en chronologische dekking. Vooral grote delen van de prehistorie, Azië, Afrika, Amerika en Oceanië blijven beperkt gedocumenteerd in de atlas. |
| Stadsdossiers | Geïmplementeerd | De 65 bestaande plaatsingangen openen chronologische dossiers. Ze gebruiken plaatsgegevens en waar beschikbaar lange uitgewerkte stadslessen, zoals voor Marseille. Vanuit het dossier kun je oefeningen en gerelateerde lessen openen. | Dossiers waarvan de huidige broninhoud uit enkele fasen bestaat, verder uitwerken met stadsspecifieke literatuur. |
| Opslag en offline | Geïmplementeerd | De nieuwe pakketten en kaartlagen zijn opgenomen in de offlinecache. Grote examens worden opgedeeld op basis van de grootte van het synchronisatierecord. | De algemene opslaggrenzen blijven per externe dienst gelden. Voer bij uitbreiding nieuwe metingen uit van laadtijden en omvang van bewaarde pogingen. |

Start via **Paideia → Griekse oudheid**, **Toetsen → Universitaire examens** of **Paideia → Atlas**. Gebruik `node scripts/audit-curriculum.mjs --details` voor de inventaris per les en vraag. De JSON-uitvoer is geschikt voor verdere vergelijking tussen versies.

## De vijf examenbijlagen

| Document en auteurschap | Vindplaats | Toegepast in Athenaeum |
| --- | --- | --- |
| *Voorbeeld-examen Geschiedenis van de Griekse en Romeinse Oudheid*, auteur niet ondertekend. Word noemt DICT als documentmaker en Andries Johan Zuiderhoek als laatste bewerker. | pp. 1–2, Word-paginering | Voorgeschiedenis en werking van instellingen verklaren. Begrippen in tijd, plaats en historische context gebruiken. |
| Jeroen Deploige, *Geschiedenis van de middeleeuwen. Enkele toelichtingen en studietips* (februari 2025). | p. 2 en pp. 3–4 | Diachrone vergelijking, synchrone verbanden, argumentatie uit meerdere lessen en de koppeling tussen lokale voorbeelden en ruimere processen. |
| Anne Goddeeris volgens de PDF-metadata, *Informatie schriftelijk examen GONO*. | pp. 1–3, vooral p. 2 | Meerkeuze met inhoudelijk verdedigbare afleiders. Vragen naar mechanismen van contact en vergelijking van historische zones. |
| Kristoffel Demoen volgens de PDF-metadata, *De literatuur van de Oudheid, partim Grieks. Examenverwachtingen 2025–26*. | pp. 1–4, PDF-paginering | Chronologische en generische situering, fragmentanalyse, expliciete deelcriteria en uitleg bij formele kenmerken. |
| Yanick Maes volgens de PDF-metadata, *De literatuur van de Oudheid. Partim Latijnse literatuur. Afspraken examen*. | pp. 1–3 | Literair-historische synthese en onderbouwde herkenning van betekenisvolle tekstkenmerken. D. Knecht staat op p. 1 als auteur van het handboek. |

De gebruikte vragen zijn nieuw geschreven. Gericht zoeken in de verbonden Google Drive leverde voor deze versie geen relevante cursusbestanden op.

## Kaartgegevens

De 13 geometrieën komen uit [OpenHistoricalMap](https://www.openhistoricalmap.org/copyright) en verwijzen per gebied naar de oorspronkelijke relatie. De Frankische gebieden gebruiken onder meer historische kaarten uit de atlassen van Droysen, Spruner–Menke en Shepherd die in de relationsmetadata vermeld staan. De geometrie is vereenvoudigd voor gebruik op de wereldbol. Waar exacte wijzigingsdata bestaan, volgt de kaart de situatie aan het begin van het geselecteerde kalenderjaar. Brede dateringsbanden bij archeologische punten geven de precisie van de bronnen weer. Europese en mediterrane benaderingen zijn samen met punten uit Azië, Afrika, Amerika en Oceanië gecontroleerd voor ca. 1200 v.Chr. en ca. 900 n.Chr.

[Pleiades](https://pleiades.stoa.org/help) biedt brongegevens en herbruikbare antieke plaatsrecords onder CC BY 3.0. [World Historical Gazetteer](https://www.whgazetteer.org/licenses/) bundelt historische namen met een licentie per dataset. Beide zijn geschikt voor latere uitbreiding van plaatsgegevens. Voor politieke grenzen vraagt iedere gegevensbron een eigen controle op datering, interpretatie en hergebruik.

## Verificatie

De modeltests controleren bronkoppelingen, modelantwoorden, kandidaten voor examens, verdeling van grote toetsen, het behoud van les- en leerdoelsleutels en het verschil tussen de lagen rond 1200 v.Chr., 810 en 900. De vrijgaveprocedure gebruikt de regressietests voor dagelijks leren, profielen, Scriptorium, de atlas en offlinegebruik.
