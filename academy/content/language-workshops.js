import { classicalUnit, greekGrammar, latinGrammar, passage } from './classical-model.js?v=14r3';
import { criteria } from './history-course-model.js?v=160';

const caesar = { author: 'Caesar', title: 'De bello Gallico', year: '1e eeuw v.Chr.',
  locator: '1.7.1, tekst en aantekeningen in Dickinson College Commentaries',
  url: 'https://dcc.dickinson.edu/caesar/book-1/chapter-1-7' };
const xenophon = { author: 'Xenophon', title: 'Anabasis', year: '4e eeuw v.Chr.',
  locator: '1.1.2, ed. E. C. Marchant (1904), Perseus',
  url: 'https://beta.perseus.tufts.edu/urn:cts:greekLit:tlg0032.tlg006.perseus-grc2:1.1/' };

export const latinArgument = classicalUnit('la','aci-in-een-veldtocht','syntaxis',
  'Accusativus cum infinitivo: perspectief en relatieve tijd',
  [
    'Een accusativus cum infinitivo vormt een mededeling die afhankelijk is van onder meer werkwoorden van zeggen, waarnemen of denken. Dīcit mīlitem venīre bevat dīcit als persoonsvorm. Mīlitem is accusatief en hoort als onderwerp bij venīre. De Nederlandse vertaling gebruikt een dat-zin. Hij zegt dat de soldaat komt.',
    'Zoek eerst het werkwoord dat de mededeling draagt. Wijs daarna de infinitief van de mededeling aan. Een tweede infinitief kan van de eerste afhangen. In mīlitem venīre posse is mīlitem het onderwerp van posse en venīre het complement bij posse. Zoek pas daarna eventuele lijdende voorwerpen bij de werkwoorden.',
    'Lees de infinitief relatief ten opzichte van het hoofdwerkwoord. Dīxit mīlitem venīre betekent dat de soldaat op het moment van zeggen kwam. Dīxit mīlitem vēnisse plaatst het komen eerder. Dīxit mīlitem ventūrum esse plaatst het later. Nederlands kan dezelfde verhouding op verschillende manieren uitdrukken.',
    'Controleer verwijzingen. Sē kan in een indirecte mededeling naar het onderwerp van het werkwoord van zeggen verwijzen. Bij Caesar staat eōs voor de Helvetiërs en is Caesar zelf de ontvanger van het bericht. De passage geeft toegang tot een gerapporteerd voornemen en tot Caesars manier om zijn snelle optreden te presenteren.',
  ].join('\n\n'),
  [['cōnor, cōnārī','proberen','Cōnārī is deponent en heeft een actieve betekenis.'],
   ['nūntiō, nūntiāre','berichten','Caesarī nūntiātum est'],
   ['iter, itineris','reis, route','iter facere'],
   ['mātūrō, mātūrāre','zich haasten','mātūrat ab urbe proficīscī']],
  [
    ['Geef het onderwerp bij cōnārī in de passage.', 'eōs', 'Eōs verwijst naar de Helvetiërs en staat als onderwerp van de infinitief in de accusatief.'],
    ['Welke Latijnse infinitief plaatst het komen vóór dīxit? Gebruik venīre als lemma.', 'vēnisse', 'De perfectuminfinitief toont voortijdigheid ten opzichte van dīxit.'],
    ['Welk zinsdeel is iter bij facere?', 'lijdend voorwerp', 'Iter is onzijdig en staat hier als accusatief bij facere.', ['direct object','voorwerp']],
  ],
  passage('Caesarī cum id nūntiātum esset, eōs per prōvinciam nostram iter facere cōnārī, mātūrat ab urbe proficīscī.',
    'Toen aan Caesar was gemeld dat zij probeerden door onze provincie te trekken, haastte hij zich om de stad te verlaten.',
    'De infinitiefzin eōs … cōnārī specificeert id. Caesarī is de ontvanger in de datief. Eōs is onderwerp van cōnārī en facere vult cōnārī aan. Proficīscī hangt af van mātūrat. Het historisch presens van mātūrat kan in een Nederlandse verleden tijd vertaald worden.',
    ['Wie meldt of ontvangt en wie probeert te trekken?', 'Welke infinitief introduceert de indirecte mededeling en welke infinitieven hangen elders van af?', 'Geeft je vertaling de verhouding tussen het bericht en het vertrek weer?'],
    true, ['Zodra Caesar vernam dat ze door onze provincie probeerden te trekken, maakte hij haast om uit de stad te vertrekken.']),
  [latinGrammar('§§ 577–585, Indirect Discourse en Tenses of the Infinitive','indirect-discourse'),caesar], 'rome-gouverneur');

