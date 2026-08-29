
(function(){
"use strict";

const V6_BASE = {
  init: window.init,
  showPage: window.showPage,
  renderTraining: window.renderTraining,
  renderExercise: window.renderExercise,
  showTrainingHint: window.showTrainingHint,
  buildTrainingExercise: window.buildTrainingExercise,
  copyTrainingGradingPrompt: window.copyTrainingGradingPrompt,
  importTrainingGrade: window.importTrainingGrade
};

const V6_SYNC_SETTINGS = [
  "training_v4","v6_theory_seen","v6_source_annotations",
  "v6_custom_sources","v6_review_schedule","v6_sync_meta","v6_sb_config"
];

const V6_THEORY = {
m01:["Diagnose starts before content summary.","Test question-corpus-method fit first; then rank defects by impact.","A strong review separates fatal design flaws from local imperfections."],
m02:["A research question is a contract between question and evidence.","Scope must be explicit in time, space, corpus and analytical concept.","A narrower answerable question is stronger than an ambitious untestable one."],
m03:["Historical concepts need operationalisation.","Define what would count as evidence and what could create false positives.","Categories are analytical tools, not neutral facts."],
m04:["A corpus is designed, not merely collected.","Representativeness, survival and selection affect every later inference.","State explicitly what the corpus structurally cannot show."],
m05:["Primary sources are produced objects with purposes.","Separate production context, genre, audience, survival and maximum inference.","Direct wording is not automatically direct access to historical reality."],
m06:["A status quaestionis maps a debate, not a reading list.","Organise scholarship by disagreement, evidence and method.","The research gap should follow from the debate structure."],
m07:["Positioning means identifying a testable intervention.","Originality may be a better question, source combination, scale or inference.","Do not manufacture novelty by caricaturing earlier scholarship."],
m08:["Method is justified by the inferential problem it solves.","State assumptions, procedure and limits.","Compare a plausible alternative method rather than merely naming your preferred one."],
m09:["Theory should sharpen questions without replacing historical evidence.","Translate theoretical concepts into observable implications.","The model is not the past itself."],
m10:["Triangulation works when sources have different biases.","Two sources that repeat the same perspective are not independent confirmation.","Plan what to do when evidence conflicts."],
m11:["Build an evidence ladder: observation, interpretation, inference, thesis.","Every step needs an explicit warrant.","Calibrate claim strength to the weakest necessary inferential step."],
m12:["Causality requires mechanism and rival explanations.","Temporal sequence is necessary but rarely sufficient.","Ask what evidence would look different if your explanation were wrong."],
m13:["Proxies measure something indirectly.","Missingness and detection conditions can create historical-looking patterns.","Prefer ranges, robustness checks and calibrated claims to false precision."],
m14:["Comparison needs a design.","Explain why cases are comparable and why their differences are analytically useful.","Use deviant cases to stress-test general models."],
m15:["A chapter is justified by argumentative necessity.","Every chapter should deliver a claim required by the main answer.","Use the deletion test: if removing it changes nothing, redesign it."],
m16:["A paragraph is a micro-argument.","Claim, evidence, warrant and transition have different functions.","Fix reasoning before polishing prose."],
m17:["Academic caution is precision, not vagueness.","Verbs such as suggests, indicates and demonstrates encode different evidential claims.","Avoid certainty stronger than the evidence."],
m18:["A conclusion must answer the question with the same concepts used in the design.","Limitations should identify which conclusions become weaker and why.","Do not introduce an untested explanation at the end."],
m19:["Peer review prioritises intellectual risk.","Major issues concern validity and inference; minor issues concern presentation.","A useful critique includes a revision test."],
m20:["Integrated research design combines all previous skills.","Question, corpus, method, argument and conclusion must constrain each other.","A strong design survives hostile questions before writing begins."],
m21:["A source lab trains slow reading of authentic primary evidence.","Record observation before interpretation and interpretation before synthesis.","Annotations should preserve uncertainty rather than erase it."],
m22:["Oral defence tests whether you understand your own decisions.","Be able to explain why this source, method and claim level are justified.","A good defence can concede a limitation without collapsing the argument."],
m23:["Thesis Studio transfers training to long-form independent work.","Track claims, evidence, counterarguments and unresolved risks across chapters.","The goal is diagnostic coaching, never ghostwriting."]
};

if (!TRAINING_MODULES.some(m=>m.id==="m21")) {
  TRAINING_MODULES.push(
    {id:"m21",n:21,title:"Authentic Source Lab",desc:"Read, annotate and compare authentic primary sources before building a historical claim.",keywords:["source","evidence","annotation","primary"],families:["slow-reading","annotation","source-comparison","evidence-map","source-passport"]},
    {id:"m22",n:22,title:"Oral Defence",desc:"Defend research choices against demanding supervisor questions.",keywords:["defence","method","source","argument"],families:["viva","hostile-question","defend-method","defend-corpus","defend-claim"]},
    {id:"m23",n:23,title:"Thesis Studio",desc:"Develop and audit a long-form research design without outsourcing the writing.",keywords:["thesis","research","chapter","evidence","argument"],families:["proposal-audit","chapter-audit","claim-ledger","risk-register","full-design"]}
  );
}

function v6PageHTML(){
return `
<section class="page theory-page" id="page-training-theory">
 <div class="theory-shell">
  <header class="theory-header">
   <button class="btn" id="leaveTrainingTheory">← Trainingsoverzicht</button>
   <div><div class="tiny">Moduletheorie · voorbeelden uit je 56 papers</div><h2 id="theoryTitle">Module</h2></div>
   <button class="btn primary" id="beginPracticeFromTheory">Start oefeningen →</button>
  </header>
  <div class="theory-content"><div class="theory-main" id="theoryMain"></div>
   <aside class="theory-side">
    <div class="focus-card"><h4>Doel</h4><p class="training-note">Leer het principe uit echte academische voorbeelden; oefen het daarna op authentieke primaire bronnen. Kopieer nooit formuleringen uit de papers.</p></div>
    <div class="focus-card"><h4>Bronregels</h4><div class="rubric">
     <div class="rubric-row"><strong>Origineel</strong><span>Grieks/Latijn of authentiek materieel object.</span></div>
     <div class="rubric-row"><strong>Engels</strong><span>Correcte Engelse werkvertaling; geen Nederlandse tussenvertaling.</span></div>
     <div class="rubric-row"><strong>Herkomst</strong><span>Editie en vertaal-/controlebron apart gelinkt.</span></div>
     <div class="rubric-row"><strong>Hulp</strong><span>Context → taal → analyse → scaffold.</span></div>
    </div></div>
   </aside>
  </div>
 </div>
</section>

<section class="page" id="page-sources">
 <div class="hero"><div><h3>Authentieke primaire bronnen</h3><p>Gecureerd en uitbreidbaar. Origineel, Engelse vertaling of objectdata, exacte referentie en externe controlelink blijven samen.</p></div><span class="badge good">AUTHENTIC PRIMARY SOURCES</span></div>
 <div class="grid stats" style="grid-template-columns:repeat(5,minmax(0,1fr))">
  <div class="stat"><div class="k">Bronnen</div><div class="v" id="sourceCount">0</div></div>
  <div class="stat"><div class="k">Grieks</div><div class="v" id="sourceGreek">0</div></div>
  <div class="stat"><div class="k">Latijn</div><div class="v" id="sourceLatin">0</div></div>
  <div class="stat"><div class="k">Materieel</div><div class="v" id="sourceMaterial">0</div></div>
  <div class="stat"><div class="k">Typen</div><div class="v" id="sourceTypes">0</div></div>
 </div>
 <div class="card">
  <div class="spread"><div><h4>Bronnenregister</h4><p class="tiny">Starterset + eigen gecontroleerde bronpakketten.</p></div><div class="row">
   <button class="btn" id="exportSourceLibrary">Exporteer bronpakket</button>
   <label class="btn">Importeer bronpakket<input id="importSourceLibrary" type="file" accept=".json" style="display:none"></label>
  </div></div>
  <div class="form-grid" style="margin-top:12px">
   <div class="field"><label>Zoeken</label><input id="sourceSearch" placeholder="auteur, plaats, genre, begrip…"></div>
   <div class="field"><label>Type</label><select id="sourceTypeFilter"><option value="">Alle typen</option></select></div>
   <div class="field"><label>Taal</label><select id="sourceLangFilter"><option value="">Alle talen</option><option value="grc">Grieks</option><option value="lat">Latijn</option><option value="material">Materieel</option></select></div>
  </div>
  <div id="sourceLibraryList" class="source-library-list" style="margin-top:14px"></div>
 </div>
</section>

<section class="page" id="page-progress">
 <div class="hero"><div><h3>Voortgang & retentie</h3><p>Scores, terugkerende fouten, transfer en spaced review.</p></div><span class="badge accent">18+ moet blijven hangen</span></div>
 <div class="grid stats" style="grid-template-columns:repeat(4,minmax(0,1fr))">
  <div class="stat"><div class="k">Reviews klaar</div><div class="v" id="reviewDueCount">0</div></div>
  <div class="stat"><div class="k">Foutcategorieën</div><div class="v" id="errorCategoryCount">0</div></div>
  <div class="stat"><div class="k">Sterkste</div><div class="v small-v" id="bestModule">—</div></div>
  <div class="stat"><div class="k">Prioriteit</div><div class="v small-v" id="weakModule">—</div></div>
 </div>
 <div class="training-overview-grid">
  <div class="grid" style="gap:14px">
   <div class="card"><div class="spread"><h4>Mastery-map</h4><button class="btn small" id="startMixedReview">Gemengde review</button></div><div id="masteryMap" class="mastery-map"></div></div>
   <div class="card"><h4>Foutenlogboek</h4><div id="errorLog"></div></div>
  </div>
  <div class="grid" style="gap:14px">
   <div class="card"><h4>Spaced review</h4><div id="reviewDueList"></div></div>
   <div class="card"><h4>18+-profiel</h4><div id="skillProfile"></div></div>
  </div>
 </div>
</section>

<section class="page" id="page-sync">
 <div class="hero"><div><h3>Synchronisatie</h3><p>Local-first: PDF-bestanden blijven lokaal. Analyse, training, annotaties en bronbibliotheek kunnen worden samengevoegd.</p></div><span class="badge good">gratis basis + optionele cloud</span></div>
 <div class="training-overview-grid">
  <div class="grid" style="gap:14px">
   <div class="card"><div class="spread"><div><h4>Synchronisatiebestand</h4><p class="tiny">Werkt nu, zonder account. Zet het bestand in iCloud Drive, OneDrive of Google Drive.</p></div><span class="badge good">€0</span></div>
    <div class="row"><button class="btn primary" id="exportSyncFile">Maak syncbestand</button><label class="btn">Importeer & merge<input id="importSyncFile" type="file" accept=".json" style="display:none"></label></div>
    <div class="callout good" style="margin-top:12px"><strong>Merge.</strong> Pogingen en records worden samengevoegd; lokale PDF-blobs worden nooit verwijderd.</div>
   </div>
   <div class="card"><div class="spread"><div><h4>Automatische cloudsync</h4><p class="tiny">Optioneel via je eigen gratis Supabase-project. Wachtwoord wordt niet opgeslagen.</p></div><span class="badge accent">optioneel</span></div>
    <div class="form-grid">
     <div class="field"><label>Project URL</label><input id="sbUrl" placeholder="https://xxxx.supabase.co"></div>
     <div class="field"><label>Publishable / anon key</label><input id="sbKey"></div>
     <div class="field"><label>E-mail</label><input id="sbEmail" type="email"></div>
     <div class="field"><label>Wachtwoord</label><input id="sbPassword" type="password"></div>
    </div>
    <div class="row"><button class="btn" id="sbSaveConfig">Bewaar config</button><button class="btn" id="sbSignUp">Account maken</button><button class="btn" id="sbSignIn">Aanmelden</button><button class="btn" id="sbSignOut">Afmelden</button></div>
    <div class="row" style="margin-top:9px"><button class="btn primary" id="sbSyncNow">Cloud ↔ lokaal</button><button class="btn" id="sbPush">Upload</button><button class="btn" id="sbPull">Download</button></div>
    <div id="sbStatus" class="callout" style="margin-top:12px">Nog niet verbonden.</div>
   </div>
  </div>
  <div class="grid" style="gap:14px">
   <div class="card"><h4>Wat synchroniseert?</h4><div class="rubric">
    <div class="rubric-row"><strong>Ja</strong><span>Corpusmetadata + analyses</span></div><div class="rubric-row"><strong>Ja</strong><span>Training + scores</span></div>
    <div class="rubric-row"><strong>Ja</strong><span>Annotaties + theorievoortgang</span></div><div class="rubric-row"><strong>Ja</strong><span>Eigen primaire bronpakketten</span></div>
    <div class="rubric-row"><strong>Nee</strong><span>Grote PDF-bestanden</span></div>
   </div></div>
   <div class="card"><h4>Cloudsetup</h4><p class="training-note">Voer het meegeleverde <code>SUPABASE_SYNC_SETUP.sql</code> één keer uit in je gratis project.</p><button class="btn" id="copySupabaseSql">Kopieer SQL</button></div>
   <div class="card"><h4>App installeren</h4><p class="training-note">Na gratis HTTPS-hosting via GitHub Pages kun je Scriptorium op telefoon en desktop als PWA installeren.</p></div>
  </div>
 </div>
</section>`;
}


function v6EnhanceUI(){
  const nav=document.querySelector("#nav");
  if(nav&&!nav.querySelector('[data-page="sources"]')){
    const atelier=nav.querySelector('[data-page="atelier"]');
    const add=(name,label)=>{const b=document.createElement("button");b.dataset.page=name;b.textContent=label;nav.insertBefore(b,atelier)};
    add("sources","Primaire bronnen");add("progress","Voortgang");
    const b=document.createElement("button");b.dataset.page="sync";b.textContent="Synchronisatie";nav.appendChild(b);
  }
  if(!document.querySelector("#page-sources")){
    const atelier=document.querySelector("#page-atelier");
    atelier.insertAdjacentHTML("beforebegin",v6PageHTML());
  }
  const launch=document.querySelector(".training-launch-card .row");
  if(launch&&!document.querySelector("#openSelectedTheory")){
    launch.insertAdjacentHTML("afterbegin",'<button class="btn" id="openSelectedTheory">Bekijk theorie</button>');
  }
  if(launch&&!document.querySelector("#startMixedFromTraining")){
    launch.insertAdjacentHTML("beforeend",'<button class="btn" id="startMixedFromTraining">Gemengde review</button>');
  }
  const hero=document.querySelector("#page-training .hero .badge");
  if(hero)hero.textContent="23 modules · theorie · authentieke bronnen";
  const moduleBadge=[...document.querySelectorAll("#page-training .card .badge")].find(x=>x.textContent.trim()==="20 modules");
  if(moduleBadge)moduleBadge.textContent="23 modules";
}

async function v6SettingsGet(key,def=null){
  if(!db) return def;
  try{const r=await idbGet("settings",key);return r?.value??def;}catch(e){console.warn("settings read failed",key,e);return def;}
}
async function v6SettingsPut(key,value){
  if(!db) return null;
  try{return await idbPut("settings",{key,value,updated_at:Date.now()});}catch(e){console.warn("settings write failed",key,e);return null;}
}

function v6SourceAll(){
  const base=(window.V6_AUTHENTIC_SOURCES||[]).filter(x=>x.primary&&x.ready);
  const custom=window.V6_CUSTOM_SOURCES_CACHE||[];
  const map=new Map();[...base,...custom].forEach(x=>map.set(x.id,x));return [...map.values()];
}

async function v6LoadCustomSources(){
  window.V6_CUSTOM_SOURCES_CACHE=await v6SettingsGet("v6_custom_sources",[]);
}

function v6EvidenceLine(e){
  const p=e?.physical_page?`p. ${e.physical_page}`:"page n/a";
  return `${e?.author||"Auteur onbekend"}, ${p}${e?.confidence?` · ${e.confidence}`:""}`;
}

async function openModuleTheory(moduleId){
  const m=TRAINING_MODULES.find(x=>x.id===moduleId)||TRAINING_MODULES[0];
  const principles=V6_THEORY[m.id]||[m.desc];
  const bench=trainingBenchmarks(m).slice(0,5);
  const examples=bench.length?bench.map(b=>{
    const ev=(b.evidence||[]).map(v6EvidenceLine).join(" | ");
    return `<div class="paper-example"><strong>${esc(b.principle||"Corpusprincipe")}</strong>${b.why?`<p>${esc(b.why)}</p>`:""}${b.limit?`<p class="tiny"><strong>Grens:</strong> ${esc(b.limit)}</p>`:""}<div class="source-line">${esc(b.source||"")} · ${esc(b.work||"")}${ev?` · ${esc(ev)}`:""}</div></div>`
  }).join(""):'<div class="empty">Nog geen gekoppelde corpusvoorbeelden gevonden.</div>';
  const checklist=principles.map(x=>`<li>${esc(x)}</li>`).join("");
  const worked=v6SourceAll().find(s=>(s.recommended_modules||[]).includes(m.id))||v6SourceAll()[0];
  document.querySelector("#theoryTitle").textContent=`Module ${m.n} · ${m.title}`;
  document.querySelector("#theoryMain").innerHTML=`
   <div class="theory-block"><div class="tiny">KERNLOGICA</div><h3>${esc(m.title)}</h3><p>${esc(m.desc)}</p><ul>${checklist}</ul></div>
   <div class="theory-block"><div class="tiny">VOORBEELDEN UIT JE THESISCORPUS</div><h3>Hoe sterke onderzoekers dit aanpakken</h3>${examples}</div>
   <div class="theory-block"><div class="tiny">DENKPROCEDURE</div><h3>Gebruik tijdens elke oefening</h3>
    <ol><li>Noteer eerst wat de bron of dataset rechtstreeks laat zien.</li><li>Identificeer productiecontext, selectie en blinde vlekken.</li><li>Schrijf de inferentiestap tussen observatie en historische claim uit.</li><li>Zoek minstens één rivaliserende lezing.</li><li>Kalibreer de conclusie aan het bewijs.</li></ol>
   </div>
   ${worked?`<div class="theory-block"><div class="tiny">AUTHENTIEKE BRON ALS VOORPROEF</div><h3>${esc(worked.canonical_ref)} · ${esc(worked.title)}</h3><p>${esc(worked.context_hint||"")}</p><div class="source-columns"><div class="source-text-panel"><h5>Original</h5><div class="source-original">${esc(worked.original_text||"")}</div></div><div class="source-text-panel"><h5>English working translation</h5><div class="source-translation">${esc(worked.translation_text||"")}</div></div></div><div class="source-links"><a target="_blank" rel="noopener" href="${esc(worked.original_source_url||"#")}">Original edition/source ↗</a><a target="_blank" rel="noopener" href="${esc(worked.translation_source_url||"#")}">Translation/check source ↗</a></div></div>`:""}`;
  await v6SettingsPut("v6_theory_seen",{...(await v6SettingsGet("v6_theory_seen",{})),[m.id]:Date.now()});
  window.V6_THEORY_MODULE=m.id;
  showPage("training-theory");
}

function v6SourceCard(s,full=false){
  const annotations=(window.V6_ANNOTATIONS_CACHE||{})[s.id]||{};
  return `<div class="${full?"auth-source-card":"source-library-item"}">
   <div class="primary-source-head"><div><span class="auth-label">AUTHENTIC PRIMARY SOURCE</span><h5 style="margin-top:8px">${esc(s.canonical_ref)} · ${esc(s.title)}</h5></div><span class="library-type">${esc(s.source_type)}</span></div>
   <div class="auth-source-meta"><span>${esc(s.author||"")}</span><span>${esc(s.period||"")}</span><span>${esc(s.place||"")}</span><span>${s.language==="grc"?"Greek":s.language==="lat"?"Latin":"material"}</span></div>
   <div class="source-columns"><div class="source-text-panel"><h5>Original / object data</h5><div class="source-original">${esc(s.original_text||"")}</div></div><div class="source-text-panel"><h5>English</h5><div class="source-translation">${esc(s.translation_text||"")}</div><div class="page-source-note">${esc(s.translation_credit||"")}</div></div></div>
   <div class="source-links"><a target="_blank" rel="noopener" href="${esc(s.original_source_url||"#")}">Original edition / object record ↗</a><a target="_blank" rel="noopener" href="${esc(s.translation_source_url||"#")}">English translation / check ↗</a></div>
   ${full?`<div class="annotation-grid"><textarea data-ann="${esc(s.id)}" data-kind="observation" placeholder="Observations — what is directly present?">${esc(annotations.observation||"")}</textarea><textarea data-ann="${esc(s.id)}" data-kind="interpretation" placeholder="Interpretation / possible inference">${esc(annotations.interpretation||"")}</textarea><textarea data-ann="${esc(s.id)}" data-kind="bias" placeholder="Bias / production / survival">${esc(annotations.bias||"")}</textarea><textarea data-ann="${esc(s.id)}" data-kind="questions" placeholder="Questions / comparison needed">${esc(annotations.questions||"")}</textarea></div><button class="btn small" style="margin-top:8px" onclick="v6SaveSourceNotes('${esc(s.id)}')">Notities bewaren</button>`:""}
  </div>`;
}

async function renderSourceLibrary(){
  if(!document.querySelector("#sourceLibraryList"))return;
  window.V6_ANNOTATIONS_CACHE=await v6SettingsGet("v6_source_annotations",{});
  const all=v6SourceAll(),q=(document.querySelector("#sourceSearch")?.value||"").toLowerCase(),typ=document.querySelector("#sourceTypeFilter")?.value||"",lng=document.querySelector("#sourceLangFilter")?.value||"";
  const types=[...new Set(all.map(x=>x.source_type))].sort();
  const sel=document.querySelector("#sourceTypeFilter");if(sel&&sel.options.length<=1)types.forEach(t=>sel.insertAdjacentHTML("beforeend",`<option value="${esc(t)}">${esc(t)}</option>`));
  const filtered=all.filter(s=>(!typ||s.source_type===typ)&&(!lng||s.language===lng)&&(!q||JSON.stringify(s).toLowerCase().includes(q)));
  document.querySelector("#sourceCount").textContent=all.length;
  document.querySelector("#sourceGreek").textContent=all.filter(x=>x.language==="grc").length;
  document.querySelector("#sourceLatin").textContent=all.filter(x=>x.language==="lat").length;
  document.querySelector("#sourceMaterial").textContent=all.filter(x=>x.language==="material").length;
  document.querySelector("#sourceTypes").textContent=types.length;
  document.querySelector("#sourceLibraryList").innerHTML=filtered.length?filtered.map(s=>v6SourceCard(s,true)).join(""):'<div class="empty">Geen bronnen voor deze filter.</div>';
}

window.v6SaveSourceNotes=async function(id){
  const anns=await v6SettingsGet("v6_source_annotations",{});
  const vals={updated_at:Date.now()};
  document.querySelectorAll(`[data-ann="${CSS.escape(id)}"]`).forEach(el=>vals[el.dataset.kind]=el.value);
  anns[id]=vals;window.V6_ANNOTATIONS_CACHE=anns;await v6SettingsPut("v6_source_annotations",anns);toast("Bronnotities bewaard.","good");
};


const V6_AUTH_TASKS={
m01:`Diagnoseer het onderzoeks-potentieel van dit authentieke dossier. Rangschik de drie ernstigste risico's voor geldige conclusies en benoem twee sterktes. Voor elk risico: welke claim wordt hierdoor onbetrouwbaar, en welke revisie heeft de hoogste impact?`,
m02:`Formuleer één hoofdvraag en 2–3 deelvragen die deze authentieke bronnen werkelijk kunnen beantwoorden. Verantwoord tijd, ruimte, corpus en kernbegrippen. Formuleer ook één aantrekkelijke maar onhaalbare vraag en wijs precies aan waar het bewijs tekortschiet.`,
m03:`Kies één abstract begrip dat je met dit dossier zou willen onderzoeken. Operationaliseer het in historische indicatoren, koppel elke indicator aan een bron, benoem false positives en geef aan wanneer de categorie zelf misleidend wordt.`,
m04:`Ontwerp een corpusstrategie rond deze bronnen. Maak onderscheid tussen kernbron, controlebron en contextbron; bespreek selectie, overlevering en representativiteit; geef aan welke aanvullende authentieke bronsoort je gericht zou zoeken.`,
m05:`Maak voor elke primaire bron een bronnenkritisch passport: productiecontext, auteur/instantie, publiek, doel, genre/materiaal, overlevering, directe informatie en maximale inferentie. Eindig met één claim die expliciet verboden blijft.`,
m06:`Gebruik de echte paper-voorbeelden uit de voorafgaande theorie als secundaire debatankers. Ontwerp een status-quaestionisstructuur die duidelijk maakt welke historiografische vragen dit primaire dossier kan testen. Verzin geen onderzoekers of literatuur; benoem welke aanvullende secundaire literatuur je nog zou moeten zoeken.`,
m07:`Positioneer een mogelijk onderzoek tegenover de echte corpusvoorbeelden uit de theorie. Formuleer de bijdrage als toetsing, broncombinatie, schaal of inferentiële verbetering; maak geen claim dat 'niemand dit ooit onderzocht'.`,
m08:`Kies een primaire analysemethode voor dit authentieke dossier en maximaal twee ondersteunende methoden. Leg per methode uit welk inferentieprobleem zij oplost, welke aannames zij maakt en welke conclusie zij niet kan produceren.`,
m09:`Kies een theoretisch concept dat nuttig kan zijn voor dit dossier. Vertaal het naar observeerbare verwachtingen, markeer waar het model ophoudt en geef één historische situatie waarin dezelfde observatie een andere betekenis zou hebben.`,
m10:`Ontwerp een triangulatiestrategie. Welke bronnen controleren elkaar werkelijk onafhankelijk, welke delen dezelfde bias, en hoe zou je met een tegenspraak omgaan? Geef per kernclaim minstens twee bewijspaden waar mogelijk.`,
m11:`Bouw voor minstens twee kernbevindingen een claim-ladder: directe observatie → contextuele interpretatie → inferentie → bredere these. Markeer exact bij welke stap extra bewijs nodig wordt.`,
m12:`Formuleer drie rivaliserende verklaringen voor één patroon dat uit het dossier naar voren kan komen. Geef mechanisme, voorspelling en het type authentieke bron waarmee je de verklaringen van elkaar kunt onderscheiden.`,
m13:`Behandel de bronzichtbaarheid zelf als proxyprobleem. Welke telbare of zichtbare kenmerken zouden gemakkelijk voor een historische grootheid worden aangezien? Leg detectie-, overleverings- en selectie-effecten uit en ontwerp één robuustheidscheck.`,
m14:`Ontwerp een historische vergelijking met minstens twee bronnen/casussen uit of rond dit dossier. Verantwoord comparabiliteit, relevante verschillen en lokale verstorende factoren. Benoem bewust most-similar of most-different logic.`,
m15:`Bouw een argumentarchitectuur voor een onderzoek op basis van dit dossier: hoofdclaim, noodzakelijke tussenclaims en hoofdstukfuncties. Voer de schraptest uit en markeer welke bron in welk argumentblok functioneert.`,
m16:`Ontwerp twee sterke academische paragrafen in FUNCTIES, niet in afgewerkt proza: topic claim, bronbewijs, inferentiestap, beperking en overgang. Leg uit waarom deze micro-architectuur sterker is dan een bron-na-bron samenvatting.`,
m17:`Formuleer vijf mogelijke historische claims uit dit dossier op verschillende sterktes. Kies voor elke claim het juiste epistemische werkwoord en leg uit waarom sterkere formuleringen niet gerechtvaardigd zijn.`,
m18:`Ontwerp een conclusie-matrix: deelvraag → bevinding → bewijs → antwoord → zekerheid → beperking. Voeg alleen implicaties toe die logisch uit de primaire bronnen en jouw methode volgen.`,
m19:`Voer een peer review uit op een denkbeeldig onderzoeksontwerp dat al deze bronnen zonder voldoende bronkritiek tot één grote these zou samenvoegen. Geef een cijfer, maximaal drie major issues, revisiestrategie en slaagtest. Baseer je kritiek uitsluitend op de echte eigenschappen van het dossier.`,
m20:`Ontwerp een mini-masterproef vanaf nul: titel, probleemstelling, hoofdvraag, deelvragen, corpus, bronkritiek, methode, argumentstructuur, rivaliserende verklaring, limitations en verwachte vorm van conclusie. Verdedig daarna drie keuzes tegen promotorvragen.`,
m21:`Maak een source passport voor elke bron: observatie, productiecontext, publiek, selectie/overlevering, directe informatie, maximale inferentie en open vraag. Kies daarna twee bronnen voor een productieve vergelijking.`,
m22:`Bereid een mondelinge verdediging voor van één historische claim uit dit dossier. Antwoord op: waarom deze bronnen, waarom deze methode, welk tegenbewijs is gevaarlijk, en welke beperking erken je zonder je kernargument op te geven?`,
m23:`Maak een Thesis Studio-audit: voorlopige vraag, claim ledger, bewijs per claim, tegenargumenten, hoofdstukfuncties, onopgeloste risico's en eerstvolgende onderzoeksactie. Schrijf geen thesisproza; ontwerp het onderzoek.`
};

function v6PickSources(moduleId,difficulty,seed){
  const r=trainRng(seed),all=v6SourceAll();
  let pool=all.filter(s=>(s.recommended_modules||[]).includes(moduleId));
  if(pool.length<4)pool=all;
  pool=shuffleR(r,pool);
  const count=Math.min(4,Math.max(2,1+Math.ceil(difficulty/2)));
  const picked=[],types=new Set();
  for(const s of pool){
    if(picked.length>=count)break;
    if(!types.has(s.source_type)||picked.length+Math.max(0,count-pool.length)>=count){picked.push(s);types.add(s.source_type)}
  }
  for(const s of pool)if(picked.length<count&&!picked.some(x=>x.id===s.id))picked.push(s);
  return picked.slice(0,count);
}

function v6SourceMaterial(s){
  return {
    authentic:true,synthetic:false,source_id:s.id,label:`${s.canonical_ref} · ${s.title}`,
    text:s.original_text,translation:s.translation_text,
    source_type:s.source_type,language:s.language,author:s.author,period:s.period,place:s.place,
    original_source_name:s.original_source_name,original_source_url:s.original_source_url,
    translation_source_name:s.translation_source_name,translation_source_url:s.translation_source_url,
    translation_credit:s.translation_credit,context_hint:s.context_hint,language_hint:s.language_hint,
    analytic_hint:s.analytic_hint,scaffold:s.scaffold||[]
  };
}

window.buildTrainingExercise=function(moduleId,difficulty,mode,requestedMaterial,seed){
  const ex=V6_BASE.buildTrainingExercise(moduleId,difficulty,mode,requestedMaterial,seed);
  const module=TRAINING_MODULES.find(m=>m.id===moduleId)||TRAINING_MODULES[0];
  const picked=v6PickSources(moduleId,difficulty,seed);
  ex.materials=picked.map(v6SourceMaterial);
  ex.material_type="authentic_primary_sources";
  ex.context={place:"multiple authentic contexts",period:"source-dependent",topic:module.title,angle:module.desc};
  ex.intro=`Authentiek brondossier. Alle antieke teksten/objectgegevens hieronder zijn primaire bronnen. Originele editie/objectrecord en Engelse controlebron worden per bron vermeld. Modulefocus: ${module.desc}`;
  ex.expected={
    module_focus:module.desc,authentic_sources:picked.map(s=>({id:s.id,ref:s.canonical_ref,type:s.source_type})),
    source_biases:picked.map(s=>({label:s.canonical_ref,bias:s.analytic_hint||s.context_hint||""}))
  };
  if(["m06","m07"].includes(moduleId)){
    ex.secondary_context=trainingBenchmarks(module).slice(0,5);
  }
  ex.help_level=0;
  ex.signature=`${moduleId}|${ex.family}|AUTH|${picked.map(s=>s.id).join("+")}|${difficulty}`;
  ex.title=`Module ${module.n} · ${module.title} — ${ex.family.replaceAll("-"," ")}`;
  if(V6_AUTH_TASKS[moduleId]) ex.prompt=V6_AUTH_TASKS[moduleId];
  if(moduleId==="m21") ex.prompt=`Maak een source passport voor elke bron: fysieke/tekstuele observatie, productiecontext, doelgroep, selectie/overlevering, directe informatie, maximale inferentie en open vraag. Annoteer daarna welke twee bronnen het meest productief samen gelezen kunnen worden en waarom.`;
  if(moduleId==="m22") ex.prompt=`Bereid een mondelinge verdediging voor van een historisch argument dat met dit dossier gemaakt kan worden. Formuleer eerst de claim; beantwoord daarna: waarom deze bronnen, waarom deze inferentie, welk tegenbewijs is gevaarlijk, en welke beperking zou je zonder defensiviteit erkennen?`;
  if(moduleId==="m23") ex.prompt=`Ontwerp een thesis-studio dossier: voorlopige hoofdvraag, claim ledger, bewijs per claim, tegenargumenten, hoofdstukfuncties, onopgeloste risico's en eerstvolgende onderzoeksactie. Schrijf geen proza voor de thesis; ontwerp en audit het onderzoek.`;
  return ex;
};

function v6MaterialHTML(m){
  return `<div class="material authentic">
   <div class="primary-source-head"><div><span class="auth-label">AUTHENTIC PRIMARY SOURCE</span><h5 style="margin-top:7px">${esc(m.label)}</h5></div><span class="library-type">${esc(m.source_type||"source")}</span></div>
   <div class="auth-source-meta"><span>${esc(m.author||"")}</span><span>${esc(m.period||"")}</span><span>${esc(m.place||"")}</span></div>
   <div class="source-columns">
    <div class="source-text-panel"><h5>Original / object data</h5><div class="source-original">${esc(m.text||"")}</div></div>
    <div class="source-text-panel"><h5>English</h5><div class="source-translation">${esc(m.translation||"")}</div><div class="page-source-note">${esc(m.translation_credit||"")}</div></div>
   </div>
   <div class="source-links"><a href="${esc(m.original_source_url||"#")}" target="_blank" rel="noopener">Original edition / record ↗</a><a href="${esc(m.translation_source_url||"#")}" target="_blank" rel="noopener">English translation / check ↗</a></div>
  </div>`;
}

window.renderExercise=function(){
  const ex=state.currentExercise,body=$("#exerciseBody"),empty=$("#exerciseEmpty");if(!body||!empty)return;
  if(!ex){body.style.display="none";empty.style.display="block";return}
  empty.style.display="none";body.style.display="block";
  const materials=(ex.materials||[]).map(v6MaterialHTML).join("");
  body.innerHTML=`<div class="exercise-shell">
   <div class="exercise-head"><div><h4 class="exercise-title">${esc(ex.title)}</h4><div class="tiny">Variatie-ID ${esc(ex.signature)} · ${esc(ex.mode)} · authentieke bronnen</div></div></div>
   <div class="callout good">${esc(ex.intro)}</div>
   ${ex.secondary_context?.length?`<div class="callout"><strong>REAL SECONDARY CONTEXT FROM YOUR ANALYSED PAPERS</strong><div class="tiny">This is not an ancient source. It is the real secondary layer required for a historiography exercise.</div>${ex.secondary_context.map(b=>`<div style="margin-top:8px"><strong>${esc(b.source||"")}</strong> — ${esc(b.principle||"")} ${(b.evidence||[]).map(v=>v.physical_page?`(physical PDF p. ${v.physical_page})`:"").join(" ")}</div>`).join("")}</div>`:""}
   <div class="material-grid">${materials}</div>
   <div><h4>Opdracht</h4><div class="exercise-prompt">${esc(ex.prompt)}</div></div>
   <div class="help-ladder"><span class="help-step ${ex.help_level>=1?"on":""}">1 context</span><span class="help-step ${ex.help_level>=2?"on":""}">2 taal/epigrafie</span><span class="help-step ${ex.help_level>=3?"on":""}">3 analysehint</span><span class="help-step ${ex.help_level>=4?"on":""}">4 scaffold</span></div>
   <div id="trainingHintBox"></div>
  </div>`;
  const a=currentAttempt();if($("#trainingAnswer"))$("#trainingAnswer").value=a?.answer||"";
  if($("#variationBadge"))$("#variationBadge").textContent=`${ex.family.replaceAll("-"," ")} · authentic`;
  if($("#focusDifficultyBadge"))$("#focusDifficultyBadge").textContent=`niveau ${ex.difficulty}/5${ex.difficulty>=4?" · 18+":" "}`;
};

window.showTrainingHint=async function(){
  const ex=state.currentExercise;if(!ex)return toast("Start eerst een oefening.","warn");
  if(ex.mode==="exam")return toast("Examenmodus geeft geen inhoudelijke hulp.","warn");
  const max=ex.mode==="guided"?4:2;
  if((ex.help_level||0)>=max)return toast(ex.mode==="blind"?"Blinde transfer stopt na taal/context-hulp.":"Alle hulplagen zijn al geopend.","warn");
  ex.help_level=(ex.help_level||0)+1;await saveTrainingState();
  const level=ex.help_level,box=$("#trainingHintBox");
  const blocks=(ex.materials||[]).map(m=>{
    let t="";
    if(level===1)t=m.context_hint;
    if(level===2)t=m.language_hint;
    if(level===3)t=m.analytic_hint;
    if(level===4)t=(m.scaffold||[]).map((x,i)=>`${i+1}. ${x}`).join("\n");
    return `<div class="source-help"><strong>${esc(m.label)}</strong><div style="margin-top:5px;white-space:pre-wrap">${esc(t||"Geen extra hulp voor deze bron.")}</div></div>`;
  }).join("");
  box.innerHTML=`<div class="callout warn"><strong>Hulpniveau ${level}</strong><div class="tiny">Gebruik hulp om opnieuw te redeneren, niet om een antwoord over te nemen.</div></div>${blocks}`;
  renderExercise();
  const newBox=$("#trainingHintBox");if(newBox)newBox.innerHTML=`<div class="callout warn"><strong>Hulpniveau ${level}</strong></div>${blocks}`;
};

window.copyTrainingGradingPrompt=async function(){
  const ex=state.currentExercise;if(!ex)return toast("Start eerst een oefening.","warn");
  const answer=$("#trainingAnswer").value.trim();if(answer.length<80)return toast("Werk je antwoord eerst voldoende uit.","warn");
  const attempt=await saveCurrentAttempt(answer,true),module=TRAINING_MODULES.find(m=>m.id===ex.module_id),bench=trainingBenchmarks(module),rubric=gradingRubric(module,ex.difficulty);
  const provenance=(ex.materials||[]).map(m=>({ref:m.label,original:m.original_source_url,english:m.translation_source_url}));  
  const prompt=`Je beoordeelt een oefening uit Scriptorium v6 als zeer kritische maar constructieve masterbeoordelaar Oude Geschiedenis. 18/20 of hoger is uitzonderlijk.

Alle antieke oefenbronnen zijn AUTHENTIEKE PRIMAIRE BRONNEN. Beoordeel de student op bronkritiek en inferentie; corrigeer een bron of vertaling alleen wanneer je daar voldoende zekerheid voor hebt.

OEFENING
${exerciseText(ex)}

BRONPROVENANCE
${JSON.stringify(provenance,null,2)}

ANTWOORD STUDENT
${answer}

RELEVANTE PRINCIPES UIT HET 56-WERKEN-CORPUS
${JSON.stringify(bench,null,2)}

RUBRIC
${JSON.stringify(rubric,null,2)}

Geef uitsluitend één geldig JSON-object terug volgens dit schema:
${JSON.stringify(trainingGradeSchema(attempt.attempt_id),null,2)}

Regels:
- 18+ alleen bij zelfstandige, precieze, bronkritische en methodologisch coherente redenering.
- Geef geen volledig modelantwoord; model_reasoning_outline bevat alleen denkstappen.
- Feedback: probleem → waarom belangrijk → revisieactie → zelftest.
- critical_issues bevat alleen fundamentele fouten.
- next_drill moet transfer naar een andere authentieke broncontext eisen.`;
  await copyText(prompt);toast("V6-beoordelingsprompt gekopieerd.","good");
};


V6_BASE.startTrainingSession=window.startTrainingSession;

window.startTrainingSession=async function(kind=null,moduleId=null,skipTheory=false){
  const id=moduleId||$("#trainingModule")?.value||TRAINING_MODULES[0].id;
  const k=kind||$("#trainingSessionLength")?.value||"module";
  if(!skipTheory && ["module","mastery"].includes(k)){
    window.V6_PENDING_SESSION={kind:k,moduleId:id};
    return window.openModuleTheory(id);
  }
  return V6_BASE.startTrainingSession(k,id);
};

window.renderTraining=function(){
  V6_BASE.renderTraining();
  if($("#trainMastered")){
    const mastered=TRAINING_MODULES.filter(m=>moduleMastery(m.id).mastered).length;
    $("#trainMastered").textContent=`${mastered}/${TRAINING_MODULES.length}`;
  }
  const badge=[...document.querySelectorAll("#page-training .badge")].find(x=>x.textContent.trim()==="20 modules");
  if(badge)badge.textContent=`${TRAINING_MODULES.length} modules`;
  document.querySelectorAll("#trainingModuleMap .module-card").forEach((card,i)=>{
    const m=TRAINING_MODULES[i];if(!m||card.querySelector(".v6-theory-btn"))return;
    const actions=card.querySelector(".module-actions")||card;
    const b=document.createElement("button");b.className="btn small v6-theory-btn";b.textContent="Theorie";b.onclick=()=>window.openModuleTheory(m.id);actions.insertBefore(b,actions.firstChild);
  });
};

function v6ReviewInterval(score){
  if(score>=18)return 14;
  if(score>=16)return 7;
  if(score>=14)return 3;
  return 1;
}
async function v6ScheduleReview(attempt){
  if(!attempt?.grade)return;
  const sched=await v6SettingsGet("v6_review_schedule",{});
  const days=v6ReviewInterval(attempt.grade.score);
  sched[attempt.module_id]={due_at:Date.now()+days*86400000,last_score:attempt.grade.score,last_attempt:attempt.attempt_id,updated_at:Date.now()};
  await v6SettingsPut("v6_review_schedule",sched);
}
window.importTrainingGrade=async function(){
  await V6_BASE.importTrainingGrade();
  const a=currentAttempt();if(a?.grade)await v6ScheduleReview(a);
  await renderV6Progress();
};

function v6ErrorCategory(txt){
  const s=(txt||"").toLowerCase();
  const tests=[
   ["Bronkritiek",["bron","source","bias","genre","represent"]],
   ["Inferentie",["infer","sprong","claim","bewijs","evidence"]],
   ["Causaliteit",["causal","oorzaak","correl"]],
   ["Operationalisering",["operational","begrip","concept","indicator"]],
   ["Corpus/representativiteit",["corpus","representativ","selectie"]],
   ["Methodologie",["method","methode","validiteit"]],
   ["Argumentatie",["argument","structuur","logica"]],
   ["Epistemische precisie",["overclaim","zeker","precisie","hedg"]]
  ];
  for(const [name,keys] of tests)if(keys.some(k=>s.includes(k)))return name;
  return "Overig";
}

async function renderV6Progress(){
  if(!$("#masteryMap"))return;
  const attempts=(state.training?.attempts||[]).filter(a=>a.grade?.score!=null);
  const mm=TRAINING_MODULES.map(m=>({m,x:moduleMastery(m.id)}));
  $("#masteryMap").innerHTML=mm.map(({m,x})=>{
    const val=x.mastered?100:x.avg!=null?Math.min(95,Math.max(10,x.avg/20*100)):0;
    return `<div class="mastery-skill"><strong>${m.n}. ${esc(m.title)}</strong><div class="tiny">${esc(x.label)}${x.avg!=null?` · laatste3 ${x.avg.toFixed(1)}`:""}</div><div class="bar"><div style="width:${val}%"></div></div></div>`;
  }).join("");
  const ranked=mm.filter(z=>z.x.best!=null).sort((a,b)=>(b.x.avg??b.x.best)-(a.x.avg??a.x.best));
  $("#bestModule").textContent=ranked[0]?.m.title||"—";
  $("#weakModule").textContent=ranked.length?ranked[ranked.length-1].m.title:"—";

  const errors={};
  attempts.forEach(a=>{
    [...(a.grade.critical_issues||[]),...(a.grade.weaknesses||[])].forEach(t=>{
      const c=v6ErrorCategory(t);errors[c]=(errors[c]||0)+1;
    });
  });
  $("#errorCategoryCount").textContent=Object.keys(errors).length;
  $("#errorLog").innerHTML=Object.keys(errors).length?Object.entries(errors).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div class="error-item"><strong>${esc(k)}</strong><div class="tiny">${v} signalen in beoordeelde pogingen</div></div>`).join(""):'<div class="empty">Nog onvoldoende beoordeelde pogingen.</div>';

  const sched=await v6SettingsGet("v6_review_schedule",{}),now=Date.now();
  const due=Object.entries(sched).filter(([_,x])=>x.due_at<=now).sort((a,b)=>a[1].due_at-b[1].due_at);
  $("#reviewDueCount").textContent=due.length;
  $("#reviewDueList").innerHTML=due.length?due.map(([id,x])=>{const m=TRAINING_MODULES.find(z=>z.id===id);return `<div class="review-item"><strong>${esc(m?.title||id)}</strong><div class="tiny">Laatste score ${Number(x.last_score).toFixed(1)} · review klaar</div><button class="btn small" onclick="startModule('${id}','single')">Start transferreview</button></div>`}).join(""):'<div class="empty">Geen review vervallen. Nieuwe reviews verschijnen automatisch na beoordeling.</div>';

  const dims={};attempts.forEach(a=>Object.entries(a.grade.dimension_scores||{}).forEach(([k,v])=>(dims[k]??=[]).push(+v)));
  $("#skillProfile").innerHTML=Object.keys(dims).length?Object.entries(dims).map(([k,v])=>`<div class="profile-row"><strong>${esc(k)}</strong><span>${(v.reduce((a,b)=>a+b,0)/v.length).toFixed(1)}</span></div>`).join(""):'<div class="empty">Nog geen dimensiescores.</div>';
}

async function v6StartMixedReview(){
  const sched=await v6SettingsGet("v6_review_schedule",{}),now=Date.now();
  let ids=Object.entries(sched).filter(([_,x])=>x.due_at<=now).map(([id])=>id);
  if(!ids.length){
    ids=TRAINING_MODULES.map(m=>m.id).filter(id=>moduleMastery(id).count>0).sort((a,b)=>(moduleMastery(a).avg??99)-(moduleMastery(b).avg??99));
  }
  const id=ids[0]||TRAINING_MODULES[0].id;
  if($("#trainingModule"))$("#trainingModule").value=id;
  await V6_BASE.startTrainingSession("single",id);
}


function v6MergeTraining(a={},b={}){
  const map=new Map();
  [...(a.attempts||[]),...(b.attempts||[])].forEach(x=>{
    const old=map.get(x.attempt_id);
    const stamp=z=>Math.max(z?.graded_at||0,z?.updated_at||0,z?.created_at||0);
    if(!old||stamp(x)>=stamp(old))map.set(x.attempt_id,x);
  });
  const newer=(b.sync_updated_at||0)>(a.sync_updated_at||0)?b:a;
  return {...a,...b,attempts:[...map.values()].sort((x,y)=>(x.created_at||0)-(y.created_at||0)),
    curriculum_index:newer.curriculum_index??0,cycle:Math.max(a.cycle||1,b.cycle||1),
    current:newer.current||a.current||b.current||null,session:newer.session||null,
    sync_updated_at:Date.now()};
}
function v6MergeObjectRecords(a={},b={}){
  const out={...a};
  for(const [k,v] of Object.entries(b||{})){
    const av=out[k];if(!av){out[k]=v;continue}
    const ats=av?.updated_at||0,bts=v?.updated_at||0;
    out[k]=bts>=ats?v:av;
  }
  return out;
}
function v6MergeSources(a=[],b=[]){
  const map=new Map();[...a,...b].forEach(x=>{const o=map.get(x.id);if(!o||(x.updated_at||0)>=(o.updated_at||0))map.set(x.id,x)});return [...map.values()];
}
function v6MergeSyncPayload(a={},b={}){
  const w=new Map();[...(a.works||[]),...(b.works||[])].forEach(x=>{const o=w.get(x.id);if(!o||(x.updated_at||0)>=(o.updated_at||0))w.set(x.id,x)});
  return {
    scriptorium_sync:1,generated_at:new Date().toISOString(),works:[...w.values()],
    training:v6MergeTraining(a.training||{},b.training||{}),
    theory_seen:{...(a.theory_seen||{}),...(b.theory_seen||{})},
    annotations:v6MergeObjectRecords(a.annotations||{},b.annotations||{}),
    review_schedule:v6MergeObjectRecords(a.review_schedule||{},b.review_schedule||{}),
    custom_sources:v6MergeSources(a.custom_sources||[],b.custom_sources||[])
  };
}
async function v6BuildSyncPayload(){
  return {
    scriptorium_sync:1,generated_at:new Date().toISOString(),
    works:await idbGetAll("works"),
    training:(await idbGet("settings","training_v4"))?.value||{},
    theory_seen:await v6SettingsGet("v6_theory_seen",{}),
    annotations:await v6SettingsGet("v6_source_annotations",{}),
    review_schedule:await v6SettingsGet("v6_review_schedule",{}),
    custom_sources:await v6SettingsGet("v6_custom_sources",[])
  };
}
async function v6ApplySyncPayload(p){
  if(!p||p.scriptorium_sync!==1)throw new Error("Geen geldig Scriptorium-syncbestand.");
  const local=await v6BuildSyncPayload(),merged=v6MergeSyncPayload(local,p);
  for(const w of merged.works)await idbPut("works",w);
  await idbPut("settings",{key:"training_v4",value:merged.training,updated_at:Date.now()});
  await v6SettingsPut("v6_theory_seen",merged.theory_seen);
  await v6SettingsPut("v6_source_annotations",merged.annotations);
  await v6SettingsPut("v6_review_schedule",merged.review_schedule);
  await v6SettingsPut("v6_custom_sources",merged.custom_sources);
  state.training=merged.training;state.currentExercise=merged.training.current||null;
  await v6LoadCustomSources();await loadWorks();return merged;
}
async function v6ExportSyncFile(){
  const p=await v6BuildSyncPayload(),blob=new Blob([JSON.stringify(p,null,2)],{type:"application/json"});
  downloadBlob(blob,`Scriptorium_sync_${new Date().toISOString().slice(0,10)}.json`);
  await v6SettingsPut("v6_sync_meta",{last_export:Date.now()});toast("Syncbestand gemaakt.","good");
}
async function v6ImportSyncFile(file){
  const p=JSON.parse(await file.text());await v6ApplySyncPayload(p);
  await v6SettingsPut("v6_sync_meta",{last_import:Date.now()});toast("Syncbestand samengevoegd.","good");
}

const V6_SB_SQL=`create table if not exists public.scriptorium_sync (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.scriptorium_sync enable row level security;
create policy "read own scriptorium" on public.scriptorium_sync for select using (auth.uid() = user_id);
create policy "insert own scriptorium" on public.scriptorium_sync for insert with check (auth.uid() = user_id);
create policy "update own scriptorium" on public.scriptorium_sync for update using (auth.uid() = user_id) with check (auth.uid() = user_id);`;

async function sbConfig(){return await v6SettingsGet("v6_sb_config",{})}
async function sbSaveConfig(){
  const old=await sbConfig(),cfg={...old,url:$("#sbUrl").value.trim().replace(/\/$/,""),key:$("#sbKey").value.trim(),email:$("#sbEmail").value.trim(),updated_at:Date.now()};
  await v6SettingsPut("v6_sb_config",cfg);sbStatus("Configuratie bewaard.","good");
}
function sbStatus(msg,kind=""){const e=$("#sbStatus");if(!e)return;e.textContent=msg;e.className=`callout ${kind==="good"?"sync-ok":kind==="bad"?"sync-bad":""}`}
async function sbRequest(path,opt={}){
  const c=await sbConfig();if(!c.url||!c.key)throw new Error("Vul eerst Supabase URL en key in.");
  const headers={"apikey":c.key,"Content-Type":"application/json",...(opt.headers||{})};
  const r=await fetch(c.url+path,{...opt,headers});let data=null;try{data=await r.json()}catch{}
  if(!r.ok)throw new Error(data?.msg||data?.message||data?.error_description||`${r.status} ${r.statusText}`);return data;
}
async function sbStoreSession(data){
  const c=await sbConfig(),expires=Date.now()+((data.expires_in||3600)*1000);
  await v6SettingsPut("v6_sb_config",{...c,access_token:data.access_token,refresh_token:data.refresh_token,user:data.user,expires_at:expires,updated_at:Date.now()});
}
async function sbEnsureAccess(){
  let c=await sbConfig();if(c.access_token&&c.expires_at>Date.now()+60000)return c.access_token;
  if(!c.refresh_token)throw new Error("Meld je eerst aan.");
  const d=await sbRequest("/auth/v1/token?grant_type=refresh_token",{method:"POST",body:JSON.stringify({refresh_token:c.refresh_token})});await sbStoreSession(d);return d.access_token;
}
async function sbSignUp(){
  await sbSaveConfig();const c=await sbConfig(),pw=$("#sbPassword").value;
  if(!c.email||!pw)throw new Error("E-mail en wachtwoord ontbreken.");
  const d=await sbRequest("/auth/v1/signup",{method:"POST",body:JSON.stringify({email:c.email,password:pw})});
  if(d.access_token)await sbStoreSession(d);sbStatus("Account aangemaakt. Als e-mailbevestiging actief is: bevestig eerst en meld daarna aan.","good");
}
async function sbSignIn(){
  await sbSaveConfig();const c=await sbConfig(),pw=$("#sbPassword").value;
  if(!c.email||!pw)throw new Error("E-mail en wachtwoord ontbreken.");
  const d=await sbRequest("/auth/v1/token?grant_type=password",{method:"POST",body:JSON.stringify({email:c.email,password:pw})});await sbStoreSession(d);$("#sbPassword").value="";sbStatus(`Aangemeld als ${d.user?.email||c.email}.`,"good");
}
async function sbSignOut(){
  const c=await sbConfig();if(c.access_token)try{await sbRequest("/auth/v1/logout",{method:"POST",headers:{Authorization:`Bearer ${c.access_token}`}})}catch{}
  await v6SettingsPut("v6_sb_config",{url:c.url,key:c.key,email:c.email,updated_at:Date.now()});sbStatus("Afgemeld.");
}
async function sbPullPayload(){
  const c=await sbConfig(),token=await sbEnsureAccess(),uid=c.user?.id||(await sbConfig()).user?.id;if(!uid)throw new Error("Gebruikers-ID ontbreekt.");
  const d=await sbRequest(`/rest/v1/scriptorium_sync?user_id=eq.${encodeURIComponent(uid)}&select=payload,updated_at`,{headers:{Authorization:`Bearer ${token}`}});
  return Array.isArray(d)&&d[0]?.payload?d[0].payload:null;
}
async function sbPushPayload(payload){
  const c=await sbConfig(),token=await sbEnsureAccess(),cc=await sbConfig(),uid=cc.user?.id;if(!uid)throw new Error("Gebruikers-ID ontbreekt.");
  await sbRequest("/rest/v1/scriptorium_sync?on_conflict=user_id",{method:"POST",headers:{Authorization:`Bearer ${token}`,Prefer:"resolution=merge-duplicates,return=minimal"},body:JSON.stringify({user_id:uid,payload,updated_at:new Date().toISOString()})});
}
async function sbSync(mode="merge"){
  sbStatus("Synchroniseren…");const local=await v6BuildSyncPayload();
  if(mode==="push"){await sbPushPayload(local);sbStatus("Lokale gegevens naar cloud gestuurd.","good");return}
  const remote=await sbPullPayload();
  if(mode==="pull"){if(remote)await v6ApplySyncPayload(remote);sbStatus(remote?"Cloudgegevens lokaal samengevoegd.":"Nog geen cloudgegevens.","good");return}
  const merged=remote?v6MergeSyncPayload(local,remote):local;await v6ApplySyncPayload(merged);await sbPushPayload(merged);sbStatus("Cloud en lokaal samengevoegd.","good");
}


async function v6ExportSourceLibrary(){
  const pack={source_pack:1,generated_at:new Date().toISOString(),sources:v6SourceAll()};
  downloadBlob(new Blob([JSON.stringify(pack,null,2)],{type:"application/json"}),`Scriptorium_primary_sources_${new Date().toISOString().slice(0,10)}.json`);
}
async function v6ImportSourceLibrary(file){
  const raw=JSON.parse(await file.text()),arr=Array.isArray(raw)?raw:raw.sources;
  if(!Array.isArray(arr))throw new Error("Geen geldige sources-array.");
  const clean=arr.filter(s=>s&&s.primary===true&&s.id&&s.canonical_ref&&s.original_source_url).map(s=>({...s,ready:s.ready!==false,updated_at:Date.now()}));
  for(const s of clean){
    if(["grc","lat"].includes(s.language)&&(!s.original_text||!s.translation_text||!s.translation_source_url))throw new Error(`Tekstbron ${s.id} mist origineel, Engelse vertaling of vertaalbron.`);
  }
  const old=await v6SettingsGet("v6_custom_sources",[]),merged=v6MergeSources(old,clean);await v6SettingsPut("v6_custom_sources",merged);await v6LoadCustomSources();renderSourceLibrary();toast(`${clean.length} gecontroleerde bronrecords geïmporteerd.`,"good");
}

window.showPage=function(name){
  $$(".page").forEach(p=>p.classList.toggle("active",p.id==="page-"+name));
  $$("#nav button").forEach(b=>b.classList.toggle("active",b.dataset.page===name));
  document.body.classList.toggle("training-focus-mode",name==="training-focus");
  document.body.classList.toggle("theory-mode",name==="training-theory");
  const names={dashboard:"Overzicht",corpus:"Corpus",discovery:"Aanvullende vondsten",exchange:"Corpusanalyse",training:"Training naar 18+",atelier:"Leeratelier",settings:"Instellingen & backup","training-focus":"Focusmodus","training-theory":"Moduletheorie",sources:"Primaire bronnen",progress:"Voortgang",sync:"Synchronisatie"};
  if($("#pageTitle"))$("#pageTitle").textContent=names[name]||"Scriptorium";
  if(name==="corpus")renderCorpus();
  if(name==="exchange")renderCorpusExport();
  if(name==="training")renderTraining();
  if(name==="training-focus")renderTrainingFocus();
  if(name==="atelier")renderLessons();
  if(name==="settings")renderStorage();
  if(name==="sources")renderSourceLibrary();
  if(name==="progress")renderV6Progress();
  if(name==="sync")v6RenderSync();
};

async function v6RenderSync(){
  const c=await sbConfig(),meta=await v6SettingsGet("v6_sync_meta",{});
  if($("#sbUrl"))$("#sbUrl").value=c.url||"";
  if($("#sbKey"))$("#sbKey").value=c.key||"";
  if($("#sbEmail"))$("#sbEmail").value=c.email||"";
  if(c.access_token)sbStatus(`Cloudsessie beschikbaar${c.user?.email?` voor ${c.user.email}`:""}.`,"good");
  else {
    const last=meta.last_export?` Laatste syncbestand: ${new Date(meta.last_export).toLocaleString("nl-BE")}.`:"";
    sbStatus("Nog niet verbonden met cloud."+last);
  }
}

function v6BindNewUI(){
  const on=(sel,fn)=>{const el=$(sel);if(el)el.onclick=fn};
  const change=(sel,fn)=>{const el=$(sel);if(el)el.onchange=fn};
  on("#leaveTrainingTheory",()=>showPage("training"));
  on("#beginPracticeFromTheory",async()=>{
    const p=window.V6_PENDING_SESSION||{kind:"module",moduleId:window.V6_THEORY_MODULE};
    window.V6_PENDING_SESSION=null;await window.startTrainingSession(p.kind,p.moduleId,true);
  });
  on("#openSelectedTheory",()=>window.openModuleTheory($("#trainingModule")?.value||TRAINING_MODULES[0].id));
  on("#startMixedFromTraining",v6StartMixedReview);
  on("#startMixedReview",v6StartMixedReview);

  ["sourceSearch","sourceTypeFilter","sourceLangFilter"].forEach(id=>{const e=$("#"+id);if(e)e.oninput=renderSourceLibrary});
  on("#exportSourceLibrary",v6ExportSourceLibrary);
  change("#importSourceLibrary",async e=>{try{if(e.target.files[0])await v6ImportSourceLibrary(e.target.files[0])}catch(err){toast(err.message,"bad")}finally{e.target.value=""}});

  on("#exportSyncFile",v6ExportSyncFile);
  change("#importSyncFile",async e=>{try{if(e.target.files[0])await v6ImportSyncFile(e.target.files[0])}catch(err){toast(err.message,"bad")}finally{e.target.value=""}});
  on("#sbSaveConfig",()=>sbSaveConfig().catch(e=>sbStatus(e.message,"bad")));
  on("#sbSignUp",()=>sbSignUp().catch(e=>sbStatus(e.message,"bad")));
  on("#sbSignIn",()=>sbSignIn().catch(e=>sbStatus(e.message,"bad")));
  on("#sbSignOut",()=>sbSignOut().catch(e=>sbStatus(e.message,"bad")));
  on("#sbSyncNow",()=>sbSync("merge").catch(e=>sbStatus(e.message,"bad")));
  on("#sbPush",()=>sbSync("push").catch(e=>sbStatus(e.message,"bad")));
  on("#sbPull",()=>sbSync("pull").catch(e=>sbStatus(e.message,"bad")));
  on("#copySupabaseSql",async()=>{await copyText(V6_SB_SQL);toast("SQL gekopieerd.","good")});
}

window.init=async function(){
  v6EnhanceUI();
  // Open IndexedDB first. v6LoadCustomSources reads the settings store and must never run while db is null.
  await V6_BASE.init();
  await v6LoadCustomSources();
  v6BindNewUI();
  const hint=$("#showTrainingHint");if(hint)hint.textContent="Hulp / makkelijker";
  await renderV6Progress();
  if("serviceWorker" in navigator && (location.protocol==="https:"||location.hostname==="localhost")){
    navigator.serviceWorker.register("./sw.js").catch(console.warn);
  }
  setTimeout(async()=>{const c=await sbConfig();if(c.access_token||c.refresh_token)sbSync("merge").catch(()=>{});},1800);
  setInterval(async()=>{const c=await sbConfig();if(c.access_token||c.refresh_token)sbSync("merge").catch(()=>{});},300000);
};

window.openModuleTheory=openModuleTheory;
window.renderSourceLibrary=renderSourceLibrary;
window.renderV6Progress=renderV6Progress;
window.v6StartMixedReview=v6StartMixedReview;

})();
