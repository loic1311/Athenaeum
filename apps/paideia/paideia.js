
(function(){
'use strict';const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],S=AthStore;const params=new URLSearchParams(location.search);const PID=params.get('ath_profile')||S.currentProfileId();if(PID)S.setCurrentProfile(PID);const profile=()=>S.loadProfiles().find(x=>x.id===PID);let seed=null,state=null,session=null;
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function key(){return 'paideia_state'}
const PATHS={
  ancient:{label:'Oude Geschiedenis',icon:'🏺',domain:'ancient',kind:'history',defaultMinutes:20,description:'Specialisatie: Griekse wereld, Hellenisme, Romeinse Republiek, Principaat en Late Oudheid; feiten, bronnen, instituties, netwerken, structuren, conjuncturen en verandering.'},
  early_modern:{label:'Vroegmoderne Tijd',icon:'🕯️',domain:'early_modern',kind:'history',defaultMinutes:20,description:'Ca. 15e–19e eeuw: staatsvorming, confessionalisering, handel, kolonialisme, drukcultuur, sociale orde, demografie, revoluties en transities.'},
  general_history:{label:'Algemene Geschiedenis',icon:'🌍',domain:'general_history',kind:'history',defaultMinutes:10,description:'Breed chronologisch raamwerk met vergelijking, staatsvorming, economie, sociale structuren en grote transities.'},
  general_knowledge:{label:'Algemene Kennis',icon:'🧠',domain:'general_knowledge',kind:'knowledge',defaultMinutes:10,description:'Brede algemene kennis via korte retrieval, begrippen, verklaringen en verbanden.'},
  pharmacy:{label:'Farmacie',icon:'⚗️',domain:'pharmacy',kind:'study',defaultMinutes:20,description:'Work in progress. Het leerpad is selecteerbaar, maar inhoud wordt pas geactiveerd zodra gecontroleerde farmacie-packs zijn toegevoegd.'},
  skill:{label:'Algemene Vaardigheden',icon:'🛠️',domain:'skill',kind:'skill',defaultMinutes:12,description:'Praktische kennis: gereedschap, onderhoud, basisverbouwingen, banden vervangen, loodgieterij, huishouden en veiligheid.'}
};
function defaultPathSettings(){return{ancient:{active:true,priority:'high',minutes:20,exam:true,telegram:true},early_modern:{active:false,priority:'high',minutes:20,exam:true,telegram:true},general_history:{active:true,priority:'normal',minutes:10,exam:true,telegram:true},general_knowledge:{active:true,priority:'light',minutes:10,exam:false,telegram:true},pharmacy:{active:false,priority:'normal',minutes:20,exam:false,telegram:true},skill:{active:true,priority:'light',minutes:12,exam:false,telegram:true}}}
function defaultState(){return{version:3,streak:0,icecubes:2,last_completed:'',completed_dates:[],daily_count:0,ancient_index:0,early_modern_index:0,general_index:0,gk_index:0,pharmacy_index:0,skill_index:0,weekly_scores:[],monthly_scores:[],history:[],generated_questions:[],learning_paths:defaultPathSettings(),mastery:{ancient:0,early_modern:0,general_history:0,general_knowledge:0,pharmacy:0,skill:0},updated_at:Date.now()}}
function loadState(){state=S.getProfileData(PID,key(),defaultState());state={...defaultState(),...state};state.learning_paths={...defaultPathSettings(),...(state.learning_paths||{})};for(const k of Object.keys(PATHS))state.learning_paths[k]={...defaultPathSettings()[k],...(state.learning_paths[k]||{})};state.mastery={...defaultState().mastery,...(state.mastery||{})};return state}function save(){state.updated_at=Date.now();S.setProfileData(PID,key(),state)}function iso(d=new Date()){const z=new Date(d.getTime()-d.getTimezoneOffset()*60000);return z.toISOString().slice(0,10)}function dayDiff(a,b){return Math.floor((new Date(b+'T12:00:00')-new Date(a+'T12:00:00'))/86400000)}function toast(x){S.toast(x)}
let supplementLoaded=false;
async function loadSeed(){
  const r=await fetch('./seed_core.json',{cache:'force-cache'});
  if(!r.ok)throw new Error('Paideia basisdata kon niet laden.');
  seed=await r.json();seed.questions=[];
}
async function ensureSupplementQuestions(){
  if(supplementLoaded)return;
  const r=await fetch('./questions_supplement.json',{cache:'force-cache'});
  if(!r.ok)throw new Error('Aanvullende oefenvragen konden niet laden.');
  seed.questions=await r.json();supplementLoaded=true;
}
function knowledgePacks(){return S.getProfileData(PID,'knowledge_packs',[])}
function groundedPacks(domain){return knowledgePacks().filter(p=>p&&p.domain===domain&&p.source?.source_class!=='model_supplement')}
function groundedQuestions(domain){const out=[];for(const pack of groundedPacks(domain)){const lm=Object.fromEntries((pack.lessons||[]).map(l=>[l.id,l]));for(const q of pack.questions||[]){const lesson=lm[q.lesson_id]||{};const page=(q.source_refs||[])[0]?.physical_page||(lesson.source_refs||[])[0]?.physical_page||'';out.push({...q,domain,topic:lesson.title||pack.title||domain,source_class:pack.source?.source_class||'user_corpus',source_label:[pack.source?.author,pack.source?.title,page?`p. ${page}`:''].filter(Boolean).join(' · ')})}}return out}
function historyReady(domain){return groundedQuestions(domain).length>0}
function historyReadyAll(){return historyReady('ancient')&&historyReady('general_history')}
function checkStreak(){if(!state.last_completed)return;const diff=dayDiff(state.last_completed,iso());if(diff<=1)return;const missed=diff-1;state.pending_missed=missed;if(state.icecubes>=missed){$('#freezeText').textContent=`Je hebt ${missed} dag${missed===1?'':'en'} gemist. Gebruik ${missed} ijsblokje${missed===1?'':'s'} om de streak te behouden?`;$('#useFreeze').textContent=`🧊 Gebruik ${missed}`;$('#freezeModal').classList.add('open')}else{state.streak=0;state.pending_missed=0;save();toast('Streak verbroken: onvoldoende ijsblokjes om alle gemiste dagen te bevriezen.')}}
function nextSunday(){const d=new Date(),delta=(7-d.getDay())%7;d.setDate(d.getDate()+delta);return d.toLocaleDateString('nl-BE',{weekday:'long',day:'numeric',month:'long'})}
function extraDue(){return state.daily_count>0 && state.daily_count%3===0}
function activePathEntries(){return Object.entries(PATHS).filter(([k])=>state.learning_paths?.[k]?.active)}
function duePathEntries(){const active=activePathEntries(),core=active.filter(([k])=>['high','normal'].includes(state.learning_paths[k]?.priority));const light=active.filter(([k])=>state.learning_paths[k]?.priority==='light');if(light.length&&state.daily_count%3===0)core.push(light[Math.floor(state.daily_count/3)%light.length]);return core.length?core:active.slice(0,1)}
function examPathEntries(){return activePathEntries().filter(([k,p])=>state.learning_paths[k]?.exam&&p.kind==='history')}
function pathReady(k){const p=PATHS[k];if(!p)return false;if(p.domain==='general_knowledge'||p.domain==='skill')return true;if(p.domain==='pharmacy')return groundedQuestions('pharmacy').length>0;return historyReady(p.domain)}
function pathIndex(k){return k==='ancient'?'ancient_index':k==='early_modern'?'early_modern_index':k==='general_history'?'general_index':k==='general_knowledge'?'gk_index':k==='pharmacy'?'pharmacy_index':'skill_index'}
function pathTopic(k){const i=state[pathIndex(k)]||0;if(k==='ancient')return seed.ancient_topics?.[i%(seed.ancient_topics?.length||1)]?.title||'Brongebonden thema';if(k==='general_history')return seed.general_history_topics?.[i%(seed.general_history_topics?.length||1)]?.title||'Chronologisch thema';if(k==='general_knowledge')return seed.general_knowledge_topics?.[i%(seed.general_knowledge_topics?.length||1)]?.title||'Kennisthema';if(k==='skill')return seed.skill_topics?.[i%(seed.skill_topics?.length||1)]?.title||'Praktische vaardigheid';const packs=groundedPacks(PATHS[k]?.domain||k);return packs[i%(packs.length||1)]?.title||(k==='pharmacy'?'Nog geen farmacie-pack':'Nog geen brongebonden kennis-pack')}
function sessionMinutes(k){return Math.max(5,Math.min(90,+state.learning_paths?.[k]?.minutes||PATHS[k]?.defaultMinutes||10))}
function telegramPaths(){return activePathEntries().filter(([k])=>state.learning_paths[k]?.telegram).map(([k,p])=>({key:k,label:p.label,icon:p.icon,minutes:sessionMinutes(k),ready:pathReady(k)}))}

function renderHome(){
  const active=duePathEntries(),total=active.reduce((n,[k])=>n+sessionMinutes(k),0);
  const blocks=active.map(([k,p])=>{const ready=pathReady(k),topic=pathTopic(k);return `<div class="daily-block" style="margin-top:10px"><div class="spread"><div><h4>${p.icon} ${esc(p.label)}</h4><div class="tiny">${sessionMinutes(k)} min · ${esc(state.learning_paths[k].priority)} prioriteit${state.learning_paths[k].exam?' · examengericht':''}</div></div><button class="btn ${ready?'primary':''}" data-session="${k}" ${ready?'':'disabled'}>${ready?'Start':'Nog niet actief'}</button></div><p><strong>${esc(topic)}</strong></p><div class="tiny">${esc(p.description)}</div></div>`}).join('');
  $('#p-home').innerHTML=`<div class="pa-hero slide-up"><div class="spread"><div><div class="chip">PAIDEIA · DAG ${state.daily_count+1}</div><h2>Goedemorgen, ${esc(profile()?.name||'')}</h2><p>Je dagsessie wordt samengesteld uit jouw actieve leerpaden. Universitaire geschiedenis combineert feitenkennis met toepassing, bronkritiek, structuren, conjuncturen, evoluties, revoluties en synthese.</p></div><img src="${'../../assets/avatars/'+(profile()?.avatar||'bust')+'.svg'}" style="width:78px;height:78px;border-radius:50%"></div></div><div class="stat-grid"><div class="stat"><div class="k">🔥 Streak</div><div class="v">${state.streak}</div></div><div class="stat"><div class="k">🧊 IJsblokjes</div><div class="v">${state.icecubes}</div></div><div class="stat"><div class="k">Volgend examen</div><div class="v" style="font-size:18px">${nextSunday()}</div></div><div class="stat"><div class="k">Vandaag</div><div class="v">${total} min</div></div></div><div class="grid two" style="margin-top:18px"><div class="card"><div class="spread"><h3>Vandaag</h3><span class="chip">${active.length} leerpad${active.length===1?'':'en'}</span></div>${blocks||'<p class="muted">Selecteer eerst minstens één leerpad via Instellingen.</p>'}<div class="row" style="margin-top:12px"><button class="btn gold" id="fullDaily" ${active.some(([k])=>pathReady(k))?'':'disabled'}>Volledige dagsessie starten</button></div></div><div class="card"><h3>Adaptieve verdeling</h3><p>Prioriteit en minuten worden per profiel ingesteld. Een leerpad kan actief zijn zonder examenweging of Telegrammelding. Niet-geactiveerde brongebonden leerpaden blijven zichtbaar zonder modelkennis als bron te simuleren.</p><p class="tiny">Farmacie blijft work in progress tot gecontroleerde farmacie-packs beschikbaar zijn. Algemene kennis en algemene vaardigheden kunnen uit de meegeleverde aanvullende vraagbank werken.</p></div></div>`;$$('[data-session]').forEach(b=>b.onclick=()=>startSession(b.dataset.session));$('#fullDaily').onclick=()=>startSession('daily')}
function questionsFor(domain,count){if(['ancient','general_history','early_modern','pharmacy'].includes(domain)){const grounded=groundedQuestions(domain);return shuffle(grounded).slice(0,Math.min(count,grounded.length))}const all=seed.questions.filter(q=>q.domain===domain).map(q=>({...q,source_class:'model_supplement',source_label:'Paideia modelaanvulling'}));const topic=domain==='general_knowledge'?seed.general_knowledge_topics[state.gk_index%seed.general_knowledge_topics.length].title:seed.skill_topics[state.skill_index%seed.skill_topics.length].title;let pool=all.filter(q=>q.topic===topic);if(pool.length<count)pool=all;return shuffle(pool).slice(0,count)}function shuffle(a){return [...a].sort(()=>Math.random()-.5)}
async function startSession(kind){
  const special=['skill','general_knowledge'];
  if(special.includes(kind)||(kind==='daily'&&activePathEntries().some(([k])=>special.includes(k)))){try{await ensureSupplementQuestions()}catch(e){toast(e.message);return}}
  let qs=[],title='';
  if(kind==='daily'){
    const active=duePathEntries().filter(([k])=>pathReady(k));
    for(const [k,p] of active){const n=Math.max(2,Math.round(sessionMinutes(k)/4));qs.push(...questionsFor(p.domain,n).map(q=>({...q,path_key:k})))}
    if(!qs.length){toast('Geen actief leerpad heeft momenteel bruikbare oefeninhoud. Controleer Instellingen of importeer kennis-packs.');return}
    title='Volledige dagsessie';
  }else{
    const p=PATHS[kind];if(!p)return;
    if(!pathReady(kind)){toast(kind==='pharmacy'?'Farmacie is work in progress: importeer eerst gecontroleerde farmacie-packs.':'Dit leerpad heeft nog geen gecontroleerde kennis-pack.');showPage('library');return}
    const n=Math.max(3,Math.round(sessionMinutes(kind)/4));qs=questionsFor(p.domain,n).map(q=>({...q,path_key:kind}));title=p.label;
  }
  session={kind,title,questions:qs,index:0,answers:[],started_at:Date.now()};$('#sessionTitle').textContent=title;$('#sessionMeta').textContent=`${qs.length} vragen · feiten ophalen + toepassen + zelfcontrole`;$('#sessionModal').classList.add('open');renderQuestion()}
function aiRubricFor(q){
  const parts=[];
  if(q.answer)parts.push('Richtantwoord: '+q.answer);
  if(q.keywords?.length)parts.push('Ankerpunten: '+q.keywords.join(', '));
  if(q.correct!=null)parts.push('Correcte optie-index: '+q.correct);
  return parts.join('\n')||'Geen volledig modelantwoord beschikbaar; beoordeel conservatief op taakuitvoering en expliciete broncontext.';
}
function aiContextFor(q){
  return JSON.stringify({topic:q.topic||'',source_label:q.source_label||'',source_class:q.source_class||'',source_refs:q.source_refs||[],provenance:q.provenance||''},null,2)
}
function renderAiFeedback(f,meta={}){
  const box=$('#aiTeacherFeedback');if(!box)return;
  if(!f){box.classList.add('hidden');box.innerHTML='';return}
  box.classList.remove('hidden');
  box.innerHTML=`<div class="ai-teacher-card"><div class="spread"><div><strong>🧑‍🏫 AI-docent</strong><div class="tiny">feedback op jouw antwoord · geen modelantwoord</div></div><span class="chip">${esc(f.score_percent)}%</span></div>
    <p><strong>${esc(f.verdict)}</strong> — ${esc(f.feedback)}</p>
    ${(f.strengths||[]).length?`<h4>Sterk</h4><ul>${f.strengths.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:''}
    ${(f.missing_points||[]).length?`<h4>Nog aanvullen</h4><ul>${f.missing_points.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:''}
    <div class="review-box"><strong>Volgende stap</strong><p>${esc(f.next_action)}</p>${f.hint?`<div class="tiny"><strong>Hint:</strong> ${esc(f.hint)}</div>`:''}</div>
    <div class="tiny" style="margin-top:8px">Bronbinding: ${esc(f.source_grounding||'niet vermeld')}${meta.quota?` · ${esc(AthAI.quotaText(meta.quota))}`:''}</div></div>`
}
async function askAiTeacher(){
  const q=session?.questions?.[session.index];if(!q)return;
  const answer=$('#openAnswer')?.value.trim()||'';
  if(answer.length<20)return toast('Schrijf eerst een inhoudelijk antwoord voor de AI-docent.');
  if(!window.AthAI)return toast('AI-docent is nog niet geladen.');
  const btn=$('#aiTeacherBtn');if(btn){btn.disabled=true;btn.textContent='AI-docent beoordeelt…'}
  try{
    const r=await AthAI.feedback(PID,{mode:'paideia_feedback',question:q.prompt,answer,rubric:aiRubricFor(q),context:aiContextFor(q),domain:q.domain||session.kind});
    session.aiCurrent={...r.feedback,answer,model_used:r.model_used,quota:r.quota,at:Date.now()};
    const score=$('#selfScore');if(score)score.value=r.feedback.score_percent;
    renderAiFeedback(r.feedback,{quota:r.quota});
  }catch(e){toast(e.message)}finally{if(btn){btn.disabled=false;btn.textContent='AI-docent: geef feedback'}}
}
function renderQuestion(){const q=session.questions[session.index];session.aiCurrent=null;$('#sessionBar').style.width=`${session.index/session.questions.length*100}%`;let html=`<div class="question-card"><div class="chip">${esc(q.type)} · ${esc(q.topic)}</div>${q.source_label?`<div class="tiny" style="margin-top:7px">📚 ${esc(q.source_label)}${q.source_class==='model_supplement'?' · aanvulling':''}</div>`:''}<h3 style="margin-top:12px">${esc(q.prompt)}</h3>`;if(q.options?.length)html+=q.options.map((o,i)=>`<button class="option" data-opt="${i}">${esc(o)}</button>`).join('');else html+=`<textarea id="openAnswer" style="width:100%;min-height:140px;border:1px solid #d8d0c2;border-radius:14px;padding:12px" placeholder="Antwoord uit het hoofd. Schrijf compact maar volledig."></textarea><div class="row" style="margin-top:10px"><button class="btn ai-teacher-btn" id="aiTeacherBtn">🧑‍🏫 AI-docent: geef feedback</button></div><div id="aiTeacherFeedback" class="hidden" style="margin-top:10px"></div>`;html+=`<div id="guideline" class="review-box hidden" style="margin-top:12px"><strong>Richtlijn / zelfcorrectie</strong><p>${q.answer?esc(q.answer):q.keywords?.length?'Controleer of je minstens deze ankerpunten behandelt: '+q.keywords.map(esc).join(', '):'Vergelijk met je bronnotities en beoordeel of je vraag, structuur en causaliteit volledig hebt behandeld.'}</p><label>${q.options?.length?'Zelfscore':'Score / zelfcorrectie'} (0-100%) <input id="selfScore" type="number" min="0" max="100" value="75" style="width:90px"></label></div></div>`;$('#questionHost').innerHTML=html;$$('[data-opt]').forEach(b=>b.onclick=()=>{$$('[data-opt]').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');session.selected=+b.dataset.opt});if($('#aiTeacherBtn'))$('#aiTeacherBtn').onclick=askAiTeacher;$('#revealBtn').textContent='Toon richtlijn';$('#nextBtn').textContent=session.index===session.questions.length-1?'Afronden':'Volgende'}

function kindLabel(k){return({daily:'Volledige dagsessie',ancient:'Oude Geschiedenis',early_modern:'Vroegmoderne Tijd',general_history:'Algemene Geschiedenis',general_knowledge:'Algemene Kennis',pharmacy:'Farmacie',skill:'Algemene Vaardigheden',weekly_exam:'Wekelijks examen',monthly_exam:'Maandelijkse mastery check',ai_generated:'AI-oefenvraag'}[k]||k||'Sessie')}
function fmtDateTime(ts,date){try{return ts?new Date(ts).toLocaleString('nl-BE',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}):new Date((date||iso())+'T12:00:00').toLocaleDateString('nl-BE')}catch{return date||''}}
function durationMin(started){return Math.max(1,Math.round((Date.now()-(started||Date.now()))/60000))}
function answerSnapshot(q,score,answer,ai){return{q:q.id||S.uid(),prompt:q.prompt||'',topic:q.topic||'',domain:q.domain||'',path_key:q.path_key||q.domain||'',type:q.type||'open',source_label:q.source_label||'',score:Number(score||0),answer:answer||'',ai_reviewed:!!ai,ai_feedback:ai||null}}
function uniqueList(xs){return [...new Set((xs||[]).filter(Boolean))]}
function academicExamIndex(){
  const ws=state.weekly_scores.slice(-4),m=state.monthly_scores.at(-1);
  if(!ws.length&&!m)return null;
  const wavg=ws.length?ws.reduce((n,x)=>n+Number(x.score||0),0)/ws.length:null;
  if(m&&wavg!=null)return Math.round(wavg*.40+Number(m.score||0)*.60);
  return Math.round(m?Number(m.score||0):wavg||0)
}
function sessionHistoryHTML(){
  const rows=(state.history||[]).filter(x=>!String(x.kind||'').endsWith('_exam')).slice(-12).reverse();
  if(!rows.length)return '<div class="empty">Nog geen leersessies geregistreerd.</div>';
  return rows.map(r=>`<div class="history-detail"><div class="spread"><strong>${esc(kindLabel(r.kind))}</strong><span class="chip">${Number(r.score||0)}%</span></div><div class="tiny">${esc(fmtDateTime(r.created_at,r.date))} · ${r.question_count||r.answers?.length||'?'} vragen · ${r.duration_min||'?'} min · AI ${r.ai_reviewed||0}</div>${r.paths?.length?`<div class="tiny"><strong>Leerpad:</strong> ${r.paths.map(x=>esc(PATHS[x]?.label||x)).join(' · ')}</div>`:''}${r.topics?.length?`<div class="tiny"><strong>Bevraagd:</strong> ${r.topics.slice(0,4).map(esc).join(' · ')}</div>`:''}${r.sources?.length?`<div class="tiny"><strong>Bronnen:</strong> ${r.sources.slice(0,3).map(esc).join(' · ')}</div>`:''}</div>`).join('')
}
function examHistoryHTML(){
  const rows=[...(state.weekly_scores||[]).map(x=>({...x,kind:'weekly_exam',weight_percent:40})),...(state.monthly_scores||[]).map(x=>({...x,kind:'monthly_exam',weight_percent:60}))].sort((a,b)=>(b.created_at||Date.parse(b.date||0))-(a.created_at||Date.parse(a.date||0))).slice(0,12);
  if(!rows.length)return '<div class="empty">Nog geen examens afgelegd.</div>';
  return rows.map(r=>`<div class="history-detail exam-history"><div class="spread"><strong>${esc(kindLabel(r.kind))}</strong><span class="score-pill">${Number(r.score||0)}%</span></div><div class="tiny">${esc(fmtDateTime(r.created_at,r.date))} · weging ${r.weight_percent|| (r.kind==='monthly_exam'?60:40)}% · ${r.question_count||r.answers?.length||'?'} vragen · ${r.duration_min||'?'} min</div>${r.paths?.length?`<div class="tiny"><strong>Leerpaden:</strong> ${r.paths.map(x=>esc(PATHS[x]?.label||x)).join(' · ')}</div>`:''}${r.topics?.length?`<div class="tiny"><strong>Inhoud:</strong> ${r.topics.slice(0,5).map(esc).join(' · ')}</div>`:''}<div class="tiny">AI-beoordeeld: ${r.ai_reviewed||0}${r.freeze_earned?' · 🧊 streak-freeze verdiend':''}</div></div>`).join('')
}
function paideiaSourceDigest(domain){
  const packs=groundedPacks(domain).slice(0,5),out=[];
  for(const p of packs){out.push({pack:p.title,source:p.source,lessons:(p.lessons||[]).slice(0,8).map(l=>({title:l.title,summary:l.summary||l.key_points||'',source_refs:l.source_refs||[]})),questions:(p.questions||[]).slice(0,5).map(q=>({prompt:q.prompt,type:q.type,source_refs:q.source_refs||[]}))})}
  return out
}
function recentQuestionDigest(domain){
  const out=[];for(const h of [...(state.history||[])].reverse()){for(const a of (h.answers||[])){if(!domain||a.domain===domain)out.push(a.prompt)}if(out.length>=8)break}return out.slice(0,8)
}
async function generatePaideiaQuestion(domain,questionType='synthese',difficulty=4,title='AI-oefenvraag'){
  if((domain==='ancient'||domain==='general_history')&&!historyReady(domain)){toast('Importeer eerst een brongebonden kennis-pack voor dit domein.');return}
  const btn=document.activeElement;if(btn?.tagName==='BUTTON'){btn.disabled=true;btn.dataset.oldText=btn.textContent;btn.textContent='AI maakt vraag…'}
  try{
    const context=domain==='ancient'||domain==='general_history'?paideiaSourceDigest(domain):{topics:domain==='general_knowledge'?seed.general_knowledge_topics:seed.skill_topics};
    const r=await AthAI.generate(PID,{mode:'paideia_generate',goal:'Universitaire oefenvraag die feitenkennis én toepassing test. Laat de student structuren, conjuncturen, evoluties, revoluties, processen, causaliteit of vergelijking verklaren waar passend.',domain,question_type:questionType,difficulty,context:JSON.stringify(context),recent:JSON.stringify(recentQuestionDigest(domain))});
    const f=r.feedback,q={id:'aiq_'+Date.now().toString(36),domain,type:'open',topic:title,prompt:f.question,answer:(f.expected_points||[]).join(' · '),keywords:f.expected_points||[],source_class:'ai_grounded',source_label:f.source_grounding||'AI-docent · brongebonden',ai_generated:true,difficulty:f.difficulty,time_minutes:f.time_minutes,created_at:Date.now()};
    state.generated_questions=(state.generated_questions||[]).concat(q).slice(-40);save();
    session={kind:'ai_generated',title,questions:[q],index:0,answers:[],started_at:Date.now()};
    $('#sessionTitle').textContent=title;$('#sessionMeta').textContent=`AI-gegenereerd · ${esc(f.question_type)} · niveau ${f.difficulty}/5 · ±${f.time_minutes} min`;$('#sessionModal').classList.add('open');renderQuestion()
  }catch(e){toast(e.message)}finally{if(btn?.tagName==='BUTTON'){btn.disabled=false;btn.textContent=btn.dataset.oldText||'Genereer'}}
}

function reveal(){const g=$('#guideline');g.classList.remove('hidden');$('#revealBtn').textContent='Richtlijn zichtbaar'}function nextQ(){const q=session.questions[session.index];const score=+($('#selfScore')?.value||75);session.answers.push({q:q.id,score});if(session.index<session.questions.length-1){session.index++;session.selected=null;renderQuestion();return}finishSession()}
function finishSession(){const avg=Math.round(session.answers.reduce((a,b)=>a+b.score,0)/Math.max(1,session.answers.length));const kind=session.kind,rec={id:S.uid(),date:iso(),created_at:Date.now(),kind,title:session.title,score:avg,formative:true,formal_weight_percent:0,question_count:session.answers.length,duration_min:durationMin(session.started_at),ai_reviewed:session.answers.filter(x=>x.ai_feedback).length,topics:uniqueList(session.answers.map(x=>x.topic)),domains:uniqueList(session.answers.map(x=>x.domain)),paths:uniqueList(session.answers.map(x=>x.path_key||x.domain)),sources:uniqueList(session.answers.map(x=>x.source_label)),answers:session.answers,updated_at:Date.now()};state.history.push(rec);for(const k of (rec.paths||[])){if(k in state.mastery)state.mastery[k]=Math.round(((state.mastery[k]||0)*3+avg)/4)}if(kind==='daily'){completeDaily();for(const [k] of activePathEntries()){const idx=pathIndex(k);state[idx]=(state[idx]||0)+1}}else if(PATHS[kind]){const idx=pathIndex(kind);state[idx]=(state[idx]||0)+1}save();$('#sessionModal').classList.remove('open');toast(`Sessie afgerond: ${avg}%`);renderHome()}
function completeDaily(){const today=iso();if(state.last_completed===today)return;const diff=state.last_completed?dayDiff(state.last_completed,today):1;if(diff===1||!state.last_completed)state.streak+=1;state.last_completed=today;if(!state.completed_dates.includes(today))state.completed_dates.push(today);state.daily_count+=1}function advanceTopics(){state.ancient_index=(state.ancient_index+1)%seed.ancient_topics.length;if(state.daily_count%2===0)state.general_index=(state.general_index+1)%seed.general_history_topics.length;if(extraDue())state.gk_index=(state.gk_index+1)%seed.general_knowledge_topics.length}
function renderLearn(){
  const cards=activePathEntries().map(([k,p])=>`<div class="card"><div class="spread"><h3>${p.icon} ${esc(p.label)}</h3><span class="chip">${sessionMinutes(k)} min</span></div><p>${esc(p.description)}</p><div class="tiny" style="margin-bottom:10px">${pathReady(k)?'Klaar voor training':'Nog geen gecontroleerde inhoud voor dit leerpad'}</div><div class="row"><button class="btn primary" data-session="${k}" ${pathReady(k)?'':'disabled'}>Start ${sessionMinutes(k)} min</button>${['ancient','early_modern','general_history'].includes(k)?`<button class="btn" data-ai-path="${k}" ${pathReady(k)?'':'disabled'}>AI transfervraag</button>`:''}</div></div>`).join('');
  const aiOptions=activePathEntries().filter(([k,p])=>p.kind==='history'&&pathReady(k)).map(([k,p])=>`<option value="${k}">${esc(p.label)}</option>`).join('');
  $('#p-learn').innerHTML=`<div class="hero"><h2>Leren</h2><p>Per leerpad zie je wat geoefend werd, wanneer, hoe lang, met welke vraagtypes en welke bronnen. Geschiedenis gaat van feitenkennis naar verklaring en transfer.</p></div><div class="grid two" style="margin-top:16px">${cards||'<div class="card"><p>Kies leerpaden via Instellingen.</p></div>'}</div>
  <div class="card" style="margin-top:16px"><div class="spread"><div><h3>🧑‍🏫 AI-vraaggenerator</h3><p>Maakt nieuwe universitaire, brongebonden vragen die herinneren én toepassen combineren.</p></div><span class="chip">geen trivia-generator</span></div>${aiOptions?`<div class="grid two"><div class="field"><label>Leerpad</label><select id="aiLearnDomain">${aiOptions}</select></div><div class="field"><label>Vraagtype</label><select id="aiLearnType"><option value="feiten+toepassing">Feiten + toepassing</option><option value="structuur">Structuur</option><option value="conjunctuur">Conjunctuur</option><option value="evolutie">Evolutie</option><option value="revolutie">Revolutie</option><option value="vergelijking">Vergelijking</option><option value="synthese">Synthese</option><option value="bronanalyse">Bronanalyse</option></select></div></div><button class="btn gold" id="aiLearnGenerate" style="margin-top:10px">Genereer universitaire vraag</button>`:'<p class="muted">Activeer en vul eerst minstens één historisch leerpad met gecontroleerde kennis-packs.</p>'}</div>
  <div class="card" style="margin-top:16px"><div class="spread"><div><h3>📚 Studiehistoriek</h3><p>Datum, leerpad, inhoud, score, duur, bronbinding en AI-beoordeling. Formatieve scores tellen niet rechtstreeks mee in de examenindex.</p></div><span class="chip">${(state.history||[]).filter(x=>!String(x.kind||'').endsWith('_exam')).length} sessies</span></div><div class="history-detail-list">${sessionHistoryHTML()}</div></div>`;
  $$('[data-session]').forEach(b=>b.onclick=()=>startSession(b.dataset.session));$$('[data-ai-path]').forEach(b=>b.onclick=()=>{const k=b.dataset.aiPath;generatePaideiaQuestion(PATHS[k].domain,'toepassing',4,'AI transfervraag '+PATHS[k].label)});if($('#aiLearnGenerate'))$('#aiLearnGenerate').onclick=()=>{const k=$('#aiLearnDomain').value;generatePaideiaQuestion(PATHS[k].domain,$('#aiLearnType').value,4,'AI universitaire oefenvraag')}
}
function examQs(monthly=false){const paths=examPathEntries().filter(([k])=>pathReady(k));if(!paths.length)return [];let base=[];for(const [k,p] of paths){const count=monthly?5:3;base.push(...questionsFor(p.domain,count).map(q=>({...q,path_key:k})))}return shuffle(base).slice(0,monthly?14:10).map((q,i)=>({...q,type:'open',prompt:monthly?`Mastery-vraag ${i+1}: ${q.prompt}`:`Examenvraag ${i+1}: ${q.prompt}`}))}
function startExam(monthly=false){const qs=examQs(monthly);if(!qs.length){toast('Selecteer minstens één examengericht historisch leerpad met een gecontroleerde kennis-pack.');showPage('settings');return}session={kind:monthly?'monthly_exam':'weekly_exam',title:monthly?'Maandelijkse mastery check':'Wekelijks examen',questions:qs,index:0,answers:[],started_at:Date.now(),weight_percent:monthly?60:40};$('#sessionTitle').textContent=session.title;$('#sessionMeta').textContent=`Universitaire stijl · cumulatief · feiten + toepassing + synthese · weging ${session.weight_percent}% binnen examenindex`;$('#sessionModal').classList.add('open');renderQuestion()}
const oldFinish=finishSession;
function finishExamIfNeeded(){if(!session.kind.endsWith('_exam'))return false;const avg=Math.round(session.answers.reduce((a,b)=>a+b.score,0)/Math.max(1,session.answers.length)),monthly=session.kind==='monthly_exam',rec={date:iso(),created_at:Date.now(),score:avg,id:S.uid(),kind:session.kind,title:session.title,weight_percent:monthly?60:40,question_count:session.answers.length,duration_min:durationMin(session.started_at),ai_reviewed:session.answers.filter(x=>x.ai_feedback).length,topics:uniqueList(session.answers.map(x=>x.topic)),domains:uniqueList(session.answers.map(x=>x.domain)),paths:uniqueList(session.answers.map(x=>x.path_key||x.domain)),sources:uniqueList(session.answers.map(x=>x.source_label)),answers:session.answers,freeze_earned:avg>=75,updated_at:Date.now()};if(monthly)state.monthly_scores.push(rec);else state.weekly_scores.push(rec);if(avg>=75)state.icecubes+=1;state.history.push(rec);save();$('#sessionModal').classList.remove('open');toast(`Examen: ${avg}%${avg>=75?' · 🧊 +1':''}`);renderExam();return true}
function nextQ2(){const q=session.questions[session.index],answer=$('#openAnswer')?.value.trim()||'',score=session.aiCurrent?.score_percent??+($('#selfScore')?.value||75);session.answers.push(answerSnapshot(q,score,answer,session.aiCurrent||null));if(session.index<session.questions.length-1){session.index++;renderQuestion();return}if(!finishExamIfNeeded())finishSession()}
function renderExam(){
  const w=state.weekly_scores.at(-1),m=state.monthly_scores.at(-1),idx=academicExamIndex(),examPaths=examPathEntries().map(([k,p])=>p.label).join(' · ');
  $('#p-exam').innerHTML=`<div class="hero"><h2>Examens</h2><p>Universiteitsexamens toetsen feitenkennis én toepassing: chronologie, begrippen en kernfeiten vormen de basis voor structuren, conjuncturen, evoluties, revoluties, causaliteit, bronnen en synthese.</p></div>
  <div class="stat-grid"><div class="stat"><div class="k">Academische examenindex</div><div class="v">${idx==null?'—':idx+'%'}</div></div><div class="stat"><div class="k">Weekexamen</div><div class="v">40%</div></div><div class="stat"><div class="k">Mastery check</div><div class="v">60%</div></div><div class="stat"><div class="k">Examengerichte leerpaden</div><div class="v" style="font-size:15px">${examPaths||'geen'}</div></div></div>
  <div class="grid two" style="margin-top:16px"><div class="card exam-card"><h3>Wekelijks examen</h3><p>±45 min · cumulatief. Feiten, verklaringen, bronanalyse, vergelijking en toepassing. Gemiddelde van de laatste vier = 40% van de examenindex.</p><div class="row"><button class="btn primary" id="weeklyBtn">Start weekexamen</button><button class="btn" id="weeklyAiQuestion">AI extra examenvraag</button></div><p class="tiny">Laatste: ${w?w.score+'% · '+fmtDateTime(w.created_at,w.date):'nog geen'}</p></div><div class="card exam-card"><h3>Maandelijkse mastery check</h3><p>Brede synthese over langere periodes: continuïteit/breuk, volledige evoluties, structuren, conjuncturen, revoluties en causale samenhang. Laatste mastery check = 60%.</p><div class="row"><button class="btn gold" id="monthlyBtn">Start mastery check</button><button class="btn" id="monthlyAiQuestion">AI mastery-vraag</button></div><p class="tiny">Laatste: ${m?m.score+'% · '+fmtDateTime(m.created_at,m.date):'nog geen'}</p></div></div>
  <div class="card" style="margin-top:16px"><div class="spread"><div><h3>🧾 Examenhistoriek</h3><p>Per examen: datum, score, weging, type, duur, leerpaden, thema's, aantal vragen, AI-beoordeling en bronbinding.</p></div><span class="chip">${(state.weekly_scores?.length||0)+(state.monthly_scores?.length||0)} examens</span></div><div class="history-detail-list">${examHistoryHTML()}</div></div>`;
  $('#weeklyBtn').onclick=()=>startExam(false);$('#monthlyBtn').onclick=()=>startExam(true);const first=examPathEntries().find(([k])=>pathReady(k));if(first){$('#weeklyAiQuestion').onclick=()=>generatePaideiaQuestion(first[1].domain,'feiten+toepassing',4,'AI weekexamenvraag');$('#monthlyAiQuestion').onclick=()=>generatePaideiaQuestion(first[1].domain,'synthese',5,'AI mastery-vraag')}else{$('#weeklyAiQuestion').disabled=true;$('#monthlyAiQuestion').disabled=true}
}
function renderKnowledge(){const packs=S.getProfileData(PID,'knowledge_packs',[]),stats=activePathEntries().map(([k,p])=>`<div class="stat"><div class="k">${p.icon} ${esc(p.label)}</div><div class="v">${state.mastery[k]||0}%</div></div>`).join('');$('#p-knowledge').innerHTML=`<div class="hero"><h2>Kennisbank</h2><p>Wat je duurzaam beheerst, uitgesplitst per actief leerpad. Brongebonden domeinen tonen alleen gecontroleerde kennis uit geïmporteerde packs.</p></div><div class="stat-grid">${stats}</div><div class="card" style="margin-top:16px"><h3>Kennis-packs</h3>${packs.length?packs.map(p=>`<div style="padding:10px 0;border-bottom:1px solid #e1d9ca"><strong>${esc(p.title)}</strong><div class="tiny">${esc(p.source?.author||'Auteur onbekend')} · ${esc(p.source?.title||'')} · ${p.lessons?.length||0} lessen</div></div>`).join(''):'<p class="muted">Nog geen brongebonden kennis-packs geïmporteerd.</p>'}</div>`}
function renderLibrary(){const packs=S.getProfileData(PID,'knowledge_packs',[]);$('#p-library').innerHTML=`<div class="hero"><h2>Bronnen</h2><p>Paideia geeft voorrang aan jouw gecontroleerde werken. Nieuwe contentpacks mogen pas als hoofdanker gelden wanneer titel, auteur en paginaverwijzingen controleerbaar zijn.</p></div><div class="grid two" style="margin-top:16px"><div class="card"><h3>Prioriteit</h3><p>1. Jouw scans/boeken<br>2. universitaire compendia<br>3. wetenschappelijke monografieën/artikels<br>4. modelkennis als aanvulling</p></div><div class="card"><h3>Geïmporteerd</h3><p>${packs.length} kennis-pack(s)</p><a class="btn" href="../../index.html">Importeer via Athenaeum Bibliotheek</a></div></div>`}
function telegramPanelMarkup(){
  const n=window.AthTelegram?.notify(PID)||{morning:'08:00',reminder:'18:00',timezone:'Europe/Brussels'};
  return `<div class="grid two"><div class="card"><h3>🔔 Meldingsschema</h3><div class="field"><label>Ochtend</label><input id="tgMorning" type="time" value="${esc(n.morning||'08:00')}"></div><div class="field" style="margin-top:10px"><label>Reminder</label><input id="tgReminder" type="time" value="${esc(n.reminder||'18:00')}"></div><div class="field" style="margin-top:10px"><label>Tijdzone</label><input id="tgTimezone" value="${esc(n.timezone||'Europe/Brussels')}"></div><button class="btn" id="tgSave" style="margin-top:12px">Bewaar schema</button></div><div class="card"><div class="spread"><h3>🤖 Athenaeum Bot</h3><span class="chip" id="tgState">controleren…</span></div><p class="muted" id="tgInfo">Telegram gebruikt één Athenaeum Bot. De ochtendplanning wordt automatisch gepersonaliseerd op basis van de leerpaden waarvoor Telegram is ingeschakeld.</p><div class="row"><button class="btn primary" id="tgPair">Koppelen</button><button class="btn" id="tgTest">Testmelding</button><button class="btn" id="tgDisconnect">Ontkoppelen</button><button class="btn" id="tgDiagnose">Diagnose</button></div></div></div>`
}
async function bindTelegramPanel(){
  const refresh=async()=>{const chip=$('#tgState'),info=$('#tgInfo');if(!chip||!window.AthTelegram)return;const s=await AthTelegram.status(PID);chip.textContent=s.connected?'✅ gekoppeld':'niet gekoppeld';info.textContent=s.connected?`Athenaeum Bot is gekoppeld${s.bot_username?' met @'+s.bot_username:''}.`:(s.error||'Koppel eerst de bot.')};
  $('#tgSave').onclick=async()=>{const x={morning:$('#tgMorning').value,reminder:$('#tgReminder').value,timezone:$('#tgTimezone').value};AthTelegram.saveNotify(PID,x);try{await AthTelegram.updateSchedule(PID,x)}catch{}toast('Meldingsschema bewaard.')};
  $('#tgPair').onclick=async()=>{try{const r=await AthTelegram.pair(PID);$('#tgInfo').innerHTML=`Koppelcode <strong>${r.code}</strong> is 30 minuten geldig. ${r.link?`<a href="${r.link}" target="_blank">Open @${esc(r.bot_username)} in Telegram</a>`:'Stuur /start '+r.code}`;toast('Koppelcode gemaakt.')}catch(e){toast(e.message)}};
  $('#tgTest').onclick=async()=>{try{await AthTelegram.test(PID);toast('Testmelding verstuurd.')}catch(e){toast(e.message)}};
  $('#tgDisconnect').onclick=async()=>{try{await AthTelegram.disconnect(PID);toast('Telegram ontkoppeld.');refresh()}catch(e){toast(e.message)}};
  $('#tgDiagnose').onclick=async()=>{try{const r=await AthTelegram.diagnose(PID);$('#tgInfo').innerHTML=(r.steps||[]).map(x=>'• '+esc(x)).join('<br>')}catch(e){$('#tgInfo').textContent=e.message}};
  refresh()
}
async function renderTelegram(){const host=$('#p-telegram');if(host){host.innerHTML=telegramPanelMarkup();await bindTelegramPanel()}}
function aiUsageHtmlPa(s){
  const q=s?.quota||{},used=q.regular_used||0,limit=q.regular_limit||60,remaining=q.regular_remaining??Math.max(0,limit-used),pct=limit?Math.round(used/limit*100):0;
  const provider=s?.provider;
  return `<div class="ai-status-card"><div class="ai-status-head"><div><h3>🧑‍🏫 AI-docent</h3><p class="muted">Geen chatbot: beoordeling van eigen antwoorden én brongebonden generatie van nieuwe universitaire oefenvragen.</p></div><span class="ai-led ${provider?.reachable===false?'bad':'ok'}" id="paAiLed">${provider?.reachable===false?'storing':'verbonden'}</span></div>
    <div class="ai-quota"><div class="ai-quota-line"><strong>Paideia AI vandaag</strong><span><b>${remaining}</b> van ${limit} feedback- of vraagacties over</span><div class="ai-meter"><i style="width:${pct}%"></i></div></div></div>
    <div class="grid two" style="margin-top:13px"><div class="performance-note"><strong>Model</strong><div class="tiny">${esc(s?.models?.paideia||'openai/gpt-oss-20b')}</div></div><div class="performance-note"><strong>Laatste gebruik</strong><div class="tiny">${q.last_request_at?new Date(q.last_request_at).toLocaleString('nl-BE'):'nog geen vandaag'}</div></div></div>
    <div class="row" style="margin-top:13px"><button class="btn primary" id="paAiRefresh">Status verversen</button><button class="btn" id="paAiReconnect">Opnieuw verbinden</button></div>
    <div class="tiny" id="paAiDetail" style="margin-top:8px">${provider?.latency_ms!=null?'Groq '+provider.latency_ms+' ms · ':''}reset om ${q.resets_at?new Date(q.resets_at).toLocaleTimeString('nl-BE',{hour:'2-digit',minute:'2-digit'}):'00:00 UTC'}</div></div>`;
}
async function refreshPaAi(probe=false){
  const host=$('#paAiHost');if(!host)return;
  host.innerHTML='<div class="card"><p class="muted">AI-status controleren…</p></div>';
  try{
    const s=probe?await AthAI.health(PID,true):await AthAI.status(PID);
    host.innerHTML=aiUsageHtmlPa(s);
    $('#paAiRefresh').onclick=()=>refreshPaAi(true);
    $('#paAiReconnect').onclick=async()=>{try{host.innerHTML='<div class="card"><p>Opnieuw verbinden…</p></div>';const x=await AthAI.reconnect(PID);host.innerHTML=aiUsageHtmlPa(x);$('#paAiRefresh').onclick=()=>refreshPaAi(true);$('#paAiReconnect').onclick=()=>refreshPaAi(true)}catch(e){host.innerHTML=`<div class="callout bad">${esc(e.message)}</div>`}};
  }catch(e){
    host.innerHTML=`<div class="ai-status-card"><div class="ai-led bad">niet verbonden</div><p>${esc(e.message)}</p><div class="row"><button class="btn" id="paAiReconnect">Opnieuw verbinden</button></div></div>`;
    $('#paAiReconnect').onclick=()=>refreshPaAi(true);
  }
}
async function paSystemCheck(){const box=$('#paSystemResults');if(!box)return;box.innerHTML='<div class="empty">Controleren…</div>';const rows=[];try{rows.push(['Profieldata',profile()?'beschikbaar':'ontbreekt',profile()?'ok':'bad'])}catch(e){rows.push(['Profieldata',e.message,'bad'])}try{const packs=S.getProfileData(PID,'knowledge_packs',[]);rows.push(['Kennis-packs',packs.length+' geïmporteerd',packs.length?'ok':'warn'])}catch(e){rows.push(['Kennis-packs',e.message,'warn'])}const cs=window.AthSync?.status?.(PID);rows.push(['Cloudsync',cs?.signed_in?'aangemeld':'niet aangemeld',cs?.signed_in?'ok':'warn']);try{const a=await AthAI.status(PID);rows.push(['AI-docent',a?.configured?'actief':'niet geconfigureerd',a?.configured?'ok':'bad'])}catch(e){rows.push(['AI-docent',e.message,'warn'])}try{const t=await AthTelegram.status(PID);rows.push(['Telegram',t.connected?'gekoppeld':'niet gekoppeld',t.connected?'ok':'warn'])}catch(e){rows.push(['Telegram',e.message,'warn'])}box.innerHTML=rows.map(([a,b,c])=>`<div class="health-item ${c}"><strong>${esc(a)}</strong><span>${esc(b)}</span></div>`).join('')}
function renderSettings(){
  const rows=Object.entries(PATHS).map(([k,p])=>{const x=state.learning_paths[k]||{};return `<div class="path-setting"><label class="path-toggle"><input type="checkbox" data-path-active="${k}" ${x.active?'checked':''}><span><strong>${p.icon} ${esc(p.label)}</strong><small>${esc(p.description)}</small></span></label><div class="path-controls"><label>Prioriteit<select data-path-priority="${k}"><option value="high" ${x.priority==='high'?'selected':''}>hoog</option><option value="normal" ${x.priority==='normal'?'selected':''}>normaal</option><option value="light" ${x.priority==='light'?'selected':''}>licht</option></select></label><label>Minuten/sessie<input data-path-minutes="${k}" type="number" min="5" max="90" step="5" value="${sessionMinutes(k)}"></label><label class="mini-check"><input type="checkbox" data-path-exam="${k}" ${x.exam?'checked':''} ${p.kind!=='history'?'disabled':''}> examens</label><label class="mini-check"><input type="checkbox" data-path-telegram="${k}" ${x.telegram?'checked':''}> Telegram</label></div>${k==='pharmacy'?'<div class="tiny warn-text">Work in progress: selectie is toegestaan, maar training blijft vergrendeld tot gecontroleerde farmacie-packs zijn toegevoegd.</div>':''}</div>`}).join('');
  $('#p-settings').innerHTML=`<div class="hero"><h2>Instellingen</h2><p>Leerpaden, AI-docent, Telegram, prestaties en systeemstatus voor dit profiel.</p></div>
  <div class="card learning-path-card" style="margin-top:16px"><div class="spread"><div><h3>🧭 Leerpaden</h3><p>Selecteer meerdere leerpaden. Per pad bepaal je prioriteit, sessieduur, examenopname en Telegrammeldingen.</p></div><span class="chip">profielgebonden</span></div><div class="path-settings">${rows}</div><div class="row" style="margin-top:12px"><button class="btn primary" id="saveLearningPaths">Leerpaden bewaren</button></div></div>
  <div id="paAiHost" style="margin-top:16px"></div><div class="card" id="paSystemCard" style="margin-top:16px"><div class="spread"><div><h3>✅ Systeemcontrole</h3><p>Controleer profieldata, kennis-packs, cloud, Telegram en AI zonder je leersessie te onderbreken.</p></div><button class="btn" id="paRunSystem">Alles controleren</button></div><div id="paSystemResults" class="health-list" style="margin-top:10px"></div></div><div class="card" style="margin-top:16px"><div class="spread"><div><h3>🔔 Telegram & meldingen</h3><p>Eén bot, gepersonaliseerd per profiel en geselecteerd leerpad; geen aparte kanalen nodig.</p></div><span class="chip">${telegramPaths().length} actieve meldingspaden</span></div><div id="telegramSettingsHost" style="margin-top:12px">${telegramPanelMarkup()}</div><div class="tiny" style="margin-top:10px"><strong>Telegramplanning:</strong> ${telegramPaths().map(x=>`${x.icon} ${x.label} ${x.minutes} min`).join(' · ')||'geen leerpaden geselecteerd'}</div></div><div class="card" style="margin-top:16px"><h3>⚡ Prestatiemodus</h3><p>Paideia laadt kleine basisdata direct en vraagbanken pas wanneer nodig. Animaties zijn CSS-only en worden automatisch beperkt bij <code>prefers-reduced-motion</code>.</p></div>`;
  $('#saveLearningPaths').onclick=()=>{for(const k of Object.keys(PATHS)){state.learning_paths[k]={...state.learning_paths[k],active:!!$(`[data-path-active="${k}"]`)?.checked,priority:$(`[data-path-priority="${k}"]`)?.value||'normal',minutes:+$(`[data-path-minutes="${k}"]`)?.value||PATHS[k].defaultMinutes,exam:PATHS[k].kind==='history'&&!!$(`[data-path-exam="${k}"]`)?.checked,telegram:!!$(`[data-path-telegram="${k}"]`)?.checked}}save();toast('Leerpaden bewaard. Telegram gebruikt deze selectie bij de volgende server-sync.');renderSettings()};
  $('#paRunSystem').onclick=paSystemCheck;refreshPaAi(false);paSystemCheck();bindTelegramPanel();
}

function showPage(n){
  ['home','learn','exam','knowledge','library','settings'].forEach(x=>$('#p-'+x)?.classList.toggle('hidden',x!==n));
  $$('[data-page]').forEach(x=>x.classList.toggle('active',x.dataset.page===n));
  const t={
    home:['Paideia','Snel, efficiënt en cumulatief leren'],
    learn:['Leren','Dagelijkse kennisblokken en oefenhistoriek'],
    exam:['Examens','Universitaire toetsen, weging en historiek'],
    knowledge:['Kennisbank','Wat je duurzaam beheerst'],
    library:['Bronnen','Herkomst en kennis-packs'],
    settings:['Instellingen','AI-docent, Telegram en prestaties']
  }[n]||['Paideia',''];
  $('#paTitle').textContent=t[0];$('#paSub').textContent=t[1];
  try{
    ({home:renderHome,learn:renderLearn,exam:renderExam,knowledge:renderKnowledge,library:renderLibrary,settings:renderSettings}[n])()
  }catch(e){
    console.error('Paideia page',n,e);
    $('#p-'+n).innerHTML=`<div class="callout bad"><strong>Dit onderdeel kon niet laden.</strong><p>${esc(e.message||e)}</p><button class="btn" onclick="location.reload()">App opnieuw laden</button></div>`
  }
  scrollTo({top:0,behavior:'smooth'})
}
function back(){location.href='../../index.html?resume=1&profile='+encodeURIComponent(PID)+'&page=apps'}
function paStandalone(){return matchMedia('(display-mode: standalone)').matches||matchMedia('(display-mode: fullscreen)').matches||matchMedia('(display-mode: minimal-ui)').matches||navigator.standalone===true||document.referrer.startsWith('android-app://')}
function paDevice(){
  const ua=navigator.userAgent||'',touch=(navigator.maxTouchPoints||0)>0,ipad=/iPad/i.test(ua)||(navigator.platform==='MacIntel'&&touch),w=Math.round(window.visualViewport?.width||innerWidth),h=Math.round(window.visualViewport?.height||innerHeight);
  if(ipad)return{kind:'tablet',label:'iPad'};
  if(touch&&Math.min(w,h)>=600&&Math.max(w,h)<=1500)return{kind:'tablet',label:'tablet'};
  if(w<=720)return{kind:'phone',label:'telefoon'};
  if(touch&&w<=1180)return{kind:'tablet',label:'tablet'};
  return{kind:'desktop',label:'laptop'}
}
function updateMode(){
  const d=paDevice(),app=paStandalone();
  document.body.classList.remove('device-phone','device-tablet','device-desktop');
  document.body.classList.add('device-'+d.kind);
  document.documentElement.dataset.device=d.kind;
  document.documentElement.dataset.displayMode=app?'app':'web';
  $('#paMode').textContent=(app?'App':'Browser')+' · '+d.label+' · '+Math.round(window.visualViewport?.width||innerWidth)+'×'+Math.round(window.visualViewport?.height||innerHeight)
}
async function init(){
  if(!PID||!profile())return location.href='../../index.html';
  await loadSeed();loadState();checkStreak();
  window.AthSync?.startAuto(PID);
  showPage('home');
  $$('[data-page]').forEach(b=>b.onclick=()=>showPage(b.dataset.page));
  $('#athBackLink')?.addEventListener('click',e=>{e.preventDefault();back()});
  $('#backAthMobile')?.addEventListener('click',back);
  $('#closeSession').onclick=()=>$('#sessionModal').classList.remove('open');
  $('#revealBtn').onclick=reveal;$('#nextBtn').onclick=nextQ2;
  $('#useFreeze').onclick=()=>{const n=state.pending_missed||1;if(state.icecubes>=n){state.icecubes-=n;state.last_completed=iso(new Date(Date.now()-86400000));state.pending_missed=0;save();$('#freezeModal').classList.remove('open');toast(`Streak bevroren met ${n} ijsblokje${n===1?'':'s'}.`);renderHome()}};
  $('#breakStreak').onclick=()=>{state.streak=0;state.last_completed='';save();$('#freezeModal').classList.remove('open');renderHome()};
  updateMode();addEventListener('resize',updateMode);window.visualViewport?.addEventListener('resize',updateMode);
  window.addEventListener('unhandledrejection',e=>{console.error('Paideia promise',e.reason);toast('Een onderdeel kon niet afronden. Je voortgang blijft bewaard.')});
  if('requestIdleCallback'in window)requestIdleCallback(()=>ensureSupplementQuestions().catch(()=>{}),{timeout:12000})
}
init();
})();
