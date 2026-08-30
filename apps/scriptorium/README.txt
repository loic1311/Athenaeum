SCRIPTORIUM V7.6 — PRODUCTIE
=============================

Scriptorium draait als module binnen Athenaeum.

Belangrijkste onderdelen:
- Corpus en corpusanalyse
- Primaire bronnen
- Zoek- en ontdekfuncties
- Theorie / leeratelier
- Training + H5P
- AI-docent voor feedback
- Gedeelde bibliotheekmetadata
- Incrementele Supabase-sync per werk

Technisch:
- De historische V6/V7 JavaScriptlagen zijn in productie samengevoegd in
  één leesbaar bestand: scriptorium.app.js.
- De CSS staat in scriptorium.css.
- Oude versienamen en ongebruikte iconen zijn niet meer als losse productie-
  bestanden aanwezig.
- De service worker precachet alleen de echte app-shell; grote corpusdata en
  documentatie worden pas opgehaald wanneer nodig.

PDF's zelf blijven standaard lokaal. Gedeelde bibliotheek deelt metadata,
niet automatisch de PDF-bytes.
