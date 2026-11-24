import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { academicExam, academicExamParts, academicSyllabus } from '../academy/academic-exams.js';
import { atlasSnapshot, atlasTicks } from '../academy/atlas-time.js';
import { byLessonId } from '../academy/catalog.js';
import { catalogPacks as manifests } from '../academy/catalog-packs.js';
import { HISTORICAL_ENTITIES } from '../academy/content/atlas-history.js';
import { belongsToHistoryTrack } from '../academy/history-chronology.js';
import { makePool } from '../academy/learning.js';

const lessons = (await Promise.all(manifests.map(pack => pack.url
  ? readFile(pack.url, 'utf8').then(JSON.parse) : pack.load()))).flat();
const byId = new Map(lessons.map(lesson => [lesson.id, lesson]));
const areas = JSON.parse(await readFile(new URL('../academy/content/atlas-areas.json', import.meta.url))).features;
const dated = year => new Map(atlasSnapshot(year, areas).map(row => [row.id, row]));
const major = id => /^egeisch-|^karolingisch-/.test(id);

test('Uitgewerkte lessen en hun vragen hebben specifieke bronverwijzingen en criteria', () => {
  const routes = lessons.filter(lesson => major(lesson.id));
  assert(routes.length >= 12);
  for (const lesson of routes) {
    assert(byLessonId.has(lesson.id));
    if (lesson.id.startsWith('egeisch-')) assert(belongsToHistoryTrack(lesson, 'greek'));
    assert(lesson.structure.length >= 3 && lesson.structure.every(block =>
      block.references.length && block.references.every(source => source?.author && source.locator && source.url.startsWith('https://'))));
    const questions = makePool([lesson]).flatMap(goal => goal.questions);
    assert(questions.some(question => question.kind === 'open' && question.rubric?.length >= 2));
    assert(questions.filter(question => question.kind === 'choice').every(question =>
      question.options.filter(option => option !== question.answer).every(option => question.optionFeedback?.[option])));
  }
});

test('Historische leslabels worden bij het oefenen geen automatische begrippen', () => {
  const history = lessons.filter(lesson => ['greek', 'roman', 'medieval', 'earlymodern', 'history'].includes(lesson.track));
  assert(makePool(history).every(goal => goal.practice.every(question => !['concept', 'match'].includes(question.variant))));
});

test('Academische examens gebruiken controleerbare vragen en studiedekking', () => {
  const programmes = academicSyllabus(lessons);
  assert(programmes.some(row => row.id === 'aegean' && row.lessons.length === 8));
  assert(programmes.some(row => row.id === 'earlymodern'));
  const theme = academicExam(lessons, new Set(), 'thematic', 'aegean', true);
  assert(theme.questions.length > 6);
  assert(theme.questions.every(question => byId.get(question.lesson).curriculum === 'aegean' && question.source?.locator));
  const advanced = academicExam(lessons, new Set(), 'advanced', 'aegean');
  assert(advanced.questions.every(question => question.kind === 'open' && question.rubric.length));
  assert.equal(academicExam(lessons, new Set(['egeisch-lineair-b-economie']), 'cumulative', ''), undefined);
  const read = new Set(['egeisch-lineair-b-economie', 'karolingisch-domeinen-en-arbeid']);
  const cumulative = academicExam(lessons, read, 'cumulative', '');
  assert(cumulative.questions.some(question => question.id.endsWith('/synthese-cumulative')));
  assert(cumulative.questions.every(question => read.has(question.lesson)));
  const everyLesson = new Set(lessons.map(lesson => lesson.id));
  const questionBank = academicExam(lessons, everyLesson, 'cumulative', '', true).questions;
  const parts = academicExamParts(questionBank);
  assert(parts.length > 1);
  assert.deepEqual(parts.flat(), questionBank);
  assert.deepEqual(academicExam(lessons, everyLesson, 'cumulative', '', true).questions, questionBank);
  assert(parts.every(part => Buffer.byteLength(JSON.stringify(part)) < 225_000));
});

test('Atlas onderscheidt tijdsgebonden geometrie, vindplaatsen en leemtes', () => {
  const bronze = dated(-1200);
  for (const region of ['Europa', 'Afrika', 'Azië', 'Amerika', 'Oceanië']) {
    assert([...bronze.values()].some(row => row.region === region), region);
    assert([...dated(900).values()].some(row => row.region === region), region);
  }
  assert.equal(bronze.get('knossos-bronstijd').kind, 'site');
  assert.match(bronze.get('knossos-bronstijd').period[2], /postpalatiale/);
  assert(!bronze.get('knossos-bronstijd').area);
  assert(dated(810).get('karolingisch-rijk').area);
  assert(!dated(900).has('karolingisch-rijk'));
  assert(dated(900).get('west-francie').area);
  assert(dated(900).has('oost-francie'));
  assert.notEqual(dated(850).get('west-francie').area.properties.relation, dated(900).get('west-francie').area.properties.relation);
  assert(atlasSnapshot(900, areas, { region: 'Amerika' }).every(row => row.region === 'Amerika'));
  assert(atlasSnapshot(900, areas, { kind: 'network' }).every(row => row.kind === 'network'));
  assert.deepEqual(atlasSnapshot(null, areas), []);
  assert(atlasTicks(0, null).includes(-1200));
  assert(atlasTicks(0, null).includes(900));
  assert(atlasTicks(25, -1).includes(1));
  assert(!atlasTicks(25, -1).includes(0));
  assert.equal(atlasTicks(0, null).at(-1), null);
  for (const entity of HISTORICAL_ENTITIES) {
    assert(entity.lessons.length > 0 && entity.lessons.every(id => byId.has(id)), entity.id);
    assert(entity.source?.author && entity.source?.locator && entity.uncertainty, entity.id);
  }
  for (const area of areas) {
    assert(area.properties.from < area.properties.until);
    assert(HISTORICAL_ENTITIES.some(entity => entity.id === area.properties.entity));
    for (const polygon of area.geometry.coordinates) for (const ring of polygon) {
      assert(ring.length >= 4);
      assert.deepEqual(ring[0], ring.at(-1));
    }
  }
});
