import { esc, sectionHeading, sourceView } from './views.js?v=13r11';
import { MATERIAL_TYPES, COMPARISON_RELATIONS, evidenceList, MAX_EXCERPT, MAX_COMPARISON_ROWS } from './research-data.js?v=13r1';

import { fetchJson } from './fetch-json.js?v=13r11';

export const RESEARCH_TABS = {
  vraag:'Probleemstelling', invoegen:'Invoegen', vinden:'Bronnen zoeken', bron:'Bronanalyse',
  debat:'Historiografie', vergelijk:'Bronnen vergelijken', besluit:'Synthese',
};
const STATUS = { tocheck:'Te controleren', record:'Bibliografische gegevens', read:'Passage gelezen' };
const RELATIONS = { open:'Nog te bepalen', supports:'Ondersteunt', nuance:'Nuanceert', disputes:'Spreekt tegen', parallel:'Vergelijkingsmateriaal' };

function researchLink(url, label, css = '') {
  if (!url) return '';
  try {
    const target = new URL(url);
    if (target.protocol !== 'https:' && target.protocol !== 'http:') return '';
    return `<a class="${css || 'text-link'}" href="${esc(target.href)}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>`;
  } catch {
    return '';
  }
}

function key(value = '') {
  return String(value).toLocaleLowerCase('nl').normalize('NFD').replace(/\p{M}/gu,'');
}

const NOISE = new Set(['de','het','een','en','of','van','in','tot','voor','door','over','hoe','wat','welke','was','naar','uit','met','der','des','zijn','werd','bij','the','and','from','with','zit','waar','worden']);
const RELATED = [
  ['dieren','venationes','beasts','animal','spectakel','spelen','arena','amfitheater','beren','leeuwen','panters'],
  ['aanvoer','logistiek','transport','import','bevoorrading','handel','supply','shipping'],
  ['financiering','finance','euergetisme','uitgaven','gaven','benefaction','geld','kosten'],
  ['steden','stad','polis','city','cities','stedelijk'],
  ['overheid','bestuur','gouverneur','gezag','keizer','administratie','institution','provincies'],
];
function tokens(text) {
  return [...new Set(key(text).split(/[^\p{L}\p{N}]+/u).filter(word => word.length >= 3 && !NOISE.has(word)))];
}

const OLD_AUTHORS = /^(?:ammianus|andocides|apollodoros|appianus|aristoteles|arrianus|augustus|aulus gellius|cassius dio|cato|cicero|demosthenes|dio cassius|diodorus|dionysius|eusebius|frontinus|gaius|hadrianus|herodotos|horatius|iosephus|josephus|livius|macrobius|ovid|pausanias|plato|plinius|plutarchus|polybius|polybios|procopius|quintilianus|sallustius|seneca|sofokles|strabo|suetonius|symmachus|tacitus|thucydides|titus livius|traianus|trajanus|varro|vergilius|vitruvius|xenophon)/i;
const RECORD_LOCATOR = /^(?:SEG |IG [IVXLCDM]|IC [IVXLCDM]|CIL |AE [12]|IRT |ILS |OGIS |IPriene |IDR |P\.[A-Za-z]|Tab\.?\s*Vindol|EA ?\d|RIB |Nomima |RRC |RIC )/i;

export function lessonSourceIndex(lessons, cases) {
  const seen = new Set();
  const known = cases.map(c => key(c.locator));
  const entries = [];
  for (const lesson of lessons) {
    if (!['greek','roman'].includes(lesson.track)) continue;
    for (const [index,source] of (lesson.sources ?? []).entries()) {
      const { author,title,locator,url } = source;
      if (!author || !title || !locator || !(OLD_AUTHORS.test(author) || RECORD_LOCATOR.test(locator))) continue;
      const id = key(author + '|' + title + '|' + locator);
      if (seen.has(id) || known.includes(key(locator))) continue;
      seen.add(id);
      const labels = lesson.items.filter(item => (item.source ?? 0) === index).map(item => item.label);
      const studies = (lesson.sources ?? []).filter((s,i) => i !== index && s.year && !OLD_AUTHORS.test(s.author ?? '') && !RECORD_LOCATOR.test(s.locator ?? '')).slice(0,2);
      entries.push({
        id:'leerbron-' + lesson.id + '-' + index, title, author, locator, url,
        period:lesson.period, place:'', type:'Bronverwijzing uit de lessen',
        tags:[lesson.title,...labels,lesson.track === 'greek' ? 'Grieks' : 'Romeins'],
        context:'Deze verwijzing hoort bij de les ‘' + lesson.title + '’' + (labels.length ? ', bij ' + labels.join(', ') : '') + '.',
        limits:'Controleer in de editie de tekst, brondatering en reikwijdte voor jouw probleemstelling.',
        studies,
      });
    }
  }
  return entries;
}

