(function(){
'use strict';

const PREV_INIT=window.init;
const PREV_SHOW=window.showPage;
const PREV_RENDER_CORPUS=window.renderCorpus;
const VERSION='7.1';
const PID=window.ATH_PROFILE_ID||localStorage.getItem('athenaeum_current_profile')||'';

const $1=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

function toast71(msg,kind='good'){
  if(window.toast)return window.toast(msg,kind);
  console.log(msg);
}
function profile(){
  try{return (window.AthStore?.loadProfiles?.()||[]).find(p=>p.id===PID)||null}catch{return null}
}
function athCfg(){try{return window.AthSync?.cfg?.(PID)||null}catch{return null}}
async function athToken(){return window.AthSync?.access?.(PID)}

function brand71(){
  document.title='Scriptorium V7.1 — Academische Onderzoekscoach';
  document.querySelectorAll('.version-pill').forEach(x=>x.textContent='V7.1');
  const sm=document.querySelector('.brand small');
  if(sm)sm.textContent='V7.1 · onderzoek · corpus · H5P · gedeelde bibliotheek · incrementele sync';
  const sub=document.querySelector('.topbar-sub');
  if(sub)sub.textContent='Scriptorium V7.1 · stabiele multi-device onderzoekscoach';
}

/* ---------- pre-init compaction: prevents old duplicated analysis ranges loading into RAM ---------- */
function dedupeRanges(arr){
  if(!Array.isArray(arr))return [];
  const seen=new Set(),out=[];
  for(const x of arr){
    const key=(x&&typeof x==='object')?`${x.start??''}|${x.end??''}`:JSON.stringify(x);
    if(seen.has(key))continue;
    seen.add(key);out.push(x);
  }
  return out;
}
async function compactLocalBeforeInit(){
  if(!PID||!('indexedDB' in window))return {changed:0};
  return await new Promise((resolve)=>{
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
      let changed=0;
      const cur=store.openCursor();
      cur.onsuccess=e=>{
        const c=e.target.result;if(!c)return;
        const w=c.value||{};
        const a=dedupeRanges(w.analysis_ranges||[]);
        const p=dedupeRanges(w.pending_ranges||[]);
        if(a.length!==(w.analysis_ranges||[]).length||p.length!==(w.pending_ranges||[]).length){
          w.analysis_ranges=a;w.pending_ranges=p;
          c.update(w);changed++;
        }
        c.continue();
      };
      tx.oncomplete=()=>{db.close();resolve({changed})};
      tx.onerror=()=>{db.close();resolve({changed,error:String(tx.error||'')})};
    };
  });
}

/* ---------- central Athenaeum sync card ---------- */
function installCentralSyncCard(){
  const settings=document.getElementById('page-settings');
  if(!settings||document.getElementById('v71CentralSync'))return;

  // Hide legacy Supabase credentials block if it was moved into settings by V7.
  const legacy=document.getElementById('v7SyncSettings');
  if(legacy)legacy.style.display='none';

  const c=athCfg();
  const card=document.createElement('div');
  card.className='card';
  card.id='v71CentralSync';
  card.innerHTML=`
    <div class="spread"><div><h3>☁️ Athenaeum synchronisatie</h3>
    <p>Scriptorium gebruikt uitsluitend de centrale split-sync van Athenaeum. De oude V6-volledige corpus-sync is uitgeschakeld.</p></div>
    <span class="badge good">multi-device veilig</span></div>
    <div class="v71-sync-grid">
      <div><span>Account</span><strong>${esc(c?.user?.email||c?.email||'niet aangemeld')}</strong></div>
      <div><span>Profieldata</span><strong>${c?.last_sync?new Date(c.last_sync).toLocaleString('nl-BE'):'nog niet'}</strong></div>
      <div><span>Scriptorium</span><strong>${c?.last_scriptorium_sync?new Date(c.last_scriptorium_sync).toLocaleString('nl-BE'):'nog niet'}</strong></div>
    </div>
    <div class="row" style="margin-top:12px">
      <button class="btn primary" id="v71SyncAll">Alles synchroniseren</button>
      <button class="btn" id="v71SyncScript">Alleen Scriptorium</button>
      <a class="btn" href="../../index.html?resume=1&profile=${encodeURIComponent(PID)}&page=settings">Athenaeum-instellingen</a>
    </div>
    <div class="tiny" id="v71SyncStatus" style="margin-top:8px">Per werk synchroniseren voorkomt opnieuw een volledige corpusdump in het browsergeheugen.</div>`;
  settings.prepend(card);

  card.querySelector('#v71SyncAll').onclick=async()=>{
    const s=card.querySelector('#v71SyncStatus');
    try{s.textContent='Synchroniseren…';await window.AthSync.syncAll(PID);s.textContent='✅ Athenaeum + Scriptorium zijn bijgewerkt.'}
    catch(e){s.textContent='⚠️ '+e.message}
  };
  card.querySelector('#v71SyncScript').onclick=async()=>{
    const s=card.querySelector('#v71SyncStatus');
    try{s.textContent='Scriptorium incrementeel synchroniseren…';const r=await window.AthSync.syncScriptorium(PID);s.textContent=`✅ Scriptorium: ↓${r.downloaded||0} ↑${r.uploaded||0}`;}
    catch(e){s.textContent='⚠️ '+e.message}
  };
}

/* ---------- H5P ---------- */
async function h5pState(){
  try{
    const rec=await window.idbGet('settings','v71_h5p_exercises');
    return rec?.value||{items:[],activity:{}};
  }catch{return {items:[],activity:{}}}
}
async function saveH5P(st){
  st.updated_at=Date.now();
  await window.idbPut('settings',{key:'v71_h5p_exercises',value:st,updated_at:Date.now()});
}
function parseH5PInput(raw){
  const text=String(raw||'').trim();
  if(!text)throw new Error('Plak een H5P iframe-code of URL.');
  let src=text;
  if(text.includes('<')){
    const d=new DOMParser().parseFromString(text,'text/html');
    const iframe=d.querySelector('iframe');
    if(!iframe?.getAttribute('src'))throw new Error('Geen geldige H5P iframe-src gevonden.');
    src=iframe.getAttribute('src').trim();
  }
  let u;
  try{u=new URL(src,location.href)}catch{throw new Error('De H5P-URL is ongeldig.')}
  if(!['http:','https:'].includes(u.protocol))throw new Error('Alleen http(s)-H5P bronnen zijn toegestaan.');
  return u.href;
}
function h5pModal(){
  let modal=document.getElementById('v71H5PModal');
  if(modal)return modal;
  modal=document.createElement('div');
  modal.className='modal';
  modal.id='v71H5PModal';
  modal.innerHTML=`<div class="modal-box large v71-h5p-modal"><div class="modal-head">
    <div><h3 id="v71H5PTitle">H5P-oefening</h3><div class="tiny" id="v71H5PStatus"></div></div>
    <button class="close" id="v71H5PClose">×</button></div>
    <div class="v71-h5p-frame-wrap"><iframe id="v71H5PFrame" title="H5P oefening" allowfullscreen
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"></iframe></div>
    <div class="row" style="margin-top:12px"><button class="btn primary" id="v71H5PComplete">Markeer voltooid</button>
    <button class="btn" id="v71H5POpen">Open in nieuw tabblad</button></div></div>`;
  document.body.appendChild(modal);
  modal.querySelector('#v71H5PClose').onclick=()=>modal.classList.remove('open');
  modal.addEventListener('click',e=>{if(e.target===modal)modal.classList.remove('open')});
  return modal;
}
async function launchH5P(id){
  const st=await h5pState(),item=st.items.find(x=>x.id===id);if(!item)return;
  const modal=h5pModal(),frame=modal.querySelector('#v71H5PFrame'),status=modal.querySelector('#v71H5PStatus');
  modal.querySelector('#v71H5PTitle').textContent=item.title||'H5P-oefening';
  frame.src=item.url;
  status.textContent='Laden…';
  modal.classList.add('open');
  modal.querySelector('#v71H5POpen').onclick=()=>window.open(item.url,'_blank','noopener');
  modal.querySelector('#v71H5PComplete').onclick=async()=>{
    const s=await h5pState();s.activity[id]={...(s.activity[id]||{}),completed:true,completed_at:Date.now(),manual:true};await saveH5P(s);
    status.textContent='✅ Voltooid opgeslagen.';renderH5PList();
  };
  frame.onload=()=>{
    let captured=false;
    try{
      const child=frame.contentWindow;
      const H=child?.H5P;
      if(H?.externalDispatcher){
        H.externalDispatcher.on('xAPI',async ev=>{
          const statement=ev?.data?.statement||{};
          const result=statement.result||{};
          const verb=statement.verb?.id||'';
          const s=await h5pState();
          s.activity[id]={
            ...(s.activity[id]||{}),
            last_xapi_at:Date.now(),
            verb,
            score:result.score||s.activity[id]?.score||null,
            success:result.success??s.activity[id]?.success??null,
            completed:result.completion===true||/completed|passed/.test(verb)||s.activity[id]?.completed||false
          };
          await saveH5P(s);renderH5PList();
        });
        captured=true;
      }
    }catch{}
    status.textContent=captured
      ?'xAPI gekoppeld: voltooiing/score kan lokaal worden opgeslagen.'
      :'Externe H5P-embed: browserisolatie verhindert automatische score-uitlezing. Gebruik “Markeer voltooid” of host H5P same-origin.';
  };
}
async function renderH5PList(){
  const box=document.getElementById('v71H5PList');if(!box)return;
  const st=await h5pState();
  box.innerHTML=st.items.length?st.items.map(x=>{
    const a=st.activity[x.id]||{};
    const score=a.score?.scaled!=null?`${Math.round(a.score.scaled*100)}%`:a.score?.raw!=null?String(a.score.raw):'';
    return `<article class="v71-h5p-item"><div><strong>${esc(x.title||'H5P-oefening')}</strong>
      <div class="tiny">${a.completed?'✅ voltooid':'nog open'}${score?' · score '+esc(score):''}</div></div>
      <div class="row"><button class="btn small" data-h5p-open="${esc(x.id)}">Open</button>
      <button class="btn small danger" data-h5p-del="${esc(x.id)}">Verwijder</button></div></article>`
  }).join(''):'<div class="empty">Nog geen H5P-oefeningen toegevoegd.</div>';
  box.querySelectorAll('[data-h5p-open]').forEach(b=>b.onclick=()=>launchH5P(b.dataset.h5pOpen));
  box.querySelectorAll('[data-h5p-del]').forEach(b=>b.onclick=async()=>{
    const s=await h5pState();s.items=s.items.filter(x=>x.id!==b.dataset.h5pDel);delete s.activity[b.dataset.h5pDel];await saveH5P(s);renderH5PList();
  });
}
function installH5P(){
  const page=document.getElementById('page-training');
  if(!page||document.getElementById('v71H5PCard'))return;
  const card=document.createElement('div');
  card.id='v71H5PCard';
  card.className='card v71-h5p-card';
  card.innerHTML=`<div class="spread"><div><h4>🧩 H5P interactieve oefeningen</h4>
    <p class="tiny">Voeg een H5P iframe-code of URL toe. Scriptorium injecteert nooit willekeurige embed-code: alleen de iframe-URL wordt opgeslagen.</p></div>
    <span class="badge accent">aanvullend op native training</span></div>
    <div class="form-grid" style="margin-top:12px"><div class="field"><label>Titel<input id="v71H5PName" placeholder="bv. Epigrafische bronkritiek"></label></div>
    <div class="field"><label>H5P iframe-code of URL<textarea id="v71H5PCode" placeholder='<iframe src="https://…"></iframe>'></textarea></label></div></div>
    <div class="row"><button class="btn primary" id="v71H5PAdd">H5P toevoegen</button></div>
    <div class="callout" style="margin-top:12px"><strong>Wanneer H5P?</strong> Goed voor meerkeuze, slepen, hotspots, invulvragen, interactieve video en korte retrieval. De bestaande Scriptorium-training blijft beter voor open historische redenering, bronkritiek, onderzoeksopzet en lange antwoorden.</div>
    <div id="v71H5PList" style="margin-top:12px"></div>`;
  const launch=page.querySelector('.training-launch-card');
  if(launch)launch.insertAdjacentElement('afterend',card);else page.appendChild(card);
  card.querySelector('#v71H5PAdd').onclick=async()=>{
    try{
      const url=parseH5PInput(card.querySelector('#v71H5PCode').value);
      const st=await h5pState();
      st.items.push({id:'h5p_'+Date.now().toString(36)+Math.random().toString(36).slice(2,7),title:card.querySelector('#v71H5PName').value.trim()||'H5P-oefening',url,created_at:Date.now(),updated_at:Date.now()});
      await saveH5P(st);card.querySelector('#v71H5PName').value='';card.querySelector('#v71H5PCode').value='';renderH5PList();toast71('H5P-oefening toegevoegd.','good');
    }catch(e){toast71(e.message,'bad')}
  };
  renderH5PList();
}

/* ---------- shared friend catalog: metadata only ---------- */
async function sharedRequest(path,opt={}){
  if(!window.AthSync)throw new Error('Athenaeum sync is niet beschikbaar.');
  const token=await athToken();
  return window.AthSync.request(PID,path,{...opt,headers:{Authorization:`Bearer ${token}`,...(opt.headers||{})}});
}
function shareableMeta(w){
  return {
    title:w.title||'',author:w.author||'',institution:w.institution||'',year:w.year||'',
    document_type:w.document_type||'',field:w.field||'',page_count:w.page_count||null,
    filename:w.filename||'',file_size:w.file_size||0,source_url:w.source_url||'',
    rug01:w.rug01||'',provenance_category:w.provenance_category||'',origin:w.origin||'upload'
  };
}
async function publishWork(w){
  const c=athCfg();if(!c?.user?.id)throw new Error('Meld eerst aan via Athenaeum.');
  const p=profile();
  await sharedRequest('/rest/v1/athenaeum_scriptorium_shared_catalog?on_conflict=owner_id,item_id',{
    method:'POST',
    headers:{Prefer:'resolution=merge-duplicates,return=minimal'},
    body:JSON.stringify({owner_id:c.user.id,item_id:String(w.id),owner_label:p?.name||'Athenaeum-gebruiker',metadata:shareableMeta(w),updated_at:new Date().toISOString()})
  });
}
async function unpublishWork(id){
  const c=athCfg();if(!c?.user?.id)return;
  await sharedRequest(`/rest/v1/athenaeum_scriptorium_shared_catalog?owner_id=eq.${encodeURIComponent(c.user.id)}&item_id=eq.${encodeURIComponent(id)}`,{method:'DELETE'});
}
async function loadShared(){
  const c=athCfg();if(!c?.user?.id)return {mine:new Set(),others:[]};
  const rows=await sharedRequest('/rest/v1/athenaeum_scriptorium_shared_catalog?select=owner_id,item_id,owner_label,metadata,updated_at&order=updated_at.desc');
  const mine=new Set(),others=[];
  for(const r of rows||[]){
    if(r.owner_id===c.user.id)mine.add(String(r.item_id));else others.push(r);
  }
  return {mine,others};
}
async function importShared(row){
  const m=row.metadata||{};
  const existing=(window.state?.works||[]).find(w=>w.shared_catalog_key===`${row.owner_id}:${row.item_id}`||(
    w.title===m.title&&w.author===m.author&&String(w.year||'')===String(m.year||'')
  ));
  if(existing){toast71('Dit gedeelde werk staat al in je corpus.','warn');return}
  const w={
    id:window.uid?uid():'shared_'+Date.now().toString(36),
    filename:`(gedeeld door ${row.owner_label||'vriend'} — PDF niet lokaal)`,
    file_size:0,title:m.title||'Gedeeld werk',author:m.author||'',institution:m.institution||'',
    year:m.year||'',document_type:m.document_type||'Gedeeld werk',field:m.field||'',
    rug01:m.rug01||'',page_count:m.page_count||null,weight:'onbekend',
    origin:'shared_catalog',provenance_category:'user_added',source_url:m.source_url||'',
    notes:`Metadata gedeeld door ${row.owner_label||'een Athenaeum-gebruiker'}. Het PDF-bestand zelf is niet automatisch gedeeld.`,
    analysis:null,analysis_ranges:[],shared_catalog_key:`${row.owner_id}:${row.item_id}`,
    created_at:Date.now(),updated_at:Date.now()
  };
  await idbPut('works',w);await loadWorks();toast71('Gedeelde metadata aan je corpus toegevoegd.','good');
}
async function renderSharedCatalog(){
  const box=document.getElementById('v71SharedList');if(!box)return;
  try{
    const {others}=await loadShared();
    box.innerHTML=others.length?others.map((r,i)=>{
      const m=r.metadata||{};
      return `<article class="v71-shared-item"><div><span class="badge">gedeeld door ${esc(r.owner_label||'vriend')}</span>
        <strong>${esc(m.title||m.filename||'Gedeeld werk')}</strong>
        <div class="tiny">${esc(m.author||'Auteur onbekend')}${m.year?' · '+esc(m.year):''}${m.page_count?' · '+esc(m.page_count)+' p.':''}</div>
        <div class="tiny">${m.source_url?'Publieke bronlink beschikbaar':'PDF-bestand blijft lokaal bij de eigenaar'}</div></div>
        <div class="row">${m.source_url?`<a class="btn small" target="_blank" rel="noopener" href="${esc(m.source_url)}">Bron openen</a>`:''}
        <button class="btn small primary" data-shared-import="${i}">Metadata importeren</button></div>
        <script type="application/json" id="v71shared_${i}">${JSON.stringify(r).replace(/</g,'\\u003c')}<\/script></article>`
    }).join(''):'<div class="empty">Nog niets door andere Athenaeum-gebruikers gedeeld.</div>';
    box.querySelectorAll('[data-shared-import]').forEach(b=>b.onclick=()=>{
      const r=JSON.parse(document.getElementById('v71shared_'+b.dataset.sharedImport).textContent);importShared(r);
    });
  }catch(e){
    box.innerHTML=`<div class="callout warn">Gedeelde bibliotheek kon niet laden: ${esc(e.message)}</div>`;
  }
}
function installSharedCatalog(){
  const page=document.getElementById('page-corpus');if(!page||document.getElementById('v71SharedCard'))return;
  const card=document.createElement('div');card.className='card v71-shared-card';card.id='v71SharedCard';
  card.innerHTML=`<div class="spread"><div><h4>👥 Gedeelde bibliotheek</h4>
    <p class="tiny">Je kunt metadata van een werk met andere aangemelde Athenaeum-gebruikers delen. PDF-bytes, persoonlijke notities en analyses worden niet automatisch gedeeld.</p></div>
    <button class="btn small" id="v71RefreshShared">Vernieuwen</button></div>
    <label class="v71-share-toggle"><input type="checkbox" id="v71AutoShare"> Deel metadata van nieuwe PDF's automatisch met mijn Athenaeum-groep</label>
    <div id="v71SharedList" style="margin-top:12px"></div>`;
  const firstCard=page.querySelector('.card');if(firstCard)firstCard.insertAdjacentElement('beforebegin',card);else page.appendChild(card);
  const key=`v71_auto_share_${PID}`;
  card.querySelector('#v71AutoShare').checked=localStorage.getItem(key)==='1';
  card.querySelector('#v71AutoShare').onchange=e=>localStorage.setItem(key,e.target.checked?'1':'0');
  card.querySelector('#v71RefreshShared').onclick=renderSharedCatalog;
  renderSharedCatalog();
}
async function patchShareButtons(){
  const c=athCfg();if(!c?.user?.id)return;
  let mine=new Set();
  try{mine=(await loadShared()).mine}catch{}
  document.querySelectorAll('#corpusTable tbody tr').forEach(tr=>{
    if(tr.querySelector('.v71-share-btn'))return;
    const open=tr.querySelector('button[onclick^="openDetail"]');
    const m=open?.getAttribute('onclick')?.match(/openDetail\('([^']+)'\)/);
    if(!m)return;
    const w=(window.state?.works||[]).find(x=>String(x.id)===String(m[1]));if(!w)return;
    const row=tr.querySelector('td:last-child .row')||tr.querySelector('td:last-child');if(!row)return;
    const b=document.createElement('button');b.className='btn small v71-share-btn';
    const shared=mine.has(String(w.id));b.textContent=shared?'Stop delen':'Deel metadata';
    b.onclick=async()=>{
      try{
        if(shared){await unpublishWork(w.id);toast71('Werk niet langer gedeeld.','good')}
        else{await publishWork(w);toast71('Metadata gedeeld met Athenaeum-vrienden.','good')}
        await renderSharedCatalog();window.renderCorpus();
      }catch(e){toast71(e.message,'bad')}
    };
    row.appendChild(b);
    if(w.origin==='shared_catalog'){
      const title=tr.querySelector('.title-cell');
      if(title&&!title.querySelector('.v71-friend-badge'))title.insertAdjacentHTML('beforeend','<span class="v7-prov v71-friend-badge">Via vriend gedeeld</span>');
    }
  });
}

/* Auto-share newly added PDF metadata only if user explicitly opted in. */
const PREV_ADD_PDF=window.addPDF;
if(PREV_ADD_PDF){
  window.addPDF=async function(file){
    const before=new Set((window.state?.works||[]).map(w=>w.id));
    const r=await PREV_ADD_PDF(file);
    if(localStorage.getItem(`v71_auto_share_${PID}`)==='1'){
      const w=(window.state?.works||[]).find(x=>!before.has(x.id)) || null;
      if(w)publishWork(w).catch(e=>console.warn('auto share',e));
    }
    return r;
  };
}

/* Explicit grid placement fixes zoom / CSS-width edge cases that put main below sidebar. */
function enforceDeviceGrid(){
  const body=document.body,app=document.querySelector('.app'),side=document.querySelector('.sidebar'),main=document.querySelector('.app>main');
  if(!body||!app||!side||!main)return;
  if(body.classList.contains('device-desktop')||body.classList.contains('device-tablet')){
    side.style.gridColumn='1';side.style.gridRow='1';
    main.style.gridColumn='2';main.style.gridRow='1';
  }else{
    side.style.removeProperty('grid-column');side.style.removeProperty('grid-row');
    main.style.removeProperty('grid-column');main.style.removeProperty('grid-row');
  }
}

window.renderCorpus=function(){
  const r=PREV_RENDER_CORPUS?PREV_RENDER_CORPUS():undefined;
  setTimeout(patchShareButtons,0);
  return r;
};
window.showPage=function(name,opts={}){
  const r=PREV_SHOW?PREV_SHOW(name,opts):undefined;
  if(name==='training')setTimeout(()=>{installH5P();renderH5PList()},0);
  if(name==='corpus')setTimeout(()=>{installSharedCatalog();renderSharedCatalog();patchShareButtons()},0);
  if(name==='settings')setTimeout(installCentralSyncCard,0);
  return r;
};

window.init=async function(){
  brand71();
  const compact=await compactLocalBeforeInit();
  if(compact.changed)console.info(`Scriptorium V7.1 compacted ${compact.changed} local work records before load.`);
  await PREV_INIT();
  brand71();
  installCentralSyncCard();
  installH5P();
  installSharedCatalog();
  enforceDeviceGrid();
  addEventListener('resize',enforceDeviceGrid,{passive:true});
  window.visualViewport?.addEventListener('resize',enforceDeviceGrid,{passive:true});
  setTimeout(()=>{patchShareButtons();renderSharedCatalog()},120);
};

})();
