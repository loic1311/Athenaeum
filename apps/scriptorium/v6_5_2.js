(function(){
'use strict';
const PREV_INIT=window.init;
const PREV_SHOW=window.showPage;
const VERSION='6.5.2';

function isStandalone(){return window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true;}
function isPhoneLayout(){return document.body.classList.contains('force-mobile')||window.innerWidth<=780;}
function installMobileNav(){
  if(document.getElementById('mobileBottomNav')) return;
  const nav=document.createElement('nav');
  nav.id='mobileBottomNav'; nav.className='mobile-bottom-nav';
  nav.setAttribute('aria-label','Mobiele hoofdnavigatie');
  nav.innerHTML=`
    <button data-mobile-page="dashboard"><span class="mbn-icon">⌂</span><span>Home</span></button>
    <button data-mobile-page="training"><span class="mbn-icon">◎</span><span>Training</span></button>
    <button data-mobile-page="corpus"><span class="mbn-icon">▤</span><span>Corpus</span></button>
    <button id="mobileMoreBtn"><span class="mbn-icon">☰</span><span>Menu</span></button>`;
  document.body.appendChild(nav);
  const sheet=document.createElement('div'); sheet.id='mobileMenuSheet'; sheet.className='mobile-menu-sheet';
  sheet.innerHTML=`<div class="mobile-sheet-backdrop" data-mobile-close></div><section class="mobile-sheet-panel" role="dialog" aria-modal="true" aria-label="Scriptorium menu">
    <div class="mobile-sheet-head"><div><strong>Scriptorium</strong><div class="tiny" id="mobilePwaState">status</div></div><button class="mobile-sheet-close" data-mobile-close aria-label="Sluiten">×</button></div>
    <div class="mobile-sheet-grid">
      <button data-mobile-page="sources">🏺 <span>Primaire bronnen</span></button>
      <button data-mobile-page="progress">📈 <span>Voortgang</span></button>
      <button data-mobile-page="atelier">✍️ <span>Leeratelier</span></button>
      <button data-mobile-page="discovery">🔎 <span>Vondsten</span></button>
      <button data-mobile-page="exchange">📚 <span>Corpusanalyse</span></button>
      <button data-mobile-page="sync">↔ <span>Synchronisatie</span></button>
      <button data-mobile-page="settings">⚙ <span>Instellingen</span></button>
      <button id="mobileHelpBtn">? <span>Werkwijze</span></button>
    </div>
    <div class="mobile-install-note" id="mobileInstallNote"></div>
  </section>`;
  document.body.appendChild(sheet);
  document.addEventListener('click',e=>{
    const p=e.target.closest('[data-mobile-page]');
    if(p){e.preventDefault(); closeMobileMenu(); window.showPage?.(p.dataset.mobilePage);}
    if(e.target.closest('#mobileMoreBtn')){e.preventDefault(); openMobileMenu();}
    if(e.target.closest('[data-mobile-close]')){e.preventDefault();closeMobileMenu();}
    if(e.target.closest('#mobileHelpBtn')){e.preventDefault();closeMobileMenu();document.getElementById('helpBtn')?.click();}
  });
}
function openMobileMenu(){document.getElementById('mobileMenuSheet')?.classList.add('open');document.body.classList.add('mobile-menu-open');updatePwaState();}
function closeMobileMenu(){document.getElementById('mobileMenuSheet')?.classList.remove('open');document.body.classList.remove('mobile-menu-open');}
function activeMobile(page){
  document.querySelectorAll('#mobileBottomNav [data-mobile-page]').forEach(b=>b.classList.toggle('active',b.dataset.mobilePage===page));
  document.getElementById('mobileMoreBtn')?.classList.toggle('active',!['dashboard','training','corpus'].includes(page));
}
function updatePwaState(){
  const standalone=isStandalone();
  const state=document.getElementById('mobilePwaState');
  const note=document.getElementById('mobileInstallNote');
  if(state) state.textContent=standalone?'Appmodus · telefoon':'Webmodus · telefoon';
  if(note) note.innerHTML=standalone
    ? '<strong>✓ Echte appmodus actief.</strong><br>Scriptorium draait standalone vanaf je beginscherm.'
    : '<strong>Je gebruikt nog webmodus.</strong><br>Als Android alleen een grijze G-snelkoppeling aanbiedt, verwijder die eerst. Open daarna de GitHub Pages-link opnieuw in Chrome, herlaad één keer en kies in Chrome <b>Install app</b> wanneer die optie verschijnt. Een gewone “Add to Home screen”-shortcut blijft webmodus.';
}
function updateModeChip652(){
  const chip=document.getElementById('installStatusChip'); if(!chip)return;
  const phone=isPhoneLayout(); const standalone=isStandalone();
  chip.textContent=(standalone?'Appmodus':'Webmodus')+' · '+(phone?'telefoon':'laptop');
  chip.classList.toggle('app-mode',standalone);chip.classList.toggle('web-mode',!standalone);
}
function pwaHealthCard(){
  const settings=document.getElementById('page-settings'); if(!settings||document.getElementById('pwaPhoneCard'))return;
  const card=document.createElement('div');card.id='pwaPhoneCard';card.className='card pwa-phone-card';
  card.innerHTML=`<div class="spread"><div><h4>Telefoon-app / PWA</h4><p>Controleer of je een echte standalone app hebt in plaats van alleen een webshortcut.</p></div><span class="badge" id="pwaInstallBadge">controleren…</span></div><div id="pwaInstallDetails" class="pwa-check-grid"></div><div class="tiny" style="margin-top:10px">Een grijze letter-G betekent doorgaans dat Android een gewone shortcut heeft gemaakt in plaats van de manifest-app te installeren.</div>`;
  const health=settings.querySelector('.grid.two');
  if(health) health.insertAdjacentElement('afterend',card); else settings.appendChild(card);
}
async function renderPwaHealth(){
  const box=document.getElementById('pwaInstallDetails'),badge=document.getElementById('pwaInstallBadge'); if(!box)return;
  let manifest=false,sw=false,controlled=Boolean(navigator.serviceWorker?.controller);
  try{manifest=(await fetch('./manifest.webmanifest',{cache:'no-store'})).ok;}catch{}
  try{sw=Boolean(await navigator.serviceWorker?.getRegistration('./'));}catch{}
  const https=location.protocol==='https:'||location.hostname==='localhost';
  const app=isStandalone();
  const rows=[['HTTPS',https],['Manifest',manifest],['Service worker geregistreerd',sw],['Pagina door service worker gecontroleerd',controlled],['Standalone appmodus',app]];
  box.innerHTML=rows.map(([label,ok])=>`<div class="pwa-check ${ok?'ok':'bad'}"><span>${ok?'✓':'!'}</span><strong>${label}</strong><em>${ok?'OK':'nog niet'}</em></div>`).join('');
  if(badge){badge.textContent=app?'App geïnstalleerd':(https&&manifest&&sw&&controlled?'PWA technisch klaar':'PWA nog niet klaar');badge.className='badge '+(app?'good':https&&manifest&&sw&&controlled?'accent':'warn');}
}
async function ensureServiceWorkerEarly(){
  if(!('serviceWorker'in navigator)||!(location.protocol==='https:'||location.hostname==='localhost'))return;
  try{
    const reg=await navigator.serviceWorker.register('./sw.js',{scope:'./'});await reg.update().catch(()=>{});
    if(!navigator.serviceWorker.controller){
      navigator.serviceWorker.addEventListener('controllerchange',()=>{updatePwaState();renderPwaHealth();},{once:true});
    }
  }catch(e){console.warn('V6.5.2 SW registration failed',e);}
}
window.showPage=function(name){const r=PREV_SHOW?PREV_SHOW(name):undefined;activeMobile(name);if(name==='settings')setTimeout(renderPwaHealth,50);return r;};
window.init=async function(){
  ensureServiceWorkerEarly();
  if(PREV_INIT) await PREV_INIT();
  document.title='Scriptorium V6.5.2 - Academische Onderzoekscoach';
  document.querySelectorAll('.version-pill').forEach(x=>x.textContent='V6.5.2');
  const small=document.querySelector('.brand small');if(small)small.textContent='Onderzoekscoach V6.5.2 · laptop + telefoon · authentieke bronnen · training · sync';
  const sub=document.querySelector('.topbar-sub');if(sub)sub.textContent='Scriptorium V6.5.2 · geoptimaliseerd voor laptop en telefoon';
  installMobileNav();pwaHealthCard();updatePwaState();updateModeChip652();
  const q=new URL(location.href).searchParams.get('page');if(q&&['dashboard','training','corpus','sources','progress','atelier','discovery','exchange','sync','settings'].includes(q))window.showPage(q);else activeMobile(document.querySelector('.page.active')?.id?.replace('page-','')||'dashboard');
  setTimeout(renderPwaHealth,800);
};
window.addEventListener('resize',()=>{updateModeChip652();updatePwaState();});
window.addEventListener('pageshow',()=>{updateModeChip652();updatePwaState();});
ensureServiceWorkerEarly();
})();