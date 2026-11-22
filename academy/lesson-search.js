import { ROUTES, TRACKS } from './learning.js?v=13r6';
import { LANGUAGE_TOPICS } from './language-topics.js?v=13r1';

const STOP_WORDS = new Set([
  'de', 'het', 'een', 'en', 'in', 'op', 'over', 'van', 'voor', 'te', 'bij', 'met', 'naar',
  'is', 'hoe', 'wat', 'waar', 'welke', 'zeg', 'zegt', 'heet', 'je', 'ik', 'kan', 'betekent',
  'zoek', 'zoeken', 'les', 'lessen', 'vertaling', 'vertaal',
]);
const LANGUAGES = new Map([
  ['frans', 'fr'], ['francais', 'fr'], ['french', 'fr'], ['francogallica', 'fr'],
  ['italiaans', 'it'], ['italiano', 'it'], ['italian', 'it'], ['italiana', 'it'],
]);
const VARIANTS = new Map([
  ['polis', 'poleis', 'polissen', 'stadstaat', 'stadstaten'],
  ['economie', 'economieen', 'economisch', 'economische', 'economics'],
  ['labo', 'labos', 'laboratorium', 'laboratoria'],
  ['maatbeker', 'maatbekers', 'maatkan', 'maatkannen'],
  ['maatcilinder', 'maatcilinders', 'meetcilinder', 'meetcilinders'],
  ['bekerglas', 'bekerglazen'],
  ['apotheek', 'apotheken', 'officine'],
  ['bibliotheek', 'bibliotheken', 'bib'],
  ['bron', 'bronnen'],
].flatMap(([term, ...words]) => words.map(word => [word, term])));

const TOPICS = {
  'attische-economie': 'Economie van de Griekse polis · handel, zilvermijnen en inkomsten in Athene',
  'g2-bosporus-graan': 'Economie van de Griekse polis · graanhandel en toegang tot voedsel',
  'g2-pasion-bank': 'Economie van de Griekse polis · bankwezen en werkplaatsen',
};
const index = new WeakMap();

function words(text) {
  const normalized = String(text ?? '').toLowerCase().normalize('NFD').replace(/\p{M}/gu, '')
    .replaceAll('œ', 'oe').replaceAll('æ', 'ae');
  return normalized.match(/[\p{L}\p{N}]+/gu) ?? [];
}

const canonical = term => VARIANTS.get(term) ?? term;

function indexLesson(lesson) {
  if (index.has(lesson)) return index.get(lesson);

  const parts = [];
  function add(text, weight, show = true) {
    if (typeof text !== 'string' || !text) return;
    const tokens = new Set(words(text).map(canonical));
    if (tokens.size) parts.push({ text, tokens, weight, show });
  }
  add(lesson.title, 24, false);
  add(TOPICS[lesson.id], 15);
  add(lesson.summary, 12);
  add([TRACKS[lesson.track]?.name, lesson.period, lesson.level, ROUTES[lesson.route],
    LANGUAGE_TOPICS[lesson.track]?.[lesson.languageTopic]?.title].filter(Boolean).join(' '), 5, false);
  if (Array.isArray(lesson.vocabulary)) {
    for (const pair of lesson.vocabulary) if (Array.isArray(pair)) add(pair.slice(0, 2).join(' · '), 22);
  }
  for (const { label, explanation, vocabulary } of lesson.items ?? []) {
    if (vocabulary) continue;
    add(label, 16);
    add(explanation, 8);
  }
  if (Array.isArray(lesson.dialogue)) {
    for (const line of lesson.dialogue) add([line?.text, line?.translation].filter(Boolean).join(' · '), 7);
  }
  for (const source of lesson.sources ?? []) add([source?.author, source?.title].filter(Boolean).join(' · '), 6);

  index.set(lesson, parts);
  return parts;
}

function excerpt(text, terms) {
  const compact = text.trim().replace(/\s+/gu, ' ');
  if (compact.length <= 180) return compact;
  const tokens = compact.split(' ');
  const firstMatch = tokens.findIndex(token => words(token).map(canonical)
    .some(word => terms.some(term => word.startsWith(term))));
  const start = Math.max(0, firstMatch - 6);
  const fragment = tokens.slice(start).join(' ');
  return (start ? '… ' : '') + (fragment.length > 173 ? fragment.slice(0, 174).replace(/\s+\S*$/u, '') + '…' : fragment);
}

export function searchLessons(lessons, query) {
  const tokens = words(query);
  const tracks = new Set(tokens.map(term => LANGUAGES.get(term)).filter(Boolean));
  const terms = [...new Set(tokens.filter(term => !LANGUAGES.has(term) && !STOP_WORDS.has(term)).map(canonical))];
  if (!terms.length && !tracks.size) return { hasQuery: false, results: [] };

  const results = [];
  for (const lesson of lessons) {
    if (tracks.size && !tracks.has(lesson.track)) continue;
    const matches = terms.map(() => 0);
    let snippet = typeof lesson.summary === 'string' ? lesson.summary : '';
    let snippetScore = 0;

    for (const part of indexLesson(lesson)) {
      let hits = 0;
      terms.forEach((term, i) => {
        const strength = part.tokens.has(term) ? part.weight :
          term.length >= 3 && [...part.tokens].some(word => word.startsWith(term)) ? part.weight * .5 : 0;
        matches[i] = Math.max(matches[i], strength);
        hits += strength;
      });
      if (part.show && hits > snippetScore) {
        snippet = part.text;
        snippetScore = hits;
      }
    }
    if (matches.some(score => score === 0)) continue;
    const score = matches.reduce((sum, weight) => sum + weight, 0);
    results.push({ lesson, score, snippet: excerpt(snippet, terms) });
  }
  results.sort((a, b) => b.score - a.score);
  return { hasQuery: true, results };
}
