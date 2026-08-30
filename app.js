
(function(){
'use strict';const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];const S=AthStore;
let editing=null,selectedAvatar='bust',selectedApps=[],pendingUnlock=null,pendingLaunch=null,pendingPage='home';
function assetAvatar(a){return './assets/avatars/'+a+'.svg'}
function assetLogo(a){return './assets/logos/'+a+'.svg'}
function openModal(id){$('#'+id).classList.add('open')}function closeModal(id){$('#'+id).classList.remove('open')}
function setProfileLocked(locked){
  const gate=$('#profileGate'),shell=$('#mainShell');
  document.documentElement.classList.toggle('profile-locked',!!locked);
  document.body.classList.toggle('profile-locked',!!locked);
  if(gate){
    gate.classList.toggle('hidden',!locked);
    gate.setAttribute('aria-hidden',locked?'false':'true');
  }
  if(shell){
    shell.classList.toggle('hidden',!!locked);
    shell.toggleAttribute('hidden',!!locked);
    shell.toggleAttribute('inert',!!locked);
    shell.setAttribute('aria-hidden',locked?'true':'false');
  }
}
function clearProtectedView(){
  ['home','apps','library','progress','settings'].forEach(n=>{const el=$('#page-'+n);if(el)el.innerHTML=''});
  if($('#pageTitle'))$('#pageTitle').textContent='Athenaeum';
  if($('#pageSubtitle'))$('#pageSubtitle').textContent='Selecteer eerst een profiel';
  if($('#sideUser'))$('#sideUser').innerHTML='';
  if($('#sideApps'))$('#sideApps').innerHTML='';
}
function requireProfile(){
  const p=current();
  if(!p){clearProtectedView();setProfileLocked(true);return null}
  return p;
}
function renderProfiles(){const ps=S.loadProfiles();const g=$('#profileGrid');g.innerHTML=ps.map(p=>`<button class="profile-card" data-profile="${p.id}"><img src="${assetAvatar(p.avatar)}"><strong>${esc(p.name)}</strong><small>${p.pin_hash?'🔒 PIN':'zonder PIN'}</small>${appBadges(p)}</button>`).join('')+`<button class="profile-card profile-add" id="addProfile"><b>＋</b><strong>Nieuw profiel</strong><small>eigen apps, data en voortgang</small></button>`;$$('[data-profile]').forEach(b=>b.onclick=()=>chooseProfile(b.dataset.profile));$('#addProfile').onclick=()=>editProfile(null)}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function appMeta(name){return name==='scriptorium'?{name:'Scriptorium',logo:assetLogo('scriptorium'),desc:'Academisch onderzoek, corpus, primaire bronnen, theorie en training.'}:{name:'Paideia',logo:assetLogo('paideia'),desc:'Dagelijks leren, kennisnetwerken, examens, streaks en herhaling.'}}
function allowedApps(p=current()){return p?S.profileApps(p):[]}
function hasApp(name,p=current()){return allowedApps(p).includes(name)}
function appBadges(p){const a=allowedApps(p);return a.length?`<div class="profile-app-badges">${a.map(x=>`<span>${esc(appMeta(x).name)}</span>`).join('')}</div>`:'<div class="profile-app-badges"><span>nog geen apps</span></div>'}

function editProfile(id){editing=id;const p=S.loadProfiles().find(x=>x.id===id);selectedAvatar=p?.avatar||'bust';selectedApps=p?allowedApps(p):[];$('#profileModalTitle').textContent=p?'Accountinstellingen':'Nieuw profiel';$('#profileName').value=p?.name||'';$('#profilePin').value='';$('#deleteProfileBtn').classList.toggle('hidden',!p);$('#removePinBtn').classList.toggle('hidden',!p?.pin_hash);$('#avatarChoices').innerHTML=S.AVATARS.map(a=>`<button class="avatar-choice ${a===selectedAvatar?'active':''}" data-avatar="${a}" title="${a}"><img src="${assetAvatar(a)}"></button>`).join('');$$('[data-avatar]').forEach(b=>b.onclick=()=>{selectedAvatar=b.dataset.avatar;$$('[data-avatar]').forEach(x=>x.classList.toggle('active',x.dataset.avatar===selectedAvatar))});const access=$('#appAccessChoices');if(access)access.innerHTML=S.APPS.map(a=>{const m=appMeta(a);return `<label class="app-access-choice"><input type="checkbox" data-app-access="${a}" ${selectedApps.includes(a)?'checked':''}><img src="${m.logo}"><span><strong>${m.name}</strong><small>${m.desc}</small></span></label>`}).join('');$$('[data-app-access]').forEach(c=>c.onchange=()=>{selectedApps=$$('[data-app-access]:checked').map(x=>x.dataset.appAccess)});openModal('profileModal')}
async function saveProfile(){const name=$('#profileName').value.trim();if(!name)return S.toast('Geef een naam.');const pin=$('#profilePin').value.trim();selectedApps=$$('[data-app-access]:checked').map(x=>x.dataset.appAccess);let p;if(editing){const patch={name,avatar:selectedAvatar,apps:selectedApps};if(pin)patch.pin=pin;p=await S.updateProfile(editing,patch)}else p=await S.createProfile({name,avatar:selectedAvatar,pin,apps:selectedApps});closeModal('profileModal');renderProfiles();if(editing){renderShell();showPage('apps')}else enterProfile(p.id)}
async function chooseProfile(id){const p=S.loadProfiles().find(x=>x.id===id);if(!p)return;if(p.pin_hash){pendingUnlock=id;$('#unlockPin').value='';openModal('pinModal');setTimeout(()=>$('#unlockPin').focus(),80)}else enterProfile(id)}
async function unlock(){const p=S.loadProfiles().find(x=>x.id===pendingUnlock);if(!p)return;const ok=await S.verifyPin(p,$('#unlockPin').value);if(!ok)return S.toast('Onjuiste PIN.');closeModal('pinModal');enterProfile(p.id)}
function enterProfile(id){
  S.setCurrentProfile(id);
  sessionStorage.setItem('athenaeum_unlocked_'+id,'1');
  setProfileLocked(false);
  renderShell();
  showPage(pendingPage||'home');
  AthSync.startAuto(id);
  const target=pendingLaunch;pendingLaunch=null;pendingPage='home';
  if(target&&hasApp(target,current()))setTimeout(()=>openApp(target),180)
}
function leaveProfile(){
  AthSync.stopAuto?.();
  const active=S.currentProfile();
  if(active?.id)sessionStorage.removeItem('athenaeum_unlocked_'+active.id);
  S.setCurrentProfile('');
  clearProtectedView();
  setProfileLocked(true);
  renderProfiles();
  window.scrollTo({top:0,behavior:'auto'});
}
function current(){return S.currentProfile()}
function avatar(p){return assetAvatar(p.avatar)}
function renderShell(){const p=current();if(!p)return leaveProfile();$('#sideUser').innerHTML=`<img src="${avatar(p)}"><div class="user-copy"><strong>${esc(p.name)}</strong><small>${p.pin_hash?'PIN beveiligd':'profiel actief'}</small></div><div class="side-user-actions"><button id="sideAccount">Account</button><button id="sideSwitch">Wissel</button></div>`;const sa=$('#sideApps');if(sa)sa.innerHTML=allowedApps(p).map(a=>{const m=appMeta(a);return `<button class="side-app-link" data-side-app="${a}"><img src="${m.logo}"><span>${m.name}</span></button>`}).join('')||'<div class="tiny" style="padding:6px 10px;color:#8aa39c">Geen apps toegewezen</div>';$$('[data-side-app]').forEach(b=>b.onclick=()=>openApp(b.dataset.sideApp));$('#sideAccount')?.addEventListener('click',()=>editProfile(p.id));$('#sideSwitch')?.addEventListener('click',leaveProfile);const s1=$('#sheetScriptorium'),s2=$('#sheetPaideia');if(s1)s1.classList.toggle('hidden',!hasApp('scriptorium',p));if(s2)s2.classList.toggle('hidden',!hasApp('paideia',p));updateMode()}
function openApp(name){const p=current();if(!p)return;if(!hasApp(name,p))return S.toast(`${appMeta(name).name} is niet toegewezen aan dit profiel.`);const url=name==='scriptorium'?`./apps/scriptorium/index.html?ath_profile=${encodeURIComponent(p.id)}`:`./apps/paideia/index.html?ath_profile=${encodeURIComponent(p.id)}`;location.href=url}
function todayISO(){return new Date().toISOString().slice(0,10)}
function renderHome(){const p=requireProfile();if(!p)return;const st=S.getProfileData(p.id,'paideia_state',{streak:0,icecubes:p.icecubes??2,last_completed:'',weekly_scores:[],monthly_scores:[],mastery:{}});const sync=AthSync.cfg(p.id),apps=allowedApps(p);const quick=apps.length?apps.map(a=>{const m=appMeta(a);const action=a==='paideia'?'Start sessie':'Open werkruimte';return `<div class="quick-app"><img src="${m.logo}"><div class="grow"><h3>${m.name}</h3><p>${m.desc}</p></div><button class="btn ${a==='paideia'?'gold':'primary'}" data-app="${a}">${action}</button></div>`}).join(''):`<div class="no-apps">Aan dit profiel zijn nog geen apps gekoppeld. Open <strong>Account</strong> om toegang toe te wijzen.</div>`;const paideia=hasApp('paideia',p)?`<div class="card"><h3>Vandaag</h3><p><strong>🏺 Oude geschiedenis — 20 min</strong><br><span class="muted">Structuren, evoluties, conjuncturen, personen, bronnen en historiografische problemen.</span></p><p><strong>🌍 Algemene geschiedenis — 10 min</strong><br><span class="muted">Dagelijks chronologisch raamwerk en synthese.</span></p><p class="tiny">Algemene kennis/skills verschijnt periodiek als extra sessie.</p></div><div class="card"><h3>Volgende evaluaties</h3><p>📅 <strong>Wekelijks examen</strong>: cumulatief en universitair van stijl.</p><p>🧠 <strong>Maandelijkse mastery check</strong>: synthese en langere open vragen.</p><p>🧊 Bij ≥75% verdien je een streak-freeze.</p></div>`:`<div class="card"><h3>Jouw Athenaeum</h3><p class="muted">Home blijft bewust compact: hier start je je toegewezen apps en zie je platformstatus. In <strong>Mijn apps</strong> staan de inhoudelijke voortgang en appdetails.</p></div><div class="card"><h3>Profieltoegang</h3><p>${apps.length?apps.map(a=>`✓ ${appMeta(a).name}`).join('<br>'):'Nog geen apps gekoppeld.'}</p></div>`;$('#page-home').innerHTML=`<div class="hero slide-up"><div class="spread"><div><div class="chip">ATHENAEUM V1.0.9</div><h2>Welkom terug, ${esc(p.name)}</h2><p>Je persoonlijke ingang naar onderzoek en leren. Alleen de apps die aan dit profiel zijn toegewezen verschijnen hier.</p></div><img src="${avatar(p)}" style="width:82px;height:82px;border-radius:50%"></div></div><div class="stat-grid"><div class="stat"><div class="k">🔥 Streak</div><div class="v">${hasApp('paideia',p)?(st.streak||0)+' dagen':'—'}</div></div><div class="stat"><div class="k">🧊 IJsblokjes</div><div class="v">${hasApp('paideia',p)?(st.icecubes??2):'—'}</div></div><div class="stat"><div class="k">Jouw apps</div><div class="v">${apps.length}</div></div><div class="stat"><div class="k">Cloudsync</div><div class="v" style="font-size:18px">${sync.enabled?'actief':'optioneel'}</div></div></div><div class="quick-apps">${quick}</div><div class="grid two" style="margin-top:18px">${paideia}</div>`;$$('[data-app]').forEach(b=>b.onclick=()=>openApp(b.dataset.app))}
function renderApps(){const p=requireProfile();if(!p)return;const apps=allowedApps(p),st=S.getProfileData(p.id,'paideia_state',{streak:0,weekly_scores:[],monthly_scores:[],mastery:{}});const cards=apps.map(a=>{const m=appMeta(a);if(a==='scriptorium')return `<article class="app-detail"><div class="app-detail-head"><img src="${m.logo}"><div><h3>Scriptorium</h3><div class="tiny">Onderzoek & academische vaardigheden</div></div></div><div class="app-metrics"><div class="app-metric"><b>56</b><span>kernwerken</span></div><div class="app-metric"><b>56</b><span>geanalyseerd</span></div><div class="app-metric"><b>23</b><span>trainingsmodules</span></div></div><p class="muted">Beheer het corpus, zoek nieuwe werken en primaire bronnen, bestudeer theorie en train onderzoeksvaardigheden.</p><div class="row"><button class="btn primary" data-app="scriptorium">Open Scriptorium</button><span class="chip">toegang via dit profiel</span></div></article>`;const mastery=st.mastery||{};const avg=[mastery.ancient,mastery.general_history,mastery.general_knowledge].filter(x=>Number.isFinite(+x));const score=avg.length?Math.round(avg.reduce((x,y)=>x+(+y),0)/avg.length):0;return `<article class="app-detail"><div class="app-detail-head"><img src="${m.logo}"><div><h3>Paideia</h3><div class="tiny">Levenslang leren & kennisbehoud</div></div></div><div class="app-metrics"><div class="app-metric"><b>${st.streak||0}</b><span>streak</span></div><div class="app-metric"><b>${score}%</b><span>gem. mastery</span></div><div class="app-metric"><b>${(st.weekly_scores||[]).length}</b><span>weekexamens</span></div></div><p class="muted">Dagelijkse microcurricula, spaced repetition, kennisnetwerken, examencyclus en algemene kennis/skills.</p><div class="row"><button class="btn gold" data-app="paideia">Open Paideia</button><span class="chip">${st.last_completed?'recent gebruikt':'klaar om te starten'}</span></div></article>`}).join('');$('#page-apps').innerHTML=`<div class="hero"><div class="spread"><div><h2>Mijn apps</h2><p>Hier zie je alleen de toepassingen die aan ${esc(p.name)} zijn toegewezen. Home is de snelle ingang; deze pagina toont inhoud, voortgang en status per app.</p></div><button class="btn" id="manageAppAccess">Toegang beheren</button></div></div><div class="app-detail-grid">${cards||'<div class="no-apps">Nog geen apps toegewezen. Gebruik <strong>Toegang beheren</strong> om een app aan dit profiel te koppelen.</div>'}</div><div class="card" style="margin-top:18px"><h3>Profielen blijven gescheiden</h3><p class="muted">Een profiel krijgt alleen toegang tot zijn toegewezen modules. Latere farmacie- of vroegmoderne apps kunnen als nieuwe Athenaeum-modules worden toegevoegd zonder Scriptorium of Paideia automatisch voor iedereen zichtbaar te maken.</p></div>`;$('#manageAppAccess').onclick=()=>editProfile(p.id);$$('[data-app]').forEach(b=>b.onclick=()=>openApp(b.dataset.app))}
function renderPrimarySourceResults(){
  const p=requireProfile();if(!p)return;
  const q=($('#primarySourceSearch')?.value||'').trim().toLowerCase(),arr=S.getProfileData(p.id,'primary_source_meta',[]),box=$('#primarySourceResults');if(!box)return;
  const hits=!q?arr:arr.filter(x=>[x.title,x.author,x.canonical_ref,x.period,x.place,x.type,x.notes].join(' ').toLowerCase().includes(q));
  box.innerHTML=hits.length?hits.map(x=>`<div class="source-meta-row"><div><strong>${esc(x.title||'Zonder titel')}</strong><div class="tiny">${esc(x.author||'onbekend')} · ${esc(x.canonical_ref||x.type||'primaire bron')} ${x.period?'· '+esc(x.period):''}</div></div><button class="btn small" data-del-source="${esc(x.id)}">Verwijder</button></div>`).join(''):`<div class="source-empty"><strong>${arr.length?'Geen overeenkomst gevonden.':'Nog geen lokale primaire bronnen geregistreerd.'}</strong><br><span>Het zoekveld blijft bruikbaar. Voeg bronmetadata of een bestand toe, of open de bronzoeker in Scriptorium.</span></div>`;
  $$('[data-del-source]').forEach(b=>b.onclick=()=>{S.setProfileData(p.id,'primary_source_meta',arr.filter(x=>x.id!==b.dataset.delSource));renderPrimarySourceResults()});
}
function addPrimarySourceMeta(){const p=requireProfile();if(!p)return;const title=prompt('Titel / korte beschrijving van de primaire bron');if(!title)return;const author=prompt('Auteur / producent (indien bekend)')||'',canonical_ref=prompt('Canonieke referentie')||'',period=prompt('Periode / datering')||'',type=prompt('Bronsoort')||'';const arr=S.getProfileData(p.id,'primary_source_meta',[]);arr.push({id:S.uid(),title,author,canonical_ref,period,type,updated_at:Date.now()});S.setProfileData(p.id,'primary_source_meta',arr);renderPrimarySourceResults();AthSync.markDirty?.(p.id)}
function registerPrimaryFiles(files){const p=requireProfile();if(!p)return;const arr=S.getProfileData(p.id,'primary_source_meta',[]);for(const f of [...(files||[])])arr.push({id:S.uid(),title:f.name,type:f.type||'bestand',file_name:f.name,file_size:f.size,notes:'Bestandsmetadata lokaal geregistreerd; bestand zelf wordt niet naar de cloud geüpload.',updated_at:Date.now()});S.setProfileData(p.id,'primary_source_meta',arr);renderPrimarySourceResults();AthSync.markDirty?.(p.id);S.toast(`${files?.length||0} bestand(en) geregistreerd.`)}
function renderLibrary(){const p=requireProfile();if(!p)return;const lib=S.getProfileData(p.id,'library_meta',[]);$('#page-library').innerHTML=`<div class="hero"><h2>Bibliotheek</h2><p>Beheer je gecontroleerde werken, primaire bronmetadata en kennis-packs. Bestanden blijven lokaal; metadata kan met je profiel synchroniseren.</p></div><div class="card primary-explorer" style="margin-top:16px"><div class="spread"><div><h3>🏺 Primaire bronnenverkenner</h3><p class="muted">Zoek in geregistreerde primaire bronnen. Het zoekveld blijft actief, ook als je nog geen bestanden hebt toegevoegd.</p></div><span class="chip">profielgebonden</span></div><div class="source-search-row"><input id="primarySourceSearch" class="source-search-input" type="search" placeholder="Zoek in titel, auteur, referentie, periode of bronsoort…" autocomplete="off"><button class="btn" id="addPrimaryMeta">+ Bronmetadata</button><label class="btn">+ Bestand registreren<input id="primaryFileInput" type="file" multiple hidden></label>${hasApp('scriptorium',p)?'<button class="btn primary" id="openScriptoriumSources">Open Scriptorium-bronzoeker</button>':''}</div><div id="primarySourceResults" style="margin-top:12px"></div></div><div class="grid two" style="margin-top:16px"><div class="card"><h3>Voorrangsorde voor leerinhoud</h3><ol><li><strong>Jouw aangeleverde en gecontroleerde werken</strong></li><li>Universitaire compendia / handboeken</li><li>Wetenschappelijke monografieën en artikels</li><li>Modelkennis alleen als aanvulling</li></ol></div><div class="card"><h3>Kennispack importeren</h3><p>Na analyse van een boek of scan kan een JSON-pack met lessen, kennisnodes, vragen en exacte fysieke paginaverwijzingen worden geïmporteerd in Paideia.</p><label class="btn">Importeer pack<input id="knowledgePackFile" type="file" accept=".json" hidden></label><a class="btn" href="./content/knowledge_pack_schema.json" download>Schema downloaden</a></div></div><div class="card" style="margin-top:16px"><div class="spread"><h3>Geregistreerde werken</h3><button class="btn" id="addLibMeta">+ Metadata toevoegen</button></div><div id="libList" style="margin-top:10px">${lib.length?lib.map(x=>`<div style="padding:12px 0;border-bottom:1px solid #e2dacb"><strong>${esc(x.title)}</strong><div class="tiny">${esc(x.author||'')} · ${esc(x.classification||'')}</div></div>`).join(''):'<div class="muted">Nog geen werken geregistreerd.</div>'}</div></div>`;$('#knowledgePackFile').onchange=e=>importKnowledgePack(e.target.files[0]);$('#addLibMeta').onclick=()=>{const title=prompt('Titel');if(!title)return;const author=prompt('Auteur')||'';const classification=prompt('Categorie')||'';const arr=S.getProfileData(p.id,'library_meta',[]);arr.push({id:S.uid(),title,author,classification,updated_at:Date.now()});S.setProfileData(p.id,'library_meta',arr);renderLibrary()};$('#primarySourceSearch').oninput=renderPrimarySourceResults;$('#addPrimaryMeta').onclick=addPrimarySourceMeta;$('#primaryFileInput').onchange=e=>registerPrimaryFiles(e.target.files);if($('#openScriptoriumSources'))$('#openScriptoriumSources').onclick=()=>{const u=new URL('./apps/scriptorium/index.html',location.href);u.searchParams.set('ath_profile',p.id);u.searchParams.set('page','sources');location.href=u};renderPrimarySourceResults()}

async function importKnowledgePack(file){if(!file)return;let data;try{data=JSON.parse(await file.text())}catch{return S.toast('Ongeldig JSON-bestand.')}if(data.schema_version!==1||!Array.isArray(data.lessons))return S.toast('Geen geldig Athenaeum kennispack.');const p=current(),packs=S.getProfileData(p.id,'knowledge_packs',[]);const i=packs.findIndex(x=>x.pack_id===data.pack_id);if(i>=0)packs[i]=data;else packs.push(data);S.setProfileData(p.id,'knowledge_packs',packs);S.toast(`${data.lessons.length} lessen geïmporteerd.`)}
function renderProgress(){const p=requireProfile();if(!p)return;const st=S.getProfileData(p.id,'paideia_state',{streak:0,icecubes:2,weekly_scores:[],monthly_scores:[]});$('#page-progress').innerHTML=`<div class="hero"><h2>Voortgang</h2><p>Athenaeum houdt leerdiscipline en kennisbeheersing uit elkaar. Een lange streak is nuttig, maar vervangt geen sterke examencijfers.</p></div><div class="stat-grid"><div class="stat"><div class="k">Streak</div><div class="v">🔥 ${st.streak||0}</div></div><div class="stat"><div class="k">IJsblokjes</div><div class="v">🧊 ${st.icecubes??2}</div></div><div class="stat"><div class="k">Weekly exams</div><div class="v">${st.weekly_scores?.length||0}</div></div><div class="stat"><div class="k">Monthly checks</div><div class="v">${st.monthly_scores?.length||0}</div></div></div><div class="grid two" style="margin-top:18px"><div class="card"><h3>Regels</h3><p>• Een gemiste dag breekt de streak, tenzij je een verdiend ijsblokje inzet.<br>• Startvoorraad: 2 ijsblokjes.<br>• Ieder examen met ≥75% levert 1 nieuw ijsblokje op.<br>• Reviews zijn cumulatief: oude stof blijft terugkomen.</p></div><div class="card"><h3>Evaluatieritme</h3><p><strong>Dagelijks</strong>: retrieval, nieuwe kennis, toepassing, exit quiz.<br><strong>Wekelijks</strong>: open en gemengde universiteitsvragen.<br><strong>Maandelijks</strong>: synthese en brede evoluties.</p></div></div>`}
function syncStatusHtml(p){const s=AthSync.status(p.id);if(!s.signed_in)return 'Niet aangemeld. Log in of herstel een cloudprofiel.';if(s.last_error)return `⚠️ Laatste fout: ${esc(s.last_error)}`;return `${s.email?`Aangemeld als ${esc(s.email)}. `:''}${s.last_sync?`Laatste sync: ${new Date(s.last_sync).toLocaleString('nl-BE')} (${esc(s.last_direction||'merge')}).`:'Nog geen succesvolle synchronisatie.'}`}
function renderSettings(){
  const p=requireProfile();if(!p)return;
  const c=AthSync.cfg(p.id),n=AthTelegram.notify(p.id),d=AthSync.defaults();
  $('#page-settings').innerHTML=`<div class="hero"><h2>Instellingen</h2><p>Beheer je profiel, synchronisatie, Telegram en installatie. Grote PDF-bestanden blijven lokaal; voortgang en metadata kunnen veilig tussen apparaten worden samengevoegd.</p></div><div class="settings-section" style="margin-top:16px">
  <div class="card"><div class="spread"><div><h3>Account</h3><p class="muted">Naam, avatar, app-toegang en optionele PIN.</p></div><button class="btn" id="editAccount">Account aanpassen</button></div></div>
  <div class="card"><div class="spread"><div><h3>Synchronisatie tussen apparaten</h3><p class="muted">Athenaeum gebruikt standaard dezelfde cloudserver. Vul normaal alleen je eigen e-mail en wachtwoord in. Een bestaand cloudprofiel wordt bijgewerkt in plaats van opnieuw aangemaakt.</p></div><span class="chip">smart merge v3</span></div>
    <div class="cloud-default-note">☁️ <strong>Athenaeum Cloud</strong><span>server vooraf ingesteld</span></div>
    <div class="grid two"><div class="field"><label>E-mail</label><input id="sbEmail" type="email" value="${esc(c.email||'')}" autocomplete="username"></div><div class="field"><label>Wachtwoord</label><input id="sbPass" type="password" autocomplete="current-password"></div></div>
    <details class="advanced-cloud"><summary>Geavanceerde serverinstellingen</summary><div class="grid two" style="margin-top:10px"><div class="field"><label>Supabase URL</label><input id="sbUrl" value="${esc(c.url||d.url)}"></div><div class="field"><label>Publishable key</label><input id="sbKey" value="${esc(c.key||d.key)}"></div></div></details>
    <div class="row" style="margin-top:12px"><button class="btn primary" id="signinBtn">Aanmelden & synchroniseren</button>${c.user?.id?'':'<button class="btn" id="signupBtn">Nieuw cloudaccount</button>'}<button class="btn" id="syncBtn">Nu synchroniseren</button><button class="btn" id="pullBtn">Cloud ophalen</button><button class="btn" id="pushBtn">Lokale versie uploaden</button><button class="btn" id="testSyncBtn">Test verbinding</button><button class="btn" id="signoutBtn">Afmelden</button></div>
    <div class="tiny" id="syncStatus" style="margin-top:10px">${syncStatusHtml(p)}</div><div class="diag-box" id="cloudDiag"><strong>Clouddiagnose</strong><div class="tiny">Controleert server, Auth en databank afzonderlijk.</div></div><div class="row" style="margin-top:8px"><button class="btn" id="diagCloudBtn">Diagnose cloud</button><a class="btn" href="${esc(c.url||d.url)}" target="_blank">Open serveradres</a></div><div class="tiny" style="margin-top:6px">Op een nieuwe computer kies je op het profielscherm <strong>Cloudprofiel herstellen</strong>. Athenaeum herkent hetzelfde Supabase-account en gebruikt vervolgens hetzelfde lokale profiel.</div>
  </div>
  <div class="card"><div class="spread"><div><h3>Telegram voor Paideia</h3><p class="muted">Ochtendmelding, examenaftelling en een reminder als je dagsessie nog openstaat. De bot-token blijft server-side in Supabase.</p></div><span class="chip" id="telegramStateChip">status laden…</span></div><div class="grid three"><div class="field"><label>Ochtendmelding</label><input id="morningTime" type="time" value="${esc(n.morning||'08:00')}"></div><div class="field"><label>Reminder</label><input id="reminderTime" type="time" value="${esc(n.reminder||'18:00')}"></div><div class="field"><label>Tijdzone</label><input id="timezone" value="${esc(n.timezone||'Europe/Brussels')}"></div></div><div class="row" style="margin-top:12px"><button class="btn" id="saveNotify">Tijden bewaren</button><button class="btn primary" id="pairTelegram">Koppel Athenaeum Bot</button><button class="btn" id="testTelegram">Stuur testmelding</button><button class="btn" id="disconnectTelegram">Ontkoppel</button><button class="btn" id="diagTelegram">Diagnose Telegram</button><a class="btn" href="./docs/TELEGRAM_SETUP_V1_0_5.txt" target="_blank">Stappenplan</a></div><div class="tiny" id="telegramPairStatus" style="margin-top:8px"></div><div class="diag-box" id="telegramDiag"><strong>Telegramdiagnose</strong><div class="tiny">Cloudlogin → koppeltabel → Edge Function → bot.</div></div></div>
  <div class="card"><div class="spread"><div><h3>App installeren</h3><p class="muted" id="installDeviceInfo">Athenaeum controleert je apparaat…</p></div><span class="chip" id="installModeChip">PWA</span></div><div class="row" style="margin:12px 0"><button class="btn primary" id="installPwaBtn">Installeer Athenaeum</button><button class="btn" id="refreshDiag">Diagnose vernieuwen</button></div><div id="pwaDiag" class="grid two"></div><div class="tiny" style="margin-top:8px">Telefoon, tablet/iPad en laptop gebruiken dezelfde Athenaeum-installatie; de interface past zich automatisch aan het apparaat en de oriëntatie aan.</div></div>
  <div class="card"><h3>Export & levensduur</h3><p class="muted">Je profiel blijft ook zonder cloud bruikbaar.</p><div class="row"><button class="btn" id="exportProfile">Exporteer profiel JSON</button><label class="btn">Importeer profiel<input id="importProfileFile" type="file" accept=".json" hidden></label></div></div>
  </div>`;
  bindSettings();runPwaDiag();refreshTelegramStatus(p.id);
}
function saveSyncForm(p){
  const c=AthSync.cfg(p.id),d=AthSync.defaults();
  AthSync.saveCfg(p.id,{...c,url:$('#sbUrl')?.value.trim()||d.url,key:$('#sbKey')?.value.trim()||d.key,email:$('#sbEmail').value.trim(),enabled:c.enabled});
  return AthSync.cfg(p.id);
}
async function refreshTelegramStatus(pid){const chip=$('#telegramStateChip'),box=$('#telegramPairStatus');if(!chip)return;try{const s=await AthTelegram.status(pid);chip.textContent=s.connected?'✅ gekoppeld':'niet gekoppeld';box.textContent=s.connected?`Telegram is gekoppeld${s.bot_username?' met @'+s.bot_username:''}.`:(s.error||'Maak een koppelcode en open daarna de bot in Telegram.')}catch(e){chip.textContent='controle nodig';box.textContent=e.message}}
function bindSettings(){
  const p=current();
  $('#editAccount').onclick=()=>editProfile(p.id);
  const signup=$('#signupBtn');
  if(signup)signup.onclick=async()=>{try{
    saveSyncForm(p);
    const d=await AthSync.auth(p.id,$('#sbEmail').value.trim(),$('#sbPass').value,true);
    if(d.access_token){await AthSync.syncNow(p.id);AthSync.startAuto(p.id);S.toast('Cloudaccount aangemaakt en gesynchroniseerd.')}
    else S.toast('Account aangemaakt. Bevestig eventueel je e-mail en meld daarna aan.');
    renderSettings();
  }catch(e){S.toast(e.message)}};
  $('#signinBtn').onclick=async()=>{try{
    saveSyncForm(p);
    await AthSync.auth(p.id,$('#sbEmail').value.trim(),$('#sbPass').value,false);
    await AthSync.syncNow(p.id);AthSync.startAuto(p.id);
    S.toast('Aangemeld en gesynchroniseerd.');renderSettings();
  }catch(e){S.toast(e.message)}};
  $('#syncBtn').onclick=async()=>{try{$('#syncStatus').textContent='Synchroniseren…';await AthSync.syncNow(p.id);$('#syncStatus').textContent=syncStatusHtml(p);S.toast('Cloud en lokaal slim samengevoegd.')}catch(e){$('#syncStatus').textContent='⚠️ '+e.message}};
  $('#pullBtn').onclick=async()=>{try{$('#syncStatus').textContent='Cloud ophalen…';await AthSync.pullOnly(p.id);$('#syncStatus').textContent=syncStatusHtml(p);S.toast('Cloudgegevens lokaal gemerged.')}catch(e){$('#syncStatus').textContent='⚠️ '+e.message}};
  $('#pushBtn').onclick=async()=>{if(!confirm('Lokale gegevens nu als cloudbasis uploaden? Gebruik normaal “Nu synchroniseren”.'))return;try{await AthSync.pushOnly(p.id);$('#syncStatus').textContent=syncStatusHtml(p);S.toast('Lokale versie geüpload.')}catch(e){$('#syncStatus').textContent='⚠️ '+e.message}};
  $('#testSyncBtn').onclick=async()=>{try{const r=await AthSync.testConnection(p.id);S.toast(r.server?'Cloudserver bereikbaar.':'Cloudcontrole mislukt.')}catch(e){S.toast(e.message)}};
  $('#diagCloudBtn').onclick=async()=>{const box=$('#cloudDiag');box.innerHTML='<strong>Clouddiagnose</strong><div class="tiny">Controleren…</div>';const r=await AthSync.diagnoseConnection(p.id);box.innerHTML=`<strong>${r.server?'✅ Cloudserver bereikbaar':'⚠️ Cloudprobleem'}</strong><div class="diag-steps">${(r.details||[]).map(x=>`<div>${esc(x)}</div>`).join('')}</div>${r.error?`<div class="tiny warn-text">${esc(r.error)}</div>`:''}`};
  $('#signoutBtn').onclick=async()=>{await AthSync.signOut(p.id);renderSettings();S.toast('Cloudsessie afgemeld.')};
  $('#saveNotify').onclick=async()=>{const n={morning:$('#morningTime').value,reminder:$('#reminderTime').value,timezone:$('#timezone').value};AthTelegram.saveNotify(p.id,n);try{await AthTelegram.updateSchedule(p.id,n)}catch{}S.toast('Meldingstijden bewaard.')};
  $('#pairTelegram').onclick=async()=>{const box=$('#telegramPairStatus');try{const r=await AthTelegram.pair(p.id);box.innerHTML=`Koppelcode: <strong>${r.code}</strong> (30 min geldig). ${r.link?`<a href="${r.link}" target="_blank">Open @${esc(r.bot_username)} in Telegram</a>`:'Open jouw Athenaeum Bot en stuur <strong>/start '+r.code+'</strong>.'}`;S.toast('Telegram-koppelcode gemaakt.')}catch(e){box.textContent=e.message}};
  $('#testTelegram').onclick=async()=>{try{await AthTelegram.test(p.id);S.toast('Testmelding verstuurd.')}catch(e){S.toast(e.message)}};
  $('#disconnectTelegram').onclick=async()=>{try{await AthTelegram.disconnect(p.id);S.toast('Telegram ontkoppeld.');refreshTelegramStatus(p.id)}catch(e){S.toast(e.message)}};
  $('#diagTelegram').onclick=async()=>{const box=$('#telegramDiag');box.innerHTML='<strong>Telegramdiagnose</strong><div class="tiny">Controleren…</div>';const r=await AthTelegram.diagnose(p.id);box.innerHTML=`<strong>${r.bot?'✅ Bot bereikbaar':'⚠️ Configuratie onvolledig'}</strong><div class="diag-steps">${(r.steps||[]).map(x=>`<div>${esc(x)}</div>`).join('')}</div>`};
  $('#installPwaBtn').onclick=requestPwaInstall;$('#refreshDiag').onclick=()=>{runPwaDiag();updateMode()};refreshInstallUi();$('#exportProfile').onclick=()=>exportProfile(p.id);$('#importProfileFile').onchange=e=>importProfile(e.target.files[0]);
}
function findExistingCloudProfile(r,rp={}){
  const ps=S.loadProfiles(),uid=r.auth?.user?.id,email=(r.auth?.user?.email||r.email||'').toLowerCase();
  return ps.find(p=>p.id===rp.id)
      || ps.find(p=>p.cloud_user_id===uid)
      || ps.find(p=>AthSync.cfg(p.id).user?.id===uid)
      || ps.find(p=>(p.cloud_email||AthSync.cfg(p.id).email||'').toLowerCase()===email);
}
async function restoreCloudProfile(){
  const status=$('#restoreCloudStatus'),d=AthSync.defaults();
  status.textContent='Aanmelden en cloudprofiel zoeken…';
  try{
    const r=await AthSync.restoreRemote({url:$('#restoreSbUrl')?.value.trim()||d.url,key:$('#restoreSbKey')?.value.trim()||d.key,email:$('#restoreEmail').value.trim(),password:$('#restorePass').value});
    const rp=r.payload.profile||{};
    let p=findExistingCloudProfile(r,rp);
    if(!p)p=await S.createProfile({name:rp.name||r.email||'Cloudprofiel',avatar:rp.avatar||'bust',apps:Array.isArray(rp.apps)?rp.apps:[]});
    const ps=S.loadProfiles(),i=ps.findIndex(x=>x.id===p.id);
    if(i>=0){
      ps[i]={...ps[i],name:rp.name||ps[i].name,avatar:rp.avatar||ps[i].avatar,apps:Array.isArray(rp.apps)?rp.apps:ps[i].apps,icecubes:rp.icecubes??ps[i].icecubes,pin_hash:rp.pin_hash??ps[i].pin_hash,pin_salt:rp.pin_salt||ps[i].pin_salt,cloud_user_id:r.auth.user.id,cloud_email:(r.auth.user.email||r.email||'').toLowerCase(),updated_at:Math.max(ps[i].updated_at||0,rp.updated_at||0,Date.now())};
      S.saveProfiles(ps);p=ps[i];
    }
    AthSync.adoptSession(p.id,r);
    await AthSync.apply(p.id,{...r.payload,profile:{...rp,id:p.id,cloud_user_id:r.auth.user.id,cloud_email:(r.auth.user.email||r.email||'').toLowerCase()}});
    closeModal('cloudRestoreModal');renderProfiles();
    S.toast('Cloudprofiel bijgewerkt. Geen nieuw duplicaat aangemaakt.');
  }catch(e){status.textContent='⚠️ '+e.message}
}
function runPwaDiag(){const box=$('#pwaDiag');if(!box)return;const standalone=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;const checks=[['HTTPS',location.protocol==='https:'||location.hostname==='localhost'],['Manifest',!!document.querySelector('link[rel="manifest"]')],['Service worker',!!navigator.serviceWorker],['Standalone',standalone]];box.innerHTML=checks.map(([k,v])=>`<div class="card" style="padding:12px;box-shadow:none"><strong>${v?'✅':'⚠️'} ${k}</strong><div class="tiny">${v?'OK':'controle nodig'}</div></div>`).join('')}
function exportProfile(id){const p=S.loadProfiles().find(x=>x.id===id),data={athenaeum_export:1,exported_at:new Date().toISOString(),profile:{...p,pin_hash:'',pin_salt:''},data:{}};Object.keys(localStorage).filter(k=>k.startsWith(`ath_${id}_`)&&!k.endsWith('_sync')).forEach(k=>{try{data.data[k.slice(`ath_${id}_`.length)]=JSON.parse(localStorage.getItem(k))}catch{}});const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));a.download=`Athenaeum_${p.name.replace(/\W+/g,'_')}_${todayISO()}.json`;a.click();URL.revokeObjectURL(a.href)}
async function importProfile(file){if(!file)return;let d;try{d=JSON.parse(await file.text())}catch{return S.toast('Ongeldige JSON.')}if(d.athenaeum_export!==1)return S.toast('Geen Athenaeum-profielexport.');const p=await S.createProfile({name:d.profile?.name||'Geïmporteerd',avatar:d.profile?.avatar||'bust'});for(const [k,v] of Object.entries(d.data||{}))S.setProfileData(p.id,k,v);S.toast('Profiel geïmporteerd.');renderProfiles()}
function showPage(name){
  const p=requireProfile();if(!p)return;
  const page=$('#page-'+name);if(!page)return;
  $$('.page').forEach(x=>x.classList.add('hidden'));
  page.classList.remove('hidden');
  $$('[data-page]').forEach(x=>x.classList.toggle('active',x.dataset.page===name));
  const titles={home:['Home','Snel verder vanuit je persoonlijke leer- en onderzoeksomgeving'],apps:['Mijn apps','Inhoud, toegang en voortgang per toegewezen toepassing'],library:['Bibliotheek','Bronnen en kennis-packs'],progress:['Voortgang','Streaks, examens en mastery'],settings:['Instellingen','Account, app-toegang, sync, meldingen en installatie']};
  $('#pageTitle').textContent=titles[name][0];
  $('#pageSubtitle').textContent=titles[name][1];
  ({home:renderHome,apps:renderApps,library:renderLibrary,progress:renderProgress,settings:renderSettings}[name])();
  scrollTo({top:0,behavior:'smooth'})
}
let deferredInstallPrompt=null;

