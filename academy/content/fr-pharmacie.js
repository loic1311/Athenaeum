const verrerie = {
  author: 'Université Claude Bernard Lyon 1', title: 'Analyse · définitions',
  locator: 'Diapositive « Avec quel type de matériel ? »', url: 'https://clarolineconnect.univ-lyon1.fr/clarolinepdfplayerbundle/pdf/2028295',
};
const measuringCup = {
  author: 'Mijnwoordenboek.nl', title: 'Nederlands–Frans woordenboek', locator: 'Weblemma « maatbeker »',
  url: 'https://www.mijnwoordenboek.nl/vertaal/NL/FR/maatbeker',
};
const appareils = {
  author: 'Amelle Mermouri', year: '2023', title: 'La pédagogie par simulation dans le cadre de la formation initiale des pharmaciens industriels',
  locator: 'p. 76, tableau des équipements', url: 'https://bibnum.univ-lyon1.fr/nuxeo/nxfile/default/dd5487b2-78a2-4c56-ba2d-77778da18b39/file%3Acontent/THph_2023LYO1P012.pdf',
};
const practical = {
  author: 'Pascal Furrer en Julie Veriepe · Université de Genève', year: '2026',
  title: 'Sciences pharmaceutiques · travaux pratiques', locator: 'Webpagina, Descriptif en Attestation',
  url: 'https://pgc.unige.ch/main/teachings/details/2026-12H901',
};
const safety = {
  author: 'INRS', title: 'Laboratoires de chimie',
  locator: 'Webpagina, Documents de référence et sorbonnes', url: 'https://www.inrs.fr/actualites/laboratoire-chimie-guide-conception.html',
};
const galenics = {
  author: 'Université libre de Bruxelles', title: 'Technologie pharmaceutique · Pharmacie galénique et magistrale',
  locator: 'Webpagina, Contenu du cours', url: 'https://www.ulb.be/fr/programme/phar-j4040',
};
const internship = {
  author: 'Faculté de Pharmacie · Université libre de Bruxelles', title: 'Les études',
  locator: 'Webpagina, Formation de base', url: 'https://pharmacie.ulb.be/version-francaise/les-etudes',
};
const library = {
  author: 'Bibliothèques universitaires · Lyon 1', title: 'Les services de la BU Santé',
  locator: 'Webpagina, Emprunter, Prolonger un prêt et Réservations',
  url: 'https://portaildoc.univ-lyon1.fr/etudiant-a-lifmk-dv/les-services-de-la-bu-sante',
};
const restaurant = {
  author: 'CCI Paris Île-de-France', title: 'Diplôme de français du tourisme, de l’hôtellerie et de la restauration · Listes de tâches',
  locator: 'p. 3, Restauration', url: 'https://www.lefrancaisdesaffaires.fr/wp-content/uploads/2024/10/dfp-thr-liste-taches-professionnelles.pdf',
};
const partitif = {
  author: 'Académie française', title: 'Questions de langue', locator: 'Webpagina, Article partitif',
  url: 'https://www.academie-francaise.fr/questions-de-langue',
};

