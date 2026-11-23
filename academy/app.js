import { EXAM_GOALS, LEVELS, ROUTES, TRACKS, shuffled, makePool, historyOf, isCorrect, hasAccentError, quickQuestions,
  languageQuestions, lessonQuestions, examQuestions, placementQuestions, placementPassed, estimateLevel, levelFor, tally } from './learning.js?v=13r8';
import { allPackKeys, byLessonId, loadedLessons, loadPacks, packFiles, packsForTracks, summaries } from './catalog.js?v=14r1';
import { chronologyPage, mountChronology, lessonExplorerLinks } from './history-timeline.js?v=14r1';
import { bindAtlasFilters } from './atlas-view.js?v=14r1';
import { progressOverview, validGoal } from './progress-overview.js?v=14r1';
import { belongsToHistoryTrack, chronologicalLessons, chronologyForLesson, chronologyYear, HISTORICAL_TRACKS,
  historyLessonHref, historyReadId, timelineScope } from './history-chronology.js?v=13r9';
import { ATLAS_PLACES, explorationJourney, explorationLessons, explorerHref } from './history-explorer.js?v=13r11';
import { academicPlanPage, atlasPage, eraPage, primaryPage } from './history-explorer-view.js?v=13r11';
import { weeklyExamQuestions, weeklyStudy } from './weekly-exam.js?v=13r9';
import { isLanguageTopic, LANGUAGE_SKILLS } from './language-topics.js?v=13r1';
import { record, readRecords, storeRecords, forgetRecords, backups, syncLearning, clearCloudLearning } from './storage.js';
import { generateLessons, readStudyFile, validDeck, MAX_IMPORT_CHARS } from './importer.js?v=13r8';
import { authenticate, authMessage, makeGuest } from './cloud.js?v=13r2';
import * as view from './views.js?v=13r11';
import { PACE, DAY_FOCI, STAGES, dayKey, archivedPlans, planDay, advanceDay, drillQuestions, tipsFor } from './daily.js?v=13r9';
import { checkSelection, completeSelection, practiceOptions, sequencePractice } from './practice.js?v=13r8';
import { dailyPage } from './daily-view.js?v=13r11';
import { findCases, findStudies, lessonSourceIndex, passageMatches, caseWitness, researchPage, researchMarkdown, RESEARCH_TABS,
  evidencePreview } from './research.js?v=13r11';
import { addResearchMaterial, comparisonFromForm, evidenceList, validComparison, MAX_COMPARISON_ROWS } from './research-data.js?v=13r1';
import { readResearchFile } from './research-import.js?v=13r8';
import { scriptoriumPaste, scriptoriumShell, scriptoriumTransferDialog, scriptoriumURL } from './scriptorium.js?v=13r11';
import { fetchJson } from './fetch-json.js?v=13r11';
import { searchLessons } from './lesson-search.js?v=13r9';
import { countsAsPractice, isStudyDay, studyRecordId } from './streak.js?v=13r9';
import { MAX_REMINDERS, readSchedule, preparePush, pushPreference, pushSupport, savePush, stopPush, testPush } from './notifications.js?v=13r6';

const main = document.querySelector('#main');
const pageContent = document.querySelector('#page-content');
const dialog = document.querySelector('#dialog');
const status = document.querySelector('#status');
const store = window.AthStore;
const sync = window.AthSync;
const contentKeys = Object.keys(TRACKS);
const studyTracks = [...HISTORICAL_TRACKS, 'knowledge', 'traditio'];
const explorerPages = { atlas: atlasPage, tijdvakken: eraPage, bronnen: primaryPage, leerplan: academicPlanPage };
let profile = null;
let readingGuide;
let readingRequest;
let readingError = false;
let traditionView;
let traditionViewLoad;
let traditionViewError = false;
let contentRender;
let started = false;
let casesLoaded = false;
let caseLoad;
let records = [];
let session = null;
let clock;
let statusTimer;
let installPrompt;
let syncTimer;
let syncPid = '';
let syncState = '';
let offlineReady = false;
let actionBusy = false;
let lastRecordTime = 0;
let routeFilter = '';
let filteredTrack = '';
let courseFind = '';
let lessonQuery = '';
let lessonSearchTimer;
let archiveMonth = '';
let importDraft = {};
let importPreview = [];
let cases = [];
let indexedSeed;
let indexedCases;
let expandedCases;
const researchPanels = new Map();
let lastResearchId = '';
let pendingScriptoriumWork;
let notifications;
let unmountAtlas;
let atlasPinDestination;

const languageSupport = () => 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
const connection = () => navigator.onLine;
const activeSession = () => records.filter(row => row.kind === 'draft' && row.data?.session && !row.data.finished)
  .sort((a, b) => b.at - a.at)[0]?.data.session;
const personalLessons = () => records.filter(x => x.kind === 'deck' && !x.data.deleted && validDeck(x.data)).map(x => x.data);
const lessonList = () => [...loadedLessons(), ...personalLessons()];
const isHistoryRead = row => row.kind === 'prefs' && row.data?.name === 'history-read' &&
  typeof row.data.lesson === 'string' && /^[a-z0-9-]{1,100}$/i.test(row.data.lesson) &&
  row.id === historyReadId(row.data.lesson) && typeof row.data.value === 'boolean';
const readLessons = () => new Set(records.filter(row => isHistoryRead(row) && row.data.value).map(row => row.data.lesson));

function prefs() {
  return Object.fromEntries(records.filter(row => row.kind === 'prefs' && row.data
    && ((['it', 'fr'].includes(row.data.name) && LEVELS.includes(row.data.value))
      || (typeof row.data.name === 'string' && row.data.name.startsWith('quick-')
        && contentKeys.includes(row.data.name.slice(6)) && typeof row.data.value === 'boolean')))
    .map(row => [row.data.name, row.data.value]));
}
let previousRecords;
let reviewHistory;
function reviews() {
  if (records !== previousRecords) {
    reviewHistory = historyOf(records);
    previousRecords = records;
  }
  return reviewHistory;
}
const cloudUser = () => !!profile?.cloud_user_id && sync.cfg(profile.id).user?.id === profile.cloud_user_id;
const onlineLabel = () => !connection() ? 'Offline · op dit toestel' : cloudUser() ? syncState || 'Cloud verbonden' : 'Online · op dit toestel';
const route = () => location.hash.slice(1).split('/').map(v => { try { return decodeURIComponent(v); } catch { return ''; } });

function now() {
  lastRecordTime = Math.max(Date.now(), lastRecordTime + 1);
  return lastRecordTime;
}

function message(text) {
  status.textContent = text;
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => { status.textContent = ''; }, 5500);
}

function inlineMessage(container, text, error = false) {
  if (!container) return;
  container.hidden = false;
  container.textContent = text;
  container.classList.toggle('error', error);
}

function applyNavigation(section, label = view.sectionLabel(section)) {
  document.querySelector('#location').textContent = label;
  const apps = view.APP_NAV.map(n => view.nav(n, section)).join('');
  const primary = view.NAV.filter(([id]) => id === 'vandaag' || id === 'zoeken');
  const tools = view.NAV.filter(([id]) => id === 'toetsen' || id === 'meer');
  document.querySelector('#desktop-nav').innerHTML = primary.map(n => view.nav(n, section)).join('') +
    '<div class="nav apps-group" role="group" aria-labelledby="apps-label"><p id="apps-label" class="rail-heading"><span lang="la">Instrumenta</span> · Apps</p>' +
    apps + '</div>' + tools.map(n => view.nav(n, section)).join('');
  const activeMobile = ['onderzoek','voortgang','importeren','scriptorium','traditio','leer'].includes(section) ? 'meer' : section;
  document.querySelector('#mobile-nav').innerHTML = view.NAV.map(n => view.nav(n, activeMobile, true)).join('');
  const mobileApps = view.APP_NAV;
  document.querySelector('#mobile-apps').innerHTML = mobileApps.map(link => view.nav(link, section)).join('');
  const menu = document.querySelector('.app-menu');
  menu.open = false;
  menu.classList.toggle('is-active', mobileApps.some(([id]) => id === section));
  document.querySelector('#desktop-secondary').innerHTML = view.SECONDARY_NAV.map(n => view.nav(n, section)).join('');
  const name = document.querySelector('#account');
  name.textContent = cloudUser() ? profile.name : 'Account';
  name.title = cloudUser() ? 'Profiel en account' : 'Account maken of aanmelden';
  updateConnection();
}

function updateConnection() {
  document.querySelector('#rail-status').classList.toggle('online', connection());
  document.querySelector('#rail-label').textContent = onlineLabel();
}

