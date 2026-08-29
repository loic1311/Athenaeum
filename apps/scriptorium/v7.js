(function(){
'use strict';
const V7_PREV_INIT=window.init;
const V7_PREV_SHOW=window.showPage;
const V7_PREV_RENDER_CORPUS=window.renderCorpus;
const V7_PREV_FILTERED=window.filteredWorks;
const V7_VERSION='7.0';
const UGENT_MEMBERS=['Koenraad Verboven','Arjan Zuiderhoek','Peter Van Nuffelen','Lieve Van Hoof','Wim Broekaert','Toon Bongers','Amber Brüsewitz','Maria Conterno'];
let bibSeed=null, deferredInstallPrompt=null, v7HistoryLock=false;

function q(id){return document.getElementById(id)}
function esc7(v){return window.esc?window.esc(v):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function currentPage7(){return document.querySelector('.page.active')?.id?.replace('page-','')||'dashboard'}
function provenance7(w){
  if(w.provenance_category) return w.provenance_category;
  if(w.origin==='bundled-analysis') return 'core_original';
  if(w.origin==='ugent_biblio') return 'ugent_discovery';
  if(w.origin==='bibliography_chain') return 'bibliography_chain';
  if(w.origin==='openalex') return 'external_discovery';
  return 'user_added';
}
function provenanceLabel7(cat){return ({core_original:'Oorspronkelijk kerncorpus',ugent_discovery:'Via UGent gevonden',bibliography_chain:'Via bibliografie gevonden',external_discovery:'Extern gevonden',user_added:'Zelf toegevoegd'})[cat]||'Herkomst onbekend'}
function provenanceClass7(cat){return 'prov-'+cat.replaceAll('_','-')}

async function normalizeProvenance7(){
  if(!window.idbPut||typeof state==='undefined'||!Array.isArray(state.works)) return;
  let changed=0;
  for(const w of state.works){if(!w.provenance_category){w.provenance_category=provenance7(w);w.updated_at=Date.now();await idbPut('works',w);changed++;}}
  if(changed&&window.loadWorks) await loadWorks();
}

function restructureNav7(){
  const nav=q('nav'); if(!nav)return;
  const order=[['dashboard','Home'],['corpus','Corpus'],['exchange','Corpusanalyse'],['discovery','Zoeken'],['sources','Primaire bronnen'],['atelier','Theorie'],['training','Training'],['progress','Voortgang'],['settings','Instellingen']];
  const by=new Map([...nav.querySelectorAll('button[data-page]')].map(b=>[b.dataset.page,b]));
  nav.innerHTML='';
  for(const [page,label] of order){const b=by.get(page)||document.createElement('button');b.dataset.page=page;b.textContent=label;nav.appendChild(b)}
  [...nav.querySelectorAll('button')].forEach(b=>b.classList.toggle('active',b.dataset.page===currentPage7()));
  const side=document.querySelector('.side-note'); if(side)side.innerHTML='<strong>Ad fontes, sed cum methodo.</strong><br>Herkomst, kwaliteit en didactisch gewicht blijven afzonderlijk zichtbaar.';
}

function installAnimations7(){
  if(document.documentElement.dataset.v7anim)return;document.documentElement.dataset.v7anim='1';
  const obs=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('v7-visible');obs.unobserve(e.target)}}),{threshold:.08,rootMargin:'0px 0px -30px'});
  function scan(){document.querySelectorAll('.card,.stat,.lesson,.result,.source-library-item,.auth-source-card,.v7-reveal').forEach(el=>{if(!el.dataset.v7seen){el.dataset.v7seen='1';el.classList.add('v7-reveal');obs.observe(el)}})}
  new MutationObserver(()=>requestAnimationFrame(scan)).observe(document.querySelector('.content')||document.body,{childList:true,subtree:true});scan();
  let lastY=scrollY;window.addEventListener('scroll',()=>{const y=scrollY;document.body.classList.toggle('v7-scrolled',y>90);document.body.classList.toggle('v7-scroll-down',y>lastY&&y>180);lastY=y},{passive:true});
}

function patchMobileNav7(){
  const nav=q('mobileBottomNav'); if(nav){
    const items=[['dashboard','🏠','Home'],['training','🧠','Training'],['corpus','📚','Corpus']];
    for(const [p,icon,label] of items){const b=nav.querySelector(`[data-mobile-page="${p}"]`);if(b)b.innerHTML=`<span class="mbn-icon">${icon}</span><span>${label}</span>`}
    const more=q('mobileMoreBtn');if(more)more.innerHTML='<span class="mbn-icon">☰</span><span>Menu</span>';
  }
  const grid=document.querySelector('#mobileMenuSheet .mobile-sheet-grid');if(grid){
    const labels={sources:['🏺','Primaire bronnen'],progress:['📈','Voortgang'],atelier:['📖','Theorie'],discovery:['🔎','Zoeken'],exchange:['🗂️','Corpusanalyse'],settings:['⚙️','Instellingen']};
    grid.innerHTML='';for(const [page,[icon,label]] of Object.entries(labels)){const b=document.createElement('button');b.dataset.mobilePage=page;b.innerHTML=`<span class="v7-menu-emoji">${icon}</span><span>${label}</span>`;grid.appendChild(b)}
    const tg=document.createElement('button');tg.id='v7MobileTelegram';tg.innerHTML='<span class="v7-menu-emoji">✈️</span><span>Telegram</span>';grid.appendChild(tg);
    const help=document.createElement('button');help.id='mobileHelpBtn';help.innerHTML='<span class="v7-menu-emoji">❔</span><span>Werkwijze</span>';grid.appendChild(help);
  }
}

