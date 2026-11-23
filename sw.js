importScripts('./sw-assets.js?v=141');
const BASE = new URL(self.registration.scope);
const CACHE_PREFIX = 'athenaeum-learning:' + BASE.pathname + ':';
const VERSION = CACHE_PREFIX + self.learningAssets.version;
const APP_SHELL = new URL('./index.html', BASE);
const PAIDEIA_HOME = new URL('./apps/paideia/', BASE);
const PAIDEIA_REDIRECT = new URL('index.html', PAIDEIA_HOME);
const ENTRY = './academy/app.js?v=141';
const REQUIRED = self.learningAssets.all;
const EXTRAS = self.learningAssets.extra;
const WARM = new Set([...REQUIRED, ...EXTRAS].map(path => new URL(path, BASE).href));

async function preload(paths) {
  const cache = await caches.open(VERSION);
  await cache.addAll(paths.map(path => new Request(new URL(path, BASE), { cache: 'reload' })));
}

self.addEventListener('install', event => event.waitUntil((async () => {
  await preload(self.learningAssets.initial);
  const cache = await caches.open(VERSION);
  const shell = await cache.match(APP_SHELL);
  if (!(await shell?.text())?.includes(ENTRY)) throw new Error('De appbestanden zijn nog niet samen beschikbaar.');
  await self.skipWaiting();
})()));

self.addEventListener('activate', event => event.waitUntil((async () => {
  const older = (await caches.keys()).filter(name => name.startsWith(CACHE_PREFIX) && name !== VERSION);
  await Promise.allSettled(older.slice(0, -1).map(name => caches.delete(name)));
  await self.clients.claim();
})()));

async function fetchPage(request) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4500);
  try { return await fetch(request, { signal: controller.signal }); }
  finally { clearTimeout(timer); }
}

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== BASE.origin || !url.pathname.startsWith(BASE.pathname)) return;
  const navigation = event.request.mode === 'navigate';
  const warm = WARM.has(url.href);
  const legacyAsset = url.pathname.startsWith(BASE.pathname + 'apps/');
  const academyAsset = url.pathname.startsWith(BASE.pathname + 'academy/');
  if (!navigation && !warm && !legacyAsset && !academyAsset) return;

  event.respondWith((async () => {
    const cache = await caches.open(VERSION);
    const rootPage = [BASE.pathname, APP_SHELL.pathname].includes(url.pathname);
    const oldPaideia = [PAIDEIA_REDIRECT.pathname, PAIDEIA_HOME.pathname].includes(url.pathname);
    if (warm && !navigation && event.request.cache !== 'reload') {
      const hit = await cache.match(event.request);
      if (hit) return hit;
    }

    // A tab that still runs an earlier release may request an older versioned module.
    if (!navigation && academyAsset && !warm && url.searchParams.has('v') && event.request.cache !== 'reload') {
      const previous = await caches.match(event.request);
      if (previous) return previous;
    }
    let response;
    try {
      response = navigation && (rootPage || oldPaideia) ? await fetchPage(event.request) : await fetch(event.request);
      if (response.ok) {
        if ((warm && !navigation) || (legacyAsset && !url.search)) {
          await cache.put(event.request, response.clone()).catch(() => {});
        }
        return response;
      }
      if (response.status < 500 && response.status !== 404) return response;
    } catch { /* A saved copy can still be read offline. */ }
    if (navigation && (rootPage || oldPaideia)) {
      const shell = await cache.match(rootPage ? APP_SHELL : PAIDEIA_REDIRECT);
      if (shell) return shell;
    }

    // A tab from the previous release can still request its original module URLs.
    const cached = await cache.match(event.request) ?? await caches.match(event.request);
    return cached ?? response ?? new Response('Open Athenaeum online om dit onderdeel te laden.', { status: 503 });
  })());
});

self.addEventListener('message', event => {
  const port = event.ports[0];
  if (event.data?.type === 'LEARNING_STATUS') {
    event.waitUntil(caches.open(VERSION).then(async cache => {
      const hits = await Promise.all(REQUIRED.map(path => cache.match(new URL(path, BASE))));
      port?.postMessage({ ok: hits.every(Boolean) });
    }).catch(() => port?.postMessage({ ok: false })));
  }
  if (event.data?.type === 'CACHE_LEARNING') {
    event.waitUntil(preload(REQUIRED).then(async () => {
      port?.postMessage({ ok: true });
      await Promise.allSettled(EXTRAS.map(path => preload([path])));
    }).catch(() => port?.postMessage({ ok: false })));
  }
});

self.addEventListener('push', event => {
  let payload = {};
  try { payload = event.data?.json() ?? {}; } catch { /* Use the standard study reminder. */ }
  const body = typeof payload.body === 'string' ? payload.body.slice(0, 180) : 'Zin in een korte oefening? 📚';
  const kind = payload.slot === 'test' ? 'test' : 'study';
  const slot = /^\d{4}-\d{2}-\d{2}-(?:[123]|m\d{1,4})$/.test(payload.slot) ? payload.slot : kind;
  event.waitUntil(self.registration.showNotification('Athenaeum', {
    body, tag: 'athenaeum-' + slot, icon: new URL('./assets/icons/icon-192.png', BASE).href, data: { kind },
  }));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const target = new URL(event.notification.data?.kind === 'test' ? './#meer/meldingen' : './?learn=1', BASE).href;
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const client = windows.find(window => window.url.startsWith(BASE.href));
    if (client) {
      const opened = await client.navigate(target).catch(() => null);
      if (opened) return opened.focus();
    }
    return self.clients.openWindow(target);
  })());
});
