(function(){
'use strict';

const V63_BASE_INIT = window.init;
const V63_VERSION = '6.3.1';
const FRIEND_PROMPT = 'Gebruik de geuploade Scriptorium AI Instructiegids als vast beoordelingsprotocol voor alle Scriptorium-output die ik in deze chat plak. Wanneer een Scriptorium-prompt om JSON vraagt, antwoord uitsluitend met het gevraagde JSON-object. Hanteer de strenge 18+-norm, wees kritisch maar constructief, en coach mijn redenering in plaats van mijn academische tekst voor mij te schrijven.';

function sleep63(ms){ return new Promise(r=>setTimeout(r,ms)); }
function mode63(){
  const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  return {standalone,mobile};
}
function updateMode63(){
  const chip=document.getElementById('installStatusChip');
  if(!chip) return;
  const m=mode63();
  chip.textContent=(m.standalone?'Appmodus':'Webmodus')+' · '+(m.mobile?'mobiel':'desktop');
  document.body.classList.toggle('app-standalone',m.standalone);
}
function brand63(){
  document.title='Scriptorium V6.3.1 - Academische Onderzoekscoach';
  document.querySelectorAll('.version-pill').forEach(x=>x.textContent='V6.3.1');
  const s=document.querySelector('.brand small'); if(s)s.textContent='Onderzoekscoach V6.3.1 · GitHub-ready · authentieke bronnen · training · sync';
  const sub=document.querySelector('.topbar-sub'); if(sub)sub.textContent='Scriptorium V6.3.1 · web, desktop en mobiel';
}
function notifyBoot(msg,type='warn'){
  const e=document.getElementById('bootNotice'); if(!e)return;
  e.hidden=false; e.className='boot-notice '+type; e.textContent=msg;
}
function clearBoot(){const e=document.getElementById('bootNotice'); if(e)e.hidden=true;}

async function loadScript63(url, globalName){
  if(window[globalName]) return true;
  return new Promise(resolve=>{
    const s=document.createElement('script'); s.src=url; s.async=true;
    s.onload=()=>resolve(Boolean(window[globalName]));
    s.onerror=()=>resolve(false); document.head.appendChild(s);
  });
}
async function ensureDependencies63(){
  let pdf=Boolean(window.PDFLib), zip=Boolean(window.JSZip);
  if(!pdf){
    pdf=await loadScript63('https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js','PDFLib');
  }
  if(!zip){
    zip=await loadScript63('https://unpkg.com/jszip@3.10.1/dist/jszip.min.js','JSZip');
  }
  if(!pdf || !zip){
    notifyBoot('Scriptorium is gestart, maar de PDF/ZIP-bibliotheek kon niet volledig laden. Training en bronnen werken wel; PDF-import/export vereist internet en een herlaadbeurt.','warn');
  }
  return {pdf,zip};
}

async function seedCorpus63(){
  try{
    if(!db) return {seeded:0,error:'Lokale database is niet geopend'};
    const res=await fetch('./corpus_seed.json',{cache:'no-store'});
    if(!res.ok) return {seeded:0,error:'corpus_seed.json niet gevonden'};
    const seed=await res.json();
    if(seed.scriptorium_corpus_seed!==1 || !Array.isArray(seed.works)) return {seeded:0,error:'ongeldig corpusseed-formaat'};
    const existing=await idbGetAll('works');
    const byId=new Map(existing.map(w=>[w.id,w]));
    let added=0, enriched=0;
    for(const sw of seed.works){
      const old=byId.get(sw.id);
      if(!old){ await idbPut('works',{...sw,created_at:Date.now(),updated_at:Date.now()}); added++; continue; }
      if(!old.analysis && sw.analysis){
        await idbPut('works',{...sw,...old,analysis:sw.analysis,analysis_ranges:old.analysis_ranges?.length?old.analysis_ranges:sw.analysis_ranges,updated_at:Date.now()}); enriched++;
      }
    }
    if(added||enriched) await loadWorks();
    await idbPut('settings',{key:'v63_corpus_seed',value:{version:V63_VERSION,added,enriched,at:Date.now()}});
    return {seeded:added,enriched};
  }catch(e){ console.warn('Corpus seed failed',e); return {seeded:0,error:e.message}; }
}

function bindNavigationFallback63(){
  if(document.documentElement.dataset.v63nav==='1') return;
  document.documentElement.dataset.v63nav='1';
  document.addEventListener('click',e=>{
    const pageBtn=e.target.closest('#nav button[data-page]');
    if(pageBtn && window.showPage){ e.preventDefault(); window.showPage(pageBtn.dataset.page); return; }
    const go=e.target.closest('[data-go]');
    if(go && window.showPage){ e.preventDefault(); window.showPage(go.dataset.go); return; }
    const close=e.target.closest('[data-close]');
    if(close && window.closeModal){ e.preventDefault(); window.closeModal(close.dataset.close); }
  },true);
}

async function checkAsset63(url){
  try{const r=await fetch(url,{cache:'no-store'}); return r.ok;}catch{return false;}
}
function healthRow63(label,ok,detail=''){
  return `<div class="health-row ${ok?'ok':'bad'}"><span class="health-dot"></span><div><strong>${label}</strong>${detail?`<div class="tiny">${detail}</div>`:''}</div><span>${ok?'OK':'ACTIE'}</span></div>`;
}
async function renderHealth63(){
  const box=document.getElementById('releaseHealth'); if(!box)return;
  const isHttps=location.protocol==='https:' || location.hostname==='localhost';
  const github=location.hostname.endsWith('github.io');
  const checks=await Promise.all([
    checkAsset63('./version.json'),checkAsset63('./corpus_seed.json'),checkAsset63('./sources.js'),checkAsset63('./Scriptorium_AI_Instructiegids_Vrienden.pdf'),checkAsset63('./manifest.webmanifest')
  ]);
  let sw=false; try{sw=Boolean(navigator.serviceWorker && (await navigator.serviceWorker.getRegistration('./')));}catch{}
  let idb=Boolean(window.indexedDB);
  const rows=[
    healthRow63('HTTPS / veilige context',isHttps,isHttps?'PWA en clipboard kunnen veilig werken.':'Gebruik GitHub Pages via https://.'),
    healthRow63('GitHub Pages pad',!github || location.pathname.endsWith('/') || location.pathname.includes('/'),github?'Projectsite gedetecteerd: '+location.pathname:'Niet op github.io; lokaal/andere host.'),
    healthRow63('Versiebestand',checks[0],'version.json'),
    healthRow63('Didactisch corpus ingebouwd',checks[1],'56 analyse-records voor nieuwe toestellen.'),
    healthRow63('Primaire bronnenbibliotheek',checks[2],'sources.js'),
    healthRow63('AI-instructiegids voor vrienden',checks[3],'downloadbare PDF'),
    healthRow63('PWA manifest',checks[4],'manifest.webmanifest'),
    healthRow63('Service worker',sw,sw?'Offline shell/updatebeheer actief.':'Herlaad de pagina na publicatie.'),
    healthRow63('Lokale database',idb,'IndexedDB voor eigen voortgang en PDF-bestanden.'),
    healthRow63('PDF-bibliotheek',Boolean(window.PDFLib),'Nodig voor PDF-import.'),
    healthRow63('ZIP-bibliotheek',Boolean(window.JSZip),'Nodig voor corpuspakketten.')
  ];
  box.innerHTML=rows.join('');
  const badge=document.getElementById('releaseModeBadge');
  if(badge){const failures=[!isHttps,...checks.map(x=>!x),!idb].filter(Boolean).length;badge.textContent=failures?'controle nodig':'release gereed';badge.className='badge '+(failures?'warn':'good');}
}

async function forceUpdate63(){
  if(!confirm('App-cache vernieuwen? Je IndexedDB-data, scores en lokale PDF-bestanden blijven behouden.')) return;
  try{
    if('caches' in window){for(const k of await caches.keys()) if(k.startsWith('scriptorium-')) await caches.delete(k);}
    if('serviceWorker' in navigator){
      const regs=await navigator.serviceWorker.getRegistrations();
      for(const r of regs){ try{await r.update();}catch{} }
    }
    location.reload();
  }catch(e){alert('Cache vernieuwen mislukte: '+e.message);}
}

function bindSettings63(){
  const cp=document.getElementById('copyFriendPrompt');
  if(cp) cp.onclick=async()=>{await copyText(FRIEND_PROMPT); toast('Startinstructie voor ChatGPT gekopieerd.','good');};
  const rh=document.getElementById('refreshReleaseHealth'); if(rh)rh.onclick=renderHealth63;
  const fu=document.getElementById('forceAppUpdate'); if(fu)fu.onclick=forceUpdate63;
}

function guardPdfFeatures63(){
  const file=document.getElementById('fileInput');
  if(file){
    const old=file.onchange;
    file.onchange=async e=>{
      if(!window.PDFLib){toast('PDF-bibliotheek is nog niet geladen. Controleer internet en herlaad de app.','bad');return;}
      if(old) return old.call(file,e);
    };
  }
  const pkg=document.getElementById('makeCorpusPackage');
  if(pkg){
    const old=pkg.onclick;
    pkg.onclick=async e=>{
      if(!window.JSZip || !window.PDFLib){toast('PDF/ZIP-bibliotheken ontbreken. Herlaad met internetverbinding.','bad');return;}
      if(old) return old.call(pkg,e);
    };
  }
}

async function registerSW63(){
  if(!('serviceWorker' in navigator) || !(location.protocol==='https:'||location.hostname==='localhost')) return;
  try{
    const reg=await navigator.serviceWorker.register('./sw.js',{scope:'./'});
    await reg.update().catch(()=>{});
    if(reg.waiting) reg.waiting.postMessage({type:'SKIP_WAITING'});
  }catch(e){console.warn('SW register',e);}
}

window.addEventListener('error',e=>{
  console.error('Scriptorium runtime error',e.error||e.message);
  const txt=String(e.message||'');
  if(txt && !txt.includes('ResizeObserver')) notifyBoot('Er trad een appfout op. Open Instellingen > GitHub / PWA systeemcheck voor diagnose.','bad');
});

window.init=async function(){
  brand63(); updateMode63(); bindNavigationFallback63();
  await ensureDependencies63();
  try{
    await V63_BASE_INIT();
  }catch(e){
    console.error('Base init failed',e); notifyBoot('Scriptorium kon niet volledig initialiseren: '+e.message,'bad');
  }
  const seed=await seedCorpus63();
  bindSettings63(); guardPdfFeatures63();
  await registerSW63();
  updateMode63();
  if(!seed.error && (seed.seeded||seed.enriched)) toast(`Didactisch corpus klaar: ${seed.seeded+seed.enriched} records toegevoegd/geactualiseerd.`,'good');
  if(seed.error && !db) notifyBoot('De lokale database kon niet worden geopend. Herlaad de app; blijft dit optreden, controleer of site-opslag/IndexedDB toegestaan is.','bad');
  else if(!document.getElementById('bootNotice')?.classList.contains('bad')) clearBoot();
  setTimeout(renderHealth63,500);
};

window.addEventListener('pageshow',updateMode63);
window.addEventListener('focus',updateMode63);
window.v63RenderHealth=renderHealth63;
})();
