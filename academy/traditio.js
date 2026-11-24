import { TRADITIONS, TRADITIO_LESSONS, TRADITIO_READING } from './content/traditio.js?v=14r3';
import { makePool, shuffled } from './learning.js?v=150';
import { esc, heading, icon, sourceView } from './views.js?v=150';

const paths = new Map(TRADITIONS.map(tradition => [tradition.id, tradition]));
const byTradition = new Map();
for (const lesson of TRADITIO_LESSONS) {
  if (!byTradition.has(lesson.tradition)) byTradition.set(lesson.tradition, []);
  byTradition.get(lesson.tradition).push(lesson);
}
const href = (...parts) => '#' + ['traditio', ...parts].map(encodeURIComponent).join('/');
const link = (url, label, cls = 'text-link') => `<a class="${cls}" href="${esc(url)}">${esc(label)}</a>`;
const action = (name, value, label, cls = 'quiet', attr = '') => `<button type="button" class="button ${cls}" data-action="${name}" data-value="${esc(value)}" ${attr}>${esc(label)}</button>`;
const count = (n, one, many) => `${n} ${n === 1 ? one : many}`;
const breadcrumb = (...items) => `<nav class="tr-crumb" aria-label="Kruimelpad">${items.join('<span aria-hidden="true"> / </span>')}</nav>`;
const homeLink = () => link(href(), 'Traditio');
const groupLink = group => link(href(group.id), group.name);
const storyLink = (story, label = story.title) => link(href(story.tradition, story.id), label);
const bibliography = refs => `<ul class="tr-sources">${refs.map(ref => `<li>${ref.type ? `<span class="tr-source-type">${esc(ref.type)}</span>` : ''}${sourceView(ref)}</li>`).join('')}</ul>`;
const lessonCount = list => count(list.length, 'les', 'lessen');
const passageLabel = source => [source.author, source.title, source.locator].filter(Boolean).join(' · ');
const storyFigures = lesson => [...new Set([...(lesson.figures || []), ...lesson.ties.flatMap(tie => [tie[0], tie[1]])])];

function progressState(lesson, info) {
  const labels = [];
  if (info.read.has(lesson.id)) labels.push('gelezen');
  if (info.studied.has(lesson.id)) labels.push('geoefend');
  return labels.join(' · ');
}

function card(group, info) {
  const list = byTradition.get(group.id) || [];
  if (!list.length) return '';
  const read = list.filter(lesson => info.read.has(lesson.id)).length;
  const practiced = list.filter(lesson => info.studied.has(lesson.id)).length;
  const progress = [lessonCount(list), read ? `${read} gelezen` : '', practiced ? `${practiced} geoefend` : ''].filter(Boolean).join(' · ');
  return `<a class="tr-card" href="${href(group.id)}"><span class="tr-card-corpus">${esc(group.corpus)}</span><h2>${esc(group.name)}</h2><p>${esc(group.intro)}</p><span class="tr-card-progress">${esc(progress)}</span></a>`;
}

function home(info) {
  return `<div class="tr-cover">${icon('traditio')}${heading('Traditio', 'Lees de verhalen, volg de personages en onderzoek hoe verschillende bronnen eenzelfde gebeurtenis vertellen.', 'Mythologie en religieuze overlevering')}</div>
    <div class="tr-cards">${TRADITIONS.map(group => card(group, info)).join('')}</div>
    <details class="panel tr-details"><summary>Universitaire leeslijsten en wetenschappelijke literatuur</summary>${bibliography(TRADITIO_READING)}</details>`;
}

function groupFigures(list) {
  return [...new Set(list.flatMap(storyFigures))].sort((a, b) => a.localeCompare(b, 'nl'));
}

function figureLink(group, name) {
  return link(href(group.id, 'figuur', name), name, 'tr-figure-link');
}

function figureIndex(group, list, active = '') {
  const names = groupFigures(list);
  if (!names.length) return '';
  return `<details class="panel tr-details"${active ? '' : ' open'}><summary>Figuren en hun relaties</summary><div class="tr-name-list">${names.map(name => name === active ? `<span aria-current="true">${esc(name)}</span>` : figureLink(group, name)).join('')}</div></details>`;
}

function figurePage(group, name, list) {
  const stories = list.filter(lesson => storyFigures(lesson).includes(name));
  if (!stories.length) return missing(group, 'Deze figuur komt in dit leerpad nog niet voor.');
  return `${breadcrumb(homeLink(), groupLink(group))}${heading(name, 'Volg een verbinding om de andere figuur te bekijken. De genoemde bron bepaalt welke relatie hier is weergegeven.', group.name)}
    <div class="tr-relations">${stories.map(story => {
      const ties = story.ties.filter(([a,b]) => a === name || b === name);
      const points = ties.map(([a,b,forward,reverse,sourceIndex = 0]) => {
        const other = a === name ? b : a;
        const relationship = a === name || reverse ? `${esc(a === name ? forward : reverse)} ${figureLink(group, other)}` : `${figureLink(group, a)} ${esc(forward)} ${esc(name)}`;
        const source = story.sources[sourceIndex] ?? story.sources[0];
        return `<li><span>${relationship}</span><small>${sourceView(source)}</small></li>`;
      }).join('');
      return `<section class="panel tr-relation"><h2>${storyLink(story)}</h2>${points ? `<ul>${points}</ul>` : `<p>Deze figuur komt in de vertelling voor.</p>${bibliography(story.sources)}`}</section>`;
    }).join('')}</div>${figureIndex(group, list, name)}`;
}

function cycleList(list) {
  const cycles = new Map();
  for (const story of list) {
    if (!cycles.has(story.cycle)) cycles.set(story.cycle, []);
    cycles.get(story.cycle).push(story);
  }
  return cycles;
}

