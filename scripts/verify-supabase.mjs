import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';
import { readRecords, record, storeRecords, syncLearning } from '../academy/storage.js';

const { indexedDB } = createRequire(import.meta.url)('fake-indexeddb');
const config = JSON.parse(await readFile(process.env.ATHENAEUM_SUPABASE_CONFIG, 'utf8'));
const api = new URL(config.API_URL);
assert(['127.0.0.1', 'localhost'].includes(api.hostname), 'De test gebruikt uitsluitend de tijdelijke Supabase-stack.');
const apiKey = config.ANON_KEY ?? config.PUBLISHABLE_KEY;
const serviceKey = config.SERVICE_ROLE_KEY;
assert(apiKey && serviceKey, 'De tijdelijke stack geeft de test benodigde sleutels.');
const deployedOrigin = 'https://loic1311.github.io';
const preferences = new Map();
const settings = new Map();
const window = {
  addEventListener() {},
  AthStore: {
    getProfileData: profile => settings.get(profile),
    setProfileData: (profile, _key, value) => settings.set(profile, value),
    loadProfiles: () => [],
  },
};
globalThis.window = window;
globalThis.indexedDB = indexedDB;
Object.defineProperty(globalThis, 'localStorage', { configurable:true, value:{
  getItem: key => preferences.get(key) ?? null,
  setItem: (key, value) => preferences.set(key, value),
} });

let interruptOnce = false;
const realFetch = globalThis.fetch;
const transport = (url, request) => {
  assert.equal(new URL(url).origin, api.origin, 'Testverkeer hoort alleen de tijdelijke API te bereiken.');
  if (interruptOnce && new URL(url).pathname === '/rest/v1/rpc/athenaeum_save_learning') {
    interruptOnce = false;
    throw new TypeError('Gesimuleerde netwerkonderbreking');
  }
  return realFetch(url, request);
};
const client = await readFile(new URL('../shared/sync.js', import.meta.url), 'utf8');
runInNewContext(client, { window, fetch:transport, AbortController, TextEncoder, setTimeout, clearTimeout });

