const PREFERENCE = 'athenaeum-push-preferences';
const ENDPOINT = '/functions/v1/athenaeum-webpush';
export const NOTIFICATION_TIMES = ['09.30', '15.30', '20.30'];

export function pushSupport() {
  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent) || navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  if (ios && !navigator.standalone && !matchMedia('(display-mode: standalone)').matches) return 'install';
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) return 'unsupported';
  return Notification.permission === 'denied' ? 'blocked' : 'available';
}

export function pushPreference(pid) {
  try {
    const value = JSON.parse(localStorage.getItem(PREFERENCE) || 'null');
    return value?.profile === pid ? value : null;
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
    return { registration, key: decodeKey(keys.publicKey), subscription: await registration.pushManager.getSubscription() };
  } finally {
    clearTimeout(timer);
  }
}

export async function savePush(pid, setup, count) {
  if (![1, 2, 3].includes(count)) throw new Error('Kies één, twee of drie herinneringen.');
  // Call subscribe directly from the user's gesture. The service worker and key are already ready.
  const subscription = await setup.registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: setup.key });
  try {
    await pushRequest(pid, 'save', {
      subscription: subscription.toJSON(), count, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Brussels',
    });
  } catch (error) {
    if (!setup.subscription) await subscription.unsubscribe().catch(() => {});
    throw error;
  }
  setup.subscription = subscription;
  localStorage.setItem(PREFERENCE, JSON.stringify({ profile: pid, count }));
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