export function findCases(cases, query) {
  const words = tokens(query);
  if (!words.length) return cases.slice(0,12);
  const similar = RELATED.filter(terms => terms.some(term => words.includes(term))).flat();
  return cases.map(c => {
    const top = key([c.title,c.author,c.locator,c.place,...c.tags].join(' '));
    const body = key(c.context + ' ' + c.limits);
    let relevance = words.reduce((n,w) => n + (top.includes(w) ? 6 : body.includes(w) ? 2 : 0),0);
    if (relevance && c.type !== 'Bronverwijzing uit de lessen') relevance += 3;
    if (similar.some(term => top.includes(term))) relevance += 2;
    return { c, relevance };
  }).filter(x => x.relevance > 0).sort((a,b) => b.relevance - a.relevance).slice(0,12).map(x => x.c);
}

export function passageMatches(source, query) {
  const words = tokens(query);
  if (!words.length) return [];
  return String(source.passage || '').split('\n').flatMap((text,i) => words.some(w => key(text).includes(w)) && text.trim()
    ? [{line:i+1,text:text.trim().slice(0,540)}] : []).slice(0,10);
}

export async function findStudies(query) {
  const api = new URL('https://api.crossref.org/works');
  api.search = new URLSearchParams({
    'query.bibliographic': query,
    rows:'12',
    select:'title,author,issued,container-title,DOI,URL,type,page',
  });
  const data = await fetchJson(api, { headers: { Accept: 'application/json' } }).catch(() => {
    throw new Error('Crossref is tijdelijk onbereikbaar. Je dossier blijft bewaard.');
  });
  return (data.message?.items ?? []).filter(item => item.title?.[0] && item.DOI).map(item => ({
    id:item.DOI,
    author:(item.author ?? []).slice(0,6).map(a => a.family ? [a.given,a.family].filter(Boolean).join(' ') : a.name).filter(Boolean).join(', '),
    title:item.title[0], year:String(item.issued?.['date-parts']?.[0]?.[0] ?? ''),
    locator:item.page ? 'pp. ' + item.page : '', outlet:item['container-title']?.[0] ?? '',
    doi:item.DOI, url:'https://doi.org/' + item.DOI, status:'record',
  }));
}

export function caseWitness(c, id) {
  return {
    id, caseId:c.id, title:c.title, author:c.author, locator:c.locator, place:c.place, period:c.period, type:c.type, url:c.url,
    passage:c.passage || '', passageKind:c.passage ? 'Eigen Nederlandse werkvertaling bij de bronfiche' : '',
    observation:'', context:c.context || '', limits:c.limits || '', questionLink:'', status:c.passage ? 'tocheck' : 'record',
  };
}

function field(name, title, value, opt = {}) {
  const id = 'research-' + name + (opt.suffix ? '-' + opt.suffix : '');
  const required = opt.required ? ' required' : '';
  return `<div class="field"><label for="${id}">${esc(title)}</label>
    ${opt.rows ? '<textarea id="' + id + '" name="' + name + '" rows="' + opt.rows + '" maxlength="' + (opt.max || 6000) + '"' + required + '>' + esc(value) + '</textarea>' :
      '<input id="' + id + '" name="' + name + '" value="' + esc(value) + '" maxlength="' + (opt.max || 350) + '"' + required + '>'}
    ${opt.help ? '<small class="muted">' + esc(opt.help) + '</small>' : ''}
  </div>`;
}

function selector(name, title, options, value, id = 'research-' + name) {
  return `<div class="field"><label for="${id}">${esc(title)}</label><select id="${id}" name="${name}">
    ${Object.entries(options).map(([key,label]) => '<option value="' + esc(key) + '"' + (value === key ? ' selected' : '') + '>' + esc(label) + '</option>').join('')}
  </select></div>`;
}
function btn(action, label, value = '', css = 'quiet') {
  return `<button type="button" class="button ${css}" data-action="${action}" data-value="${esc(value)}">${esc(label)}</button>`;
}
function nextButton(label) {
  return `<button type="submit" class="button primary">${label}</button>`;
}

