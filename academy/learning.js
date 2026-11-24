import { practiceVariants, practiceDifficulty, preferredDifficulty, startingDifficulty } from './practice.js?v=150';
import { independentlyCorrect } from './assessment.js?v=150';
import { prerequisitesFor, studyExercises, studyLevel } from './history-study.js?v=150';
export { tally } from './assessment.js?v=150';

export const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'];
export const ROUTES = {
  leven: 'Dagelijks leven', werk: 'Werken', studie: 'Studeren', labo: 'In het labo', officine: 'Apotheek',
  winkel: 'In de winkel', cafe: 'Op café', gesprek: 'Gesprekken', onderweg: 'Onderweg', afspraak: 'Afspraken',
};
export const TRACKS = {
  greek: { name: 'Griekse oudheid', icon: 'greek', section: 'history', desc: 'Van de Egeïsche paleizen via de polis tot de hellenistische koninkrijken.' },
  roman: { name: 'Romeinse oudheid', icon: 'roman', section: 'history', desc: 'Van stad en republiek tot keizerrijk, provincies en late oudheid.' },
  medieval: { name: 'Middeleeuwen', icon: 'castle', section: 'history', desc: 'Van de erfgenamen van Rome en de kalifaten tot stedelijke groei, handel en de pest.' },
  earlymodern: { name: 'Vroegmoderne tijd', icon: 'compass', section: 'history', desc: 'Oceaanhandel, reformaties, de Lage Landen, wereldrijken en revoluties.' },
  history: { name: 'Algemene geschiedenis', icon: 'globe', section: 'history', desc: 'Van de eerste steden via industrialisering en wereldrijken tot dekolonisatie.' },
  knowledge: { name: 'Algemene kennis', icon: 'knowledge', section: 'history', desc: 'Begrippen om cijfers, nieuws en de wereld beter te begrijpen.' },
  la: { name: 'Latijn', icon: 'roman', section: 'language', lang: 'la', desc: 'Leer vormen herkennen en bouw stap voor stap een vertaling op.' },
  grc: { name: 'Oudgrieks', icon: 'greek', section: 'language', lang: 'grc', desc: 'Van het Griekse alfabet naar het lezen en analyseren van bronnen.' },
  traditio: { name: 'Traditio', icon: 'traditio', section: 'traditio', desc: 'Mythologie en religieuze overlevering.' },
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

export function practiceTopic(lesson) {
  const theme = lesson.route || (lesson.track === 'knowledge' && lesson.period);
  return theme ? lesson.track + '/' + theme : lesson.id;
}

export function makePool(lessons) {
  return lessons.flatMap(lesson => {
    if (lessonPools.has(lesson)) return lessonPools.get(lesson);
    const language = TRACKS[lesson.track]?.lang;
    const variants = practiceVariants(lesson, language);
    const exercises = studyExercises(lesson);
    const pool = lesson.items.map((item, index) => {
      const key = lesson.id + '/' + item.id;
      const source = lesson.sources?.[item.source ?? (language && !lesson.languageTopic ? -1 : 0)];
      const scope = { track: lesson.track, level: lesson.level, topic: practiceTopic(lesson), lesson: lesson.id };
      const questionData = (question, id) => {
        const data = {
          ...question, id: key + '/' + id, key, title: lesson.title,
          ...scope, label: item.label, explanation: question.studyLevel ? undefined : item.explanation,
          source: question.source ?? source, language,
        };
        const prerequisites = prerequisitesFor(lesson, data);
        if (prerequisites.length) data.prerequisites = prerequisites;
        return data;
      };
      const questions = item.questions.map(questionData);
      const practice = variants[index].map(question => questionData(question, question.variant));
      const academic = (exercises.get(item.id) ?? []).map(question => questionData(question, 'studie-' + question.id));
      return { key, ...scope, route: lesson.route, questions, practice, academic };
    });
    lessonPools.set(lesson, pool);
    return pool;
  });
}

export const practiceQuestions = item => [...item.questions, ...(item.practice ?? []), ...(item.academic ?? [])];

export function practiceBalance() {
  const tracks = new Map();
  const topics = new Map();
  const lessons = new Map();
  const skills = new Map();
  let previousTopic;
  const count = (map, key) => map.get(key) ?? 0;
  const add = (map, key) => { if (key) map.set(key, count(map, key) + 1); };
  return {
    score: row => 5 * count(tracks, row.track) + 12 * count(topics, row.topic) +
      24 * count(lessons, row.lesson) + 7 * count(skills, row.skill) + 15 * Number(!!row.topic && row.topic === previousTopic),
    add(row) {
      add(tracks, row.track);
      add(topics, row.topic);
      add(lessons, row.lesson);
      add(skills, row.skill);
      previousTopic = row.topic;
    },
  };
}

export function recentPractice(pool, history, now = Date.now()) {
  const lessons = new Map();
  const topics = new Map();
  for (const item of pool) {
    const last = history.states.get(item.key)?.last;
    if (!Number.isFinite(last)) continue;
    lessons.set(item.lesson, Math.max(lessons.get(item.lesson) ?? -Infinity, last));
    topics.set(item.topic, Math.max(topics.get(item.topic) ?? -Infinity, last));
  }
  const recency = at => at === undefined ? 0 : Math.max(0, 1 - Math.max(0, now - at) / DAY);
  return row => 9 * recency(lessons.get(row.lesson)) + 5 * recency(topics.get(row.topic));
}

function variedSelection(candidates, limit, priority = () => 0) {
  const remaining = [...candidates];
  const selected = [];
  const balance = practiceBalance();
  while (remaining.length && selected.length < limit) {
    let best = 0;
    let lowest = Infinity;
    for (const [index, row] of remaining.entries()) {
      const score = priority(row) + balance.score(row);
      if (score < lowest) {
        best = index;
        lowest = score;
      }
    }
    const [row] = remaining.splice(best, 1);
    balance.add(row);
    selected.push(row);
  }
  return selected;
}

export function historyOf(records) {
  const states = new Map();
  const seen = new Map();
  const lessons = new Set();
  const concepts = new Map();
  const reviews = records.filter(record => record.kind === 'review').sort((a, b) => a.at - b.at || a.id.localeCompare(b.id));
  for (const record of reviews) {
    const { key, question, lesson, rating, evidence, skipped, concept, assessment } = record.data;
    const current = states.get(key) ?? { stage: 0, count: 0 };
    const shortReview = rating === 'help' || evidence === 'self';
    const stage = skipped ? current.stage : rating === 'again' ? 0 : shortReview ? Math.min(1, current.stage) :
      Math.min(REVIEW_STEPS.length - 1, current.stage + (rating === 'easy' ? 2 : 1));
    const wait = skipped ? 45 * 60_000 : rating !== 'again' && shortReview ? 6 * 60 * 60_000 :
      stage === 0 ? 45 * 60_000 : REVIEW_STEPS[stage] * DAY;
    const correct = independentlyCorrect(record.data);
    let recallCount = current.recallCount ?? 0;
    let lastRecall = current.lastRecall;
    if (evidence === 'recall' && !skipped) {
      if (!correct) {
        recallCount = 0;
        lastRecall = undefined;
      } else if (lastRecall === undefined || record.at - lastRecall >= DAY) {
        recallCount++;
        lastRecall = record.at;
      }
    }
    const needsReview = skipped ? current.needsReview : rating === 'help' || rating === 'again';
    const due = skipped && current.due ? Math.min(current.due, record.at + wait) : record.at + wait;
    states.set(key, { stage, count: current.count + 1, due, last: record.at, lastQuestion: question, needsReview,
      attempted: Boolean(current.attempted || !skipped), recallCount, lastRecall,
      recognized: evidence === 'recognition' && !skipped ? correct : current.recognized,
      applied: evidence === 'application' && !skipped ? correct : current.applied });
    if (concept && !skipped) {
      const understanding = concepts.get(concept) ?? {};
      if (evidence === 'recall' || evidence === 'recognition' || evidence === 'application') understanding[evidence] = correct;
      if (assessment === 'definition' && evidence === 'self') understanding.definition = rating;
      concepts.set(concept, understanding);
    }
    if (question) seen.set(question, record.at);
    if (lesson && !skipped) lessons.add(lesson);
  }
  return { states, seen, lessons, concepts };
}

function questionFor(item, history, options = {}) {
  const current = history.states.get(item.key);
  const variants = options.learning ? practiceQuestions(item) :
    options.academic ? [...item.questions, ...(item.academic ?? []).filter(q => studyLevel(q) >= 3)] : item.questions;
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
  const recent = recentPractice(pool, history, now);
  const candidates = shuffled(pool).filter(item => {
    const state = history.states.get(item.key);
    return extra || !state || state.due <= now;
  }).sort((a, b) => (history.states.get(a.key)?.due ?? now) - (history.states.get(b.key)?.due ?? now));
  const questions = candidates.map(item => questionFor(item, history, {
    learning: true, short: true, noAudio, difficulty: preferredDifficulty(item, history),
    preferOriginal: !history.states.has(item.key),
  })).filter(Boolean);
  return variedSelection(questions, limit, question => {
    const state = history.states.get(question.key);
    return (state ? state.due <= now ? 0 : 20 : 8) + recent(question);
  });
}

export function lessonQuestions(pool, history, { noAudio = false } = {}) {
  const ordered = [...pool].sort((a, b) =>
    (history.states.get(a.key)?.last ?? 0) - (history.states.get(b.key)?.last ?? 0));
  const warmup = ordered.slice(0, 3).map(item => questionFor(item, history, {
    learning: true, short: true, noAudio, difficulty: startingDifficulty(item), preferOriginal: true,
  })).filter(Boolean);
  const exclude = new Set(warmup.map(q => q.id));
  const apply = [...ordered.slice(3), ...ordered.slice(0, 3)].map(item => questionFor(item, history, {
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
  const options = rows.flatMap(item => item.questions);
  const recognize = options.find(q => q.kind === 'choice' && q.context) ?? options.find(q => q.kind === 'choice');
  const matching = options.find(q => q.kind === 'match' && q.pairs.every(pair => pair.key !== recognize?.key));
  const seen = new Set([recognize?.key, ...(matching?.pairs.map(pair => pair.key) ?? [])]);
  const recall = [...rows.filter(item => !seen.has(item.key)), ...rows.filter(item => seen.has(item.key))]
    .flatMap(item => item.questions.filter(q => q.kind === 'fill')).slice(0, matching ? 3 : 4);
  return [recognize, matching, ...recall].filter(Boolean);
}

export function examQuestions(pool, history, monthly = false, allGoals = false) {
  const handled = pool.filter(item => history.states.has(item.key) && item.questions.some(q => q.kind !== 'listen'));
  const limit = allGoals ? handled.length : monthly ? 18 : 10;
  const required = EXAM_GOALS[monthly ? 'month' : 'week'];
  if (handled.length < required) return [];
  const ordered = variedSelection(shuffled(handled), limit);
  return ordered.map((item, index) =>
    questionFor(item, history, { preferOpen: monthly ? index % 3 !== 0 : index % 3 === 2, noAudio: true, academic: true }));
}

export function placementQuestions(pool) {
  const empty = { states: new Map(), seen: new Map() };
  return LEVELS.flatMap(level => {
    const items = shuffled(pool.filter(item => item.level === level));
    const questions = items.map(item => questionFor(item, empty, { objective: true })).filter(Boolean);
    return variedSelection(questions, 4, q => q.promptLanguage ? 0 : q.skill === 'grammar' ? 4 : 9).map(q => ({ ...q, level }));
  });
}

export const placementPassed = (correct, total) => total >= 3 && correct / total >= 0.75;

export function estimateLevel(questions, responses) {
  let recommended = 'A1';
  const rows = LEVELS.map(level => {
    const group = questions.map((q, index) => ({ q, index })).filter(({ q }) => q.level === level);
    const correct = group.filter(({ q, index }) => {
      const answer = responses[index];
      return !answer?.skipped && !answer?.hinted && isCorrect(q, answer?.response);
    }).length;
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
