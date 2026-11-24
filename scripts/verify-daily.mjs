import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { evidenceFor, reviewData, tally } from '../academy/assessment.js';
import { catalogPacks } from '../academy/catalog-packs.js';
import { concepts } from '../academy/content/study-concepts.js';
import { seminars } from '../academy/content/history-seminars.js';
import { advanceDay, dayKey, planDay, prepareDay, tipsFor } from '../academy/daily.js';
import { dailyPage } from '../academy/daily-view.js';
import { explorationLessons } from '../academy/history-explorer.js';
import { annotatedTerms, preparationFor, studyLevel } from '../academy/history-study.js';
import { DAY, historyOf, makePool, practiceQuestions } from '../academy/learning.js';
import { progressOverview } from '../academy/progress-overview.js';
import { studyReadings } from '../academy/study-history.js';
import { languageGrammar, quizPage, resultPage } from '../academy/views.js';
import { monthlyExamQuestions, monthlyStudy, weeklyExamQuestions, weeklyStudy } from '../academy/weekly-exam.js';

const catalogue = Promise.all(catalogPacks.map(pack =>
  pack.url ? readFile(pack.url, 'utf8').then(JSON.parse) : pack.load())).then(packs => packs.flat());
const now = +new Date(2026, 10, 24, 12);
const on = options => ({ date: dayKey(new Date(now)), now, learner: 'fixture', ...options });
let lessonIndex;
async function lessonsById(...ids) {
  lessonIndex ??= new Map((await catalogue).map(lesson => [lesson.id, lesson]));
  return ids.map(id => lessonIndex.get(id));
}

test('De begrippen en leerdoelen zijn aanwezig vóór de eerste oefening voor een leeg profiel', async () => {
  const [aphrodisias] = await lessonsById('acad-aphrodisias-geld');
  const plan = planDay([aphrodisias], historyOf([]), [], on({ mode:'academic' }));
  assert.equal(plan.stages[0].questions.length, 0);
  const reading = advanceDay(plan, 'recall');
  const html = dailyPage(reading, [aphrodisias], [], null);
  assert.match(html, /Voorkennis/u);
  assert.match(html, /data-action="study-concept" data-value="euergetisme"/u);
  assert.match(html, /Twee verklaringen voor weerstand/u);
  assert.match(html, /Acta Classica 51, pp\. 31–33 en 43–44/u);
  assert.match(html, /Verder naar begeleid oefenen/u);
  assert.doesNotMatch(html, /Maak voor elk van de twee verklaringen een toetsbare voorspelling/u);
  assert.equal(plan.stages.find(stage => stage.id === 'transfer').questions.some(q => studyLevel(q) === 4), true);
});

test('Bestaande historische lessen en bronroutes gebruiken hetzelfde begrippen- en oefenmodel', async () => {
  const rows = await catalogue;
  const historical = rows.filter(preparationFor);
  assert(historical.length > 300);
  assert.equal(Object.keys(concepts).length, new Set(Object.keys(concepts)).size);
  for (const term of Object.values(concepts)) {
    assert(term.definition && term.example && term.scope && term.source?.locator);
    assert(term.related.every(id => Object.hasOwn(concepts, id)));
    assert.deepEqual(annotatedTerms(term.label).map(found => found.id), [term.id]);
  }
  const sourceRoute = new Set(explorationLessons(rows, 'bronnen', 'alles').map(lesson => lesson.id));
  for (const seminar of seminars) {
    assert(seminar.preparation.every(([, text, source]) => text && source.author && source.locator));
    for (const [id, goal] of Object.entries(seminar.lessons)) {
      const [lesson] = await lessonsById(id);
      assert(lesson?.items.some(item => item.id === goal), id + '/' + goal);
      assert(sourceRoute.has(id), id);
      const questions = makePool([lesson]).flatMap(item => item.academic);
      assert(questions.some(q => studyLevel(q) === 3 && q.evidenceNotes.length && Object.keys(q.optionFeedback).length === 3));
      assert(questions.some(q => studyLevel(q) === 4 && q.evidenceNotes.length && q.rubric.length === 3));
    }
  }
  for (const lesson of historical) {
    const pool = makePool([lesson]);
    assert.equal(pool.length, lesson.items.length);
    for (const question of pool.flatMap(practiceQuestions)) {
      assert((question.prerequisites ?? []).every(id => Object.hasOwn(concepts, id)));
    }
  }
});

