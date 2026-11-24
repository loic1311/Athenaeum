import { TRACKS, makePool, practiceBalance, practiceQuestions, practiceTopic, recentPractice } from './learning.js?v=142';
import { instructionFor, practiceDifficulty, preferredDifficulty, startingDifficulty } from './practice.js?v=13r8';
import { hasStudyGuide, preparationFor, studyLevel } from './history-study.js';

export const PACE = {
  8: { units: 1, recall: 1, guided: 1, practice: 2, transfer: 1, exit: 1, reading: 3 },
  15: { units: 2, recall: 2, guided: 2, practice: 3, transfer: 1, exit: 1, reading: 5 },
  25: { units: 2, recall: 3, guided: 3, practice: 6, transfer: 2, exit: 2, reading: 8 },
  40: { units: 4, recall: 6, guided: 5, practice: 13, transfer: 3, exit: 4, reading: 12 },
};

export const STAGES = {
  recall: { title: 'Voorkennis ophalen', desc: 'Haal eerst enkele begrippen op die je eerder hebt geoefend.' },
  read: { title: 'Nieuwe uitleg', desc: 'Lees de context, voorbeelden en belangrijkste begrippen.' },
  guided: { title: 'Begeleid oefenen', desc: 'Bouw het antwoord stap voor stap op. Open een tip als je vastloopt.' },
  practice: { title: 'Zelf oefenen', desc: 'Verwerk de leerstof met verschillende soorten vragen.' },
  transfer: { title: 'Toepassen', desc: 'Gebruik de stof in een voorbeeld, vergelijking of concrete situatie.' },
  exit: { title: 'Afronden', desc: 'Haal de kern op. Je antwoorden bepalen wat later opnieuw aan bod komt.' },
};

export const DAY_FOCI = {
  mix: 'Mijn gekozen leerpaden', ancient: 'Griekse en Romeinse oudheid',
  ...Object.fromEntries(Object.entries(TRACKS).map(([key, track]) => [key, track.name])),
};

export const DAY_MODES = {
  auto: 'Afwisselen op basis van je voortgang', lesson: 'Een nieuw onderwerp', concepts: 'Begrippen oefenen',
  sources: 'Bronnen analyseren', review: 'Cumulatieve herhaling', academic: 'Academische verdieping',
};

export function dayKey(date = new Date()) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
}

export function archivedPlans(records) {
  return records.filter(row => row.kind === 'draft' && row.data?.daily)
    .map(row => row.data.daily).sort((a, b) => b.date.localeCompare(a.date));
}

function hash(text) {
  let number = 2166136261;
  for (let i = 0; i < text.length; i++) number = Math.imul(number ^ text.charCodeAt(i), 16777619);
  number ^= number >>> 16;
  number = Math.imul(number, 0x7feb352d);
  number ^= number >>> 15;
  return (number ^ (number >>> 16)) >>> 0;
}

const SHORT = ['choice', 'fill', 'listen', 'card', 'match', 'order'];