function sourceMatches(dossier, results) {
  return `<section class="panel stack">
    <h2>Zoek vanuit je vraag</h2>
    <p class="muted">Zoek in bronfiches en bronverwijzingen uit de lessen met een auteur, corpusnummer of korte zoektermen. Probeer voor literatuur ook trefwoorden in het Engels, Frans, Duits of Italiaans.</p>
    <form id="research-search" class="stack">
      ${field('terms','Zoektermen',dossier.terms || '',{max:220})}
      <div class="row"><button class="button primary" name="method" value="catalogue" type="submit">Zoek in de broncatalogus</button>
        <button class="button quiet" name="method" value="crossref" type="submit">Zoek literatuur in Crossref</button></div>
    </form>
    <div class="row"><a class="button quiet" href="#scriptorium/ontdekken">Zoeken in Scriptorium</a>
      ${btn('research-copy','Kopieer zoekvraag')}</div>
    <p class="small-text muted">Een Crossref-zoekopdracht stuurt de ingevulde zoektermen naar Crossref en geeft je bibliografische records.</p>
  </section>
  <section class="block stack">
    <h2>Primaire bronnen</h2>
    <div class="unit-list">${results.cases.length ? results.cases.map(c => `<article class="panel stack">
      <div><h3>${esc(c.title)}</h3><p class="small-text muted">${esc([c.author,c.locator,c.period,c.type,c.place].filter(Boolean).join(' · '))}</p></div>
      <p>${esc(c.context)}</p><div class="row">
      ${btn('research-case','Voeg toe aan mijn dossier',c.id,'primary')}${researchLink(c.url,'Open de broneditie')}
      </div></article>`).join('') : '<p class="empty">Geen bronfiches bij deze zoektermen in de catalogus. Zoek breder of open de Research Hub.</p>'}</div>
    <div>${btn('research-own','Voeg een eigen bron toe', '', 'primary')}</div>
  </section>
  ${results.error ? '<p class="notice error">' + esc(results.error) + '</p>' : ''}
  ${results.studies.length ? `<section class="block stack">
    <h2>Literatuur gevonden in Crossref</h2>
    <p class="muted">Controleer relevantie en vindplaats in de publicatie. De lijst toont gegevens van de uitgever.</p>
    ${results.studies.map(study => `<article class="panel stack"><h3>${esc(study.title)}</h3>
      <p class="small-text muted">${esc([study.author,study.year,study.outlet,study.locator].filter(Boolean).join(' · '))}</p>
      <div class="row">${btn('research-study','Bewaar literatuur',study.id)}${researchLink(study.url,'Open publicatie')}</div></article>`).join('')}
  </section>` : ''}`;
}

function analyze(dossier, witness, matches) {
  if (!witness) return `<section class="panel stack"><h2>Voeg een bron toe</h2><p>Open de catalogus of vul zelf een tekst, inscriptie, munt of ander bronobject in.</p>
    <div class="row"><a class="button primary" href="#onderzoek/${dossier.id}/vinden">Naar Bronnen zoeken</a>${btn('research-own','Voeg een eigen bron toe')}</div></section>`;
  return `<div class="stack">
    <div class="row" aria-label="Bronnen in het dossier">
      ${dossier.sources.map(c => btn('research-select',c.locator || c.title || 'Eigen bron',c.id,c.id === witness.id ? 'primary':'quiet')).join('')}
      ${btn('research-own','Nieuwe bron')}
    </div>
    <form id="research-source" class="panel stack">
      <h2>Leg de vindplaats en tekst vast</h2>
      <div class="columns">
        ${field('title','Titel of bronobject',witness.title)}
        ${field('author','Auteur of instantie',witness.author)}
        ${field('locator','Pagina, canonieke passage of corpusnummer',witness.locator)}
        ${field('type','Bronsoort',witness.type)}
        ${field('period','Datering',witness.period)}
        ${field('place','Plaats of geografisch bereik',witness.place)}
        ${field('url','Link naar de uitgave of catalogus',witness.url)}
        ${selector('status','Controle van de bron',STATUS,witness.status)}
      </div>
      ${researchLink(witness.url,'Open de genoteerde broneditie')}
      ${field('passage','Primaire passage of eigen transcriptie',witness.passage,{rows:7,max:18000,help:witness.passageKind || 'Geef aan of je werkt met origineel, editie, vertaling of eigen transcriptie.'})}
      <div class="field"><label for="research-pdf">Leesbare PDF toevoegen aan deze fiche</label><input type="file" accept=".pdf,application/pdf" id="research-pdf">
        <small class="muted">Leest één gekozen PDF-pagina. Noteer waar mogelijk ook het gedrukte paginanummer in je bronverwijzing.</small></div>
      <div class="field"><label for="research-pdf-page">Eerste PDF-pagina</label><input type="number" id="research-pdf-page" min="1" value="1"></div>
      <div class="row">${btn('research-matches','Lokaliseer zoektermen in de passage')}</div>
      ${matches ? '<div class="notice"><strong>Treffers in jouw tekst</strong>' + (matches.length
        ? '<ul>' + matches.map(m => '<li>Regel ' + m.line + ' van de ingevoerde tekst · ' + esc(m.text) + '</li>').join('') + '</ul>'
        : '<p>Geen regels met deze zoektermen gevonden. Controleer ook formuleringen in de brontaal.</p>') + '</div>' : ''}
      <details><summary>Vragen bij de bronkritiek</summary><ul>
        <li>Wie spreekt, voor wie en met welk doel? Wiens stem ontbreekt?</li>
        <li>Wat is waargenomen, voorgeschreven, gevraagd of achteraf verteld? Welke formulering draagt dat onderscheid?</li>
        <li>Wat verandert als je de vindplaats, editie, datering of betekenis van een sleutelwoord anders leest?</li>
        <li>Welke andere bron kan hetzelfde punt onafhankelijk toetsen?</li>
      </ul></details>
      ${field('observation','Wat staat er expliciet?',witness.observation,{rows:4,help:'Noteer de waarneming apart. Verwijs naar een zin, regel, pagina of paragraaf.'})}
      ${field('context','Context, publiek en genre',witness.context,{rows:4})}
      ${field('limits','Bewijskracht, beperkingen en alternatieve lezingen',witness.limits,{rows:4})}
      ${field('questionLink','Wat draagt deze bron bij aan je probleemstelling?',witness.questionLink,{rows:4,help:'Formuleer je gevolgtrekking en welk deel van de vraag ermee openblijft.'})}
      <div>${nextButton('Bewaar bronanalyse')}</div>
    </form>
  </div>`;
}