function displayMain(markup, { focus = true } = {}) {
  clearInterval(clock);
  unmountAtlas?.();
  unmountAtlas = undefined;
  pageContent.innerHTML = markup;
  if (focus) {
    main.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
}

function overview() {
  const lessons = [...summaries, ...personalLessons()];
  return progressOverview(lessons, records, reviews(), readLessons(), prefs(), profile, activeSession());
}

function routePacks(section, key, tab) {
  if (section === 'les') {
    const pack = byLessonId.get(key)?.pack;
    if (['chronologie', 'verkenning'].includes(tab)) return packsForTracks(HISTORICAL_TRACKS);
    return pack ? [pack] : [];
  }
  if (section === 'talen') return key && TRACKS[key] ? packsForTracks([key]) : [];
  if (section === 'traditio') return packsForTracks(['traditio']);
  if (section === 'paideia' && key) {
    if (key === 'chronologie' || Object.hasOwn(explorerPages, key)) return packsForTracks(HISTORICAL_TRACKS);
    return packsForTracks(['medieval','earlymodern'].includes(key) ? [key, 'history'] : [key]);
  }
  if (section === 'toetsen') return packsForTracks(studyTracks);
  if (section === 'dagles' || section === 'onderzoek' || (section === 'zoeken' && lessonQuery.trim())) return allPackKeys;
  return [];
}

function loadFor(keys, retry = false) {
  return loadPacks(keys, refreshContentViews, retry);
}
function lessonLoadingNotice(keys) {
  const files = keys.map(key => packFiles.get(key)).filter(Boolean);
  const failed = files.filter(file => file.status === 'failed');
  if (failed.length) return `<div class="notice content-notice" role="status">
    <p><strong>Laden onderbroken</strong> · ${failed.map(file => view.esc(file.name)).join(', ')}.</p>
    <button type="button" class="button small" data-action="retry-content">Opnieuw laden</button>
  </div>`;
  return files.some(file => file.status === 'loading') ? '<p class="content-loading muted" role="status">Lessen laden…</p>' : '';
}

function loadTraditionView() {
  if (traditionView || traditionViewLoad || traditionViewError) return;
  traditionViewLoad = import('./traditio.js?v=14r1').then(module => { traditionView = module; })
    .catch(() => { traditionViewError = true; }).finally(() => { traditionViewLoad = undefined; refreshContentViews(); });
}

function researchCaseIndex() {
  const seed = loadedLessons();
  if (indexedSeed !== seed || indexedCases !== cases) {
    expandedCases = [...cases, ...lessonSourceIndex(seed, cases)];
    indexedSeed = seed;
    indexedCases = cases;
  }
  return expandedCases;
}

function render(focus = true) {
  const path = route();
  const [page = 'vandaag', key = '', tab = '', tabKey = ''] = path;
  let section = page || 'vandaag';
  if (['paideia', 'talen'].includes(section) && Object.hasOwn(TRACKS, key)) {
    const subject = key === 'traditio' ? 'traditio' : TRACKS[key].section === 'language' ? 'talen' : 'paideia';
    if (section !== subject) {
      section = subject;
      history.replaceState(null, '', '#' + [section, ...path.slice(1)].map(encodeURIComponent).join('/'));
    }
  }
  const needed = routePacks(section, key, tab);
  loadFor(needed);
  if (section === 'onderzoek') loadCases();
  const traditionRoute = section === 'traditio' || (section === 'les' && byLessonId.get(key)?.track === 'traditio');
  if (traditionRoute) loadTraditionView();
  const lessons = lessonList();
  const info = overview();
  if (key !== filteredTrack) {
    routeFilter = '';
    courseFind = '';
    filteredTrack = key;
  }
  let markup;
  let top = section;
  switch (section) {
    case 'sessie':
      session ??= activeSession() ?? null;
      if (session) {
        showQuiz(focus);
        return;
      }
      top = 'vandaag';
      markup = view.home(info);
      break;
    case 'dagles': {
      const archive = archivedPlans(records);
      const plan = archive.find(p => p.date === (key || dayKey()));
      const resume = plan && dailyDraft(plan);
      top = 'vandaag';
      markup = dailyPage(plan, lessons, archive, resume, archiveMonth);
      break;
    }
    case 'studiegids':
      top = 'paideia';
      if (!readingGuide && !readingRequest && !readingError) {
        readingRequest = fetchJson(new URL('./content/reading-guide.json?v=14r2',import.meta.url))
          .then(rows => { readingGuide = rows; }).catch(() => { readingError = true; })
          .finally(() => { readingRequest = undefined; if (route()[0] === 'studiegids') render(false); });
      }
      markup = view.readingGuidePage(readingGuide, readingError);
      break;
    case 'leer':
      markup = view.studyHub(info);
      break;
    case 'traditio':
      markup = traditionView ? traditionView.traditioPage(key, tab, tabKey, { studied: info.studied, read: readLessons(), lessons }) : '';
      break;
    case 'zoeken':
      markup = view.lessonSearchPage(lessonQuery);
      break;
    case 'paideia':
    case 'talen':
      if (section === 'paideia' && key === 'chronologie') {
        markup = chronologyPage(lessons, info.studied, readLessons(), timelineScope(tab), tabKey, path[4], path[5]);
      } else if (section === 'paideia' && Object.hasOwn(explorerPages, key)) {
        markup = explorerPages[key](lessons, timelineScope(tab), tabKey, info.studied, readLessons());
      } else {
        markup = contentKeys.includes(key)
          ? view.course(key, lessons, info.studied, info.prefs, routeFilter, courseFind, tab, readLessons())
          : view.catalogue(section, info.lessons, info.prefs);
      }
      break;
    case 'les': {
      const lesson = lessons.find(row => row.id === key);
      top = TRACKS[lesson?.track]?.section === 'language' ? 'talen' : 'paideia';
      if (lesson?.tradition && lesson.track === 'traditio') {
        top = 'traditio';
        markup = traditionView ? traditionView.traditioPage(lesson.tradition, lesson.id, '', { studied: info.studied, read: readLessons(), lessons }) : '';
        break;
      }
      markup = lesson ? view.lessonPage(lesson, {
        journey: explorationJourney(lessons, lesson, path) ?? chronologyForLesson(lessons, lesson, path),
        read: readLessons().has(lesson.id), lessons,
        courseTrack: tab === 'vak' && belongsToHistoryTrack(lesson, tabKey) ? tabKey : undefined,
      }) + (HISTORICAL_TRACKS.includes(lesson.track) ? lessonExplorerLinks(lesson, lessons) : '') : view.heading('Les openen') + '<p class="empty" data-missing-lesson>' +
        (needed.some(key => packFiles.get(key)?.status === 'loading') ? 'Deze les wordt opgezocht.' :
          'Deze les is op dit moment niet beschikbaar.') +
        '</p><p class="back-link"><a class="text-link" href="#paideia">Naar de vakken</a> · <a class="text-link" href="#zoeken">Zoek een les</a></p>';
      break;
    }
    case 'scriptorium':
      markup = profile && !store.profileApps(profile).includes('scriptorium')
        ? view.heading('Scriptorium') + '<p class="notice">Open een profiel met toegang tot Scriptorium.</p>'
        : scriptoriumShell(key, lastResearchId, profile?.id);
      break;
    case 'onderzoek': {
      const list = researchDossiers();
      const doc = list.find(x => x.id === key);
      const panel = doc ? researchPanel(doc) : {};
      if (doc) lastResearchId = doc.id;
      markup = researchPage(doc, list, Object.hasOwn(RESEARCH_TABS,tab) ? tab : 'vraag', doc ? {
        cases: findCases(researchCaseIndex(), doc.terms || doc.question), studies: panel.studies ?? [],
        error: panel.error, matches: panel.matches, tabKey, insertDraft: panel.insertDraft,
        comparison: panel.comparisonDrafts?.get(tabKey),
      } : {}, panel.witness);
      break;
    }
    case 'toetsen':
      markup = view.exams({ ...info, weekly: weeklyStudy(lessons, records) });
      break;
    case 'voortgang':
      markup = view.progressPage(info);
      break;
    case 'resultaat': {
      const outcome = records.find(x => x.kind === 'result' && x.id === key);
      top = outcome?.data.back === 'scriptorium/oefenen' ? 'scriptorium' :
        outcome?.data.mode === 'exam' ? 'toetsen' : outcome?.data.mode === 'placement' ? 'talen' : 'voortgang';
      markup = outcome ? view.resultPage(key, outcome.data, info.streak.earned.get(key)) : view.heading('Resultaat') + '<p class="empty">Dit resultaat is nog niet op dit toestel beschikbaar.</p>';
      break;
    }
    case 'importeren':
      markup = view.importPage(importDraft, importPreview, contentKeys.includes(key) ? key : undefined);
      break;
    case 'meer':
      markup = key === 'meldingen' ? view.notificationsPage({
        cloud: cloudUser(), online: connection(), support: pushSupport(),
        ...notifications, preference: pushPreference(profile?.id),
      }) : view.settings({
        profile, cloud: cloudUser(), syncLabel: onlineLabel(), offlineReady,
        profileCount: store.loadProfiles().length, prefs: info.prefs,
      });
      break;
    default:
      top = 'vandaag';
      markup = view.home(info);
  }
  if (traditionRoute && !traditionView) markup = view.heading('Traditio') + (traditionViewError
    ? '<button class="button" data-action="retry-content">Traditio opnieuw laden</button>' : '<p role="status">Traditio opent…</p>');
  const blocked = needed.length && needed.every(key => packFiles.get(key)?.status !== 'ready');
  if (blocked && ['paideia', 'talen', 'traditio', 'les', 'toetsen'].includes(section)) {
    markup = view.heading(byLessonId.get(key)?.title || TRACKS[key]?.name || view.sectionLabel(top));
  }
  applyNavigation(top);
  const notice = lessonLoadingNotice(needed);
  displayMain(notice + markup, { focus });
  if (section === 'paideia' && key === 'atlas') attachAtlas(lessons, timelineScope(tab), tabKey);
  if (section === 'paideia' && ['chronologie','tijdvakken'].includes(key)) mountChronology(main);
  if (section === 'meer' && key === 'meldingen') prepareNotifications();
  if (section === 'zoeken') showLessonMatches(lessons);
  if (section === 'onderzoek' && tab === 'debat' && tabKey && focus) {
    const study = [...main.querySelectorAll('.research-literature')].find(form => form.dataset.id === tabKey);
    study?.scrollIntoView({block:'start'});
  }
  if (document.querySelector('#course-search')) filterCourses();
}

function attachAtlas(lessons, scope, chosen) {
  const frame = document.querySelector('#atlas-globe');
  if (!frame) return;
  bindAtlasFilters(frame);
  const visibleIds = new Set([...main.querySelectorAll('[data-place-id]')].map(node => node.dataset.placeId));
  const places = ATLAS_PLACES.filter(place => visibleIds.has(place.id));
  import('./atlas-globe.js?v=13r11')
    .then(({ mountAtlasGlobe }) => mountAtlasGlobe(frame, places, chosen, id => {
      const destination = explorerHref('atlas', scope, id);
      if (location.hash === '#' + destination) return;
      atlasPinDestination = destination;
      jump(destination);
    }))
    .then(cleanup => {
      if (frame.isConnected) unmountAtlas = cleanup;
      else cleanup?.();
    }).catch(() => {
      if (!frame.isConnected) return;
      frame.dataset.failed = 'true';
      frame.querySelector('.atlas-error').hidden = false;
      frame.querySelector('canvas').hidden = true;
      frame.querySelector('.atlas-controls').hidden = true;
      frame.querySelector('.atlas-presets').hidden = true;
    });
}

async function setProfile(next) {
  const nextRecords = next ? await readRecords(next.id) : [];
  if (profile?.id !== next?.id) {
    if (profile && pushPreference(profile.id)) await stopPush(profile.id).catch(() => {});
    lessonQuery = '';
    notifications = undefined;
  }
  profile = next;
  store.setCurrentProfile(next?.id ?? '');
  records = nextRecords;
  const resetAt = Math.max(0, ...records.filter(x => x.kind === 'reset').map(x => x.at));
  records = records.filter(x => x.at > resetAt || x.kind === 'reset');
  session = null;
  importDraft = records.find(x => x.kind === 'import' && x.id === 'import-draft')?.data ?? {};
  importPreview = [];
  researchPanels.clear();
  lastResearchId = '';
  pendingScriptoriumWork = null;
  archiveMonth = '';
  syncState = '';
  if (next) sessionStorage.setItem('athenaeum_unlocked_' + next.id, '1');
  if (cloudUser()) scheduleSync(100);
}

async function requireProfile() {
  if (!profile) await setProfile(await makeGuest());
  return profile;
}

async function saveRows(rows, syncable = true) {
  const pid = profile?.id;
  if (!pid) throw new Error('Open eerst een profiel.');
  await storeRecords(pid, rows, syncable);
  if (pid !== profile?.id) return;
  const byId = new Map(records.map(x => [x.id, x]));
  for (const row of rows) {
    if ((byId.get(row.id)?.at ?? 0) <= row.at) byId.set(row.id, row);
  }
  records = [...byId.values()];
  if (syncable) scheduleSync();
}

function scheduleSync(delay = 1200) {
  if (!cloudUser() || !connection()) return;
  clearTimeout(syncTimer);
  syncTimer = setTimeout(() => synchronize(), delay);
}

function marksStudy(day) {
  const id = studyRecordId(day);
  return records.some(row => row.id === id) ? [] : [record('prefs', id, { name: 'streak-day', date: day }, now())];
}

function prepareNotifications() {
  const pid = profile?.id;
  if (!cloudUser() || !connection() || pushSupport() !== 'available' || notifications?.pid === pid) return;
  const state = { pid };
  notifications = state;
  preparePush(pid).then(setup => { state.setup = setup; }).catch(() => { state.error = true; }).finally(() => {
    if (notifications === state && route().join('/') === 'meer/meldingen') render(false);
  });
}

async function synchronize(manual = false) {
  const pid = profile?.id;
  if (!pid || !cloudUser() || !connection()) {
    if (manual) message('Open Athenaeum online en meld je aan om gegevens bij te werken.');
    return;
  }
  if (syncPid) {
    scheduleSync(1500);
    return;
  }
  syncPid = pid;
  syncState = 'Bezig met bijwerken…';
  updateConnection();
  try {
    await syncLearning(pid);
    const updated = await readRecords(pid);
    if (profile?.id !== pid) return;
    const resetAt = Math.max(0, ...updated.filter(x => x.kind === 'reset').map(x => x.at));
    const merged = new Map(updated.filter(x => x.at > resetAt || x.kind === 'reset').map(x => [x.id, x]));
    for (const row of records) if (row.at > resetAt && (!merged.has(row.id) || merged.get(row.id).at < row.at)) merged.set(row.id, row);
    const changed = merged.size !== records.length || records.some(row => merged.get(row.id)?.at !== row.at);
    if (changed) records = [...merged.values()];
    syncState = 'Cloud bijgewerkt';
    if (manual) message('Je voortgang is bijgewerkt.');
    const activeView = route()[0];
    if (!changed) return;
    if (activeView === 'zoeken') showLessonMatches();
    else if (!main.contains(document.activeElement?.closest('input,textarea,select')) && !session && !dialog.open && !['importeren', 'sessie'].includes(activeView) && route().join('/') !== 'meer/meldingen') render(false);
  } catch (error) {
    if (profile?.id === pid) {
      syncState = 'Op dit toestel bewaard · cloud wacht';
      if (manual) message('Je voortgang staat op dit toestel. Bijwerken is tijdelijk niet gelukt.');
      console.warn('Cloudsync:', error.message);
    }
  } finally {
    syncPid = '';
    updateConnection();
  }
}

function showDialog(markup) {
  dialog.innerHTML = markup;
  if (!dialog.open) dialog.showModal();
}

function dialogText(title, content, buttons) {
  return `<div class="dialog-inner stack"><div class="topline"><h2 id="dialog-title">${view.esc(title)}</h2>
    <button type="button" class="button icon-only" aria-label="Sluiten" data-action="close-dialog">${view.icon('close')}</button>
    </div><p>${view.esc(content)}</p>${buttons || ''}</div>`;
}

function showAccount(mode = 'login', email = '') {
  showDialog(view.accountDialog(mode, email));
}

function showProfiles() {
  const choices = store.loadProfiles();
  showDialog(dialogText('Kies een profiel', 'Open een bestaand profiel op dit toestel.', '<div class="stack">' + choices.map(p =>
    `<button type="button" class="button quiet" data-action="choose-profile" data-value="${view.esc(p.id)}">${view.esc(p.name)}</button>`).join('') +
    '<button type="button" class="button" data-action="auth-mode" data-value="login">Aanmelden bij een cloudaccount</button></div>'));
}

async function chooseProfile(id) {
  const selected = store.loadProfiles().find(x => x.id === id);
  if (!selected) return;
  if (selected.cloud_user_id && !sync.status(id).signed_in) {
    showAccount('login', selected.cloud_email);
    return;
  }
  if (selected.pin_hash && !sessionStorage.getItem('athenaeum_unlocked_' + id)) {
    showDialog(dialogText('Profiel openen', selected.name,
      `<form id="pin-form" class="stack" data-profile="${view.esc(id)}"><div class="field"><label for="pin">Pincode</label>
      <input type="password" inputmode="numeric" id="pin" name="pin" required></div><p id="pin-error" class="notice" hidden></p>
      <button type="submit" class="button primary">Open profiel</button></form>`));
    return;
  }
  await setProfile(selected);
  dialog.close();
  render();
}

function jump(page) {
  if (location.hash === '#' + page) render();
  else location.hash = page;
}

function lessonBack(id) {
  const path = route();
  const [section, key, view, scope, mode] = path;
  const tradition = loadedLessons().find(lesson => lesson.id === id)?.tradition;
  if (tradition) return 'traditio/' + encodeURIComponent(tradition) + '/' + encodeURIComponent(id);
  if (section === 'les' && key === id && ['verkenning', 'vak'].includes(view)) return path.map(encodeURIComponent).join('/');
  return section === 'les' && key === id && view === 'chronologie'
    ? historyLessonHref(id, scope, mode)
    : 'les/' + encodeURIComponent(id);
}

function showLessonMatches(lessons = lessonList()) {
  clearTimeout(lessonSearchTimer);
  const field = document.querySelector('#lesson-query');
  if (!field) return;
  if (lessonQuery.trim()) loadFor(allPackKeys);
  const found = searchLessons(lessons, lessonQuery);
  const count = found.results.length;
  const label = document.querySelector('#lesson-search-status');
  const description = found.hasQuery ? (count ? count + (count === 1 ? ' les' : ' lessen') : 'Geen lessen gevonden') : '';
  if (label.textContent !== description) label.textContent = description;
  label.hidden = !found.hasQuery;
  document.querySelector('#lesson-search-clear').hidden = !field.value;
  document.querySelector('#lesson-search-results').innerHTML = view.lessonSearchResults(found);
}

function setLessonQuery(value) {
  const field = document.querySelector('#lesson-query');
  field.value = value;
  lessonQuery = value;
  showLessonMatches();
}

function relevantPool(track) {
  const saved = prefs();
  const [section, course, tab] = route();
  const onCourse = track === course && ['paideia', 'talen'].includes(section);
  const topic = onCourse && isLanguageTopic(track, tab) ? tab : '';
  const situation = onCourse && !topic ? routeFilter : '';
  return makePool(lessonList().filter(lesson => (!track || belongsToHistoryTrack(lesson, track)) &&
    (!topic || lesson.languageTopic === topic) && (!situation || lesson.route === situation) &&
    (track || saved['quick-' + lesson.track] !== false) && levelFor(lesson, saved)));
}

function researchDossiers() {
  return records.filter(row => row.kind === 'draft' && row.data?.research)
    .sort((a,b) => b.at - a.at).map(row => row.data.research);
}

function ongoingResearch() {
  const doc = researchDossiers().find(x => x.id === route()[1]);
  if (!doc) throw new Error('Open eerst een onderzoeksdossier.');
  return doc;
}

function researchPanel(doc) {
  if (!researchPanels.has(doc.id)) researchPanels.set(doc.id,{});
  return researchPanels.get(doc.id);
}

function currentWitness(doc) {
  return doc.sources.find(w => w.id === researchPanel(doc).witness) ?? doc.sources[0];
}

function formValues(form) {
  return Object.fromEntries(new FormData(form));
}

function emptyResearch() {
  return {id:crypto.randomUUID(),title:'',question:'',scope:'',terms:'',sources:[],studies:[]};
}

async function saveResearch(doc, stage) {
  await saveRows([record('draft', 'research-' + doc.id, {research:doc}, now())], false);
  if (stage) jump('onderzoek/' + doc.id + '/' + stage);
}

async function insertResearchMaterial(doc, form, fields) {
  const file = form.elements.file.files[0];
  let material = {kind:fields.kind,title:fields.title,author:fields.author,locator:fields.locator,year:fields.year,url:fields.url,text:fields.text};
  if (file) {
    if (fields.text.trim()) throw new Error('Bewaar de geplakte tekst en het bestand op afzonderlijke fiches.');
    inlineMessage(form.querySelector('#research-insert-message'),'Bestand uitlezen…');
    material = {...material, ...await readResearchFile(file,fields.startPage,fields.endPage)};
  } else if (!fields.text.trim() && !fields.locator.trim() && !fields.url.trim() && !fields.author.trim()) {
    throw new Error('Voeg tekst, een bestand of een bronverwijzing toe.');
  }
  const added = addResearchMaterial(doc,material,crypto.randomUUID());
  await saveResearch(added.dossier);
  researchPanel(doc).insertDraft = undefined;
  if (form.isConnected) {
    render(false);
    inlineMessage(document.querySelector('#research-insert-message'),'Materiaal toegevoegd aan dit dossier.');
  }
  message('Materiaal toegevoegd aan dit dossier.');
}

async function storeComparison(doc, form, intent) {
  const panel = researchPanel(doc);
  const selection = route()[3] || '';
  const draft = comparisonFromForm(new FormData(form),form.dataset.id || crypto.randomUUID());
  if (intent === 'add' || intent?.startsWith('remove-')) {
    if (intent === 'add' && draft.rows.length < MAX_COMPARISON_ROWS) draft.rows.push({});
    if (intent.startsWith('remove-') && draft.rows.length > 2) draft.rows.splice(Number(intent.slice(7)),1);
    panel.comparisonDrafts ??= new Map();
    panel.comparisonDrafts.set(selection,draft);
    render(false);
    if (intent === 'add') document.querySelector('#research-compare-ref-' + (draft.rows.length - 1))?.focus();
    return;
  }
  const board = validComparison(doc,draft);
  const previous = doc.comparisons ?? [];
  await saveResearch({...doc,comparisons:[board,...previous.filter(item => item.id !== board.id)]});
  panel.comparisonDrafts?.delete(selection);
  jump('onderzoek/' + doc.id + '/vergelijk/' + board.id);
  message('Bronnenvergelijking bewaard.');
}

function wantScriptoriumWork(material) {
  pendingScriptoriumWork = material;
  const dossiers = researchDossiers();
  showDialog(dialogText('Werk aan dossier toevoegen', 'Kies waar je de publicatie wilt gebruiken.',
    scriptoriumTransferDialog(material,dossiers,lastResearchId || dossiers[0]?.id)));
}

async function saveScriptoriumWork(form) {
  const material = pendingScriptoriumWork;
  if (!material) return;
  const target = form.elements.dossier.value;
  await requireProfile();
  const doc = target ? researchDossiers().find(d => d.id === target) : {...emptyResearch(),title:'Onderzoek · ' + material.title};
  if (!doc) throw new Error('Kies een bestaand dossier of maak een nieuw dossier.');
  const added = addResearchMaterial(doc,material,crypto.randomUUID());
  if (!added.existed) await saveResearch(added.dossier);
  pendingScriptoriumWork = null;
  dialog.close();
  jump('onderzoek/' + doc.id + '/debat/' + added.entry.id);
  message(added.existed ? 'Dit werk staat al in het dossier.' : 'Werk uit Scriptorium toegevoegd aan je dossier.');
}

async function storeWitness(doc,witness) {
  await saveResearch({...doc,sources:doc.sources.map(s => s.id === witness.id ? witness : s)});
}

function editWitness(doc) {
  const current = currentWitness(doc);
  const form = document.querySelector('#research-source');
  return current && form ? {...current,...formValues(form)} : current;
}

async function attachWitness(c) {
  const doc = ongoingResearch();
  if (doc.sources.length >= 60) throw new Error('Dit dossier heeft 60 bronnen. Maak een nieuw dossier voor verdere bronnen.');
  const existing = c && doc.sources.find(w => w.caseId === c.id);
  if (existing) {
    researchPanel(doc).witness = existing.id;
    jump('onderzoek/' + doc.id + '/bron');
    return;
  }
  const witness = c ? caseWitness(c,crypto.randomUUID()) : {id:crypto.randomUUID(),status:'tocheck'};
  researchPanel(doc).witness = witness.id;
  researchPanel(doc).matches = undefined;
  const linked = (c?.studies ?? []).map(study => ({...study,id:crypto.randomUUID(),witness:witness.id,status:'tocheck',relation:'open'}));
  await saveResearch({...doc,sources:[...doc.sources,witness],studies:[...doc.studies,...linked]},'bron');
}

async function researchSubmit(form, submitter) {
  const doc = ongoingResearch();
  if (form.id === 'research-comparison') return storeComparison(doc,form,submitter?.value);
  const fields = formValues(form);
  if (form.id === 'research-question-form') {
    await saveResearch({...doc,...fields},submitter?.value === 'invoegen' ? 'invoegen' : 'vinden');
  }
  if (form.id === 'research-insert') return insertResearchMaterial(doc,form,fields);
  if (form.classList.contains('research-note-form')) {
    if (!fields.title.trim() || !fields.text.trim()) throw new Error('Vul de titel en tekst van je notitie in.');
    await saveResearch({...doc,notes:doc.notes.map(note => note.id === form.dataset.id ? {...note,...fields} : note)});
    form.closest('details').querySelector('summary').textContent = fields.title.trim();
    message('Eigen tekst bewaard.');
  }
  if (form.id === 'research-search') {
    const terms = String(fields.terms ?? '').trim();
    const panel = researchPanel(doc);
    panel.error = '';
    await saveResearch({...doc,terms});
    if (submitter?.value === 'crossref') {
      panel.studies = [];
      if (terms.length < 3) panel.error = 'Vul eerst minstens drie tekens zoektermen in.';
      else {
        message('Literatuur zoeken in Crossref…');
        try {
          panel.studies = await findStudies(terms);
          if (!panel.studies.length) panel.error = 'Crossref gaf geen resultaten voor deze termen.';
        } catch (error) { panel.error = error.message; }
      }
    }
    render(false);
  }
  if (form.id === 'research-source') {
    const witness = currentWitness(doc);
    await storeWitness(doc,{...witness,...fields});
    message('Bronanalyse bewaard.');
  }
  if (form.classList.contains('research-literature')) {
    await saveResearch({...doc,studies:doc.studies.map(study => study.id === form.dataset.id ? {...study,...fields} : study)});
    message('Studie en interpretatie bewaard.');
  }
  if (form.id === 'research-synthesis') {
    await saveResearch({...doc,...fields});
    message('Synthese bewaard.');
  }
}

async function researchPDF(file) {
  const doc = ongoingResearch();
  const witness = editWitness(doc);
  if (!file || !witness) return;
  const start = Math.max(1, Number(document.querySelector('#research-pdf-page')?.value) || 1);
  message('PDF-pagina uitlezen…');
  const [page] = await readStudyFile(file,{start,end:start});
  if (!page || page.text.length > 18000) throw new Error('Deze pagina is te lang. Gebruik een korter fragment.');
  await storeWitness(doc, {...witness, passage:page.text, passageKind:page.locator + ' · ' + file.name,
    title:witness.title || file.name, locator:witness.locator || page.locator, status:'tocheck'});
  render(false);
  message('PDF-fragment toegevoegd.');
}

function dailyDraft(plan) {
  const stage = plan.stages[plan.cursor];
  return records.find(r => r.kind === 'draft' && !r.data.finished && r.data?.session?.daily?.date === plan.date
    && r.data.session.daily.step === stage?.id)?.data.session;
}

async function createDay(form) {
  await loadFor(allPackKeys);
  const p = await requireProfile();
  const fields = new FormData(form);
  const minutes = Number(fields.get('minutes'));
  const focus = String(fields.get('focus'));
  if (!Object.hasOwn(PACE,minutes) || !Object.hasOwn(DAY_FOCI,focus)) return;
  const date = dayKey();
  const old = records.find(x => x.id === 'daily-' + date)?.data?.daily;
  if (!old) {
    const chosen = prefs();
    const eligible = lessonList().filter(lesson => levelFor(lesson,chosen) &&
      (focus === 'mix' ? chosen['quick-' + lesson.track] !== false :
        focus === 'ancient' ? ['greek','roman'].includes(lesson.track) : belongsToHistoryTrack(lesson, focus)));
    const plan = planDay(eligible, reviews(), archivedPlans(records), { date, minutes, focus, noAudio: !languageSupport(), learner: p.id });
    if (!plan) throw new Error('Voor deze keuze zijn geen lessen geladen. Probeer een ander leerpad.');
    await saveRows([record('draft','daily-' + date,{daily:plan},now())]);
  }
  jump('dagles/' + date);
}

async function dailyNext(date) {
  const plan = records.find(r => r.id === 'daily-' + date)?.data?.daily;
  const stage = plan?.stages[plan.cursor];
  if (!stage) return;
  if (stage.questions.length) {
    const draft = dailyDraft(plan);
    if (draft) {
      session = draft;
      jump('sessie');
      return;
    }
    await startQuiz('daily', STAGES[stage.id].title, stage.questions, { daily: {date,step:stage.id,label:STAGES[stage.id].desc}, back:'dagles/' + date });
    return;
  }
  await saveDailyStep(plan, stage.id);
  render();
}

async function saveDailyStep(plan, step, stats, extra = []) {
  const daily = advanceDay(plan, step, stats);
  if (step === 'read') daily.readDay = dayKey();
  const studyDay = daily.completed && dayKey();
  if (studyDay) daily.studyDay = studyDay;
  await saveRows([
    ...extra, record('draft', 'daily-' + plan.date, { daily }, now()),
    ...(studyDay ? marksStudy(studyDay) : []),
  ]);
}

function filterCourses() {
  const search = courseFind.toLocaleLowerCase('nl').normalize('NFD').replace(/\p{M}/gu,'').trim().split(/\s+/);
  let matches = 0;
  for (const unit of main.querySelectorAll('[data-unit-search]')) {
    const visible = search.every(word => unit.dataset.unitSearch.includes(word));
    unit.hidden = !visible;
    if (visible) matches++;
  }
  for (const group of main.querySelectorAll('[data-lesson-group]')) {
    group.hidden = !group.querySelector('[data-unit-search]:not([hidden])');
  }
  const label = main.querySelector('#lesson-count');
  if (label) label.textContent = matches + (matches === 1 ? ' les' : ' lessen');
  const empty = main.querySelector('#lesson-no-match');
  if (empty) empty.hidden = matches > 0;
}

async function storeSession(extra = []) {
  const data = structuredClone(session);
  const row = record('draft', 'draft-' + data.id, { session: data, finished: false }, now());
  await saveRows([...extra, row]);
}

async function startQuiz(mode, title, questions, extra = {}) {
  if (!questions.length) return;
  await requireProfile();
  const formal = mode === 'exam' || mode === 'placement';
  const started = mode === 'daily' && extra.daily.step !== 'guided';
  session = {
    id: crypto.randomUUID(), mode, title, index: 0, response: '', answers: [], started,
    questions: (formal ? questions : sequencePractice(questions)).map(q => {
      const options = practiceOptions(q);
      if (!options.length) return q.options ? { ...q, options: shuffled(q.options) } : q;
      const order = shuffled(options.map((_, index) => index));
      if (order.every((index, i) => options[index] === options[i])) order.push(order.shift());
      return { ...q, optionOrder: order };
    }),
    ...extra,
  };
  await storeSession();
  jump('sessie');
}

async function quick(track = '', extra = false) {
  if (!track && activeSession()) {
    session = activeSession();
    jump('sessie');
    return;
  }
  await loadFor(track ? packsForTracks([track]) : allPackKeys);
  const pool = relevantPool(track);
  const questions = quickQuestions(pool, reviews(), { limit: 3, extra, noAudio: !languageSupport() });
  if (!questions.length) {
    showDialog(dialogText('Bij met je herhalingen', 'Kies een ander leerpad of oefen alvast een paar extra vragen.',
      `<div class="row"><button class="button primary" data-action="extra" data-value="${view.esc(track)}">Extra oefenen</button>
      <button class="button quiet" data-action="close-dialog">Sluiten</button></div>`));
    if (extra) message('Voor dit pad zijn nu geen korte vragen beschikbaar.');
    return;
  }
  if (dialog.open) dialog.close();
  await startQuiz('quick', track ? TRACKS[track].name : 'Sneloefening', questions, { track, back: route().join('/') || 'vandaag' });
}

function showQuiz(focus = true) {
  if (session.deadline && session.deadline <= Date.now()) {
    setTimeout(() => run(() => finishQuiz()), 0);
    return;
  }
  const top = session.back === 'scriptorium/oefenen' ? 'scriptorium' : session.track === 'traditio' ? 'traditio' :
    (session.mode === 'exam' || session.back === 'toetsen') ? 'toetsen' :
    session.mode === 'placement' || TRACKS[session.track]?.section === 'language' ? 'talen' :
      session.track ? 'paideia' : 'vandaag';
  applyNavigation(top, session.title);
  displayMain(session.started === false ? view.quizIntro(session) : view.quizPage(session), { focus });
  if (session.deadline) {
    const update = () => {
      const seconds = Math.max(0, Math.ceil((session.deadline - Date.now()) / 1000));
      const timer = document.querySelector('#timer');
      if (timer) timer.textContent = Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2, '0');
      if (!seconds && !actionBusy) run(() => finishQuiz());
    };
    update();
    clock = setInterval(update, 1000);
  }
}