function picker(history, seed, noAudio, exclude = [], recent = () => 0) {
  const usedIds = new Set(exclude);
  const usedText = new Set();
  const counts = new Map();
  const diversity = new Map();
  const balance = practiceBalance();
  return (items, count, kinds, { priority = 0, preferKind = false, difficulty, level, adaptive = false, eligible = () => true } = {}) => {
    if (count <= 0) return [];
    const rows = items.map((item, i) => ({
      i, key: item.key, target: adaptive ? preferredDifficulty(item, history) :
        difficulty === undefined ? undefined : Math.max(difficulty, startingDifficulty(item)),
      variants: practiceQuestions(item).filter(q => kinds.includes(q.kind) && (!noAudio || q.kind !== 'listen') && eligible(q)),
    }));
    const questions = [];
    const touched = new Set();
    while (questions.length < count) {
      let best;
      for (const row of rows) {
        if (touched.has(row.key)) continue;
        for (const q of row.variants) {
          const text = q.text + '\0' + q.answer;
          if (usedIds.has(q.id) || usedText.has(text)) continue;
          const repeatedGoal = q.kind === 'match' ? Math.max(...q.pairs.map(pair => counts.get(pair.key) || 0)) : counts.get(row.key) || 0;
          const value = repeatedGoal * 30 + Math.min(row.i * priority, 16) + balance.score(q) + recent(q)
            + (history.states.get(row.key)?.lastQuestion === q.id ? 27 : 0)
            + (history.seen.has(q.id) ? 7 : 0)
            + (diversity.get(q.kind) || 0) * 5
            + (row.target === undefined ? 0 : Math.abs(practiceDifficulty(q) - row.target) * 21)
            + (level && studyLevel(q) ? Math.abs(studyLevel(q) - level) * 28 : 0)
            + kinds.indexOf(q.kind) * (preferKind ? 32 : 1)
            + hash(seed + ':' + q.id + ':' + questions.length) / 4294967296 * (priority ? 6 : 20);
          if (!best || value < best.value) best = { q, value, text };
        }
      }
      if (!best) break;
      const {q, text} = best;
      for (const key of q.kind === 'match' ? q.pairs.map(pair => pair.key) : [q.key]) {
        touched.add(key);
        counts.set(key, (counts.get(key) || 0) + 1);
      }
      usedIds.add(q.id);
      usedText.add(text);
      balance.add(q);
      diversity.set(q.kind, (diversity.get(q.kind) || 0) + 1);
      questions.push(q);
    }
    return questions;
  };
}

export function drillQuestions(pool, history, { limit = 15, noAudio = false, seed = String(Date.now()), compact = false, exclude } = {}) {
  const pick = picker(history, seed, noAudio, exclude, recentPractice(pool, history));
  const result = [];
  if (limit >= 2 && pool.every(item => item.track === 'fr') && pool.some(startingDifficulty)) {
    result.push(...pick(pool, 1, ['choice'], { eligible: q => q.promptLanguage === 'fr' }));
    result.push(...pick(pool, 1, ['fill'], { eligible: q => q.skill === 'grammar' }));
  }
  result.push(...pick(pool, Math.min(2, limit) - result.length, ['choice', 'fill', 'card', 'match', 'order', 'listen'], { difficulty: 0 }));
  if (result.length < limit && !result.some(q => ['match','order'].includes(q.kind))) {
    result.push(...pick(pool, 1, ['match', 'order']));
  }
  const applied = compact ? [] : pick(pool, Math.min(3, Math.floor(limit / 5)), ['open']);
  while (result.length + applied.length < limit) {
    const next = pick(pool, limit - result.length - applied.length, compact ? SHORT : [...SHORT, 'open'], { difficulty: 1 });
    if (!next.length) break;
    result.push(...next);
  }
  return [...result, ...applied];
}

function lessonIndex(lessons, history, archive, read, due) {
  const times = new Map();
  const recentTracks = new Map();
  const recentTopics = new Map();
  const topics = new Map(lessons.map(lesson => [lesson.id, practiceTopic(lesson)]));
  for (const [i, plan] of archive.entries()) {
    for (const lesson of plan.units.filter(unit => plan.readUnits?.includes(unit.id) ?? plan.completed)) {
      times.set(lesson.id, (times.get(lesson.id) || 0) + 1);
      if (i >= 6) continue;
      recentTracks.set(lesson.track, (recentTracks.get(lesson.track) || 0) + 1);
      const topic = topics.get(lesson.id);
      if (topic) recentTopics.set(topic, (recentTopics.get(topic) || 0) + 1);
    }
  }
  const groups = new Map();
  for (const lesson of lessons) {
    const timesRead = times.get(lesson.id) || 0;
    const fresh = !timesRead && !history.lessons.has(lesson.id) && !read.has(lesson.id);
    if (!groups.has(lesson.track)) groups.set(lesson.track, []);
    const topic = topics.get(lesson.id);
    groups.get(lesson.track).push({ lesson, topic, fresh, timesRead, recent: recentTopics.get(topic) ?? 0, due: due.get(lesson.id) ?? 0 });
  }
  return [...groups].map(([key, units]) => ({
    key, units, fresh: units.some(u => u.fresh), recent: recentTracks.get(key) || 0,
  }));
}

