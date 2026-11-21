// Examples and applications use the content and references of the linked lesson.
export const workedExamples = {
  'egezische-bronstijd': {
    item: 'wagens', prompt: 'Een tablet uit Knossos registreert wagens. Wat kun je eruit afleiden?',
    answer: 'Het paleis hield wagens administratief bij.',
    explanation: 'Kijk wat er op het tablet staat. Je ziet een teken voor een wagen en een registratie. Als je wilt weten waar die wagens werden ingezet, heb je andere gegevens nodig.',
  },
  'polis-en-chora': {
    item: 'asty-chora', prompt: 'Een boerderij levert graan aan de stedelijke kern. Welk begrip past bij de omgeving van die boerderij?',
    answer: 'Chora.',
    explanation: 'Een polis omvatte ook omliggend territorium. De stedelijke kern heet asty. We kijken hier naar de plek waar de boerderij ligt.',
  },
  'aphrodisias-hadrianus': {
    item: 'keizerbrief', prompt: 'Hadrianus staat een geldbijdrage in plaats van gladiatorenspelen toe. Welk besluit kun je uit de brief halen?',
    answer: 'De stad mocht een geldbijdrage vragen in plaats van de spelen.',
    explanation: 'Het werkwoord ‘toestaan’ geeft de ruimte aan die de stad kreeg. Om te bepalen hoe vaak de stad daarvan gebruikmaakte, zou je bijvoorbeeld rekeningen of andere lokale stukken zoeken.',
  },
  'rome-ontstaan': {
    item: 'vogels', prompt: 'Remus ziet als eerste gieren, Romulus ziet er meer. Waarom kan elk de uitkomst in zijn voordeel uitleggen?',
    answer: 'Remus kan wijzen op het eerste teken. Romulus kan wijzen op het grotere aantal.',
    explanation: 'Haal de twee criteria uit het verhaal. De volgorde en het aantal beantwoorden verschillende vragen. Daardoor krijgen beide partijen een argument.',
  },
  'rome-dieren': {
    item: 'cilicie', prompt: 'Cicero schrijft dat jagers de vangst opvolgen. Welke stap wordt daarmee concreet?',
    answer: 'De zoektocht naar dieren en de organisatie van de vangst.',
    explanation: 'Noem eerst de activiteit die de brief vermeldt. Voor latere stappen, zoals levering of inzet bij het spektakel, zoek je een ontvangstbewijs, verslag of andere onafhankelijke aanwijzing.',
  },
  'mesopotamie-stad-en-schrift': {
    item: 'norm-praktijk', prompt: 'Je leest een regel op de stèle van Hammurabi. Hoe onderzoek je of een rechter die toepaste?',
    answer: 'Zoek een bewaard verslag of document uit een rechtszaak en vergelijk de beslissing met de regel.',
    explanation: 'De stèle vertelt welke norm werd gepresenteerd. Een procesdocument geeft zicht op een concrete zaak, met een eigen datering en plaats die je mee moet wegen.',
  },
  'drukpers-en-reformaties': {
    item: 'causaliteit', prompt: 'Een pamflet verschijnt in verschillende steden. Wat kun je dan onderzoeken?',
    answer: 'Of het pamflet plaatselijk werd verspreid, gelezen en besproken, en wie het steunde.',
    explanation: 'De drukpers maakte verspreiding mogelijk. Om te verklaren hoe lezers reageerden, zoek je ook aanwijzingen over hun contacten en lokale instellingen.',
  },
  'kaart-schaal-en-projectie': {
    item: 'schaal', prompt: 'Op een kaart van 1:25.000 liggen twee punten 2 cm uit elkaar. Hoe ver is dat op het terrein?',
    answer: '500 meter.',
    explanation: 'Vermenigvuldig 2 cm met 25.000 voor 50.000 cm. Deel daarna door 100 om van centimeter naar meter te gaan.',
  },
  'gemiddelde-mediaan-procenten': {
    item: 'mediaan', prompt: 'Vijf reistijden zijn 9, 13, 18, 22 en 60 minuten. Welke tijd is de mediaan?',
    answer: '18 minuten.',
    explanation: 'Zet de waarden op volgorde en neem de middelste. Er liggen twee waarden onder en twee boven 18. Voor het gemiddelde zou je alle vijf waarden optellen en delen door vijf.',
  },
  'saluti-alimentari': {
    item: 'bestellen', prompt: 'Vorrei due panini, per favore.', answer: 'Ik wil graag twee broodjes, alstublieft.',
    explanation: 'Zet na vorrei wat je wilt bestellen. Due panini is je bestelling. Met per favore sluit je de vraag beleefd af.',
    language: 'it',
  },
  'bonjour-boutique': {
    item: 'bestelling', prompt: 'Je voudrais une baguette.', answer: 'Ik wil graag een stokbrood.',
    explanation: 'Je voudrais is een beleefde inleiding. Daarna volgt je bestelling. Dezelfde inleiding werkt ook met bijvoorbeeld un café.',
    language: 'fr',
  },
};