function pageName7(n){return ({dashboard:'Home',corpus:'Corpus',exchange:'Corpusanalyse',discovery:'Zoeken',sources:'Primaire bronnen',atelier:'Theorie',training:'Training',progress:'Voortgang',settings:'Instellingen'})[n]||n}
window.showPage=function(name,opts={}){
  if(name==='sync')name='settings';
  const r=V7_PREV_SHOW?V7_PREV_SHOW(name):undefined;
  document.querySelectorAll('#nav button[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===name));
  const active=document.querySelector('.page.active');if(active){active.classList.remove('v7-page-enter');void active.offsetWidth;active.classList.add('v7-page-enter')}
  if(q('pageTitle'))q('pageTitle').textContent=pageName7(name);
  if(!opts.noHistory&&!v7HistoryLock){const u=new URL(location.href);u.searchParams.set('page',name);history.pushState({page:name},'',u)}
  if(name==='discovery')renderSearchHub7();
  if(name==='atelier')renderTheoryHub7();
  if(name==='settings'){mergeSyncIntoSettings7();renderSettingsV7();}
  setTimeout(()=>window.scrollTo({top:0,behavior:'smooth'}),10);
  return r;
};
window.addEventListener('popstate',e=>{v7HistoryLock=true;window.showPage(e.state?.page||new URL(location.href).searchParams.get('page')||'dashboard',{noHistory:true});v7HistoryLock=false});

window.filteredWorks=function(){
  const xs=V7_PREV_FILTERED?V7_PREV_FILTERED():state.works||[];const f=q('corpusProvenance')?.value||'';return f?xs.filter(w=>provenance7(w)===f):xs;
};
window.renderCorpus=function(){
  if(V7_PREV_RENDER_CORPUS)V7_PREV_RENDER_CORPUS();
  const xs=window.filteredWorks?window.filteredWorks():[];
  document.querySelectorAll('#corpusTable tbody tr').forEach((tr,i)=>{
    const open=tr.querySelector('button[onclick^="openDetail"]');const m=open?.getAttribute('onclick')?.match(/openDetail\('([^']+)'\)/);const w=m?state.works.find(x=>x.id===m[1]):xs[i];if(!w)return;
    const td=tr.querySelector('.title-cell');if(td&&!td.querySelector('.v7-prov'))td.insertAdjacentHTML('beforeend',`<span class="v7-prov ${provenanceClass7(provenance7(w))}">${provenanceLabel7(provenance7(w))}</span>`);
    const acts=tr.querySelector('td:last-child .row');if(acts&&!acts.querySelector('.v7-bib-btn')){const b=document.createElement('button');b.className='btn small v7-bib-btn';b.textContent='Bibliografie';b.onclick=()=>{window.showPage('discovery');setTimeout(()=>{selectSearchTab7('bibliography');if(q('v7BibSource')){q('v7BibSource').value=w.id;renderBibliography7()}},60)};acts.insertBefore(b,acts.firstChild)}
  });
};

async function loadBib7(){if(bibSeed)return bibSeed;try{bibSeed=await (await fetch('./bibliography_seed_v7.json',{cache:'no-store'})).json()}catch{bibSeed={references:[],per_work:[]}}return bibSeed}

function searchTabs7(){return `<div class="v7-search-tabs" role="tablist"><button class="active" data-v7-search="ugent">🏛️ UGent</button><button data-v7-search="openalex">🌍 OpenAlex</button><button data-v7-search="bibliography">🔗 Bibliografieketen</button><button data-v7-search="author">👤 Auteur</button></div><div id="v7SearchPanel"></div>`}
function renderSearchHub7(){const hub=q('v7SearchHub');if(!hub)return;hub.innerHTML=searchTabs7();hub.querySelectorAll('[data-v7-search]').forEach(b=>b.onclick=()=>selectSearchTab7(b.dataset.v7Search));selectSearchTab7('ugent')}
function selectSearchTab7(tab){document.querySelectorAll('[data-v7-search]').forEach(b=>b.classList.toggle('active',b.dataset.v7Search===tab));const p=q('v7SearchPanel');if(!p)return;
  if(tab==='ugent')renderUgSearch7();if(tab==='openalex')renderOpenAlexPanel7();if(tab==='bibliography')renderBibPanel7();if(tab==='author')renderAuthorPanel7();}

function jsonp7(baseUrl,params={}){
  return new Promise((resolve,reject)=>{
    const cb='scriptoriumV7Jsonp_'+Date.now()+'_'+Math.random().toString(36).slice(2);
    const script=document.createElement('script');
    const timer=setTimeout(()=>{cleanup();reject(new Error('UGent-zoekopdracht timeout'))},15000);
    function cleanup(){clearTimeout(timer);delete window[cb];script.remove()}
    window[cb]=data=>{cleanup();resolve(data)};
    const u=new URL(baseUrl);Object.entries({...params,callback:cb}).forEach(([k,v])=>u.searchParams.set(k,v));
    script.src=u.toString();script.onerror=()=>{cleanup();reject(new Error('UGent JSONP kon niet laden'))};document.head.appendChild(script);
  });
}

function renderUgSearch7(){const p=q('v7SearchPanel');p.innerHTML=`<div class="card v7-search-card"><div class="v7-section-head"><div><h4>UGent Oude Geschiedenis</h4><p>Zoek rechtstreeks in de UGent Academic Bibliography. De Ancient History-groep focust vooral op de Romeinse wereld sensu lato, maar omvat ook Grieks, Hellenistisch en Laatantiek onderzoek.</p></div><span class="badge accent">Biblio UGent</span></div><div class="v7-form-grid"><label>Zoekterm<input id="v7UgQuery" placeholder="bv. Roman economy, Athens, epigraphy"></label><label>Auteur<input id="v7UgAuthor" placeholder="optioneel: Verboven, Zuiderhoek…"></label><label>Type<select id="v7UgType"><option value="dissertation">Doctoraten</option><option value="all">Alle publicaties</option></select></label><label>Vanaf jaar<input id="v7UgYear" type="number" min="1900" max="2100" placeholder="bv. 2015"></label></div><div class="v7-author-chips">${UGENT_MEMBERS.map(a=>`<button data-ug-author="${esc7(a)}">${esc7(a)}</button>`).join('')}</div><div class="row"><button class="btn primary" id="v7UgSearch">Zoek UGent</button><button class="btn" id="v7UgPreset">Oude Geschiedenis breed</button><a class="btn" target="_blank" rel="noopener" href="https://biblio.ugent.be/organization/LW03">Open Biblio UGent</a><button class="btn" id="v7UgMasterCatalog">Masterproeven in UGent catalogus</button></div><div class="callout"><strong>Belangrijk:</strong> “Via UGent gevonden” is een herkomstcategorie, geen kwaliteitsstempel. Een nieuw werk start niet automatisch als normatief.</div></div><div id="v7UgResults" class="v7-results"></div>`;
  p.querySelectorAll('[data-ug-author]').forEach(b=>b.onclick=()=>{q('v7UgAuthor').value=b.dataset.ugAuthor;searchUg7()});q('v7UgSearch').onclick=searchUg7;q('v7UgPreset').onclick=()=>{q('v7UgQuery').value='Roman Greece Greek Hellenistic antiquity epigraphy papyrology economy empire late antiquity';searchUg7()};q('v7UgMasterCatalog').onclick=async()=>{const term=[q('v7UgQuery').value.trim(),q('v7UgAuthor').value.trim()].filter(Boolean).join(' ');if(term)await copyText(term);window.open('https://libcatalog.ugent.be/','_blank','noopener');toast(term?'Zoekterm gekopieerd; plak hem in de UGent-catalogus.':'UGent-catalogus geopend.','good')};}
async function searchUg7(){
  const box=q('v7UgResults');box.innerHTML='<div class="empty">UGent doorzoeken…</div>';
  let clauses=['affiliation exact LW03'];
  const term=q('v7UgQuery').value.trim(),author=q('v7UgAuthor').value.trim(),typ=q('v7UgType').value,yr=q('v7UgYear').value.trim();
  if(term)clauses.push(`basic any "${term.replaceAll('"',' ')}"`);
  if(author)clauses.push(`author any "${author.replaceAll('"',' ')}"`);
  if(typ==='dissertation')clauses.push('type exact dissertation');
  if(yr)clauses.push(`year >= ${parseInt(yr)}`);
  const cql=clauses.join(' and ');
  try{
    const d=await jsonp7('https://biblio.ugent.be/publication',{q:cql,format:'json',limit:'40',sort:'year.desc,title.asc'});
    renderUgResults7(d.hits||[]);
  }catch(e){
    box.innerHTML=`<div class="callout warn"><strong>Rechtstreeks zoeken lukte niet.</strong> ${esc7(e.message)}. <a target="_blank" rel="noopener" href="https://biblio.ugent.be/publication?q=${encodeURIComponent(cql)}">Open dezelfde zoekopdracht op Biblio UGent</a>.</div>`;
  }
}
function biblioTitle7(x){return x.title||x._source?.title||x.metadata?.title||'Zonder titel'}
function biblioAuthors7(x){const a=x.author||x.authors||x._source?.author||[];if(typeof a==='string')return a;if(Array.isArray(a))return a.map(v=>typeof v==='string'?v:(v.name||[v.first_name,v.last_name].filter(Boolean).join(' '))).filter(Boolean).join(', ');return ''}
function renderUgResults7(xs){const box=q('v7UgResults');box.innerHTML=xs.length?xs.map((x,i)=>{const title=biblioTitle7(x),author=biblioAuthors7(x),year=x.year||x._source?.year||'',id=x.id||x.biblio_id||x._id||'',url=id?`https://biblio.ugent.be/publication/${id}`:'https://biblio.ugent.be/';return `<article class="v7-result-card"><div class="v7-result-meta"><span class="v7-prov prov-ugent-discovery">Via UGent gevonden</span><span>${esc7(year)}</span></div><h4>${esc7(title)}</h4><p>${esc7(author||'Auteur niet uit resultaat gelezen')}</p><div class="row"><a class="btn small" target="_blank" rel="noopener" href="${url}">Open UGent</a><button class="btn small" data-save-ug="${i}">Bewaar kandidaat</button><button class="btn small" data-tg-share="${esc7(url)}" data-tg-text="${esc7(title)}">Telegram</button></div><script type="application/json" id="v7ug_${i}">${JSON.stringify(x).replace(/</g,'\\u003c')}<\/script></article>`}).join(''):'<div class="empty">Geen resultaten gevonden.</div>';box.querySelectorAll('[data-save-ug]').forEach(b=>b.onclick=()=>saveUg7(+b.dataset.saveUg));bindTelegramButtons7(box)}
async function saveUg7(i){const x=JSON.parse(q('v7ug_'+i).textContent),title=biblioTitle7(x),author=biblioAuthors7(x),year=String(x.year||x._source?.year||''),bid=x.id||x.biblio_id||x._id||'';const w={id:uid(),filename:'(UGent-vondst — PDF nog toevoegen)',file_size:0,title,author,institution:'Universiteit Gent',year,document_type:'Dissertation / publicatie',field:suggestField(title),rug01:'',page_count:null,weight:'vaknabij',origin:'ugent_biblio',provenance_category:'ugent_discovery',source_url:bid?`https://biblio.ugent.be/publication/${bid}`:'https://biblio.ugent.be/',notes:'Gevonden via UGent Biblio. Herkomst is UGent, maar didactisch gewicht moet nog inhoudelijk beoordeeld worden.',analysis:null,analysis_ranges:[],created_at:Date.now(),updated_at:Date.now()};await idbPut('works',w);await loadWorks();toast('UGent-kandidaat aan corpusmetadata toegevoegd. Voeg de PDF toe en beoordeel daarna het gewicht.','good')}

function renderOpenAlexPanel7(){const p=q('v7SearchPanel');p.innerHTML=`<div class="card v7-search-card"><div class="v7-section-head"><div><h4>OpenAlex</h4><p>Gebruik OpenAlex voor brede internationale ontdekking. Dit is vooral nuttig om buiten je huidige corpus nieuwe proefschriften en verwante auteurs te vinden.</p></div><span class="badge">extern</span></div><div class="v7-form-grid"><label>Zoekterm<input id="v7OaQuery" placeholder="bv. Roman civic identity"></label><label>Vanaf jaar<input id="v7OaYear" type="number" placeholder="bv. 2015"></label></div><div class="row"><button class="btn primary" id="v7OaSearch">Zoeken</button></div></div><div id="v7OaResults" class="v7-results"></div>`;q('v7OaSearch').onclick=searchOa7;q('v7OaQuery').onkeydown=e=>{if(e.key==='Enter')searchOa7()}}
async function searchOa7(){const term=q('v7OaQuery').value.trim();if(!term)return toast('Geef een zoekterm.','warn');const box=q('v7OaResults');box.innerHTML='<div class="empty">OpenAlex doorzoeken…</div>';let filter='type:dissertation';const yr=q('v7OaYear').value;if(yr)filter+=`,from_publication_date:${yr}-01-01`;try{const r=await fetch(`https://api.openalex.org/works?search=${encodeURIComponent(term)}&filter=${encodeURIComponent(filter)}&per_page=30`);if(!r.ok)throw new Error('OpenAlex '+r.status);const d=await r.json();box.innerHTML=(d.results||[]).map((x,i)=>{const authors=(x.authorships||[]).map(a=>a.author?.display_name).filter(Boolean).join(', '),pdf=x.best_oa_location?.pdf_url||x.primary_location?.pdf_url||'',url=x.doi||x.id||'';return `<article class="v7-result-card"><div class="v7-result-meta"><span class="v7-prov prov-external-discovery">Extern gevonden</span><span>${x.publication_year||''}</span></div><h4>${esc7(x.title||'')}</h4><p>${esc7(authors)}</p><div class="row">${pdf?`<a class="btn small" target="_blank" href="${esc7(pdf)}">PDF</a>`:''}<a class="btn small" target="_blank" href="${esc7(url)}">Open bron</a><button class="btn small" data-v7oa="${i}">Bewaar kandidaat</button><button class="btn small" data-tg-share="${esc7(url)}" data-tg-text="${esc7(x.title||'')}">Telegram</button></div><script type="application/json" id="v7oa_${i}">${JSON.stringify(x).replace(/</g,'\\u003c')}<\/script></article>`}).join('')||'<div class="empty">Geen resultaten.</div>';box.querySelectorAll('[data-v7oa]').forEach(b=>b.onclick=()=>saveOa7(+b.dataset.v7oa));bindTelegramButtons7(box)}catch(e){box.innerHTML=`<div class="callout warn">Zoeken mislukt: ${esc7(e.message)}</div>`}}
async function saveOa7(i){const x=JSON.parse(q('v7oa_'+i).textContent),authors=(x.authorships||[]).map(a=>a.author?.display_name).filter(Boolean).join(', ');const w={id:uid(),filename:'(externe vondst — PDF nog toevoegen)',file_size:0,title:x.title||'',author:authors,institution:(x.authorships||[]).flatMap(a=>a.institutions||[]).map(i=>i.display_name).filter(Boolean).slice(0,3).join(', '),year:String(x.publication_year||''),document_type:'Dissertation',field:suggestField(x.title||''),rug01:'',page_count:null,weight:'aanvullend',origin:'openalex',provenance_category:'external_discovery',source_url:x.doi||x.id||'',pdf_url:x.best_oa_location?.pdf_url||x.primary_location?.pdf_url||'',notes:'Extern gevonden via OpenAlex. Nog inhoudelijk beoordelen.',analysis:null,analysis_ranges:[],created_at:Date.now(),updated_at:Date.now()};await idbPut('works',w);await loadWorks();toast('Externe kandidaat bewaard.','good')}

async function renderBibPanel7(){const p=q('v7SearchPanel'),d=await loadBib7();const works=(d.per_work||[]).filter(x=>x.count).sort((a,b)=>a.author.localeCompare(b.author));p.innerHTML=`<div class="card v7-search-card"><div class="v7-section-head"><div><h4>Bibliografieketen</h4><p>Scriptorium heeft automatisch referentiekandidaten uit de bibliografieën van 55 tekstleesbare werken in het oorspronkelijke corpus gehaald. Gebruik deze als zoeksporen, niet als reeds geverifieerde metadata.</p></div><span class="badge accent">${d.references?.length||0} zoeksporen</span></div><div class="v7-form-grid"><label>Zoek in referenties<input id="v7BibQuery" placeholder="auteur, titelwoord, thema…"></label><label>Afkomstig uit<select id="v7BibSource"><option value="">Alle corpuswerken</option>${works.map(w=>`<option value="${esc7(w.work_id)}">${esc7(w.author)} — ${esc7(w.title.slice(0,70))}</option>`).join('')}</select></label></div><div class="row"><button class="btn primary" id="v7BibSearch">Filter bibliografie</button><button class="btn" id="v7BibRandom">Toon 20 andere</button></div><div class="callout"><strong>Waarom dit nuttig is:</strong> hiermee zoek je niet alleen op wat jij of OpenAlex spontaan bedenkt, maar volg je de literatuurketen die de 56 werken zelf gebruikten.</div></div><div id="v7BibResults" class="v7-results"></div>`;q('v7BibSearch').onclick=renderBibliography7;q('v7BibQuery').oninput=debounce(renderBibliography7,180);q('v7BibSource').onchange=renderBibliography7;q('v7BibRandom').onclick=()=>renderBibliography7(true);renderBibliography7()}
async function renderBibliography7(random=false){const d=await loadBib7(),box=q('v7BibResults');if(!box)return;const term=(q('v7BibQuery')?.value||'').toLowerCase(),src=q('v7BibSource')?.value||'';let refs=(d.references||[]).filter(r=>(!src||r.source_work_id===src)&&(!term||r.citation.toLowerCase().includes(term)));if(random)refs=refs.sort(()=>Math.random()-.5);refs=refs.slice(0,30);box.innerHTML=refs.map((r,i)=>{const search=r.citation.slice(0,180);const oa=`https://openalex.org/works?page=1&filter=default.search:${encodeURIComponent(search)}`;const ug=`https://biblio.ugent.be/publication?q=${encodeURIComponent('basic any "'+search.replaceAll('"',' ')+'"')}`;return `<article class="v7-result-card v7-bib-card"><div class="v7-result-meta"><span class="v7-prov prov-bibliography-chain">Via bibliografie</span><span>uit ${esc7(r.source_work_author||'corpus')}</span></div><p class="v7-citation">${esc7(r.citation)}</p><div class="tiny">Bronwerk: ${esc7(r.source_work_title||'')} · bibliografie vanaf ongeveer fysieke PDF-p. ${r.source_pdf_page_start||'?'}</div><div class="row"><a class="btn small" target="_blank" href="${oa}">Zoek OpenAlex</a><a class="btn small" target="_blank" href="${ug}">Zoek UGent</a><button class="btn small" data-bib-save="${i}">Bewaar zoekspoor</button><button class="btn small" data-tg-share="${esc7(oa)}" data-tg-text="${esc7(r.citation.slice(0,150))}">Telegram</button></div><script type="application/json" id="v7bib_${i}">${JSON.stringify(r).replace(/</g,'\\u003c')}<\/script></article>`}).join('')||'<div class="empty">Geen referenties voor deze filter.</div>';box.querySelectorAll('[data-bib-save]').forEach(b=>b.onclick=()=>saveBibLead7(+b.dataset.bibSave));bindTelegramButtons7(box)}
async function saveBibLead7(i){const r=JSON.parse(q('v7bib_'+i).textContent);const w={id:uid(),filename:'(bibliografisch zoekspoor — nog verifiëren)',file_size:0,title:r.citation.slice(0,180),author:'',institution:'',year:'',document_type:'Bibliografisch zoekspoor',field:'',rug01:'',page_count:null,weight:'aanvullend',origin:'bibliography_chain',provenance_category:'bibliography_chain',source_url:'',notes:`Automatisch uit bibliografie van ${r.source_work_author}: ${r.source_work_title}. Metadata nog verifiëren vóór inhoudelijke analyse.`,analysis:null,analysis_ranges:[],created_at:Date.now(),updated_at:Date.now()};await idbPut('works',w);await loadWorks();toast('Bibliografisch zoekspoor bewaard. Verifieer auteur/titel/PDF voordat je het als echt corpuswerk gebruikt.','good')}

function renderAuthorPanel7(){const p=q('v7SearchPanel');p.innerHTML=`<div class="card v7-search-card"><div class="v7-section-head"><div><h4>Zoek per auteur</h4><p>Gebruik een auteur als vertrekpunt om nieuwe proefschriften, publicaties en onderzoekslijnen te volgen. Voor UGent kun je rechtstreeks de Biblio-index gebruiken.</p></div><span class="badge">auteursnetwerk</span></div><div class="v7-form-grid"><label>Auteur<input id="v7AuthorName" placeholder="bv. Koenraad Verboven"></label><label>Extra thema<input id="v7AuthorTheme" placeholder="optioneel"></label></div><div class="row"><button class="btn primary" id="v7AuthorUg">Zoek UGent</button><button class="btn" id="v7AuthorOA">Zoek OpenAlex</button></div><div class="v7-author-chips">${UGENT_MEMBERS.map(a=>`<button data-author-preset="${esc7(a)}">${esc7(a)}</button>`).join('')}</div></div><div id="v7AuthorResults" class="v7-results"></div>`;p.querySelectorAll('[data-author-preset]').forEach(b=>b.onclick=()=>{q('v7AuthorName').value=b.dataset.authorPreset;q('v7AuthorUg').click()});q('v7AuthorUg').onclick=()=>{const a=q('v7AuthorName').value.trim(),t=q('v7AuthorTheme').value.trim();if(!a)return;selectSearchTab7('ugent');q('v7UgAuthor').value=a;q('v7UgQuery').value=t;searchUg7()};q('v7AuthorOA').onclick=()=>{const a=q('v7AuthorName').value.trim(),t=q('v7AuthorTheme').value.trim();if(!a)return;selectSearchTab7('openalex');q('v7OaQuery').value=[a,t].filter(Boolean).join(' ');searchOa7()}}

function renderTheoryHub7(){const hub=q('v7TheoryHub');if(!hub)return;hub.innerHTML=`<section class="v7-theory-overview"><div class="v7-section-head"><div><h3>Theorie als onderzoeksroute</h3><p>Begin niet bij losse tips. Kies de fase waarin je zit en werk van probleem naar methode, bewijs, argument en verdediging. Elke theorieles gebruikt voorbeelden uit meerdere corpuswerken.</p></div><span class="badge accent">23 modules</span></div><div class="v7-theory-pillars">${[
 ['🧭','Vraag & afbakening','m01','Modules 1–3: diagnose, onderzoeksvraag en operationalisering.'],['🏺','Corpus & bronkritiek','m04','Modules 4–5: representativiteit en maximale inferentie.'],['📚','Historiografie & methode','m06','Modules 6–10: debat, positionering, methode, theorie en triangulatie.'],['🧠','Argument & causaliteit','m11','Modules 11–18: bewijs, causaliteit, proxies, vergelijking, structuur en conclusie.'],['🛠️','Review & ontwerp','m19','Modules 19–20: peer review en geïntegreerd onderzoeksontwerp.'],['🎓','Mastery','m21','Modules 21–23: Source Lab, mondelinge verdediging en Thesis Studio.']
 ].map(([ic,t,m,d])=>`<button class="v7-theory-pillar" data-theory-module="${m}"><span>${ic}</span><strong>${t}</strong><small>${d}</small></button>`).join('')}</div><div class="v7-theory-tools"><label>Zoek in corpusprincipes<input id="v7TheorySearch" placeholder="bv. causaliteit, representativiteit, conclusie"></label><button class="btn" id="v7TheoryTraining">Naar Training</button></div></section>`;hub.querySelectorAll('[data-theory-module]').forEach(b=>b.onclick=()=>window.openModuleTheory?.(b.dataset.theoryModule));q('v7TheoryTraining').onclick=()=>window.showPage('training');q('v7TheorySearch').oninput=()=>{const term=q('v7TheorySearch').value.toLowerCase();document.querySelectorAll('#lessons .lesson').forEach(x=>x.style.display=!term||x.textContent.toLowerCase().includes(term)?'':'none')}}

function mergeSyncIntoSettings7(){const settings=q('page-settings'),sync=q('page-sync');if(!settings||!sync||q('v7SyncSettings'))return;const wrap=document.createElement('section');wrap.id='v7SyncSettings';wrap.className='v7-settings-section';wrap.innerHTML='<div class="v7-section-head"><div><h3>Synchronisatie & backup</h3><p>Bewaar je voortgang local-first en voeg desgewenst cloudsync toe. PDF-bestanden blijven lokaal; metadata, analyses, training en annotaties kunnen worden gesynchroniseerd.</p></div><span class="badge">veiligheid</span></div>';while(sync.firstChild)wrap.appendChild(sync.firstChild);settings.appendChild(wrap);sync.remove();document.querySelectorAll('#nav button[data-page="sync"]').forEach(x=>x.remove())}

function telegramShareUrl7(url,text){return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text||'')}`}
function bindTelegramButtons7(root=document){root.querySelectorAll('[data-tg-share]').forEach(b=>{if(b.dataset.tgBound)return;b.dataset.tgBound='1';b.onclick=()=>window.open(telegramShareUrl7(b.dataset.tgShare||location.href,b.dataset.tgText||''),'_blank','noopener')})}
function renderTelegramCard7(){if(q('v7TelegramCard'))return;const settings=q('page-settings');if(!settings)return;const card=document.createElement('div');card.id='v7TelegramCard';card.className='card v7-telegram-card';card.innerHTML=`<div class="v7-section-head"><div><h3>✈️ Telegram</h3><p>Deel een zoekresultaat, oefening of Scriptorium-link rechtstreeks naar Telegram. Voor automatische botmeldingen is een kleine server/Edge Function nodig; zet nooit een bot-token in deze publieke GitHub-app.</p></div><span class="badge accent">veilig delen</span></div><div class="v7-form-grid"><label>Optionele bot- of gebruikersnaam<input id="v7TelegramUser" placeholder="bv. ScriptoriumBot"></label><label>Standaardtekst<input id="v7TelegramText" value="Scriptorium — academisch onderzoek"></label></div><div class="row"><button class="btn primary" id="v7TelegramShareApp">Deel Scriptorium</button><button class="btn" id="v7TelegramShareExercise">Deel huidige oefening</button><button class="btn" id="v7TelegramOpen">Open Telegram-contact</button><a class="btn" target="_blank" href="https://t.me/BotFather">BotFather</a></div><div class="callout"><strong>Technische grens:</strong> de gewone deelfunctie werkt volledig vanuit GitHub Pages. Automatische berichten vanuit een bot vereisen server-side opslag van het bot-token; daarvoor zit een veilig Supabase Edge Function-sjabloon in het V7-pakket.</div>`;settings.appendChild(card);q('v7TelegramUser').value=localStorage.getItem('v7_telegram_user')||'';q('v7TelegramUser').onchange=()=>localStorage.setItem('v7_telegram_user',q('v7TelegramUser').value.trim());q('v7TelegramShareApp').onclick=()=>window.open(telegramShareUrl7(location.origin+location.pathname,q('v7TelegramText').value),'_blank');q('v7TelegramShareExercise').onclick=()=>{const ex=state.currentExercise;const text=ex?`Scriptorium oefening: ${ex.title}\n${ex.prompt}`:'Scriptorium training';window.open(telegramShareUrl7(location.href,text),'_blank')};q('v7TelegramOpen').onclick=()=>{const u=q('v7TelegramUser').value.trim().replace(/^@/,'');if(!u)return toast('Vul eerst een Telegram-gebruikers- of botnaam in.','warn');window.open(`https://t.me/${encodeURIComponent(u)}`,'_blank')}}

