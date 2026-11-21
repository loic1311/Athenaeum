import { practiceVariants, practiceDifficulty, preferredDifficulty } from './practice.js?v=13r1';

export const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'];
export const ROUTES = {
  leven: 'Dagelijks leven', werk: 'Werken', studie: 'Studeren', labo: 'In het labo', officine: 'Apotheek',
  winkel: 'In de winkel', cafe: 'Op café', gesprek: 'Gesprekken', onderweg: 'Onderweg', afspraak: 'Afspraken',
};
export const TRACKS = {
  greek: { name: 'Griekse oudheid', icon: 'greek', section: 'history', desc: 'Van de archaïsche polis tot Griekse steden onder Romeins gezag.' },
  roman: { name: 'Romeinse oudheid', icon: 'roman', section: 'history', desc: 'Republiek, Rijk, samenleving en de manier waarop we die kennen.' },
  history: { name: 'Algemene geschiedenis', icon: 'globe', section: 'history', desc: 'Grote veranderingen en verbanden door de eeuwen heen.' },
  knowledge: { name: 'Algemene kennis', icon: 'knowledge', section: 'history', desc: 'Begrippen om cijfers, nieuws en de wereld beter te begrijpen.' },
  it: { name: 'Italiaans', icon: 'italian', section: 'language', lang: 'it-IT', desc: 'Leer woorden en grammatica waarmee je zelf kunt spreken en zinnen maken.' },
  fr: { name: 'Frans', icon: 'french', section: 'language', lang: 'fr-FR', desc: 'Frans voor het labo, de apotheek, de campus en het dagelijks leven.' },
};

export const DAY = 86_400_000;
export const KINDS = { choice: 'Meerkeuze', fill: 'Invullen', card: 'Flashcard', open: 'Open vraag', listen: 'Luisteren' };
export const EXAM_GOALS = { week: 2, month: 4 };
const REVIEW_STEPS = [0, 1, 3, 7, 14, 30, 60, 120];
const lessonPools = new WeakMap();