const timeline = (text, parts, explanation) => ({
  kind: 'order', text, parts, answer: parts.join(' · '), feedback: explanation, tip: 'Bepaal eerst wat er aan het begin gebeurt en zoek daarna het laatste moment.',
});

const choice = (text, answer, alternatives, feedback, tip) => ({
  kind: 'choice', text, answer, options: [answer, ...alternatives], feedback, tip,
});

export const applications = {
  'egezische-bronstijd/wagens': [
    choice('Je krijgt alleen het tablet uit Knossos met het wagenideogram te zien. Welke conclusie steunt daar rechtstreeks op?',
      'Een administratie registreerde wagens.',
      ['De tekst geeft de route die de wagens reden.', 'De tekst noemt het aantal wagens op elk slagveld.'],
      'Het ideogram wijst op wat werd geregistreerd. De eventuele inzet of route staat buiten wat deze registratie op zichzelf kan aantonen.',
      'Vraag welk soort document dit is en wat zo’n document vastlegt.'),
  ],
  'polis-en-chora/asty-chora': [
    choice('Een wandelaar verlaat de bebouwde kern en loopt naar de akkers op stedelijk grondgebied. Welke overgang beschrijf je in de termen van deze les?',
      'Van asty naar chora.', ['Van chora naar asty.', 'Van polis naar een gebied buiten haar territorium.'],
      'Asty duidt de stedelijke kern aan. De akkers in dit voorbeeld liggen in de chora van dezelfde polis.',
      'Bepaal eerst welke term de bebouwde kern aanduidt.'),
  ],
  'atheense-democratie/lot-en-keuze': [
    choice('Een overzicht maakt onderscheid tussen Atheense functies met loting en functies met verkiezing. Waar plaats je de strategoi?',
      'Bij de verkozen functies.', ['Bij de verloot toegewezen functies.', 'Bij de erfelijke functies.'],
      'Strategoi werden verkozen. Hun militaire verantwoordelijkheid is een bruikbaar aanknopingspunt bij het onderscheid met veel gelote ambten.',
      'Denk aan de functies met militaire verantwoordelijkheid.'),
  ],
  'aphrodisias-hadrianus/marmer': [
    timeline('Zet de drie fasen van de brieven van Hadrianus in volgorde.',
      ['Brieven worden geschreven', 'Brieven worden in marmer gekapt', 'Het marmer wordt als vloersteen hergebruikt'],
      'Maak onderscheid tussen de oorspronkelijke brief, de inscriptie en de latere bouwcontext. De vondstcontext geeft zo vooral informatie over het laatste gebruik van de steen.'),
  ],
  'rome-ontstaan/vogels': [
    timeline('Orden de momenten waarop de twee kampen het voorteken krijgen en uitleggen.',
      ['Remus ziet zes gieren', 'Romulus ziet twaalf gieren', 'De kampen leggen de voortekens verschillend uit'],
      'Bij Livius volgt na het eerste teken een tweede teken met een groter aantal. Dat geeft elk kamp een andere reden om voorrang op te eisen.'),
  ],
  'rome-punische-oorlogen/saguntum': [
    timeline('Zet deze momenten uit de aanloop naar de Tweede Punische Oorlog in volgorde.',
      ['Rome neemt Sardinië over', 'Hannibal belegert Saguntum', 'Hannibal steekt de Ebro over'],
      'Polybius behandelt Sardinië als eerdere oorzaak van vijandigheid. De belegering en de oversteek zijn concrete beginhandelingen in de volgende oorlog.'),
  ],
  'rome-dieren/cilicie': [
    choice('Je onderzoekt of dieren na een verzoek werkelijk aankwamen. Welk nieuw stuk zou die stap het directst aantonen?',
      'Een ontvangstbericht waarin de geleverde dieren en de bestemming staan.',
      ['Een tweede brief met hetzelfde verzoek.', 'Een algemene voorstelling van jagers, zonder plaats of datum.'],
      'Een ontvangstbericht documenteert aankomst op een bestemming. Een verzoek geeft zicht op de vraag naar dieren, en een afbeelding geeft zicht op hoe de vangst werd voorgesteld.',
      'Zoek een bron die past bij de stap die je nog moet aantonen.'),
  ],
  'rome-tetrarchie/naleving': [
    choice('Je wilt weten of graan na het prijzenedict binnen de opgelegde grens werd verkocht. Wat vergelijk je met het edict?',
      'Gedateerde stukken met prijzen uit concrete graantransacties.',
      ['Een tweede kopie van het edict.', 'Een beeld van de vier vorsten.'],
      'Transacties tonen welke prijs in een concreet geval werd gevraagd of betaald. Vergelijk waar mogelijk dezelfde goederen, maten, periode en regio.',
      'Denk aan documenten waarin een prijs uit de praktijk staat.'),
  ],
  'mesopotamie-stad-en-schrift/norm-praktijk': [
    choice('Een leerling gebruikt de stèle om te besluiten dat dezelfde straf in elke stad werd toegepast. Welke controle is het meest geschikt?',
      'Vergelijk gedocumenteerde uitspraken uit meer dan één plaats.',
      ['Tel hoe vaak de straf op dezelfde stèle voorkomt.', 'Meet hoe hoog het monument is.'],
      'Uitspraken uit verschillende plaatsen laten toe de toepassing te vergelijken. Controleer bij elke zaak of ze voldoende overeenkomt met de situatie in de regel.',
      'Zoek bewijs voor wat rechters in een concreet geval deden.'),
  ],
  'zwarte-dood-en-arbeid/arbeid': [
    choice('Stel dat na een epidemie minder arbeiders beschikbaar zijn en het werk even talrijk blijft. Welke verwachting volgt uit die combinatie?',
      'Werkgevers kunnen meer moeite hebben om personeel te vinden, waardoor arbeiders sterker kunnen onderhandelen.',
      ['Er komen meer arbeiders beschikbaar per openstaande werkplek.', 'De lonen evolueren in elke regio op precies dezelfde manier.'],
      'Het aanbod aan arbeid daalt in dit voorbeeld terwijl de vraag gelijk blijft. Plaatselijke regels, machtsverhoudingen en rechten bepalen hoeveel ruimte arbeiders in de praktijk krijgen.',
      'Vergelijk het aantal beschikbare werknemers met de hoeveelheid werk.'),
  ],
  'drukpers-en-reformaties/causaliteit': [
    choice('Een pamflet verschijnt in veel exemplaren. Welke conclusie is met dat gegeven het best te verdedigen?',
      'Er waren meer exemplaren om te verspreiden.',
      ['Alle lezers namen de inhoud over.', 'De lokale bestuurders beschermden de verspreiders.'],
      'Het aantal exemplaren zegt iets over de mogelijke verspreiding. Om instemming of bescherming te onderzoeken kun je bijvoorbeeld verslagen van debatten of besluiten gebruiken.',
      'Vraag voor elk antwoord welk bewijs je werkelijk hebt.'),
  ],
  'koude-oorlog-en-dekolonisatie/bandung': [
    timeline('Orden deze momenten van vroeger naar later.',
      ['Indonesische onafhankelijkheid uitgeroepen', 'Conferentie van Bandung', 'Algerijnse onafhankelijkheid'],
      'De Indonesische onafhankelijkheidsverklaring dateert van 1945, de conferentie van Bandung van 1955 en de Algerijnse onafhankelijkheid van 1962.'),
  ],
  'kaart-schaal-en-projectie/schaal': [
    { kind: 'fill', text: 'Op een kaart van 1:25.000 meet een traject 3 cm. Hoeveel meter is dat op het terrein?',
      answer: '750', accepted: ['750 m', '750 meter'],
      tip: 'Bereken eerst hoeveel meter 1 cm op de kaart voorstelt.',
      feedback: 'Eén centimeter op de kaart is 250 meter op het terrein. Vermenigvuldig 250 met 3.' },
  ],
  'gemiddelde-mediaan-procenten/procentpunt': [
    { kind: 'fill', text: 'Het aandeel stijgt van 20% naar 25%. Hoeveel procentpunten bedraagt de stijging?',
      answer: '5', accepted: ['5 procentpunten', '5 procentpunt'],
      tip: 'Trek het oorspronkelijke percentage van het nieuwe percentage af.',
      feedback: '25 − 20 = 5 procentpunten. Als je de relatieve stijging zoekt, deel je 5 door 20. Dat geeft 25%.' },
  ],
  'digitale-broncontrole/onafhankelijk': [
    choice('Vier kranten verwijzen voor een cijfer naar hetzelfde persbericht. Welke volgende stap geeft meer zekerheid?',
      'Zoek de oorspronkelijke gegevens en controleer of een andere bron ze onafhankelijk bevestigt.',
      ['Tel elk artikel als een afzonderlijke meting.', 'Neem het cijfer over uit de krant met de kortste kop.'],
      'Alle artikels kunnen teruggaan op dezelfde berekening. De gegevens en hun methode helpen die berekening beoordelen. Een onafhankelijke meting geeft eventueel extra steun.',
      'Volg de verwijzingen tot de plaats waar het cijfer vandaan komt.'),
  ],
  'k2-relatieve-datering/doorsnijding': [
    timeline('Je ziet twee afzettingslagen die nog in hun oorspronkelijke positie liggen. Een breuk doorsnijdt beide. Orden van oud naar jong.',
      ['Onderste laag afgezet', 'Bovenste laag afgezet', 'Breuk ontstaan'],
      'In dit voorbeeld is de reeks onomgekeerd, waardoor de onderste laag ouder is. De breuk doorsnijdt beide lagen en ontstond dus later.'),
  ],
};
