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

async function openMarseilleLesson(page, touch = false) {
  const dossier = page.locator('#city-dossier');
  await dossier.getByRole('heading', {name:'Marseille · Historisch stadsdossier'}).waitFor();
  const show = dossier.getByText('Bijbehorende lessen en oefeningen', {exact:true});
  if (touch) await show.tap();
  else await show.click();
  const link = dossier.getByRole('link', {name:/Marseille · Massalia/});
  if (touch) await link.tap();
  else await link.click();
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
      await openMarseilleLesson(page);
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
      await openMarseilleLesson(page, true);
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

    await page.route(url => url.pathname.endsWith('/atlas-globe.js') && url.search === '?v=160',
      route => route.fulfill({status:503,body:'Fixture'}));
    await page.reload();
    await page.getByRole('button', {name:'Kaart opnieuw laden'}).waitFor();
    const moduleRetry = page.waitForRequest(url => url.url().includes('atlas-globe.js?v=160-retry'));
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
    await openMarseilleLesson(page);
    await page.getByRole('button', { name:'Markeer als gelezen' }).waitFor();
    await page.goto(baseURL + '#les/acad-aphrodisias-geld');
    await page.getByRole('button', { name:'Euergetisme', exact:true }).first().click();
    await page.getByRole('dialog').getByRole('heading', { name:'Euergetisme', exact:true }).waitFor();
  } finally {
    await context.close();
  }
});

test('Een upgrade bewaart lokaal lezen en een open dagles en activeert de nieuwe offlinecache', {
  timeout:50_000, skip:!baseline,
}, async () => {
  const context = await browser.newContext();
  const page = await context.newPage();
  const lessonURL = new URL(upgradeScope + '#les/atlas-marseille-massalia', baseURL).href;
  try {
    await page.goto(lessonURL);
    const before = await page.locator('#academy-entry').getAttribute('src');
    await page.getByRole('button', {name:'Markeer als gelezen'}).click();
    await page.locator('[data-action="history-read"][aria-pressed=true]').waitFor();
    await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
    const dailyURL = new URL(upgradeScope + '#dagles', baseURL).href;
    await page.goto(dailyURL);
    await page.getByLabel('Waar wil je vandaag op focussen?').selectOption('roman');
    await page.getByRole('button', {name:'Start mijn dagles'}).click();
    await page.getByRole('button', {name:'Bekijk de uitleg'}).click();
    await page.getByRole('button', {name:'Verder naar begeleid oefenen'}).click();
    await page.getByRole('button', {name:'Start deze stap'}).click();
    await page.getByRole('button', {name:'Start oefenen'}).click();
    const legacyQuestion = await page.locator('.question h1').textContent();
    await page.getByRole('button', {name:'Pauzeren'}).click();
    await page.getByRole('button', {name:'Hervat deze stap'}).waitFor();
    const previousData = await page.evaluate(async () => {
      const rows = await new Promise((resolve, reject) => {
        const database = indexedDB.open('athenaeum_learning');
        database.onerror = reject;
        database.onsuccess = () => {
          const store = database.result.transaction('records').objectStore('records').getAll();
          store.onerror = reject;
          store.onsuccess = () => resolve(store.result);
        };
      });
      return rows.map(row => [row.id,row.at,row.kind]);
    });

    upgradeRoot = root;
    await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.ready;
      const changed = new Promise(resolve => navigator.serviceWorker.addEventListener('controllerchange', resolve, {once:true}));
      await registration.update();
      await changed;
    });
    await page.reload();
    assert.notEqual(await page.locator('#academy-entry').getAttribute('src'), before);
    await page.getByRole('button', {name:'Hervat deze stap'}).click();
    assert.equal(await page.locator('.question h1').textContent(), legacyQuestion);
    const afterData = await page.evaluate(async () => {
      const { readRecords } = await import('./academy/storage.js?v=142');
      const id = window.AthStore.currentProfileId();
      return (await readRecords(id)).map(row => [row.id,row.at,row.kind]);
    });
    for (const original of previousData) assert(afterData.some(row => JSON.stringify(row) === JSON.stringify(original)));
    await page.goto(lessonURL);
    await page.locator('[data-action="history-read"][aria-pressed=true]').waitFor();
    const cacheNames = await page.evaluate(() => caches.keys());
    const assets = await readFile(join(root,'sw-assets.js'),'utf8');
    const version = assets.match(/"version": "([^"]+)"/)[1];
    assert(cacheNames.some(name => name === 'athenaeum-learning:' + upgradeScope + ':' + version));
    await page.goto(new URL(upgradeScope + '#paideia/atlas/alles', baseURL).href);
    await rectOfGlobe(page);
  } finally {
    upgradeRoot = baseline;
    await context.close();
  }
});

