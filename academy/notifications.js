const PREFERENCE = 'athenaeum-push-preferences';
const ENDPOINT = '/functions/v1/athenaeum-webpush';
export const MAX_REMINDERS = 24;
export const REMINDER_DAYS = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];
const EVERY_DAY = [1, 2, 3, 4, 5, 6, 7];
export const LEGACY_TIMES = ['09:30', '15:30', '20:30'];

export function pushSupport() {
  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent) || navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  if (ios && !navigator.standalone && !matchMedia('(display-mode: standalone)').matches) return 'install';
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) return 'unsupported';
  return Notification.permission === 'denied' ? 'blocked' : 'available';
}

export function pushPreference(pid) {
  try {
    const value = JSON.parse(localStorage.getItem(PREFERENCE) || 'null');
    if (value?.profile !== pid || !value) return null;
    if (value.times) return value;
    return [1, 2, 3].includes(value.count)
      ? { profile: pid, times: LEGACY_TIMES.slice(-value.count), days: EVERY_DAY }
      : null;
  } catch {
    return null;
  }
}

async function pushRequest(pid, action, values = {}) {
  const sync = window.AthSync;
  const token = await sync.access(pid);
  return sync.request(pid, ENDPOINT, {
    method: 'POST', headers: { Authorization: 'Bearer ' + token }, body: JSON.stringify({ action, ...values }),
  });
}

function decodeKey(key) {
  if (typeof key !== 'string' || !/^[A-Za-z0-9_-]{87}$/.test(key)) throw new Error('De meldingsinstellingen konden niet worden geladen.');
  return Uint8Array.from(atob(key.replaceAll('-', '+').replaceAll('_', '/') + '='), character => character.charCodeAt(0));
}

export async function preparePush(pid) {
  let timer;
  try {
    const [registration, keys] = await Promise.race([
      Promise.all([navigator.serviceWorker.ready, pushRequest(pid, 'config')]),
      new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('De meldingsinstellingen laden te lang.')), 15000); }),
    ]);
    return {
      registration, key: decodeKey(keys.publicKey), subscription: await registration.pushManager.getSubscription(),
      customSchedule: keys.customSchedule === true,
    };
  } finally {
    clearTimeout(timer);
  }
}

export function readSchedule(form) {
  if (form.has('frequency')) {
    const count = Number(form.get('frequency'));
    if (![1, 2, 3].includes(count)) throw new Error('Kies hoeveel herinneringen je wilt.');
    return { times: LEGACY_TIMES.slice(-count), days: EVERY_DAY };
  }
  const times = form.getAll('reminder-time').sort();
  const days = form.getAll('reminder-day').map(Number);
  if (!times.length || times.length > MAX_REMINDERS || times.some(time => !/^(?:[01][0-9]|2[0-3]):[0-5][0-9]$/.test(time))) {
    throw new Error('Vul voor elke herinnering een geldig tijdstip in.');
  }
  if (new Set(times).size !== times.length) throw new Error('Geef elke herinnering een ander tijdstip.');
  if (!days.length || new Set(days).size !== days.length || days.some(day => !EVERY_DAY.includes(day))) {
    throw new Error('Kies minstens één dag.');
  }
  return { times, days };
}

export async function savePush(pid, setup, schedule) {
  const { times, days } = schedule;
  const minutes = times.map(time => Number(time.slice(0, 2)) * 60 + Number(time.slice(3)));
  // Call subscribe directly from the user's gesture. The service worker and key are already ready.
  const subscription = setup.subscription ?? await setup.registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: setup.key });
  try {
    await pushRequest(pid, 'save', {
      subscription: subscription.toJSON(),
      ...(setup.customSchedule ? { minutes, days } : { count: times.length }),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Brussels',
    });
  } catch (error) {
    if (!setup.subscription) await subscription.unsubscribe().catch(() => {});
    throw error;
  }
  setup.subscription = subscription;
  localStorage.setItem(PREFERENCE, JSON.stringify({ profile: pid, times, days }));
}

export async function stopPush(pid) {
  if (!pushPreference(pid)) return;
  const registration = await navigator.serviceWorker?.getRegistration();
  const subscription = await registration?.pushManager?.getSubscription();
  if (subscription) {
    let remoteStopped = false;
    try {
      await pushRequest(pid, 'remove', { endpoint: subscription.endpoint });
      remoteStopped = true;
    } catch (error) {
      if (!await subscription.unsubscribe()) throw error;
    }
    if (remoteStopped) await subscription.unsubscribe().catch(() => {});
  }
  localStorage.removeItem(PREFERENCE);
}

export async function testPush(pid, setup) {
  if (!setup.subscription) throw new Error('Zet meldingen eerst aan op dit toestel.');
  await pushRequest(pid, 'test', { endpoint: setup.subscription.endpoint });
}