function matchingRating(q, answer, i) {
  if (answer.skipped || q.pairs[answer.selection?.[i]] !== q.pairs[i]) return 'again';
  return answer.hinted ? 'help' : 'good';
}

function studyEvents(q, answer) {
  const id = 'review-' + session.id + '-' + session.index;
  if (q.kind === 'match') return q.pairs.map((pair, i) => record('review', id + '-' + i, {
    key: pair.key, question: q.id, lesson: q.lesson, rating: matchingRating(q, answer, i), skipped: Boolean(answer.skipped),
  }, now()));
  return [record('review', id, {
    key: q.key, question: q.id, lesson: q.lesson, rating: answer.rating, skipped: Boolean(answer.skipped),
  }, now())];
}

function reviewTargets(q, answer) {
  if (!['again','help'].includes(answer?.rating)) return [];
  const targets = q.kind === 'match' ? q.pairs.filter((_, i) => matchingRating(q, answer, i) !== 'good') : [q];
  return targets.map(({ key, label }) => ({ key, label, lesson: q.lesson }));
}

async function practiceAgain(targets, excluded, back) {
  const keys = new Set(targets.map(row => row.key));
  await loadFor([...new Set(targets.map(row => byLessonId.get(row.lesson)?.pack).filter(Boolean))]);
  const ids = new Set(targets.map(row => row.lesson));
  const goals = makePool(lessonList().filter(lesson => ids.has(lesson.id)))
    .filter(item => keys.has(item.key));
  if (!goals.length) throw new Error('De bijbehorende les is niet beschikbaar. Kies een ander leerpad om verder te oefenen.');
  const options = { limit: Math.min(5, goals.length), noAudio: !languageSupport(), compact: true };
  const questions = drillQuestions(goals, reviews(), { ...options, exclude: excluded });
  if (!questions.length) questions.push(...drillQuestions(goals, reviews(), options));
  if (!questions.length) throw new Error('Voor deze leerdoelen is geen korte oefenreeks beschikbaar.');
  const track = questions.every(q => q.track === questions[0].track) ? questions[0].track : '';
  await startQuiz('lesson', 'Lastige leerdoelen herhalen', questions, { track, back });
}