export const greekArgument = classicalUnit('grc','participium-in-het-verhaal','syntaxis',
  'Participia, aspect en volgorde in een Grieks verhaal',
  [
    'Een participium combineert werkwoordelijke eigenschappen, zoals aspect en voorwerpen, met congruentie in geslacht, getal en naamval. In ὁ Κῦρος λαβών hoort het nominatief mannelijk enkelvoud bij Κῦρος. Het participium kan tegelijk een eigen lijdend voorwerp hebben.',
    'Presens- en aoristusparticipia presenteren een handeling op verschillende manieren. Het presens kan het verloop of een toestand tijdens de hoofdhandeling tonen. De aoristus presenteert een handeling als geheel. In veel verhalende contexten ligt die vóór de hoofdhandeling. Bij de vertaling bepaalt de context of je bijvoorbeeld met “nadat”, “door” of een losse nevenschikking werkt.',
    'Zoek de persoonsvorm, herken dan het naamwoord dat met het participium congrueert. Vergelijk λαβών met ἔχων. De tweede vorm kan een toestand aangeven die tijdens de reis voortduurt. De aoristus van λαμβάνω presenteert het meenemen als één handeling. In het Nederlands kan “met Tissaphernes bij zich” in deze context ook een begrijpelijke weergave zijn.',
    'Een genitivus absolutus heeft doorgaans een eigen onderwerp in de genitief. In τοῦ ἀγγέλου ἐλθόντος, οἱ φίλοι ἀπῆλθον is ἀγγέλου onderwerp van ἐλθόντος, terwijl οἱ φίλοι onderwerp van de persoonsvorm is. Je kunt vertalen met “Nadat de bode was gekomen, vertrokken de vrienden.”',
  ].join('\n\n'),
  [['λαμβάνω','nemen, meenemen','λαβών is aoristus actief; het stamelement verschilt van λαμβαν-.'],
   ['ἔχω','hebben, bij zich hebben','ἔχων is participium presens.'],
   ['ἀναβαίνω','omhooggaan, landinwaarts trekken','ἀναβαίνει kan historisch presens zijn.'],
   ['φίλος','vriend, bevriend','ὡς φίλον, als vriend.']],
  [
    ['Beschrijf de naamval van λαβών in de passage.', 'nominatief', 'De vorm hoort bij het onderwerp ὁ Κῦρος.', ['nominativus']],
    ['Geef het participium praesens actief, nominatief mannelijk enkelvoud van ἔχω. Gebruik het accent.', 'ἔχων',
      'ἔχων past bij een mannelijk enkelvoudig onderwerp zoals Κῦρος. De beginklinker draagt spiritus lenis en een acuut.', [], true],
    ['Welk zelfstandig naamwoord is onderwerp van ἐλθόντος in τοῦ ἀγγέλου ἐλθόντος;', 'ἀγγέλου',
      'Ἀγγέλου en ἐλθόντος staan beide in de genitief. Samen zijn ze een afzonderlijk zinsdeel.'],
  ],
  passage('ἀναβαίνει οὖν ὁ Κῦρος λαβὼν Τισσαφέρνην ὡς φίλον',
    'Kyros vertrok daarop landinwaarts, nadat hij Tissaphernes als vriend had meegenomen.',
    'Ἀναβαίνει is de persoonsvorm. Λαβών is een actief aoristusparticipium dat bij Κῦρος hoort. Τισσαφέρνην is het lijdend voorwerp van het participium. Ὡς φίλον geeft aan hoe Tissaphernes bij het meenemen werd voorgesteld. Historisch presens kun je in deze verhalende context met verleden tijd vertalen.',
    ['Maak duidelijk wie Tissaphernes meeneemt.', 'Ontleed λαβών tot werkwoord, aspect, naamval, getal en geslacht.', 'Leg uit wat verloren kan gaan als je het participium overal met één Nederlands voegwoord vertaalt.'],
    true, ['Kyros trok daarop het binnenland in en nam Tissaphernes als vriend mee.']),
  [greekGrammar('§ 39.13 en volgende, The Genitive Absolute','genitive-absolute'),xenophon], 'perzische-oorlogen');