test('Drie hints verschijnen één voor één zonder uitwerking of beoordelingscriteria', async () => {
  const [rome] = await lessonsById('rome-constitutie');
  const q = makePool([rome]).flatMap(item => item.academic).find(q => studyLevel(q) === 4);
  const session = { mode:'daily', title:'Toepassen', index:0, questions:[q], answers:[], hints:{0:2}, daily:{step:'transfer'} };
  const markup = quizPage(session);
  assert.equal(tipsFor(q).length, 3);
  assert.match(markup, /Krijg een aanwijzing voor je aanpak/u);
  assert.doesNotMatch(markup, /Bekijk de aanpak|model-answer|Onafhankelijke controle/u);
  const answer = { response:'De senaat was belangrijk.', rating:null, hinted:true, hintLevel:2, rubric:{2:'revise'} };
  const corrected = quizPage({ ...session, answers:[answer] });
  assert.match(corrected, /Beoordeel je redenering/u);
  assert.match(corrected, /Kies bronnen die de rol van de instellingen in een concrete beslissing kunnen laten zien\./u);
  assert.match(corrected, /Lees de bijbehorende uitleg/u);
  assert.equal(reviewData(q, { ...answer, rating:'help' }).hintLevel, 2);
  assert.deepEqual(tally([q], [{ ...answer, rating:'good' }]),
    { total:1, correct:0, reviewed:1, objective:0, assisted:0, selfAssessed:1 });
});

test('Zelfstandig toegepaste kennis, hulp en overslaan hebben afzonderlijke gevolgen', async () => {
  const [athens] = await lessonsById('struct-gr-klassiek');
  const [q] = makePool([athens]).flatMap(item => item.academic).filter(q => q.evidence === 'application');
  const right = { rating:'good', response:q.answer };
  const helped = { rating:'help', hinted:true, hintLevel:2, response:q.answer };
  const skipped = { rating:'again', skipped:true, response:'' };
  assert.equal(evidenceFor(q, right), 'application');
  assert.deepEqual(tally([q,q,q], [right,helped,skipped]),
    { total:3, correct:1, reviewed:3, objective:3, assisted:1, selfAssessed:0 });
  const rows = [right, skipped].map((answer, i) => ({
    kind:'review', id:'review-' + i, data:reviewData(q, answer), at:now - 2 * DAY + i,
  }));
  const history = historyOf(rows);
  const user = progressOverview([athens], rows, history, new Set(), {}, null, null, new Date(now));
  assert.equal(user.applied, 1);
  assert.equal(user.conceptApplication, 1);
  assert.equal(user.activity.find(day => day.date === dayKey(new Date(now - 2 * DAY))).count, 1);
});

test('Bestaande feedback en grammaticablokken behouden hun alinea-opmaak', async () => {
  const [base, french] = await lessonsById('rome-constitutie', 'fr-basis-goedendag');
  const [q] = makePool([base])[0].questions;
  const answer = { rating:'again', response:'Een verkeerd antwoord.' };
  assert.match(quizPage({ mode:'daily', title:'Begeleid oefenen', index:0, questions:[q], answers:[answer] }), /<h3>Uitleg<\/h3>/u);
  assert.match(languageGrammar(french), /<div class="lesson-copy"><p><strong>/u);
});

