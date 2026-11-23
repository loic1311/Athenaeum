export const LANGUAGE_TOPICS = {
  fr: {
    basis: {title: 'Eerste woorden Frans', icon: 'language', text: 'Van klank en begroeting naar een eerste eigen zin.'},
    labo: { title: 'Labo en practicum', icon: 'flask', text: 'Glaswerk, instrumenten, beschermingsmiddelen en metingen.' },
    officine: { title: 'Apotheek en stage', icon: 'cross', text: 'Geneesmiddelvormen, verpakkingen, voorschriften en voorraad.' },
    studie: { title: 'Campus en bibliotheek', icon: 'knowledge', text: 'Een boek vinden, een practicum regelen en een verslag schrijven.' },
    winkel: { title: 'Winkel en boodschappen', icon: 'bag', text: 'Producten, afdelingen, hoeveelheden en betalen.' },
    cafe: { title: 'Café en lunch', icon: 'cup', text: 'Eten en drinken bestellen, iets vragen en afrekenen.' },
  },
  it: {
    basis: {title: 'Eerste woorden Italiaans', icon: 'language', text: 'Begroet iemand, herken een woord en beschrijf een voorwerp.'},
    gesprek: { title: 'Kennismaken en praten', icon: 'language', text: 'Jezelf voorstellen, vragen stellen en vertellen over je dag.' },
    cafe: { title: 'Bestellen in Italië', icon: 'cup', text: 'Drank en eten vragen, keuzes toelichten en betalen.' },
    winkel: { title: 'Boodschappen en winkels', icon: 'bag', text: 'Hoeveelheden vragen, producten beschrijven en iets omruilen.' },
    onderweg: { title: 'Reizen en de weg vragen', icon: 'globe', text: 'De weg vinden, treinen nemen en om uitleg vragen.' },
    afspraak: { title: 'Plannen en afspreken', icon: 'check', text: 'Uren voorstellen, afspraken verplaatsen en vertellen wat er gebeurd is.' },
  },
  la: {
    schrift:{title:'Schrift en eerste zinnen',text:'Lees de letters en ontdek wie wat doet.'},
    vormen:{title:'Naamwoorden en werkwoorden',text:'Verbuig, vervoeg en bepaal de functie van een woord.'},
    syntaxis:{title:'Zinsbouw',text:'Ontleed mededelingen en leg het verband tussen zinnen.'},
    lectuur:{title:'Bronnen lezen',text:'Vertaal proza, redevoering en poëzie uit een gecontroleerde editie.'},
  },
  grc: {
    schrift:{title:'Alfabet en leeswijze',text:'Herken en schrijf de 24 letters en lees de diakritische tekens.'},
    vormen:{title:'Attische vormen',text:'Verbind naamval, persoon en aspect met hun functie.'},
    syntaxis:{title:'Attische zinsbouw',text:'Ontleed participia, bijzinnen en de verhoudingen tussen handelingen.'},
    lectuur:{title:'Auteurs en taalvarianten',text:'Lees Attisch proza en vergelijk dat met epos en koinè.'},
  },
};
export const LANGUAGE_SKILLS = {
  vocabulary: 'Woordenschat',
  grammar: 'Grammatica',
  sentence: 'Zinnen maken',
};

export function isLanguageTopic(track, topic) {
  return Object.hasOwn(LANGUAGE_TOPICS[track] ?? {}, topic);
}