async function request(path, { token = apiKey, key = apiKey, body, status = 200, origin } = {}) {
  const headers = { apikey:key, Authorization:'Bearer ' + token, 'Content-Type':'application/json' };
  if (origin) headers.Origin = origin;
  const response = await transport(new URL(path, api), {
    method:body === undefined ? 'GET' : 'POST', headers,
    body:body === undefined ? undefined : JSON.stringify(body), signal:AbortSignal.timeout(35_000),
  });
  assert([status].flat().includes(response.status), path + ' HTTP-status ' + response.status);
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

async function createLearner(index) {
  const profile = 'test-profile-' + index;
  const email = profile + '@athenaeum.example';
  const password = 'Fixture!' + randomUUID();
  const user = await request('/auth/v1/admin/users', {
    token:serviceKey, key:serviceKey, status:[200,201], body:{ email,password,email_confirm:true },
  });
  settings.set(profile, { url:api.origin, key:apiKey });
  const login = await window.AthSync.auth(profile,email,password);
  assert.equal(login.user.id,user.id);
  assert(login.access_token && login.refresh_token);
  return { profile,email,password,user:user.id,token:login.access_token };
}

const endpoint = '/functions/v1/athenaeum-webpush';
const fixtures = [];
test('Vijf accounts synchroniseren via Supabase Auth en PostgREST', { timeout:90_000 }, async () => {
  fixtures.push(...await Promise.all(Array.from({length:5}, (_, index) => createLearner(index))));
  const at = Date.now();
  const result = await Promise.all(fixtures.map(async ({profile,token}) => {
    await storeRecords(profile, [
      record('review','review-same-id',{profile,rating:'good'},at),
      record('prefs','pref-same-id',{profile,value:true},at+1),
    ]);
    assert.equal((await syncLearning(profile)).blocked, 0);
    return request('/rest/v1/athenaeum_learning?select=payload&order=record_id', { token });
  }));
  for (const [index, rows] of result.entries()) {
    assert.equal(rows.length, 2);
    assert(rows.every(row => row.payload.profile === fixtures[index].profile));
  }

  const { profile,email,password,user } = fixtures[0];
  await storeRecords(profile, [record('review','review-offline',{profile,rating:'good'},at+2)]);
  interruptOnce = true;
  await assert.rejects(syncLearning(profile), /Cloudserver niet bereikbaar/);
  assert((await readRecords(profile)).find(row => row.id === 'review-offline').pending);
  await syncLearning(profile);
  assert.equal((await readRecords(profile)).find(row => row.id === 'review-offline').pending, false);

  const second = 'second-device';
  settings.set(second, { url:api.origin, key:apiKey });
  await window.AthSync.auth(second,email,password);
  await syncLearning(second);
  assert.equal((await readRecords(second)).length, 3);
  assert.equal(window.AthSync.cfg(second).user.id,user);
  const session = window.AthSync.cfg(second);
  settings.set(second,{ ...session, expires_at:0 });
  const regenerated = await Promise.all([window.AthSync.access(second),window.AthSync.access(second)]);
  assert.equal(regenerated[0],regenerated[1]);
  assert.equal(window.AthSync.cfg(second).user.id,user);
});

test('Web Push bewaart per account en plant elk testtijdstip één keer', { timeout:90_000 }, async () => {
  assert.equal(fixtures.length,5);
  await request(endpoint, { body:{ action:'config' }, origin:deployedOrigin, status:401 });
  const publicConfig = await request(endpoint, { token:fixtures[0].token, body:{ action:'config' }, origin:deployedOrigin });
  assert.match(publicConfig.publicKey, /^[A-Za-z0-9_-]{87}$/);
  assert.equal(publicConfig.customSchedule,true);
  const subscriptions = fixtures.map(({user}) => ({
    endpoint:'https://fcm.googleapis.com/fcm/send/athenaeum-qa-' + user,
    keys:{ p256dh:'A'.repeat(87),auth:'B'.repeat(22) },
  }));
  const times = [570,600];
  await Promise.all(fixtures.map(({token}, index) => request(endpoint, {
    token, origin:deployedOrigin,
    body:{ action:'save',subscription:subscriptions[index],timezone:'Europe/Brussels',minutes:times,days:[1] },
  })));
  const service = { token:serviceKey, key:serviceKey };
  const devices = await request('/rest/v1/athenaeum_webpush_devices?select=user_id,endpoint,reminder_minutes',service);
  assert.equal(devices.length,5);
  assert(devices.every(device => device.endpoint === subscriptions[fixtures.findIndex(person => person.user === device.user_id)].endpoint));
  for (const device of devices) assert.deepEqual(device.reminder_minutes,times);

  const schedule = (date) => request('/rest/v1/rpc/athenaeum_webpush_due_times', {
    ...service, body:{ p_now:date },
  });
  assert.equal((await schedule('2026-11-23T08:30:00Z')).length,5);
  assert.deepEqual(await schedule('2026-11-23T08:31:00Z'),[]);
  assert.equal((await schedule('2026-11-23T09:00:00Z')).length,5);
  await Promise.all(fixtures.map(({token}, index) => request(endpoint, {
    token,origin:deployedOrigin,body:{ action:'remove',endpoint:subscriptions[index].endpoint },
  })));
  const secrets = await request('/rest/v1/rpc/athenaeum_webpush_secrets',{ ...service, body:{} });
  assert.equal(typeof secrets.dispatcher,'string');
  const dispatch = await transport(new URL(endpoint,api), {
    method:'POST', headers:{ apikey:apiKey,'Content-Type':'application/json','X-Athenaeum-Scheduler':secrets.dispatcher },
    body:JSON.stringify({action:'dispatch'}),signal:AbortSignal.timeout(35_000),
  });
  assert.equal(dispatch.status,200);
  assert.deepEqual(await dispatch.json(),{ due:0,sent:0 });
});

test('Telegram v8 houdt de gewone sessieflow beschikbaar en weigert ongeconfigureerde planning', { timeout:60_000 }, async () => {
  assert(fixtures[0]);
  const path = '/functions/v1/telegram-bot';
  assert.deepEqual(await request(path, { token:fixtures[0].token, body:{ mode:'session-check' } }),{ ok:true });
  await request(path, { body:{ mode:'schedule' }, status:403 });
});
