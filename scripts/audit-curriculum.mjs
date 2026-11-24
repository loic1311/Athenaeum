import { readFile } from 'node:fs/promises';
import { catalogPacks } from '../academy/catalog-packs.js';
import { makePool, TRACKS } from '../academy/learning.js';
import { lessonSources } from '../academy/history-study.js';
import { chronologyYear } from '../academy/history-chronology.js';

const words = (value = '') => value.trim().split(/\s+/u).filter(Boolean).length;
const report = [];
for (const pack of catalogPacks) {
  const lessons = pack.url ? JSON.parse(await readFile(pack.url, 'utf8')) : await pack.load();
  for (const lesson of lessons) {
    const sources = lessonSources(lesson);
    const goals = makePool([lesson]);
    const canonical = goals.flatMap(goal => [...goal.questions, ...goal.academic]);
    const questions = canonical.map(question => ({
      id: question.id,
      type: question.kind,
      source: Boolean(question.source?.author && question.source?.locator),
      rubric: Boolean(question.rubric?.length),
      individualFeedback: Boolean(question.optionFeedback),
    }));
    const explanationWords = words(lesson.summary) + (lesson.structure ?? []).reduce((sum, section) =>
      sum + words(section.lead) + words(section.text), 0) +
      lesson.items.reduce((sum, item) => sum + words(item.explanation), 0);
    report.push({
      pack: pack.key, id: lesson.id, track: lesson.track, title: lesson.title, year: chronologyYear(lesson) ?? null,
      explanationWords, sections: lesson.structure?.length ?? 0,
      sources: sources.map(({ author, title, locator, url }) => ({ author, title, locator, url })),
      goalKeys: goals.map(goal => goal.key), questions,
      variants: goals.reduce((sum, goal) => sum + goal.practice.length, 0),
    });
  }
}

if (process.argv.includes('--details')) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.table(Object.entries(Object.groupBy(report, row => row.track)).map(([track, lessons]) => {
    const questions = lessons.flatMap(row => row.questions);
    return {
      vak: TRACKS[track].name, lessen: lessons.length, doelen: lessons.reduce((sum, row) => sum + row.goalKeys.length, 0),
      vragen: questions.length, openMetRubric: questions.filter(row => row.type === 'open' && row.rubric).length,
      zonderVindplaats: questions.filter(row => !row.source).length,
    };
  }));
  console.log(report.length + ' lessen opgenomen. Bronverwijzingen en criteria zijn structureel geïnventariseerd.');
}
