import { source } from './content/history-extension.js?v=13r9';

export const curricula = [
  {
    name: 'Universiteit Gent',
    focus: 'De bachelor combineert chronologische overzichten met wereldgeschiedenis, historische kritiek en praktijk. In de master komen daar periodes en specialisaties zoals stadsgeschiedenis en geschiedenis van Afrika bij.',
    references: [
      source('Universiteit Gent','Bachelor Geschiedenis','2026–2027','Algemene opleidingsonderdelen en keuzeopleidingsonderdelen',
        'https://studiekiezer.ugent.be/2026/bachelor-of-arts-in-de-geschiedenis/programma'),
      source('Universiteit Gent','Master Geschiedenis','2026–2027','Onderzoeksseminaries en masterproef',
        'https://studiekiezer.ugent.be/2026/master-of-arts-in-de-geschiedenis/programma'),
    ],
  },
  {
    name: 'KU Leuven',
    focus: 'De bachelor koppelt historische overzichten aan vaardigheden en opties voor verdieping. De master voegt thematische specialisatie en een onderzoeksseminarie toe.',
    references: [
      source('KU Leuven','Bachelor Geschiedenis, Leuven','','Studieprogramma eerste bachelor en verder verloop',
        'https://www.kuleuven.be/programmes/opleidingen/bachelor-geschiedenis/leuven/studieprogramma'),
      source('KU Leuven','Master of History, Leuven','','Programme structure, onderzoeksseminarie en masterproef',
        'https://onderwijsaanbod.kuleuven.be/opleidingen/e/SC_54301052.htm'),
      source('KU Leuven','Geschiedenis van de middeleeuwen','','Studiefiche V0LA3A, inhoud en studiemateriaal',
        'https://onderwijsaanbod.kuleuven.be/syllabi/n/V0LA3A'),
    ],
  },
  {
    name: 'Universiteit Antwerpen',
    focus: 'Chronologische overzichten, historische oefeningen en sociaal-economische of culturele geschiedenis helpen de overgang maken van algemene kennis naar afzonderlijke onderzoeksvragen.',
    references: [
      source('Universiteit Antwerpen','Bachelor Geschiedenis','','Studieprogramma, historische overzichten en historische oefeningen',
        'https://www.uantwerpen.be/nl/studeren/aanbod/alle-opleidingen/geschiedenis-studeren/bachelor/studieprogramma/'),
    ],
  },
  {
    name: 'Universiteit Leiden',
    focus: 'De vakken koppelen hoor- en werkcolleges aan afzonderlijke perioden. De verdieping in materiële cultuur ondersteunt de keuze om gebouwen, objecten en vindplaatsen naast geschreven stukken te oefenen.',
    references: [
      source('Universiteit Leiden','Bachelor Geschiedenis','2025–2026','Studiegids, eerste jaar en verdiepingsvakken',
        'https://studiegids-archief.leidenuniv.nl/studies/10717/geschiedenis'),
      source('Universiteit Leiden','Materiële cultuur voor oudhistorici','2025–2026','Vakbeschrijving en leerdoelen',
        'https://studiegids-archief.leidenuniv.nl/courses/135739/materiele-cultuur-voor-oudhistorici'),
    ],
  },
];

export const reading = [
  {
    title: 'De Oudheid. Grieken en Romeinen in de context van de wereldgeschiedenis',
    description: 'F. G. Naerebout en H. W. Singor. Leiden vermeldt de herziene elfde druk (2008) of een latere. Begin bij de periode die je volgt. Vergelijk per rijk bestuur, productie en positie van inwoners.',
    reference:source('Universiteit Leiden','Werkcollege Oude Geschiedenis','2025–2026','Literatuurlijst',
      'https://studiegids-archief.leidenuniv.nl/courses/133776/werkcollege-oude-geschiedenis'),
  },
  {
    title: 'Een inleiding tot de geschiedenis van de vroegmoderne tijd',
    description: 'René Vermeir, Isabelle Devos e.a. De Gentse vakfiche noemt het handboek. Gebruik het bij de routes over staatsvorming, arbeid, religie en de Lage Landen.',
    reference:source('Universiteit Gent','Geschiedenis van de Vroegmoderne Tijd','2024–2025','A002680, studiemateriaal, p. 2',
      'https://studiekiezer.ugent.be/studiefiche/nl/A002680/2024'),
  },
  {
    title: 'Wereldgeschiedenis. Een inleiding',
    description: 'Eric Vanhaute (2012, tweede druk). Lees vanuit verbindingen en vergelijkingen tussen samenlevingen. Gebruik de bibliografie om een thema verder af te bakenen.',
    reference:source('Eric Vanhaute','Wereldgeschiedenis. Een inleiding','2012','Tweede druk, UGent Academic Bibliography',
      'https://biblio.ugent.be/publication/2106104'),
  },
  {
    title: 'World History',
    description: 'Ann Kordas, Ryan J. Lynch, Brooke Nelson en Julie Tatlock (2023, deel 1 en 2022, deel 2). De hoofdstukken staan online. Volg de specifieke vindplaats in de les voor een langer overzicht en raadpleeg de hoofdstukken op de grenzen van je tijdvak.',
    reference:source('OpenStax','World History Volume 1, to 1500','','Introduction en inhoudsopgave',
      'https://openstax.org/details/books/world-history-volume-1'),
    more:source('OpenStax','World History Volume 2, from 1400','','Introduction en inhoudsopgave',
      'https://openstax.org/details/books/world-history-volume-2'),
  },
];
