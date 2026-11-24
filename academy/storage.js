const DATABASE = 'athenaeum_learning';
let databasePromise;

function database() {
  if (databasePromise) return databasePromise;
  databasePromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE, 1);
    request.onupgradeneeded = () => {
      const store = request.result.createObjectStore('records', { keyPath: ['profile', 'id'] });
      store.createIndex('profile', 'profile');
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Sluit andere tabbladen van Athenaeum en probeer opnieuw.'));
  }).catch(error => {
    databasePromise = undefined;
    throw error;
  });
  return databasePromise;
}

export async function readRecords(profile) {
  const db = await database();
  return new Promise((resolve, reject) => {
    const request = db.transaction('records').objectStore('records').index('profile').getAll(profile);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function changeRecords(action) {
  const db = await database();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('records', 'readwrite');
    transaction.oncomplete = () => resolve();
    transaction.onerror = transaction.onabort = () => reject(transaction.error ?? new Error('Opslaan werd onderbroken.'));
    action(transaction.objectStore('records'));
  });
}

export function storeRecords(profile, records, pending = true) {
  return changeRecords(store => {
    for (const record of records) {
      const incoming = { ...record, profile, pending };
      const request = store.get([profile, incoming.id]);
      request.onsuccess = () => {
        const existing = request.result;
        if (!existing || existing.at < incoming.at || (existing.at === incoming.at && (!pending || existing.pending))) {
          store.put(incoming);
        }
      };
    }
  });
}

export function markSent(profile, records) {
  return changeRecords(store => {
    for (const record of records) {
      const request = store.get([profile, record.id]);
      request.onsuccess = () => {
        const existing = request.result;
        if (existing?.at === record.at) store.put({ ...existing, pending: false });
      };
    }
  });
}

export function forgetRecords(profile) {
  return changeRecords(store => {
    const request = store.index('profile').openKeyCursor(profile);
    request.onsuccess = () => {
      const cursor = request.result;
      if (cursor) {
        store.delete(cursor.primaryKey);
        cursor.continue();
      }
    };
  });
}

export function record(kind, id, data, at = Date.now()) {
  return { kind, id, data, at };
}

export async function backups(profile) {
  const records = await readRecords(profile);
  return records.filter(x => x.kind !== 'import').map(({ id, kind, at, data }) => ({ id, kind, at, data }));
}

function toCloud({ id, kind, at, data }) {
  return { record_id: id, kind, changed_ms: at, payload: data };
}

function fromCloud(row) {
  return record(row.kind, row.record_id, row.payload, row.changed_ms);
}

const SYNC_MAX_BYTES = 850_000;
const PAYLOAD_MAX_BYTES = 250_000;
const SYNC_KINDS = new Set(['review', 'result', 'draft', 'deck', 'prefs']);
const encoder = new TextEncoder();

export async function syncLearning(profile) {
  const sync = window.AthSync;
  const { user: account, url } = sync.cfg(profile);
  const user = account?.id;
  if (!user) throw new Error('Log in om voortgang te bewaren op andere toestellen.');
  function requireSameAccount() {
    const current = sync.cfg(profile);
    if (current.user?.id !== user || current.url !== url) throw new Error('De aanmelding is intussen gewijzigd.');
  }
  const token = await sync.access(profile);
  requireSameAccount();
  const headers = { Authorization: 'Bearer ' + token };
  const userFilter = 'user_id=eq.' + encodeURIComponent(user);
  const pending = (await readRecords(profile)).filter(row => row.pending && SYNC_KINDS.has(row.kind));
  let batch = [];
  let bytes = 0;
  let blocked = 0;
  async function send(rows) {
    if (!rows.length) return;
    requireSameAccount();
    try {
      await sync.request(profile, '/rest/v1/rpc/athenaeum_save_learning', {
        method: 'POST', headers, body: '{"p_records":[' + rows.map(row => row.json).join(',') + ']}',
      });
    } catch (error) {
      if (error.code !== '23514' && error.status !== 413) throw error;
      if (rows.length === 1) { blocked++; return; }
      const midpoint = Math.floor(rows.length / 2);
      await send(rows.slice(0, midpoint));
      await send(rows.slice(midpoint));
      return;
    }
    requireSameAccount();
    await markSent(profile, rows.map(row => row.record));
  }
  async function flush() {
    await send(batch);
    batch = [];
    bytes = 0;
  }
  for (const row of pending) {
    if (encoder.encode(JSON.stringify(row.data)).length > PAYLOAD_MAX_BYTES) {
      blocked++;
      continue;
    }
    const json = JSON.stringify(toCloud(row));
    const size = encoder.encode(json).length + 1;
    if (batch.length >= 150 || bytes + size > SYNC_MAX_BYTES) await flush();
    batch.push({ record: row, json });
    bytes += size;
  }
  await flush();

  const cursorKey = 'academy_cursor_' + profile + '_' + user;
  const saved = Number(localStorage.getItem(cursorKey));
  const since = saved > 0 && Number.isFinite(new Date(saved).getTime()) ? new Date(Math.max(0, saved - 120_000)).toISOString() : '';
  let after = '';
  let mostRecent = since ? saved : 0;
  for (;;) {
    requireSameAccount();
    const query = new URLSearchParams({ select: 'record_id,kind,changed_ms,payload,saved_at', order: 'record_id.asc', limit: '250' });
    if (since) query.set('saved_at', 'gte.' + since);
    if (after) query.set('record_id', 'gt.' + after);
    const rows = await sync.request(profile, '/rest/v1/athenaeum_learning?' + userFilter + '&' + query, { headers });
    if (!Array.isArray(rows)) throw new Error('De voortgang kon niet opgehaald worden.');
    requireSameAccount();
    await storeRecords(profile, rows.map(fromCloud), false);
    for (const row of rows) {
      const at = Date.parse(row.saved_at);
      if (Number.isFinite(at)) mostRecent = Math.max(mostRecent, at);
    }
    if (rows.length < 250) break;
    after = rows.at(-1).record_id;
  }
  if (mostRecent > 0) localStorage.setItem(cursorKey, String(mostRecent));
  return { blocked };
}

export async function clearCloudLearning(profile) {
  const sync = window.AthSync;
  const token = await sync.access(profile);
  const reset = await sync.request(profile, '/rest/v1/rpc/athenaeum_clear_learning', {
    method: 'POST', headers: { Authorization: 'Bearer ' + token }, body: '{}',
  });
  if (!Number.isSafeInteger(reset)) throw new Error('Cloud wissen is nog niet bevestigd.');
  return reset;
}