for (const viewport of [{width:1440,height:900}, {width:390,height:844}]) {
  test('Hodie van begripsuitleg tot bewaarde feedback op ' + viewport.width + ' px', { timeout:60_000 }, async () => {
    const context = await browser.newContext({ viewport, hasTouch:viewport.width <= 820, serviceWorkers:'block' });
    const page = await context.newPage();
    page.setDefaultTimeout(10_000);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const skipStage = async () => {
      const count = +(await page.locator('.quiz-count').textContent()).match(/\d+$/)[0];
      for (let i = 0; i < count; i++) {
        await page.getByRole('button', { name:'Sla over en bekijk uitwerking' }).click();
        await page.locator('[data-action="next-question"]').click();
      }
      await page.waitForURL('**/#dagles/**');
    };
    try {
      await page.goto(baseURL + '#dagles');
      await page.getByLabel('Waar wil je vandaag op focussen?').selectOption('ancient');
      await page.getByLabel('Hoe wil je oefenen?').selectOption('academic');
      await page.getByRole('button', {name:'Start mijn dagles'}).click();
      await page.getByRole('heading', {name:'Kennismaken'}).waitFor();
      await page.getByRole('button', {name:'Bekijk de uitleg'}).click();
      const term = page.locator('.daily-theory .study-term').first();
      await term.focus();
      await term.press('Enter');
      await page.getByRole('dialog').getByText('Voorbeeld', {exact:true}).waitFor();
      await page.keyboard.press('Escape');
      await page.getByRole('dialog').waitFor({state:'hidden'});
      assert.equal(await term.evaluate(element => element === document.activeElement), true);
      await noOverflow(page, 'Hodie-uitleg');
      await page.getByRole('button', {name:'Verder naar begeleid oefenen'}).click();
      await page.getByRole('button', {name:'Start deze stap'}).click();
      await page.getByRole('button', {name:'Start oefenen'}).click();
      await skipStage();
      await page.getByRole('heading', {name:'Zelf oefenen',exact:true}).waitFor();
      await page.getByRole('button', {name:'Start deze stap'}).click();
      await skipStage();

      await page.getByRole('heading', {name:'Toepassen',exact:true}).waitFor();
      await page.getByRole('button', {name:'Start deze stap'}).click();
      await page.getByText('Academische verdieping · Open vraag', {exact:true}).waitFor();
      await page.getByText('Bronmateriaal bij de vraag', {exact:true}).waitFor();
      await page.locator('#answer').fill('De bron ondersteunt een deel van de verklaring.');
      await page.getByRole('button', {name:'Verduidelijk de vraag'}).click();
      await page.getByRole('button', {name:'Krijg een inhoudelijke tip'}).click();
      await page.getByRole('button', {name:'Krijg een aanwijzing voor je aanpak'}).waitFor();
      assert.equal(await page.locator('.hint-list li').count(), 2);
      assert.equal(await page.locator('.model-answer').count(), 0);
      await page.getByRole('button', {name:'Vergelijk mijn antwoord'}).click();
      const criterion = page.locator('[data-rubric]').first();
      await criterion.selectOption('revise');
      await page.locator('[data-rubric-note]:not([hidden])').waitFor();
      await noOverflow(page, 'Hodie-feedback');
      await page.getByRole('button', {name:'Pauzeren'}).click();
      await page.getByRole('button', {name:'Hervat deze stap'}).waitFor();
      await page.reload();
      await page.getByRole('button', {name:'Hervat deze stap'}).click();
      await criterion.waitFor();
      assert.equal(await criterion.inputValue(), 'revise');
      await page.getByRole('button', {name:'Nog oefenen'}).click();
      await page.getByRole('button', {name:'Afronden'}).click();
      await page.getByRole('heading', {name:'Afronden',exact:true}).waitFor();
      await page.getByRole('button', {name:'Start deze stap'}).click();
      await skipStage();
      await page.getByRole('heading', {name:'Dagles afgerond'}).waitFor();
      await page.getByText('Antwoorden en feedback teruglezen', {exact:true}).click();
      await page.getByRole('link', {name:'Toepassen',exact:true}).click();
      await page.getByRole('heading', {name:'Zelfbeoordeling',exact:true}).waitFor();
      await page.locator('.unit-list > details > summary').click();
      await page.locator('[data-rubric-note]:not([hidden])').waitFor();
      await page.goto(baseURL + '#toetsen');
      await page.getByRole('button', {name:'Bekijk maandtoets'}).waitFor();
      await page.goto(baseURL + '#meer/meldingen');
      await page.getByRole('heading', {name:'Studieherinneringen',exact:true}).first().waitFor();
      assert.deepEqual(errors, []);
    } finally {
      await context.close();
    }
  });
}

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
    let open = 0;
    for (let number = 1; number <= 3; number++) {
      await page.getByText('Vraag ' + number + ' van 3', {exact:true}).waitFor();
      if (await page.locator('textarea#answer').isVisible()) {
        open++;
        await page.locator('textarea#answer').fill('Een antwoord uit de browsertest.');
        await page.locator('[data-action=submit-answer]').click();
      } else {
        await page.locator('[data-action=skip-question]').click();
      }
    }
    await page.waitForURL('**/#resultaat/**');
    assert(open >= 1 && open <= 2);
    const assess = page.getByRole('button', {name:'Voldoet aan de criteria'});
    const message = done => done + (done === 1 ? ' antwoord zelf beoordeeld.' : ' antwoorden zelf beoordeeld.');
    for (let done = 1; done <= open; done++) {
      await assess.first().click();
      await page.getByText(message(done), {exact:true}).waitFor();
    }
    const score = page.getByRole('heading', {name:'0 van ' + (3 - open) + ' automatisch juist zonder hulp'});
    await score.waitFor();
    await page.reload();
    await score.waitFor();
    await page.getByText(message(open), {exact:true}).waitFor();
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

