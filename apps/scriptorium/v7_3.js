(function(){
'use strict';
const PID=window.ATH_PROFILE_ID||localStorage.getItem('athenaeum_current_profile')||'';
const PREV_INIT=window.init;
const esc3=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function brand73(){document.title='Scriptorium V7.3 — AI-docent';document.querySelectorAll('.version-pill').forEach(x=>x.textContent='V7.3');const sm=document.querySelector('.brand small');if(sm)sm.textContent='V7.3 · AI-docent · veilige start · incrementele sync · H5P';}
function gradeHtml(g,quota){
  const cls=g.score>=18?'good':g.score>=14?'warn':'bad';
  const dims=Object.entries(g.dimension_scores||{}).map(([k,v])=>`<div class="dimension"><strong>${esc3(k)}</strong><span>${Number(v).toFixed(1)}/20</span></div>`).join('');
  return `<div class="feedback-card"><div class="spread"><div><div class="score-big ${cls}">${Number(g.score).toFixed(1)}/20</div><div class="tiny">${esc3(g.verdict||'')}</div></div><span class="badge ${g.pass_18plus?'good':'warn'}">${g.pass_18plus?'18+ gehaald':'nog geen 18+'}</span></div>${dims?`<div class="dimension-grid" style="margin-top:12px">${dims}</div>`:''}${(g.strengths||[]).length?`<h5 style="margin-top:14px">Sterktes</h5><ul>${g.strengths.map(x=>`<li>${esc3(x)}</li>`).join('')}</ul>`:''}${(g.critical_issues||[]).length?`<h5 style="margin-top:14px">Kritieke problemen</h5><ul>${g.critical_issues.map(x=>`<li>${esc3(x)}</li>`).join('')}</ul>`:''}${(g.feedback_steps||[]).length?`<h5 style="margin-top:14px">Prioritaire revisies</h5>${g.feedback_steps.map(x=>`<div class="callout" style="margin-top:7px"><strong>${esc3(x.priority)}. ${esc3(x.issue)}</strong><div class="tiny" style="margin-top:5px">${esc3(x.why_it_matters)}</div><div style="margin-top:7px">${esc3(x.revision_action)}</div><div class="tiny" style="margin-top:5px"><strong>Zelftest:</strong> ${esc3(x.self_test)}</div></div>`).join('')}`:''}${g.next_drill?`<div class="callout good" style="margin-top:12px"><strong>Volgende drill:</strong> ${esc3(g.next_drill)}</div>`:''}${quota?`<div class="tiny" style="margin-top:8px">Gratis AI-budget: ${esc3(AthAI.quotaText(quota))}</div>`:''}</div>`
}
async function aiGradeTraining(){
  const ex=state.currentExercise;if(!ex)return toast('Genereer eerst een oefening.','warn');
  const answer=document.getElementById('trainingAnswer')?.value.trim()||'';if(answer.length<80)return toast('Werk je antwoord eerst voldoende uit.','warn');
  if(!window.AthAI)return toast('AI-docent is niet geladen.','bad');
  const btn=document.getElementById('aiGradeTraining');if(btn){btn.disabled=true;btn.textContent='AI-docent beoordeelt…'}
  try{
    const attempt=await saveCurrentAttempt(answer,true),module=TRAINING_MODULES.find(m=>m.id===ex.module_id),bench=trainingBenchmarks(module),rubric=gradingRubric(module,ex.difficulty);
    const r=await AthAI.feedback(PID,{mode:'scriptorium_grade',attempt_id:attempt.attempt_id,question:exerciseText(ex),answer,expected:JSON.stringify(ex.expected||{},null,2),context:JSON.stringify(bench||[],null,2),rubric:JSON.stringify(rubric||{},null,2)});
    const g=r.feedback;g.pass_18plus=Boolean(g.score>=18&&(g.critical_issues||[]).length===0);attempt.grade=g;attempt.ai_model=r.model_used;attempt.graded_at=Date.now();
    const s=activeSession();if(s&&attempt.module_id===s.module_id&&!s.graded_ids.includes(attempt.attempt_id))s.graded_ids.push(attempt.attempt_id);
    await saveTrainingState();renderTraining();renderTrainingFocus();
    const el=document.getElementById('trainingFeedback');if(el)el.innerHTML=gradeHtml(g,r.quota);
    toast(`AI-docent: ${Number(g.score).toFixed(1)}/20.`,g.score>=18?'good':g.score>=14?'warn':'bad');
  }catch(e){toast(e.message,'bad')}finally{if(btn){btn.disabled=false;btn.textContent='🧑‍🏫 AI-docent beoordelen'}}
}
function selectedBenchmarks(){
  const sel=[...(document.getElementById('benchmarkWorks')?.selectedOptions||[])].map(o=>o.value);
  return (state.works||[]).filter(w=>sel.includes(String(w.id))).slice(0,4).map(w=>({author:w.author,title:w.title,weight:w.weight,skill_lessons:w.analysis?.skill_lessons||[],writing_techniques:w.analysis?.writing_techniques||[],research_techniques:w.analysis?.research_techniques||[]}));
}
async function atelierAiReview(){
  const text=document.getElementById('ownText')?.value.trim()||'';if(text.length<80)return toast('Plak eerst een voldoende lang eigen fragment.','warn');
  const goal=document.getElementById('atelierGoal')?.value||'Academische kwaliteit verbeteren';const box=document.getElementById('atelierAiFeedback');const btn=document.getElementById('atelierAiReview');
  if(btn){btn.disabled=true;btn.textContent='AI-docent beoordeelt…'};if(box)box.innerHTML='<div class="empty">Strenge feedback wordt opgebouwd…</div>';
  try{
    const r=await AthAI.feedback(PID,{mode:'scriptorium_grade',attempt_id:'atelier_'+Date.now(),question:`Beoordeel dit eigen academische tekstfragment met doel: ${goal}. Geef alleen feedback en revisieacties; schrijf het fragment niet voor de student om.`,answer:text,expected:'Het fragment moet zelfstandig, precies, bronkritisch, methodologisch coherent en academisch helder zijn.',context:JSON.stringify(selectedBenchmarks(),null,2),rubric:'Gebruik de zes Scriptorium-dimensies. Beoordeel de tekst als master-niveau geschiedenis. 18+ is uitzonderlijk.'});
    if(box)box.innerHTML=gradeHtml(r.feedback,r.quota);
  }catch(e){if(box)box.innerHTML=`<div class="callout bad">${esc3(e.message)}</div>`}finally{if(btn){btn.disabled=false;btn.textContent='🧑‍🏫 AI-docent feedback'}}
}
function bindAi73(){
  const b=document.getElementById('aiGradeTraining');if(b)b.onclick=aiGradeTraining;
  const a=document.getElementById('atelierAiReview');if(a)a.onclick=atelierAiReview;
}
window.init=async function(){await PREV_INIT();brand73();bindAi73();document.addEventListener('click',e=>{const n=e.target.closest('[data-page],[data-go]');if(n)setTimeout(bindAi73,0)},true)};
})();