function pathList(stories, info, active) {
  return `<ol class="tr-path">${stories.map(story => {
    const status = progressState(story, info);
    return `<li${story.id === active ? ' aria-current="page"' : ''}>${storyLink(story)}${status ? `<span>${esc(status)}</span>` : ''}</li>`;
  }).join('')}</ol>`;
}

const contextLinks = {
  egypte: [['Atlas · Alexandrië', 'paideia/atlas/alles/alexandrie']],
  griekenland: [['Oudgrieks', 'talen/grc']],
  rome: [['Latijn', 'talen/la']],
  islam: [['Atlas · Bagdad', 'paideia/atlas/alles/bagdad']],
};
function relatedLinks(group) {
  return [...(group.links || []), ...(contextLinks[group.id] || []), ['Scriptorium', 'scriptorium']]
    .map(([label, route]) => link('#' + route, label, 'button quiet')).join('');
}

function groupPage(group, list, info) {
  const cycles = cycleList(list);
  const studied = list.filter(lesson => info.studied.has(lesson.id)).length;
  const read = list.filter(lesson => info.read.has(lesson.id)).length;
  const label = `${lessonCount(list)} · ${read} gelezen · ${studied} geoefend`;
  return `${breadcrumb(homeLink())}${heading(group.name, group.context, group.corpus)}<p class="tr-progress">${esc(label)}</p>
    <h2 class="tr-section-title">Verhaallijnen</h2><p class="muted">De volgorde volgt het verhaal in de vermelde bronnen.</p>
    <div class="tr-cycle-grid">${[...cycles.entries()].map(([title, stories]) => `<section class="panel tr-cycle"><h3>${esc(title)}</h3>${pathList(stories, info)}</section>`).join('')}</div>
    ${figureIndex(group, list)}<section class="panel tr-details"><h2>Examen</h2><p>Beantwoord vragen over de verhalen en onderbouw een eigen interpretatie met de opgegeven passages. Open antwoorden kun je na het indienen aan de uitwerking toetsen.</p>${action('traditio-exam', group.id, 'Start examen', 'primary')}</section>
    <nav class="tr-related" aria-label="Historische en taalkundige context">${relatedLinks(group)}</nav>`;
}

function storyPage(group, story, list, info) {
  const cycle = list.filter(lesson => lesson.cycle === story.cycle);
  const i = cycle.indexOf(story);
  const names = storyFigures(story);
  const read = info.read.has(story.id);
  return `${breadcrumb(homeLink(), groupLink(group))}${heading(story.title, '', story.cycle)}
    <article class="panel tr-story"><h2>Situering</h2><p>${esc(story.summary)}</p>${story.stages.map(([label, paragraph]) => `${label ? `<h2>${esc(label)}</h2>` : ''}<p>${esc(paragraph)}</p>`).join('')}<div class="tr-interpretation"><h2>Bronnenkritiek en interpretatie</h2><p>${esc(story.reading)}</p></div></article>
    <section class="panel tr-details"><h2>Bronnen en overlevering</h2>${bibliography(story.sources)}</section>
    ${names.length ? `<section class="panel tr-details"><h2>Figuren in dit verhaal</h2><div class="tr-name-list">${names.map(name => figureLink(group, name)).join('')}</div></section>` : ''}
    <section class="panel tr-details"><h2>Verwerk het verhaal</h2><div class="row">${action('history-read', story.id, read ? 'Gelezen' : 'Markeer als gelezen', 'quiet', `aria-pressed="${read}"`)}${action('lesson-quiz', story.id, 'Oefen deze les', 'primary')}</div></section>
    ${cycle.length > 1 ? `<section class="panel tr-details"><h2>${esc(story.cycle)}</h2>${pathList(cycle, info, story.id)}<nav class="row" aria-label="Volg de verhaallijn">${i > 0 ? link(href(group.id, cycle[i-1].id), 'Vorige les', 'button quiet') : ''}${i + 1 < cycle.length ? link(href(group.id, cycle[i+1].id), 'Volgende les', 'button') : groupLink(group)}</nav></section>` : ''}
    <nav class="tr-related" aria-label="Verder studeren">${relatedLinks(group)}</nav>`;
}

function missing(group, message) {
  return `<section class="panel tr-details"><h1>${esc(message)}</h1>${group ? groupLink(group) : homeLink()}</section>`;
}

export function traditioPage(key = '', tab = '', detail = '', info = {}) {
  const state = { read: info.read ?? new Set(), studied: info.studied ?? new Set() };
  const group = paths.get(key);
  const list = byTradition.get(key) || [];
  let body;
  if (!key || key === 'traditio') body = home(state);
  else if (!group || !list.length) body = missing(null, 'Dit leerpad is niet beschikbaar.');
  else if (!tab) body = groupPage(group, list, state);
  else if (tab === 'figuur') body = figurePage(group, detail, list);
  else {
    const story = list.find(lesson => lesson.id === tab);
    body = story ? storyPage(group, story, list, state) : missing(group, 'Dit verhaal is niet beschikbaar.');
  }
  return `<div class="traditio">${body}</div>`;
}

export function traditioExamQuestions(group) {
  const lessons = shuffled(byTradition.get(group) || []);
  const questions = [];
  for (const [index, lesson] of lessons.entries()) {
    const pool = makePool([lesson]).flatMap(item => item.questions);
    const choice = pool.filter(q => q.kind !== 'open');
    const analysis = pool.filter(q => q.kind === 'open');
    if (choice.length) questions.push(shuffled(choice)[0]);
    if (analysis.length && (index % 2 === 0 || lessons.length === 1)) questions.push(shuffled(analysis)[0]);
  }
  return questions;
}
