import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';
import { evidenceFor, reviewData, SCORE_VERSION, tally } from '../academy/assessment.js';
import { historyOf, DAY } from '../academy/learning.js';
import { progressOverview } from '../academy/progress-overview.js';
import { streakStatus } from '../academy/streak.js';
import { resultPage } from '../academy/views.js';
import { loadPacks, packFiles } from '../academy/catalog.js';
import { validSharedSecret } from '../supabase/functions/telegram-bot/authorization.ts';
import './verify-daily.mjs';

const question = (kind, key = 'les/doel') => ({ id: key + '/' + kind, key, lesson: 'les', kind, text: 'Vraag', answer: 'Antwoord' });
const answer = (rating, more) => ({ rating, response: 'Antwoord', ...more });

test('Zelfbeoordeling, hulp en overgeslagen vragen tellen afzonderlijk', () => {
  const questions = ['fill', 'choice', 'fill', 'open', 'card', 'open', 'fill'].map(kind => question(kind));
  const answers = [answer('good'), answer('good'), answer('help', { hinted: true }),
    answer('good'), answer('easy'), answer(null), answer('again', { skipped: true })];
  const counts = tally(questions, answers);
  assert.deepEqual(counts, { total: 7, correct: 2, reviewed: 6, objective: 4, assisted: 1, selfAssessed: 2 });
  assert.equal(evidenceFor(question('match'), answer('good')), 'recognition');
  assert.equal(evidenceFor(question('order'), answer('good', { selection: [0, 1] })), 'recognition');
  assert.equal(evidenceFor(question('order'), answer('good')), 'recall');
  assert.match(resultPage('demo', { mode:'exam', title:'Examen', scoreVersion:SCORE_VERSION, questions, answers, ...counts }),
    /2 van 4 automatisch juist zonder hulp/);
  assert.match(resultPage('oud', { mode:'exam', title:'Examen', questions, answers, ...counts, correct:5 }),
    /5 \/ 7 · toenmalige telling/);
});

test('Zelfstandig ophalen vereist onafhankelijke antwoorden met minstens 24 uur ertussen', () => {
  const first = Date.parse('2026-11-18T23:55:00Z');
  const at = (index, kind, rating, wait, more) => ({
    id: 'review-' + index, kind:'review', at: first + wait,
    data: reviewData(question(kind), answer(rating, more)),
  });
  const older = { id:'old', kind:'review', at: first - DAY, data:{ key:'les/doel', lesson:'les', rating:'good' } };
  const records = [older, at(1,'choice','good',0), at(2,'open','good',DAY),
    at(3,'fill','good',2 * DAY), at(4,'fill','good',2 * DAY + 600_000)];
  const state = () => historyOf(records).states.get('les/doel');
  assert.equal(state().recallCount, 1);
  assert.equal(state().recognized, true);
  records.push(at(5,'fill','good',3 * DAY));
  assert.equal(state().recallCount, 2);
  records.push(at(6,'fill','help',4 * DAY,{ hinted:true }));
  assert.equal(state().recallCount, 0);
  assert.equal(historyOf([older]).states.get('les/doel').recallCount, 0);
});

test('Lezen en overslaan zijn onderscheiden van oefenen', () => {
  const row = { id:'review-one', kind:'review', at:Date.now(),
    data:reviewData(question('fill'), answer('again',{ skipped:true })) };
  const progress = (rows, read) => progressOverview([{ id:'les',track:'roman',goalCount:1 }],
    rows, historyOf(rows), read, {}, null, null);
  assert.equal(progress([row], new Set()).studiedCount, 0);
  const reading = progress([row], new Set(['les']));
  assert.equal(reading.studiedCount, 1);
  assert.equal(reading.completedLessons, 0);
  assert.equal(reading.retained, 0);
  const practiced = progress([{ ...row, data:reviewData(question('open'),answer('again')) }], new Set());
  assert.equal(practiced.completedLessons, 1);
  assert.equal(practiced.retained, 0);
});