export function shuffled(values) {
  const copy = [...values];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function normalize(value, strict) {
  const text = String(value ?? '').toLowerCase().normalize('NFD');
  const accents = strict ? text.normalize('NFC') : text.replace(/\p{M}/gu, '');
  return accents.replace(/['’ʼ]/g, ' ').replace(/[^\p{L}\p{N}]+/gu, ' ').trim().replace(/\s+/g, ' ');
}

export function isCorrect(question, response) {
  if (question.kind === 'choice' && question.options?.length) return response === question.answer;
  const answer = normalize(response, question.strict);
  return !!answer && [question.answer, ...(question.accepted ?? [])].some(value => normalize(value, question.strict) === answer);
}

export function hasAccentError(question, response) {
  return Boolean(question.strict && !isCorrect(question, response) && isCorrect({ ...question, strict:false }, response));
}

export function makePool(lessons) {
  return lessons.flatMap(lesson => {
    if (lessonPools.has(lesson)) return lessonPools.get(lesson);
    const language = TRACKS[lesson.track]?.lang;
    const variants = practiceVariants(lesson, language);
    const pool = lesson.items.map((item, index) => {
      const key = lesson.id + '/' + item.id;
      const source = lesson.sources?.[item.source ?? (language && !lesson.languageTopic ? -1 : 0)];
      const questionData = (question, id) => ({
        ...question, id: key + '/' + id, key, lesson: lesson.id, title: lesson.title,
        track: lesson.track, label: item.label, explanation: item.explanation,
        source: question.source ?? source, language,
      });
      const questions = item.questions.map(questionData);
      const practice = variants[index].map(question => questionData(question, question.variant));
      return { key, track: lesson.track, level: lesson.level, route: lesson.route, lesson: lesson.id, questions, practice };
    });
    lessonPools.set(lesson, pool);
    return pool;
  });
}

export const practiceQuestions = item => [...item.questions, ...(item.practice ?? [])];

export function historyOf(records) {
  const states = new Map();
  const seen = new Map();
  const lessons = new Set();
  const reviews = records.filter(record => record.kind === 'review').sort((a, b) => a.at - b.at || a.id.localeCompare(b.id));
  for (const record of reviews) {
    const { key, question, lesson, rating } = record.data;
    const current = states.get(key) ?? { stage: 0, count: 0 };
    const stage = rating === 'again' ? 0 : rating === 'help' ? Math.min(1, current.stage) : Math.min(REVIEW_STEPS.length - 1, current.stage + (rating === 'easy' ? 2 : 1));
    const wait = rating === 'help' ? 6 * 60 * 60_000 : stage === 0 ? 45 * 60_000 : REVIEW_STEPS[stage] * DAY;
    states.set(key, { stage, count: current.count + 1, due: record.at + wait, last: record.at, lastQuestion: question });
    if (question) seen.set(question, record.at);
    if (lesson) lessons.add(lesson);
  }
  return { states, seen, lessons };
}

function questionFor(item, history, options = {}) {
  const current = history.states.get(item.key);
  const variants = options.learning ? practiceQuestions(item) : item.questions;
  const allowed = variants.filter(q => (!options.objective || ['choice', 'fill'].includes(q.kind))
      && (!options.exclude || !options.exclude.has(q.id))
      && (!options.short || q.kind !== 'open') && (!options.noAudio || q.kind !== 'listen'));
  return shuffled(allowed).sort((a, b) => {
    const open = options.preferOpen ? Number(b.kind === 'open') - Number(a.kind === 'open') : 0;
    const aSame = a.id === current?.lastQuestion;
    const bSame = b.id === current?.lastQuestion;
    const support = options.difficulty;
    const difference = support === undefined ? 0 :
      Math.abs(practiceDifficulty(a) - support) - Math.abs(practiceDifficulty(b) - support);
    const own = options.preferOriginal ? Number(!!a.variant) - Number(!!b.variant) : 0;
    return open || difference || Number(aSame) - Number(bSame) ||
      (history.seen.get(a.id) ?? 0) - (history.seen.get(b.id) ?? 0) || own;
  })[0];
}

export function quickQuestions(pool, history, { limit = 3, now = Date.now(), extra = false, noAudio = false } = {}) {
  const due = pool.filter(item => (history.states.get(item.key)?.due ?? Infinity) <= now)
    .sort((a, b) => history.states.get(a.key).due - history.states.get(b.key).due);
  // Interleave the first unseen goals across courses instead of exhausting one course.
  const unseen = pool.filter(item => !history.states.has(item.key));
  const byTrack = new Map();
  for (const item of unseen) {
    if (!byTrack.has(item.track)) byTrack.set(item.track, []);
    byTrack.get(item.track).push(item);
  }
  const orderedTracks = shuffled([...byTrack.values()]);
  const newItems = [];
  for (let depth = 0; orderedTracks.some(items => items[depth]); depth++) {
    for (const items of orderedTracks) if (items[depth]) newItems.push(items[depth]);
    if (newItems.length >= limit * 3) break;
  }
  const candidates = [...due, ...newItems];
  if (extra) {
    const used = new Set(candidates.map(item => item.key));
    candidates.push(...pool.filter(item => !used.has(item.key)).sort((a, b) =>
      (history.states.get(a.key)?.last ?? 0) - (history.states.get(b.key)?.last ?? 0)));
  }
  return candidates.map(item => questionFor(item, history, {
    learning: true, short: true, noAudio, difficulty: preferredDifficulty(item, history),
    preferOriginal: !history.states.has(item.key),
  })).filter(Boolean).slice(0, limit);
}

export function lessonQuestions(pool, history, { noAudio = false } = {}) {
  const warmup = pool.slice(0, 3).map(item => questionFor(item, history, {
    learning: true, short: true, noAudio, difficulty: 0, preferOriginal: true,
  })).filter(Boolean);
  const exclude = new Set(warmup.map(q => q.id));
  const apply = [...pool.slice(3), ...pool.slice(0, 3)].map(item => questionFor(item, history, {
    learning: true, noAudio, exclude, difficulty: 1,
  })).filter(Boolean);
  return [...warmup, ...apply].slice(0, 6);
}

export function languageQuestions(pool, skill, history, now = Date.now()) {
  const bySkill = pool.map(item => ({
    key: item.key, questions: practiceQuestions(item).filter(q => q.skill === skill),
  })).filter(item => item.questions.length);
  if (skill === 'grammar') return bySkill.flatMap(item => item.questions);
  if (skill === 'sentence') {
    const questions = bySkill.flatMap(item => item.questions);
    return [...questions.filter(q => q.kind === 'order'), ...questions.filter(q => q.kind !== 'order')];
  }
  const priority = item => {
    const due = history.states.get(item.key)?.due;
    return due === undefined ? 1 : due <= now ? 0 : 2;
  };
  const rows = shuffled(bySkill).sort((a, b) => priority(a) - priority(b));
  const [first, ...rest] = rows;
  if (!first) return [];
  const recognize = first.questions.find(q => q.kind === 'choice');
  const matching = rest.flatMap(item => item.questions).find(q => q.kind === 'match' && q.pairs.every(pair => pair.key !== first.key));
  const seen = new Set([first.key, ...(matching?.pairs.map(pair => pair.key) ?? [])]);
  const recall = [...rest.filter(item => !seen.has(item.key)), ...rows.filter(item => seen.has(item.key))]
    .flatMap(item => item.questions.filter(q => q.kind === 'fill')).slice(0, matching ? 3 : 4);
  return [recognize, matching, ...recall].filter(Boolean);
}

export function examQuestions(pool, history, monthly = false) {
  const handled = pool.filter(item => history.states.has(item.key));
  const grouped = new Map();
  for (const item of shuffled(handled)) {
    if (!grouped.has(item.lesson)) grouped.set(item.lesson, []);
    grouped.get(item.lesson).push(item);
  }
  const ordered = [];
  const groups = [...grouped.values()];
  for (let depth = 0; groups.some(group => group[depth]); depth++) {
    for (const group of groups) if (group[depth]) ordered.push(group[depth]);
  }
  const limit = monthly ? 18 : 10;
  const required = EXAM_GOALS[monthly ? 'month' : 'week'];
  if (ordered.length < required) return [];
  return ordered.map((item, index) =>
    questionFor(item, history, { preferOpen: monthly ? index % 3 !== 0 : index % 3 === 2, noAudio: true }))
    .filter(Boolean).slice(0, limit);
}

export function placementQuestions(pool) {
  return LEVELS.flatMap(level => {
    const items = shuffled(pool.filter(item => item.level === level));
    const routes = new Set();
    const prioritized = items.filter(item => {
      if (routes.has(item.route)) return false;
      routes.add(item.route);
      return true;
    });
    const others = items.filter(item => !prioritized.includes(item));
    return [...prioritized, ...others].map(item => questionFor(item, { states: new Map(), seen: new Map() }, { objective: true }))
      .filter(Boolean).slice(0, 4).map(q => ({ ...q, level }));
  });
}

export const placementPassed = (correct, total) => total >= 3 && correct / total >= 0.75;

export function estimateLevel(questions, responses) {
  let recommended = 'A1';
  const rows = LEVELS.map(level => {
    const group = questions.map((q, index) => ({ q, index })).filter(({ q }) => q.level === level);
    const correct = group.filter(({ q, index }) => isCorrect(q, responses[index]?.response)).length;
    return { level, correct, total: group.length };
  });
  for (const row of rows) {
    if (!placementPassed(row.correct, row.total)) break;
    recommended = row.level;
  }
  return { recommended, rows };
}

export function levelFor(lesson, prefs) {
  return !lesson.level || lesson.level === (prefs[lesson.track] ?? 'A1');
}

export function formatSource(source) {
  if (!source) return '';
  return [source.author, source.title, source.year, source.locator].filter(Boolean).join(' · ');
}

export function tally(questions, answers) {
  let correct = 0, reviewed = 0;
  questions.forEach((question, index) => {
    const answer = answers[index];
    if (!answer || !answer.rating) return;
    reviewed++;
    if (answer.rating !== 'again') correct++;
  });
  return { total: questions.length, correct, reviewed };
}
