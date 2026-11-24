import { concepts } from './content/study-concepts.js';
import { seminars } from './content/history-seminars.js';

export const STUDY_LEVELS = ['Basiskennis', 'Historisch begrip', 'Universitaire toepassing', 'Academische verdieping'];
const historicalTracks = new Set(['greek', 'roman', 'medieval', 'earlymodern', 'history', 'knowledge', 'traditio']);
export const hasStudyGuide = lesson => historicalTracks.has(lesson.track);

const guides = new Map(seminars.flatMap(seminar => Object.entries(seminar.lessons).map(([id, goal]) => [id, { ...seminar, goal }])));
const terms = new Map(Object.values(concepts).flatMap(concept => [concept.label, ...concept.aliases]
  .map(term => [term.toLocaleLowerCase('nl'), concept.id])));
const escapeRegExp = RegExp.escape ?? (value => value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&'));
const glossary = [...terms.keys()].sort((a, b) => b.length - a.length).map(escapeRegExp).join('|');
const pattern = new RegExp('(?<![\\p{L}\\p{N}])(?:' + glossary + ')(?![\\p{L}\\p{N}])', 'giu');

export const studyConcept = id => Object.hasOwn(concepts, id) ? concepts[id] : undefined;
export const annotatedTerms = text => [...String(text ?? '').matchAll(pattern)].map(match => ({
  text: match[0], index: match.index, id: terms.get(match[0].toLocaleLowerCase('nl')),
}));

function conceptsIn(...texts) {
  return [...new Set(texts.flatMap(text => annotatedTerms(text).map(term => term.id)))];
}

const preparedLessons = new WeakMap();
export function preparationFor(lesson) {
  if (!hasStudyGuide(lesson)) return undefined;
  if (preparedLessons.has(lesson)) return preparedLessons.get(lesson);
  const seminar = guides.get(lesson.id);
  const introduced = conceptsIn(lesson.title, lesson.summary,
    ...(lesson.structure ?? []).flatMap(section => [section.lead, section.text]),
    ...lesson.items.flatMap(item => [item.label, item.explanation, ...item.questions.flatMap(q => [q.text, q.context])]));
  const prerequisites = [...new Set([...(seminar?.prerequisites ?? []), ...introduced])];
  const preparation = { seminar, prerequisites };
  preparedLessons.set(lesson, preparation);
  return preparation;
}

export function studyLevel(question) {
  if (question.studyLevel) return question.studyLevel;
  if (!hasStudyGuide(question)) return 0;
  if (question.cases?.length || question.passage || question.kind === 'open' && question.criteria?.length >= 2) return 3;
  if (question.kind === 'open' || question.kind === 'order') return 2;
  return 1;
}

export function prerequisitesFor(lesson, question) {
  if (!hasStudyGuide(lesson)) return [];
  return [...new Set([
    ...(question.prerequisites ?? []), ...conceptsIn(question.text, question.context, question.label),
  ])];
}

export function lessonSources(lesson) {
  const seminar = preparationFor(lesson)?.seminar;
  const references = [...(lesson.sources ?? []), ...(seminar?.preparation ?? []).map(block => block[2]),
    ...(seminar?.evidence ?? []).map(block => block[2])];
  return [...new Map(references.map(source => [source.title + '/' + source.locator, source])).values()];
}

function termExercises(concept) {
  const alternatives = concept.related.slice(0, 2).map(id => studyConcept(id).definition);
  return [
    {
      id: 'herken-' + concept.id, kind: 'choice', studyLevel: 1, text: 'Welke omschrijving past bij ‘' + concept.label.toLocaleLowerCase('nl') + '’?',
      options: [concept.definition, ...alternatives], answer: concept.definition, concept: concept.id, source: concept.source,
      feedback: concept.context,
    },
    {
      id: 'begrip-' + concept.id, kind: 'fill', studyLevel: 1, text: 'Welk begrip wordt hier omschreven?',
      context: concept.definition, answer: concept.label, concept: concept.id, source: concept.source,
      feedback: concept.context, hints: ['Bepaal of de omschrijving een instelling, bron, proces of methode beschrijft.',
        'Haal de vakterm op die in de uitleg bij deze omschrijving stond.'],
    },
    {
      id: 'definitie-' + concept.id, kind: 'open', studyLevel: 2, concept: concept.id, assessment: 'definition',
      text: 'Leg in je eigen woorden uit wat ‘' + concept.label.toLocaleLowerCase('nl') + '’ betekent en geef een concreet voorbeeld.',
      answer: concept.definition + ' ' + concept.example, source: concept.source,
      rubric: [
        { label: 'Definitie', expected: concept.definition, revision: 'Haal de kern uit de begripsfiche en laat die in één eigen zin terugkomen.' },
        { label: 'Voorbeeld', expected: 'Kies een concrete situatie en licht toe welk kenmerk van het begrip er zichtbaar wordt.',
          revision: 'Voeg plaats, periode, actoren of een bron toe en verbind die met de definitie.' },
      ],
    },
  ];
}

export function studyExercises(lesson) {
  const prepared = preparationFor(lesson);
  if (!prepared) return new Map();
  const { seminar, prerequisites } = prepared;
  const exercises = new Map();
  if (seminar) {
    exercises.set(seminar.goal, seminar.questions.map(question => ({
      ...question, source: seminar.evidence[0][2], evidenceNotes: seminar.evidence,
      prerequisites: seminar.prerequisites,
    })));
  }
  // Use the authored prerequisite first. Elsewhere only generate a question for a central lesson term.
  const central = seminar?.prerequisites[0] ?? conceptsIn(lesson.title, ...lesson.items.map(item => item.label))[0];
  if (central && prerequisites.includes(central)) {
    const item = lesson.items.find(item => conceptsIn(item.label).includes(central)) ?? lesson.items[0];
    exercises.set(item.id, [...(exercises.get(item.id) ?? []), ...termExercises(studyConcept(central))]);
  }
  return exercises;
}