async function updateOrder(index, add) {
  const q = session?.questions[session.index];
  if (q?.kind !== 'order' || session.answers[session.index] || !Number.isInteger(index)) return;
  const selected = session.selection ?? [];
  if (add) {
    if (index < 0 || index >= q.parts.length || selected.includes(index)) return;
    session.selection = [...selected, index];
  } else {
    if (index < 0 || index >= selected.length) return;
    session.selection = selected.filter((_, position) => position !== index);
  }
  const controls = main.querySelector('.practice-controls');
  controls.innerHTML = view.practiceControls(q, session);
  const focus = add ? controls.querySelector('.part-bank button:not([disabled])') :
    controls.querySelector('[data-action="add-part"][data-value="' + selected[index] + '"]');
  (focus ?? main.querySelector('[data-action="submit-answer"]'))?.focus({ preventScroll: true });
  await storeSession();
}

async function answerQuestion(skip = false) {
  if (!session) return;
  const question = session.questions[session.index];
  const options = practiceOptions(question);
  const selection = options.length && !session.typeOrder ? session.selection ?? [] : undefined;
  const response = question.kind === 'order' && selection ? selection.map(i => options[i]).join(question.language ? ' ' : ' · ') :
    (document.querySelector('#answer')?.value ?? session.response ?? '').trim();
  const formal = ['exam', 'placement'].includes(session.mode);
  if (!skip && (selection ? !completeSelection(question, selection) : !response)) {
    message(selection ? 'Vul alle onderdelen in en controleer dan je antwoord.' : question.kind === 'choice' ?
      'Kies eerst een antwoord.' : 'Typ eerst je antwoord of bekijk de uitwerking.');
    return;
  }
  const needsReview = question.kind === 'card' || question.kind === 'open';
  const correct = !skip && !needsReview && (selection ? checkSelection(question, selection) : isCorrect(question, response));
  if (!formal && !needsReview && !skip && !correct && !session.retry) {
    session.retry = hasAccentError(question, response) ? 'accent' : true;
    await storeSession();
    showQuiz(false);
    main.querySelector('.retry')?.focus();
    return;
  }
  const hinted = Boolean(session.hints?.[session.index]) || Boolean(session.retry);
  const rating = skip ? 'again' : needsReview ? null : correct ? (hinted ? 'help' : 'good') : 'again';
  const answer = { response: skip ? '' : response, rating, hinted, selection, skipped: skip };
  session.answers[session.index] = answer;
  if (formal) {
    await nextQuestion();
    return;
  }
  await storeSession(rating ? studyEvents(question, answer) : []);
  showQuiz(false);
  main.querySelector('.feedback')?.focus();
}

