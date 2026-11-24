import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { extname, join, resolve, sep } from 'node:path';
import { after, before, test } from 'node:test';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const baseline = process.env.ATHENAEUM_BASELINE;
const upgradeScope = '/Athenaeum-upgrade/';
const currentScope = '/Athenaeum/';
let upgradeRoot = baseline;
const { chromium, devices, webkit } = createRequire(import.meta.url)('playwright');
const types = { '.html':'text/html', '.js':'text/javascript', '.mjs':'text/javascript', '.css':'text/css',
  '.json':'application/json', '.webmanifest':'application/manifest+json', '.svg':'image/svg+xml', '.png':'image/png',
  '.jpg':'image/jpeg', '.woff2':'font/woff2' };
const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const upgrade = Boolean(upgradeRoot && pathname.startsWith(upgradeScope));
    if (!upgrade && !pathname.startsWith(currentScope)) throw new Error('Outside test path');
    const relative = pathname.slice((upgrade ? upgradeScope : currentScope).length);
    const base = resolve(upgrade ? upgradeRoot : root);
    let file = resolve(base, relative);
    if ((file !== base && !file.startsWith(base + sep)) || relative.split('/').some(part => part.startsWith('.'))) {
      throw new Error('Outside test root');
    }
    if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
    response.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream', 'cache-control':'no-store' });
    response.end(await readFile(file));
  } catch {
    if (!response.headersSent) response.writeHead(404);
    response.end();
  }
});

let browser;
let baseURL;
before(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  baseURL = 'http://127.0.0.1:' + server.address().port + currentScope;
  browser = await chromium.launch({ executablePath:process.env.ATHENAEUM_CHROMIUM || undefined });
});
after(async () => {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
});

async function noOverflow(page, section) {
  const width = await page.evaluate(() => ({
    content: document.documentElement.scrollWidth, screen: document.documentElement.clientWidth,
  }));
  assert(width.content <= width.screen + 1, section + ' loopt horizontaal over: ' + width.content + '/' + width.screen);
}

async function rectOfGlobe(page) {
  const frame = page.locator('#atlas-globe[data-ready=true]');
  const canvas = frame.locator('canvas');
  await canvas.waitFor({ state:'visible' });
  assert.equal(await frame.locator('.atlas-loading').isHidden(), true);
  const drawing = await canvas.evaluate(node => {
    const bounds = node.getBoundingClientRect();
    const context = node.getContext('2d');
    const alpha = context.getImageData(Math.floor(node.width/2), Math.floor(node.height/2), 1, 1).data[3];
    return { width:bounds.width, height:bounds.height, alpha };
  });
  assert(drawing.width >= 300 && drawing.height >= 300 && drawing.alpha > 0, JSON.stringify(drawing));
  return drawing;
}

test('Diagnostica toont de juiste vrijgaveversie', { timeout:20_000 }, async () => {
  const context = await browser.newContext({ serviceWorkers:'block' });
  const page = await context.newPage();
  try {
    await page.goto(baseURL + 'DEPLOY_CHECK.html');
    const version = JSON.parse(await readFile(join(root,'version.json'),'utf8'));
    await page.getByText('Versie ' + version.version + ' · ' + version.channel, {exact:true}).first().waitFor();
    await page.getByText('12 van 12 controles geslaagd.', {exact:true}).waitFor();
  } finally {
    await context.close();
  }
});

