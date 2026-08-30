(function(){
'use strict';

const PID=window.ATH_PROFILE_ID||localStorage.getItem('athenaeum_current_profile')||'';

function brand72(){
  document.title='Scriptorium V7.2 — Academische Onderzoekscoach';
  document.querySelectorAll('.version-pill').forEach(x=>x.textContent='V7.2');
  const sm=document.querySelector('.brand small');
  if(sm)sm.textContent='V7.2 · snelle veilige start · incrementele sync · H5P · gedeelde bibliotheek';
  const sub=document.querySelector('.topbar-sub');
  if(sub)sub.textContent='Scriptorium V7.2 · fast boot zonder volledige legacy-initialisatie';
}
function bootStatus(text,type='warn'){
  const n=document.getElementById('bootNotice');
  if(!n)return;
  n.hidden=false;n.className='boot-notice '+type;n.textContent=text;
}
function clearBoot72(){const n=document.getElementById('bootNotice');if(n&&!n.classList.contains('bad'))n.hidden=true}

function stableString(v){try{return JSON.stringify(v)}catch{return String(v)}}
function dedupeArray(arr){
  if(!Array.isArray(arr)||arr.length<2)return arr||[];
  const seen=new Set(),out=[];
  for(const x of arr){const k=stableString(x);if(seen.has(k))continue;seen.add(k);out.push(x)}
  return out;
}
function compactAnalysisObject(a){
  if(!a||typeof a!=='object')return {value:a,changed:false};
  let changed=false;const out={...a};
  const keys=['primary_sources','secondary_literature','source_criticism','argument_structure','writing_techniques','research_techniques','skill_lessons','lessons_for_user','anti_patterns','weaknesses'];
  for(const k of keys){
    if(Array.isArray(out[k])){
      const d=dedupeArray(out[k]);
      if(d.length!==out[k].length){out[k]=d;changed=true}
    }
  }
  return {value:out,changed};
}
function compactRanges(arr){
  if(!Array.isArray(arr))return {value:[],changed:false};
  const seen=new Set(),out=[];
  for(const r of arr){
    const k=r&&typeof r==='object'?`${r.start??''}|${r.end??''}|${r.complete_marker?'complete':''}`:stableString(r);
    if(seen.has(k))continue;seen.add(k);out.push(r);
  }
  return {value:out,changed:out.length!==arr.length};
}

async function compactLocalDatabase72(){
  if(!PID||!('indexedDB' in window))return {changed:0,before:0,after:0};
  return new Promise(resolve=>{
    const req=indexedDB.open(`ScriptoriumDB_${PID}`,3);
    req.onupgradeneeded=e=>{
      const db=e.target.result;
      if(!db.objectStoreNames.contains('works'))db.createObjectStore('works',{keyPath:'id'});
      if(!db.objectStoreNames.contains('files'))db.createObjectStore('files',{keyPath:'id'});
      if(!db.objectStoreNames.contains('settings'))db.createObjectStore('settings',{keyPath:'key'});
    };
    req.onerror=()=>resolve({changed:0,error:String(req.error||'')});
    req.onsuccess=()=>{
      const db=req.result;
      if(!db.objectStoreNames.contains('works')){db.close();resolve({changed:0});return}
      const tx=db.transaction('works','readwrite'),store=tx.objectStore('works');
      let changed=0,before=0,after=0;
      const cur=store.openCursor();
      cur.onsuccess=e=>{
        const c=e.target.result;if(!c)return;
        const w=c.value||{};
        before+=stableString(w).length;
        const ar=compactRanges(w.analysis_ranges||[]);
        const pr=compactRanges(w.pending_ranges||[]);
        const an=compactAnalysisObject(w.analysis);
        if(ar.changed||pr.changed||an.changed){
          w.analysis_ranges=ar.value;w.pending_ranges=pr.value;w.analysis=an.value;
          c.update(w);changed++;
        }
        after+=stableString(w).length;
        c.continue();
      };
      tx.oncomplete=()=>{db.close();resolve({changed,before,after})};
      tx.onerror=()=>{db.close();resolve({changed,before,after,error:String(tx.error||'')})};
    };
  });
}

async function countWorks72(){
  if(!PID||!('indexedDB' in window))return 0;
  return new Promise(resolve=>{
    const req=indexedDB.open(`ScriptoriumDB_${PID}`,3);
    req.onsuccess=()=>{
      const db=req.result;
      if(!db.objectStoreNames.contains('works')){db.close();resolve(0);return}
      const r=db.transaction('works').objectStore('works').count();
      r.onsuccess=()=>{const n=r.result||0;db.close();resolve(n)};
      r.onerror=()=>{db.close();resolve(0)};
    };
    req.onerror=()=>resolve(0);
  });
}

async function seedEmptyCorpus72(){
  const n=await countWorks72();
  if(n>0)return {seeded:0,skipped:true};
  try{
    const res=await fetch('./corpus_seed.json',{cache:'no-store'});
    if(!res.ok)return {seeded:0,error:'corpus_seed.json niet bereikbaar'};
    const seed=await res.json();
    if(seed.scriptorium_corpus_seed!==1||!Array.isArray(seed.works))return {seeded:0,error:'ongeldige corpusseed'};
    for(const sw of seed.works){
      await idbPut('works',{...sw,created_at:sw.created_at||Date.now(),updated_at:sw.updated_at||Date.now()});
    }
    await loadWorks();
    return {seeded:seed.works.length};
  }catch(e){return {seeded:0,error:e.message}}
}

function installLazyPageRendering72(){
  if(document.documentElement.dataset.v72lazy==='1')return;
  document.documentElement.dataset.v72lazy='1';
  document.addEventListener('click',e=>{
    const b=e.target.closest('[data-page],[data-go]');if(!b)return;
    const page=b.dataset.page||b.dataset.go;
    setTimeout(()=>{
      try{
        if(page==='corpus')renderCorpus();
        else if(page==='exchange')renderCorpusExport();
        else if(page==='progress'){if(window.renderV6Progress)window.renderV6Progress();renderProgress()}
        else if(page==='atelier')renderLessons();
        else if(page==='training')renderTraining();
        else if(page==='sources'&&window.renderSourceLibrary)window.renderSourceLibrary();
        else if(page==='settings')renderStorage();
      }catch(err){console.error('lazy page render',page,err)}
    },0);
  },true);
}

function installMemoryBadge72(compact){
  const home=document.getElementById('page-dashboard');
  if(!home||document.getElementById('v72MemoryCard'))return;
  const card=document.createElement('div');
  card.id='v72MemoryCard';card.className='callout good';card.style.marginTop='12px';
  card.innerHTML=`<strong>⚡ V7.2 veilige start actief</strong><div class="tiny" style="margin-top:5px">Verborgen pagina's worden pas gerenderd wanneer je ze opent. Oude compatibiliteitslagen worden niet meer tijdens de start uitgevoerd.${compact.changed?` Lokale dubbele analysedata opgeschoond in ${compact.changed} werk(en).`:''}</div>`;
  const hero=home.querySelector('.hero');if(hero)hero.insertAdjacentElement('afterend',card);else home.prepend(card);
}

async function safeInit72(){
  brand72();
  bootStatus('Scriptorium V7.2 ruimt oude lokale analyseduplicaten op…','warn');
  const compact=await compactLocalDatabase72();
  if(compact.error)console.warn('V7.2 compact',compact.error);

  bootStatus('Scriptorium V7.2 opent de lokale database…','warn');

  const cleanInit=window.SCRIPTORIUM_V6_INIT;
  if(typeof cleanInit!=='function')throw new Error('De veilige basisinitialisatie ontbreekt.');
  await cleanInit();

  const seeded=await seedEmptyCorpus72();
  if(seeded.seeded)console.info(`V7.2 seeded ${seeded.seeded} works for empty profile.`);

  if(typeof window.SCRIPTORIUM_V7_MODERNIZE==='function')await window.SCRIPTORIUM_V7_MODERNIZE();
  if(typeof window.SCRIPTORIUM_V71_ENHANCE==='function')await window.SCRIPTORIUM_V71_ENHANCE();

  brand72();installLazyPageRendering72();installMemoryBadge72(compact);

  if(PID&&window.AthSync?.cfg?.(PID)?.enabled)window.AthSync.startAuto(PID);
  clearBoot72();
}

window.init=async function(){
  try{await safeInit72()}
  catch(e){
    console.error('Scriptorium V7.2 safe boot failed',e);
    bootStatus('Scriptorium kon niet veilig starten: '+(e.message||String(e)),'bad');
  }
};
})();