export const frenchTopics = [
  {
    id: 'fr-labo-verrerie', topic: 'labo', level: 'A1', title: 'Glaswerk op de labotafel', source: [verrerie, measuringCup],
    summary: 'Leer het glaswerk bij naam kennen. Oefen hoe je aan je practicumbegeleider vraagt waar iets ligt of welk stuk je nodig hebt. In het dagelijks leven heet een maatbeker un verre doseur. De maatcilinder uit het labo heet une éprouvette graduée.',
    words: [
      ['un bécher', 'een bekerglas'], ['un erlenmeyer', 'een erlenmeyer (kolf met smalle hals)'], ['une éprouvette graduée', 'een maatcilinder'],
      ['une fiole jaugée', 'een maatkolf'], ['une pipette graduée', 'een gegradueerde pipet'], ['une pipette jaugée', 'een volpipet'],
      ['une burette', 'een buret'], ['un tube à essai', 'een reageerbuis', ['un tube à essais']], ['un entonnoir', 'een trechter'],
      ['un verre de montre', 'een horlogeglas'], ['un bouchon', 'een stop'], ['un porte-tubes', 'een reageerbuisrekje', ['un portoir à tubes']],
      ['un verre doseur', 'een maatbeker', ['un verre gradué']],
    ],
    grammar: {
      title: 'Un, une en des', rule: 'Gebruik un bij een mannelijk naamwoord en une bij een vrouwelijk naamwoord. In het meervoud gebruik je des, ongeacht het geslacht.',
      example: 'un bécher · une burette · des tubes à essai',
      translation: 'een bekerglas · een buret · reageerbuizen',
      items: [['Il me faut … bécher.', 'un'], ['Où est-ce que je peux trouver … fiole jaugée ?', 'une'], ['Sur la paillasse, il y a … tubes à essai.', 'des']],
    },
    scene: {
      prompt: 'Vraag waar je een maatcilinder kunt vinden.', line: 'De quel matériel avez-vous besoin ?', meaning: 'Welk materiaal hebt u nodig?',
      answer: 'Où puis-je trouver une éprouvette graduée ?', translation: 'Waar kan ik een maatcilinder vinden?',
      criteria: ['Vraag waar je het stuk vindt.', 'Gebruik une éprouvette graduée.'],
    },
  },
  {
    id: 'fr-labo-pesee', topic: 'labo', level: 'A2', title: 'Wegen, meten en etiketteren', source: verrerie,
    summary: 'Leer het materiaal om een massa of volume te noteren. Gebruik exacte namen voor de balans, het weegbakje en het etiket.',
    words: [
      ['une balance de précision', 'een precisieweegschaal'], ['une coupelle de pesée', 'een weegbakje'], ['une spatule', 'een spatel'],
      ['une tare', 'een tarra'], ['une masse', 'een massa'], ['un volume', 'een volume'], ['une graduation', 'een maatstreep'],
      ['un trait de jauge', 'een ijkstreep op een maatkolf'], ['un flacon', 'een klein flesje'], ['une étiquette', 'een etiket'],
      ['un marqueur', 'een markeerstift'], ['un échantillon', 'een monster (staal)'],
    ],
    grammar: {
      title: 'De na een maat', rule: 'Na een maat staat meestal de, of d’ voor een klinker of stomme h. Het lidwoord van de stof bepaalt deze keuze niet.',
      example: 'dix millilitres d’eau · deux grammes de poudre', translation: 'tien milliliter water · twee gram poeder',
      items: [['Vul in met de of d’. Deux grammes … poudre.', 'de'], ['Vul in met de of d’. Dix millilitres … eau.', 'd’'], ['Vul in met de of d’. Un flacon … solution.', 'de']],
    },
    scene: {
      prompt: 'Vraag of je het monster op de precisieweegschaal mag wegen.', line: 'Qu’est-ce que vous voulez faire ?', meaning: 'Wat wilt u doen?',
      answer: 'Est-ce que je peux peser cet échantillon sur la balance de précision ?', translation: 'Mag ik dit monster op de precisieweegschaal wegen?',
      criteria: ['Vraag toestemming.', 'Gebruik peser en balance de précision.'],
    },
  },
  {
    id: 'fr-labo-securite', topic: 'labo', level: 'A2', title: 'Bescherming en werkplek', source: safety,
    summary: 'Herken de woorden die op het lokaalplan of in instructies staan. Oefen om te vragen waar materiaal en afvalbakken zich bevinden.',
    words: [
      ['une blouse de laboratoire', 'een labojas'], ['des lunettes de protection', 'een veiligheidsbril'], ['des gants de protection', 'beschermende handschoenen'],
      ['une sorbonne', 'een zuurkast', ['une hotte chimique']], ['une paillasse', 'een labowerkbank'], ['un lave-œil', 'een oogspoeltoestel', ['un lave-oeil']],
      ['une douche de sécurité', 'een nooddouche'], ['un pictogramme de danger', 'een gevarenpictogram'], ['un collecteur de déchets', 'een afvalcontainer'],
      ['une consigne', 'een instructie'], ['une fiche de données de sécurité', 'een veiligheidsinformatieblad'], ['une trousse de secours', 'een EHBO-kit'],
    ],
    grammar: {
      title: 'Tu dois en vous devez', rule: 'Na devoir volgt het volledige werkwoord. Met tu gebruik je dois en met vous gebruik je devez.',
      example: 'Vous devez lire la consigne.', translation: 'U moet de instructie lezen.',
      items: [['Vous … demander au responsable. (devoir)', 'devez'], ['Tu … lire la fiche. (devoir)', 'dois'], ['Je … trouver mes lunettes. (devoir)', 'dois']],
    },
    scene: {
      prompt: 'Vraag aan je begeleider waar de zuurkast staat.', line: 'Vous cherchez quelque chose ?', meaning: 'Zoekt u iets?',
      answer: 'Excusez-moi, où se trouve la sorbonne ?', translation: 'Excuseer, waar staat de zuurkast?',
      criteria: ['Formuleer een plaatsvraag.', 'Gebruik sorbonne of hotte chimique.'],
    },
  },
  {
    id: 'fr-labo-prelevement', topic: 'labo', level: 'A2', title: 'Pipetten, filters en toebehoren', source: appareils,
    summary: 'Maak onderscheid tussen een pipet, de onderdelen ervan en het materiaal voor filtratie. Oefen om een collega precies te vertellen welk voorwerp je zoekt.',
    words: [
      ['une micropipette', 'een micropipet'], ['un embout de pipette', 'een pipetpunt', ['une pointe de pipette']], ['une propipette', 'een pipetvuller'],
      ['un porte-filtre', 'een filterhouder'], ['un papier filtre', 'een filtreerpapiertje'], ['une membrane filtrante', 'een filtermembraan'],
      ['un filtrat', 'een filtraat'], ['un résidu', 'een residu'], ['un prélèvement', 'een afname'], ['une pince', 'een tang of pincet'],
      ['un support', 'een statief of houder'], ['un godet', 'een klein materiaalbekertje'],
    ],
    grammar: {
      title: 'Ce, cet, cette en ces', rule: 'Ce staat bij mannelijke woorden. Voor een klinker of stomme h wordt dat cet. Gebruik cette in het vrouwelijk enkelvoud en ces in het meervoud.',
      example: 'ce filtre · cet embout · cette micropipette · ces pinces',
      translation: 'deze filter · deze pipetpunt · deze micropipet · deze tangen',
      items: [['… embout est dans la boîte.', 'Cet'], ['… micropipette est sur la paillasse.', 'Cette'], ['… filtres sont neufs.', 'Ces']],
    },
    scene: {
      prompt: 'Vraag of dit de juiste pipetpunt is voor deze micropipet.', line: 'Voici les embouts.', meaning: 'Hier zijn de pipetpunten.',
      answer: 'Est-ce le bon embout pour cette micropipette ?', translation: 'Is dat de juiste pipetpunt voor deze micropipet?',
      criteria: ['Vraag of de pipetpunt past.', 'Gebruik embout en micropipette.'],
    },
  },
  {
    id: 'fr-labo-appareils', topic: 'labo', level: 'B1', title: 'Meetapparatuur en analyseresultaten', source: appareils,
    summary: 'Leer apparaten in een practicum of rondleiding herkennen. Oefen om uit te leggen welk toestel je gebruikte en waar het resultaat staat.',
    words: [
      ['un pH-mètre', 'een pH-meter', ['un pH mètre']], ['un spectrophotomètre', 'een spectrofotometer'], ['une cuve', 'een cuvet'],
      ['une centrifugeuse', 'een centrifuge'], ['un bain-marie', 'een waterbad'], ['un agitateur magnétique', 'een magneetroerder'],
      ['un barreau aimanté', 'een roervlo'], ['une étuve', 'een droogstoof'], ['un thermomètre', 'een thermometer'],
      ['un chromatogramme', 'een chromatogram'], ['une courbe d’étalonnage', 'een ijklijn'], ['une absorbance', 'een absorbantie'],
    ],
    grammar: {
      title: 'Passé composé bij een uitgevoerde handeling', rule: 'Om te vertellen wat je al deed, gebruik je bij mesurer, noter en préparer avoir met het voltooid deelwoord.',
      example: 'J’ai noté le résultat.', translation: 'Ik heb het resultaat genoteerd.',
      items: [['Hier, j’ai … le pH. (mesurer)', 'mesuré'], ['Nous avons … le résultat. (noter)', 'noté'], ['J’ai … le matériel. (préparer)', 'préparé']],
    },
    scene: {
      prompt: 'Vertel dat je gisteren de pH hebt gemeten en het resultaat hebt genoteerd.', line: 'Qu’avez-vous fait hier ?', meaning: 'Wat hebt u gisteren gedaan?',
      answer: 'Hier, j’ai mesuré le pH et j’ai noté le résultat.', translation: 'Gisteren heb ik de pH gemeten en het resultaat genoteerd.',
      criteria: ['Gebruik de passé composé.', 'Noem de twee handelingen.'],
    },
  },
  {
    id: 'fr-labo-microscopie', topic: 'labo', level: 'B1', title: 'Microscopie en observatie', source: appareils,
    summary: 'Herken onderdelen van een microscoop en beschrijf een waarneming in eenvoudige woorden.',
    words: [
      ['un microscope', 'een microscoop'], ['un oculaire', 'een oculair'], ['un objectif', 'een objectief'],
      ['une platine', 'een voorwerptafel'], ['une lame', 'een objectglaasje'], ['une lamelle', 'een dekglaasje'],
      ['une mise au point', 'een scherpstelling'], ['un grossissement', 'een vergroting'], ['un champ de vision', 'een gezichtsveld'],
      ['une observation', 'een waarneming'], ['une image nette', 'een scherp beeld'], ['une image floue', 'een wazig beeld'],
    ],
    grammar: {
      title: 'Het bijvoeglijk naamwoord aanpassen', rule: 'Laat het adjectief overeenkomen met het naamwoord. Bij une image gebruik je bijvoorbeeld nette of floue. Voor het meervoud komt er meestal een s bij.',
      example: 'une image nette · des images nettes', translation: 'een scherp beeld · scherpe beelden',
      items: [['L’image est … (flou).', 'floue'], ['Les images sont … (net).', 'nettes'], ['Une observation … (précis).', 'précise']],
    },
    scene: {
      prompt: 'Zeg dat het beeld wazig is en vraag hulp bij het scherpstellen.', line: 'L’image est-elle nette ?', meaning: 'Is het beeld scherp?',
      answer: 'L’image est floue. Pouvez-vous m’aider à faire la mise au point ?', translation: 'Het beeld is wazig. Kunt u me helpen scherpstellen?',
      criteria: ['Beschrijf het beeld met floue.', 'Vraag hulp bij la mise au point.'],
    },
  },
  {
    id: 'fr-labo-compte-rendu', topic: 'labo', level: 'B2', title: 'Een meetresultaat rapporteren', source: practical,
    summary: 'Beschrijf wat je in je laboschrift noteerde. Maak in het Frans onderscheid tussen een observatie, een mogelijke verklaring en een controle.',
    words: [
      ['un cahier de laboratoire', 'een laboschrift'], ['une valeur mesurée', 'een gemeten waarde'], ['une unité de mesure', 'een meeteenheid'],
      ['un écart', 'een afwijking'], ['une incertitude', 'een onzekerheid'], ['une valeur de référence', 'een referentiewaarde'],
      ['une erreur de lecture', 'een afleesfout'], ['une vérification', 'een verificatie (controle)'], ['une hypothèse', 'een hypothese'],
      ['une donnée brute', 'een ruwe meting of ruw gegeven'], ['un compte rendu de TP', 'een practicumverslag'], ['une conclusion provisoire', 'een voorlopige conclusie'],
    ],
    grammar: {
      title: 'Een voorzichtige formulering', rule: 'Il se peut que leidt een mogelijkheid in en vraagt de subjonctif. Gebruik bijvoorbeeld soit bij être en ait bij avoir.',
      example: 'Il se peut que la mesure soit imprécise.', translation: 'Het kan zijn dat de meting onnauwkeurig is.',
      items: [['Il se peut que la mesure … imprécise. (être)', 'soit'], ['Il se peut que le tableau … une erreur. (avoir)', 'ait'], ['Il se peut que les mesures … différentes. (être)', 'soient']],
    },
    scene: {
      prompt: 'Meld een afwijking en zeg voorzichtig dat een afleesfout mogelijk is.', line: 'Comment expliquez-vous cet écart ?', meaning: 'Hoe verklaart u die afwijking?',
      answer: 'On observe un écart. Il se peut qu’il y ait une erreur de lecture.', translation: 'We zien een afwijking. Mogelijk is er een afleesfout.',
      criteria: ['Benoem de afwijking.', 'Formuleer de mogelijke oorzaak als hypothese.'],
    },
  },
  {
    id: 'fr-labo-consommables', topic: 'labo', level: 'A2', title: 'Stoffen en verbruiksmateriaal', source: verrerie,
    summary: 'Herken etiketten op flessen en verpakkingen. Leer hoe je vraagt om een vloeistof, een onderdeel of een schoon reservevoorwerp.',
    words: [
      ['de l’eau distillée', 'gedestilleerd water'], ['un solvant', 'een oplosmiddel'], ['un réactif', 'een reagens'],
      ['une solution', 'een oplossing'], ['une solution étalon', 'een standaardoplossing'], ['un témoin', 'een controlemonster'],
      ['une pissette', 'een spuitfles'], ['un flacon compte-gouttes', 'een druppelflesje'], ['une boîte de Petri', 'een petrischaaltje'],
      ['une feuille de papier absorbant', 'een vel absorberend papier'], ['un film de scellage', 'een afdichtfolie'], ['un lot neuf', 'een nieuwe partij'],
    ],
    grammar: {
      title: 'Il reste en il nous faut', rule: 'Met il reste zeg je wat er nog is. Met il nous faut zeg je wat je nodig hebt. Beide uitdrukkingen blijven zo staan voor een enkelvoud of een meervoud.',
      example: 'Il nous faut une pissette et de l’eau distillée.', translation: 'We hebben een spuitfles en gedestilleerd water nodig.',
      items: [['Il nous … une pissette. (nodig hebben)', 'faut'], ['Il … deux boîtes de Petri. (overblijven)', 'reste'], ['Il me faut … eau distillée. (onbepaalde hoeveelheid)', 'de l’']],
    },
    scene: {
      prompt: 'Vraag of er nog gedestilleerd water is en zeg dat je een spuitfles nodig hebt.', line: 'Est-ce qu’il vous manque du matériel ?', meaning: 'Ontbreekt er materiaal?',
      answer: 'Est-ce qu’il reste de l’eau distillée ? Il me faut aussi une pissette.', translation: 'Is er nog gedestilleerd water? Ik heb ook een spuitfles nodig.',
      criteria: ['Vraag of er nog water is.', 'Gebruik pissette voor de spuitfles.'],
    },
  },
  {
    id: 'fr-labo-gestes', topic: 'labo', level: 'B1', title: 'Handelingen tijdens het practicum', source: practical,
    summary: 'Herken werkwoorden in instructies en beschrijf wat al gebeurd is. Leer ook vragen om een handeling te herhalen.',
    words: [
      ['prélever', 'een deel nemen (van een monster)'], ['verser', 'gieten'], ['rincer', 'spoelen'], ['peser', 'wegen'],
      ['dissoudre', 'oplossen'], ['diluer', 'verdunnen'], ['agiter', 'schudden of omroeren'], ['filtrer', 'filtreren'],
      ['transvaser', 'overgieten in een ander recipiënt'], ['étiqueter', 'etiketteren'], ['noter', 'noteren'], ['ranger', 'opruimen'],
    ],
    grammar: {
      title: 'Imperatief met vous', rule: 'De beleefde gebiedende wijs gebruikt meestal de vous-vorm zonder vous. Voor veel werkwoorden op -er eindigt die vorm op -ez.',
      example: 'Notez le résultat, puis rangez le matériel.', translation: 'Noteer het resultaat en ruim daarna het materiaal op.',
      items: [['… le résultat. (noter, vous-vorm)', 'Notez'], ['… les flacons. (ranger, vous-vorm)', 'Rangez'], ['… le tube. (rincer, vous-vorm)', 'Rincez']],
    },
    scene: {
      prompt: 'Vraag de begeleider of je moet opschrijven wat je hebt gewogen.', line: 'Vous avez fini de peser ?', meaning: 'Bent u klaar met wegen?',
      answer: 'Oui. Est-ce que je dois noter ce que j’ai pesé ?', translation: 'Ja. Moet ik opschrijven wat ik heb gewogen?',
      criteria: ['Vraag of noteren nodig is.', 'Gebruik noter en peser.'],
    },
  },
  {
    id: 'fr-officine-formes', topic: 'officine', level: 'A2', title: 'Geneesmiddelvormen en verpakkingen', source: galenics,
    summary: 'Herken de Franse naam van een vorm of verpakking. Oefen onderscheid tussen de inhoud en wat er rond zit.',
    words: [
      ['un comprimé', 'een tablet'], ['une gélule', 'een harde capsule'], ['un sirop', 'een siroop'],
      ['une pommade', 'een zalf'], ['une crème', 'een crème'], ['un collyre', 'een oogdruppelpreparaat'],
      ['un sachet', 'een zakje'], ['une plaquette thermoformée', 'een blisterverpakking', ['une plaquette', 'un blister']],
      ['un tube', 'een tube'], ['une ampoule', 'een ampul'], ['une boîte', 'een doos'], ['une solution buvable', 'een drankoplossing'],
    ],
    grammar: {
      title: 'Verpakking + de + inhoud', rule: 'Bij de inhoud van een verpakking zet je de tussen de woorden. Gebruik het meervoud als de verpakking meerdere telbare stuks bevat.',
      example: 'une boîte de comprimés · un tube de pommade', translation: 'een doos tabletten · een tube zalf',
      items: [['Une boîte de … (comprimé, meervoud).', 'comprimés'], ['Un tube … pommade.', 'de'], ['Une boîte de … (gélule, meervoud).', 'gélules']],
    },
    scene: {
      prompt: 'Vraag of de verpakking tabletten of capsules bevat.', line: 'Voici la boîte.', meaning: 'Hier is de doos.',
      answer: 'Cette boîte contient-elle des comprimés ou des gélules ?', translation: 'Bevat deze doos tabletten of capsules?',
      criteria: ['Vraag naar de inhoud van de doos.', 'Gebruik comprimés en gélules.'],
    },
  },
  {
    id: 'fr-officine-ordonnance', topic: 'officine', level: 'B1', title: 'Voorschrift, etiket en bijsluiter', source: internship,
    summary: 'Vind woorden op een voorschrift of bijsluiter en leg uit waar je een rubriek kunt controleren.',
    words: [
      ['une ordonnance', 'een voorschrift'], ['une notice', 'een bijsluiter'], ['un conditionnement', 'een verpakkingseenheid'],
      ['une posologie', 'een doseringsschema'], ['une voie d’administration', 'een toedieningsweg'], ['une date de péremption', 'een vervaldatum'],
      ['un numéro de lot', 'een lotnummer'], ['une substance active', 'een werkzame stof', ['un principe actif']], ['un excipient', 'een hulpstof'],
      ['une contre-indication', 'een contra-indicatie'], ['un effet indésirable', 'een bijwerking'], ['une rubrique', 'een rubriek'],
    ],
    grammar: {
      title: 'Où en quel', rule: 'Met où vraag je naar de plek of rubriek. Quel past zich aan het naamwoord aan. Schrijf quelle date en quel numéro.',
      example: 'Où figure le numéro de lot ?', translation: 'Waar staat het lotnummer?',
      items: [['… figure le numéro de lot ? (waar)', 'Où'], ['… est la date de péremption ? (welke)', 'Quelle'], ['… est le numéro de lot ? (welk)', 'Quel']],
    },
    scene: {
      prompt: 'Vraag waar het lotnummer en de vervaldatum staan.', line: 'Quelles informations cherchez-vous ?', meaning: 'Welke informatie zoekt u?',
      answer: 'Où figurent le numéro de lot et la date de péremption ?', translation: 'Waar staan het lotnummer en de vervaldatum?',
      criteria: ['Vraag waar de gegevens staan.', 'Noem beide gegevens.'],
    },
  },
  {
    id: 'fr-officine-stage', topic: 'officine', level: 'B1', title: 'Op stage achter de balie', source: internship,
    summary: 'Oefen om in een apotheek voorraad te bespreken, een collega door te verwijzen en een bestelling op te volgen.',
    words: [
      ['une officine', 'een openbare apotheek'], ['un comptoir', 'een balie'], ['un maître de stage', 'een stagebegeleider', ['une maîtresse de stage']],
      ['un stagiaire', 'een stagiair', ['une stagiaire']], ['un stock', 'een voorraad'], ['un fournisseur', 'een leverancier'],
      ['un bon de livraison', 'een leveringsbon'], ['une commande', 'een bestelling'], ['une rupture de stock', 'een voorraadtekort'],
      ['un article disponible', 'een artikel op voorraad'], ['un délai de livraison', 'een leveringstermijn'], ['une référence', 'een productreferentie'],
    ],
    grammar: {
      title: 'Futur proche om iets toe te zeggen', rule: 'Voor iets wat je zo meteen gaat doen gebruik je aller in de tegenwoordige tijd met een infinitief.',
      example: 'Je vais vérifier le stock.', translation: 'Ik ga de voorraad nakijken.',
      items: [['Je … vérifier la référence. (aller)', 'vais'], ['Nous … passer la commande. (aller)', 'allons'], ['Vous … recevoir un bon de livraison. (aller)', 'allez']],
    },
    scene: {
      prompt: 'Zeg dat je de voorraad en de leveringstermijn gaat nakijken.', line: 'Est-ce disponible aujourd’hui ?', meaning: 'Is het vandaag beschikbaar?',
      answer: 'Je vais vérifier le stock et le délai de livraison.', translation: 'Ik ga de voorraad en de leveringstermijn nakijken.',
      criteria: ['Gebruik je vais met een infinitief.', 'Noem stock en délai de livraison.'],
    },
  },
  {
    id: 'fr-officine-galenique', topic: 'officine', level: 'B2', title: 'Galéniek en bereidingstaal', source: galenics,
    summary: 'Benoem materiaal, basisvormen en texturen die je in een practicum galéniek tegenkomt.',
    words: [
      ['un mortier', 'een vijzel'], ['un pilon', 'een stamper'], ['un tamis', 'een zeef'], ['un mélange', 'een mengsel'],
      ['une préparation magistrale', 'een magistrale bereiding'], ['une formulation', 'een formulering (samenstelling)'],
      ['une poudre', 'een poeder'], ['une émulsion', 'een emulsie'], ['une suspension', 'een suspensie'],
      ['une consistance', 'een consistentie'], ['une homogénéité', 'een gelijkmatige samenstelling'], ['un pot à pommade', 'een zalfpotje'],
    ],
    grammar: {
      title: 'Lequel en laquelle', rule: 'Als uit de context blijkt over welk soort voorwerp het gaat, vervang je de vraag quel + naamwoord door lequel (mannelijk) of laquelle (vrouwelijk).',
      example: 'Il y a deux mortiers. Lequel préférez-vous ?', translation: 'Er zijn twee vijzels. Welke verkiest u?',
      items: [['Il y a deux tamis. … choisir ? (welke)', 'Lequel'], ['Il y a deux formulations. … comparer ? (welke)', 'Laquelle'], ['Il y a deux pots. … utiliser ? (welke)', 'Lequel']],
    },
    scene: {
      prompt: 'Vraag welk van twee zalfpotjes je moet klaarzetten.', line: 'Il y a deux pots à pommade ici.', meaning: 'Er staan hier twee zalfpotjes.',
      answer: 'Lequel dois-je préparer ?', translation: 'Welk moet ik klaarzetten?',
      criteria: ['Verwijs naar pot met lequel.', 'Vraag welk je moet klaarzetten.'],
    },
  },
  {
    id: 'fr-campus-bibliotheque', topic: 'studie', level: 'A2', title: 'Een boek vinden en lenen', source: library,
    summary: 'Leer de woorden uit de online catalogus en vraag aan de balie waar je een boek vindt of hoe je je lening verlengt.',
    words: [
      ['un catalogue', 'een catalogus'], ['une cote', 'een plaatsingsnummer'], ['un rayon', 'een rek'], ['un exemplaire', 'een exemplaar'],
      ['un manuel', 'een handboek'], ['une revue', 'een tijdschrift'], ['un prêt', 'een uitlening'], ['une réservation', 'een reservatie'],
      ['une date de retour', 'een inleverdatum'], ['une carte étudiante', 'een studentenkaart'], ['un guichet de prêt', 'een uitleenbalie'], ['une salle de travail', 'een studiezaal'],
    ],
    grammar: {
      title: 'Beleefd vragen met est-ce que', rule: 'Est-ce que verandert de gewone woordvolgorde in een vraag. Voor een klinker wordt que verkort tot qu’.',
      example: 'Est-ce que je peux prolonger ce prêt ?', translation: 'Mag ik deze lening verlengen?',
      items: [['… je peux emprunter ce manuel ? (is het mogelijk)', 'Est-ce que'], ['… il reste un exemplaire ? (is er nog)', 'Est-ce qu’'], ['… vous pouvez m’indiquer le rayon ? (kunt u)', 'Est-ce que']],
    },
    scene: {
      prompt: 'Vraag beleefd of je het handboek kunt lenen of reserveren.', line: 'Ce manuel est souvent emprunté.', meaning: 'Dit handboek wordt vaak uitgeleend.',
      answer: 'Est-ce que je peux emprunter ce manuel ou le réserver ?', translation: 'Kan ik dit handboek lenen of reserveren?',
      criteria: ['Stel een vraag over het handboek.', 'Gebruik emprunter en réserver.'],
    },
  },
  {
    id: 'fr-campus-tp', topic: 'studie', level: 'A2', title: 'Cursussen, practicum en uurrooster', source: practical,
    summary: 'Vraag in welke groep je zit, waar het volgende practicum plaatsvindt en wanneer je een verslag moet indienen.',
    words: [
      ['un cours magistral', 'een hoorcollege'], ['des travaux pratiques', 'practica'], ['des travaux dirigés', 'begeleide oefeningen'],
      ['un groupe de TP', 'een practicumgroep'], ['un emploi du temps', 'een uurrooster'], ['un créneau', 'een tijdslot'],
      ['une salle de cours', 'een leslokaal'], ['un auditoire', 'een auditorium', ['un amphithéâtre']], ['un enseignant', 'een docent', ['une enseignante']],
      ['une présence obligatoire', 'een verplichte aanwezigheid'], ['une inscription', 'een inschrijving'], ['une date limite', 'een deadline'],
    ],
    grammar: {
      title: 'Een tijdstip formuleren', rule: 'Gebruik à bij een concreet uur. Voor een interval kun je de … à … gebruiken. Bij de dag van een specifieke afspraak staat vaak het lidwoord er niet bij.',
      example: 'Le TP a lieu mardi de neuf heures à onze heures.', translation: 'Het practicum vindt dinsdag plaats van negen tot elf uur.',
      items: [['Le cours commence … dix heures. (om)', 'à'], ['Le TP dure … neuf heures à midi. (van)', 'de'], ['Le TP est … mardi et jeudi ? (tussen)', 'entre']],
    },
    scene: {
      prompt: 'Vraag in welk lokaal het practicum van donderdag om tien uur doorgaat.', line: 'Quel créneau avez-vous choisi ?', meaning: 'Welk tijdslot hebt u gekozen?',
      answer: 'Dans quelle salle a lieu le TP de jeudi à dix heures ?', translation: 'In welk lokaal gaat het practicum van donderdag om tien uur door?',
      criteria: ['Vraag in welk lokaal.', 'Vermeld donderdag en tien uur.'],
    },
  },
  {
    id: 'fr-campus-rapport', topic: 'studie', level: 'B2', title: 'Een artikel zoeken en een verslag indienen', source: library,
    summary: 'Oefen de woorden waarmee je een wetenschappelijke bron identificeert en onderdelen van een verslag bespreekt.',
    words: [
      ['un article scientifique', 'een wetenschappelijk artikel'], ['un résumé', 'een samenvatting'], ['une revue scientifique', 'een wetenschappelijk tijdschrift'],
      ['un mot-clé', 'een trefwoord'], ['une référence bibliographique', 'een bibliografische verwijzing'], ['une édition', 'een editie'],
      ['un texte intégral', 'een volledige tekst'], ['une pièce jointe', 'een bijlage bij een bericht'], ['un brouillon', 'een kladversie'],
      ['une remise', 'een indiening'], ['une bibliographie', 'een literatuurlijst'], ['une figure', 'een figuur'],
    ],
    grammar: {
      title: 'Qui, que en dont', rule: 'Gebruik qui voor het onderwerp van de bijzin, que voor het lijdend voorwerp en dont wanneer de bijzin de nodig heeft, zoals parler de.',
      example: 'L’article dont nous parlons est en ligne.', translation: 'Het artikel waarover we spreken staat online.',
      items: [['Voici l’article … présente les résultats.', 'qui'], ['Voici l’article … nous avons consulté.', 'que'], ['Voici l’article … nous avons parlé.', 'dont']],
    },
    scene: {
      prompt: 'Vraag waar je de volledige tekst vindt van het artikel waarover jullie spraken.', line: 'Vous avez trouvé l’article ?', meaning: 'Hebt u het artikel gevonden?',
      answer: 'Où puis-je trouver le texte intégral de l’article dont nous avons parlé ?', translation: 'Waar vind ik de volledige tekst van het artikel waarover we gesproken hebben?',
      criteria: ['Vraag naar le texte intégral.', 'Verwijs met dont naar het besproken artikel.'],
    },
  },
  {
    id: 'fr-winkel-rayons', topic: 'winkel', level: 'A1', title: 'Afdelingen en producten in de supermarkt',
    summary: 'Vraag waar een afdeling ligt en herken producten die je op etiketten en wegwijzers ziet.',
    words: [
      ['un rayon fruits et légumes', 'een afdeling groenten en fruit'], ['un rayon frais', 'een afdeling verse gekoelde producten'],
      ['des produits surgelés', 'diepvriesproducten'], ['une boulangerie', 'een bakkerij'], ['un sachet de pâtes', 'een zak pasta'],
      ['un yaourt', 'een yoghurt'], ['du lait demi-écrémé', 'halfvolle melk'], ['du fromage râpé', 'geraspte kaas'],
      ['un paquet de riz', 'een pak rijst'], ['une boîte de conserve', 'een conservenblik'], ['des œufs', 'eieren', ['des oeufs']],
      ['une référence en rayon', 'een product dat in het rek ligt'], ['un assortiment', 'een assortiment'],
    ],
    grammar: {
      title: 'Chercher en où se trouve', rule: 'Na je cherche komt het product rechtstreeks. Met où se trouve vraag je waar een afdeling of plek zich bevindt.',
      example: 'Je cherche un paquet de riz.', translation: 'Ik zoek een pak rijst.',
      items: [['Je … le rayon frais. (zoeken)', 'cherche'], ['Où … trouve la boulangerie ? (vul het korte voornaamwoord in)', 'se'], ['Je cherche … yaourt. (een)', 'un']],
    },
    scene: {
      prompt: 'Vraag een winkelmedewerker waar je de diepvriesproducten vindt.', line: 'Je peux vous aider ?', meaning: 'Kan ik u helpen?',
      answer: 'Où puis-je trouver les produits surgelés ?', translation: 'Waar vind ik de diepvriesproducten?',
      criteria: ['Stel een plaatsvraag.', 'Gebruik produits surgelés.'],
    },
  },
  {
    id: 'fr-winkel-hoeveelheid', topic: 'winkel', level: 'A2', title: 'Hoeveelheden en verpakkingen vragen', source: partitif,
    summary: 'Vraag om een concrete hoeveelheid op de markt of in de winkel. Oefen het verschil tussen een verpakking en een hoeveelheid van een product.',
    words: [
      ['une barquette', 'een schaaltje of bakje'], ['une botte', 'een bos (groenten of kruiden)'], ['une grappe', 'een tros'],
      ['une tranche', 'een sneetje'], ['un morceau', 'een stuk'], ['un kilo', 'een kilo'], ['un demi-kilo', 'een halve kilo'],
      ['une bouteille', 'een fles'], ['un bocal', 'een glazen pot'], ['un litre', 'een liter'], ['une portion', 'een portie'], ['un filet', 'een netje (verpakking)'],
    ],
    grammar: {
      title: 'Du, de la, de l’ en de', rule: 'Du, de la en de l’ geven een onbepaalde hoeveelheid aan. Na een concrete hoeveelheid of maat volgt de of d’.',
      example: 'du fromage · deux tranches de fromage', translation: 'wat kaas · twee sneetjes kaas',
      items: [['Je voudrais … fromage. (een onbepaalde hoeveelheid)', 'du'], ['Je prends un litre … lait. (vul het voorzetsel in)', 'de'], ['Je voudrais … huile. (een onbepaalde hoeveelheid)', 'de l’']],
    },
    scene: {
      prompt: 'Vraag om twee sneetjes kaas en een halve kilo tomaten.', line: 'Et avec ceci ?', meaning: 'En verder nog iets?',
      answer: 'Deux tranches de fromage et un demi-kilo de tomates, s’il vous plaît.', translation: 'Twee sneetjes kaas en een halve kilo tomaten, alstublieft.',
      criteria: ['Geef beide hoeveelheden.', 'Gebruik de na de hoeveelheden.'],
    },
  },
  {
    id: 'fr-winkel-kassa', topic: 'winkel', level: 'A2', title: 'Aan de kassa en bij de drogisterij',
    summary: 'Vraag een ticket, herken kortingen en vind spullen voor je studietaak of dagelijkse boodschappen.',
    words: [
      ['une caisse', 'een kassa'], ['un ticket de caisse', 'een kasticket'], ['une carte bancaire', 'een bankkaart'],
      ['des espèces', 'contant geld'], ['un prix au kilo', 'een prijs per kilo'], ['une réduction', 'een korting'],
      ['un échange', 'een omruiling'], ['un remboursement', 'een terugbetaling'], ['un dentifrice', 'een tandpasta'],
      ['un gel douche', 'een douchegel'], ['un cahier à carreaux', 'een schrift met ruitjes'], ['un classeur', 'een ringmap'],
    ],
    grammar: {
      title: 'Par carte en en espèces', rule: 'Gebruik par carte voor de betaalwijze met kaart en en espèces voor contant betalen.',
      example: 'Je peux payer par carte ?', translation: 'Kan ik met de kaart betalen?',
      items: [['Je paie … carte. (met de kaart)', 'par'], ['Je règle … espèces. (contant)', 'en'], ['Je voudrais le … de caisse. (ticket)', 'ticket']],
    },
    scene: {
      prompt: 'Vraag of je met de kaart kunt betalen en vraag het kasticket.', line: 'Comment souhaitez-vous payer ?', meaning: 'Hoe wilt u betalen?',
      answer: 'Je peux payer par carte ? Pourrais-je avoir le ticket de caisse, s’il vous plaît ?', translation: 'Kan ik met de kaart betalen? Mag ik het kasticket, alstublieft?',
      criteria: ['Vraag om met kaart te betalen.', 'Vraag een ticket de caisse.'],
    },
  },
  {
    id: 'fr-cafe-boissons', topic: 'cafe', level: 'A1', title: 'Een drankje en iets kleins bestellen', source: restaurant,
    summary: 'Leer courante dranken en snacks van een kaart herkennen. Bestel, vraag iets extra en zeg of je ter plaatse blijft.',
    words: [
      ['un café allongé', 'een aangelengde espresso'], ['un café au lait', 'een koffie met melk'], ['un thé', 'een thee'],
      ['une tisane', 'een kruidenthee'], ['un chocolat chaud', 'een warme chocolademelk'], ['un jus d’orange', 'een sinaasappelsap'],
      ['une eau plate', 'plat water'], ['une eau gazeuse', 'bruiswater'], ['un croissant', 'een croissant'],
      ['une part de tarte', 'een stuk taart'], ['un sandwich', 'een belegd broodje'], ['une carafe d’eau', 'een karaf water'],
    ],
    grammar: {
      title: 'Je voudrais en je prends', rule: 'Je voudrais drukt een beleefde wens uit. Je prends is een gewone formulering wanneer je kiest wat je neemt.',
      example: 'Je voudrais un thé et une part de tarte.', translation: 'Ik wil graag een thee en een stuk taart.',
      items: [['Je … un café, s’il vous plaît. (ik wil graag)', 'voudrais'], ['Je … un jus d’orange. (ik neem)', 'prends'], ['… voudrais une tisane. (ik)', 'Je']],
    },
    scene: {
      prompt: 'Bestel één kruidenthee en één stuk taart.', line: 'Qu’est-ce que je vous sers ?', meaning: 'Wat mag ik u brengen?',
      answer: 'Je voudrais une tisane et une part de tarte, s’il vous plaît.', translation: 'Ik wil graag een kruidenthee en een stuk taart, alstublieft.',
      criteria: ['Bestel beide.', 'Gebruik een beleefde formulering.'],
    },
  },
  {
    id: 'fr-cafe-lunch', topic: 'cafe', level: 'A2', title: 'Lunchen, ingrediënten vragen en afrekenen', source: restaurant,
    summary: 'Lees een lunchkaart, vraag wat een gerecht bevat en reken apart of samen af.',
    words: [
      ['une carte', 'een menukaart'], ['un plat du jour', 'een dagschotel'], ['une soupe', 'een soep'], ['une salade composée', 'een gemengde salade'],
      ['une garniture', 'een bijgerecht of garnituur'], ['un dessert', 'een nagerecht'], ['une sauce', 'een saus'],
      ['un allergène', 'een allergeen'], ['des couverts', 'bestek'], ['une serviette', 'een servet'], ['une addition', 'een restaurantrekening'],
      ['un paiement séparé', 'een afzonderlijke betaling'], ['une formule déjeuner', 'een lunchmenu met vaste formule'],
    ],
    grammar: {
      title: 'Avec, sans en à part', rule: 'Gebruik avec voor wat erbij zit, sans als je iets weglaat en à part als je iets afzonderlijk wilt.',
      example: 'La sauce à part, s’il vous plaît.', translation: 'De saus apart, alstublieft.',
      items: [['Une salade … sauce. (zonder saus)', 'sans'], ['La sauce …, s’il vous plaît. (apart)', 'à part'], ['Un sandwich … une salade. (met)', 'avec']],
    },
    scene: {
      prompt: 'Vraag of het gerecht noten bevat en vraag of je afzonderlijk kunt betalen.', line: 'Vous avez une question sur le plat ?', meaning: 'Hebt u een vraag over het gerecht?',
      answer: 'Ce plat contient-il des noix ? Et peut-on payer séparément ?', translation: 'Bevat dit gerecht noten? En kunnen we afzonderlijk betalen?',
      criteria: ['Vraag expliciet naar des noix.', 'Vraag om afzonderlijk te betalen.'],
    },
  },
];
