import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { academicExam, academicExamParts, academicPreview, academicSyllabus } from '../academy/academic-exams.js';
import { atlasSnapshot, atlasTicks } from '../academy/atlas-time.js';
import { byLessonId } from '../academy/catalog.js';
import { catalogPacks as manifests } from '../academy/catalog-packs.js';
import { HISTORICAL_ENTITIES } from '../academy/content/atlas-history.js';
import { belongsToHistoryTrack, HISTORICAL_TRACKS } from '../academy/history-chronology.js';
import { historicalAssessment, HISTORICAL_SKILLS } from '../academy/history-assessment.js';
import { programmeJourney, readingProgrammes } from '../academy/history-programmes.js';
import { makePool } from '../academy/learning.js';
import { generateLessons } from '../academy/importer.js';
import { quizPage } from '../academy/views.js';

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

test('Elk geschiedenisvak heeft uitgebreide hoofdstukken met bronnen en verbonden leesreeksen', () => {
  const added = lessons.filter(lesson => lesson.anchor);
  assert(added.length >= 42);
  for (const track of HISTORICAL_TRACKS) {
    assert(added.filter(lesson => lesson.track === track).length >= 7, track);
    const programmes = readingProgrammes(track);
    assert(programmes.length >= 4, track);
    for (const lesson of added.filter(row => row.track === track)) {
      assert(byId.has(lesson.anchor), lesson.id);
      assert(programmes.some(row => row.parts.some(part => part.id === lesson.id)), lesson.id);
      assert(lesson.structure.length >= 3 && lesson.structure.every(block => block.text.length >= 170 &&
        block.references?.every(source => source?.author && source.locator && source.url.startsWith('https://')) &&
        block.references.length), lesson.id);
      assert(makePool([lesson]).flatMap(row => row.questions).some(q => q.kind === 'open' && q.rubric.length >= 3));
    }
  }
  const overviews = lessons.filter(lesson => lesson.id.startsWith('struct-'));
  assert.equal(overviews.length, 25);
  assert(overviews.every(lesson => lesson.structure.length >= 6 && lesson.structure.at(-1).references.length));
  const tri = readingProgrammes('roman').find(row => row.anchor === 'acad-eerste-triumviraat');
  assert.equal(tri.parts[0].id, 'triumviraat-vorming-belangen');
  assert.equal(tri.parts.length, 9);
  const aftermath = programmeJourney(byId.get('triumviraat-nasleep-dictatuur'), tri.anchor);
  assert.equal(aftermath.previous.id, 'acad-pharsalus');
  assert.equal(aftermath.next.id, 'acad-iden');
  const karel = readingProgrammes('medieval').find(row => row.anchor === 'karolingisch-macht-en-keizerschap');
  assert.deepEqual(karel.parts.slice(0, 4).map(part => part.id), [
    'karolingisch-macht-en-keizerschap', 'karolingisch-domeinen-en-arbeid', 'karolingisch-kerk-onderwijs-en-schrift',
    'karolingisch-synthese-hof-en-regios',
  ]);
});

test('De volledige ingebouwde geschiedenisvragenbank krijgt instructie en correctie met behoud van vraag-ID’s', () => {
  const historical = lessons.filter(historicalAssessment);
  const pool = makePool(historical);
  const count = historical.flatMap(lesson => lesson.items).flatMap(item => item.questions).length;
  assert(count >= 1512);
  assert.equal(pool.flatMap(row => row.questions).length, count);
  for (const row of pool) {
    const allQuestions = [...row.questions, ...row.practice, ...row.academic];
    assert.equal(new Set(allQuestions.map(question => question.id)).size, allQuestions.length, row.key);
    assert(allQuestions.every(q => HISTORICAL_SKILLS[q.historicalSkill] && q.studyLevel && q.instruction), row.key);
    assert(allQuestions.every(q => q.kind !== 'open' || q.rubric?.every(criterion => criterion.expected)), row.key);
    assert(row.questions.every((q, index) => q.id === row.key + '/' + index && q.kind !== 'card'), row.key);
  }
  const choice = pool.flatMap(row => row.questions).find(q => q.id.startsWith('triumviraat-consulaat-59/bewijs/'));
  assert.equal(choice.historicalSkill, 'source');
  assert.equal(choice.evidence, 'application');
  assert(choice.options.filter(option => option !== choice.answer).every(option => choice.optionFeedback[option]));
});

test('De universitaire toets bevat nieuwe bronopgaven en vergelijkingen uit de leesreeksen', () => {
  const tri = academicExam(lessons, new Set(), 'advanced', 'acad-eerste-triumviraat');
  const fragment = tri.questions.find(q => q.id.endsWith('/fragment-rubicon'));
  assert(fragment);
  assert(tri.questions.some(q => q.id.endsWith('/tri-twee-beleidsmomenten')));
  assert(tri.questions.every(q => q.kind === 'open' && q.historicalSkill !== 'situation'));
  const markup = quizPage({ mode: 'exam', questions: [fragment], index: 0, answers: [] });
  assert.match(markup, /Anoniem fragment/);
  assert.doesNotMatch(markup, /Julius Caesar|Peskett|Loeb/);
  const preview = academicPreview(lessons, new Set());
  assert.equal(preview.length, 5);
  assert(preview.some(q => q.kind === 'choice' && q.evidence === 'application' && q.optionFeedback));
  assert(preview.some(q => q.kind === 'open' && q.historicalSkill === 'source'));
  assert(preview.some(q => q.kind === 'open' && q.historicalSkill === 'comparison'));
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
  const addedSites = [[-3200, 'uruk-stedelijke-fasen'], [-2300, 'harappa-stedelijke-fase'], [-600, 'kyrene-vestiging'],
    [-430, 'athene-klassieke-polis'], [1140, 'aden-handel'], [1520, 'malakka-zeestraat'], [1900, 'congo-benedenstroom'],
    [1955, 'bandung-1955']];
  for (const [year, id] of addedSites) assert(dated(year).get(id)?.lessons.some(lesson => byId.get(lesson)?.anchor), id);
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


test('Geïmporteerde historische teksten leveren alleen gecontroleerde begrippen of passagevragen op', () => {
  const [lesson] = generateLessons({ track: 'greek', title: 'Eigen tekst', author: 'Testauteur' }, [
    { locator: 'p. 1', text: 'In de nederzettingen veranderden vormen van samenwerking en productie op uiteenlopende manieren.' },
    { locator: 'p. 2', text: 'Lineair B werd door verschillende paleisadministraties gebruikt om specifieke goederen te registreren.' },
  ]);
  const [passage, concept] = lesson.items;
  assert.equal(passage.label, 'Passage 1');
  assert.equal(passage.questions[0].kind, 'open');
  assert.equal(lesson.sources[passage.source].locator, 'p. 1');
  assert.equal(concept.label, 'Lineair B');
  assert.equal(concept.questions[0].concept, 'lineair-b');
  assert(concept.questions[0].source.locator);
});