function debate(dossier) {
  return `<section class="panel stack"><h2>Leg het historiografisch debat vast</h2>
    <p class="muted">Noteer per auteur de stelling én het bewijs waarop die steunt. Koppel het werk aan een primaire bron in je dossier.</p>
    <div class="row">${btn('research-new-study','Voeg zelf literatuur toe','','primary')}
      <a class="button quiet" href="#onderzoek/${dossier.id}/vinden">Zoek een publicatie</a></div>
  </section>
  ${!dossier.studies.length ? '<p class="empty">Voeg een studie toe om de vergelijking te beginnen.</p>' : ''}
  ${dossier.studies.map(l => `<form class="panel stack research-literature" data-id="${esc(l.id)}">
    <h3>${esc(l.title || 'Nieuwe publicatie')}</h3>
    <div class="columns">
      ${field('author','Auteur',l.author).replaceAll('research-author','author-' + l.id)}
      ${field('title','Titel',l.title).replaceAll('research-title','title-' + l.id)}
      ${field('year','Jaar',l.year).replaceAll('research-year','year-' + l.id)}
      ${field('locator','Gelezen of relevante pagina’s',l.locator).replaceAll('research-locator','locator-' + l.id)}
      ${field('url','DOI-link of stabiele URL',l.url).replaceAll('research-url','url-' + l.id)}
      ${selector('status','Leesstatus',STATUS,l.status).replaceAll('research-status','status-' + l.id)}
      ${selector('relation','Relatie met je lezing',RELATIONS,l.relation).replaceAll('research-relation','relation-' + l.id)}
      ${selector('witness','Primaire bron',{'':'Nog niet gekoppeld',...Object.fromEntries(dossier.sources.map(w => [w.id,w.locator || w.title || 'Eigen bron']))},l.witness).replaceAll('research-witness','witness-' + l.id)}
    </div>
    ${researchLink(l.url,'Open de publicatie')}
    ${l.note ? '<p class="notice small-text">' + esc(l.note) + '</p>' : ''}
    ${l.analysisNote ? `<div class="notice stack"><h4>AI-notitie uit Scriptorium</h4><p>${esc(l.analysisNote)}</p>
      <p class="small-text muted">${esc([l.author, l.analysisPage ? 'PDF-pagina ' + l.analysisPage : '', 'Controleer de formulering in de publicatie'].filter(Boolean).join(' · '))}</p></div>` : ''}
    ${l.origin?.startsWith('scriptorium:') ? '<div><a class="text-link" href="#scriptorium/corpus">Bekijk je Scriptorium-corpus</a></div>' : ''}
    <details ${l.fragment ? 'open' : ''}><summary>Passage uit de publicatie</summary>
      ${field('fragment','Fragment met vindplaats',l.fragment,{rows:4,max:MAX_EXCERPT,suffix:esc(l.id),help:[l.file,l.location].filter(Boolean).join(' · ')})}
    </details>
    ${field('argument','Wat stelt de auteur?',l.argument,{rows:3}).replaceAll('research-argument','argument-' + l.id)}
    ${field('basis','Welke passage of vergelijkingsbasis draagt het argument?',l.basis,{rows:3}).replaceAll('research-basis','basis-' + l.id)}
    <div>${nextButton('Bewaar deze studie')}</div>
  </form>`).join('')}`;
}