for (const viewport of [{width:1440,height:900}, {width:820,height:1180}, {width:390,height:844}]) {
  test('Navigatie en atlas op ' + viewport.width + ' px', { timeout:30_000 }, async () => {
    const context = await browser.newContext({ viewport, hasTouch:viewport.width <= 820, reducedMotion:'reduce', serviceWorkers:'block' });
    const page = await context.newPage();
    page.setDefaultTimeout(10_000);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    try {
      await page.goto(baseURL + 'leer/');
      await page.waitForURL('**/#leer');
      await page.locator('#page-content').getByRole('heading', { name:/Studium/ }).first().waitFor();
      const menu = page.locator('.app-menu');
      if (await menu.isVisible()) {
        const mobileNav = page.locator('#mobile-nav');
        assert.deepEqual(await mobileNav.locator('a').evaluateAll(links => links.map(link => link.hash)),
          ['#vandaag','#zoeken','#paideia','#talen','#toetsen','#meer']);
        await menu.locator('summary').click();
        await menu.getByRole('link', {name:/Traditio/}).click();
      } else {
        await page.locator('#desktop-nav').getByRole('link', {name:/Traditio/}).click();
      }
      await page.locator('#page-content').getByRole('heading', {name:/Traditio/}).first().waitFor();
      await noOverflow(page, 'Traditio');

      await page.goto(baseURL + '#paideia/atlas/alles');
      await rectOfGlobe(page);
      const canvas = page.locator('#atlas-globe canvas');
      await canvas.focus();
      await canvas.press('+');
      assert.match(await page.locator('#atlas-map-status').textContent(), /×/);
      await page.locator('#atlas-year').fill('100 n.Chr.');
      await page.locator('#atlas-search').fill('Massilia');
      const city = page.locator('#atlas-city-list').getByRole('link', {name:/Massilia.*Marseille/});
      await city.waitFor();
      await page.locator('#atlas-year').fill('2100');
      await page.locator('#atlas-city-list').getByRole('link', {name:/Marseille/}).click();
      await page.getByRole('link', {name:'Uitgebreid studeren'}).click();
      const mark = page.getByRole('button', {name:'Markeer als gelezen'});
      await mark.click();
      await page.waitForFunction(() => document.querySelector('[data-action="history-read"]')?.getAttribute('aria-pressed') === 'true');
      await page.reload();
      await page.waitForFunction(() => document.querySelector('[data-action="history-read"]')?.getAttribute('aria-pressed') === 'true');
      await noOverflow(page, 'Les');

      await page.goto(baseURL + '#paideia/chronologie/alles');
      await page.locator('#chronology-query').fill('44 v.Chr.');
      await page.locator('#chronology-form button[type=submit]').click();
      await page.getByText('Senatoren vermoorden Caesar', {exact:true}).waitFor();
      await noOverflow(page, 'Chronologia');

      await page.goto(baseURL + '#talen/la');
      await page.locator('#page-content').getByRole('heading', {name:/Latijn/}).first().waitFor();
      await noOverflow(page, 'Latijn');

      await page.goto(baseURL + '#scriptorium');
      await page.locator('#page-content').getByRole('heading', {name:/Scriptorium/}).first().waitFor();
      await page.getByRole('link', {name:'Open Scriptorium'}).click();
      await page.locator('#page-dashboard').getByRole('button', {name:'Alles bekijken'}).click();
      await page.locator('#page-corpus').getByRole('heading', {name:'Corpus',exact:true}).waitFor();
      await noOverflow(page, 'Scriptorium');
      assert.deepEqual(errors, []);
    } finally {
      await context.close();
    }
  });
}

for (const device of ['Pixel 7','iPhone 13','iPad Pro 11']) {
  test('Atlasbediening met aanraakprofiel ' + device, { timeout:30_000 }, async () => {
    const profile = devices[device];
    const engine = profile.defaultBrowserType === 'webkit' ? await webkit.launch() : browser;
    const context = await engine.newContext({ ...profile, reducedMotion:'reduce' });
    const page = await context.newPage();
    page.setDefaultTimeout(10_000);
    try {
      await page.goto(baseURL + '#paideia/atlas/alles');
      await rectOfGlobe(page);
      await page.getByRole('button', { name:'Inzoomen' }).tap();
      assert.match(await page.locator('#atlas-map-status').textContent(), /×/);
      await noOverflow(page, device);
      await page.getByLabel('Historische tijdslaag').fill('100 n.Chr.');
      await page.getByLabel('Zoek een stad of regio').fill('Massilia');
      await page.locator('#atlas-city-list').getByRole('link', { name:/Massilia.*Marseille/ }).tap();
      await page.getByRole('link', { name:'Uitgebreid studeren' }).tap();
      await page.getByRole('button', { name:'Markeer als gelezen' }).waitFor();
      await noOverflow(page, device + ' les');
    } finally {
      await context.close();
      if (engine !== browser) await engine.close();
    }
  });
}

