const VERSION = 'athenaeum-learning-v1.3.1';
const BASE = new URL(self.registration.scope);
const CORE = [
  './', './index.html', './leer/', './manifest.webmanifest', './classic.html', './app.js', './shared/style.css', './shared/telegram.js',
  './academy/style.css?v=13r1', './academy/app.js?v=13r2', './academy/views.js?v=13r2', './academy/daily.js?v=13r1', './academy/daily-view.js?v=13r1', './academy/research.js?v=13r1',
  './academy/research-data.js?v=13r1', './academy/research-import.js?v=13r1', './academy/scriptorium.js?v=13r1',
  './academy/practice.js?v=13r1', './academy/practice-content.js?v=13r1',
  './academy/language-topics.js?v=13r1', './academy/language-lessons.js?v=13r1',
  './academy/content/fr-pharmacie.js?v=13r1', './academy/content/it-spreken.js?v=13r1',
  './academy/storage.js', './academy/learning.js', './academy/learning.js?v=13r1', './academy/cloud.js?v=13r2', './academy/importer.js',
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