function insertMaterial(dossier, draft = {}) {
  const imported = evidenceList(dossier).filter(item => item.imported);
  return `<div class="stack">
    <form id="research-insert" class="panel stack">
      <h2>Bestaand materiaal invoegen</h2>
      <p class="muted">Voeg een eigen tekst, een primaire passage of een publicatie toe. Vul de auteur en de gedrukte pagina of het bronnummer in zodra je die kent.</p>
      <div class="columns">
        ${selector('kind','Soort materiaal',{'note':MATERIAL_TYPES.note,'source':MATERIAL_TYPES.source,'study':MATERIAL_TYPES.study},draft.kind)}
        ${field('title','Titel',draft.title,{help:'Bij een leeg veld krijgt de fiche de bestandsnaam.'})}
        ${field('author','Auteur of instantie',draft.author)}
        ${field('locator','Gedrukte pagina, passage of bronnummer',draft.locator)}
        ${field('year','Jaar',draft.year,{max:80})}
        ${field('url','Link naar bron of uitgave',draft.url,{max:1500})}
      </div>
      ${field('text','Plak je tekst of fragment',draft.text,{rows:6,max:MAX_EXCERPT})}
      <div class="field"><label for="research-local-file">Of kies een bestand</label>
        <input type="file" id="research-local-file" name="file" accept=".pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document">
        <small class="muted">Leesbare PDF, Word (.docx), TXT of Markdown. De app bewaart de uitgelezen tekst op dit toestel.</small></div>
      <div class="columns" id="research-pdf-range" hidden>
        <div class="field"><label for="research-start-page">Eerste PDF-pagina</label><input id="research-start-page" type="number" name="startPage" min="1" value="${esc(draft.startPage ?? 1)}" disabled></div>
        <div class="field"><label for="research-end-page">Laatste PDF-pagina</label><input id="research-end-page" type="number" name="endPage" min="1" value="${esc(draft.endPage)}" placeholder="Alleen de eerste pagina" disabled></div>
      </div>
      <p class="notice" id="research-insert-message" role="status" hidden></p>
      <div>${nextButton('Materiaal toevoegen')}</div>
    </form>
    <section class="panel stack"><h2>Uit Scriptorium</h2>
      <p class="muted">Open een werk in je corpus en kies Naar onderzoeksdossier. Athenaeum neemt de publicatiegegevens over.</p>
      <div><a class="button quiet" href="#scriptorium/corpus">Open Scriptorium-corpus</a></div>
    </section>
    ${imported.length || dossier.notes?.length ? `<section class="panel stack"><h2>Ingevoerd materiaal</h2>
      ${imported.map(item => `<article class="research-entry stack"><div><h3>${esc(item.title)}</h3>
        <p class="small-text muted">${esc([MATERIAL_TYPES[item.kind],item.author,item.locator,item.location].filter(Boolean).join(' · '))}</p></div>
        <div>${item.kind === 'source' ? btn('research-view-witness','Open in Bronanalyse',item.id) :
          `<a class="text-link" href="#onderzoek/${esc(dossier.id)}/debat/${esc(item.id)}">Open in Historiografie</a>`}</div></article>`).join('')}
      ${(dossier.notes ?? []).map(note => `<details class="research-entry"><summary>${esc(note.title)}</summary>
        <form class="research-note-form stack" data-id="${esc(note.id)}">
          <p class="small-text muted">${esc(['Eigen tekst of notities',note.file,note.location].filter(Boolean).join(' · '))}</p>
          ${field('title','Titel',note.title,{required:true,suffix:esc(note.id)})}
          <div class="columns">${field('author','Auteur',note.author,{suffix:esc(note.id)})}${field('locator','Gedrukte pagina of vindplaats',note.locator,{suffix:esc(note.id)})}</div>
          ${field('text','Eigen tekst',note.text,{rows:5,max:MAX_EXCERPT,required:true,suffix:esc(note.id)})}
          <div>${nextButton('Bewaar eigen tekst')}</div>
        </form></details>`).join('')}
      <div><a class="button quiet" href="#onderzoek/${esc(dossier.id)}/vergelijk">Naar Bronnen vergelijken</a></div>
    </section>` : ''}
  </div>`;
}

