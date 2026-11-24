import { reference } from './history-academic-model.js?v=14r3';
import { criteria } from './history-course-model.js?v=160';

export const worldHistory = (volume, chapter, slug) => reference(
  'Ann Kordas, Ryan J. Lynch, Brooke Nelson & Julie Tatlock',
  volume === 1 ? 'World History, Volume 1: to 1500' : 'World History, Volume 2: from 1400',
  chapter, 'https://openstax.org/books/world-history-volume-' + volume + '/pages/' + slug, volume === 1 ? '2023' : '2022'
);

// A reading part has substantive sections and a question drawn from their evidence.
export function chapter(track, id, anchor, year, period, title, summary, sources, sections, task) {
  const { skill = 'explanation', prompt, answer, rubric, material, objective } = task;
  return {
    id, track, anchor, year, period, title, summary, sources,
    structure: sections.map(([heading, text, ...index]) => ({ heading, text,
      references: (index.length ? index : [0]).map(number => sources[number]) })),
    items: [
      ...(objective ? [{ id: 'bewijs', label: objective.label, source: 0, questions: [objective.question] }] : []),
      { id: 'analyse', label: task.goal ?? title, source: 0, questions: [{
        kind: 'open', studyLevel: skill === 'synthesis' ? 4 : 3, historicalSkill: skill,
        text: prompt, answer, rubric: criteria(rubric),
        ...(material ? { evidenceNotes: material.map(([heading, text, index]) => [heading, text, sources[index]]) } : {}),
      }] },
    ],
  };
}