function renderPwaInstall7(){if(q('v7InstallCard'))return;const settings=q('page-settings');if(!settings)return;const card=document.createElement('div');card.id='v7InstallCard';card.className='card';card.innerHTML=`<div class="v7-section-head"><div><h3>📱 App installeren</h3><p>Een echte PWA opent zonder browserbalk en toont het Scriptorium-icoon. Een gewone homescreen-snelkoppeling blijft webmodus.</p></div><span class="badge" id="v7InstallState">controleren</span></div><div class="row"><button class="btn primary" id="v7InstallButton">Installeer Scriptorium</button><button class="btn" id="v7RefreshPwa">Vernieuw app-cache</button></div><p class="tiny" id="v7InstallHelp"></p>`;settings.appendChild(card);const update=()=>{const stand=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;const st=q('v7InstallState');st.textContent=stand?'Appmodus':'Webmodus';st.className='badge '+(stand?'good':'warn');q('v7InstallButton').disabled=stand;q('v7InstallHelp').textContent=stand?'Scriptorium draait als geïnstalleerde app.':deferredInstallPrompt?'Chrome heeft een echte installatieprompt beschikbaar. Klik op Installeer Scriptorium.':'Als de knop geen systeemvenster opent: gebruik Chrome zelf (geen custom tab), herlaad de site en open daarna opnieuw Instellingen. Op Android staat installatie vaak onder “Installeren en snelkoppelingen”.'};q('v7InstallButton').onclick=async()=>{if(deferredInstallPrompt){deferredInstallPrompt.prompt();await deferredInstallPrompt.userChoice;deferredInstallPrompt=null;update()}else toast('Chrome heeft momenteel geen PWA-installatieprompt vrijgegeven. Open de pagina rechtstreeks in Chrome en herlaad één keer.','warn')};q('v7RefreshPwa').onclick=async()=>{try{const keys=await caches.keys();await Promise.all(keys.filter(k=>k.startsWith('scriptorium-')).map(k=>caches.delete(k)));const reg=await navigator.serviceWorker?.getRegistration('./');await reg?.update();toast('App-cache vernieuwd. Herlaad nu één keer.','good')}catch(e){toast(e.message,'bad')}};update()}
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstallPrompt=e;if(q('v7InstallCard'))renderSettingsV7()});

