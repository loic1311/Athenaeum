import { makePool, shuffled, TRACKS } from './learning.js?v=150';

const tracks = ['greek', 'roman', 'medieval', 'earlymodern', 'history'];
const themes = [
  ['aegean', 'De Egeïsche wereld en het Nabije Oosten (1600–800 v.Chr.)', lesson => lesson.curriculum === 'aegean'],
  ['carolingian', 'De Karolingen (768–ca. 900)', lesson => lesson.id.startsWith('karolingisch-')],
  ...tracks.map(track => [track, TRACKS[track].name, lesson => lesson.track === track]),
];
const eligible = question => question.kind === 'open' ? Boolean(question.source && question.rubric?.length) :
  Boolean(question.evidence === 'application' && question.optionFeedback && question.source);
const checkedQuestions = lesson => makePool([lesson]).flatMap(item => [...item.questions, ...item.academic].filter(eligible));

export function academicSyllabus(lessons) {
  const available = lessons.filter(lesson => tracks.includes(lesson.track) && checkedQuestions(lesson).length);
  return themes.map(([id, name, matches]) => ({ id, name, lessons: available.filter(matches) }))
    .filter(programme => programme.lessons.length);
}

function roundRobin(groups) {
  const result = [];
  const queues = groups.filter(group => group.length);
  while (queues.length) {
    for (let index = 0; index < queues.length; ) {
      const group = queues[index];
      result.push(group.shift());
      if (group.length) index++;
      else queues.splice(index, 1);
    }
  }
  return result;
}

export function academicExam(lessons, studied, type, theme, all = false) {
  const programme = academicSyllabus(lessons).find(row => row.id === theme);
  const selection = type === 'cumulative'
    ? lessons.filter(lesson => tracks.includes(lesson.track) && studied.has(lesson.id))
    : programme?.lessons ?? [];
  const byLesson = shuffled(selection).map(lesson => shuffled(checkedQuestions(lesson)).filter(question =>
    type !== 'advanced' || question.kind === 'open'));
  const eligibleLessons = selection.filter(lesson => checkedQuestions(lesson).length);
  if (type === 'cumulative' && new Set(eligibleLessons.map(lesson => lesson.track)).size < 2) return;

  const questions = roundRobin(byLesson).sort((first, second) => Number(first.kind === 'open') - Number(second.kind === 'open'));
  const open = questions.filter(q => q.kind === 'open');
  if (!open.length) return;
  const objective = questions.filter(q => q.kind !== 'open');
  const selected = all ? questions : [...objective.slice(0, 3), ...open.slice(0, type === 'advanced' ? 4 : 3)];
  const title = type === 'cumulative' ? 'Cumulatief examen' :
    (type === 'advanced' ? 'Gevorderd examen' : 'Thematisch examen') + ' · ' + programme.name;
  return { title, questions: selected };
}
