import webPush from 'npm:web-push@3.6.7';

const supabase = Deno.env.get('SUPABASE_URL')!;
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
const app = 'https://loic1311.github.io/Athenaeum/';
const origin = new URL(app).origin;
const devices = '/rest/v1/athenaeum_webpush_devices';
const pushHosts = new Set(['fcm.googleapis.com', 'updates.push.services.mozilla.com', 'web.push.apple.com']);

type Subscription = { endpoint: string; keys: { p256dh: string; auth: string } };
type Vapid = { public_key: string; private_key: string };
type Config = { vapid: Vapid | null; dispatcher: string };
type Due = { subscription: Subscription; minute: number; day: string; studied_yesterday: boolean };
let storedConfig: Config | undefined;

const messages: readonly (readonly string[])[] = [
  [
    'Goeiemorgen! 🌿 Zin in twee minuutjes leren?',
    'Goedemorgen, nieuwsgierige geest! 🏛️ Wat wil je vandaag ontdekken?',
    'Koffie erbij? ☕ Eén oefening en je dag is goed begonnen.',
  ],
  [
    'Ben je het werken al beu? 🥺 Neem een studiepauze van twee minuten.',
    'Pauze! ✨ Kom nog even oefenen. Eén vraag tegelijk is ook vooruitgang.',
    'Tijd voor iets anders? 📚 Een korte les wacht op je.',
  ],
  [
    'Nog twee minuutjes voor het slapen? 🌙 Kies een korte oefening.',
    'Nog even studeren? 🧠 Met één oefening telt vandaag mee.',
    'Sluit je dag af met iets dat je geleerd hebt. 🌟',
  ],
];
const eveningStreak = [
  'Je reeks kan vandaag nog verder. 🔥 Rond één korte oefening af!',
  'Je bent goed bezig! 🌙 Met één oefening geef je je reeks er een dag bij.',
  'Een klein studiemoment, een dag erbij. 🧊 Kom nog even oefenen!',
];

function reply(data: unknown, status = 200) {
  return new Response(status === 204 ? null : JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
    },
  });
}

async function database(path: string, method = 'GET', value?: unknown, prefer?: string) {
  const headers: Record<string, string> = {
    apikey: serviceKey, Authorization: 'Bearer ' + serviceKey, 'Content-Type': 'application/json',
  };
  if (prefer) headers.Prefer = prefer;
  const response = await fetch(supabase + path, {
    method, headers, body: value === undefined ? undefined : JSON.stringify(value),
    signal: AbortSignal.timeout(7000),
  });
  if (!response.ok) throw new Error('Database request failed: ' + response.status);
  const payload = await response.text();
  return payload ? JSON.parse(payload) : null;
}

const rpc = (name: string, data: unknown = {}) => database('/rest/v1/rpc/' + name, 'POST', data);

async function getConfig(generate = false): Promise<Config> {
  let config = storedConfig ?? await rpc('athenaeum_webpush_secrets') as Config;
  if (!config?.dispatcher) throw new Error('Push scheduler credentials missing');
  if (generate && !config.vapid) {
    const keys = webPush.generateVAPIDKeys();
    config = await rpc('athenaeum_webpush_secrets', { p_public: keys.publicKey, p_private: keys.privateKey }) as Config;
  }
  if (config.vapid) storedConfig = config;
  return config;
}

async function account(req: Request): Promise<string | undefined> {
  const authorization = req.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) return;
  const response = await fetch(supabase + '/auth/v1/user', {
    headers: { apikey: anonKey, Authorization: authorization }, signal: AbortSignal.timeout(6500),
  });
  if (!response.ok) return;
  const user = await response.json();
  return typeof user.id === 'string' ? user.id : undefined;
}

function validEndpoint(value: unknown): value is string {
  if (typeof value !== 'string' || value.length > 1200) return false;
  try {
    const endpoint = new URL(value);
    return endpoint.protocol === 'https:' && !endpoint.port && !endpoint.username && !endpoint.password &&
      !endpoint.hash && endpoint.href === value &&
      (pushHosts.has(endpoint.hostname) || /^web-[a-z0-9-]+\.push\.apple\.com$/.test(endpoint.hostname) ||
        /^[a-z0-9-]+\.notify\.windows\.com$/.test(endpoint.hostname));
  } catch {
    return false;
  }
}

function subscriptionOf(value: unknown): Subscription | null {
  if (!value || typeof value !== 'object') return null;
  const { endpoint, keys } = value as Subscription;
  if (!validEndpoint(endpoint) || typeof keys?.p256dh !== 'string' || !/^[A-Za-z0-9_-]{87}$/.test(keys.p256dh) ||
      typeof keys?.auth !== 'string' || !/^[A-Za-z0-9_-]{22}$/.test(keys.auth)) return null;
  return { endpoint, keys: { p256dh: keys.p256dh, auth: keys.auth } };
}

const legacyTimes = [570, 930, 1230];
const everyDay = [1, 2, 3, 4, 5, 6, 7];

function validSchedule(values: unknown, maxLength: number, min: number, max: number): values is number[] {
  return Array.isArray(values) && values.length > 0 && values.length <= maxLength &&
    new Set(values).size === values.length && values.every(value => Number.isInteger(value) && value >= min && value <= max);
}

const byEndpoint = (endpoint: string) => devices + '?endpoint=eq.' + encodeURIComponent(endpoint);