function chooseLessons(groups, count, salt, mode) {
  const priority = unit => mode === 'review' ? unit.due * 5 + Number(!unit.fresh) :
    mode === 'lesson' ? Number(unit.fresh) : (preparationFor(unit.lesson)?.seminar ? 1 : 0);
  const ranked = groups.map(group => ({ ...group, priority: Math.max(...group.units.map(priority)) }));
  const sorted = ranked.sort((a,b) => b.priority - a.priority || Number(b.fresh) - Number(a.fresh) ||
    a.recent - b.recent || hash(salt+a.key) - hash(salt+b.key));
  const results = [];
  const used = new Set();
  const topics = new Set();
  while (results.length < count) {
    let added = 0;
    for (const { units } of sorted) {
      const remaining = units.filter(u => !used.has(u.lesson.id));
      if (!remaining.length) continue;
      const [chosen] = remaining.sort((a,b) => priority(b) - priority(a) || Number(topics.has(a.topic)) - Number(topics.has(b.topic)) ||
        a.recent - b.recent || Number(b.fresh) - Number(a.fresh) || a.timesRead - b.timesRead ||
        hash(salt + a.lesson.id) - hash(salt + b.lesson.id));
      results.push(chosen);
      used.add(chosen.lesson.id);
      topics.add(chosen.topic);
      added++;
      if (results.length === count) break;
    }
    if (!added) break;
  }
  return results;
}

function chooseMode(requested, minutes, archive, due, lessons) {
  if (requested !== 'auto') return requested;
  const modes = ['lesson'];
  if (lessons.some(lesson => preparationFor(lesson)?.prerequisites.length)) modes.push('concepts');
  if (minutes >= 15 && lessons.some(lesson => preparationFor(lesson)?.seminar)) modes.push('sources', 'academic');
  if (due.size) modes.push('review');
  const previous = archive.find(plan => plan.completed)?.mode;
  if (due.size && previous !== 'review' && archive.length % 3 === 2) return 'review';
  return modes[(modes.indexOf(previous) + 1) % modes.length];
}