test('Herstel van de kustlijn en de kaartmodule binnen dezelfde pagina', { timeout:30_000 }, async () => {
  const context = await browser.newContext({ viewport:{width:390,height:844}, serviceWorkers:'block', reducedMotion:'reduce' });
  const page = await context.newPage();
  try {
    let unavailable = true;
    await page.route('**/atlas-land.json?*', route => unavailable
      ? route.fulfill({status:503, body:'Fixture'}) : route.continue());
    await page.goto(baseURL + '#paideia/atlas/alles');
    await page.getByText('De kaartbestanden konden niet laden.', { exact:false }).waitFor();
    await page.locator('#atlas-year').fill('100 n.Chr.');
    await page.locator('#atlas-search').fill('Massilia');
    const opened = await page.evaluate(() => performance.timeOrigin);
    unavailable = false;
    await page.getByRole('button', {name:'Kaart opnieuw laden'}).click();
    await rectOfGlobe(page);
    assert.equal(await page.evaluate(() => performance.timeOrigin), opened);
    assert.equal(await page.locator('#atlas-year').inputValue(), '100 n.Chr.');
    assert.equal(await page.locator('#atlas-search').inputValue(), 'Massilia');
    assert.match(await page.locator('#atlas-map-status').textContent(), /Massilia/);

    await page.route(url => url.pathname.endsWith('/atlas-globe.js') && url.search === '?v=142',
      route => route.fulfill({status:503,body:'Fixture'}));
    await page.reload();
    await page.getByRole('button', {name:'Kaart opnieuw laden'}).waitFor();
    const moduleRetry = page.waitForRequest(url => url.url().includes('atlas-globe.js?v=142-retry'));
    await page.getByRole('button', {name:'Kaart opnieuw laden'}).click();
    await moduleRetry;
    await rectOfGlobe(page);
  } finally {
    await context.close();
  }
});

test('De wereldbol en een les blijven bruikbaar bij een offline herstart', { timeout:30_000 }, async () => {
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    await page.goto(baseURL + '#paideia/atlas/alles');
    await rectOfGlobe(page);
    const cached = await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.ready;
      const channel = new MessageChannel();
      return new Promise(resolve => {
        channel.port1.onmessage = event => resolve(event.data.ok);
        registration.active.postMessage({type:'CACHE_LEARNING'}, [channel.port2]);
      });
    });
    assert.equal(cached, true);
    await context.setOffline(true);
    await page.reload();
    await rectOfGlobe(page);
    await page.locator('#atlas-search').fill('Marseille');
    await page.locator('#atlas-city-list').getByRole('link', { name:/Marseille/ }).click();
    await page.getByRole('link', { name:'Uitgebreid studeren' }).click();
    await page.getByRole('button', { name:'Markeer als gelezen' }).waitFor();
  } finally {
    await context.close();
  }
});

test('Een upgrade van 1.4.1 bewaart lokaal lezen en activeert de nieuwe offlinecache', {
  timeout:30_000, skip:!baseline,
}, async () => {
  const context = await browser.newContext();
  const page = await context.newPage();
  const lessonURL = new URL(upgradeScope + '#les/atlas-marseille-massalia', baseURL).href;
  try {
    await page.goto(lessonURL);
    assert.match(await page.locator('#academy-entry').getAttribute('src'), /v=141$/);
    await page.getByRole('button', {name:'Markeer als gelezen'}).click();
    await page.locator('[data-action="history-read"][aria-pressed=true]').waitFor();
    await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));

    upgradeRoot = root;
    await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.ready;
      const changed = new Promise(resolve => navigator.serviceWorker.addEventListener('controllerchange', resolve, {once:true}));
      await registration.update();
      await changed;
    });
    await page.reload();
    assert.match(await page.locator('#academy-entry').getAttribute('src'), /v=142$/);
    await page.locator('[data-action="history-read"][aria-pressed=true]').waitFor();
    const cacheNames = await page.evaluate(() => caches.keys());
    assert(cacheNames.some(name => name === 'athenaeum-learning:' + upgradeScope + ':1.4.2-142'));
    await page.goto(new URL(upgradeScope + '#paideia/atlas/alles', baseURL).href);
    await rectOfGlobe(page);
  } finally {
    upgradeRoot = baseline;
    await context.close();
  }
});