async function hydrateSync7(){
  try{
    const rec=await idbGet('settings','v6_sb_config');const c=rec?.value||{};
    if(q('sbUrl')&&!q('sbUrl').value)q('sbUrl').value=c.url||'';
    if(q('sbKey')&&!q('sbKey').value)q('sbKey').value=c.key||'';
    if(q('sbEmail')&&!q('sbEmail').value)q('sbEmail').value=c.email||'';
    if(q('sbStatus')&&c.access_token)q('sbStatus').textContent=`Cloudsessie beschikbaar${c.user?.email?` voor ${c.user.email}`:''}.`;
  }catch(e){console.warn('V7 sync hydrate',e)}
}
function renderSettingsV7(){renderTelegramCard7();renderPwaInstall7();hydrateSync7()}

function addSourceExplorer7(){
  const page=q('page-sources');
  if(!page||q('v7SourceExplorer'))return;
  const card=document.createElement('div');
  card.id='v7SourceExplorer';
  card.className='card v7-source-explorer';
  card.innerHTML=`<div class="v7-section-head"><div><h3>🔎 Externe bronzoeker</h3><p>Gebruik de ingebouwde bibliotheek voor training en spring vanuit één zoekterm door naar gespecialiseerde brondatabanken voor epigrafie, papyrologie, munten en teksten.</p></div><span class="badge">brononderzoek</span></div><div class="v7-form-grid"><label>Zoekterm<input id="v7SourceExternalQuery" placeholder="bv. Augustus, Salamis, grain, women"></label></div><div class="v7-source-links"><a data-db="aio" target="_blank">Attic Inscriptions Online</a><a href="https://papyri.info/" target="_blank">Papyri.info</a><a href="https://numismatics.org/ocre/" target="_blank">OCRE munten</a><a href="https://scaife.perseus.org/" target="_blank">Perseus / Scaife</a><a href="https://romaninscriptionsofbritain.org/" target="_blank">RIB</a></div><div class="tiny">Scriptorium importeert resultaten niet automatisch als “waarheid”. Voeg alleen een bronrecord toe wanneer tekst/objectdata en provenance controleerbaar zijn.</div>`;
  const first=page.querySelector('.card');
  if(first)first.insertAdjacentElement('beforebegin',card);else page.appendChild(card);
  const upd=()=>{
    const term=q('v7SourceExternalQuery').value.trim();
    card.querySelector('[data-db="aio"]').href=term?`https://www.atticinscriptions.com/search/?q=${encodeURIComponent(term)}`:'https://www.atticinscriptions.com/';
  };
  q('v7SourceExternalQuery').oninput=upd;
  upd();
}

