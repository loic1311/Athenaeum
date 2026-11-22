import { historyCourse } from './history-source.js?v=13r8';

export function source(author, title, year, locator, url) {
  return { author, title, year, locator, url };
}

export function extension(kind, units) {
  return units.map(({ track = 'history', ...entry }) => {
    const [lesson] = historyCourse(track, [{ ...entry, extension: kind }]);
    if (!lesson.primary) return lesson;
    const headings = ['Herkomst en overlevering', 'Historische context', 'Taal en vertaling', 'Bewijskracht', 'Verder onderzoeken'];
    lesson.structure.forEach((block, i) => { block.heading = headings[i]; });
    for (const item of lesson.items) {
      for (const question of item.questions) question.passage = lesson.primary;
    }
    return lesson;
  });
}

export function passage(language, lang, original, english, image) {
  return { language, lang, original, english, image };
}