export function evidencePreview(item) {
  if (!item) return '';
  const known = item.locator || 'Vindplaats nog invullen';
  const note = item.kind === 'source' ? item.observation : item.argument;
  return `<p class="small-text muted">${esc([item.author || 'Auteur nog invullen',known,STATUS[item.status] ?? STATUS.tocheck].join(' · '))}</p>
    ${item.text || note ? `<details><summary>Bekijk opgeslagen passage en kanttekening</summary>
      ${item.text ? '<pre class="research-excerpt">' + esc(item.text) + '</pre>' : ''}
      ${note ? '<p class="notice small-text">' + esc(note) + '</p>' : ''}</details>` : ''}`;
}

function comparisonPage(dossier, selection, draft) {
  const evidence = evidenceList(dossier);
  const saved = dossier.comparisons ?? [];
  const route = '#onderzoek/' + esc(dossier.id) + '/vergelijk';
  const board = draft ?? saved.find(x => x.id === selection) ?? (selection ? null : saved[0]);
  const claim = board?.claim ?? (dossier.question?.length <= 400 ? dossier.question : '');
  const rows = board?.rows ?? [{},{}];
  const options = {'':'Kies een bron in dit dossier', ...Object.fromEntries(evidence.map(item => [item.ref, MATERIAL_TYPES[item.kind] + ' · ' + item.citation]))};
  return `<div class="stack">
    <section class="panel stack"><h2>Bronnen rond één bewering</h2>
      <p class="muted">Kies primaire bronnen en studies bij dezelfde deelvraag. Noteer per rij wat een concrete passage aantoont en hoe sterk het verband is.</p>
      ${saved.length ? `<div class="row">${saved.map(x => `<a class="button small quiet" href="${route}/${esc(x.id)}" ${board?.id === x.id ? 'aria-current="page"' : ''}>${esc(x.claim)}</a>`).join('')}
        <a class="button small quiet" href="${route}/nieuw">Nieuwe vergelijking</a></div>` : ''}
      ${evidence.length < 2 ? `<p class="notice">Voeg minstens twee bronnen of studies toe aan dit dossier.</p>
        <div class="row"><a class="button primary" href="#onderzoek/${esc(dossier.id)}/invoegen">Materiaal invoegen</a><a class="button quiet" href="#onderzoek/${esc(dossier.id)}/vinden">Bronnen zoeken</a></div>` : ''}
    </section>
    ${evidence.length >= 2 ? `<form id="research-comparison" class="panel stack" data-id="${esc(board?.id || '')}">
      ${field('claim','Bewering of deelvraag die je toetst',claim,{required:true,max:400})}
      <div class="research-evidence-grid">
        ${rows.map((row, i) => `<fieldset class="research-evidence stack"><legend>Bron ${i + 1}</legend>
          ${selector('ref','Bron of publicatie',options,row.ref,'research-compare-ref-' + i)}
          <div class="stack" data-evidence-preview="${i}">${evidencePreview(evidence.find(x => x.ref === row.ref))}</div>
          ${field('locator','Exacte vindplaats bij deze bewering',row.locator,{suffix:i + 1})}
          ${selector('relation','Relatie met de bewering',COMPARISON_RELATIONS,row.relation,'research-compare-relation-' + i)}
          ${field('observation','Wat staat er in de bron?',row.observation,{rows:3,suffix:i + 1})}
          ${field('limits','Context, bewijskracht en beperkingen',row.limits,{rows:3,suffix:i + 1})}
          ${rows.length > 2 ? `<div><button class="button small quiet" name="intent" value="remove-${i}" type="submit" formnovalidate>Verwijder rij ${i + 1}</button></div>` : ''}
        </fieldset>`).join('')}
      </div>
      ${rows.length < Math.min(MAX_COMPARISON_ROWS,evidence.length) ? '<div><button class="button quiet" name="intent" value="add" type="submit" formnovalidate>Voeg nog een bron toe</button></div>' : ''}
      ${field('discussion','Overeenkomsten, tegenspraak en onafhankelijkheid',board?.discussion,{rows:4,help:'Gebruiken auteurs hetzelfde bewijs? Verklaren genre, datering of vindplaats het verschil?'})}
      ${field('conclusion','Wat kun je op basis hiervan concluderen?',board?.conclusion,{rows:4})}
      ${field('nextCheck','Welke aanvullende controle is nodig?',board?.nextCheck,{rows:3})}
      <p class="notice" id="research-comparison-message" role="status" hidden></p>
      <div class="row">${nextButton('Bewaar vergelijking')}<a class="button quiet" href="#onderzoek/${esc(dossier.id)}/besluit">Naar Synthese</a></div>
    </form>` : ''}
  </div>`;
}

