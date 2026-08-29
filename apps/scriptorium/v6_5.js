(function(){
'use strict';
const PREV_INIT=window.init;
const VERSION='6.5';
let pomodoroHandle=null,pomodoroUntil=0;
function qs(id){return document.getElementById(id)}
function forcedView(){
  const url=new URL(location.href);
  const q=url.searchParams.get('view');
  if(q==='desktop'||q==='mobile'){ localStorage.setItem('scriptorium_interface_mode',q); return q; }
  return localStorage.getItem('scriptorium_interface_mode')||'auto';
}
function deviceInfo(){
  const forced=forcedView();
  const mobileByWidth=window.innerWidth<=780;
  const standalone=window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone===true;
  const mode=forced==='auto' ? (mobileByWidth?'mobile':'desktop') : forced;
  return {standalone,mode,forced};
}
function updateView65(){
  const info=deviceInfo();
  document.body.classList.toggle('force-mobile',info.forced==='mobile');
  document.body.classList.toggle('force-desktop',info.forced==='desktop');
  document.body.classList.toggle('device-mobile',info.mode==='mobile');
  document.body.classList.toggle('device-desktop',info.mode==='desktop');
  document.body.classList.toggle('app-standalone',info.standalone);
  const chip=qs('installStatusChip');
  if(chip){
    chip.textContent=(info.standalone?'Appmodus':'Webmodus')+' · '+(info.mode==='mobile'?'telefoon':'laptop');
    chip.classList.toggle('app-mode',info.standalone);
    chip.classList.toggle('web-mode',!info.standalone);
  }
}
function bindTools65(){
  const kits={
    copyBronChecklist:`BRONKRITIEK-CHECKLIST\n1) Wat zie ik letterlijk in de bron?\n2) Wat is editie / restauratie / objectdata?\n3) Wie produceerde deze bron, voor welk doel en publiek?\n4) Wat is de maximale claim die deze bron wél kan dragen?\n5) Welke aantrekkelijke maar te sterke conclusie moet ik bewust vermijden?\n6) Welke controlebron zou mijn interpretatie echt kunnen testen?`,
    copySQChecklist:`STATUS QUAESTIONIS-DEBATKAART\n- Wat is het centrale historiografische probleem?\n- Welke 2-4 echte posities zijn zichtbaar?\n- Waarover zijn auteurs het eens?\n- Waarom verschillen ze: corpus, definitie, schaal of methode?\n- Waar ligt dan precies de lacune waar nieuw onderzoek iets kan toevoegen?`,
    copyPlannerPrompt:`ONDERZOEKSPLANNER\nOnderzoeksvraag:\nKernbegrippen + werkdefinitie:\nCorpus (inclusie/exclusie):\nPrimaire bronsoorten:\nMethode per inferentiestap:\nBelangrijkste rivaliserende verklaring:\nVerwachte beperking:\nVolgende concrete onderzoeksactie:`,
    copyOralDefensePrompt:`MONDELINGE-VERDEDIGINGCHECK\n1) Waarom is deze vraag historisch antwoordbaar?\n2) Waarom past dit corpus bij die vraag?\n3) Welke inferentie controleert je methode precies?\n4) Wat is je grootste beperking?\n5) Hoe begrens je je conclusie zodat ze verdedigbaar blijft?`
  };
  Object.entries(kits).forEach(([id,text])=>{const el=qs(id); if(el) el.onclick=async()=>{await copyText(text); toast('Tool gekopieerd.','good');};});
  const clearBtn=qs('clearForcedView'); if(clearBtn) clearBtn.onclick=()=>{localStorage.removeItem('scriptorium_interface_mode'); const url=new URL(location.href); url.searchParams.delete('view'); location.href=url.toString();};
  const start=qs('startPomodoro25'), stop=qs('stopPomodoro');
  function renderTimer(){ const box=qs('pomodoroStatus'); if(!box) return; if(!pomodoroUntil){ box.textContent='Geen actieve focustimer.'; return; } const ms=pomodoroUntil-Date.now(); if(ms<=0){ clearInterval(pomodoroHandle); pomodoroHandle=null; pomodoroUntil=0; box.textContent='Focusblok voltooid ✅ Neem kort pauze of start een nieuwe sessie.'; toast('Focusblok voltooid.','good'); return; } const min=Math.floor(ms/60000), sec=Math.floor((ms%60000)/1000); box.textContent=`Focustimer actief: ${String(min).padStart(2,'0')}:${String(sec).padStart(2,'0')}`; }
  if(start) start.onclick=()=>{ pomodoroUntil=Date.now()+25*60000; if(pomodoroHandle) clearInterval(pomodoroHandle); pomodoroHandle=setInterval(renderTimer,1000); renderTimer(); toast('25 minuten focus gestart.','good'); };
  if(stop) stop.onclick=()=>{ if(pomodoroHandle) clearInterval(pomodoroHandle); pomodoroHandle=null; pomodoroUntil=0; renderTimer(); toast('Focustimer gestopt.'); };
  renderTimer();
}
window.init=async function(){ if(PREV_INIT) await PREV_INIT(); document.title='Scriptorium V6.5.1 - Academische Onderzoekscoach'; document.querySelectorAll('.version-pill').forEach(x=>x.textContent='V6.5.1'); const small=document.querySelector('.brand small'); if(small) small.textContent='Onderzoekscoach V6.5.1 · klassieke huisstijl · extra bronnen · training · sync'; const sub=document.querySelector('.topbar-sub'); if(sub) sub.textContent='Scriptorium V6.5.1 · responsieve studie-app voor laptop en telefoon'; updateView65(); bindTools65(); };
window.addEventListener('resize',updateView65);
window.addEventListener('orientationchange',updateView65);
})();
