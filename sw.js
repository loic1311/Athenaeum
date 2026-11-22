const VERSION = 'athenaeum-learning-v1.3.9';
const BASE = new URL(self.registration.scope);
const CORE = [
  './', './index.html', './leer/', './manifest.webmanifest', './classic.html', './shared/style.css',
  './academy/style.css?v=13r10', './academy/app.js?v=13r10', './academy/views.js?v=13r10', './academy/daily.js?v=13r9', './academy/daily-view.js?v=13r9', './academy/research.js?v=13r9',
  './academy/research-data.js?v=13r1', './academy/research-import.js?v=13r8', './academy/scriptorium.js?v=13r9',
  './academy/study-notes.js?v=13r6', './academy/practice.js?v=13r8', './academy/practice-content.js?v=13r1',
  './academy/language-topics.js?v=13r1', './academy/language-lessons.js?v=13r6',
  './academy/content/fr-pharmacie.js?v=13r3', './academy/content/fr-niveaux.js?v=13r5', './academy/content/it-spreken.js?v=13r6',
  './academy/history-curriculum.js?v=13r8', './academy/history-chronology.js?v=13r9',
  './academy/content/history-source.js?v=13r8', './academy/content/history-antiquity.js?v=13r8',
  './academy/content/history-medieval.js?v=13r8', './academy/content/history-earlymodern.js?v=13r8',
  './academy/content/history-world.js?v=13r8',
  './academy/history-archive.js?v=13r10', './academy/history-explorer.js?v=13r10',
  './academy/history-explorer-view.js?v=13r10', './academy/history-reading.js?v=13r9',
  './academy/weekly-exam.js?v=13r9', './academy/atlas-globe.js?v=13r10',
  './academy/vendor/d3-array.min.mjs', './academy/vendor/d3-geo.min.mjs',
  './academy/content/atlas-land.json?v=13r9', './assets/sources/magna-carta-1215.jpg',
  './academy/content/history-extension.js?v=13r9', './academy/content/history-marseille.js?v=13r9',
  './academy/content/history-cities.js?v=13r9', './academy/content/history-western-cities.js?v=13r10', './academy/content/history-primary.js?v=13r9',
  './academy/content/history-depth.js?v=13r9', './academy/content/history-depth-early.js?v=13r9',
  './academy/content/history-depth-modern.js?v=13r9', './academy/content/history-depth-late.js?v=13r9', './academy/content/history-depth-regions.js?v=13r9',
  './academy/lesson-search.js?v=13r9', './academy/streak.js?v=13r9', './academy/notifications.js?v=13r6',
  './academy/storage.js', './academy/learning.js?v=13r8', './academy/cloud.js?v=13r2', './academy/importer.js?v=13r8',
  './shared/store.js', './shared/sync.js', './assets/icons/icon-192.png', './assets/icons/icon-512.png',
  './assets/logos/athenaeum.svg', './assets/logos/athenaeum-192.png',
];
const LESSONS = ['greek', 'roman', 'history', 'knowledge', 'it', 'fr'].map(track => './academy/content/' + track + '.json?v=13r1');
LESSONS.push('./academy/content/primary-cases.json?v=13r1');
const DOCUMENT_TOOLS = ['./academy/vendor/pdf.min.mjs', './academy/vendor/pdf.worker.min.mjs', './academy/vendor/jszip.min.js'];
const WARM = new Set([...CORE, ...LESSONS, ...DOCUMENT_TOOLS].map(path => new URL(path, BASE).href));

async function preload(paths) {
  const cache = await caches.open(VERSION);
  await cache.addAll(paths.map(path => new Request(new URL(path, BASE), { cache: 'reload' })));
}

self.addEventListener('install', event => event.waitUntil((async () => {
  await preload([...CORE, ...LESSONS]);
  await self.skipWaiting();
})()));

self.addEventListener('activate', event => event.waitUntil((async () => {
  for (const key of await caches.keys()) {
    if ((key.startsWith('athenaeum-learning-') || key.startsWith('athenaeum-v')) && key !== VERSION) await caches.delete(key);
  }
  await self.clients.claim();
})()));

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== BASE.origin || !url.pathname.startsWith(BASE.pathname)) return;
  const navigation = event.request.mode === 'navigate';
  const warm = WARM.has(url.href);
  const legacyAsset = url.pathname.startsWith(BASE.pathname + 'apps/');
  if (!navigation && !warm && !legacyAsset) return;
  event.respondWith((async () => {
    const cache = await caches.open(VERSION);
    if (warm && !navigation) {
      const hit = await cache.match(event.request);
      if (hit) return hit;
    }
    try {
      const response = await fetch(event.request);
      if (response.ok) await cache.put(event.request, response.clone()).catch(() => {});
      if (response.status < 500) return response;
    } catch { /* Look for the downloaded page or lesson. */ }
    const cached = await cache.match(event.request) ?? await cache.match(event.request, { ignoreSearch: true });
    if (cached) return cached;
    if (navigation && [BASE.pathname, BASE.pathname + 'index.html'].includes(url.pathname)) {
      const home = await cache.match(new URL('./index.html', BASE));
      if (home) return home;
    }
    return new Response('Open Athenaeum online om dit onderdeel te laden.', { status: 503 });
  })());
});

self.addEventListener('message', event => {
  if (event.data?.type === 'CACHE_LEARNING') {
    event.waitUntil(preload([...CORE, ...LESSONS, ...DOCUMENT_TOOLS]).then(
      () => event.ports[0]?.postMessage({ ok: true }),
      () => event.ports[0]?.postMessage({ ok: false }),
    ));
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