function synthesis(dossier) {
  const comparisonPath = '#onderzoek/' + esc(dossier.id) + '/vergelijk';
  return `<section class="panel stack"><h2>Van bron naar onderbouwd antwoord</h2>
    <p class="muted">Vergelijk je eigen observaties met het bewijs dat de auteurs gebruiken.</p>
    <div class="comparison-list">
    ${dossier.sources.length ? dossier.sources.map(w => {
      const links = dossier.studies.filter(study => study.witness === w.id);
      return `<article class="notice stack"><h3>${esc(w.locator || w.title || 'Eigen bron')} · ${STATUS[w.status] ?? STATUS.tocheck}</h3>
        <p>${esc(w.observation || w.questionLink || 'Voeg een waarneming met vindplaats toe.')}</p>
        ${links.map(study => '<p class="small-text"><strong>' + esc([study.author,study.year,study.locator].filter(Boolean).join(' · ') || study.title) + '</strong> · ' + esc(RELATIONS[study.relation] ?? RELATIONS.open) + ' · ' + esc(STATUS[study.status] ?? STATUS.tocheck) + (study.argument ? ' · ' + esc(study.argument) : '') + '</p>').join('')}
      </article>`;
    }).join('') : '<p>Voeg minstens één bron met een concrete vindplaats toe.</p>'}
    </div>
  </section>
  ${(dossier.comparisons ?? []).length ? `<section class="panel stack"><h2>Bewaarde vergelijkingen</h2>
    ${dossier.comparisons.map(board => `<article class="research-entry stack"><h3>${esc(board.claim)}</h3>
      <p>${esc(board.conclusion || board.discussion || '')}</p><a class="text-link" href="${comparisonPath}/${esc(board.id)}">Open vergelijking (${board.rows.length} bronnen)</a></article>`).join('')}
    </section>` : ''}
  <form class="panel stack" id="research-synthesis">
    ${field('claim','Voorlopig antwoord op je probleemstelling',dossier.claim,{rows:5})}
    ${field('counter','Tegenargument of andere lezing',dossier.counter,{rows:4})}
    ${field('open','Welke lacune of volgende controle blijft over?',dossier.open,{rows:4})}
    <div class="row">${nextButton('Bewaar synthese')}${btn('research-export','Download dossier als Markdown')}</div>
  </form>`;
}

export function researchPage(dossier, dossiers, page, results, witnessId) {
  const header = sectionHeading('onderzoek','Werk vanuit een probleemstelling en bouw je antwoord op met bronnen en historiografie.');
  if (!dossier) return header + `<div class="columns">
    <section class="panel stack"><h2>Mijn onderzoeksdossiers</h2>
      <p class="muted">Elk dossier bewaart je vraag, ingevoerd materiaal, bronnen, literatuur en vergelijkingen op dit toestel.</p>
      <div>${btn('research-new','Start een nieuw dossier','','primary')}</div>
      <div class="stack">${dossiers.map(r => `<a class="unit research-existing" href="#onderzoek/${esc(r.id)}/vraag"><h3>${esc(r.title || 'Dossier zonder titel')}</h3><span class="unit-trailing">${r.sources.length} bronnen</span></a>`).join('')}</div>
    </section>
    <section class="panel stack"><h2>Scriptorium</h2>
      <p class="muted">Raadpleeg je corpus of zoek naar literatuur voor je dossier.</p>
      <div><a class="button quiet" href="#scriptorium">Open Scriptorium</a></div>
    </section>
  </div>`;
  const previous = '<a class="text-link" href="#onderzoek">Alle dossiers</a>';
  const tabs = `<nav class="row research-tabs" aria-label="Onderzoeksstappen">
    ${Object.entries(RESEARCH_TABS).map(([id,label]) => '<a class="button small quiet" ' + (id === page ? 'aria-current="page"' : '') +
      ' href="#onderzoek/' + esc(dossier.id) + '/' + id + '">' + label + '</a>').join('')}
  </nav>`;
  const witness = dossier.sources.find(w => w.id === witnessId) ?? dossier.sources[0];
  const panes = {
    vraag: () => `<form id="research-question-form" class="panel stack">
      <h2>Baken je onderzoek af</h2>
      ${field('title','Dossiertitel',dossier.title,{required:true})}
      ${field('question','Probleemstelling',dossier.question,{rows:4,help:'Welke relatie, verandering of interpretatie wil je verklaren of toetsen?'})}
      ${field('scope','Afbakening en vergelijkingscriteria',dossier.scope,{rows:4,help:'Wanneer, waar, over wie? Wat komt als bewijs in aanmerking?'})}
      ${field('terms','Eerste zoektermen of bronverwijzing',dossier.terms,{max:220})}
      <div class="row"><button class="button primary" type="submit" name="stage" value="invoegen">Bewaar en voeg materiaal in</button>
        <button class="button quiet" type="submit" name="stage" value="vinden">Bewaar en zoek bronnen</button>${btn('research-export','Download dossier')}</div>
    </form>`,
    invoegen: () => insertMaterial(dossier,results.insertDraft),
    vinden: () => sourceMatches(dossier,results),
    bron: () => analyze(dossier,witness,results.matches),
    debat: () => debate(dossier),
    vergelijk: () => comparisonPage(dossier,results.tabKey,results.comparison),
    besluit: () => synthesis(dossier),
  };
  return header + `<div class="stack">${previous}<h2>${esc(dossier.title || 'Nieuw onderzoeksdossier')}</h2>${tabs}${panes[page]()}</div>`;
}