test('Een vervolgoefening gebruikt een nieuwe vraag bij hetzelfde leerdoel en wacht op voorbereide kennis', async () => {
  const [rome] = await lessonsById('rome-constitutie');
  const item = makePool([rome]).find(row => row.academic.some(q => q.concept && q.kind === 'fill'));
  const q = item.academic.find(q => q.concept && q.kind === 'fill');
  const answer = { response:q.answer, rating:'help', hinted:true, hintLevel:3 };
  const reviews = historyOf([{ id:'review-help', kind:'review', at:now - DAY, data:reviewData(q,answer) }]);
  assert.equal(reviews.states.get(q.key).recallCount, 0);
  assert.equal(reviews.states.get(q.key).due, now - DAY + 6 * 60 * 60_000);
  const unread = planDay([rome], reviews, [], on({ mode:'review' }));
  assert.equal(unread.stages[0].questions.length, 0);
  const read = planDay([rome], reviews, [], on({ mode:'review', read:new Set([rome.id]) }));
  assert(read.stages[0].questions.some(question => question.key === q.key && question.id !== q.id));
  assert(!read.stages.flatMap(stage => stage.questions).some(question => question.id === q.id));
});

test('Een ontbrekend lespakket blokkeert andere lessen of toetst geen ongelezen uitleg', async () => {
  const rows = await lessonsById('acad-aphrodisias-geld','acad-geniza-aden-india');
  const plan = advanceDay(planDay(rows, historyOf([]), [], on({ mode:'academic', minutes:25 })), 'recall');
  const unavailable = prepareDay(plan, new Set(), now);
  assert.equal(unavailable, plan);
  assert.match(dailyPage(plan, [rows[0]], [], null), /Verder met beschikbare lessen/u);
  const prepared = prepareDay(plan, new Set([rows[0].id]), now);
  assert.deepEqual(prepared.readUnits, [rows[0].id]);
  assert(prepared.stages.flatMap(stage => stage.questions).every(q => q.lesson === rows[0].id));
  assert.deepEqual(studyReadings([{ kind:'draft', data:{ daily:prepared } }]), [{ lesson:rows[0].id, at:now }]);
  for (const exam of [weeklyStudy(rows, [{ kind:'draft',data:{ daily:prepared } }], now),
    monthlyStudy(rows, [{ kind:'draft',data:{ daily:prepared } }], now)]) {
    assert.deepEqual(exam.lessons.map(lesson => lesson.id), [rows[0].id]);
  }
});

test('Week en maand toetsen hun eigen behandelde stof en bewaren oude uitslagen', async () => {
  const rows = await lessonsById('rome-constitutie','acad-geniza-aden-india','atlas-athene');
  const [thisWeek, thisMonth, past] = rows;
  const records = rows.map((lesson, i) => ({
    id:'history-read-' + lesson.id, kind:'prefs', at:[now, now - 7 * DAY, now - 40 * DAY][i],
    data:{ name:'history-read', lesson:lesson.id,value:true },
  }));
  const week = weeklyStudy(rows, records, now);
  const month = monthlyStudy(rows, records, now);
  const history = historyOf(records);
  assert.deepEqual(week.lessons.map(lesson => lesson.id), [thisWeek.id]);
  assert.deepEqual(month.lessons.map(lesson => lesson.id), [thisWeek.id,thisMonth.id]);
  assert(weeklyExamQuestions(week, history, true).every(q => q.lesson === thisWeek.id));
  assert(monthlyExamQuestions(month, history, true).every(q => q.lesson !== past.id));
  assert.match(resultPage('old', { mode:'exam', title:'Oud', correct:2, total:3, reviewed:3, questions:[], answers:[] }),
    /2 \/ 3 · toenmalige telling/u);
});

test('Dagplannen blijven binnen het bestaande synchronisatiebudget', async () => {
  const rows = await catalogue;
  const modes = ['auto','lesson','concepts','sources','review','academic'];
  for (const mode of modes) {
    const plan = planDay(rows, historyOf([]), [], on({ mode, minutes:40 }));
    const questions = plan.stages.flatMap(stage => stage.questions);
    assert.equal(new Set(questions.map(q => q.id)).size, questions.length);
    assert(questions.every(q => plan.units.some(unit => unit.id === q.lesson)));
    assert(new TextEncoder().encode(JSON.stringify({daily:plan})).byteLength < 250_000);
  }
});