export const frenchWorkshop = {
  id: 'fr-b2-accord-compte-rendu', level: 'B2', topic: 'studie',
  title: 'Een verslag nakijken: akkoord van het voltooid deelwoord',
  summary: 'Je meldt welke opmerkingen je gelezen, doorgestuurd of verwerkt hebt. Daarbij vergelijk je de plaats van het lijdend voorwerp, controleer je de verwijzing van een voornaamwoord en kies je een formulering die past bij een formeel verslag.',
  words: [['une remarque','een opmerking'],['une épreuve','een proef'],['relire','herlezen'],
    ['signaler','melden, signaleren'],['tenir compte de','rekening houden met'],['un compte rendu','een verslag']],
  source: { author: 'Académie française', title: 'Questions de langue', locator: 'Accord du participe passé',
    url: 'https://www.academie-francaise.fr/questions-de-langue' },
  grammar: {
    title: 'Eerst het lijdend voorwerp vinden',
    rule: [
      'Bij avoir krijgt het voltooid deelwoord volgens de gebruikelijke spelling in deze constructies een uitgang wanneer het lijdend voorwerp ervoor staat. Vergelijk J’ai relu les remarques en Les remarques que j’ai relues. In de tweede zin verwijst que naar les remarques. Die groep is vrouwelijk en meervoudig.',
      'Bepaal eerst of een aanvulling rechtstreeks bij het werkwoord hoort. In Les collègues à qui j’ai répondu staat à qui indirect bij répondre. Het deelwoord krijgt daardoor geen uitgang. Vergelijk Les collègues que j’ai prévenus. Prévenir quelqu’un krijgt een rechtstreeks voorwerp.',
      'Twee pronomen dicht bij elkaar kunnen verschillende functies hebben. In Je les lui ai envoyées kan les naar de vrouwelijke opmerkingen verwijzen en lui naar de ontvanger. Bij een werkwoord gevolgd door een infinitief gelden bijkomende regels. In les remarques que j’ai fait relire blijft fait voor de infinitief onveranderd.',
      'In een formele boodschap hoef je niet iedere constructie ingewikkeld te maken. Kies een duidelijk onderwerp en een heldere verwijzing. Les observations ont été prises en compte past in een verslag. J’en ai tenu compte is natuurlijk wanneer de lezer meteen weet waar en naar verwijst.',
    ].join('\n\n'),
    example: 'Les corrections que nous avons apportées figurent dans la dernière version.',
    translation: 'De correcties die we hebben aangebracht, staan in de laatste versie.',
    items: [
      ['Je vous transmets les remarques que j’ai ___ (relever).','relevées',[], 'Que staat vóór het deelwoord en verwijst als lijdend voorwerp naar les remarques.'],
      ['Voilà les personnes à qui nous avons ___ (répondre).','répondu',[], 'Répondre à quelqu’un krijgt hier een indirecte aanvulling. Het deelwoord wordt onveranderd gespeld.'],
      ['Les fautes que j’ai ___ (faire) corriger figurent en annexe.','fait',[], 'Fait gevolgd door een infinitief blijft hier onveranderd.'],
    ],
  },
  reading: {
    context: 'J’ai transmis vos observations hier. Les corrections que nous avons apportées concernent uniquement les tableaux. Nous n’avons pas modifié les données brutes.',
    question: 'Qu’est-ce qui a changé dans le dossier ?', answer: 'Seuls les tableaux ont été corrigés.',
    alternatives: ['Les données brutes ont été remplacées.','Les observations n’ont pas encore été envoyées.','Tout le dossier a été réécrit.'],
    feedback: 'Uniquement les tableaux bakent de wijziging af. De laatste zin bevestigt dat de brongegevens dezelfde bleven.',
  },
  scene: {
    line: 'Pourriez-vous préciser quelles remarques ont été prises en compte ?', meaning: 'Kunt u verduidelijken met welke opmerkingen rekening is gehouden?',
    prompt: 'Geef eerst mondeling antwoord. Schrijf daarna een formele antwoordzin met les remarques, que en het werkwoord traiter. Leg uit waarop de uitgang van het deelwoord berust.',
    answer: 'Les remarques que nous avons traitées portent sur la dernière partie du rapport.',
    translation: 'De opmerkingen die we hebben behandeld, gaan over het laatste deel van het verslag.',
    criteria: ['Que verwijst naar les remarques en staat als lijdend voorwerp vóór avoir.','Traitées is vrouwelijk meervoud.','Gebruik een begrijpelijke formulering in formeel register.'],
    rubric: criteria([
      ['Constructie','Het betrekkelijk voornaamwoord que is lijdend voorwerp van traiter.','Schrijf eerst nous avons traité les remarques en vorm er een betrekkelijke bijzin van.'],
      ['Spelling','De -es-uitgang volgt de referent les remarques.','Controleer geslacht en getal van de naamwoordgroep vóór de persoonsvorm.'],
      ['Register','Het antwoord beantwoordt de vraag met een duidelijke mededeling.','Vermeld welke opmerkingen behandeld zijn en waarop ze slaan.'],
    ]),
  },
};