export function planDay(lessons, history, archive, {
  date = dayKey(), minutes = 15, focus = 'mix', now = Date.now(), noAudio = false, learner = '',
  read = new Set(), mode = 'auto',
} = {}) {
  if (!lessons.length) return null;
  const config = PACE[minutes] ?? PACE[15];
  const seenLessons = new Set([...history.states.keys()].map(key => key.split('/')[0]));
  const pool = makePool(lessons.filter(lesson => seenLessons.has(lesson.id)));
  const due = pool.filter(item => history.states.get(item.key)?.due <= now).sort((a,b) =>
    Number(!!history.states.get(b.key).needsReview) - Number(!!history.states.get(a.key).needsReview) ||
    history.states.get(a.key).due - history.states.get(b.key).due);
  const dueLessons = new Map();
  for (const item of due) dueLessons.set(item.lesson, (dueLessons.get(item.lesson) ?? 0) + 1);
  const selectedMode = chooseMode(mode, minutes, archive, dueLessons, lessons);
  const withSeminar = lesson => Boolean(preparationFor(lesson)?.seminar);
  const withConcepts = lesson => Boolean(preparationFor(lesson)?.prerequisites.length);
  const specialize = {
    concepts: withConcepts, sources: lesson => withSeminar(lesson) || Boolean(lesson.primary),
    academic: lesson => withSeminar(lesson) || Boolean(lesson.structure) && hasStudyGuide(lesson),
    review: lesson => dueLessons.has(lesson.id),
  }[selectedMode];
  const matching = specialize ? lessons.filter(specialize) : lessons;
  const actualMode = matching.length ? selectedMode : 'lesson';
  const groups = lessonIndex(matching.length ? matching : lessons, history, archive, read, dueLessons);
  const signatures = new Set(archive.map(p => p.signature));
  const knownConcepts = [...(history.concepts ?? [])].filter(([, evidence]) => evidence.recall).map(([id]) => id);
  const mastered = new Set(knownConcepts);
  const previousMisses = due.filter(item => history.states.get(item.key).needsReview)
    .map(item => history.states.get(item.key).lastQuestion).filter(Boolean);
  const recent = recentPractice(pool, history, now);
  const canRecall = key => {
    const state = history.states.get(key);
    return state?.attempted && (read.has(key.split('/')[0]) || state.recognized || state.recallCount || state.applied);
  };
  let plan;
  for (let attempt = 0; attempt < 24; attempt++) {
    const salt = [learner,date,minutes,focus,actualMode,attempt].join(':');
    const chosen = chooseLessons(groups, config.units, salt, actualMode);
    const units = chosen.map(({lesson,fresh}) => ({id:lesson.id,title:lesson.title,track:lesson.track,fresh}));
    const goals = makePool(chosen.map(row => row.lesson));
    const pick = picker(history, salt, noAudio, previousMisses, recent);
    const recall = pick(due, config.recall, SHORT, {priority:2, adaptive:true, eligible: q =>
      canRecall(q.key) && (q.kind !== 'match' || q.pairs.every(pair => canRecall(pair.key))) &&
      (q.prerequisites ?? []).every(id => mastered.has(id) || read.has(q.lesson)),
    });
    const guided = pick(goals, config.guided, ['choice','match','fill','card','order'],
      {difficulty:0, eligible:q => studyLevel(q) < 3});
    const advanced = actualMode === 'academic' ? 4 : actualMode === 'sources' ? 3 : 0;
    const transferKinds = minutes <= 8 && !advanced ? ['order','fill','card','choice'] : ['open','choice','order','fill','listen','card'];
    const definition = actualMode === 'concepts' ? pick(goals, 1, ['open'], { eligible:q => q.assessment === 'definition' }) : [];
    const seminar = advanced ? pick(goals, config.transfer, transferKinds, {
      level:advanced, eligible:q => studyLevel(q) === advanced && Boolean(q.evidenceNotes?.length || q.passage),
    }) : [];
    const applied = [...definition, ...seminar, ...pick(goals, config.transfer - definition.length - seminar.length, transferKinds, {
      level: advanced || (minutes > 8 ? 3 : 2), preferKind: !advanced,
      eligible: q => actualMode !== 'sources' || q.evidenceNotes?.length || q.passage || studyLevel(q) >= 3,
    })];
    const exit = pick(goals, config.exit, ['card','fill','choice','listen','order','match'], {difficulty:1});
    const practice = pick(goals, Math.min(1,config.practice), ['match','order']);
    practice.push(...pick(goals, config.practice - practice.length, SHORT, {difficulty:1}));
    while (practice.length < config.practice) {
      const next = pick(goals, config.practice - practice.length, SHORT, {difficulty:1, level: actualMode === 'concepts' ? 1 : 0});
      if (!next.length) break;
      practice.push(...next);
    }
    const stages = [
      {id:'recall', questions:recall}, {id:'read', questions:[], minutes:config.reading},
      {id:'guided', questions:guided}, {id:'practice', questions:practice},
      {id:'transfer', questions:applied}, {id:'exit', questions:exit},
    ];
    const signature = [units.map(unit => unit.id).sort().join('|'),
      ...stages.map(stage => stage.questions.map(q => q.id).sort().join('|'))].join('~');
    const selectedConcepts = new Set(chosen.flatMap(({ lesson }) => preparationFor(lesson)?.prerequisites ?? []));
    plan = {date,focus,minutes,mode:actualMode,units,stages,signature,due:due.length,cursor:0,completed:false,results:{},
      knownConcepts:knownConcepts.filter(id => selectedConcepts.has(id))};
    if (!signatures.has(signature)) return plan;
  }
  return plan;
}