function bindGlobal7(){q('corpusProvenance')?.addEventListener('change',()=>{state.corpusPage=1;window.renderCorpus()});bindTelegramButtons7();document.addEventListener('click',e=>{const tg=e.target.closest('#v7MobileTelegram');if(tg){e.preventDefault();window.open(telegramShareUrl7(location.href,'Scriptorium V7'),'_blank')}});}

window.init=async function(){
  if(V7_PREV_INIT)await V7_PREV_INIT();
  document.title='Scriptorium V7 — Academische Onderzoekscoach';document.querySelectorAll('.version-pill').forEach(x=>x.textContent='V7');const sm=document.querySelector('.brand small');if(sm)sm.textContent='Academische onderzoekscoach · corpus · bronnen · theorie · training';const sub=document.querySelector('.topbar-sub');if(sub)sub.textContent='Onderzoek, bronnen en vaardigheden in één werkruimte';
  await normalizeProvenance7();restructureNav7();patchMobileNav7();installAnimations7();mergeSyncIntoSettings7();renderSettingsV7();addSourceExplorer7();bindGlobal7();
  const urlPage=new URL(location.href).searchParams.get('page');if(urlPage&&['dashboard','corpus','exchange','discovery','sources','atelier','training','progress','settings'].includes(urlPage)){v7HistoryLock=true;window.showPage(urlPage,{noHistory:true});v7HistoryLock=false}else{history.replaceState({page:currentPage7()},'',location.href)}
  if(currentPage7()==='discovery')renderSearchHub7();if(currentPage7()==='atelier')renderTheoryHub7();window.renderCorpus();
};
})();