async function rateQuestion(rating) {
  if (!session || !['good', 'again', 'easy'].includes(rating)) return;
  const answer = session.answers[session.index];
  if (!answer || answer.rating) return;
  answer.rating = answer.hinted && rating !== 'again' ? 'help' : rating;
  await storeSession(studyEvents(session.questions[session.index], answer));
  showQuiz(false);
}

async function nextQuestion() {
  if (!session) return;
  if (session.index >= session.questions.length - 1) {
    await finishQuiz();
    return;
  }
  if (session.mode === 'placement' && session.questions[session.index].level !== session.questions[session.index + 1].level) {
    const taken = session.questions.slice(0, session.index + 1);
    const { correct, total } = estimateLevel(taken, session.answers).rows.find(row => row.level === taken.at(-1).level);
    if (!placementPassed(correct, total)) {
      session.questions = taken;
      await finishQuiz();
      return;
    }
  }
  session.index++;
  session.response = '';
  session.selection = undefined;
  session.typeOrder = false;
  session.retry = false;
  await storeSession();
  showQuiz();
}

async function finishQuiz() {
  if (!session) return;
  clearInterval(clock);
  const current = session;
  // Blank timed-out responses count as missed; submitted open answers can still be reviewed.
  current.questions.forEach((question, index) => {
    if (!current.answers[index]) current.answers[index] = { response: '', rating: 'again', skipped: true };
  });
  const data = view.summarizeSession(current);
  if (current.mode === 'placement') data.estimate = estimateLevel(current.questions, current.answers);
  const id = 'result-' + current.id;
  if (current.daily) {
    const {date,step} = current.daily;
    const plan = records.find(row => row.id === 'daily-' + date)?.data?.daily;
    const stats = { total:data.total, correct:data.correct,
      hinted:current.answers.filter(answer => answer.hinted).length,
      assisted:current.answers.filter(answer => answer.rating === 'help').length,
      revisit:current.questions.flatMap((q,i) => reviewTargets(q, current.answers[i])) };
    const finished = record('draft', 'draft-' + current.id, { finished: true }, now());
    if (plan) await saveDailyStep(plan, step, stats, [finished]);
    else await saveRows([finished]);
    session = null;
    jump('dagles/' + date);
    message('Stap afgerond.');
    return;
  }
  const examReviews = current.mode === 'exam' ? current.questions.flatMap((q, index) => {
    const rating = current.answers[index].rating;
    return rating ? [record('review', 'review-' + id + '-' + index, { key: q.key, question: q.id, lesson: q.lesson, rating }, now())] : [];
  }) : [];
  data.studyDay = dayKey();
  if (current.mode === 'exam') {
    data.examType = current.examType;
    if (current.examWeek) data.examWeek = current.examWeek;
    if (data.reviewed === data.total) data.gradedDay = data.studyDay;
  }
  await saveRows([
    ...examReviews,
    record('result', id, data, now()),
    record('draft', 'draft-' + current.id, { finished: true }, now()),
    ...(countsAsPractice(data) ? marksStudy(data.studyDay) : []),
  ]);
  session = null;
  jump('resultaat/' + id);
}

async function rateExam(value) {
  const [id, index, rating] = value.split('/');
  const result = records.find(x => x.id === id && x.kind === 'result');
  if (!result || !['again', 'good'].includes(rating)) return;
  const data = structuredClone(result.data);
  if (!data.answers[index] || data.answers[index].rating) return;
  data.answers[index].rating = rating;
  const q = data.questions[index];
  const counts = tally(data.questions, data.answers);
  data.studyDay ??= dayKey(new Date(result.at));
  if (counts.reviewed === counts.total) data.gradedDay = dayKey();
  await saveRows([record('result', id, { ...data, ...counts }, now()),
    record('review', 'review-' + id + '-' + index, { key: q.key, question: q.id, lesson: q.lesson, rating }, now())]);
  render(false);
}

async function setLevel(value) {
  const [track, level] = value.split('/');
  if (!LEVELS.includes(level) || TRACKS[track]?.section !== 'language') return;
  await requireProfile();
  await saveRows([record('prefs', 'pref-level-' + track, { name: track, value: level }, now())]);
  const [section, activeTrack] = route();
  if (section === 'talen' && activeTrack === track) {
    routeFilter = '';
    render(false);
  } else jump('talen/' + track);
}

function speak(text, lang) {
  if (!text || !languageSupport()) {
    message('Je browser heeft hier geen voorlezer. Je kunt de tekst in de correctie lezen.');
    return;
  }
  const speech = new SpeechSynthesisUtterance(text);
  speech.lang = lang || 'fr-FR';
  speech.rate = .88;
  const voices = speechSynthesis.getVoices();
  const language = speech.lang.slice(0, 2);
  speech.voice = voices.find(v => v.lang.toLowerCase() === speech.lang.toLowerCase() && v.localService) ??
    voices.find(v => v.lang.slice(0, 2).toLowerCase() === language && v.localService) ??
    voices.find(v => v.lang.slice(0, 2).toLowerCase() === language) ?? null;
  speech.onerror = () => message('Geen stem beschikbaar. Kijk in de spraakinstellingen van je toestel.');
  speechSynthesis.cancel();
  speechSynthesis.speak(speech);
}

function saveFile(payload, filename, mime = 'application/json') {
  const href = URL.createObjectURL(new Blob([payload], { type: mime }));
  const link = document.createElement('a');
  link.href = href;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(href), 2000);
}

async function saveImportDraft() {
  if (!profile && !importDraft.text && !importDraft.fileName) return;
  await requireProfile();
  await saveRows([record('import', 'import-draft', importDraft, now())], false);
}

function importFormValues(form) {
  return Object.fromEntries(new FormData(form).entries());
}

async function readImportFile(input) {
  const file = input.files[0];
  if (!file) return;
  const form = input.form;
  const fields = importFormValues(form);
  const notify = document.querySelector('#import-message');
  inlineMessage(notify, 'Bestand lezen…');
  const pages = await readStudyFile(file, {
    start: Number(fields.pdfStart || 1), end: Number(fields.pdfEnd || 0),
    onPage: (i, last) => inlineMessage(notify, 'PDF-pagina ' + i + ' van ' + last + ' lezen…'),
  });
  importDraft = { ...importDraft, ...fields, pages, fileName: file.name, title: fields.title || file.name.replace(/\.[^.]+$/, '').slice(0, 100) };
  await saveImportDraft();
  render(false);
}

async function makePreview(form) {
  const fields = importFormValues(form);
  importDraft = { ...importDraft, ...fields };
  await saveImportDraft();
  if (!fields.title.trim()) return;
  const sections = [...(importDraft.pages ?? [])];
  if (fields.text.trim()) sections.unshift({ text: fields.text.trim() });
  if (!sections.length) throw new Error('Plak tekst of kies een bestand.');
  importPreview = generateLessons({ ...fields, title: fields.title.trim() }, sections);
  render();
}

async function savePreview() {
  const decks = importPreview.map(l => ({
    ...l,
    items: l.items.map(item => ({ ...item, questions: item.questions.filter(q => q.text.trim() && q.answer.trim()) })).filter(item => item.questions.length),
  })).filter(validDeck);
  if (!decks.length) throw new Error('Bewaar minstens één bruikbare vraag met een antwoord.');
  await saveRows(decks.map(deck => record('deck', deck.id, deck, now())));
  importPreview = [];
  importDraft = {};
  await saveImportDraft();
  message('Je leerstof is opgeslagen.');
  jump('les/' + decks[0].id);
}

async function restoreBackup(file) {
  if (!file) return;
  if (file.size > 30_000_000) throw new Error('Dit back-upbestand is groter dan 30 MB.');
  const data = JSON.parse(await file.text());
  const valid = row => row && /^[a-z0-9/-]{1,160}$/i.test(row.id) && Number.isSafeInteger(row.at) && row.at > 0
    && row.at <= Date.now() + 300_000 && row.data && typeof row.data === 'object'
    && ((row.kind === 'deck' && validDeck(row.data))
      || (row.kind === 'review' && typeof row.data.key === 'string' && ['good', 'again', 'easy', 'help'].includes(row.data.rating))
      || (row.kind === 'prefs' && ((['it','fr'].includes(row.data.name) && LEVELS.includes(row.data.value))
        || (row.data.name === 'streak-day' && isStudyDay(row.data.date) && row.id === studyRecordId(row.data.date))
        || (row.id === 'weekly-goal' && row.data.name === 'weekly-goal' && validGoal(row.data.value))
        || isHistoryRead(row)
        || (typeof row.data.name === 'string' && row.data.name.startsWith('quick-')
          && contentKeys.includes(row.data.name.slice(6)) && typeof row.data.value === 'boolean')))
      || (row.kind === 'result' && Array.isArray(row.data.questions) && Array.isArray(row.data.answers)
        && row.data.questions.every(q => typeof q.text === 'string' && typeof q.answer === 'string' &&
          (!q.criteria || Array.isArray(q.criteria))) && Number.isInteger(row.data.total)
        && Number.isInteger(row.data.correct) && Number.isInteger(row.data.reviewed)
        && (row.data.mode !== 'placement' || (LEVELS.includes(row.data.estimate?.recommended)
          && Array.isArray(row.data.estimate.rows) && row.data.estimate.rows.every(x =>
            LEVELS.includes(x.level) && Number.isInteger(x.correct) && Number.isInteger(x.total))))));
  if (data.athenaeum_learning !== 1 || !Array.isArray(data.records) || data.records.length > 60_000) {
    throw new Error('Kies een back-up van het Athenaeum-leerplatform.');
  }
  const safe = data.records.filter(valid);
  await requireProfile();
  for (let i = 0; i < safe.length; i += 250) await saveRows(safe.slice(i, i + 250));
  message(safe.length + ' leerrecords ingeladen.');
  render(false);
}

