export const LANGUAGE_TOPICS = {
  fr: {
    labo: { title: 'Labo en practicum', icon: 'flask', text: 'Glaswerk, instrumenten, beschermingsmiddelen en metingen.' },
    officine: { title: 'Apotheek en stage', icon: 'cross', text: 'Geneesmiddelvormen, verpakkingen, voorschriften en voorraad.' },
    studie: { title: 'Campus en bibliotheek', icon: 'knowledge', text: 'Een boek vinden, een practicum regelen en een verslag schrijven.' },
    winkel: { title: 'Winkel en boodschappen', icon: 'bag', text: 'Producten, afdelingen, hoeveelheden en betalen.' },
    cafe: { title: 'Café en lunch', icon: 'cup', text: 'Eten en drinken bestellen, iets vragen en afrekenen.' },
  },
  it: {
    gesprek: { title: 'Kennismaken en praten', icon: 'language', text: 'Jezelf voorstellen, vragen stellen en vertellen over je dag.' },
    cafe: { title: 'Bestellen in Italië', icon: 'cup', text: 'Drank en eten vragen, keuzes toelichten en betalen.' },
    winkel: { title: 'Boodschappen en winkels', icon: 'bag', text: 'Hoeveelheden vragen, producten beschrijven en iets omruilen.' },
    onderweg: { title: 'Reizen en de weg vragen', icon: 'globe', text: 'De weg vinden, treinen nemen en om uitleg vragen.' },
    afspraak: { title: 'Plannen en afspreken', icon: 'check', text: 'Uren voorstellen, afspraken verplaatsen en vertellen wat er gebeurd is.' },
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