function isStandaloneApp(){
  return window.matchMedia?.('(display-mode: standalone)').matches
      || window.matchMedia?.('(display-mode: fullscreen)').matches
      || window.matchMedia?.('(display-mode: minimal-ui)').matches
      || navigator.standalone===true
      || document.referrer.startsWith('android-app://');
}

function detectDevice(){
  const forced=(new URLSearchParams(location.search).get('view')||localStorage.getItem('athenaeum_view_mode')||'auto');
  if(forced==='mobile')return{kind:'phone',label:'telefoon',width:innerWidth,height:innerHeight};
  if(forced==='tablet')return{kind:'tablet',label:'tablet',width:innerWidth,height:innerHeight};
  if(forced==='desktop')return{kind:'desktop',label:'laptop',width:innerWidth,height:innerHeight};
  const ua=navigator.userAgent||'';
  const touch=(navigator.maxTouchPoints||0)>0;
  const ipad=/iPad/i.test(ua)||(navigator.platform==='MacIntel'&&touch);
  const vv=Math.round(window.visualViewport?.width||window.innerWidth||document.documentElement.clientWidth||1024);
  const vh=Math.round(window.visualViewport?.height||window.innerHeight||document.documentElement.clientHeight||768);
  const shortSide=Math.min(vv,vh);
  const longSide=Math.max(vv,vh);

  if(ipad) return {kind:'tablet',label:'iPad',width:vv,height:vh};
  if(touch && shortSide>=600 && longSide<=1500) return {kind:'tablet',label:'tablet',width:vv,height:vh};
  if(vv<=720) return {kind:'phone',label:'telefoon',width:vv,height:vh};
  if(touch && vv<=1180) return {kind:'tablet',label:'tablet',width:vv,height:vh};
  return {kind:'desktop',label:'laptop',width:vv,height:vh};
}