function cacheLessons() {
  if (!('serviceWorker' in navigator)) throw new Error('Offline downloaden is in deze browser niet beschikbaar.');
  return Promise.race([
    navigator.serviceWorker.ready.then(worker => new Promise((resolve, reject) => {
      const channel = new MessageChannel();
      channel.port1.onmessage = event => event.data?.ok ? resolve() : reject(new Error('Downloaden is onderbroken. Probeer het opnieuw met verbinding.'));
      worker.active.postMessage({ type: 'CACHE_LEARNING' }, [channel.port2]);
    })),
    new Promise((_, reject) => setTimeout(() => reject(new Error('De download heeft te lang geduurd. Probeer het opnieuw.')), 25000)),
  ]);
}

async function run(action, target) {
  if (actionBusy) return;
  actionBusy = true;
  try {
    await action();
  } catch (error) {
    if (target) inlineMessage(target, error.message || 'Er liep iets mis. Probeer het opnieuw.', true);
    else message(error.message || 'Er liep iets mis. Probeer het opnieuw.');
  } finally {
    actionBusy = false;
  }
}

function signOutPrompt() {
  showDialog(dialogText('Afmelden', 'De app bewaart je voortgang op dit toestel en in je account zodra die is bijgewerkt.',
    '<button type="button" class="button primary" data-action="confirm-logout">Afmelden op dit toestel</button>'));
}

async function transitionCloud(result) {
  await setProfile(result.profile);
  dialog.close();
  render();
  message('Aangemeld. Je voortgang wordt bijgewerkt.');
}

const actions = {
  'quick': () => quick(),
  'daily-next': dailyNext,
  'research-new': async () => {
    await requireProfile();
    await saveResearch(emptyResearch(),'vraag');
  },
  'research-case': id => attachWitness(researchCaseIndex().find(c => c.id === id)),
  'research-own': () => attachWitness(),
  'research-view-witness': id => {
    const doc = ongoingResearch();
    researchPanel(doc).witness = id;
    researchPanel(doc).matches = undefined;
    jump('onderzoek/' + doc.id + '/bron');
  },
  'research-select': async id => {
    const doc = ongoingResearch();
    const current = editWitness(doc);
    if (current) await storeWitness(doc,current);
    researchPanel(doc).witness = id;
    researchPanel(doc).matches = undefined;
    render(false);
  },
  'research-copy': async () => {
    const doc = ongoingResearch();
    const terms = document.querySelector('#research-terms')?.value || doc.terms || doc.question;
    if (!terms) throw new Error('Vul eerst een vraag of zoektermen in.');
    await navigator.clipboard.writeText(terms);
    message('Gekopieerd. Je kunt de tekst in de Research Hub plakken.');
  },
  'research-study': async id => {
    const doc = ongoingResearch();
    const study = researchPanel(doc).studies?.find(s => s.id === id);
    if (!study) return;
    if (doc.studies.some(s => s.doi === study.doi)) throw new Error('Deze publicatie staat al in je dossier.');
    await saveResearch({...doc,studies:[...doc.studies,{...study,id:crypto.randomUUID(),relation:'open'}]},'debat');
  },
  'research-new-study': async () => {
    const doc = ongoingResearch();
    await saveResearch({...doc,studies:[...doc.studies,{id:crypto.randomUUID(),status:'tocheck',relation:'open'}]},'debat');
  },
  'research-matches': async () => {
    const doc = ongoingResearch();
    const witness = editWitness(doc);
    if (!witness?.passage) throw new Error('Voeg eerst een passage toe.');
    await storeWitness(doc,witness);
    researchPanel(doc).matches = passageMatches(witness,doc.terms || doc.question);
    render(false);
  },
  'research-export': () => {
    const doc = ongoingResearch();
    const form = document.querySelector('#research-question-form, #research-synthesis');
    saveFile(researchMarkdown(form ? {...doc,...formValues(form)} : doc),'Athenaeum-onderzoeksdossier.md','text/markdown;charset=utf-8');
  },
  'hint': async value => {
    if (!session || session.mode === 'exam' || session.mode === 'placement' || session.answers[session.index]) return;
    const max = tipsFor(session.questions[session.index]).length;
    session.hints ??= {};
    session.hints[session.index] = value === 'full' ? max : Math.min(max, (session.hints[session.index] || 0) + 1);
    await storeSession();
    showQuiz(false);
    main.querySelector('.hint-list')?.focus();
  },
  'drill': async value => {
    const [track,length] = value.split('/');
    if (!contentKeys.includes(track) || !['5','15','30'].includes(length)) return;
    await loadFor(packsForTracks([track]));
    const questions = drillQuestions(relevantPool(track), reviews(), {
      limit: Number(length), noAudio: !languageSupport(), compact: length === '5' && !HISTORICAL_TRACKS.includes(track),
    });
    if (!questions.length) throw new Error('Er zijn hier nog geen passende vragen.');
    const name = TRACKS[track].name + (['fr', 'it'].includes(track) ? ' ' + (prefs()[track] ?? 'A1') : '');
    const title = isLanguageTopic(track, route()[2]) ? 'Oefenreeks' : 'Gemengde oefenreeks';
    await startQuiz('lesson', title + ' · ' + name, questions, { track, back: route().join('/') });
  },
  'history-read': async id => {
    const lesson = lessonList().find(row => row.id === id);
    if (!lesson || (lesson.track !== 'traditio' && (!HISTORICAL_TRACKS.includes(lesson.track) || !Number.isInteger(chronologyYear(lesson))))) return;
    await requireProfile();
    const value = !readLessons().has(id);
    await saveRows([record('prefs', historyReadId(id), { name: 'history-read', lesson: id, value }, now())]);
    render(false);
    main.querySelector('[data-action="history-read"]')?.focus({ preventScroll: true });
    message(value ? 'Les gemarkeerd als gelezen.' : 'Markering verwijderd.');
  },
  'history-mix': async () => {
    await loadFor(packsForTracks(HISTORICAL_TRACKS));
    const core = chronologicalLessons(lessonList());
    const { lessons: studied } = reviews();
    const read = readLessons();
    const familiar = core.filter(lesson => read.has(lesson.id) || studied.has(lesson.id));
    const options = familiar.length >= 6 && new Set(familiar.map(lesson => lesson.track)).size >= 3 ? familiar : core;
    const questions = drillQuestions(makePool(options), reviews(), { limit: 8, noAudio: true });
    if (!questions.length) throw new Error('Er zijn momenteel geen geschiedenisvragen beschikbaar.');
    await startQuiz('lesson', 'Geschiedenis door elkaar', questions, { back: route().join('/') });
  },
  'scroll-to': id => {
    const target = document.getElementById(id);
    target?.focus({ preventScroll: true });
    target?.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  },
  'lesson-more': async id => {
    const lesson = lessonList().find(row => row.id === id);
    if (!lesson) return;
    const questions = drillQuestions(makePool([lesson]), reviews(), {limit:20,noAudio:!languageSupport()});
    await startQuiz('lesson','Uitgebreid oefenen · ' + lesson.title,questions,{track:lesson.track,back:lessonBack(id)});
  },
  'practice-again': id => {
    const result = records.find(row => row.kind === 'result' && row.id === id)?.data;
    if (!result) return;
    const targets = result.questions.flatMap((q, i) => reviewTargets(q, result.answers[i]));
    return practiceAgain(targets, result.questions.map(q => q.id), result.back || 'vandaag');
  },
  'daily-practice-again': date => {
    const plan = archivedPlans(records).find(row => row.date === date);
    if (!plan?.completed) return;
    const targets = Object.values(plan.results).flatMap(row => row.revisit ?? []);
    return practiceAgain(targets, [], 'dagles/' + date);
  },
  'scriptorium-open': async section => {
    const p = await requireProfile();
    if (store.profileApps(p).includes('scriptorium')) location.assign(scriptoriumURL(section, p.id));
  },
  'scriptorium-practice': async () => {
    const ids = ['egezische-bronstijd','mesopotamie-stad-en-schrift','rome-dieren'];
    await loadFor([...new Set(ids.map(id => byLessonId.get(id)?.pack).filter(Boolean))]);
    const lessons = lessonList().filter(lesson => ids.includes(lesson.id));
    const questions = makePool(lessons).flatMap(item => item.practice.filter(q => q.variant === 'application-0' && q.kind === 'choice'));
    if (!questions.length) throw new Error('Open Athenaeum online om de bronoefening te laden.');
    await startQuiz('lesson', 'Wat toont je bron?', questions, { back: 'scriptorium/oefenen' });
  },
  'quick-track': value => quick(value),
  'extra': value => quick(value, true),
  'resume': () => { session = activeSession(); jump('sessie'); },
  'close-dialog': () => dialog.close(),
  'account': () => cloudUser() ? jump('meer') : showAccount(),
  'auth-mode': value => showAccount(value, dialog.querySelector('#email')?.value ?? ''),
  'lesson-search-clear': () => {
    setLessonQuery('');
    document.querySelector('#lesson-query').focus();
  },
  'lesson-search-example': value => {
    setLessonQuery(value);
    document.querySelector('#lesson-search-status').focus();
  },
  'profiles': showProfiles,
  'choose-profile': chooseProfile,
  'level': setLevel,
  'use-level': setLevel,
  'route-filter': value => { routeFilter = value; render(false); },
  'lesson-quiz': async id => {
    const unit = lessonList().find(x => x.id === id);
    if (!unit) return;
    const pool = makePool([unit]);
    const questions = unit.structure ? pool.flatMap(item => item.questions) :
      lessonQuestions(pool, reviews(), { noAudio: !languageSupport() });
    if (!questions.length) throw new Error('Deze les heeft op dit toestel geen geschikte vragen.');
    await startQuiz('lesson', unit.title, questions, { track: unit.track, back: lessonBack(id) });
  },
  'language-practice': async value => {
    const [id, skill] = value.split('/');
    const lesson = lessonList().find(row => row.id === id && row.languageTopic);
    if (!lesson || !Object.hasOwn(LANGUAGE_SKILLS, skill)) return;
    const questions = languageQuestions(makePool([lesson]), skill, reviews());
    await startQuiz('lesson', LANGUAGE_SKILLS[skill] + ' · ' + lesson.title, questions, { track: lesson.track, back: 'les/' + id });
  },
  'placement': async track => {
    await loadFor(packsForTracks([track]));
    const questions = placementQuestions(makePool(loadedLessons().filter(lesson => lesson.track === track && (track === 'fr' || !lesson.languageTopic))));
    if (questions.length < 15) throw new Error('De instaptest kon nog niet worden geladen. Open de app online.');
    await startQuiz('placement', 'Instaptest ' + TRACKS[track].name, questions, { track, back: 'talen/' + track });
  },
  'open-paideia': () => { dialog.close(); jump('paideia'); },
  'exam-practice': async () => {
    await loadFor(packsForTracks(studyTracks));
    const lessons = lessonList().filter(l => TRACKS[l.track].section === 'history');
    const history = reviews();
    const pool = makePool(lessons);
    const studied = pool.filter(item => history.states.has(item.key));
    const varied = new Set(studied.map(item => item.topic)).size >= 3;
    const questions = drillQuestions(varied ? studied : pool, history, { limit: 5, noAudio: true, compact: true });
    if (!questions.length) throw new Error('Open Athenaeum online om de voorbeeldvragen te laden.');
    if (dialog.open) dialog.close();
    await startQuiz('lesson', 'Oefentoets Paideia', questions, { back: 'toetsen' });
  },
  'exam': async type => {
    await loadFor(packsForTracks(studyTracks));
    const allGoals = type.endsWith('-all');
    const monthly = type === 'month' || type === 'month-all';
    const lessons = lessonList();
    const week = monthly ? null : weeklyStudy(lessons, records);
    const questions = monthly
      ? examQuestions(makePool(lessons.filter(l => TRACKS[l.track].section === 'history')), reviews(), true, allGoals)
      : weeklyExamQuestions(week, reviews(), allGoals);
    if (!questions.length) {
      const description = monthly ? 'Je kunt deze toets starten na ' + EXAM_GOALS.month + ' geoefende leerdoelen uit Paideia.' :
        'Oefen deze week minstens twee leerdoelen in Paideia of markeer een kernles, verdieping of bronles als gelezen.';
      showDialog(dialogText(monthly ? 'Begin met de oefentoets' : 'Je examenstof voor deze week', description,
        '<div class="row"><button type="button" class="button primary" data-action="open-paideia">Open Paideia</button>' +
        '<button type="button" class="button quiet" data-action="exam-practice">Start oefentoets</button>' +
        '<button type="button" class="button quiet" data-action="close-dialog">Sluiten</button></div>'));
      return;
    }
    await startQuiz('exam', monthly ? 'Maandtoets' : 'Weekexamen', questions, {
      duration: allGoals ? null : monthly ? 75 : 45, examType: monthly ? 'month' : 'week', examWeek: week?.startKey, back: 'toetsen',
    });
  },
  'quiz-start': async () => {
    if (session?.started !== false) return;
    session.started = true;
    if (session.duration) session.deadline = Date.now() + session.duration * 60_000;
    await storeSession();
    showQuiz();
  },
  'pause': async () => {
    const back = session.back;
    await storeSession();
    session = null;
    jump(back || 'vandaag');
    message('Sessie bewaard.');
  },
  'choose': async value => {
    const q = session.questions[session.index];
    session.response = q.options[Number(value)];
    for (const button of main.querySelectorAll('.choice')) {
      button.dataset.selected = String(value === button.dataset.value);
      button.setAttribute('aria-pressed', button.dataset.selected);
    }
    await storeSession();
  },
  'add-part': value => updateOrder(Number(value), true),
  'remove-part': value => updateOrder(Number(value), false),
  'toggle-type-order': async () => {
    const q = session?.questions[session.index];
    if (q?.kind !== 'order' || !q.language || session.answers[session.index]) return;
    session.typeOrder = !session.typeOrder;
    await storeSession();
    showQuiz(false);
    (main.querySelector('#answer') ?? main.querySelector('[data-action="add-part"]:not([disabled])'))?.focus({ preventScroll: true });
  },
  'listen': () => {
    const q = session?.questions[session.index];
    if (q) speak(q.audio, q.language);
  },
  'listen-prompt': () => {
    const q = session?.questions[session.index];
    if (q) speak(q.audioPrompt, q.language);
  },
  'result-listen': value => {
    const [id, index] = value.split('/');
    const q = records.find(row => row.kind === 'result' && row.id === id)?.data?.questions[index];
    if (q) speak(q.audio, q.language);
  },
  'speak-line': value => {
    const [id, i] = value.split('/');
    const lesson = lessonList().find(row => row.id === id);
    if (lesson) speak(lesson.dialogue?.[i]?.text, TRACKS[lesson.track].lang);
  },
  'speak-vocab': value => {
    const [id, index] = value.split('/');
    const lesson = lessonList().find(row => row.id === id);
    if (lesson?.vocabulary?.[index]) speak(lesson.vocabulary[index][0], TRACKS[lesson.track].lang);
  },
  'speak-grammar': id => {
    const lesson = lessonList().find(row => row.id === id);
    if (lesson?.grammar) speak(lesson.grammar.example, TRACKS[lesson.track].lang);
  },
  'submit-answer': () => answerQuestion(),
  'skip-question': () => answerQuestion(true),
  'next-question': nextQuestion,
  'rate': rateQuestion,
  'exam-rate': rateExam,
  'remove-file': async () => {
    delete importDraft.pages;
    delete importDraft.fileName;
    await saveImportDraft();
    render(false);
  },
  'cancel-preview': () => { importPreview = []; render(false); },
  'remove-question': value => {
    const [li, ii, qi] = value.split('/').map(Number);
    importPreview[li].items[ii].questions.splice(qi, 1);
    render(false);
  },
  'save-preview': savePreview,
  'delete-deck': id => showDialog(dialogText('Les verwijderen', 'De eigen les verdwijnt van je leerpaden.',
    `<button class="button danger" data-action="confirm-delete-deck" data-value="${view.esc(id)}">Verwijder de les</button>`)),
  'confirm-delete-deck': async id => {
    await saveRows([record('deck', id, { deleted: true }, now())]);
    dialog.close();
    jump('importeren');
    message('De les is verwijderd.');
  },
  'sync': () => synchronize(true),
  'logout': signOutPrompt,
  'confirm-logout': async () => {
    const leaving = profile;
    await setProfile(null);
    await sync.signOut(leaving.id);
    sessionStorage.removeItem('athenaeum_unlocked_' + leaving.id);
    dialog.close();
    jump('vandaag');
  },
  'push-add-time': () => {
    const list = document.querySelector('#push-times');
    if (!list || list.children.length >= MAX_REMINDERS) return;
    list.insertAdjacentHTML('beforeend', view.notificationTimeRow(Number(list.dataset.next)));
    list.dataset.next = Number(list.dataset.next) + 1;
    list.lastElementChild.querySelector('input').focus();
    list.closest('form').querySelector('[data-action="push-add-time"]').disabled = list.children.length >= MAX_REMINDERS;
  },
  'push-remove-time': id => {
    const row = document.getElementById('reminder-time-' + id)?.closest('.reminder-time');
    if (!row) return;
    const list = row.parentElement;
    const add = list.closest('form').querySelector('[data-action="push-add-time"]');
    row.remove();
    add.disabled = false;
    add.focus();
  },
  'push-retry': () => { notifications = undefined; render(false); },
  'push-test': async () => {
    await testPush(profile.id, notifications.setup);
    message('Testmelding verstuurd. Kijk bij meldingen op dit toestel.');
  },
  'push-off': async () => {
    await stopPush(profile.id);
    if (notifications?.setup) notifications.setup.subscription = null;
    render(false);
    message('Appmeldingen staan uit op dit toestel.');
  },
  'install': async () => {
    if (matchMedia('(display-mode: standalone)').matches || navigator.standalone) {
      message('Athenaeum is al geïnstalleerd op dit toestel.');
      return;
    }
    if (installPrompt) {
      await installPrompt.prompt();
      installPrompt = null;
      return;
    }
    showDialog(dialogText('Athenaeum installeren', 'Open deze link in je browser. Kies in het menu App installeren of Toevoegen aan beginscherm. Op iPhone en iPad staat die optie in het deelmenu.'));
  },
  'retry-content': () => { readingError = false; traditionViewError = false; const [section,key,tab] = route(); loadFor(routePacks(section,key,tab), true); render(false); },
  'traditio-exam': async group => {
    if (!traditionView) return;
    const questions = traditionView.traditioExamQuestions(group);
    if (questions.length) await startQuiz('exam', 'Traditio · Bronnen en verhalen', questions, { track: 'traditio', examType: 'traditio', back: 'traditio/' + encodeURIComponent(group) });
  },
  'reload-page': () => location.reload(),
  'offline': async () => {
    message('Lessen downloaden…');
    await cacheLessons();
    offlineReady = true;
    if (route()[0] === 'meer') render(false);
    message('De lessen zijn klaar voor offline gebruik.');
  },
  'export': async () => {
    if (!profile) throw new Error('Zodra je iets oefent kun je een back-up maken.');
    const exportRows = (await backups(profile.id)).filter(x => !['reset','draft'].includes(x.kind));
    saveFile(JSON.stringify({ athenaeum_learning: 1, records: exportRows }, null, 2), 'Athenaeum-backup.json');
  },
  'restore': () => document.querySelector('#backup-input')?.click(),
  'clear-data': () => showDialog(dialogText('Leergegevens wissen', 'Dit wist voortgang en eigen lessen van het leerplatform. Maak eerst een back-up als je ze wil bewaren.',
    '<button class="button danger" data-action="confirm-clear">Wis mijn leergegevens</button>')),
  'confirm-clear': async () => {
    const pid = profile.id;
    clearTimeout(syncTimer);
    if (syncPid) throw new Error('Wacht tot het bijwerken klaar is en probeer opnieuw.');
    const resetAt = cloudUser() ? await clearCloudLearning(pid) : 0;
    await forgetRecords(pid);
    if (resetAt) {
      lastRecordTime = Math.max(lastRecordTime, resetAt);
      await storeRecords(pid, [record('reset', 'reset', {}, resetAt)], false);
    }
    await setProfile(profile);
    dialog.close();
    render(false);
    message('Je leergegevens zijn gewist.');
  },
};

