ATHENAEUM V1.2.0 — FINAL LEARNING PLATFORM
==========================================

Hoofdapps
- Scriptorium V8.1: onderzoek, corpus, authentieke bronnen, theorie, training,
  H5P, AI-docent en AI-transfervragen.
- Paideia V1.2.0: dagelijks leren, universiteitsexamens, knowledge packs,
  leergeschiedenis, Telegram en AI-docent.

Navigatie
- Iedere app heeft de terugknop boven het eigen logo.
- Telefoon krijgt dezelfde terugactie in de mobiele topbar.

AI
- Geen chatbot.
- Feedback en nieuwe vragen.
- Server-side contextcompactie voorkomt onnodige Groq-TPM-fouten.
- Scriptorium deep feedback gebruikt 120B met gecontroleerde 20B fallback.
- Quota zijn per Supabase-gebruiker.

Concurrent gebruik
- Auth/RLS scheidt gebruikers.
- lokale opslag is profielgebonden.
- Scriptorium-sync is per werk incrementeel.
- automatische syncstarts hebben jitter.
- ontworpen voor minstens vier gelijktijdige gebruikers zonder gedeelde
  browserstate of volledige corpusdump.

H5P
- optionele aanvullende interactieve laag;
- native training blijft de kern voor universitaire open redenering;
- embeds worden pas geladen wanneer de gebruiker ze opent.
