(function(){
'use strict';
const PID=window.ATH_PROFILE_ID||localStorage.getItem('athenaeum_current_profile')||'';

function brand74(){
  document.title='Scriptorium V7.4 — Fast Boot + AI-docent';
  document.querySelectorAll('.version-pill').forEach(x=>x.textContent='V7.4');
  const sm=document.querySelector('.brand small');if(sm)sm.textContent='V7.4 · fast boot · AI-docent · incrementele sync · H5P';
  const sub=document.querySelector('.topbar-sub');if(sub)sub.textContent='Scriptorium V7.4 · zware onderdelen pas laden wanneer je ze gebruikt';
}
function aiSettingsHtml(s){
  const q=s?.quota||{},used=q.deep_used||0,limit=q.deep_limit||10,rem=q.deep_remaining??Math.max(0,limit-used),pct=limit?Math.round(used/limit*100):0,p=s?.provider;
  return `<div class="card v74-ai-card"><div class="spread"><div><h4>🧑‍🏫 AI-docent connectie</h4><p>Geen chatbot: alleen feedback op eigen antwoorden en tekstfragmenten.</p></div><span class="v74-ai-led ${p?.reachable===false?'bad':'ok'}">${p?.reachable===false?'storing':'verbonden'}</span></div>
    <div class="v74-quota"><div class="spread"><strong>Scriptorium vandaag</strong><span><b>${rem}</b> van ${limit} diepe beoordelingen over</span></div><div class="v74-meter"><i style="width:${pct}%"></i></div></div>
    <div class="grid two" style="margin-top:12px"><div class="callout"><strong>Model</strong><div class="tiny">${esc3(s?.models?.scriptorium||'openai/gpt-oss-120b')}</div></div><div class="callout"><strong>Laatste gebruik</strong><div class="tiny">${q.last_request_at?new Date(q.last_request_at).toLocaleString('nl-BE'):'nog geen vandaag'}</div></div></div>
    <div class="row" style="margin-top:12px"><button class="btn primary" id="v74AiRefresh">Status verversen</button><button class="btn" id="v74AiReconnect">Opnieuw verbinden</button></div><div class="tiny" id="v74AiDetail" style="margin-top:8px">${p?.latency_ms!=null?'Groq '+p.latency_ms+' ms · ':''}dagbudget reset dagelijks (UTC).</div></div>`;
}
async function refreshAi74(probe=false){
  const host=document.getElementById('v74AiHost');if(!host)return;
  host.innerHTML='<div class="card"><div class="empty">AI-status controleren…</div></div>';
  try{
    const s=probe?await AthAI.health(PID,true):await AthAI.status(PID);
    host.innerHTML=aiSettingsHtml(s);
    document.getElementById('v74AiRefresh').onclick=()=>refreshAi74(true);
    document.getElementById('v74AiReconnect').onclick=async()=>{try{host.innerHTML='<div class="card"><div class="empty">Sessietoken vernieuwen en AI opnieuw verbinden…</div></div>';await AthAI.reconnect(PID);refreshAi74(true)}catch(e){host.innerHTML=`<div class="callout bad">${esc3(e.message)}</div>`}};
  }catch(e){
    host.innerHTML=`<div class="card v74-ai-card"><span class="v74-ai-led bad">niet verbonden</span><p>${esc3(e.message)}</p><button class="btn" id="v74AiReconnect">Opnieuw verbinden</button></div>`;
    document.getElementById('v74AiReconnect').onclick=()=>refreshAi74(true);
  }
}
function installSettings74(){
  const page=document.getElementById('page-settings');if(!page||document.getElementById('v74AiHost'))return;
  const hero=page.querySelector('.hero');
  const block=document.createElement('div');block.id='v74AiHost';block.style.marginTop='14px';
  hero?.insertAdjacentElement('afterend',block);
  const perf=document.createElement('div');perf.className='card';perf.style.marginTop='14px';perf.id='v74PerfCard';
  perf.innerHTML=`<div class="spread"><div><h4>⚡ Prestatiemodus V7.4</h4><p>PDF-lib en ZIP-code worden niet meer bij het openen geladen. De oude V7.2 database-cleanup blokkeert de start niet meer. Scriptorium-sync begint pas nadat de interface 45 seconden stabiel is.</p></div><span class="badge good">fast boot</span></div><div class="tiny">Handmatige “Alles synchroniseren” blijft onmiddellijk beschikbaar via Instellingen.</div>`;
  block.insertAdjacentElement('afterend',perf);
  refreshAi74(false);
}
function safeInit74(){
  return (async()=>{
    brand74();
    const clean=window.SCRIPTORIUM_V6_INIT;
    if(typeof clean!=='function')throw new Error('Scriptorium basisinitialisatie ontbreekt.');
    // Direct core init: bypasses V6.3–V7.2 startup wrappers and their old cleanup passes.
    await clean();
    if(typeof window.SCRIPTORIUM_V7_MODERNIZE==='function')await window.SCRIPTORIUM_V7_MODERNIZE();
    if(typeof window.SCRIPTORIUM_V71_ENHANCE==='function')await window.SCRIPTORIUM_V71_ENHANCE();
    if(typeof window.SCRIPTORIUM_V73_ENHANCE==='function')window.SCRIPTORIUM_V73_ENHANCE();
    brand74();installSettings74();
    if(PID&&window.AthSync?.cfg?.(PID)?.enabled)window.AthSync.startAuto(PID,{scriptorium:true});
    document.addEventListener('click',e=>{const n=e.target.closest('[data-page],[data-go]');if(n?.dataset?.page==='settings'||n?.dataset?.go==='settings')setTimeout(()=>{installSettings74();refreshAi74(false)},0)},true);
  })();
}
window.init=async function(){
  try{await safeInit74()}
  catch(e){console.error('V7.4 boot',e);const n=document.getElementById('bootNotice');if(n){n.hidden=false;n.className='boot-notice bad';n.textContent='Scriptorium kon niet starten: '+(e.message||e)}}
};
})();