document.addEventListener('click', event => {
  const menu = document.querySelector('.app-menu[open]');
  if (menu && !event.target.closest('.app-menu')) menu.open = false;
  if (event.target.closest('a[href="#zoeken"]') && event.button === 0 &&
      !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
    event.preventDefault();
    if (route()[0] !== 'zoeken') {
      if (session) storeSession().catch(error => message(error.message));
      history.pushState(null, '', '#zoeken');
      session = null;
      render();
    }
    document.querySelector('#lesson-query')?.focus({ preventScroll: true });
    return;
  }
  const button = event.target.closest('[data-action]');
  if (!button || !actions[button.dataset.action]) return;
  event.preventDefault();
  const focusBefore = document.activeElement;
  button.setAttribute('aria-busy', 'true');
  run(() => actions[button.dataset.action](button.dataset.value ?? '')).finally(() => {
    button.removeAttribute('aria-busy');
    if (focusBefore === button && !button.isConnected && !dialog.open && !main.contains(document.activeElement)) main.focus({ preventScroll: true });
  });
});

document.addEventListener('submit', event => {
  const form = event.target;
  if (form.id === 'weekly-goal-form') {
    event.preventDefault();
    const value = Number(new FormData(form).get('lessons'));
    if (validGoal(value)) run(async () => {
      await requireProfile();
      await saveRows([record('prefs', 'weekly-goal', { name: 'weekly-goal', value }, now())]);
      render(false);
      message('Je weekdoel is bewaard.');
    });
    return;
  }
  if (form.id === 'lesson-search-form') {
    event.preventDefault();
    lessonQuery = form.elements.query.value;
    showLessonMatches();
    if (lessonQuery.trim()) document.querySelector('#lesson-search-status:not([hidden])')?.focus();
    return;
  }
  if (form.id?.startsWith('research-') || form.classList.contains('research-literature') || form.classList.contains('research-note-form')) {
    event.preventDefault();
    run(() => researchSubmit(form,event.submitter), form.querySelector('#research-insert-message,#research-comparison-message'));
  }
  if (form.id === 'scriptorium-paste-form') {
    event.preventDefault();
    const material = scriptoriumPaste(new FormData(form).get('work'));
    if (!material) {
      inlineMessage(form.querySelector('[role="status"]'), 'Plak de volledige gegevens die je in Scriptorium hebt gekopieerd.', true);
      return;
    }
    wantScriptoriumWork(material);
  }
  if (form.id === 'scriptorium-transfer-form') {
    event.preventDefault();
    run(() => saveScriptoriumWork(form));
  }
  if (form.id === 'daily-form') {
    event.preventDefault();
    run(() => createDay(form));
  }
  if (form.id === 'pin-form') {
    event.preventDefault();
    run(async () => {
      const p = store.loadProfiles().find(x => x.id === form.dataset.profile);
      if (!p || !await store.verifyPin(p, form.elements.pin.value)) {
        inlineMessage(form.querySelector('#pin-error'), 'Deze pincode klopt niet.', true);
        return;
      }
      await setProfile(p);
      dialog.close();
      render();
    });
  }
  if (form.id === 'account-form') {
    event.preventDefault();
    const submit = form.querySelector('[type="submit"]');
    run(async () => {
      submit.disabled = true;
      const values = Object.fromEntries(new FormData(form));
      try {
        const result = await authenticate({ ...values, mode: form.dataset.mode, current: profile });
        if (result.needsConfirmation) {
          showAccount('login', values.email);
          inlineMessage(dialog.querySelector('#auth-message'), 'Open de bevestigingsmail en klik op de link. Meld je daarna hier aan met je wachtwoord.');
          return;
        }
        await transitionCloud(result);
      } catch (error) {
        inlineMessage(form.querySelector('#auth-message'), authMessage(error), true);
      } finally {
        submit.disabled = false;
      }
    });
  }
  if (form.id === 'import-form') {
    event.preventDefault();
    run(() => makePreview(form), document.querySelector('#import-message'));
  }
  if (form.id === 'paths-form') {
    event.preventDefault();
    run(async () => {
      const selected = new Set(new FormData(form).getAll('track'));
      if (!selected.size) throw new Error('Kies minstens één leerpad voor je sneloefeningen.');
      await requireProfile();
      await saveRows(contentKeys.map(key => record('prefs', 'pref-quick-' + key, { name: 'quick-' + key, value: selected.has(key) }, now())));
      render(false);
      message('Je leerpaden zijn bewaard.');
    });
  }
  if (form.id === 'push-form') {
    event.preventDefault();
    const fields = new FormData(form);
    const { setup, pid } = notifications;
    const submit = event.submitter;
    run(async () => {
      if (submit) submit.disabled = true;
      try {
        await savePush(pid, setup, readSchedule(fields));
        if (streakStatus(records).studiedToday) {
          const marker = marksStudy(dayKey());
          if (marker.length) await saveRows(marker);
        }
        render(false);
        message('Appmeldingen staan aan op dit toestel.');
      } catch (error) {
        inlineMessage(document.querySelector('#push-message'), error.name === 'NotAllowedError'
          ? 'Geef Athenaeum toestemming in de meldingsinstellingen van je browser of toestel.' : error.message, true);
      } finally {
        if (submit) submit.disabled = false;
      }
    });
  }
});