async function deliver(subscription: Subscription, vapid: Vapid, body: string, slot: string) {
  if (!subscriptionOf(subscription)) return false;
  const details = webPush.generateRequestDetails(subscription, JSON.stringify({ body, slot }), {
    vapidDetails: { subject: app, publicKey: vapid.public_key, privateKey: vapid.private_key },
    TTL: 1800, urgency: 'normal',
  });
  const headers = new Headers(details.headers);
  headers.delete('Content-Length');
  const response = await fetch(details.endpoint, {
    method: details.method, headers, body: details.body, redirect: 'error', signal: AbortSignal.timeout(6500),
  });
  await response.body?.cancel();
  if (response.status === 404 || response.status === 410) await database(byEndpoint(subscription.endpoint), 'DELETE');
  return response.ok;
}

function reminder(device: Due) {
  const evening = device.minute >= 1080;
  const choices = evening && device.studied_yesterday ? eveningStreak : messages[evening ? 2 : device.minute < 720 ? 0 : 1];
  const day = Math.floor(Date.parse(device.day) / 86400000);
  return choices[(day + device.minute) % choices.length];
}

async function dispatch(req: Request) {
  const token = req.headers.get('X-Athenaeum-Scheduler') ?? '';
  if (!/^[0-9a-f]{64}$/.test(token)) return reply({ error: 'Toegang geweigerd.' }, 403);
  const config = await getConfig();
  const differs = [...token].reduce((diff, c, i) => diff | (c.charCodeAt(0) ^ config.dispatcher.charCodeAt(i)), 0);
  if (differs) return reply({ error: 'Toegang geweigerd.' }, 403);
  const vapid = (await getConfig(true)).vapid!;
  const due = await rpc('athenaeum_webpush_due_times') as Due[];
  let sent = 0;
  for (let offset = 0; offset < due.length; offset += 8) {
    const results = await Promise.allSettled(due.slice(offset, offset + 8).map(device =>
      deliver(device.subscription, vapid, reminder(device), device.day + '-m' + device.minute)));
    sent += results.filter(result => result.status === 'fulfilled' && result.value).length;
  }
  if (sent < due.length) console.warn('Web Push delivery incomplete', { sent, due: due.length });
  return reply({ due: due.length, sent });
}

Deno.serve(async (req: Request) => {
  if (req.headers.has('Origin') && req.headers.get('Origin') !== origin) return reply({ error: 'Onbekende herkomst.' }, 403);
  if (req.method === 'OPTIONS') return reply(null, 204);
  if (req.method !== 'POST') return reply({ error: 'Ongeldige methode.' }, 405);
  try {
    const raw = await req.text();
    if (raw.length > 5000) return reply({ error: 'Ongeldig verzoek.' }, 413);
    const body = JSON.parse(raw);
    if (!body || typeof body !== 'object') return reply({ error: 'Ongeldig verzoek.' }, 400);
    if (body.action === 'dispatch') return await dispatch(req);

    const user = await account(req);
    if (!user) return reply({ error: 'Meld je eerst aan.' }, 401);
    if (body.action === 'config') return reply({ publicKey: (await getConfig(true)).vapid!.public_key, customSchedule: true });
    if (body.action === 'save') {
      const subscription = subscriptionOf(body.subscription);
      const legacy = body.minutes === undefined && [1, 2, 3].includes(body.count);
      const minutes = legacy ? legacyTimes.slice(-body.count) : body.minutes;
      const days = legacy ? everyDay : body.days;
      if (!subscription || typeof body.timezone !== 'string' || body.timezone.length > 80 ||
          !validSchedule(minutes, 24, 0, 1439) || !validSchedule(days, 7, 1, 7)) {
        return reply({ error: 'Kies geldige, verschillende tijdstippen en minstens één dag.' }, 400);
      }
      const saved = await rpc('athenaeum_webpush_set_schedule', {
        p_user: user, p_subscription: subscription, p_zone: body.timezone, p_minutes: minutes, p_days: days,
      });
      return saved ? reply({ ok: true }) : reply({ error: 'Dit toestel kon niet aan je meldingen worden gekoppeld.' }, 409);
    }
    if (!validEndpoint(body.endpoint)) return reply({ error: 'Ongeldig meldingsadres.' }, 400);
    const owner = byEndpoint(body.endpoint) + '&user_id=eq.' + encodeURIComponent(user);
    if (body.action === 'remove') {
      await database(owner, 'DELETE');
      return reply({ ok: true });
    }
    if (body.action === 'test') {
      const stale = new Date(Date.now() - 60_000).toISOString();
      const rows = await database(owner + '&or=' + encodeURIComponent('(tested_at.is.null,tested_at.lt.' + stale + ')') +
        '&select=subscription', 'PATCH', { tested_at: new Date().toISOString() }, 'return=representation');
      if (!rows?.length) return reply({ error: 'Zet meldingen eerst aan of wacht een minuut tussen testmeldingen.' }, 429);
      const sent = await deliver(rows[0].subscription, (await getConfig(true)).vapid!,
        'Gelukt! 🎉 Athenaeum kan je op dit toestel aan je studiemoment herinneren.', 'test');
      return sent ? reply({ ok: true }) : reply({ error: 'Je toestel is niet bereikt. Zet appmeldingen opnieuw aan.' }, 503);
    }
    return reply({ error: 'Onbekende actie.' }, 400);
  } catch (error) {
    if (error instanceof SyntaxError) return reply({ error: 'Ongeldig verzoek.' }, 400);
    console.error('Athenaeum Web Push request failed');
    return reply({ error: 'Meldingen zijn tijdelijk niet beschikbaar. Probeer het opnieuw.' }, 503);
  }
});
