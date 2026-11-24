import { makePool, shuffled, TRACKS } from './learning.js?v=161';
import { essay } from './content/history-course-model.js?v=160';
import { historicalExamCases } from './content/history-exam-cases.js?v=161';
import { readingProgrammes } from './history-programmes.js?v=161';

function comparativeQuestion(lessons, type) {
  const lookUp = id => lessons.find(lesson => lesson.id === id);
  const base = lookUp('egeisch-lineair-b-economie');
  const other = lookUp(type === 'cumulative' ? 'karolingisch-domeinen-en-arbeid' : 'egeisch-kretenzische-centra');
  if (!base || !other) return;
  const question = makePool([base])[1].questions[0];
  const data = type === 'cumulative' ? [
    'Vergelijk hoe Pylos en een Karolingisch koninklijk domein de aanvoer van goederen organiseerden. Welke conclusies verschillen doordat je een administratief dossier met een voorschrift vergelijkt?',
    'De Pylische dossiers volgen betrokken plaatsen, goederen of productieopdrachten binnen een paleisnetwerk. Het Capitulare de villis stelt vast welke informatie beheerders aan het hof moesten leveren. Beide administraties maakten middelen controleerbaar. De Pylische registratie toont bepaalde uitgevoerde handelingen, terwijl het voorschrift verwachtingen beschrijft. Andere documenten en huishoudelijk bewijs helpen inschatten welk deel van productie of organisatie buiten beeld bleef.',
    [['Diachronie', 'Situeer beide gevallen chronologisch en institutioneel.', 'Vermeld de late bronstijd en het Karolingische hof.'],
     ['Vergelijking', 'Geef een concreet voorbeeld van een geregistreerde of voorgeschreven handeling per geval.', 'Kies voor beide gevallen dezelfde vraag, bijvoorbeeld wie een levering controleerde.'],
     ['Bronkritiek', 'Duid aan wat een bewaard dossier en wat een voorschrift rechtstreeks aantonen.', 'Leg uit welk materiaal nodig is om de uitvoering aan de norm te toetsen.']],
  ] : [
    'Vergelijk de organisatie van goederen in een neopalatiaals Kretenzisch centrum en in Myceens Pylos. Gebruik architectuur, Lineair A en Lineair B en geef aan hoe sterk elk soort bewijs is.',
    'In Kreta maken magazijnen en administratieve dragers opslag en registratie zichtbaar. De taal van Lineair A is grotendeels onbegrepen, waardoor functies en onderlinge verplichtingen moeilijk te identificeren zijn. In Pylos maken Griekstalige Lineair B-dossiers concrete categorieën van arbeid en overdracht zichtbaar. Beide gevallen vragen materieel bewijs buiten het paleis om te beoordelen hoeveel economie de instelling beheerde.',
    [['Chronologie', 'Plaats beide gevallen in hun eigen fase.', 'Vermijd één chronologie voor alle Kretenzische en Myceense paleizen.'],
     ['Bewijskracht', 'Leg uit wat opslagruimten, Lineair A en Lineair B afzonderlijk aantonen.', 'Verbind per bronvorm een waarneming aan een beperkte gevolgtrekking.'],
     ['Synthese', 'Formuleer een vergelijking van de bestuurlijke reikwijdte op basis van concrete criteria.', 'Maak duidelijk welke lokale bronnen extra informatie zouden geven.']],
  ];
  return { ...question, id: question.key + '/synthese-' + type, ...essay(...data) };
}

const tracks = ['greek', 'roman', 'medieval', 'earlymodern', 'history'];
const themes = [
  ['aegean', 'De Egeïsche wereld en het Nabije Oosten (1600–800 v.Chr.)', lesson => lesson.curriculum === 'aegean'],
  ['carolingian', 'De Karolingen (768–ca. 900)', lesson => lesson.id.startsWith('karolingisch-')],
  ...tracks.map(track => [track, TRACKS[track].name, lesson => lesson.track === track]),
  ...tracks.flatMap(track => readingProgrammes(track).filter(programme => programme.anchor !== 'struct-gr-paleis' &&
    programme.anchor !== 'karolingisch-macht-en-keizerschap').map(programme => {
      const ids = new Set(programme.parts.map(part => part.id));
      return [programme.anchor, programme.title, lesson => ids.has(lesson.id)];
    })),
];
const eligible = question => question.kind === 'open' ? Boolean(question.source && question.rubric?.length) :
  Boolean(question.evidence === 'application' && question.optionFeedback && question.source);