function updateMode(){
  const d=detectDevice();
  const standalone=isStandaloneApp();
  document.body.classList.remove('device-phone','device-tablet','device-desktop');
  document.body.classList.add('device-'+d.kind);
  document.documentElement.dataset.device=d.kind;
  document.documentElement.dataset.displayMode=standalone?'app':'web';
  const chip=$('#modeChip');
  if(chip) chip.textContent=`${standalone?'App':'Browser'} · ${d.label}`;
  refreshInstallUi?.();
}

function installHelpText(){
  const d=detectDevice(), standalone=isStandaloneApp(), ua=navigator.userAgent||'';
  const ios=/iPhone|iPad|iPod/i.test(ua)||(navigator.platform==='MacIntel'&&(navigator.maxTouchPoints||0)>1);
  if(standalone) return `✅ Athenaeum draait als geïnstalleerde app op deze ${d.label}.`;
  if(ios) return `Op iPhone/iPad: open Athenaeum in Safari → Deel-knop → ‘Zet op beginscherm’. Daarna opent Athenaeum zonder browserbalk als app.`;
  if(d.kind==='phone'||d.kind==='tablet') return `Op Android: open Athenaeum in Chrome → ⋮ → ‘App installeren’. Kies niet alleen ‘Snelkoppeling toevoegen’ als Chrome de echte app-optie aanbiedt.`;
  return `Op laptop/desktop: gebruik de installatieknop in de adresbalk of de knop hieronder zodra je browser die aanbiedt.`;
}

