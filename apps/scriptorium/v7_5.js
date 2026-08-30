(function(){
'use strict';
const PID=window.ATH_PROFILE_ID||localStorage.getItem('athenaeum_current_profile')||'';
const CLEAN_INIT=window.SCRIPTORIUM_V6_INIT;
let lessonCache=null,lessonCachePromise=null;
const fullCache=new Map();

function brand75(){
  document.title='Scriptorium V7.5 — Productiestabiel';
  document.querySelectorAll('.version-pill').forEach(x=>x.textContent='V7.5');
  const sm=document.querySelector('.brand small');if(sm)sm.textContent='V7.5 · productiestabiel · AI-docent · incrementele sync · H5P';
  const sub=document.querySelector('.topbar-sub');if(sub)sub.textContent='Scriptorium V7.5 · metadata-first: zware analyses alleen laden wanneer nodig';
}
function esc75(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function storeCount(name){return new Promise((res,rej)=>{try{const r=tx(name).count();r.onsuccess=()=>res(r.result||0);r.onerror=()=>rej(r.error)}catch(e){rej(e)}})}
function storeKeys(name){return new Promise((res,rej)=>{try{const r=tx(name).getAllKeys();r.onsuccess=()=>res(r.result||[]);r.onerror=()=>rej(r.error)}catch(e){rej(e)}})}
function legacyKeys(ldb,name){return new Promise((res,rej)=>{if(!ldb.objectStoreNames.contains(name))return res([]);const r=ldb.transaction(name).objectStore(name).getAllKeys();r.onsuccess=()=>res(r.result||[]);r.onerror=()=>rej(r.error)})}
function legacyGet(ldb,name,key){return new Promise((res,rej)=>{const r=ldb.transaction(name).objectStore(name).get(key);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}

function metaWork(w){
  const m={};
  for(const k in (w||{})) if(k!=='analysis') m[k]=w[k];
  const a=w?.analysis;
  m.has_analysis=!!(a&&typeof a==='object'&&Object.keys(a).length);
  return m;
}
async function scanWorkMetadata(){
  return new Promise((resolve,reject)=>{
    const out=[];let req;
    try{req=tx('works').openCursor()}catch(e){reject(e);return}
    req.onerror=()=>reject(req.error);
    req.onsuccess=e=>{const c=e.target.result;if(!c){resolve(out);return}out.push(metaWork(c.value));c.continue()};
  });
}
async function fullWork(id){
  if(fullCache.has(String(id))){const v=fullCache.get(String(id));fullCache.delete(String(id));fullCache.set(String(id),v);return v}
  const w=await idbGet('works',id);if(!w)return null;
  fullCache.set(String(id),w);while(fullCache.size>2)fullCache.delete(fullCache.keys().next().value);
  return w;
}
function clearFull(id){if(id!=null)fullCache.delete(String(id));else fullCache.clear()}

async function migrateLegacy75(){
  if(!window.ATH_PROFILE_ID||SCRIPTORIUM_DB_NAME==='ScriptoriumDB')return;
  if(await storeCount('works'))return;
  try{
    const ldb=await legacyOpen();
    for(const name of ['works','settings','files']){
      const keys=await legacyKeys(ldb,name);
      for(const key of keys){const value=await legacyGet(ldb,name,key);if(value!=null)await idbPut(name,value)}
    }
    ldb.close();
    if(await storeCount('works'))toast('Bestaande Scriptorium-data veilig aan dit profiel gekoppeld.','good');
  }catch(e){console.warn('Veilige legacy-migratie overgeslagen',e)}
}

async function loadWorks75(){
  state.works=(await scanWorkMetadata()).sort((a,b)=>(b.updated_at||0)-(a.updated_at||0));
  clearFull();lessonCache=null;lessonCachePromise=null;
  renderStats();renderRecent();renderSelects75();
  if(document.querySelector('#page-corpus')?.classList.contains('active'))renderCorpus();
  if(document.querySelector('#page-progress')?.classList.contains('active'))renderProgress();
  if(document.querySelector('#page-exchange')?.classList.contains('active'))renderCorpusExport();
  if(document.querySelector('#page-training')?.classList.contains('active'))renderTraining();
  renderStorage();
}
function renderSelects75(){
  const el=document.getElementById('benchmarkWorks');if(!el)return;
  el.innerHTML=state.works.filter(w=>w.has_analysis).map(w=>`<option value="${esc75(w.id)}">${esc75(w.title||w.filename)} · ${esc75(w.weight||'onbekend')}</option>`).join('');
}
function dedupe75(arr=[]){
  if(!Array.isArray(arr))return [];
  const seen=new Set(),out=[];
  for(const x of arr){let k;try{k=JSON.stringify(x)}catch{k=String(x)}if(seen.has(k))continue;seen.add(k);out.push(x)}
  return out;
}
function mergeAnalysis75(oldA,newA){
  if(!oldA||!Object.keys(oldA).length)return newA;
  const out={...oldA,...newA},keys=['primary_sources','secondary_literature','source_criticism','argument_structure','writing_techniques','research_techniques','skill_lessons','lessons_for_user','anti_patterns','weaknesses'];
  for(const k of keys)out[k]=dedupe75([...(oldA[k]||[]),...(newA[k]||[])]);
  out.analysis_scope={page_start:Math.min(oldA.analysis_scope?.page_start||Infinity,newA.analysis_scope?.page_start||Infinity),page_end:Math.max(oldA.analysis_scope?.page_end||0,newA.analysis_scope?.page_end||0),complete_work:Boolean(oldA.analysis_scope?.complete_work||newA.analysis_scope?.complete_work)};
  return out;
}

async function openDetail75(id){
  const w=await fullWork(id);if(!w)return toast('Werk kon niet worden geladen.','bad');
  state.currentWork=w;$('#detailTitle').textContent=w.title||w.filename;const a=w.analysis||{};
  const meta=`<div class="analysis-grid"><div class="analysis-block"><h5>Auteur</h5>${esc75(w.author||'Onbekend')}</div><div class="analysis-block"><h5>Instelling / jaar</h5>${esc75(w.institution||'Onbekend')} · ${esc75(w.year||'?')}</div><div class="analysis-block"><h5>Document</h5>${esc75(w.document_type||'')} · ${w.page_count||'?'} fysieke PDF-pagina's</div><div class="analysis-block"><h5>Brongewicht</h5>${weightHTML(w)} · ${esc75(w.field||'vakgebied onbekend')}</div>${w.rug01?`<div class="analysis-block"><h5>UGent catalogus</h5>RUG01-${esc75(w.rug01)}${w.source_url?` · <a href="${esc75(w.source_url)}" target="_blank" style="color:var(--accent)">open bron</a>`:''}</div>`:''}<div class="analysis-block"><h5>Analysevoortgang</h5>${coverage(w.analysis_ranges||[])}/${w.page_count||'?'} fysieke pagina's</div></div>`;
  const analysis=a&&Object.keys(a).length?renderAnalysis(a,w):'<div class="empty">Nog geen inhoudelijke analyse geïmporteerd.</div>';
  $('#detailBody').innerHTML=`<div class="tabs"><button class="active" data-tab="meta">Metadata</button><button data-tab="analysis">Analyse</button><button data-tab="notes">Notities</button></div><div id="tab-meta">${meta}<div class="row" style="margin-top:14px"><button class="btn" onclick="editWork('${esc75(w.id)}')">Metadata bewerken</button><button class="btn primary" onclick="goCorpusExport()">Naar corpusanalyse</button></div></div><div id="tab-analysis" style="display:none">${analysis}</div><div id="tab-notes" style="display:none"><div class="callout">${w.notes?esc75(w.notes):'Nog geen notities.'}</div></div>`;
  $$('#detailBody .tabs button').forEach(b=>b.onclick=()=>{$$('#detailBody .tabs button').forEach(x=>x.classList.remove('active'));b.classList.add('active');['meta','analysis','notes'].forEach(t=>$('#tab-'+t).style.display=t===b.dataset.tab?'block':'none')});openModal('detailModal');
}
async function saveEdit75(){
  const meta=state.currentWork;if(!meta)return;
  const w=(await fullWork(meta.id))||meta;
  Object.assign(w,{title:$('#eTitle').value.trim(),author:$('#eAuthor').value.trim(),institution:$('#eInstitution').value.trim(),year:$('#eYear').value.trim(),document_type:$('#eType').value.trim(),field:$('#eField').value.trim(),rug01:$('#eRug').value.trim(),weight:$('#eWeight').value,source_url:$('#eUrl').value.trim(),notes:$('#eNotes').value.trim(),updated_at:Date.now()});
  await idbPut('works',w);clearFull(w.id);closeModal('editModal');await loadWorks75();toast('Metadata opgeslagen.','good');
}

async function importAnalysis75(){
  let text=$('#analysisPaste').value.trim();const f=$('#analysisFile').files?.[0];if(f)text=await f.text();if(!text)return toast('Kies een JSON-bestand of plak JSON.','warn');
  let data;try{data=JSON.parse(text.replace(/^```json\s*/i,'').replace(/```\s*$/,''))}catch(e){return toast('Dit is geen geldige JSON: '+e.message,'bad')}
  if(data.schema_version===1)return importLegacyAnalysis75(data);if(data.schema_version===2)return importV2Analysis75(data);if(data.schema_version!==3||!Array.isArray(data.results))return toast('Onbekend formaat. Verwacht schema_version 3 met een results-array.','bad');
  const prepared=[],errors=[],warnings=[];
  for(const r of data.results){const m=state.works.find(x=>x.id===r.work_id);if(!m){errors.push(`Onbekende work_id ${r.work_id}`);continue}const ranges=(r.analyzed_ranges||[]).map(x=>({start:+x.start,end:+x.end})).filter(x=>x.start&&x.end&&x.start>=1&&x.end>=x.start);if(!ranges.length){warnings.push(`${m.title||m.filename}: geen analyzed_ranges`);continue}if(ranges.some(x=>x.end>(m.page_count||x.end))){errors.push(`${m.title||m.filename}: paginabereik buiten PDF`);continue}const findings=walkFindings(r),bad=findings.filter(x=>x.page<1||(m.page_count&&x.page>m.page_count)),noA=findings.filter(x=>!x.author),noC=findings.filter(x=>!x.confidence);if(bad.length||noA.length||noC.length)warnings.push(`${m.title||m.filename}: ${bad.length} ongeldige pagina, ${noA.length} zonder auteur, ${noC.length} zonder betrouwbaarheid`);prepared.push({m,r,ranges})}
  if(errors.length)return toast('Import gestopt: '+errors.slice(0,3).join(' | '),'bad');if(!prepared.length)return toast('Geen bruikbare v3-resultaten gevonden.','bad');
  if(warnings.length&&!confirm(`Er zijn validatiewaarschuwingen:\n\n${warnings.slice(0,8).join('\n')}\n\nToch importeren?`))return;
  for(const x of prepared){const w=await fullWork(x.m.id);if(!w)continue;w.analysis=mergeAnalysis75(w.analysis||{},x.r);w.analysis_ranges=dedupe75([...(w.analysis_ranges||[]),...x.ranges.map(q=>({start:q.start,end:q.end,imported_at:Date.now(),corpus_id:data.corpus_id||''}))]);if(x.r.complete_work&&w.page_count)w.analysis_ranges=dedupe75([...(w.analysis_ranges||[]),{start:1,end:w.page_count,imported_at:Date.now(),corpus_id:data.corpus_id||'',complete_marker:true}]);w.pending_ranges=[];w.updated_at=Date.now();await idbPut('works',w);clearFull(w.id)}
  $('#analysisPaste').value='';$('#analysisFile').value='';await loadWorks75();toast(`${prepared.length} werkresultaten geïmporteerd.`,'good');
}
async function importV2Analysis75(data){
  if(!Array.isArray(data.results))return toast('Ongeldig v2-resultaat.','bad');let n=0;
  for(const r of data.results){const m=state.works.find(x=>x.id===r.work_id),s=r.analysis_scope||{};if(!m||!s.page_start||!s.page_end)continue;const w=await fullWork(m.id);if(!w)continue;w.analysis=mergeAnalysis75(w.analysis||{},r);w.analysis_ranges=dedupe75([...(w.analysis_ranges||[]),{start:+s.page_start,end:+s.page_end,imported_at:Date.now(),batch_id:data.batch_id||'',legacy_v2:true}]);w.pending_ranges=(w.pending_ranges||[]).filter(p=>!(p.start===+s.page_start&&p.end===+s.page_end));w.updated_at=Date.now();await idbPut('works',w);clearFull(w.id);n++}
  await loadWorks75();toast(`${n} oude v2-onderdelen geïmporteerd.`,'good');
}
async function importLegacyAnalysis75(data){
  const m=state.works.find(x=>x.id===data.work_id);if(!m)return toast('work_id uit de oude analyse bestaat niet in dit corpus.','bad');const scope=data.analysis_scope||{},start=+scope.page_start,end=+scope.page_end;if(!start||!end||start<1||end<start||end>(m.page_count||end))return toast('analysis_scope bevat ongeldige fysieke paginanummers.','bad');const w=await fullWork(m.id);if(!w)return;
  w.analysis=mergeAnalysis75(w.analysis||{},data);w.analysis_ranges=dedupe75([...(w.analysis_ranges||[]),{start,end,imported_at:Date.now(),legacy:true}]);w.pending_ranges=(w.pending_ranges||[]).filter(p=>!(p.start===start&&p.end===end));w.updated_at=Date.now();await idbPut('works',w);clearFull(w.id);$('#analysisPaste').value='';$('#analysisFile').value='';await loadWorks75();toast(`Oude v1-analyse p. ${start}-${end} geïmporteerd.`,'good');
}

async function buildLessonCache(){
  if(lessonCache)return lessonCache;if(lessonCachePromise)return lessonCachePromise;
  lessonCachePromise=(async()=>{const out=[];for(const m of state.works){if(!m.has_analysis)continue;const w=await fullWork(m.id);const a=w?.analysis;if(!a)continue;for(const key of ['skill_lessons','writing_techniques','research_techniques','lessons_for_user','anti_patterns'])for(const x of(a[key]||[])){const obj=typeof x==='string'?{transferable_principle:x}:x;out.push({...obj,work:m,kind:key});if(out.length>=700)break}if(out.length>=700)break}lessonCache=out;lessonCachePromise=null;return out})().catch(e=>{lessonCachePromise=null;throw e});return lessonCachePromise;
}
function collectLessons75(){return lessonCache||[]}
async function renderLessons75(){
  const el=$('#lessons');if(!el)return;el.innerHTML='<div class="empty">Leerprincipes worden efficiënt uit de geanalyseerde werken opgebouwd…</div>';
  let ls;try{ls=[...(await buildLessonCache())]}catch(e){el.innerHTML=`<div class="callout bad">Kon leerprincipes niet laden: ${esc75(e.message)}</div>`;return}
  const rank=x=>weightRank(x.work);ls.sort((a,b)=>($('#lessonFilter')?.value==='normatief'?rank(a)-rank(b):0));el.innerHTML=ls.length?ls.slice(0,120).map(x=>{const title=x.skill||x.transferable_principle||x.technique||x.lesson||x.pattern||x.title||'Leerprincipe',body=x.transferable_principle||x.why_effective||x.lesson||x.description||x.risk||x.application||'',exercise=x.practice_exercise||x.exercise||'',limit=x.limits||x.when_not_to_use||x.boundary||'';return `<div class="lesson"><h5>${esc75(title)}</h5><p>${esc75(body)}</p>${limit?`<p class="tiny" style="margin-top:6px"><strong>Grens:</strong> ${esc75(limit)}</p>`:''}${exercise?`<p class="tiny" style="margin-top:6px"><strong>Oefening:</strong> ${esc75(exercise)}</p>`:''}<div class="tiny" style="margin-top:7px">Afgeleid uit: ${esc75(x.work.author||'Auteur onbekend')}, ${esc75(x.work.title||x.work.filename)} · ${weightHTML(x.work)}</div></div>`}).join(''):'<div class="empty">Nog geen geanalyseerde leerprincipes.</div>';
}

async function selectedBenchmarkPayload75(){
  const ids=[...(document.getElementById('benchmarkWorks')?.selectedOptions||[])].map(o=>String(o.value)).slice(0,4),out=[];
  for(const id of ids){const w=await fullWork(id);if(!w?.analysis)continue;out.push({author:w.author,title:w.title,weight:w.weight,skill_lessons:(w.analysis.skill_lessons||[]).slice(0,12),writing_techniques:(w.analysis.writing_techniques||[]).slice(0,12),research_techniques:(w.analysis.research_techniques||[]).slice(0,12),anti_patterns:(w.analysis.anti_patterns||[]).slice(0,8)})}
  return out;
}
async function atelierAi75(){
  const text=document.getElementById('ownText')?.value.trim()||'';if(text.length<80)return toast('Plak eerst een voldoende lang eigen fragment.','warn');const goal=document.getElementById('atelierGoal')?.value||'Academische kwaliteit verbeteren',box=document.getElementById('atelierAiFeedback'),btn=document.getElementById('atelierAiReview');if(btn){btn.disabled=true;btn.textContent='AI-docent beoordeelt…'};if(box)box.innerHTML='<div class="empty">Gerichte feedback wordt opgebouwd…</div>';
  try{const context=await selectedBenchmarkPayload75();const r=await AthAI.feedback(PID,{mode:'scriptorium_grade',attempt_id:'atelier_'+Date.now(),question:`Beoordeel dit eigen academische tekstfragment met doel: ${goal}. Geef alleen feedback en revisieacties; schrijf het fragment niet voor de student om.`,answer:text,expected:'Zelfstandig, precies, bronkritisch, methodologisch coherent en academisch helder.',context:JSON.stringify(context,null,2),rubric:'Gebruik de zes Scriptorium-dimensies. Master-niveau geschiedenis; 18+ is uitzonderlijk.'});if(box&&window.gradeHtml)box.innerHTML=gradeHtml(r.feedback,r.quota);else if(box)box.innerHTML=`<div class="callout good"><strong>${r.feedback.score}/20</strong><br>${esc75(r.feedback.verdict||'')}</div>`}catch(e){if(box)box.innerHTML=`<div class="callout bad">${esc75(e.message)}</div>`}finally{if(btn){btn.disabled=false;btn.textContent='🧑‍🏫 AI-docent feedback'}}
}
async function aiGrade75(){
  const ex=state.currentExercise;if(!ex)return toast('Genereer eerst een oefening.','warn');const answer=document.getElementById('trainingAnswer')?.value.trim()||'';if(answer.length<80)return toast('Werk je antwoord eerst voldoende uit.','warn');const btn=document.getElementById('aiGradeTraining');if(btn){btn.disabled=true;btn.textContent='AI-docent beoordeelt…'}
  try{await buildLessonCache();const attempt=await saveCurrentAttempt(answer,true),module=TRAINING_MODULES.find(m=>m.id===ex.module_id),bench=trainingBenchmarks(module),rubric=gradingRubric(module,ex.difficulty),r=await AthAI.feedback(PID,{mode:'scriptorium_grade',attempt_id:attempt.attempt_id,question:exerciseText(ex),answer,expected:JSON.stringify(ex.expected||{},null,2),context:JSON.stringify(bench||[],null,2),rubric:JSON.stringify(rubric||{},null,2)}),g=r.feedback;g.pass_18plus=Boolean(g.score>=18&&(g.critical_issues||[]).length===0);attempt.grade=g;attempt.ai_model=r.model_used;attempt.graded_at=Date.now();const s=activeSession();if(s&&attempt.module_id===s.module_id&&!s.graded_ids.includes(attempt.attempt_id))s.graded_ids.push(attempt.attempt_id);await saveTrainingState();renderTraining();renderTrainingFocus();const el=document.getElementById('trainingFeedback');if(el&&window.gradeHtml)el.innerHTML=gradeHtml(g,r.quota);toast(`AI-docent: ${Number(g.score).toFixed(1)}/20.`,g.score>=18?'good':g.score>=14?'warn':'bad')}catch(e){toast(e.message,'bad')}finally{if(btn){btn.disabled=false;btn.textContent='🧑‍🏫 AI-docent beoordelen'}}
}
async function copyCompare75(){
  const text=$('#ownText').value.trim(),goal=$('#atelierGoal').value;if(!text)return toast('Plak eerst je eigen tekst.','warn');const summary=await selectedBenchmarkPayload75();if(!summary.length)return toast('Kies minstens één geanalyseerd benchmarkwerk.','warn');const prompt=`Je bent mijn academische COACH, niet mijn ghostwriter. Vergelijk mijn tekst met geabstraheerde vaardigheden uit onderstaande Scriptorium-benchmarks. Doel: ${goal}.\n\nBENCHMARKVAARDIGHEDEN\n${JSON.stringify(summary,null,2)}\n\nMIJN TEKST\n${text}\n\nGeef diagnose, maximaal 5 overdraagbare verbeterprincipes, contextgrenzen, oefeningen en revisievolgorde. Schrijf mijn passage niet voor mij.`;await copyText(prompt);toast('Coachingsprompt gekopieerd.','good');
}
async function exportBackup75(){
  const keys=await storeKeys('works'),parts=[`{"scriptorium_backup":1,"exported_at":${JSON.stringify(new Date().toISOString())},"works":[`];let first=true;
  for(const key of keys){const w=await idbGet('works',key);if(!w)continue;if(!first)parts.push(',');parts.push(JSON.stringify(w));first=false}parts.push(']}');downloadBlob(new Blob(parts,{type:'application/json'}),`Scriptorium_backup_${new Date().toISOString().slice(0,10)}.json`);
}

function aiPanel75(s){
  const q=s?.quota||{},used=q.deep_used||0,limit=q.deep_limit||10,rem=q.deep_remaining??Math.max(0,limit-used),pct=limit?Math.round(used/limit*100):0,p=s?.provider;
  return `<div class="card v74-ai-card"><div class="spread"><div><h4>🧑‍🏫 AI-docent</h4><p>Feedbackdienst voor eigen antwoorden; geen chatbot.</p></div><span class="v74-ai-led ${p?.reachable===false?'bad':'ok'}">${p?.reachable===false?'storing':'verbonden'}</span></div><div class="v74-quota"><div class="spread"><strong>Vandaag</strong><span><b>${rem}</b> van ${limit} diepe beoordelingen over</span></div><div class="v74-meter"><i style="width:${pct}%"></i></div></div><div class="grid two" style="margin-top:12px"><div class="callout"><strong>Model</strong><div class="tiny">${esc75(s?.models?.scriptorium||'openai/gpt-oss-120b')}</div></div><div class="callout"><strong>Laatste gebruik</strong><div class="tiny">${q.last_request_at?new Date(q.last_request_at).toLocaleString('nl-BE'):'nog geen vandaag'}</div></div></div><div class="row" style="margin-top:12px"><button class="btn primary" id="v75AiRefresh">Status verversen</button><button class="btn" id="v75AiReconnect">Opnieuw verbinden</button></div><div class="tiny" style="margin-top:8px">${p?.latency_ms!=null?'Provider '+p.latency_ms+' ms · ':''}quota reset dagelijks.</div></div>`;
}
async function refreshAi75(probe=false){
  const host=document.getElementById('v75AiHost');if(!host)return;host.innerHTML='<div class="card"><div class="empty">AI-status controleren…</div></div>';
  try{const s=probe?await AthAI.health(PID,true):await AthAI.status(PID);host.innerHTML=aiPanel75(s);document.getElementById('v75AiRefresh').onclick=()=>refreshAi75(true);document.getElementById('v75AiReconnect').onclick=async()=>{try{await AthAI.reconnect(PID);refreshAi75(true)}catch(e){host.innerHTML=`<div class="callout bad">${esc75(e.message)}</div>`}}}catch(e){host.innerHTML=`<div class="card"><span class="v74-ai-led bad">niet verbonden</span><p>${esc75(e.message)}</p><button class="btn" id="v75AiReconnect">Opnieuw verbinden</button></div>`;document.getElementById('v75AiReconnect').onclick=()=>refreshAi75(true)}
}
async function systemCheck75(){
  const box=document.getElementById('v75SystemResults');if(!box)return;box.innerHTML='<div class="empty">Systeemcontrole uitvoeren…</div>';
  const rows=[];try{rows.push(['Lokale werkdatabase',`${await storeCount('works')} werken`,'ok'])}catch(e){rows.push(['Lokale werkdatabase',e.message,'bad'])}try{rows.push(['PDF-opslag',`${await storeCount('files')} lokale bestanden`,'ok'])}catch(e){rows.push(['PDF-opslag',e.message,'bad'])}
  const cs=window.AthSync?.status?.(PID);rows.push(['Cloudsync',cs?.signed_in?'aangemeld':'niet aangemeld',cs?.signed_in?'ok':'warn']);try{const a=await AthAI.status(PID);rows.push(['AI-docent',a?.configured?'server actief':'niet geconfigureerd',a?.configured?'ok':'bad'])}catch(e){rows.push(['AI-docent',e.message,'warn'])}
  try{if(navigator.storage?.estimate){const e=await navigator.storage.estimate();rows.push(['Browseropslag',`${MB(e.usage||0)} MB gebruikt / ${MB(e.quota||0)} MB quota`,'ok'])}}catch{}
  box.innerHTML=rows.map(([a,b,c])=>`<div class="health-item ${c}"><strong>${esc75(a)}</strong><span>${esc75(b)}</span></div>`).join('');
}
function installSettings75(){
  const page=document.getElementById('page-settings');if(!page)return;
  let host=document.getElementById('v75AiHost');if(!host){host=document.createElement('div');host.id='v75AiHost';host.style.marginTop='14px';page.querySelector('.hero')?.insertAdjacentElement('afterend',host)}
  if(!document.getElementById('v75SystemCard')){const card=document.createElement('div');card.className='card';card.id='v75SystemCard';card.style.marginTop='14px';card.innerHTML=`<div class="spread"><div><h4>✅ Systeemcontrole</h4><p>Controleert lokale data, cloud, AI en browseropslag zonder het volledige corpus in geheugen te laden.</p></div><span class="badge good">productiemodus</span></div><div id="v75SystemResults" class="health-list" style="margin-top:10px"></div><div class="row" style="margin-top:10px"><button class="btn" id="v75RunCheck">Alles controleren</button><button class="btn" id="v75SyncNow">Scriptorium nu synchroniseren</button></div>`;host.insertAdjacentElement('afterend',card);card.querySelector('#v75RunCheck').onclick=systemCheck75;card.querySelector('#v75SyncNow').onclick=async()=>{try{await AthSync.syncScriptorium(PID);toast('Scriptorium gesynchroniseerd.','good');systemCheck75()}catch(e){toast(e.message,'bad')}}}
  refreshAi75(false);systemCheck75();
}
function bind75(){
  const b=document.getElementById('aiGradeTraining');if(b)b.onclick=aiGrade75;
  const a=document.getElementById('atelierAiReview');if(a)a.onclick=atelierAi75;
  const c=document.getElementById('copyComparePrompt');if(c)c.onclick=copyCompare75;
  const e=document.getElementById('exportBackup');if(e)e.onclick=exportBackup75;
}
function installErrorBoundary75(){
  if(document.documentElement.dataset.v75errors)return;document.documentElement.dataset.v75errors='1';
  window.addEventListener('unhandledrejection',e=>{console.error('Scriptorium promise',e.reason);toast('Een onderdeel kon niet afronden. Je werk blijft bewaard; probeer de actie opnieuw.','warn')});
}
function patchCore75(){
  window.migrateLegacyDBIfNeeded=migrateLegacyDBIfNeeded=migrateLegacy75;
  window.loadWorks=loadWorks=loadWorks75;
  window.renderSelects=renderSelects=renderSelects75;
  window.mergeAnalysis=mergeAnalysis=mergeAnalysis75;
  window.openDetail=openDetail=openDetail75;
  window.saveEdit=saveEdit=saveEdit75;
  window.importAnalysis=importAnalysis=importAnalysis75;
  window.importV2Analysis=importV2Analysis=importV2Analysis75;
  window.importLegacyAnalysis=importLegacyAnalysis=importLegacyAnalysis75;
  window.collectLessons=collectLessons=collectLessons75;
  window.renderLessons=renderLessons=renderLessons75;
  window.copyComparePrompt=copyComparePrompt=copyCompare75;
  window.exportBackup=exportBackup=exportBackup75;
}

window.init=async function(){
  brand75();patchCore75();installErrorBoundary75();
  try{
    if(typeof CLEAN_INIT!=='function')throw new Error('Scriptorium basisinitialisatie ontbreekt.');
    await CLEAN_INIT();
    if(typeof window.SCRIPTORIUM_V7_MODERNIZE==='function')await window.SCRIPTORIUM_V7_MODERNIZE();
    if(typeof window.SCRIPTORIUM_V71_ENHANCE==='function')await window.SCRIPTORIUM_V71_ENHANCE();
    if(typeof window.SCRIPTORIUM_V73_ENHANCE==='function')window.SCRIPTORIUM_V73_ENHANCE();
    brand75();bind75();installSettings75();
    document.addEventListener('click',e=>{const n=e.target.closest('[data-page],[data-go]');if(!n)return;setTimeout(()=>{bind75();if((n.dataset.page||n.dataset.go)==='settings')installSettings75()},0)},true);
    if('requestIdleCallback'in window)requestIdleCallback(()=>buildLessonCache().catch(()=>{}),{timeout:30000});
    if(PID&&window.AthSync?.cfg?.(PID)?.enabled)window.AthSync.startAuto(PID,{scriptorium:true});
  }catch(e){console.error('V7.5 boot',e);const n=document.getElementById('bootNotice');if(n){n.hidden=false;n.className='boot-notice bad';n.textContent='Scriptorium kon niet starten: '+(e.message||e)}}
};
})();