test('Motivatiebeloning blijft bruikbaar voor historische uitslagen en vraagt voldoende objectieve toetsvragen', () => {
  const at = new Date(2026,10,24,12).getTime();
  const day = '2026-11-24';
  const data = { mode:'exam', examType:'week', studyDay:day, gradedDay:day,
    answers:[answer('good')], reviewed:4, total:4 };
  const reward = fields => streakStatus([{ id:'result-1', kind:'result', at, data:{ ...data,...fields } }], day).earned.get('result-1');
  assert.equal(reward({ correct:3 }), 1);
  assert.equal(reward({ scoreVersion:SCORE_VERSION, correct:1, objective:1 }), undefined);
  assert.equal(reward({ scoreVersion:SCORE_VERSION, correct:2, objective:2 }), 1);
});

test('HTTP-fouten en catalogusverschillen blijven herkenbaar en een herlaadpoging ruimt de fout op', async () => {
  const path = new URL('../academy/content/greek.json', import.meta.url);
  const valid = JSON.parse(await readFile(path, 'utf8'));
  const original = globalThis.fetch;
  try {
    let cache;
    globalThis.fetch = () => Promise.resolve(new Response('{}', { status:503 }));
    await loadPacks(['greek']);
    assert.equal(packFiles.get('greek').status, 'failed');
    assert.equal(packFiles.get('greek').error.status, 503);
    globalThis.fetch = () => Promise.resolve(Response.json([valid[1], ...valid.slice(1)]));
    await loadPacks(['greek'], undefined, true);
    assert.equal(packFiles.get('greek').error.code, 'CATALOG_MISMATCH');
    globalThis.fetch = (_url, options) => { cache = options.cache; return Promise.resolve(Response.json(valid)); };
    await loadPacks(['greek'], undefined, true);
    assert.equal(cache, 'reload');
    assert.equal(packFiles.get('greek').status, 'ready');
    assert.equal(packFiles.get('greek').error, undefined);
  } finally {
    globalThis.fetch = original;
  }
});

test('De gedeelde autorisatie vereist een ingesteld geheim en een exacte overeenkomst', () => {
  assert.equal(validSharedSecret('', ''), false);
  assert.equal(validSharedSecret('synthetisch-geheim', undefined), false);
  assert.equal(validSharedSecret('synthetisch-geheim', 'ander'), false);
  assert.equal(validSharedSecret('synthetisch-geheim', 'synthetisch-geheim'), true);
});

test('Parallelle tokenvernieuwing deelt één verzoek en een late reactie kan een afmelding niet ongedaan maken', async () => {
  const code = await readFile(new URL('../shared/sync.js', import.meta.url), 'utf8');
  const expired = { user:{ id:'test-account' }, access_token:'expired', refresh_token:'test-refresh', expires_at:0 };
  let state = { ...expired };
  let finish;
  let requests = 0;
  const window = { addEventListener: () => {}, AthStore:{ getProfileData: () => state, setProfileData: (_id, _key, data) => { state = data; },
    loadProfiles: () => [], saveProfiles: () => {} } };
  const fetch = () => new Promise(resolve => { requests++; finish = resolve; });
  runInNewContext(code, { window, fetch, AbortController, TextEncoder, setTimeout, clearTimeout });

  const first = window.AthSync.access('test');
  const second = window.AthSync.access('test');
  assert.equal(requests, 1);
  finish(Response.json({ user:expired.user, access_token:'test-new', refresh_token:'test-rotation' }));
  assert.equal(await first, 'test-new');
  assert.equal(await second, 'test-new');

  state = { ...expired };
  const onSignOut = window.AthSync.access('test');
  state = {};
  finish(Response.json({ user:expired.user, access_token:'test-stale' }));
  await assert.rejects(onSignOut, /aanmelding is intussen gewijzigd/);
  assert.equal(state.access_token, undefined);
});