export function researchMarkdown(d) {
  const lines = ['# ' + (d.title || 'Onderzoeksdossier'), '', '## Probleemstelling', d.question || '',
    '', '### Afbakening', d.scope || '', '', '## Primaire bronnen'];
  for (const w of d.sources) {
    lines.push('', '### ' + [w.author,w.title,w.locator].filter(Boolean).join(' · '), w.url || '',
      'Controle: ' + (STATUS[w.status] ?? STATUS.tocheck), 'Datering en plaats: ' + [w.period,w.place].filter(Boolean).join(' · '),
      '', 'Passage · ' + (w.passageKind || 'ingevoerde tekst'), ...String(w.passage || '').split('\n').map(line => '> ' + line),
      '', 'Waarneming: ' + (w.observation || ''), 'Context: ' + (w.context || ''), 'Beperkingen: ' + (w.limits || ''),
      'Bijdrage aan de vraag: ' + (w.questionLink || ''));
  }
  lines.push('', '## Historiografie');
  for (const l of d.studies) {
    const witness = d.sources.find(w => w.id === l.witness);
    lines.push('', '### ' + [l.author,l.title,l.year,l.locator].filter(Boolean).join(' · '), l.url || '',
      'Leesstatus: ' + (STATUS[l.status] ?? STATUS.tocheck), 'Primaire bron: ' + (witness?.locator || witness?.title || ''),
      'Relatie: ' + (RELATIONS[l.relation] ?? RELATIONS.open), 'Stelling: ' + (l.argument || ''), 'Bewijs: ' + (l.basis || ''));
    if (l.fragment) lines.push('', '#### Opgeslagen fragment', [l.file,l.location].filter(Boolean).join(' · '), '', l.fragment);
    if (l.analysisNote) lines.push('', '#### AI-notitie uit Scriptorium · te controleren',
      [l.author, l.analysisPage ? 'PDF-pagina ' + l.analysisPage : ''].filter(Boolean).join(' · '), l.analysisNote);
  }
  if (d.notes?.length) {
    lines.push('', '## Eigen tekst en notities');
    for (const note of d.notes) {
      lines.push('', '### ' + note.title, [note.author,note.locator,note.file,note.location].filter(Boolean).join(' · '), '', note.text);
    }
  }
  if (d.comparisons?.length) {
    const sources = new Map(evidenceList(d).map(item => [item.ref,item]));
    lines.push('', '## Bronnenvergelijkingen');
    for (const board of d.comparisons) {
      lines.push('', '### ' + board.claim);
      for (const row of board.rows) {
        const item = sources.get(row.ref);
        lines.push('', '#### ' + (item?.citation || 'Bronverwijzing'),
          'Vindplaats: ' + (row.locator || item?.locator || 'Te controleren'),
          'Relatie: ' + (COMPARISON_RELATIONS[row.relation] ?? COMPARISON_RELATIONS.open), row.observation || '',
          'Context en beperkingen: ' + (row.limits || ''));
      }
      lines.push('', 'Overeenkomsten, tegenspraak en onafhankelijkheid: ' + (board.discussion || ''),
        'Conclusie: ' + (board.conclusion || ''), 'Volgende controle: ' + (board.nextCheck || ''));
    }
  }
  return lines.concat(['','## Synthese',d.claim || '', '', '### Tegenargument',d.counter || '',
    '', '### Openstaande controle', d.open || '']).join('\n');
}
