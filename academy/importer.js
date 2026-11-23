import { KINDS, LEVELS, TRACKS } from './learning.js?v=14r3';

export const MAX_IMPORT_CHARS = 180_000;
const MAX_FILE_BYTES = 18 * 1024 * 1024;
const MAX_PAGES = 80;
const GROUP_SIZE = 12;

export async function readStudyFile(file, { start = 1, end = 0, onPage = () => {} } = {}) {
  if (file.size > MAX_FILE_BYTES) throw new Error('Dit bestand is groter dan 18 MB. Kies een kleiner bestand of plak een fragment.');
  if (!/\.pdf$/i.test(file.name)) {
    if (!/\.(txt|md|csv|tsv)$/i.test(file.name)) throw new Error('Kies een PDF, TXT, MD, CSV of TSV.');
    return [{ text: (await file.text()).replace(/^\uFEFF/, '') }];
  }
  let pdfjs;
  try {
    pdfjs = await import('./vendor/pdf.min.mjs');
  } catch {
    throw new Error('De PDF-lezer is nog niet op dit toestel beschikbaar. Open de app online of plak gekopieerde tekst.');
  }
  pdfjs.GlobalWorkerOptions.workerSrc = new URL('./vendor/pdf.worker.min.mjs', import.meta.url).href;
  const task = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()), isEvalSupported: false, enableXfa: false, useSystemFonts: true });
  try {
    const pdf = await task.promise;
    const last = end || Math.min(pdf.numPages, start + MAX_PAGES - 1);
    if (start < 1 || start > pdf.numPages || last < start || last > pdf.numPages || last - start >= MAX_PAGES) {
      throw new Error('Selecteer maximaal 80 pagina’s binnen PDF-pagina 1–' + pdf.numPages + '.');
    }
    const labels = await pdf.getPageLabels().catch(() => null);
    const pages = [];
    let total = 0;
    for (let i = start; i <= last; i++) {
      onPage(i, last);
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const text = content.items.map(item => item.str ? item.str + (item.hasEOL ? '\n' : ' ') : '').join('').trim();
      if (text) {
        pages.push({ text, locator: labels?.[i - 1] && labels[i - 1] !== String(i) ? 'PDF-pagina ' + i + ' · documentlabel ' + labels[i - 1] : 'PDF-pagina ' + i });
        total += text.length;
      }
      if (total > MAX_IMPORT_CHARS) throw new Error('Dit paginabereik bevat veel tekst. Kies een kleiner bereik, bijvoorbeeld 20 pagina’s.');
      page.cleanup();
    }
    if (!pages.length) throw new Error('Deze PDF heeft geen leesbare tekstlaag. Plak tekst uit een OCR-versie of kies een ander bestand.');
    return pages;
  } finally {
    await task.destroy();
  }
}

function pickPairs(text) {
  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  const pairs = lines.map(line => {
    const cols = line.match(/^(.{1,90}?)\s*(?:\||\t| → | = |: | – | — |;)\s*(.{1,500})$/);
    return cols ? [cols[1].replace(/^[-*]\s+/, '').trim(), cols[2].trim()] : null;
  }).filter(Boolean);
  return pairs.length && pairs.length * 2 >= lines.length ? pairs : [];
}

function sentences(text) {
  const compact = text.replace(/([^\W\d_])-\s*\n\s*([^\W\d_])/gu, '$1$2').replace(/[ \t]+/g, ' ');
  const pieces = typeof Intl.Segmenter === 'function'
    ? [...new Intl.Segmenter('nl', { granularity: 'sentence' }).segment(compact)].map(part => part.segment)
    : compact.split(/(?<=[.!?])\s+/u);
  return pieces.flatMap(piece => piece.split(/\n{2,}/)).map(piece => piece.replace(/\s+/g, ' ').trim())
    .filter(piece => piece.length >= 35 && piece.length < 460 && (piece.match(/\p{L}{3,}/gu)?.length ?? 0) >= 5);
}