export const italianWorkshop = {
  id: 'it-b1-imperfetto-racconto', level: 'B1', topic: 'afspraak',
  title: 'Vertellen wat er gebeurde: imperfetto en passato prossimo',
  summary: 'Je vertelt waarom een afspraak anders verliep dan verwacht. Je kiest wat je als achtergrond of gewoonte presenteert en wat je als afzonderlijke gebeurtenis afrondt. Daarbij let je ook op tijdsaanduidingen en toon.',
  words: [['mentre','terwijl'],['all’improvviso','plotseling'],['in anticipo','te vroeg, vooraf'],
    ['purtroppo','helaas'],['l’appuntamento','de afspraak'],['avvisare','verwittigen']],
  source: { author: 'Istituto della Enciclopedia Italiana', title: 'Imperfetto, indicativo', year: '2012',
    locator: 'La grammatica italiana, gebruik van het imperfetto',
    url: 'https://www.treccani.it/enciclopedia/indicativo-imperfetto_(La-grammatica-italiana)/' },
  grammar: {
    title: 'Verloop en afbakening',
    rule: [
      'In Mentre aspettavo l’autobus, mi ha chiamato Lucia loopt het wachten wanneer de oproep plaatsvindt. Aspettavo geeft achtergrond. Ha chiamato brengt een gebeurtenis in het verhaal. De vorm kies je volgens de relatie in het verhaal, niet volgens seconden of minuten.',
      'Een gewoonte die je van binnenuit beschrijft, gebruikt vaak het imperfetto. Quando studiavo a Bologna, prendevo spesso il treno. Een afgebakende periode kan met het passato prossimo. Ho studiato a Bologna per tre anni presenteert drie afgeronde jaren.',
      'Bij avere en essere controleer je de vorm die bij het werkwoord hoort. Ho aspettato l’autobus en è arrivata Lucia hebben uiteenlopende hulpwerkwoorden. Bij è arrivata stemt het deelwoord in deze zin overeen met het onderwerp Lucia. In een bericht kan Purtroppo ho perso il treno een gepaste, neutrale formulering zijn.',
      'Sommige taalgebruikers gebruiken in literaire of verhalende contexten bijzondere functies van het imperfetto. In deze oefening onderzoeken we de gewone tegenstelling tussen achtergrond en afgebakende gebeurtenis. Binnen eenzelfde context kunnen verschillende keuzes zinvol zijn wanneer ze de kijk op de gebeurtenis veranderen.',
    ].join('\n\n'),
    example: 'Mentre aspettavo in stazione, ci hanno avvisato del ritardo.',
    translation: 'Terwijl ik in het station wachtte, hebben ze ons verwittigd van de vertraging.',
    items: [
      ['Da piccoli, ogni estate ___ (andare, noi) al mare.','andavamo',[], 'De uitdrukking ogni estate presenteert een gewoonte zonder één afzonderlijke afloop.'],
      ['Ieri, mentre leggevo, Marta ___ (arrivare).','è arrivata',[], 'De aankomst is een gebeurtenis. Arrivare gebruikt essere en arrivata congrueert met Marta.'],
      ['Indica un periodo concluso: ___ (lavorare, io) a Milano per tre anni.','ho lavorato',[], 'De opdracht vraagt het werk als afgeronde periode te presenteren.'],
    ],
  },
  reading: {
    context: 'Alle nove ero già in stazione. Mentre aspettavo, ho ricevuto un messaggio: la riunione era stata spostata alle undici.',
    question: 'Che cosa è successo durante l’attesa ?', answer: 'È arrivato un messaggio con il nuovo orario.',
    alternatives: ['La riunione è cominciata alle nove.','Il treno è partito prima dell’arrivo del narratore.','Il narratore ha annullato la riunione.'],
    feedback: 'Ho ricevuto is de gebeurtenis tijdens het wachten. Het bericht bevat een nieuw tijdstip, elf uur.',
  },
  scene: {
    line: 'Come mai sei arrivato tardi?', meaning: 'Hoe komt het dat je laat aankwam?',
    prompt: 'Leg eerst mondeling uit waarom je te laat kwam. Schrijf daarna twee zinnen met een achtergrond in het imperfetto en een gebeurtenis in het passato prossimo. Licht één tijdskeuze toe.',
    answer: 'Aspettavo l’autobus quando ho saputo che era in ritardo. Allora ho preso un taxi.',
    translation: 'Ik wachtte op de bus toen ik hoorde dat hij vertraging had. Vervolgens heb ik een taxi genomen.',
    criteria: ['De achtergrond en gebeurtenis zijn herkenbaar.','Het hulpwerkwoord en deelwoord kloppen.','De volgorde en de reden voor de te late aankomst zijn begrijpelijk.'],
    rubric: criteria([
      ['Achtergrond','Gebruik een imperfetto voor een lopende handeling, toestand of gewoonte.','Leg uit wat al bezig was toen de gebeurtenis plaatsvond.'],
      ['Gebeurtenis','Gebruik het passato prossimo voor een afgebakende verandering.','Controleer persoonsvorm, hulpwerkwoord en overeenkomst.'],
      ['Samenhang','Verbind de twee delen met bijvoorbeeld quando, mentre of allora.','Lees je antwoord hardop en controleer de temporele relatie.'],
    ]),
  },
};
