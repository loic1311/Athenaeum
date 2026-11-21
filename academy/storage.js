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
const SYNC_KINDS = new Set(['review', 'result', 'draft', 'deck', 'prefs']);

export async function syncLearning(profile) {
  const sync = window.AthSync;
  const token = await sync.access(profile);
  const user = sync.cfg(profile).user?.id;
  if (!user) throw new Error('Log in om voortgang te bewaren op andere toestellen.');
  const headers = { Authorization: 'Bearer ' + token };
  const userFilter = 'user_id=eq.' + encodeURIComponent(user);
  const pending = (await readRecords(profile)).filter(row => row.pending && SYNC_KINDS.has(row.kind));
  let batch = [];
  let bytes = 0;
  async function send() {
    if (!batch.length) return;
    await sync.request(profile, '/rest/v1/rpc/athenaeum_save_learning', {
      method: 'POST', headers, body: JSON.stringify({ p_records: batch.map(toCloud) }),
    });
    await markSent(profile, batch);
    batch = [];
    bytes = 0;
  }
  for (const row of pending) {
    const size = new TextEncoder().encode(JSON.stringify(toCloud(row))).length;
    if (batch.length >= 150 || bytes + size > SYNC_MAX_BYTES) await send();
    batch.push(row);
    bytes += size;
  }
  await send();

  const cursorKey = 'academy_cursor_' + profile + '_' + user;
  const saved = localStorage.getItem(cursorKey);
  const since = saved ? new Date(Number(saved) - 120_000).toISOString() : '';
  let after = '';
  let mostRecent = Number(saved ?? 0);
  for (;;) {
    const query = new URLSearchParams({ select: 'record_id,kind,changed_ms,payload,saved_at', order: 'record_id.asc', limit: '250' });
    if (since) query.set('saved_at', 'gte.' + since);
    if (after) query.set('record_id', 'gt.' + after);
    const rows = await sync.request(profile, '/rest/v1/athenaeum_learning?' + userFilter + '&' + query, { headers });
    if (!Array.isArray(rows)) throw new Error('De voortgang kon niet opgehaald worden.');
    if (sync.cfg(profile).user?.id !== user) return;
    await storeRecords(profile, rows.map(fromCloud), false);
    for (const row of rows) mostRecent = Math.max(mostRecent, Date.parse(row.saved_at));
    if (rows.length < 250) break;
    after = rows.at(-1).record_id;
  }
  if (mostRecent > 0) localStorage.setItem(cursorKey, String(mostRecent));
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
