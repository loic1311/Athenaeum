import { TRACKS, makePool, practiceBalance, practiceQuestions, practiceTopic, recentPractice } from './learning.js?v=13r5';
import { practiceDifficulty, preferredDifficulty, startingDifficulty } from './practice.js?v=13r5';

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
  return (items, count, kinds, { priority = 0, preferKind = false, difficulty, adaptive = false, eligible = () => true } = {}) => {
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

function lessonIndex(lessons, history, archive) {
  const times = new Map();
  const recentTracks = new Map();
  const recentTopics = new Map();
  const topics = new Map(lessons.map(lesson => [lesson.id, practiceTopic(lesson)]));
  for (const [i, plan] of archive.entries()) {
    for (const lesson of plan.units) {
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
    const fresh = !timesRead && !history.lessons.has(lesson.id);
    if (!groups.has(lesson.track)) groups.set(lesson.track, []);
    const topic = topics.get(lesson.id);
    groups.get(lesson.track).push({ lesson, topic, fresh, timesRead, recent: recentTopics.get(topic) ?? 0 });
  }
  return [...groups].map(([key, units]) => ({
    key, units, fresh: units.some(u => u.fresh), recent: recentTracks.get(key) || 0,
  }));
}

function chooseLessons(groups, count, salt) {
  const sorted = [...groups].sort((a,b) => Number(b.fresh) - Number(a.fresh) || a.recent - b.recent || hash(salt+a.key) - hash(salt+b.key));
  const results = [];
  const used = new Set();
  const topics = new Set();
  while (results.length < count) {
    let added = 0;
    for (const { units } of sorted) {
      const remaining = units.filter(u => !used.has(u.lesson.id));
      if (!remaining.length) continue;
      const [chosen] = remaining.sort((a,b) => Number(topics.has(a.topic)) - Number(topics.has(b.topic)) ||
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

function comparison(chosen, goals, salt) {
  const historical = chosen.map(row => row.lesson).filter(l => ['greek','roman','history'].includes(l.track) && l.sources?.length);
  if (historical.length < 2) return null;
  const [first,second] = historical;
  const anchor = goals.find(goal => goal.lesson === first.id);
  if (!anchor) return null;
  const cases = [first,second].map(l => {
    const item = l.items[hash(salt+l.id) % l.items.length];
    return { title:l.title,label:item.label,note:item.explanation,source:l.sources[item.source ?? 0] };
  });
  const selected = cases.map(c => c.label).join(' · ');
  return {
    ...anchor.questions[0], kind:'open', id:anchor.key + '/compare/' + second.id + '/' + hash(selected),
    text:'Vergelijk ‘' + first.title + '’ met ‘' + second.title + '’. Welke uitspraak kan elk voorbeeld staven, en waar ligt de grens?',
    answer:'Een mogelijk antwoord vertrekt per casus van een concreet gegeven. ' + cases.map(c => c.label + ': ' + c.note).join(' '),
    cases,
    criteria:[
      'Gebruik uit elke casus minstens één gegeven en verwijs naar de aangegeven bron of studie.',
      'Scheid wat de bron expliciet toont van wat jij afleidt.',
      'Benoem een verschil in tijd, schaal, genre of doel dat de vergelijking begrenst.',
    ],
    tip:'Begin bij de concrete gegevens in beide casussen en geef per casus één voorzichtige gevolgtrekking.',
    options:undefined, audio:undefined,
  };
}

export function planDay(lessons, history, archive, {
  date = dayKey(), minutes = 15, focus = 'mix', now = Date.now(), noAudio = false, learner = '',
} = {}) {
  if (!lessons.length) return null;
  const config = PACE[minutes] ?? PACE[15];
  const pool = makePool(lessons);
  const learned = pool.filter(item => history.states.has(item.key)).sort((a,b) =>
    history.states.get(a.key).due - history.states.get(b.key).due);
  const due = learned.filter(item => history.states.get(item.key).due <= now);
  const groups = lessonIndex(lessons, history, archive);
  const signatures = new Set(archive.map(p => p.signature));
  let plan;
  for (let attempt = 0; attempt < 24; attempt++) {
    const salt = [learner,date,minutes,focus,attempt].join(':');
    const chosen = chooseLessons(groups, config.units, salt);
    const units = chosen.map(({lesson,fresh}) => ({id:lesson.id,title:lesson.title,track:lesson.track,fresh}));
    const goals = makePool(chosen.map(row => row.lesson));
    const pick = picker(history, salt, noAudio, [], recentPractice(pool, history, now));
    const recall = pick(learned, config.recall, SHORT, {priority:1,adaptive:true});
    const guided = pick(goals, config.guided, ['choice','match','fill','card','order'], {difficulty:0});
    const compare = config.units >= 3 ? comparison(chosen,goals,salt) : null;
    const transferKinds = minutes <= 8 ? ['order','fill','card','choice'] : ['open','order','fill','listen','card','choice'];
    const direct = pick(goals, config.transfer - Number(!!compare), transferKinds, {preferKind:true});
    const applied = compare ? [...direct,compare] : direct;
    const exit = pick(goals, config.exit, ['card','fill','choice','listen','order','match'], {difficulty:1});
    const practice = pick(goals, Math.min(1,config.practice), ['match','order']);
    practice.push(...pick(goals, config.practice - practice.length, SHORT, {difficulty:1}));
    const support = [...new Map([...goals, ...learned].map(item => [item.key, item])).values()];
    while (practice.length < config.practice) {
      const next = pick(support, config.practice - practice.length, SHORT, {difficulty:1});
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
    plan = {date,focus,minutes,units,stages,signature,due:due.length,cursor:0,completed:false,results:{}};
    if (!signatures.has(signature)) return plan;
  }
  return plan;
}

export function advanceDay(plan, stepId, result) {
  if (plan.stages[plan.cursor]?.id !== stepId) return plan;
  const results = { ...plan.results, ...(result ? { [stepId]: result } : {}) };
  const cursor = plan.cursor + 1;
  const completed = cursor >= plan.stages.length;
  const stages = completed ? plan.stages.map(({ questions, ...stage }) => ({ ...stage, count: questions.length })) : plan.stages;
  return { ...plan, cursor, results, completed, stages };
}

function omitAnswer(text, answer) {
  if (!text || !answer || answer.length < 2) return String(text ?? '').slice(0, 300);
  const clean = answer.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return String(text).replace(new RegExp(clean,'giu'), '…').slice(0, 300);
}

export function tipsFor(q) {
  const approach = {
    choice: 'Zoek het belangrijkste woord in de vraag. Kijk welke optie daar het best bij past.',
    fill: 'Bepaal welk soort woord, begrip of getal ontbreekt. Lees daarna de volledige zin opnieuw.',
    card: 'Bedenk één kernzin. Voeg een voorbeeld toe als de vraag daarom vraagt.',
    open: 'Splits de opdracht op. Formuleer een korte stelling en voeg een reden, voorbeeld of bron toe.',
    listen: 'Luister eerst naar de betekenis. Speel de zin opnieuw af en let op de grenzen tussen de woorden.',
    match: 'Begin bij de regel die je het makkelijkst vindt. Zoek een woord dat je keuze ondersteunt.',
    order: 'Bepaal eerst welke stap of welk taalblok aan het begin hoort.',
  }[q.kind];
  const clue = q.kind === 'choice' ? 'Je kunt deze optie schrappen: ' + (q.options?.find(v => v !== q.answer) ?? 'kijk opnieuw naar de context.') :
    q.kind === 'match' ? 'Vergelijk ‘' + q.pairs[0].prompt + '’ met de mogelijke betekenissen of omschrijvingen.' :
    q.kind === 'order' ? 'Begin met ‘' + q.parts[0] + '’.' :
    q.criteria?.length ? omitAnswer(q.criteria[0],q.answer) :
      q.kind === 'fill' || q.kind === 'listen' ? 'Het antwoord begint met ‘' + String(q.answer).trim().charAt(0) + '’. Denk verder aan de context.' :
        'Denk aan de les ‘' + q.title + '’ en hoe dit begrip daar wordt uitgelegd.';
  const context = q.explanation || q.feedback || q.criteria?.at(-1) || q.title;
  return [...new Set([q.tip ? omitAnswer(q.tip,q.answer) : approach, clue, context].filter(Boolean))];
}