test('Een weekexamen bewaart de zelfbeoordeling naast de automatische score', { timeout:30_000 }, async () => {
  const context = await browser.newContext({ serviceWorkers:'block' });
  const page = await context.newPage();
  page.setDefaultTimeout(8_000);
  try {
    await page.goto(baseURL + '#les/atlas-marseille-massalia');
    await page.getByRole('button', {name:'Markeer als gelezen'}).click();
    await page.locator('[data-action="history-read"][aria-pressed=true]').waitFor();
    await page.goto(baseURL + '#toetsen');
    await page.getByRole('button', {name:'Bekijk weekexamen'}).click();
    await page.getByRole('button', {name:'Start toets'}).click();
    for (let number = 1; number <= 3; number++) {
      await page.getByText('Vraag ' + number + ' van 3', {exact:true}).waitFor();
      if (await page.locator('textarea#answer').isVisible()) {
        await page.locator('textarea#answer').fill('Een antwoord uit de browsertest.');
        await page.locator('[data-action=submit-answer]').click();
      } else {
        await page.locator('[data-action=skip-question]').click();
      }
    }
    await page.waitForURL('**/#resultaat/**');
    const assess = page.getByRole('button', {name:'Voldoet aan de criteria'});
    for (const remaining of [2,1]) {
      assert.equal(await assess.count(), remaining);
      await assess.first().click();
      await page.getByText(3 - remaining + (remaining === 2 ? ' antwoord zelf beoordeeld.' : ' antwoorden zelf beoordeeld.'), {exact:true}).waitFor();
    }
    await page.getByRole('heading', {name:'0 van 1 automatisch juist zonder hulp'}).waitFor();
    await page.reload();
    await page.getByRole('heading', {name:'0 van 1 automatisch juist zonder hulp'}).waitFor();
    await page.getByText('2 antwoorden zelf beoordeeld.', {exact:true}).waitFor();
  } finally {
    await context.close();
  }
});

test('Vijf gelijktijdige lokale profielen bewaren en synchroniseren gescheiden leergegevens', { timeout:30_000 }, async () => {
  const context = await browser.newContext({ serviceWorkers:'block' });
  const page = await context.newPage();
  try {
    await page.goto(baseURL);
    const result = await page.evaluate(async () => {
      const { record, storeRecords, readRecords, syncLearning } = await import('./academy/storage.js?v=142');
      const profiles = Array.from({length:5}, (_, index) => 'test-profiel-' + index);
      const server = new Map(profiles.map(profile => [profile,new Map()]));
      let active = 0;
      let peak = 0;
      const at = Date.now();
      window.AthSync = {
        cfg: profile => ({user:{id:profile},url:'http://fixture.invalid'}),
        access: async profile => 'test-' + profile,
        async request(profile, route, request) {
          if (request.headers.Authorization !== 'Bearer test-' + profile) throw new Error('Fixture-account verschilt');
          const rows = server.get(profile);
          active++;
          peak = Math.max(peak, active);
          try {
            await new Promise(resolve => setTimeout(resolve, 30));
            if (request.method === 'POST') {
              const {p_records: batch} = JSON.parse(request.body);
              if (batch.some(row => row.payload.blocked)) throw Object.assign(new Error('Fixture-limiet'), {code:'23514'});
              for (const row of batch) rows.set(row.record_id, {...row,saved_at:new Date(at).toISOString()});
            } else {
              if (new URLSearchParams(route.split('?')[1]).get('user_id') !== 'eq.' + profile) {
                throw new Error('Fixture-eigenaar verschilt');
              }
              return [...rows.values()];
            }
          } finally {
            active--;
          }
        },
      };
      await Promise.all(profiles.map(profile => Promise.all([
        storeRecords(profile, [record('prefs','shared-id',{owner:profile},at)]),
        storeRecords(profile, [record('prefs','newer-id',{owner:profile},at+1)]),
      ])));
      await storeRecords(profiles[0], [
        record('deck','too-large',{text:'X'.repeat(260000)},at+2),
        record('deck','server-rejected',{blocked:true},at+3),
      ]);
      localStorage.setItem('academy_cursor_' + profiles[0] + '_' + profiles[0], 'ongeldig');
      const syncing = await Promise.all(profiles.map(syncLearning));
      const local = await Promise.all(profiles.map(async profile => (await readRecords(profile)).map(row => ({
        id:row.id, owner:row.data.owner, pending:row.pending,
      }))));
      return { peak, local, blocked:syncing.map(row => row.blocked), server:[...server.values()].map(rows => rows.size) };
    });
    assert.equal(result.peak, 5);
    assert.deepEqual(result.blocked, [2,0,0,0,0]);
    assert.deepEqual(result.server, [2,2,2,2,2]);
    for (let index = 0; index < result.local.length; index++) {
      const rows = result.local[index];
      assert(rows.filter(row => row.owner === 'test-profiel-' + index && !row.pending).length === 2);
      assert.equal(rows.filter(row => row.pending).length, index === 0 ? 2 : 0);
    }
  } finally {
    await context.close();
  }
});
