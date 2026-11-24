import { byLessonId, summaries } from './catalog.js?v=161';

const editorial = {
  'struct-gr-paleis': {
    title: 'De Egeïsche wereld en het Nabije Oosten, ca. 1600–800 v.Chr.',
    guide: 'Volg de verschillende paleisfasen op Kreta en het Griekse vasteland. Lees daarna over maritieme contacten, regionale breuken en bewoning in de vroege ijzertijd.',
    ordered: ['struct-gr-paleis', 'egeisch-kretenzische-centra', 'egeisch-kreta-1450', 'egeisch-myceense-paleizen',
      'egeisch-lineair-b-economie', 'egeisch-uiluburun-amarnanetwerk', 'egeisch-wilusa-hatti',
      'egeisch-transformaties-rond-1200', 'egeisch-vroege-ijzertijd'],
  },
  'acad-eerste-triumviraat': {
    title: 'Het Eerste Triumviraat en de nasleep',
    guide: 'Begin bij de belangen van de drie politici. Volg hoe steun bij verkiezingen en wetgeving leidde tot nieuwe militaire middelen. De laatste lessen behandelen burgeroorlog, dictatuur en de reacties na 44 v.Chr.',
    ordered: ['triumviraat-vorming-belangen', 'acad-eerste-triumviraat', 'triumviraat-consulaat-59',
      'triumviraat-luca-en-provincies', 'triumviraat-breuk-en-49', 'acad-pharsalus',
      'triumviraat-nasleep-dictatuur', 'acad-iden', 'acad-tweede-triumviraat'],
  },
  'karolingisch-macht-en-keizerschap': {
    title: 'Karel de Grote en de Karolingische wereld',
    guide: 'Lees eerst over politiek en oorlogvoering, daarna over domeinen en arbeid, en vervolgens over kerk en cultuur. De synthese verbindt die verklaringen. Het sluitstuk volgt de opvolging en macht rond 900.',
    ordered: ['karolingisch-macht-en-keizerschap', 'karolingisch-domeinen-en-arbeid', 'karolingisch-kerk-onderwijs-en-schrift',
      'karolingisch-synthese-hof-en-regios', 'karolingisch-opvolging-en-regionale-macht'],
  },
  'struct-me-crisis': {
    title: 'De Zwarte Dood, arbeid en regionale verschillen',
    guide: 'Vertrek van de demografische schok. Vergelijk daarna Engelse regelgeving met loonreeksen en uitkomsten uit andere regio’s.',
    ordered: ['struct-me-crisis', 'zwarte-dood-en-arbeid', 'middeleeuwen-pest-arbeidsvoorwaarden', 'middeleeuwen-pest-regionale-uitkomsten'],
  },
};

const byAnchor = new Map();
for (const part of summaries) {
  if (!part.anchor) continue;
  if (!byAnchor.has(part.anchor)) byAnchor.set(part.anchor, []);
  byAnchor.get(part.anchor).push(part.id);
}
for (const id of Object.keys(editorial)) if (!byAnchor.has(id)) byAnchor.set(id, []);

const programmes = [...byAnchor].flatMap(([anchor, parts]) => {
  const opening = byLessonId.get(anchor);
  if (!opening) return [];
  const custom = editorial[anchor];
  const order = [...new Set([...(custom?.ordered ?? [anchor]), ...parts])];
  return [{ anchor, track: opening.track, title: custom?.title ?? opening.title, guide: custom?.guide,
    parts: order.map(id => byLessonId.get(id)).filter(Boolean) }];
});
const programmesByLesson = new Map();
for (const programme of programmes) for (const part of programme.parts) {
  if (!programmesByLesson.has(part.id)) programmesByLesson.set(part.id, []);
  programmesByLesson.get(part.id).push(programme);
}

export const readingProgrammes = track => programmes.filter(programme => programme.track === track);
export function relatedProgrammes(lesson) {
  const direct = programmesByLesson.get(lesson.id) ?? [];
  const linked = (lesson.caseIds ?? []).flatMap(id => programmesByLesson.get(id) ?? []);
  return [...new Set([...direct, ...linked])];
}

export const programmeLessonHref = (id, anchor) => 'les/' + encodeURIComponent(id) + '/leesreeks/' + encodeURIComponent(anchor);

export function programmeJourney(lesson, anchor) {
  const programme = programmesByLesson.get(lesson.id)?.find(row => row.anchor === anchor);
  if (!programme) return;
  const index = programme.parts.findIndex(part => part.id === lesson.id);
  return {
    inRoute: true, title: 'Verder in de leesreeks', label: programme.title,
    back: 'paideia/' + programme.track, link: id => programmeLessonHref(id, programme.anchor),
    index, listSize: programme.parts.length, previous: programme.parts[index - 1], next: programme.parts[index + 1],
  };
}
