import { EXAM_GOALS, LEVELS, ROUTES, TRACKS, shuffled, makePool, historyOf, isCorrect, hasAccentError, quickQuestions,
  languageQuestions, lessonQuestions, examQuestions, placementQuestions, placementPassed, estimateLevel, levelFor, tally } from './learning.js?v=13r1';
import { languageLessons } from './language-lessons.js?v=13r1';
import { LANGUAGE_SKILLS } from './language-topics.js?v=13r1';
import { record, readRecords, storeRecords, forgetRecords, backups, syncLearning, clearCloudLearning } from './storage.js';
import { generateLessons, readStudyFile, validDeck, MAX_IMPORT_CHARS } from './importer.js';
import { authenticate, authMessage, makeGuest } from './cloud.js';
import * as view from './views.js?v=13r1';
import { PACE, DAY_FOCI, STAGES, dayKey, archivedPlans, planDay, advanceDay, drillQuestions, tipsFor } from './daily.js?v=13r1';
import { checkSelection, completeSelection, practiceOptions, workedExample } from './practice.js?v=13r1';
import { dailyPage } from './daily-view.js?v=13r1';
import { findCases, findStudies, lessonSourceIndex, passageMatches, caseWitness, researchPage, researchMarkdown, RESEARCH_TABS,
  evidencePreview } from './research.js?v=13r1';
import { addResearchMaterial, comparisonFromForm, evidenceList, validComparison, MAX_COMPARISON_ROWS } from './research-data.js?v=13r1';
import { readResearchFile } from './research-import.js?v=13r1';
import { scriptoriumPaste, scriptoriumShell, scriptoriumTransferDialog, scriptoriumURL } from './scriptorium.js?v=13r1';

const main = document.querySelector('#main');
const pageContent = document.querySelector('#page-content');
const dialog = document.querySelector('#dialog');
const status = document.querySelector('#status');
const store = window.AthStore;
const sync = window.AthSync;
const contentKeys = Object.keys(TRACKS);
let profile = null;
let seed = [];
let contentErrors = [];
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
let archiveMonth = '';
let importDraft = {};
let importPreview = [];
let cases = [];
let expandedCases = [];
const researchPanels = new Map();
let lastResearchId = '';
let pendingScriptoriumWork;

const languageSupport = () => 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
const connection = () => navigator.onLine;
const activeSession = () => records.filter(row => row.kind === 'draft' && row.data?.session && !row.data.finished)
  .sort((a, b) => b.at - a.at)[0]?.data.session;
const lessonList = () => [...seed, ...records.filter(x => x.kind === 'deck' && !x.data.deleted && validDeck(x.data)).map(x => x.data)];
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
const localDate = at => new Date(at).toLocaleDateString('nl-BE');

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

function applyNavigation(section, label) {
  document.querySelector('#location').textContent = label;
  const [today, , , exams, more] = view.NAV;
  const apps = view.APP_NAV.map(n => view.nav(n, section)).join('');
  document.querySelector('#desktop-nav').innerHTML = view.nav(today, section) +
    '<div class="nav apps-group" role="group" aria-labelledby="apps-label"><p id="apps-label" class="rail-heading">Apps</p>' +
    apps + '</div>' + view.nav(exams, section) + view.nav(more, section);
  const activeMobile = ['onderzoek','voortgang','importeren'].includes(section) ? 'meer' : section;
  document.querySelector('#mobile-nav').innerHTML = view.NAV.map(n => view.nav(n, activeMobile)).join('');
  document.querySelector('#mobile-apps').innerHTML = apps;
  const menu = document.querySelector('.app-menu');
  menu.open = false;
  menu.classList.toggle('is-active', section === 'scriptorium');
  document.querySelector('#desktop-secondary').innerHTML = [
    ['onderzoek', 'Onderzoek', 'knowledge'],
    ['voortgang', 'Voortgang', 'graph'], ['importeren', 'Eigen leerstof', 'import'],
  ].map(n => view.nav(n, section)).join('');
  const name = document.querySelector('#account');
  name.textContent = profile?.name || 'Aanmelden';
  name.title = profile ? 'Profiel en account' : 'Aanmelden';
  updateConnection();
}

function updateConnection() {
  document.querySelector('#rail-status').classList.toggle('online', connection());
  document.querySelector('#rail-label').textContent = onlineLabel();
}

