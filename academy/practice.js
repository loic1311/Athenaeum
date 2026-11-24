import { applications, workedExamples } from './practice-content.js?v=13r1';

export const PRACTICE_KINDS = { match: 'Koppelen', order: 'Ordenen' };
const difficulty = { choice: 0, match: 0, fill: 1, order: 1, card: 1, listen: 2, open: 3 };

export function practiceDifficulty(question) {
  const value = question.difficulty;
  return Number.isInteger(value) && value >= 0 && value <= 3 ? value : difficulty[question.kind] ?? 1;
}

export const startingDifficulty = item => Number(item.track === 'fr' && ['B2', 'C1'].includes(item.level));

export function preferredDifficulty(item, history) {
  const stage = history.states.get(item.key)?.stage ?? 0;
  return Math.max(startingDifficulty(item), stage < 1 ? 0 : stage < 3 ? 1 : 2);
}

export const PRACTICE_PHASES = ['Herkennen', 'Ophalen', 'Toepassen', 'Zelf formuleren'];

export function practicePhase(question) {
  if (question.evidence === 'application') return 2;
  if (question.kind === 'match' || question.kind === 'choice' && !question.promptLanguage) return 0;
  if (['fill', 'card', 'listen'].includes(question.kind)) return 1;
  return question.kind === 'open' ? 3 : 2;
}

export function sequencePractice(questions) {
  return [...questions].sort((a, b) => practicePhase(a) - practicePhase(b));
}

export function instructionFor(q) {
  if (q.instruction) return q.instruction;
  return {
    choice: 'Kies één antwoord en controleer je keuze.',
    fill: 'Typ je antwoord in het veld.',
    card: 'Denk hardop na en noteer je kernzin. Vergelijk die daarna met de uitwerking.',
    open: q.audioPrompt ? 'Antwoord eerst hardop. Schrijf daarna je eigen zin en vergelijk met het voorbeeld.' :
      'Schrijf je antwoord en vergelijk het daarna met de uitwerking.',
    listen: 'Speel de audio af en typ wat je hoort. Je kunt opnieuw luisteren.',
    match: 'Kies bij elke regel wat erbij hoort.',
    order: q.language ? 'Tik de taalblokken aan in de juiste volgorde.' : 'Tik de stappen aan in de gevraagde volgorde.',
  }[q.kind] ?? '';
}

const translationPrompt = /^(?:Wat bedoelt iemand met|Wat betekent|Welke betekenis past bij)\s+«([^»]+)»[^«»]*\?$/u;
const normalizeLabel = value => String(value).trim().toLocaleLowerCase('nl').replace(/\s+/gu, ' ');

function translation(item) {
  for (const q of item.questions) {
    if (q.kind === 'choice') {
      const phrase = q.text.match(translationPrompt)?.[1].trim();
      if (phrase) return { phrase, meaning: q.answer };
    }
    if (q.kind === 'card' && q.audio && q.text === 'Wat betekent ' + q.audio + '?') {
      return { phrase: q.audio, meaning: q.answer };
    }
  }
  return null;
}

function orderedSentence(text) {
  // Keep an apostrophe, hyphen and attached punctuation with their word.
  const words = text.trim().replace(/\s+([?!;:])/gu, '$1').split(/\s+/u);
  if (words.length < 3 || words.length > 24) return [];
  if (words.length <= 7) return words;
  const group = Math.ceil(words.length / 6);
  return Array.from({ length: Math.ceil(words.length / group) }, (_, index) =>
    words.slice(index * group, (index + 1) * group).join(' '));
}

export function practiceVariants(lesson, language) {
  if (lesson.structure) return lesson.items.map(() => []);
  const concepts = lesson.items.map((item, index) => {
    const example = language && translation(item);
    return {
      item, index, example, key: lesson.id + '/' + item.id,
      prompt: example?.phrase || item.label, answer: example?.meaning || item.explanation,
      source: lesson.sources?.[item.source ?? (language ? -1 : 0)],
    };
  });
  const variants = lesson.items.map(() => []);
  for (const row of concepts) {
    const { index, item, example, key } = row;
    const scene = item.id === 'zin' ? lesson.scene : null;
    const model = item.vocabulary ? null : example || (scene ? { phrase: scene.line, meaning: scene.meaning } : null);
    if (model) {
      const parts = orderedSentence(model.phrase);
      if (parts.length) variants[index].push({
        variant: 'sentence', kind: 'order', skill: language ? 'sentence' : undefined, text: 'Zet de woordblokken in een natuurlijke volgorde.',
        context: model.meaning, parts, answer: model.phrase, audio: model.phrase,
        tip: 'Lees de Nederlandse zin en bepaal eerst hoe de voorbeeldzin begint.',
      });
    }
    for (const [number, exercise] of (applications[key] ?? []).entries()) {
      variants[index].push({ variant: 'application-' + number, ...exercise });
    }
  }

  // Lesson labels can describe learning goals. Only language prompts are suitable for automatic matching.
  const eligible = language ? concepts.filter(row => row.prompt && row.answer && row.answer.length <= 460 &&
    (row.example || !concepts.some(candidate => candidate.example))) : [];
  const prompts = new Set(), answers = new Set();
  const distinct = eligible.filter(row => {
    const prompt = normalizeLabel(row.prompt), answer = normalizeLabel(row.answer);
    if (prompts.has(prompt) || answers.has(answer)) return false;
    prompts.add(prompt);
    answers.add(answer);
    return true;
  });
  for (let offset = 0; offset + 1 < distinct.length; ) {
    // Use two pairs if three would leave a single unmatched concept.
    const size = distinct.length - offset === 4 ? 2 : 3;
    const group = distinct.slice(offset, offset + size);
    const pairs = group.map(row => ({
      prompt: row.prompt, answer: row.answer, key: row.key, label: row.item.label, source: row.source,
      note: row.example && row.item.explanation !== row.answer ? row.item.explanation : undefined,
    }));
    const [first] = group;
    variants[first.index].push({
      variant: 'match', kind: 'match', pairs, skill: first.item.vocabulary ? 'vocabulary' : undefined,
      text: first.item.vocabulary ? 'Koppel elk woord aan de juiste betekenis.' :
        first.example ? 'Koppel elke zin aan de juiste betekenis.' : 'Koppel elk begrip aan de juiste uitleg.',
      answer: pairs.map(pair => pair.prompt + ' · ' + pair.answer).join('\n'),
      tip: first.example ? 'Zoek eerst de uitdrukking die je herkent en kies daarbij de passende betekenis.' :
        'Begin bij het bekendste begrip. Kijk welk woord in de uitleg je keuze ondersteunt.',
    });
    offset += size;
  }
  return variants;
}

export function workedExample(lesson) {
  const curated = workedExamples[lesson.id];
  if (!curated) return null;
  const item = lesson.items.find(row => row.id === curated.item);
  return { ...curated, source: lesson.sources?.[item?.source ?? 0] };
}

export function practiceOptions(q) {
  return q.kind === 'order' ? q.parts : q.kind === 'match' ? q.pairs.map(pair => pair.answer) : [];
}

export function completeSelection(q, selection = []) {
  const options = practiceOptions(q);
  return selection.length === options.length &&
    options.every((_, index) => Number.isInteger(selection[index]) && Object.hasOwn(options, selection[index]));
}

export function checkSelection(q, selection) {
  const options = practiceOptions(q);
  return completeSelection(q, selection) && options.every((value, index) => options[selection[index]] === value);
}