let inputTimer;
let importTimer;
document.addEventListener('input', event => {
  const input = event.target;
  if (input.id === 'lesson-query') {
    lessonQuery = input.value;
    clearTimeout(lessonSearchTimer);
    lessonSearchTimer = setTimeout(showLessonMatches, 130);
    return;
  }
  if (input.id === 'course-search') {
    courseFind = input.value;
    filterCourses();
  }
  if (input.id === 'answer' && session) {
    session.response = input.value;
    clearTimeout(inputTimer);
    inputTimer = setTimeout(() => { if (session) storeSession().catch(error => message(error.message)); }, 160);
  }
  if (input.dataset.edit) {
    const lesson = importPreview[Number(input.dataset.lesson)];
    const item = lesson?.items[Number(input.dataset.item)];
    const question = item?.questions[Number(input.dataset.question)];
    const target = question ?? item ?? lesson;
    if (!target) return;
    const field = input.dataset.edit;
    if (question && field === 'answer') {
      if (question.options) question.options = question.options.map(option => option === question.answer ? input.value : option);
      if (question.kind === 'listen' && question.audio === question.answer) question.audio = input.value;
    }
    target[field] = input.value;
  }
  if (input.form?.id === 'import-form') {
    importDraft = { ...importDraft, ...importFormValues(input.form) };
    clearTimeout(importTimer);
    importTimer = setTimeout(() => saveImportDraft().catch(error => message(error.message)), 220);
  }
  if (input.form?.id === 'research-insert' && input.type !== 'file') {
    const { file, ...draft } = formValues(input.form);
    researchPanel(ongoingResearch()).insertDraft = draft;
  }
  if (input.form?.id === 'research-comparison') {
    const panel = researchPanel(ongoingResearch());
    panel.comparisonDrafts ??= new Map();
    panel.comparisonDrafts.set(route()[3] || '',comparisonFromForm(new FormData(input.form),input.form.dataset.id));
  }
});

document.addEventListener('change', event => {
  const input = event.target;
  if (input.matches('[data-match-row]') && session && !session.answers[session.index]) {
    const q = session.questions[session.index];
    if (q.kind === 'match') {
      session.selection ??= [];
      session.selection[Number(input.dataset.matchRow)] = input.value === '' ? null : Number(input.value);
      run(() => storeSession());
    }
  }
  if (input.id === 'import-track') document.querySelector('#import-language').hidden = TRACKS[input.value].section !== 'language';
  if (input.id === 'import-file') run(() => readImportFile(input), document.querySelector('#import-message'));
  if (input.id === 'daily-month') { archiveMonth = input.value; render(false); }
  if (input.id === 'research-pdf') run(() => researchPDF(input.files[0]));
  if (input.id === 'research-local-file') {
    const range = document.querySelector('#research-pdf-range');
    range.hidden = !/\.pdf$/i.test(input.files[0]?.name || '');
    for (const page of range.querySelectorAll('input')) page.disabled = range.hidden;
  }
  if (input.form?.id === 'research-comparison' && input.name === 'ref') {
    const current = evidenceList(ongoingResearch()).find(item => item.ref === input.value);
    input.closest('.research-evidence').querySelector('[data-evidence-preview]').innerHTML = evidencePreview(current);
  }
  if (input.id === 'backup-input') run(() => restoreBackup(input.files[0]));
});

document.addEventListener('keydown', event => {
  if (event.key === 'Enter' && event.target.matches('input#answer:not([readonly])')) {
    event.preventDefault();
    run(() => answerQuestion());
    return;
  }
  const menu = event.target.closest('.app-menu[open]');
  if (menu && event.key === 'Escape') {
    menu.open = false;
    menu.querySelector('summary').focus();
  }
  if (event.key === '/' && !event.target.closest('input,textarea,button,[contenteditable]') && !dialog.open) {
    event.preventDefault();
    jump('leer');
  }
});

window.addEventListener('beforeinstallprompt', event => { event.preventDefault(); installPrompt = event; });
window.addEventListener('appinstalled', () => { installPrompt = null; message('Athenaeum is geïnstalleerd.'); });
window.addEventListener('online', () => {
  updateConnection();
  scheduleSync(100);
  if (route().join('/') === 'meer/meldingen') render(false);
  loadFor(routePacks(...route()), true);
  if (!casesLoaded && route()[0] === 'onderzoek') loadCases();
});
window.addEventListener('offline', updateConnection);
window.addEventListener('hashchange', () => {
  if (route()[0] !== 'sessie') session = null;
  const selectedPin = atlasPinDestination && location.hash === '#' + atlasPinDestination;
  atlasPinDestination = undefined;
  render(!selectedPin);
  if (selectedPin) document.querySelector('.atlas-map-open')?.focus({ preventScroll: true });
});
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') scheduleSync(100);
  else if (session) storeSession().catch(() => {});
});
setInterval(() => { if (document.visibilityState === 'visible') scheduleSync(100); }, 55_000);

function refreshContentViews() {
  clearTimeout(contentRender);
  contentRender = setTimeout(() => {
    if (!started || session) return;
    const [section = 'vandaag'] = route();
    if (section === 'les' && main.querySelector('.question,article') && !main.querySelector('.content-loading')) return;
    if (!['paideia', 'talen', 'traditio', 'dagles', 'onderzoek', 'zoeken', 'toetsen', 'les'].includes(section)) return;

    const field = document.activeElement;
    const text = field?.id === 'atlas-search' ? field.value : '';
    render(false);
    const replacement = field?.id && main.querySelector('#' + CSS.escape(field.id));
    if (replacement && ['atlas-search', 'course-search', 'lesson-query'].includes(field.id)) {
      if (field.id === 'atlas-search') {
        replacement.value = text;
        replacement.dispatchEvent(new Event('input', { bubbles: true }));
      }
      replacement.focus({ preventScroll: true });
    }
  }, 70);
}

function loadCases() {
  if (casesLoaded || caseLoad) return;
  const url = new URL('./content/primary-cases.json?v=13r1', import.meta.url);
  caseLoad = fetchJson(url).then(data => {
    if (Array.isArray(data) && data.every(entry => Array.isArray(entry?.tags))) {
      cases = data;
      casesLoaded = true;
      if (started && route()[0] === 'onderzoek' && route()[2] === 'vinden' && !dialog.open &&
          !document.activeElement?.matches('input, textarea, select, button')) render(false);
    }
  }).catch(() => {}).finally(() => { caseLoad = undefined; });
}

function refreshOfflineStatus() {
  const worker = navigator.serviceWorker.controller;
  if (!worker) return;
  const channel = new MessageChannel();
  const timer = setTimeout(() => channel.port1.close(), 4000);
  channel.port1.onmessage = event => {
    clearTimeout(timer);
    channel.port1.close();
    if (navigator.serviceWorker.controller !== worker) return;
    offlineReady = event.data?.ok === true;
    const label = document.getElementById('offline-state');
    if (label) label.textContent = offlineReady ? 'Lessen op dit toestel beschikbaar' : 'Online openen om te downloaden';
  };
  worker.postMessage({ type: 'LEARNING_STATUS' }, [channel.port2]);
}

async function boot() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', refreshOfflineStatus);
    navigator.serviceWorker.ready.then(refreshOfflineStatus).catch(() => {});
    navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' }).catch(() => {});
  }
  const query = new URLSearchParams(location.search);
  const returningProfile = query.get('resume') === '1' || query.get('locked') === '1'
    ? store.loadProfiles().find(p => p.id === query.get('profile')) : null;
  const p = returningProfile || store.currentProfile();
  let profileLoadFailed = false;
  if (p && (!p.pin_hash || sessionStorage.getItem('athenaeum_unlocked_' + p.id)) && (!p.cloud_user_id || sync.status(p.id).signed_in)) {
    try { await setProfile(p); }
    catch (error) {
      profileLoadFailed = true;
      message(error.message || 'Je profiel kon niet worden geopend.');
    }
  }
  started = true;
  render();
  const intent = query.get('open');
  if (query.get('learn') === '1') {
    const next = new URL(location.href);
    next.searchParams.delete('learn');
    history.replaceState(null, '', next.href);
    if (location.href === next.href) await quick();
  }
  else if (intent === 'paideia') jump('paideia');
  else if (intent === 'scriptorium' && !location.hash) jump('scriptorium');
  else if (!location.hash && query.get('page') === 'settings') jump('meer');
  else if (!location.hash && query.get('page') === 'apps') jump('scriptorium');
  if (query.get('account') === 'signup') {
    const next = new URL(location.href);
    next.searchParams.delete('account');
    history.replaceState(null, '', next.href);
    if (cloudUser()) jump('meer');
    else showAccount('signup');
  } else if (p && !profile && !profileLoadFailed) showProfiles();
}

boot().catch(error => {
  displayMain(view.heading('Athenaeum openen') + '<p class="notice error">' + view.esc(error.message) +
    '</p><br><button class="button" type="button" data-action="reload-page">Opnieuw openen</button>');
});