function displayMain(markup, { focus = true } = {}) {
  clearInterval(clock);
  pageContent.innerHTML = markup;
  if (focus) {
    main.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
}

function overview(lessons = lessonList()) {
  const { states, lessons: studied } = reviews();
  const byTrack = Object.fromEntries(contentKeys.map(key => [key, { goals: 0, due: 0 }]));
  for (const lesson of lessons) {
    for (const item of lesson.items) {
      const itemState = states.get(lesson.id + '/' + item.id);
      if (!itemState) continue;
      byTrack[lesson.track].goals++;
      if (itemState.due <= Date.now()) byTrack[lesson.track].due++;
    }
  }
  const savedPrefs = prefs();
  const today = records.filter(x => x.kind === 'review' && localDate(x.at) === localDate(Date.now())).length;
  const progress = Object.values(byTrack);
  const active = activeSession();
  const daily = records.find(x => x.id === 'daily-' + dayKey())?.data?.daily;
  return {
    daily, days: records.filter(x => x.kind === 'draft' && x.data?.daily?.completed).length,
    profile, lessons, studied, byTrack, prefs: savedPrefs, today, resume: !!active,
    goals: progress.reduce((count, x) => count + x.goals, 0),
    due: progress.reduce((count, x) => count + x.due, 0),
    next: contentKeys.map(key => lessons.find(l => l.track === key && !studied.has(l.id) && levelFor(l, savedPrefs))).filter(Boolean).slice(0, 3),
    results: records.filter(x => x.kind === 'result').sort((a, b) => b.at - a.at).slice(0, 50),
  };
}

function render(focus = true) {
  const [page = 'vandaag', key = '', tab = '', tabKey = ''] = route();
  const section = page || 'vandaag';
  const lessons = lessonList();
  const info = overview(lessons);
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
    case 'paideia':
    case 'talen':
      markup = contentKeys.includes(key) ? view.course(key, lessons, info.studied, info.prefs, routeFilter, courseFind, tab) : view.catalogue(section, lessons);
      break;
    case 'les': {
      const lesson = lessons.find(row => row.id === key);
      top = TRACKS[lesson?.track]?.section === 'language' ? 'talen' : 'paideia';
      markup = lesson ? view.lessonPage(lesson) : view.heading('Les openen') + '<p class="empty">Deze les is op dit moment niet beschikbaar.</p>';
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
        cases: findCases(expandedCases, doc.terms || doc.question), studies: panel.studies ?? [],
        error: panel.error, matches: panel.matches, tabKey, insertDraft: panel.insertDraft,
        comparison: panel.comparisonDrafts?.get(tabKey),
      } : {}, panel.witness);
      break;
    }
    case 'toetsen':
      markup = view.exams(info);
      break;
    case 'voortgang':
      markup = view.progressPage(info);
      break;
    case 'resultaat': {
      const outcome = records.find(x => x.kind === 'result' && x.id === key);
      top = outcome?.data.back === 'scriptorium/oefenen' ? 'scriptorium' :
        outcome?.data.mode === 'exam' ? 'toetsen' : outcome?.data.mode === 'placement' ? 'talen' : 'voortgang';
      markup = outcome ? view.resultPage(key, outcome.data) : view.heading('Resultaat') + '<p class="empty">Dit resultaat is nog niet op dit toestel beschikbaar.</p>';
      break;
    }
    case 'importeren':
      markup = view.importPage(importDraft, importPreview, contentKeys.includes(key) ? key : undefined);
      break;
    case 'meer':
      markup = view.settings({
        profile, cloud: cloudUser(), syncLabel: onlineLabel(), offlineReady,
        profileCount: store.loadProfiles().length, prefs: info.prefs,
      });
      break;
    default:
      top = 'vandaag';
      markup = view.home(info);
  }
  applyNavigation(top, ([...view.NAV, ...view.APP_NAV].find(n => n[0] === top)?.[1] ??
    ({ onderzoek: 'Onderzoek', voortgang: 'Voortgang', importeren: 'Eigen leerstof' })[top] ?? 'Athenaeum'));
  if (contentErrors.length && ['vandaag', 'talen', 'paideia'].includes(top)) {
    markup = '<p class="notice error">Een deel van de lessen kon niet laden. Open Athenaeum online om de lessen bij te werken.</p><br>' + markup;
  }
  displayMain(markup, { focus });
  if (section === 'onderzoek' && tab === 'debat' && tabKey && focus) {
    const study = [...main.querySelectorAll('.research-literature')].find(form => form.dataset.id === tabKey);
    study?.scrollIntoView({block:'start'});
  }
  if (document.querySelector('#course-search')) filterCourses();
}

