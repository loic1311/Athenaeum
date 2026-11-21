const articoli = {
  author: 'Treccani', year: '2012', title: 'Articoli determinativi · La grammatica italiana',
  locator: 'Webpagina, Le forme dell’articolo determinativo',
  url: 'https://www.treccani.it/enciclopedia/articoli-determinativi_%28La-grammatica-italiana%29/',
};
const preposizioni = {
  author: 'Treccani', title: 'Preposizione', locator: 'Webpagina, Preposizioni articolate',
  url: 'https://www.treccani.it/enciclopedia/preposizione/',
};
const cortesia = {
  author: 'Treccani', year: '2014', title: 'Vorrei chiederle · Uso di cortesia',
  locator: 'Webpagina, Domande e risposte', url: 'https://www.treccani.it/magazine/lingua_italiana/domande_e_risposte/grammatica/grammatica_565.html',
};

export const italianTopics = [
  {
    id: 'it-gesprek-voorstellen', topic: 'gesprek', level: 'A1', title: 'Jezelf voorstellen en doorvragen',
    summary: 'Leer wie je bent, waar je vandaan komt en wat je studeert in het Italiaans zeggen. Stel dezelfde vragen aan iemand anders.',
    words: [
      ['buongiorno', 'goedendag'], ['piacere', 'aangenaam (bij een kennismaking)'], ['come ti chiami?', 'hoe heet je?'],
      ['mi chiamo', 'ik heet'], ['di dove sei?', 'waar kom je vandaan?'], ['sono di Gand', 'ik kom uit Gent'],
      ['abito a', 'ik woon in (bij een stad)'], ['studio storia', 'ik studeer geschiedenis'], ['lavoro a', 'ik werk in (bij een stad)'],
      ['il nome', 'de voornaam'], ['il cognome', 'de achternaam'], ['lo studente', 'de student', ['la studentessa']],
    ],
    grammar: {
      title: 'Essere in de tegenwoordige tijd', rule: 'Gebruik sono bij io, sei bij tu en è bij lui of lei. In een gewone zin kun je het onderwerp vaak weglaten.',
      example: 'Sono belga. E tu, di dove sei?', translation: 'Ik ben Belgisch. En jij, waar kom jij vandaan?',
      items: [['Io … di Gand. (essere)', 'sono'], ['Tu … di Roma? (essere)', 'sei'], ['Lei … di Milano. (essere)', 'è']],
    },
    scene: {
      prompt: 'Stel jezelf voor als Noor uit Gent en zeg dat je geschiedenis studeert.',
      line: 'Ciao, come ti chiami? Di dove sei?', meaning: 'Dag, hoe heet je? Waar kom je vandaan?',
      answer: 'Mi chiamo Noor, sono di Gand e studio storia.', translation: 'Ik heet Noor, ik kom uit Gent en ik studeer geschiedenis.',
      criteria: ['Noem je naam en je stad.', 'Zeg dat je geschiedenis studeert.'],
    },
  },
  {
    id: 'it-gesprek-dag', topic: 'gesprek', level: 'A1', title: 'Vertellen over je dag',
    summary: 'Gebruik dagelijkse werkwoorden en geef een volgorde aan. Oefen korte antwoorden die je in een gesprek meteen kunt gebruiken.',
    words: [
      ['oggi', 'vandaag'], ['di mattina', '’s morgens', ['la mattina']], ['nel pomeriggio', 'in de namiddag'], ['stasera', 'vanavond'],
      ['poi', 'daarna'], ['di solito', 'gewoonlijk'], ['fare colazione', 'ontbijten'], ['pranzare', 'lunchen'],
      ['tornare a casa', 'naar huis terugkeren'], ['studiare', 'studeren'], ['il tempo libero', 'de vrije tijd'], ['la lezione', 'de les'],
    ],
    grammar: {
      title: 'Werkwoorden op -are', rule: 'In de tegenwoordige tijd eindigen regelmatige werkwoorden op -are bij io op -o, bij tu op -i en bij lui of lei op -a.',
      example: 'Io studio. Tu lavori. Lei pranza.', translation: 'Ik studeer. Jij werkt. Zij luncht.',
      items: [['Io … al mattino. (studiare)', 'studio'], ['Tu … oggi? (lavorare)', 'lavori'], ['Lui … a casa. (pranzare)', 'pranza']],
    },
    scene: {
      prompt: 'Zeg dat je vandaag ’s morgens studeert en daarna thuis luncht.',
      line: 'Che cosa fai oggi?', meaning: 'Wat doe je vandaag?',
      answer: 'Oggi studio di mattina e poi pranzo a casa.', translation: 'Vandaag studeer ik ’s morgens en daarna lunch ik thuis.',
      criteria: ['Gebruik studio en pranzo.', 'Verbind de twee handelingen met poi.'],
    },
  },
  {
    id: 'it-cafe-bestellen', topic: 'cafe', level: 'A1', title: 'Een koffie of broodje bestellen', source: cortesia,
    summary: 'Herken wat op de kaart staat en bestel met vorrei. Gebruik per favore en luister naar een gewone vraag van de barista.',
    words: [
      ['il caffè', 'de koffie (in een Italiaanse bar meestal espresso)'], ['il cappuccino', 'de cappuccino'], ['il tè', 'de thee'],
      ['l’acqua naturale', 'het platte water'], ['l’acqua frizzante', 'het bruiswater'], ['la spremuta', 'het versgeperste sap'],
      ['il cornetto', 'het Italiaanse croissantachtige gebakje'], ['il panino', 'het broodje'], ['il conto', 'de rekening'],
      ['al banco', 'aan de bar'], ['da portare via', 'om mee te nemen'], ['per favore', 'alstublieft'],
    ],
    grammar: {
      title: 'Vorrei + bestelling', rule: 'Vorrei is een beleefde formulering van ik wil graag. Zet de bestelling achter vorrei. Met posso + infinitief vraag je of iets mag of kan.',
      example: 'Vorrei un caffè, per favore.', translation: 'Ik wil graag een koffie, alstublieft.',
      items: [['… un cornetto, per favore. (Ik wil graag)', 'Vorrei'], ['… pagare qui? (Kan ik)', 'Posso'], ['Vorrei … cappuccino. (een)', 'un']],
    },
    scene: {
      prompt: 'Bestel een cappuccino en een broodje om mee te nemen.', line: 'Buongiorno, che cosa prende?', meaning: 'Goedendag, wat neemt u?',
      answer: 'Vorrei un cappuccino e un panino da portare via, per favore.', translation: 'Ik wil graag een cappuccino en een broodje om mee te nemen, alstublieft.',
      criteria: ['Bestel een cappuccino en een broodje.', 'Zeg dat je de bestelling wilt meenemen.'],
    },
  },
  {
    id: 'it-cafe-kiezen', topic: 'cafe', level: 'A2', title: 'Iets op de kaart kiezen en afrekenen', source: articoli,
    summary: 'Gebruik woorden over gerechten en betaalwijzen. Vraag of je iets lichts of anders kunt bestellen.',
    words: [
      ['il menù', 'de menukaart', ['il menu']], ['il piatto del giorno', 'de dagschotel'], ['l’antipasto', 'het voorgerecht'],
      ['il dolce', 'het nagerecht'], ['gli ingredienti', 'de ingrediënten'], ['il contorno', 'het bijgerecht'], ['la salsa', 'de saus'],
      ['senza latte', 'zonder melk'], ['con la carta', 'met de kaart'], ['in contanti', 'contant'], ['separatamente', 'afzonderlijk'],
    ],
    grammar: {
      title: 'Il, lo, l’, gli en le', rule: 'Het lidwoord hangt af van geslacht, getal en beginklank. Gebruik bijvoorbeeld il conto, lo scontrino, l’acqua, gli ingredienti en le bevande.',
      example: 'Posso vedere il menù e gli ingredienti?', translation: 'Mag ik de menukaart en de ingrediënten zien?',
      items: [['Vorrei … conto, per favore. (de)', 'il'], ['… ingredienti sono indicati sul menù. (de)', 'Gli'], ['… bevande sono qui. (de)', 'Le']],
    },
    scene: {
      prompt: 'Vraag het menu en vraag of je met de kaart kunt betalen.', line: 'Desidera altro?', meaning: 'Wenst u nog iets?',
      answer: 'Posso vedere il menù? E posso pagare con la carta?', translation: 'Mag ik het menu zien? En kan ik met de kaart betalen?',
      criteria: ['Gebruik il menù.', 'Vraag naar betaling met kaart.'],
    },
  },
  {
    id: 'it-winkel-markt', topic: 'winkel', level: 'A1', title: 'Producten en hoeveelheden op de markt', source: preposizioni,
    summary: 'Leer fruit, groenten en basisproducten herkennen. Vraag om een bepaalde hoeveelheid en zeg voor hoeveel personen je koopt.',
    words: [
      ['le mele', 'de appels'], ['le arance', 'de sinaasappels'], ['i pomodori', 'de tomaten'], ['le patate', 'de aardappelen'],
      ['il pane', 'het brood'], ['il formaggio', 'de kaas'], ['le uova', 'de eieren'], ['il latte', 'de melk'],
      ['mezzo chilo', 'een halve kilo'], ['un etto', 'honderd gram'], ['una fetta', 'een sneetje'], ['una bottiglia', 'een fles'],
    ],
    grammar: {
      title: 'Di na een hoeveelheid', rule: 'Zet di tussen de hoeveelheid en het product. Gebruik het passende enkelvoud of meervoud van het product.',
      example: 'un chilo di pomodori · una bottiglia di latte', translation: 'een kilo tomaten · een fles melk',
      items: [['Un chilo … patate.', 'di'], ['Una bottiglia … latte.', 'di'], ['Due fette di … (brood).', 'pane']],
    },
    scene: {
      prompt: 'Vraag een halve kilo tomaten en een fles melk.',
      line: 'Buongiorno, che cosa le serve?', meaning: 'Goedendag, wat hebt u nodig?',
      answer: 'Vorrei mezzo chilo di pomodori e una bottiglia di latte.', translation: 'Ik wil graag een halve kilo tomaten en een fles melk.',
      criteria: ['Noem beide hoeveelheden en producten.', 'Gebruik di na elke hoeveelheid.'],
    },
  },
  {
    id: 'it-winkel-maat', topic: 'winkel', level: 'A2', title: 'Kleding passen en een maat vragen',
    summary: 'Vraag naar een andere maat of kleur. Leer hoe je kunt zeggen hoe een kledingstuk zit.',
    words: [
      ['la taglia', 'de kledingmaat'], ['il camerino', 'het pashokje'], ['la maglietta', 'het T-shirt'], ['i pantaloni', 'de broek'],
      ['le scarpe', 'de schoenen'], ['la giacca', 'het jasje'], ['il colore', 'de kleur'], ['lo scontrino', 'het kasticket'],
      ['il cambio', 'de omruiling'], ['troppo stretto', 'te strak (mannelijk)'], ['più larga', 'wijder (vrouwelijk)'],
    ],
    grammar: {
      title: 'Adjectieven bij enkelvoud en meervoud', rule: 'Veel adjectieven op -o hebben -a in het vrouwelijk enkelvoud, -i in het mannelijk meervoud en -e in het vrouwelijk meervoud.',
      example: 'La giacca è stretta. I pantaloni sono stretti.', translation: 'Het jasje zit strak. De broek zit strak.',
      items: [['La giacca è troppo … (stretto).', 'stretta'], ['I pantaloni sono … (lungo).', 'lunghi'], ['Le scarpe sono troppo … (stretto).', 'strette']],
    },
    scene: {
      prompt: 'Zeg dat het jasje te strak zit en vraag een grotere maat.',
      line: 'Come le sta la giacca?', meaning: 'Hoe zit het jasje?',
      answer: 'La giacca è troppo stretta. Avete una taglia più grande?', translation: 'Het jasje zit te strak. Hebt u een grotere maat?',
      criteria: ['Pas stretta aan bij la giacca.', 'Vraag om una taglia più grande.'],
    },
  },
  {
    id: 'it-onderweg-weg', topic: 'onderweg', level: 'A1', title: 'Vragen waar iets ligt', source: preposizioni,
    summary: 'Leer plekken in de stad herkennen en begrijp korte aanwijzingen. Oefen een vraag waarmee je kunt controleren of je goed loopt.',
    words: [
      ['la stazione', 'het station'], ['la fermata', 'de halte'], ['la piazza', 'het plein'], ['la strada', 'de straat'],
      ['l’incrocio', 'het kruispunt'], ['il semaforo', 'het verkeerslicht'], ['a sinistra', 'links'], ['a destra', 'rechts'],
      ['dritto', 'rechtdoor', ['diritto']], ['vicino a', 'dicht bij'], ['di fronte a', 'tegenover'], ['l’ingresso', 'de ingang'],
    ],
    grammar: {
      title: 'C’è en ci sono', rule: 'Gebruik c’è voor één ding en ci sono voor meerdere. Dov’è gebruik je als je naar de locatie van één specifieke plek vraagt.',
      example: 'C’è una fermata vicino alla stazione?', translation: 'Is er een halte dicht bij het station?',
      items: [['… un semaforo dopo l’incrocio? (is er)', 'C’è'], ['… due fermate in questa strada. (er zijn)', 'Ci sono'], ['… la stazione? (waar is)', 'Dov’è']],
    },
    scene: {
      prompt: 'Vraag waar het station ligt en of het dicht bij het plein is.',
      line: 'Mi dica, sta cercando qualcosa?', meaning: 'Zegt u maar, zoekt u iets?',
      answer: 'Dov’è la stazione? È vicina alla piazza?', translation: 'Waar is het station? Is het dicht bij het plein?',
      criteria: ['Vraag waar het station is.', 'Vraag of het dichtbij la piazza ligt.'],
    },
  },
  {
    id: 'it-onderweg-trein', topic: 'onderweg', level: 'A2', title: 'Tickets, sporen en aankomsttijden', source: preposizioni,
    summary: 'Vraag om een treinkaartje en controleer het spoor. Oefen hoe je een bestemming, uur en perron in dezelfde zin gebruikt.',
    words: [
      ['il biglietto', 'het ticket'], ['la biglietteria', 'het ticketloket'], ['l’andata', 'de heenreis'], ['il ritorno', 'de terugreis'],
      ['il binario', 'het spoor'], ['la partenza', 'het vertrek'], ['l’arrivo', 'de aankomst'], ['il ritardo', 'de vertraging'],
      ['la coincidenza', 'de aansluiting'], ['cambiare treno', 'overstappen op een andere trein'], ['il posto', 'de zitplaats'], ['la carrozza', 'het rijtuig'],
    ],
    grammar: {
      title: 'Per bij een bestemming en dal bij vertrek', rule: 'Gebruik per bij de bestemming, zoals il treno per Roma. Dal is de samenvoeging van da + il en noemt bijvoorbeeld het spoor vanwaar de trein vertrekt.',
      example: 'Il treno per Roma parte dal binario quattro.', translation: 'De trein naar Rome vertrekt van spoor vier.',
      items: [['Un biglietto … Roma, per favore. (naar)', 'per'], ['Il treno parte … binario quattro. (van het)', 'dal'], ['Il treno arriva … nove. (om negen)', 'alle']],
    },
    scene: {
      prompt: 'Vraag of de trein naar Rome om negen uur van spoor vier vertrekt.',
      line: 'Quale treno sta cercando?', meaning: 'Welke trein zoekt u?',
      answer: 'Il treno per Roma parte alle nove dal binario quattro?', translation: 'Vertrekt de trein naar Rome om negen uur van spoor vier?',
      criteria: ['Noem Rome als bestemming.', 'Vraag naar zowel het uur als het spoor.'],
    },
  },
  {
    id: 'it-afspraak-regelen', topic: 'afspraak', level: 'A2', title: 'Een uur voorstellen en een afspraak verplaatsen', source: preposizioni,
    summary: 'Spreek een concreet tijdstip af. Reageer als je later beschikbaar bent en stel een alternatief voor.',
    words: [
      ['l’appuntamento', 'de afspraak'], ['l’orario', 'het uurrooster of tijdschema'], ['disponibile', 'beschikbaar'], ['in ritardo', 'te laat'],
      ['in anticipo', 'te vroeg (voor het afgesproken tijdstip)'], ['mezzogiorno', 'middaguur'], ['domani', 'morgen'], ['dopodomani', 'overmorgen'],
      ['spostare', 'verplaatsen'], ['confermare', 'bevestigen'], ['a che ora?', 'hoe laat?'], ['ti va?', 'komt het je uit?'],
    ],
    grammar: {
      title: 'Alle bij de uren, all’una bij één uur', rule: 'Voor een tijdstip gebruik je alle bij uren in het meervoud. Eén uur is all’una en middag is a mezzogiorno.',
      example: 'Ci vediamo alle tre? Oppure all’una?', translation: 'Zien we elkaar om drie uur? Of om één uur?',
      items: [['Ci vediamo … cinque? (om vijf uur)', 'alle'], ['Ci vediamo …? (om één uur)', 'all’una'], ['Ci vediamo … mezzogiorno? (om twaalf uur ’s middags)', 'a']],
    },
    scene: {
      prompt: 'Zeg dat drie uur niet lukt en stel morgen om vijf uur voor.',
      line: 'Ci vediamo oggi alle tre?', meaning: 'Zien we elkaar vandaag om drie uur?',
      answer: 'Alle tre non posso. Ti va domani alle cinque?', translation: 'Om drie uur kan ik niet. Komt morgen om vijf uur je uit?',
      criteria: ['Zeg dat je om drie uur niet kunt.', 'Stel morgen om vijf uur voor.'],
    },
  },
  {
    id: 'it-afspraak-verleden', topic: 'afspraak', level: 'B1', title: 'Vertellen waarom iets anders liep',
    summary: 'Vertel in korte zinnen wat er gebeurd is. Gebruik tijdswoorden om gebeurtenissen in een logische volgorde te zetten.',
    words: [
      ['ieri', 'gisteren'], ['stamattina', 'vanmorgen'], ['all’inizio', 'aan het begin'], ['alla fine', 'uiteindelijk'],
      ['perdere il treno', 'de trein missen'], ['arrivare tardi', 'te laat aankomen'], ['dover aspettare', 'moeten wachten'], ['mandare un messaggio', 'een bericht sturen'],
      ['avvisare', 'laten weten (verwittigen)'], ['succedere', 'gebeuren'], ['il motivo', 'de reden'],
    ],
    grammar: {
      title: 'Passato prossimo met avere of essere', rule: 'Gebruik ho perso en ho mandato met avere. Met arrivare gebruik je essere. Het voltooid deelwoord van arrivare past zich dan aan het onderwerp aan.',
      example: 'Ho perso il treno e sono arrivata tardi.', translation: 'Ik heb de trein gemist en ben te laat aangekomen.',
      items: [['Ieri ho … il treno. (perdere)', 'perso'], ['Marta è … in ritardo. (arrivare)', 'arrivata'], ['Marco è … in ritardo. (arrivare)', 'arrivato']],
    },
    scene: {
      prompt: 'Leg uit dat je te laat aankwam omdat je de trein gemist had. Vertel dat je een bericht stuurde.',
      line: 'Come mai sei arrivato così tardi?', meaning: 'Hoe komt het dat je zo laat bent aangekomen?',
      answer: 'Ho perso il treno, quindi sono arrivato tardi. Ti ho mandato un messaggio.', translation: 'Ik heb de trein gemist en kwam daardoor te laat aan. Ik heb je een bericht gestuurd.',
      criteria: ['Gebruik ho perso en sono arrivato of arrivata.', 'Vermeld het bericht.'],
    },
  },
  {
    id: 'it-gesprek-cortesia', topic: 'gesprek', level: 'B1', title: 'Beleefd om hulp of uitleg vragen', source: cortesia,
    summary: 'Gebruik beleefde vragen in de universiteit, op het werk of op reis. Leer hoe je aangeeft dat je iets niet begrepen hebt.',
    words: [
      ['scusi', 'excuseer (beleefd)'], ['avrei bisogno di', 'ik zou behoefte hebben aan'], ['potrebbe ripetere?', 'zou u dat kunnen herhalen?'],
      ['più lentamente', 'trager'], ['un chiarimento', 'een verduidelijking'], ['un esempio', 'een voorbeeld'],
      ['ho capito', 'ik heb het begrepen'], ['la spiegazione', 'de uitleg'], ['il passaggio', 'de stap of passage'],
      ['al riguardo', 'daarover'], ['la ringrazio', 'ik dank u'],
    ],
    grammar: {
      title: 'Potrebbe, vorrei en avrei', rule: 'Gebruik potrebbe + infinitief als je beleefd vraagt of iemand iets kan doen. Met vorrei of avrei bisogno di maak je duidelijk wat jij wilt of nodig hebt.',
      example: 'Potrebbe spiegare questo passaggio?', translation: 'Zou u deze stap kunnen uitleggen?',
      items: [['… ripetere più lentamente? (Zou u kunnen)', 'Potrebbe'], ['… un chiarimento, per favore. (Ik wil graag)', 'Vorrei'], ['… bisogno di un esempio. (Ik zou)', 'Avrei']],
    },
    scene: {
      prompt: 'Vraag beleefd of de docent de uitleg trager kan herhalen en een voorbeeld kan geven.',
      line: 'È tutto chiaro?', meaning: 'Is alles duidelijk?',
      answer: 'Potrebbe ripetere più lentamente e fare un esempio, per favore?', translation: 'Zou u het trager kunnen herhalen en een voorbeeld kunnen geven, alstublieft?',
      criteria: ['Vraag beleefd om te herhalen.', 'Vraag expliciet om een voorbeeld.'],
    },
  },
];