const checkedQuestions = lesson => makePool([lesson]).flatMap(item => [...item.questions, ...item.academic].filter(eligible));

function specialQuestions(lessons) {
  const byId = new Map(lessons.map(lesson => [lesson.id, lesson]));
  return historicalExamCases.filter(row => row.readings.every(id => byId.has(id))).map(({ id, readings, question }) => {
    const base = makePool([byId.get(readings[0])]).flatMap(item => item.questions).find(q => q.kind === 'open');
    return {
      id: base.key + '/' + id, key: base.key, lesson: base.lesson, topic: base.topic,
      title: base.title, track: base.track, label: base.label,
      source: base.source, ...question,
    };
  });
}

function bySkill(questions, skills, limit) {
  const selected = [];
  const used = new Set();
  for (const skill of skills) {
    if (selected.length >= limit) break;
    const remaining = questions.filter(q => !selected.includes(q) && q.historicalSkill === skill);
    const question = remaining.find(q => !used.has(q.lesson)) ?? remaining[0];
    if (!question) continue;
    used.add(question.lesson);
    selected.push(question);
  }
  for (const question of questions) {
    if (selected.length >= limit) break;
    if (!selected.includes(question)) selected.push(question);
  }
  return selected;
}

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
  const arranged = all ? selection : shuffled(selection);
  const byLesson = arranged.map(lesson => (all ? checkedQuestions(lesson) : shuffled(checkedQuestions(lesson))).filter(question =>
    type !== 'advanced' || question.kind === 'open' && question.historicalSkill !== 'situation'));
  const eligibleLessons = selection.filter(lesson => checkedQuestions(lesson).length);
  if (type === 'cumulative' && new Set(eligibleLessons.map(lesson => lesson.track)).size < 2) return;

  const questions = roundRobin(byLesson).sort((first, second) => Number(first.kind === 'open') - Number(second.kind === 'open'));
  const synthesis = comparativeQuestion(eligibleLessons, type);
  const cases = specialQuestions(eligibleLessons);
  const open = [...cases, ...(synthesis ? [{...synthesis, historicalSkill: 'synthesis'}] : []), ...questions.filter(q => q.kind === 'open')];
  if (!open.length) return;
  const objective = questions.filter(q => q.kind !== 'open');
  const skills = type === 'advanced' ? ['source', 'comparison', 'synthesis', 'explanation'] :
    ['explanation', 'source', 'comparison', 'synthesis', 'situation'];
  const selected = all ? [...objective, ...open] : [...objective.slice(0, 3), ...bySkill(open, skills, type === 'advanced' ? 4 : 3)];
  const title = type === 'cumulative' ? 'Cumulatief examen' :
    (type === 'advanced' ? 'Gevorderd examen' : 'Thematisch examen') + ' · ' + programme.name;
  return { title, questions: selected };
}


export function academicPreview(lessons, studied) {
  const tried = lessons.filter(lesson => studied.has(lesson.id) && tracks.includes(lesson.track));
  const eligible = (tried.length < 2 ? lessons : tried).filter(lesson => tracks.includes(lesson.track));
  const grouped = roundRobin(shuffled(eligible).map(lesson => shuffled(checkedQuestions(lesson))));
  const objective = grouped.filter(q => q.kind === 'choice').slice(0, 2);
  return [...objective, ...bySkill(grouped.filter(q => q.kind === 'open'), ['source', 'explanation', 'comparison'], 5 - objective.length)];
}


// A synced draft stores questions together with the learner's responses. Reserve room for those responses.
export function academicExamParts(questions) {
  const encoder = new TextEncoder();
  const parts = [[]];
  let bytes = 0;
  for (const question of questions) {
    const size = encoder.encode(JSON.stringify(question)).length + (question.kind === 'open' ? 7500 : 1500);
    if (bytes + size > 225_000 && parts.at(-1).length) {
      parts.push([]);
      bytes = 0;
    }
    parts.at(-1).push(question);
    bytes += size;
  }
  return parts;
}