async function setProfile(next) {
  profile = next;
  store.setCurrentProfile(next?.id ?? '');
  records = next ? await readRecords(next.id) : [];
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
    records = [...merged.values()];
    syncState = 'Cloud bijgewerkt';
    if (manual) message('Je voortgang is bijgewerkt.');
    const activeView = route()[0];
    if (!session && !dialog.open && !['importeren', 'sessie'].includes(activeView)) render(false);
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

function relevantPool(track, extraRoute = '') {
  const saved = prefs();
  const general = track && route()[0] === 'talen' && route()[1] === track && !route()[2];
  return makePool(lessonList().filter(lesson => (!track || lesson.track === track) &&
    (!general || !lesson.languageTopic) &&
    (!extraRoute || lesson.route === extraRoute) && (track || saved['quick-' + lesson.track] !== false) && levelFor(lesson, saved)));
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
        focus === 'ancient' ? ['greek','roman'].includes(lesson.track) : lesson.track === focus));
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
  await saveRows([record('draft','daily-' + date,{daily:advanceDay(plan,stage.id)},now())]);
  render();
}

function filterCourses() {
  const search = courseFind.toLocaleLowerCase('nl').normalize('NFD').replace(/\p{M}/gu,'').trim().split(/\s+/);
  let matches = 0;
  for (const unit of main.querySelectorAll('[data-unit-search]')) {
    const visible = search.every(word => unit.dataset.unitSearch.includes(word));
    unit.hidden = !visible;
    if (visible) matches++;
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
  const [first] = questions;
  const formal = mode === 'exam' || mode === 'placement';
  const lesson = formal ? null : lessonList().find(row => row.id === first.lesson);
  const started = mode === 'daily' && extra.daily.step !== 'guided';
  const guide = !started && lesson ? {
    topic: lesson.title === title ? '' : lesson.title,
    explanation: String(lesson.summary ?? '').split(/\n\s*\n/)[0],
    example: workedExample(lesson, first),
  } : undefined;
  session = {
    id: crypto.randomUUID(), mode, title, index: 0, response: '', answers: [], started, guide,
    questions: questions.map(q => {
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
  const filter = track === filteredTrack ? routeFilter : '';
  const pool = relevantPool(track, filter);
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
  const top = session.back === 'scriptorium/oefenen' ? 'scriptorium' :
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
    key: pair.key, question: q.id, lesson: q.lesson, rating: matchingRating(q, answer, i),
  }, now()));
  return [record('review', id, { key: q.key, question: q.id, lesson: q.lesson, rating: answer.rating }, now())];
}

function reviewTargets(q, answer) {
  if (!['again','help'].includes(answer?.rating)) return [];
  const targets = q.kind === 'match' ? q.pairs.filter((_, i) => matchingRating(q, answer, i) !== 'good') : [q];
  return targets.map(({ key, label }) => ({ key, label, lesson: q.lesson }));
}

async function practiceAgain(targets, excluded, back) {
  const keys = new Set(targets.map(row => row.key));
  const goals = makePool(lessonList().filter(lesson => targets.some(row => row.lesson === lesson.id)))
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

async function revealCard() {
  session.answers[session.index] = { response: (session.response ?? '').trim(), rating: null, hinted: Boolean(session.hints?.[session.index]) };
  await storeSession();
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
    if (!current.answers[index]) current.answers[index] = { response: '', rating: 'again' };
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
    await saveRows([
      ...(plan ? [record('draft','daily-' + date,{daily:advanceDay(plan,step,stats)},now())] : []),
      record('draft','draft-' + current.id,{finished:true},now()),
    ]);
    session = null;
    jump('dagles/' + date);
    message('Stap afgerond.');
    return;
  }
  const examReviews = current.mode === 'exam' ? current.questions.flatMap((q, index) => {
    const rating = current.answers[index].rating;
    return rating ? [record('review', 'review-' + id + '-' + index, { key: q.key, question: q.id, lesson: q.lesson, rating }, now())] : [];
  }) : [];
  await saveRows([
    ...examReviews,
    record('result', id, data, now()),
    record('draft', 'draft-' + current.id, { finished: true }, now()),
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
  await saveRows([record('result', id, { ...data, ...counts }, now()),
    record('review', 'review-' + id + '-' + index, { key: q.key, question: q.id, lesson: q.lesson, rating }, now())]);
  render(false);
}

async function setLevel(value) {
  const [track, level] = value.split('/');
  if (!LEVELS.includes(level) || TRACKS[track]?.section !== 'language') return;
  await requireProfile();
  await saveRows([record('prefs', 'pref-level-' + track, { name: track, value: level }, now())]);
  if (route().join('/') === 'talen/' + track) render(false);
  else jump('talen/' + track);
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
  'research-case': id => attachWitness(expandedCases.find(c => c.id === id)),
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
    const history = reviews();
    const available = relevantPool(track, routeFilter);
    const next = available.find(item => !history.lessons.has(item.lesson)) ?? available[0];
    const familiar = available.filter(item => history.lessons.has(item.lesson));
    const compact = length === '5';
    const pool = compact ? available.filter(item => item.lesson === next?.lesson) :
      familiar.length >= Number(length) ? familiar : available;
    const questions = drillQuestions(pool, history, {limit:Number(length),noAudio:!languageSupport(),compact});
    if (!questions.length) throw new Error('Er zijn hier nog geen passende vragen.');
    await startQuiz('lesson', 'Oefenreeks · ' + TRACKS[track].name, questions, {track, back:route().join('/')});
  },
  'lesson-more': async id => {
    const lesson = lessonList().find(row => row.id === id);
    if (!lesson) return;
    const questions = drillQuestions(makePool([lesson]), reviews(), {limit:20,noAudio:!languageSupport()});
    await startQuiz('lesson','Uitgebreid oefenen · ' + lesson.title,questions,{track:lesson.track,back:'les/' + id});
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
  'auth-mode': value => showAccount(value),
  'profiles': showProfiles,
  'choose-profile': chooseProfile,
  'level': setLevel,
  'use-level': setLevel,
  'route-filter': value => { routeFilter = value; render(false); },
  'lesson-quiz': async id => {
    const unit = lessonList().find(x => x.id === id);
    if (!unit) return;
    const questions = lessonQuestions(makePool([unit]), reviews(), { noAudio: !languageSupport() });
    if (!questions.length) throw new Error('Deze les heeft op dit toestel geen geschikte vragen.');
    await startQuiz('lesson', unit.title, questions, { track: unit.track, back: 'les/' + id });
  },
  'language-practice': async value => {
    const [id, skill] = value.split('/');
    const lesson = lessonList().find(row => row.id === id && row.languageTopic);
    if (!lesson || !Object.hasOwn(LANGUAGE_SKILLS, skill)) return;
    const questions = languageQuestions(makePool([lesson]), skill, reviews());
    await startQuiz('lesson', LANGUAGE_SKILLS[skill] + ' · ' + lesson.title, questions, { track: lesson.track, back: 'les/' + id });
  },
  'placement': async track => {
    const questions = placementQuestions(makePool(seed.filter(lesson => lesson.track === track && !lesson.languageTopic)));
    if (questions.length < 15) throw new Error('De instaptest kon nog niet worden geladen. Open de app online.');
    await startQuiz('placement', 'Instaptest ' + TRACKS[track].name, questions, { track, back: 'talen/' + track });
  },
  'exam-practice': async () => {
    const lessons = lessonList().filter(l => TRACKS[l.track].section === 'history');
    const history = reviews();
    const practiced = makePool(lessons).filter(item => history.states.has(item.key));
    const starter = makePool(lessons.slice(0, 1));
    const questions = drillQuestions(practiced.length >= 3 ? practiced : starter, history, { limit: 5, noAudio: true, compact: true });
    if (!questions.length) throw new Error('Open Athenaeum online om de voorbeeldvragen te laden.');
    if (dialog.open) dialog.close();
    await startQuiz('lesson', 'Oefentoets Paideia', questions, { back: 'toetsen' });
  },
  'exam': async type => {
    const monthly = type === 'month';
    const questions = examQuestions(makePool(lessonList().filter(l => TRACKS[l.track].section === 'history')), reviews(), monthly);
    if (!questions.length) {
      showDialog(dialogText('Begin met de oefentoets', 'Je kunt deze toets starten na ' + EXAM_GOALS[monthly ? 'month' : 'week'] +
        ' geoefende leerdoelen uit Paideia.', '<div class="row"><button class="button primary" data-action="exam-practice">Start oefentoets</button>' +
        '<button type="button" class="button quiet" data-action="close-dialog">Sluiten</button></div>'));
      return;
    }
    await startQuiz('exam', monthly ? 'Maandtoets' : 'Weekexamen', questions, { duration: monthly ? 75 : 45, back: 'toetsen' });
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
  'reveal': revealCard,
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
    await sync.signOut(leaving.id);
    sessionStorage.removeItem('athenaeum_unlocked_' + leaving.id);
    await setProfile(null);
    dialog.close();
    jump('vandaag');
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
  if (form.id === 'command-form') {
    event.preventDefault();
    const input = document.querySelector('#command');
    if (input.value.trim().toLowerCase() === '/leer' || !input.value.trim()) {
      input.value = '';
      run(() => quick());
    } else {
      message('Typ /leer om snel te oefenen.');
    }
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
          inlineMessage(form.querySelector('#auth-message'), 'Bevestig je e-mailadres via je inbox. Meld je daarna hier aan.');
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
});

let inputTimer;
let importTimer;
document.addEventListener('input', event => {
  const input = event.target;
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
    const command = document.querySelector('#command');
    command.value = '/';
    command.focus();
  }
});

window.addEventListener('beforeinstallprompt', event => { event.preventDefault(); installPrompt = event; });
window.addEventListener('appinstalled', () => { installPrompt = null; message('Athenaeum is geïnstalleerd.'); });
window.addEventListener('online', () => {
  updateConnection();
  scheduleSync(100);
  if (contentErrors.length) loadContent().then(() => {
    expandedCases = [...cases,...lessonSourceIndex(seed,cases)];
    if (!session) render(false);
  });
});
window.addEventListener('offline', updateConnection);
window.addEventListener('hashchange', () => {
  if (route()[0] !== 'sessie') session = null;
  render();
});
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') scheduleSync(100);
  else if (session) storeSession().catch(() => {});
});
setInterval(() => { if (document.visibilityState === 'visible') scheduleSync(100); }, 55_000);

async function loadContent() {
  const results = await Promise.allSettled(contentKeys.map(async key => {
    const url = new URL('./content/' + key + '.json?v=13r1', import.meta.url);
    const reply = await fetch(url, { signal: AbortSignal.timeout(12_000) });
    if (!reply.ok) throw new Error('Lesinhoud ontbreekt: ' + key);
    return reply.json();
  }));
  seed = [...languageLessons, ...results.flatMap(result => result.status === 'fulfilled' ? result.value : [])];
  contentErrors = results.filter(result => result.status === 'rejected');
}

async function boot() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
    if (navigator.serviceWorker.controller && 'caches' in window) {
      caches.match(new URL('./academy/content/greek.json?v=13r1', location.href)).then(hit => { offlineReady = !!hit; }).catch(() => {});
    }
  }
  const initialCases = fetch(new URL('./content/primary-cases.json?v=13r1',import.meta.url), {signal:AbortSignal.timeout(9000)})
    .then(reply => reply.ok ? reply.json() : []).then(items => { cases = Array.isArray(items) ? items : []; }).catch(() => {});
  await Promise.all([loadContent(),initialCases]);
  expandedCases = [...cases,...lessonSourceIndex(seed,cases)];
  const query = new URLSearchParams(location.search);
  const returningProfile = query.get('resume') === '1' || query.get('locked') === '1'
    ? store.loadProfiles().find(p => p.id === query.get('profile')) : null;
  const p = returningProfile || store.currentProfile();
  if (p && (!p.pin_hash || sessionStorage.getItem('athenaeum_unlocked_' + p.id)) && (!p.cloud_user_id || sync.status(p.id).signed_in)) {
    await setProfile(p);
  }
  render();
  const intent = query.get('open');
  if (query.get('learn') === '1') {
    const next = new URL(location.href);
    next.searchParams.delete('learn');
    history.replaceState(null, '', next.href);
    await quick();
  }
  else if (intent === 'paideia') jump('paideia');
  else if (intent === 'scriptorium' && !location.hash) jump('scriptorium');
  else if (!location.hash && query.get('page') === 'settings') jump('meer');
  else if (!location.hash && query.get('page') === 'apps') jump('scriptorium');
  if (p && !profile) showProfiles();
}

boot().catch(error => {
  displayMain(view.heading('Athenaeum openen') + '<p class="notice error">' + view.esc(error.message) +
    '</p><br><a class="button" href="./">Opnieuw openen</a>');
});