async function requestPwaInstall(){
  if(isStandaloneApp()){S.toast('Athenaeum is al als app geopend.');return}
  if(!deferredInstallPrompt){S.toast(installHelpText());return}
  deferredInstallPrompt.prompt();
  try{await deferredInstallPrompt.userChoice}catch{}
  deferredInstallPrompt=null;
  updateMode();
}

function refreshInstallUi(){
  const info=$('#installDeviceInfo'),btn=$('#installPwaBtn');
  if(info) info.textContent=installHelpText();
  if(btn){
    const standalone=isStandaloneApp();
    btn.textContent=standalone?'✓ App geïnstalleerd':'Installeer Athenaeum';
    btn.disabled=standalone;
  }
}

function init(){
  updateMode();
  S.ensureStarterProfiles();
  const cloudDefaults=AthSync.defaults();
  if($('#restoreSbUrl'))$('#restoreSbUrl').value=cloudDefaults.url;
  if($('#restoreSbKey'))$('#restoreSbKey').value=cloudDefaults.key;
  S.setCurrentProfile('');renderProfiles();const qp=new URLSearchParams(location.search);pendingLaunch=['paideia','scriptorium'].includes(qp.get('open'))?qp.get('open'):null;pendingPage=['home','apps','library','progress','settings'].includes(qp.get('page'))?qp.get('page'):'home';const requestedProfile=qp.get('profile'),resume=qp.get('resume')==='1';if(resume&&requestedProfile&&S.loadProfiles().some(p=>p.id===requestedProfile)){
  const p=S.loadProfiles().find(x=>x.id===requestedProfile);
  if(p?.pin_hash&&!sessionStorage.getItem('athenaeum_unlocked_'+requestedProfile)){setProfileLocked(true);pendingUnlock=requestedProfile;openModal('pinModal')}
  else enterProfile(requestedProfile)
}else{clearProtectedView();setProfileLocked(true)}$$('[data-close]').forEach(b=>b.onclick=()=>closeModal(b.dataset.close));$('#saveProfileBtn').onclick=saveProfile;$('#removePinBtn').onclick=async()=>{if(editing&&confirm('PIN van dit profiel verwijderen?')){const ps=S.loadProfiles(),i=ps.findIndex(p=>p.id===editing);if(i>=0){ps[i].pin_hash='';ps[i].updated_at=Date.now();S.saveProfiles(ps);closeModal('profileModal');renderShell();S.toast('PIN verwijderd.')}}};$('#deleteProfileBtn').onclick=()=>{if(editing&&confirm('Dit profiel lokaal verwijderen?')){S.removeProfile(editing);closeModal('profileModal');leaveProfile()}};$('#unlockBtn').onclick=unlock;$('#unlockPin').addEventListener('keydown',e=>{if(e.key==='Enter')unlock()});$$('#mainNav [data-page],#mobileNav [data-page]').forEach(b=>b.onclick=()=>showPage(b.dataset.page));$('#switchProfile').onclick=leaveProfile;$('#mobileMore').onclick=()=>$('#moreSheet').classList.add('open');$('#closeSheet').onclick=()=>$('#moreSheet').classList.remove('open');$('#sheetSwitch').onclick=leaveProfile;$('#sheetScriptorium').onclick=()=>openApp('scriptorium');$('#sheetPaideia').onclick=()=>openApp('paideia');$$('#moreSheet [data-page]').forEach(b=>b.onclick=()=>{$('#moreSheet').classList.remove('open');showPage(b.dataset.page)});$('#restoreCloudBtn')?.addEventListener('click',()=>openModal('cloudRestoreModal'));$('#restoreCloudSubmit')?.addEventListener('click',restoreCloudProfile);addEventListener('resize',updateMode);
window.visualViewport?.addEventListener('resize',updateMode);
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstallPrompt=e;refreshInstallUi()});
window.addEventListener('appinstalled',()=>{deferredInstallPrompt=null;updateMode();S.toast('Athenaeum is als app geïnstalleerd.')});
addEventListener('athenaeum-sync',e=>{if(current()&&e.detail?.pid===current().id&&$('#syncStatus'))$('#syncStatus').textContent=syncStatusHtml(current())});if('serviceWorker'in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js').catch(console.warn)}
init();
})();