test('De historische atlas reageert op jaartal, filters, vergelijken en Nu', { timeout:30_000 }, async () => {
  const context = await browser.newContext({ viewport:{width:390,height:844}, reducedMotion:'reduce', serviceWorkers:'block' });
  const page = await context.newPage();
  try {
    await page.goto(baseURL + '#paideia/atlas/alles');
    await rectOfGlobe(page);
    const year = page.getByLabel('Historische tijdslaag');
    const figures = page.getByRole('region', {name:'Historische entiteiten'});
    await year.fill('1200 v.Chr.');
    await figures.getByRole('button', {name:'Knossos',exact:true}).click();
    await page.locator('[data-atlas-history-selection]').getByText(/postpalatiale bewoning/).waitFor();
    await page.locator('[data-atlas-history-selection]').getByRole('link', {name:/Kreta na/}).waitFor();
    await page.getByLabel('Regio', {exact:true}).selectOption('Amerika');
    await figures.getByRole('button', {name:'San Lorenzo',exact:true}).waitFor();
    assert.equal(await figures.getByRole('button', {name:'Knossos',exact:true}).count(), 0);
    await page.getByLabel('Regio', {exact:true}).selectOption('');
    await year.fill('900 n.Chr.');
    const west = figures.getByRole('button', {name:'West-Francië',exact:true});
    await west.click();
    await page.getByRole('link', {name:/OpenHistoricalMap-bijdragers/}).waitFor();
    assert.equal(await figures.getByRole('button', {name:'Karolingische invloedssfeer',exact:true}).count(), 0);
    await page.getByLabel('Vergelijk met').fill('810 n.Chr.');
    const comparison = page.getByRole('region', {name:'Vergelijkende tijdslaag'});
    await comparison.getByRole('button', {name:'Karolingische invloedssfeer',exact:true}).click();
    await page.locator('[data-atlas-history-selection]').getByRole('heading', {name:'Karolingische invloedssfeer'}).waitFor();
    const slider = page.getByLabel('Tijdschuif', {exact:true});
    await slider.press('End');
    assert.equal(await slider.getAttribute('aria-valuetext'), 'Nu');
    await figures.waitFor({state:'hidden'});
    await page.locator('#atlas-city-list').getByRole('link', {name:/Marseille/}).waitFor();
    await noOverflow(page, 'Historische atlas');
  } finally {
    await context.close();
  }
});

test('Een academisch examen gebruikt de gewone toetsroute en toont de rubric na indiening', { timeout:30_000 }, async () => {
  const context = await browser.newContext({ serviceWorkers:'block' });
  const page = await context.newPage();
  try {
    await page.goto(baseURL + '#toetsen');
    await page.getByLabel('Examentype').selectOption('advanced');
    await page.getByLabel('Thema of vak').selectOption('aegean');
    await page.getByRole('button', {name:'Open academisch examen'}).click();
    await page.getByRole('button', {name:'Start toets'}).click();
    assert.equal(await page.getByText('Beoordeel je redenering', {exact:true}).count(), 0);
    for (let n = 1; n <= 4; n++) {
      await page.getByText('Vraag ' + n + ' van 4', {exact:true}).waitFor();
      await page.locator('#answer').fill('Een historische vergelijking in eigen woorden.');
      await page.locator('[data-action=submit-answer]').click();
    }
    await page.waitForURL('**/#resultaat/**');
    await page.getByText('Beoordeel je redenering', {exact:true}).first().waitFor();
    await page.getByRole('button', {name:'Voldoet aan de criteria'}).first().click();
    await page.getByText('1 antwoord zelf beoordeeld.', {exact:true}).waitFor();
    await page.reload();
    await page.getByText('1 antwoord zelf beoordeeld.', {exact:true}).waitFor();
  } finally {
    await context.close();
  }
});