function termIn(sentence) {
  const mid = sentence.match(/(?<=[\s(])[\p{Lu}][\p{L}\u2019-]{3,}(?!\p{L})/gu) ?? [];
  const long = sentence.match(/\p{L}{6,}[\p{L}\u2019-]*/gu) ?? [];
  const ignore = /^(daarom|hierdoor|bijvoorbeeld|vervolgens|daarnaast|volgens|tussen|tijdens|omdat|hoewel|hierbij|waarbij|tegelijk|uiteindelijk)$/iu;
  return [...mid, ...long.sort((a, b) => b.length - a.length)].find(word => !ignore.test(word));
}

function sourceFor(input, page) {
  if (!(input.author || input.work || page?.locator || input.locator)) return null;
  return { author: input.author || 'Auteur niet opgegeven', title: input.work || input.title, locator: page?.locator || input.locator, year: input.year };
}

function pairItem(front, back, isLanguage, source, distractors) {
  const questions = isLanguage ? [
    { kind: 'card', text: 'Wat betekent ' + front + '?', answer: back, audio: front },
    { kind: 'fill', text: 'Vertaal: ' + back, answer: front },
    { kind: 'listen', text: 'Luister en schrijf wat je hoort.', answer: front, audio: front },
  ] : [
    { kind: 'card', text: 'Leg uit: ' + front, answer: back },
    { kind: 'fill', text: 'Welk begrip hoort bij deze omschrijving? ' + back, answer: front },
  ];
  if (distractors.length >= 2) questions.push({
    kind: 'choice', text: (isLanguage ? 'Kies de juiste vertaling: ' : 'Kies het passende begrip: ') + back,
    answer: front, options: [front, ...distractors.slice(0, 3)],
  });
  return { label: front, explanation: back, source, questions };
}

export function generateLessons(input, sections) {
  const total = sections.reduce((length, page) => length + page.text.length, 0);
  if (total > MAX_IMPORT_CHARS) throw new Error('Dit is meer dan 180.000 tekens. Verwerk de tekst in stukken. Je invoer blijft bewaard.');
  const language = TRACKS[input.track]?.section === 'language';
  const gathered = [];
  const used = new Set();
  for (const page of sections) {
    const src = sourceFor(input, page);
    const pairs = pickPairs(page.text);
    if (pairs.length) {
      const labels = [...new Set(pairs.map(([label]) => label))];
      for (const [front, back] of pairs) {
        if (used.has(front.toLowerCase())) continue;
        used.add(front.toLowerCase());
        gathered.push(pairItem(front, back, language, src, labels.filter(label => label !== front)));
      }
      continue;
    }
    for (const sentence of sentences(page.text)) {
      const term = termIn(sentence);
      if (!term || used.has(term.toLowerCase())) continue;
      const mask = sentence.split(term).join(' […] ');
      used.add(term.toLowerCase());
      gathered.push({ label: term, explanation: sentence, source: src, questions: [
        { kind: 'fill', text: mask, answer: term },
        { kind: 'card', text: 'Leg in de context van deze tekst uit wat je weet over ' + term + '.', answer: sentence },
      ] });
    }
  }
  if (!gathered.length) throw new Error('Ik vond geen bruikbare vraag. Gebruik volledige zinnen of één paar per regel, zoals begrip | uitleg.');
  const lessons = [];
  for (let offset = 0; offset < gathered.length; offset += GROUP_SIZE) {
    const sources = [];
    const items = gathered.slice(offset, offset + GROUP_SIZE).map(({ source, ...item }, i) => {
      const key = JSON.stringify(source);
      let index = sources.findIndex(value => JSON.stringify(value) === key);
      if (index < 0 && source) {
        index = sources.length;
        sources.push(source);
      }
      return { ...item, id: 'begrip-' + (i + 1), ...(index >= 0 ? { source: index } : {}) };
    });
    lessons.push({
      id: 'eigen-' + crypto.randomUUID(),
      track: input.track,
      title: input.title + (gathered.length > GROUP_SIZE ? ' · deel ' + (lessons.length + 1) : ''),
      summary: 'Oefeningen uit jouw eigen materiaal.',
      ...(language ? { level: input.level, route: input.route } : {}),
      sources, items,
    });
  }
  return lessons;
}

export function validDeck(lesson) {
  return !!lesson && /^eigen-[a-z0-9-]{1,80}$/.test(lesson.id) && Object.hasOwn(TRACKS, lesson.track) && typeof lesson.title === 'string'
    && Array.isArray(lesson.items) && lesson.items.length > 0
    && (!lesson.level || LEVELS.includes(lesson.level)) && Array.isArray(lesson.sources)
    && lesson.items.every(item => typeof item.id === 'string' && typeof item.label === 'string'
      && Array.isArray(item.questions) && item.questions.length > 0
      && item.questions.every(question => Object.hasOwn(KINDS, question.kind)
        && typeof question.text === 'string' && typeof question.answer === 'string'
        && (!question.options || (Array.isArray(question.options) && question.options.every(option => typeof option === 'string')))
        && (!question.accepted || (Array.isArray(question.accepted) && question.accepted.every(option => typeof option === 'string')))
        && (!question.criteria || (Array.isArray(question.criteria) && question.criteria.every(criterion => typeof criterion === 'string')))));
}