export function prepareDay(plan, available, at, date = dayKey(new Date(at))) {
  if (plan.stages[plan.cursor]?.id !== 'read') return plan;
  const readUnits = plan.units.filter(unit => available.has(unit.id)).map(unit => unit.id);
  if (!readUnits.length) return plan;
  const readable = new Set(readUnits);
  const stages = plan.stages.map((stage, index) => index <= plan.cursor ? stage : {
    ...stage, questions: stage.questions.filter(q => readable.has(q.lesson) && (q.cases ?? []).every(c =>
      c.title === q.title || plan.units.some(unit => unit.title === c.title && readable.has(unit.id)))),
  });
  return advanceDay({ ...plan, readUnits, readDay:date, readAt:at, stages }, 'read');
}

export function advanceDay(plan, stepId, result) {
  if (plan.stages[plan.cursor]?.id !== stepId) return plan;
  const results = { ...plan.results, ...(result ? { [stepId]: result } : {}) };
  const cursor = plan.cursor + 1;
  const completed = cursor >= plan.stages.length;
  const stages = completed ? plan.stages.map(({ questions, ...stage }) => ({ ...stage, count: questions.length })) : plan.stages;
  return { ...plan, cursor, results, completed, stages };
}

const approaches = {
  choice: [
    'Formuleer eerst in je eigen woorden wat de vraag van je vraagt. Lees dan alle opties en streep voor jezelf de opties weg die een ander probleem beantwoorden.',
    'Vergelijk de opties die overblijven op hun onderwerp, reikwijdte of voorwaarden. Kies de formulering die volledig wordt gesteund door de opgave.',
  ],
  fill: [
    'Lees eerst de hele zin. Bepaal of je een begrip, een getal of een grammaticale vorm nodig hebt.',
    'Lees de zin opnieuw met je eigen voorstel. Controleer of het voorstel klopt met wat vóór en na de lege plaats staat.',
  ],
  card: [
    'Bedenk eerst een kernzin waarin je het begrip of de uitdrukking in je eigen woorden beschrijft.',
    'Als je vastloopt, denk dan aan een situatie waarin je het begrip zou gebruiken. Benoem welk kenmerk daar belangrijk is.',
  ],
  open: [
    'Splits de opdracht op in deelvragen. Begin met een korte kernzin en maak daarna duidelijk hoe je tot je antwoord komt.',
    'Controleer of elke zin iets toevoegt. Gebruik een concreet gegeven uit de opgave wanneer je een oordeel of voorstel moet motiveren.',
  ],
  listen: [
    'Luister eerst naar de zin als geheel en bepaal waar hij over gaat.',
    'Speel de zin opnieuw af en luister naar de woordgrenzen. Controleer bij het typen ook kleine woorden en uitgangen.',
  ],
  match: [
    'Begin bij een combinatie waarover je vrij zeker bent. Vergelijk daarna de betekenissen die nog overblijven.',
    'Let op het verschil tussen gelijkaardige opties. Geef elke combinatie een plaats voordat je alles controleert.',
  ],
  order: [
    'Lees alle bouwstenen. Bepaal welk verband ertussen moet staan voordat je iets verplaatst.',
    'Lees de voorlopige volgorde als één geheel. Controleer of elke overgang klopt met de zin of de gedachtegang.',
  ],
};

export function tipsFor(question) {
  const instruction = instructionFor(question);
  if (question.hints?.length === 2) return [instruction, ...question.hints];
  if (question.skill === 'grammar') return [instruction,
    'Zoek het onderwerp en het woord of zinsdeel dat de gevraagde vorm mee bepaalt. Kijk ook naar de tijd en de functie van de bijzin.',
    'Lees daarna de hele zin met je voorstel. Controleer de vervoeging of overeenkomst en kijk of de zin de bedoelde relatie uitdrukt.',
  ];
  if (question.skill === 'vocabulary' && question.kind === 'fill') return [instruction,
    'Bedenk eerst in welke situatie je het gevraagde woord zou gebruiken. Haal dan de uitdrukking op in de doeltaal.',
    'Controleer de betekenis, het lidwoord als dat erbij hoort en de spelling. Lees je voorstel als één uitdrukking.',
  ];
  const steps = approaches[question.kind];
  return steps ? [instruction, ...steps] : [];
}
