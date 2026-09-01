/* SCRIPTORIUM V8.1 CLEAN PRODUCTION BUNDLE
   Samengevoegd uit de historisch gegroeide runtime-lagen.
   Niet geminified: secties blijven onderhoudbaar. */

/* ===== CORE ===== */
'use strict';
const LIMITS={count:12,fileMB:45,totalMB:240,maxChunk:45};
const PAGE_SIZE=20;
let db=null, state={works:[],corpusPage:1,currentWork:null,training:null,currentExercise:null};
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const uid=()=>crypto.randomUUID?crypto.randomUUID():'w_'+Date.now()+'_'+Math.random().toString(36).slice(2);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const MB=n=>(n/1024/1024).toFixed(1);
function toast(msg,type=''){const d=document.createElement('div');d.className='toast '+type;d.textContent=msg;$('#toasts').appendChild(d);setTimeout(()=>d.remove(),4500)}
function downloadBlob(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1000)}
function slug(s){return String(s||'werk').normalize('NFKD').replace(/[^\w\s-]/g,'').trim().replace(/\s+/g,'_').slice(0,80)||'werk'}
function debounce(fn,ms=250){let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),ms)}}
async function copyText(text){try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(text);return true}}catch{}const ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.focus();ta.select();let ok=false;try{ok=document.execCommand('copy')}catch{}ta.remove();return ok}

const SCRIPTORIUM_DB_NAME=window.ATH_PROFILE_ID?`ScriptoriumDB_${window.ATH_PROFILE_ID}`:'ScriptoriumDB';
function openDB(){return new Promise((resolve,reject)=>{const r=indexedDB.open(SCRIPTORIUM_DB_NAME,3);r.onupgradeneeded=e=>{const d=e.target.result;if(!d.objectStoreNames.contains('works'))d.createObjectStore('works',{keyPath:'id'});if(!d.objectStoreNames.contains('files'))d.createObjectStore('files',{keyPath:'id'});if(!d.objectStoreNames.contains('settings'))d.createObjectStore('settings',{keyPath:'key'});};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
function tx(store,mode='readonly'){if(!db)throw new Error('Lokale database is nog niet geopend');return db.transaction(store,mode).objectStore(store)}
function idbGetAll(store){return new Promise((res,rej)=>{const r=tx(store).getAll();r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}
function idbGet(store,key){return new Promise((res,rej)=>{const r=tx(store).get(key);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}
function idbPut(store,val){return new Promise((res,rej)=>{const r=tx(store,'readwrite').put(val);r.onsuccess=()=>{try{window.AthSync?.markDirty(window.ATH_PROFILE_ID)}catch{}res(val)};r.onerror=()=>rej(r.error)})}
function idbDelete(store,key){return new Promise((res,rej)=>{const r=tx(store,'readwrite').delete(key);r.onsuccess=()=>{try{window.AthSync?.markDirty(window.ATH_PROFILE_ID)}catch{}res()};r.onerror=()=>rej(r.error)})}
function idbClear(store){return new Promise((res,rej)=>{const r=tx(store,'readwrite').clear();r.onsuccess=()=>res();r.onerror=()=>rej(r.error)})}
function legacyOpen(){return new Promise((res,rej)=>{const r=indexedDB.open('ScriptoriumDB',3);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}
async function migrateLegacyDBIfNeeded(){if(!window.ATH_PROFILE_ID||SCRIPTORIUM_DB_NAME==='ScriptoriumDB')return;const existing=await idbGetAll('works');if(existing.length)return;try{const legacy=await legacyOpen();const read=s=>new Promise((res,rej)=>{if(!legacy.objectStoreNames.contains(s))return res([]);const r=legacy.transaction(s).objectStore(s).getAll();r.onsuccess=()=>res(r.result||[]);r.onerror=()=>rej(r.error)});const works=await read('works'),settings=await read('settings'),files=await read('files');for(const x of works)await idbPut('works',x);for(const x of settings)await idbPut('settings',x);for(const x of files)await idbPut('files',x);legacy.close();if(works.length||settings.length||files.length)toast('Bestaande Scriptorium-data is aan dit Athenaeum-profiel gekoppeld.','good')}catch(e){console.warn('Legacy migration skipped',e)}}


const TRAINING_MODULES=[
{id:"m01",n:1,title:"Diagnose & onderzoekslogica",desc:"Herken fundamentele sterktes en zwaktes in een volledig onderzoeksontwerp.",keywords:["onderzoek","vraag","methode","argument","bron"],families:["diagnose","rangschik","red-team","reconstructie"]},
{id:"m02",n:2,title:"Onderzoeksvraag & afbakening",desc:"Maak vragen onderzoekbaar via tijd, ruimte, corpus, actoren en analytische focus.",keywords:["onderzoeksvraag","afbakening","scope"],families:["vraagbouw","afbakening","vergelijk-vragen","haalbaarheid","reverse-design"]},
{id:"m03",n:3,title:"Conceptualisering & operationalisering",desc:"Zet abstracte begrippen om in historisch verdedigbare indicatoren.",keywords:["operational","begrip","categorie","concept"],families:["operationaliseer","categorie-kritiek","indicatoren","definitie-test","anachronisme"]},
{id:"m04",n:4,title:"Corpusontwerp & representativiteit",desc:"Selecteer bronnen doelgericht en beoordeel selectie-effecten en representativiteit.",keywords:["corpus","representativ","selectie","casus"],families:["corpusbouw","uitsluiting","sampling","representativiteit","case-selection"]},
{id:"m05",n:5,title:"Primaire bronnenkritiek",desc:"Analyseer auteurschap, genre, doel, overlevering, selectie en bewijskracht.",keywords:["bronnenkritiek","primaire","bron","representatie"],families:["bronmatrix","bias-diagnose","bewijskracht","contextualiseer","contradictie"]},
{id:"m06",n:6,title:"Status quaestionis",desc:"Transformeer secundaire literatuur van auteurslijst naar analytisch debat.",keywords:["status quaestionis","literatuur","debat"],families:["synthese","debatkaart","lacune","groepeer","kritische-stand"]},
{id:"m07",n:7,title:"Historiografische positionering",desc:"Formuleer wat je eigen onderzoek toevoegt zonder kunstmatige originaliteitsclaims.",keywords:["historiograf","positie","lacune","originaliteit"],families:["positioneer","interventie","model-kritiek","continuiteit","revisionisme"]},
{id:"m08",n:8,title:"Methodeselectie & verantwoording",desc:"Kies methode omdat zij een concreet inferentieprobleem oplost.",keywords:["methodologie","methode","inferentie"],families:["methodekeuze","alternatieven","fit-test","procedure","validiteit"]},
{id:"m09",n:9,title:"Theorie & modellen",desc:"Gebruik theorie als analytisch gereedschap zonder haar tot historische werkelijkheid te maken.",keywords:["theorie","model","discours","categorie"],families:["theorie-fit","modelgrens","concept-transfer","kritiek","herformuleer-model"]},
{id:"m10",n:10,title:"Triangulatie",desc:"Combineer bronsoorten op basis van complementaire sterktes en verschillende biases.",keywords:["triangul","bronsoort","combin"],families:["triangulatieplan","conflict","bronhiërarchie","complementariteit","controlebron"]},
{id:"m11",n:11,title:"Bewijs & inferentie",desc:"Scheid observatie, interpretatie, inferentie en speculatie.",keywords:["bewijs","inferentie","claim","observatie"],families:["claim-ladder","bewijssterkte","inferentiekaart","claim-cap","bewijs-matrix"]},
{id:"m12",n:12,title:"Causaliteit & rivaliserende verklaringen",desc:"Vermijd monocausale verhalen en ontwerp tests tussen concurrerende verklaringen.",keywords:["causal","verklaring","alternatief"],families:["rivalen","causal-map","counterfactual","mechanisme","test-verklaringen"]},
{id:"m13",n:13,title:"Kwantificatie, proxies & onzekerheid",desc:"Werk met onvolledige datasets zonder proxy tot werkelijkheid te verheffen.",keywords:["proxy","kwant","onzeker","indicator"],families:["proxy-test","dataset","missingness","bandbreedte","kwant-claim"]},
{id:"m14",n:14,title:"Vergelijking & lokale variatie",desc:"Ontwerp vergelijkingen die verschillen verklaren in plaats van wegmiddelen.",keywords:["vergelijk","variatie","case"],families:["vergelijkingsdesign","most-similar","most-different","lokale-variatie","case-bias"]},
{id:"m15",n:15,title:"Argumentarchitectuur & hoofdstukken",desc:"Bouw deelvragen en hoofdstukken als noodzakelijke stappen in één cumulatief argument.",keywords:["argument","structuur","hoofdstuk","deelvraag"],families:["argument-map","hoofdstukorder","schraptest","keten","outline-redteam"]},
{id:"m16",n:16,title:"Paragraafredenering & overgangen",desc:"Laat iedere paragraaf een bewijsbare analytische stap uitvoeren.",keywords:["paragraaf","overgang","argumentatie","schrijf"],families:["paragraafdiagnose","topic-evidence","overgang","reorder","micro-argument"]},
{id:"m17",n:17,title:"Academische stijl & epistemische precisie",desc:"Kalibreer taal aan bewijskracht; vermijd vaagheid, overclaim en schijnzekerheid.",keywords:["stijl","precisie","onzeker","claim"],families:["claim-verben","precisie","hedging","stijl-diagnose","compressie"]},
{id:"m18",n:18,title:"Synthese, conclusie & limitations",desc:"Beantwoord exact de vraag, maak grenzen productief en vermijd nieuwe onbewezen claims.",keywords:["conclusie","beperking","synthese"],families:["conclusiematrix","limitation","synthese","vraag-antwoord","implicatie"]},
{id:"m19",n:19,title:"Peer review & red-team",desc:"Beoordeel een nieuwe mini-scriptie alsof je een veeleisende beoordelaar bent.",keywords:["kritiek","weakness","anti","methode","argument"],families:["peer-review","major-revision","score-18","red-team","prioriteer"]},
{id:"m20",n:20,title:"Geïntegreerde mini-masterproef",desc:"Ontwerp van nul af vraag, corpus, methode, argument, bronkritiek en conclusie.",keywords:["onderzoek","corpus","methodologie","argument","conclusie"],families:["mini-proposal","source-to-thesis","defense","research-design","full-transfer"]}
];

const TRAINING_CONTEXTS=[
{id:"athens",place:"Athene",period:"ca. 430–320 v.Chr.",topic:"burgerschap en politieke participatie",angle:"de verhouding tussen formele rechten en feitelijke deelname"},
{id:"delphi",place:"Delphi",period:"3e–2e eeuw v.Chr.",topic:"manumissie en sociale status",angle:"wat vrijlatingsdocumenten wel en niet over sociale mobiliteit tonen"},
{id:"delos",place:"Delos",period:"2e–1e eeuw v.Chr.",topic:"handel, mobiliteit en verenigingen",angle:"de relatie tussen epigrafische zichtbaarheid en economische invloed"},
{id:"pergamon",place:"Pergamon",period:"2e eeuw v.Chr.",topic:"euergetisme en stedelijke politiek",angle:"hoe elitebenefacties politieke invloed construeren"},
{id:"rhodes",place:"Rhodos",period:"3e–1e eeuw v.Chr.",topic:"maritieme handel en instituties",angle:"de relatie tussen regelgeving en commerciële praktijk"},
{id:"alexandria",place:"Alexandrië",period:"1e eeuw v.Chr.–1e eeuw n.Chr.",topic:"stedelijke groepen en identiteiten",angle:"hoe juridische categorieën sociale werkelijkheid versimpelen"},
{id:"egypt-tax",place:"Midden-Egypte",period:"2e eeuw n.Chr.",topic:"belasting en rurale huishoudens",angle:"de vertekening van administratieve papyri"},
{id:"egypt-women",place:"Oxyrhynchos",period:"1e–3e eeuw n.Chr.",topic:"vrouwen, bezit en petities",angle:"de afstand tussen juridische taal en dagelijkse onderhandeling"},
{id:"pompeii",place:"Pompeii",period:"1e eeuw n.Chr.",topic:"vrijgelatenen en stedelijke economie",angle:"representativiteit van uitzonderlijk goed bewaarde contexten"},
{id:"ostia",place:"Ostia",period:"1e–3e eeuw n.Chr.",topic:"collegia en beroepsidentiteit",angle:"institutionele zelfrepresentatie versus feitelijke economische macht"},
{id:"rome-funerary",place:"Rome",period:"1e–2e eeuw n.Chr.",topic:"familie en funeraire representatie",angle:"wat epitafen tonen over identiteit, huishouden en herinnering"},
{id:"rome-grain",place:"Rome",period:"1e–3e eeuw n.Chr.",topic:"graanvoorziening en keizerlijk bestuur",angle:"causaliteit tussen beleid, infrastructuur en stedelijke stabiliteit"},
{id:"campania",place:"Campanië",period:"1e eeuw v.Chr.–2e eeuw n.Chr.",topic:"villa-economie en landbouwproductie",angle:"hoe archeologische proxies economische schaal vertekenen"},
{id:"ephesos",place:"Efeze",period:"1e–3e eeuw n.Chr.",topic:"keizercultus en civieke identiteit",angle:"de relatie tussen monumentale zichtbaarheid en sociale consensus"},
{id:"aphrodisias",place:"Aphrodisias",period:"1e–3e eeuw n.Chr.",topic:"stedelijke elites en Romeinse connecties",angle:"lokale agency binnen imperiale structuren"},
{id:"smyrna",place:"Smyrna",period:"2e eeuw n.Chr.",topic:"retoriek en stedelijke competitie",angle:"literaire performance als bron voor politieke verhoudingen"},
{id:"danube",place:"Donaugrens",period:"1e–3e eeuw n.Chr.",topic:"militaire mobiliteit en veteranen",angle:"selectie-effecten in diploma’s en grafinscripties"},
{id:"britain",place:"Romeins Brittannië",period:"2e–4e eeuw n.Chr.",topic:"rurale nederzetting en marktintegratie",angle:"de inferentie van surveydata naar economische verandering"},
{id:"africa",place:"Africa Proconsularis",period:"2e–4e eeuw n.Chr.",topic:"grondbezit en rurale arbeid",angle:"juridische teksten versus lokale praktijk"},
{id:"leptis",place:"Leptis Magna",period:"2e–3e eeuw n.Chr.",topic:"monumentalisering en stedelijke status",angle:"keizerlijke patronage versus lokale investeringen"},
{id:"syria",place:"Romeins Syrië",period:"2e–3e eeuw n.Chr.",topic:"lokale religie en imperiale cultus",angle:"categorieproblemen in ‘Romanisering’"},
{id:"palmyra",place:"Palmyra",period:"1e–3e eeuw n.Chr.",topic:"karavaanhandel en elitevorming",angle:"epigrafische zichtbaarheid versus handelspraktijk"},
{id:"asia-market",place:"Westelijk Klein-Azië",period:"1e eeuw v.Chr.–3e eeuw n.Chr.",topic:"markten en stedelijke ruimte",angle:"functie-identificatie op basis van architectuur"},
{id:"greece-cities",place:"Griekse steden onder Rome",period:"1e–2e eeuw n.Chr.",topic:"demos, elites en lokale politiek",angle:"democratische taal versus institutionele macht"},
{id:"coinage",place:"Provinciaal Klein-Azië",period:"2e–3e eeuw n.Chr.",topic:"munten en stedelijke identiteit",angle:"representatie, publiek en selectie van iconografie"},
{id:"slavery",place:"Centraal Italië",period:"1e eeuw v.Chr.–1e eeuw n.Chr.",topic:"slavernij, vrijlating en status",angle:"juridische categorieën versus biografische trajecten"},
{id:"water",place:"Romeinse provinciesteden",period:"1e–3e eeuw n.Chr.",topic:"waterinfrastructuur en stedelijke ongelijkheid",angle:"toegang, topografie en sociale interpretatie"},
{id:"lateantique",place:"Oostelijke Middellandse Zee",period:"4e–6e eeuw n.Chr.",topic:"religieuze verandering en stedelijke ruimte",angle:"lineaire christianiseringsmodellen versus lokale variatie"},
{id:"frontier",place:"Rijnlandse grenszone",period:"2e–3e eeuw n.Chr.",topic:"leger, handel en lokale productie",angle:"correlatie tussen militaire aanwezigheid en economische groei"},
{id:"sanctuary",place:"Grieks heiligdom",period:"4e–2e eeuw v.Chr.",topic:"heiligdomfinanciën en lokale economie",angle:"institutionele rekeningen als selectieve economische bron"}
];

const SOURCE_TYPES=["inscription","papyrus","literary","archaeology","coin","legal","funerary","account","letter","survey","prosopography"];
const FIRST_NAMES=["Aurelia","Tiberius","Demetrios","Kleopatra","Marcus","Apollonios","Julia","Herakleides","Lucius","Berenike","Gaius","Dionysios"];
const CITIES=["Athene","Efeze","Pergamon","Ostia","Korinthe","Smyrna","Alexandrië","Aphrodisias","Rome","Delos","Palmyra","Leptis Magna"];

function trainHash(s){let h=2166136261>>>0;for(let i=0;i<String(s).length;i++){h^=String(s).charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function trainRng(seed){let a=trainHash(seed);return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function rpick(r,a){return a[Math.floor(r()*a.length)]}
function rint(r,a,b){return Math.floor(r()*(b-a+1))+a}
function shuffleR(r,a){const x=[...a];for(let i=x.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[x[i],x[j]]=[x[j],x[i]]}return x}
function defaultTrainingState(){return{version:5,attempts:[],recent_signatures:[],curriculum_index:0,cycle:1,current:null,session:null}}
async function loadTrainingState(){const rec=await idbGet("settings","training_v4");state.training=rec?.value||defaultTrainingState();state.currentExercise=state.training.current||null}
async function saveTrainingState(){if(!state.training)state.training=defaultTrainingState();state.training.current=state.currentExercise;await idbPut("settings",{key:"training_v4",value:state.training})}

function syntheticSource(type,ctx,r,i,difficulty){
  const n=rpick(r,FIRST_NAMES),m=rpick(r,FIRST_NAMES),amount=rint(r,20,950),year=rint(r,1,29);
  const common={type,label:`Synthetische bron ${String.fromCharCode(65+i)} · ${type}`,synthetic:true};
  if(type==="inscription")return{...common,text:`Ere-inscriptie uit ${ctx.place}. De raad en het volk eren ${n}, die uit eigen middelen ${amount} denarii heeft bijgedragen aan een publiek project en “zich steeds als vriend van de demos heeft gedragen”. De tekst werd opgesteld door een vereniging waarvan ${n} zelf patronus was.`,bias:"Publieke zelfrepresentatie; formuleel taalgebruik; selectie van positieve daden."};
  if(type==="papyrus")return{...common,text:`Verzoekschrift uit ${ctx.period}. ${n} vraagt een lokale functionaris tussenbeide te komen in een conflict met ${m}. De schrijver benadrukt armoede en wetteloos gedrag van de tegenpartij, maar vermeldt niet dat beide families al jaren over hetzelfde perceel procederen.`,bias:"Strategisch juridisch taalgebruik; uitzonderlijke conflictsituatie; ongelijke documentatie."};
  if(type==="literary")return{...common,text:`Een fictieve redenaar beschrijft ${ctx.place} als een gemeenschap waarin “de besten” de stad behoeden voor de grillen van de menigte. Elders prijst hij dezelfde burgers wanneer zij hem publiek ondersteunen. Het werk is geschreven voor een elitepubliek en bevat duidelijke retorische overdrijving.`,bias:"Genre en publiek sturen de voorstelling; normatieve taal is geen directe institutionele beschrijving."};
  if(type==="archaeology")return{...common,text:`Opgravingssamenvatting: in sector ${rint(r,2,9)} werden ${rint(r,3,18)} ruimtes met brede toegangen gevonden. In ${rint(r,1,5)} ruimtes lagen weeggewichten; in andere alleen keramiek en opslagvaten. De datering bestrijkt ongeveer ${rint(r,60,160)} jaar.`,bias:"Functie niet rechtstreeks uit plattegrond afleidbaar; chronologische vermenging; ongelijke vondstcontext."};
  if(type==="coin")return{...common,text:`Een reeks van ${rint(r,14,80)} provinciale bronzen munten toont op de keerzijde een lokaal heiligdom. ${rint(r,55,90)}% komt uit één uitzonderlijk goed gedocumenteerde muntvondst; de overige exemplaren hebben geen zekere vindplaats.`,bias:"Productiekeuze en overlevering zijn selectief; circulatiepubliek onzeker."};
  if(type==="legal")return{...common,text:`Een fictief provinciaal edict bepaalt dat handelaars een standaardmaat moeten gebruiken en voorziet boetes voor overtredingen. Er zijn geen bewaarde procesdossiers die aantonen hoe vaak de regel werkelijk werd gehandhaafd.`,bias:"Normatieve regel ≠ feitelijke naleving; handhavingspraktijk ontbreekt."};
  if(type==="funerary")return{...common,text:`Grafinscriptie voor ${n}, “toegewijde echtgenoot, vrijgelatene en succesvol handelaar”. Alleen familieleden en twee beroepsgenoten worden genoemd. De steen is uitzonderlijk kostbaar in vergelijking met het lokale gemiddelde.`,bias:"Herinneringsconstructie; welvaartsselectie; niet representatief voor alle huishoudens."};
  if(type==="account")return{...common,text:`Rekeningfragment noteert leveringen van ${rint(r,40,300)} eenheden graan aan een instelling gedurende zes maanden. Twee maanden ontbreken; particuliere transacties vallen buiten het document.`,bias:"Institutioneel doel; ontbrekende maanden; dekt slechts één transactiekanaal."};
  if(type==="letter")return{...common,text:`Privébrief waarin ${n} klaagt dat prijzen “onhoudbaar” zijn en dat kooplieden profiteren van schaarste. De schrijver vraagt tegelijk familie om een lening en probeert zijn eigen slechte handelsbeslissing te verklaren.`,bias:"Persoonlijke belangen; emotionele overdrijving; beperkte marktinformatie."};
  if(type==="survey")return{...common,text:`Regionale survey registreert ${rint(r,25,110)} sites. Zichtbaarheid was hoog op geploegde velden en laag in olijfgaarden; fijn aardewerk werd systematisch verzameld, grof aardewerk slechts steekproefsgewijs.`,bias:"Detectie- en verzamelbias; site-aantallen zijn geen directe bevolkingsmaat."};
  return{...common,text:`Prosopografische dataset met ${rint(r,45,180)} personen uit ${ctx.place}, samengesteld uit inscripties. Personen zonder patroniem of functie zijn uitgesloten; elitefuncties zijn daardoor relatief vaak vertegenwoordigd.`,bias:"Selectie op identificeerbaarheid; elite-oververtegenwoordiging; afhankelijk van epigrafische gewoonte."};
}

function syntheticScholarPack(ctx,r){
  const stances=[
    ["continuïteit","benadrukt institutionele continuïteit en waarschuwt tegen vervalmodellen"],
    ["elite-dominantie","ziet economische en politieke veranderingen vooral als versterking van elitecontrole"],
    ["lokale variatie","stelt dat regionale verschillen elk algemeen model problematisch maken"],
    ["bronkritiek","betoogt dat het debat grotendeels door de aard van het bewaarde corpus wordt gevormd"],
    ["netwerken","verklaart verandering vanuit mobiliteit, connectiviteit en sociale netwerken"]
  ];
  return shuffleR(r,stances).slice(0,4).map((s,i)=>({label:`Fictieve onderzoeker ${String.fromCharCode(65+i)} (${2001+rint(r,0,22)})`,text:`Over ${ctx.topic}: ${s[1]}. De auteur gebruikt vooral ${rpick(r,["epigrafie","literatuur","archeologie","papyri","prosopografie"])} en behandelt ${rpick(r,["lokale variatie","chronologie","bronnenbias","sociale status","institutionele context"])} slechts beperkt.`,synthetic:true,stance:s[0]}));
}

function syntheticThesisSnippet(ctx,module,r,difficulty){
  const flaw=rpick(r,["overclaim","unoperationalized","laundry","method-mismatch","proxy","causal","representativity","theory-reality","conclusion-new"]);
  const topic=ctx.topic;
  let text="";
  if(flaw==="overclaim")text=`Deze scriptie onderzoekt ${topic} in ${ctx.place}. Omdat drie bewaarde inscripties dezelfde formulering gebruiken, kan worden vastgesteld dat de gehele stedelijke bevolking deze waarden deelde. Het materiaal bewijst daarmee dat de politieke cultuur gedurende ${ctx.period} fundamenteel homogeen was.`;
  if(flaw==="unoperationalized")text=`In dit onderzoek staat “Romanisering” centraal. Een stad wordt als sterker geromaniseerd beschouwd wanneer meer Romeinse elementen zichtbaar zijn. Inscripties, architectuur en namen worden hiervoor samengenomen, omdat zij allemaal de mate van Romanisering weerspiegelen.`;
  if(flaw==="laundry")text=`De literatuur over ${topic} is omvangrijk. Onderzoeker A bespreekt instituties, onderzoeker B economie, onderzoeker C identiteit en onderzoeker D lokale elites. Ook E, F en G zijn relevant. Toch is nog veel onderzoek nodig, waardoor deze scriptie een bijdrage wil leveren.`;
  if(flaw==="method-mismatch")text=`Om ${ctx.angle} te onderzoeken wordt discourse analysis gebruikt. De analyse bestaat uit het tellen van gebouwtypes per wijk. Deze methode is gekozen omdat discours een belangrijk begrip is in recente geschiedschrijving en daarom een vernieuwend perspectief biedt.`;
  if(flaw==="proxy")text=`Het aantal gedocumenteerde grafinscripties stijgt van 24 naar 61. Dit toont dat de bevolking in dezelfde periode met 154% toenam. Verschillen in epigrafische gewoonte, opgravingsintensiteit en bewaring worden buiten beschouwing gelaten omdat de aantallen objectief zijn.`;
  if(flaw==="causal")text=`Na de komst van een militair garnizoen neemt het aantal geïmporteerde amforen toe. Het garnizoen veroorzaakte daarom de economische groei van de regio. Andere verklaringen hoeven niet uitgebreid te worden onderzocht, omdat de chronologische volgorde duidelijk is.`;
  if(flaw==="representativity")text=`Pompeii is uitzonderlijk goed bewaard en daarom ideaal om de normale economische structuur van Romeinse steden te reconstrueren. De grote hoeveelheid gegevens compenseert eventuele lokale bijzonderheden, zodat conclusies zonder verdere vergelijking naar het rijk kunnen worden uitgebreid.`;
  if(flaw==="theory-reality")text=`Volgens het gekozen netwerkmodel bezit een actor met hoge centraliteit meer macht. Personen met de hoogste berekende centraliteit waren daarom de machtigste inwoners van ${ctx.place}. Het model maakt het mogelijk hun feitelijke sociale invloed rechtstreeks te meten.`;
  if(flaw==="conclusion-new")text=`De analyse toont verschillen tussen drie lokale dossiers. Daaruit volgt dat imperiale politiek waarschijnlijk de belangrijkste oorzaak was van alle waargenomen veranderingen. Hoewel dit mechanisme niet eerder systematisch werd getest, biedt de conclusie voldoende ruimte om deze bredere interpretatie naar voren te schuiven.`;
  if(difficulty>=4)text+=`\n\nEen tweede paragraaf nuanceert de eerste gedeeltelijk: de auteur erkent dat het corpus fragmentair is, maar verandert de sterkte van de uiteindelijke claim niet.`;
  return{label:`Synthetisch scriptiefragment · ${module.title}`,text,synthetic:true,hidden_flaw:flaw};
}

function makeQuantTable(ctx,r){
  const years=["Fase A","Fase B","Fase C","Fase D"];
  const base=rint(r,12,35);let rows=[];
  for(let i=0;i<4;i++){rows.push({fase:years[i],inscriptions:base+rint(r,-4,8)+i*rint(r,4,13),sites:rint(r,18,80),coverage:rint(r,35,95),imports:rint(r,10,75)})}
  const txt=["Fase | Inscripties | Sites geregistreerd | Surveydekking % | Importwaar-index",...rows.map(x=>`${x.fase} | ${x.inscriptions} | ${x.sites} | ${x.coverage} | ${x.imports}`)].join("\n");
  return{label:"Synthetische dataset",text:txt,synthetic:true,bias:"De variabelen hebben verschillende detectiekansen; dekking verandert per fase."};
}

function materialChoice(module,requested,r){
  if(requested!=="auto")return requested;
  if(["m06","m07","m09","m15","m16","m17","m18","m19"].includes(module.id))return rpick(r,["thesis","mixed"]);
  if(["m05","m10","m11","m12","m13","m14","m20"].includes(module.id))return rpick(r,["sources","mixed"]);
  return rpick(r,["sources","thesis","mixed"]);
}

function adaptiveDifficulty(moduleId){
  const gs=(state.training?.attempts||[]).filter(a=>a.module_id===moduleId&&a.grade?.score!=null).slice(-4);
  if(!gs.length)return 2;
  const avg=gs.reduce((n,a)=>n+a.grade.score,0)/gs.length;
  const max=Math.max(...gs.map(a=>a.difficulty||1));
  if(avg>=18)return Math.min(5,max+1);
  if(avg<13)return Math.max(1,max-1);
  return Math.min(5,Math.max(2,max));
}


function familyTwist(family,difficulty){
  const twists={
    "diagnose":"Schrijf je diagnose als een beoordelingsmemo: eerst oordeel, dan bewijs, dan revisieprioriteit.",
    "rangschik":"Rangschik minstens vijf problemen/keuzes van meest naar minst schadelijk en verdedig de volgorde.",
    "red-team":"Neem de positie van een sceptische beoordelaar in en probeer de kernredenering actief te falsifiëren.",
    "reconstructie":"Ontwerp na de kritiek een alternatief onderzoeksontwerp met dezelfde bronnen maar sterkere inferentielogica.",
    "vraagbouw":"Formuleer drie kandidaat-hoofdvragen, test ze tegen het corpus en kies er gemotiveerd één.",
    "afbakening":"Begin bij een bewust te brede vraag en toon stap voor stap welke afbakeningen noodzakelijk zijn.",
    "vergelijk-vragen":"Vergelijk drie soorten vraagstelling: beschrijvend, verklarend en vergelijkend; kies welke het corpus het best draagt.",
    "haalbaarheid":"Beoordeel de vraag alsof je slechts één masterjaar en een beperkte woordlimiet hebt; maak inhoudelijke keuzes, geen logistieke excuses.",
    "reverse-design":"Begin bij wat het corpus werkelijk kan aantonen en werk achterwaarts naar een passende onderzoeksvraag.",
    "operationaliseer":"Maak een tabel begrip → indicator → bron → mogelijke misclassificatie.",
    "categorie-kritiek":"Probeer eerst de gekozen categorie te ontmantelen voordat je haar opnieuw bruikbaar definieert.",
    "indicatoren":"Ontwerp meerdere indicatoren en rangschik ze naar bewijskracht en onafhankelijkheid.",
    "definitie-test":"Test je definitie op twee grensgevallen waarin classificatie onzeker is.",
    "anachronisme":"Zoek expliciet naar moderne aannames die in het historische begrip kunnen binnensluipen.",
    "corpusbouw":"Ontwerp kerncorpus, controlecorpus en contextcorpus als drie afzonderlijke lagen.",
    "uitsluiting":"Verdedig niet alleen wat je gebruikt, maar vooral waarom aantrekkelijke bronnen bewust buiten het kerncorpus blijven.",
    "sampling":"Behandel het materiaal als een steekproefprobleem: welke populatie denk je te benaderen en welke systematische gaten blijven?",
    "representativiteit":"Voer een worst-case-test uit: wat gebeurt met je these als je best bewaarde casus atypisch is?",
    "case-selection":"Kies casussen expliciet op analytische logica, niet omdat er toevallig veel materiaal van bestaat.",
    "bronmatrix":"Gebruik per bron vaste kolommen en maak je maximale inferentie expliciet.",
    "bias-diagnose":"Identificeer minstens drie verschillende soorten bias en leg uit of ze dezelfde kant op werken.",
    "bewijskracht":"Rangschik bronnen per kernclaim naar directe en indirecte bewijskracht.",
    "contextualiseer":"Reconstrueer eerst productie- en gebruikscontext vóór je inhoudelijke claims maakt.",
    "contradictie":"Gebruik een tegensprekende bron als centrale test: leg uit welke verklaring beide bronnen tegelijk kan dragen.",
    "synthese":"Schrijf eerst één debatstelling per cluster en plaats onderzoekers pas daarna binnen die clusters.",
    "debatkaart":"Maak een matrix met geschilpunt, positie, bewijsbasis en methodologisch verschil.",
    "lacune":"Formuleer drie soorten lacune — empirisch, methodologisch, inferentieel — en kies de meest overtuigende.",
    "groepeer":"Groepeer literatuur op verklaringsmodel of probleem, nooit op chronologische leesvolgorde.",
    "kritische-stand":"Benoem voor iedere historiografische positie zowel het sterkste punt als de kwetsbaarste aanname.",
    "positioneer":"Formuleer je bijdrage in één zin zonder woorden als ‘uniek’, ‘nooit’ of ‘eerste’.",
    "interventie":"Laat zien welke bestaande interpretatie door jouw ontwerp wordt getest, niet alleen welke literatuur je aanvult.",
    "model-kritiek":"Kies één dominant historiografisch model en ontwerp een faire, toetsbare kritiek in plaats van een stroman.",
    "continuiteit":"Test expliciet of verandering ook als continuïteit, herconfiguratie of schaalverschuiving kan worden gelezen.",
    "revisionisme":"Benoem wat een revisionistische interpretatie zou moeten aantonen om méér te zijn dan omkering van het oude verhaal.",
    "methodekeuze":"Maak een beslismatrix vraag → datavereiste → methode → beperking.",
    "alternatieven":"Vergelijk je voorkeursmethode met twee reële alternatieven en geef aan wat je ermee verliest.",
    "fit-test":"Formuleer één concrete inferentie die de methode mogelijk maakt en één die zij onmogelijk maakt.",
    "procedure":"Beschrijf de methode als reproduceerbare beslisprocedure in stappen.",
    "validiteit":"Splits validiteit op in construct-, bron- en inferentiële validiteit.",
    "theorie-fit":"Test of de theoretische categorieën werkelijk door historische observaties kunnen worden ingevuld.",
    "modelgrens":"Formuleer expliciet waar het model ophoudt verklarend te zijn.",
    "concept-transfer":"Leg uit welke aanpassing nodig is om een modern concept verantwoord naar een antieke context over te brengen.",
    "kritiek":"Geef eerst de sterkste interpretatie van het model voordat je de beperkingen formuleert.",
    "herformuleer-model":"Zet het model om van een beschrijving van ‘de werkelijkheid’ naar een set toetsbare verwachtingen.",
    "triangulatieplan":"Maak per kernclaim een netwerk van minstens twee werkelijk onafhankelijke bewijspaden.",
    "conflict":"Begin bij een situatie waarin twee bronsoorten elkaar tegenspreken en ontwerp een beslisprocedure.",
    "bronhiërarchie":"Rangschik bronnen per vraag, niet met één algemene hiërarchie voor de hele scriptie.",
    "complementariteit":"Leg voor iedere bron uit welke blinde vlek van een andere bron zij kan verkleinen.",
    "controlebron":"Kies bewust één bronsoort uitsluitend als falsificatie- of controlebron.",
    "claim-ladder":"Schrijf voor één kernbevinding vier steeds sterkere claims en markeer waar bewijs ontbreekt.",
    "bewijssterkte":"Ken aan iedere claim een expliciet betrouwbaarheidsniveau toe en verdedig dat niveau.",
    "inferentiekaart":"Teken tekstueel de keten brongegeven → interpretatie → tussenclaim → hoofdclaim.",
    "claim-cap":"Bepaal voor elke bron de sterkste formulering die nog verantwoord is — en stop daar.",
    "bewijs-matrix":"Bouw een matrix claim × bron en markeer onafhankelijk, ondersteunend, tegenbewijs of irrelevant.",
    "rivalen":"Werk drie concurrerende verklaringen even serieus uit vóór je één prefereert.",
    "causal-map":"Maak oorzaak → mechanisme → tussenstap → observeerbaar gevolg expliciet.",
    "counterfactual":"Formuleer wat je in de bronnen zou verwachten als jouw voorkeursverklaring níét klopt.",
    "mechanisme":"Verbied jezelf woorden als ‘leidde tot’ totdat je het tussenliggende mechanisme hebt beschreven.",
    "test-verklaringen":"Ontwerp één cruciale observatie die twee rivaliserende verklaringen uit elkaar kan trekken.",
    "proxy-test":"Voor iedere proxy: wat meet zij direct, wat alleen indirect en welke derde factor kan dezelfde waarde veroorzaken?",
    "dataset":"Behandel ontbrekende data als analytisch probleem en niet als voetnoot.",
    "missingness":"Bedenk minstens twee mechanismen waardoor ontbrekende gegevens systematisch en niet toevallig zijn.",
    "bandbreedte":"Formuleer resultaten als scenario of bandbreedte in plaats van één schijnprecies getal.",
    "kwant-claim":"Schrijf drie claimniveaus voor dezelfde tabel en kies welk niveau de data werkelijk dragen.",
    "vergelijkingsdesign":"Definieer vóór analyse welke dimensies gelijk en welke juist verschillend moeten zijn.",
    "most-similar":"Ontwerp een most-similar vergelijking en benoem de variabele die je verschil moet verklaren.",
    "most-different":"Ontwerp een most-different vergelijking en benoem het gemeenschappelijke patroon dat verklaring vraagt.",
    "lokale-variatie":"Gebruik één afwijkende lokale casus als stress-test voor het algemene model.",
    "case-bias":"Onderzoek of de bekendste casus je begrippen, periodisering of verwachtingen onbewust heeft bepaald.",
    "argument-map":"Maak een hiërarchie hoofdclaim → tussenclaims → bewijsblokken.",
    "hoofdstukorder":"Geef twee mogelijke hoofdstukvolgordes en verdedig welke causale/analytische logica sterker is.",
    "schraptest":"Schrap denkbeeldig ieder hoofdstuk: als het hoofdargument niet verandert, herontwerp of verwijder het.",
    "keten":"Formuleer de noodzakelijke inferentie die hoofdstuk N aan hoofdstuk N+1 doorgeeft.",
    "outline-redteam":"Laat een sceptische lezer bij ieder hoofdstuk vragen: ‘waarom moet ik dit weten om de hoofdvraag te beantwoorden?’",
    "paragraafdiagnose":"Label iedere zin als claim, bewijs, analyse, beperking of overgang en zoek ontbrekende functies.",
    "topic-evidence":"Test of de eerste analytische zin en het gebruikte bewijs exact hetzelfde probleem behandelen.",
    "overgang":"Maak de overgang inhoudelijk: toon welke onbeantwoorde vraag uit de vorige paragraaf de volgende noodzakelijk maakt.",
    "reorder":"Herschik alleen functies en bewijseenheden; schrijf geen mooier proza voordat de logica klopt.",
    "micro-argument":"Beperk de paragraaf tot één bewijsbare tussenclaim en expliciteer de inferentie.",
    "claim-verben":"Maak een ladder van ‘suggereert’ tot ‘toont aan’ en plaats elke claim op het juiste niveau.",
    "precisie":"Vervang lege kwalificaties door concrete referenten, tijd, groep of bewijstype.",
    "hedging":"Gebruik onzekerheid doelgericht: niet zwakker schrijven, maar preciezer afbakenen wat onzeker is.",
    "stijl-diagnose":"Negeer elegantie eerst en markeer alleen formuleringen die de epistemische status van een claim vertekenen.",
    "compressie":"Schrap herhaling zonder analytische stappen te verliezen; behoud alleen zinnen met functie.",
    "conclusiematrix":"Werk systematisch deelvraag → bewijs → antwoord → zekerheid → grens af.",
    "limitation":"Maak iedere beperking causaal: welke concrete conclusie wordt hierdoor zwakker?",
    "synthese":"Voeg bevindingen samen tot één hoger argument zonder nieuwe data te introduceren.",
    "vraag-antwoord":"Zet onderzoeksvraag en conclusie letterlijk naast elkaar en controleer of ieder element wordt beantwoord.",
    "implicatie":"Scheid wat je onderzoek aantoont van bredere implicaties die slechts plausibel zijn.",
    "peer-review":"Schrijf een rapport met summary judgment, major issues, minor issues en score.",
    "major-revision":"Formuleer maximaal drie revisies die het cijfer substantieel kunnen veranderen.",
    "score-18":"Benoem expliciet wat nog ontbreekt tussen ‘sterk’ en ‘18+’.",
    "red-team":"Probeer het onderzoek te laten falen op de sterkste verborgen aanname.",
    "prioriteer":"Negeer cosmetische stijlproblemen totdat ontwerp, inferentie en bewijs op orde zijn.",
    "mini-proposal":"Bouw een volledig voorstel alsof je het mondeling aan een promotor moet verdedigen.",
    "source-to-thesis":"Begin uitsluitend bij het gegeven bronnenpakket en laat de these daaruit begrensd ontstaan.",
    "defense":"Voeg drie promotorbezwaren toe en beantwoord ze zonder je vraag achteraf te verleggen.",
    "research-design":"Lever een compact onderzoeksprotocol met beslisregels, niet alleen een narratieve beschrijving.",
    "full-transfer":"Gebruik geen terminologie of casus uit eerdere oefeningen tenzij het nieuwe dossier die zelfstandig rechtvaardigt."
  };
  let t=twists[family]||"Voeg een tweede analytische route toe en vergelijk de gevolgen voor je conclusie.";
  if(difficulty>=5)t+=" Werk onder examenconditie: wees expliciet over één zwakke plek in je eigen oplossing.";
  return t;
}

function buildTrainingExercise(moduleId,difficulty,mode,requestedMaterial,seed){
  const module=TRAINING_MODULES.find(m=>m.id===moduleId)||TRAINING_MODULES[0],r=trainRng(seed),ctx=rpick(r,TRAINING_CONTEXTS),family=rpick(r,module.families),materialType=materialChoice(module,requestedMaterial,r);
  let materials=[],sourcePack=[],scholars=[];
  if(materialType==="sources"||materialType==="mixed"){
    const count=Math.min(6,2+difficulty),types=shuffleR(r,SOURCE_TYPES).slice(0,count);
    sourcePack=types.map((t,i)=>syntheticSource(t,ctx,r,i,difficulty));materials.push(...sourcePack);
  }
  if(materialType==="thesis"||materialType==="mixed")materials.push(syntheticThesisSnippet(ctx,module,r,difficulty));
  if(["m06","m07"].includes(module.id)){scholars=syntheticScholarPack(ctx,r);materials.push(...scholars)}
  if(module.id==="m13")materials.push(makeQuantTable(ctx,r));
  const base=`Context: ${ctx.place}, ${ctx.period}. Thema: ${ctx.topic}. Analytische spanning: ${ctx.angle}.`;
  let prompt="";
  const taskMap={
    m01:`Voer een volledige diagnose uit. Benoem de drie ernstigste onderzoeksproblemen én twee potentiële sterktes. Rangschik de problemen op impact. Voor elk probleem: leg uit welk soort conclusie hierdoor onbetrouwbaar wordt en welke revisie het grootste effect zou hebben.`,
    m02:`Formuleer één hoofdvraag en 2–3 deelvragen die met dit materiaal daadwerkelijk beantwoordbaar zijn. Verantwoord expliciet tijd, ruimte, corpus en kernbegrippen. Formuleer daarna één aantrekkelijke maar onhaalbare vraag en leg uit waarom je die afwijst.`,
    m03:`Kies het centrale abstracte begrip dat hier het meeste risico op vaagheid geeft. Definieer het historisch, maak 3–5 observeerbare indicatoren, benoem minstens twee false positives en leg uit welke bronnen elke indicator werkelijk kunnen dragen.`,
    m04:`Ontwerp een verdedigbaar corpus. Kies welke materialen kernbron, controlebron of contextbron worden en welke je uitsluit. Bespreek representativiteit, overleveringsbias en selectie-effecten. Formuleer wat je corpus structureel níét kan laten zien.`,
    m05:`Maak per bron een bronnenkritische matrix: productiecontext, auteur/instantie, publiek, doel, genre, overlevering, waarschijnlijke bias, rechtstreeks observeerbare informatie en maximaal verdedigbare inferentie. Eindig met één claim die expliciet níét gemaakt mag worden.`,
    m06:`Bouw uit de fictieve onderzoeksposities een status quaestionis in analytische vorm. Groepeer op geschilpunt in plaats van auteur. Benoem consensus, echte breuklijnen, methodologische oorzaken van verschil en de precieze lacune waarin een nieuw onderzoek kan ingrijpen.`,
    m07:`Positioneer een nieuw onderzoek in het historiografische debat zonder te beweren dat “niemand dit ooit onderzocht”. Formuleer de bijdrage als betere vraag, broncombinatie, schaal, toetsing of inferentie. Geef ook aan welke bestaande positie door jouw ontwerp mogelijk overeind blijft.`,
    m08:`Kies één primaire methode en maximaal twee ondersteunende methoden. Leg per methode uit welk inferentieprobleem zij oplost, welke aannames zij maakt en welke informatie zij níét produceert. Vergelijk met minstens één plausibel alternatief dat je bewust niet kiest.`,
    m09:`Beoordeel of het impliciete of expliciete theoretische model historisch verantwoord wordt gebruikt. Scheid modelvariabelen van historische werkelijkheid. Herformuleer het model als toetsbaar analytisch instrument en benoem één situatie waarin het model misleidend zou zijn.`,
    m10:`Ontwerp een triangulatiestrategie. Laat zien welke bronnen elkaar werkelijk onafhankelijk controleren, welke alleen hetzelfde perspectief herhalen en hoe je met tegenstrijdige uitkomsten omgaat. Geef per kernclaim minstens twee verschillende bewijspaden.`,
    m11:`Maak een claim-ladder met vier niveaus: observatie → contextuele interpretatie → inferentie → bredere these. Plaats minimaal zes mogelijke uitspraken op het juiste niveau en geef aan welke extra stap bewijs nodig heeft om naar een hoger niveau te gaan.`,
    m12:`Formuleer minstens drie rivaliserende verklaringen voor het waargenomen patroon. Beschrijf voor elke verklaring het mechanisme, een voorspelling en welk type bewijs haar van de rivalen kan onderscheiden. Vermijd “chronologie = causaliteit”.`,
    m13:`Interpreteer de dataset zonder schijnprecisie. Benoem welke variabelen proxies zijn, hoe veranderende dekking resultaten beïnvloedt, welke vergelijkingen wel/niet geldig zijn en formuleer een conclusie met passende onzekerheidsmarge. Ontwerp één robuustheidscheck.`,
    m14:`Ontwerp een vergelijking met minstens twee casussen. Leg uit waarom ze vergelijkbaar genoeg zijn, welke relevante verschillen juist analytisch nuttig zijn en welke lokale factoren een algemene conclusie kunnen vertekenen. Kies bewust most-similar of most-different logic.`,
    m15:`Bouw een argumentarchitectuur van inleiding tot conclusie. Formuleer hoofdclaim, noodzakelijke tussenclaims en hoofdstukfuncties. Voer vervolgens de schraptest uit: welk hoofdstuk kan niet verdwijnen zonder het hoofdargument te breken? Herstructureer onderdelen die alleen “interessant” zijn.`,
    m16:`Analyseer het synthetische fragment op micro-argumentatie. Scheid claim, bewijs, uitleg van relevantie en overgang. Ontwerp daarna een betere paragraafstructuur in bulletvorm, maar schrijf de passage niet volledig opnieuw. Leg uit waarom jouw volgorde logisch sterker is.`,
    m17:`Kalibreer de taal aan de bewijskracht. Identificeer minstens vijf woorden of constructies die te sterk, te vaag of schijnprecies zijn. Geef voor elk een nauwkeuriger claimniveau en motiveer de verandering op epistemische gronden, niet op “mooier schrijven”.`,
    m18:`Ontwerp een conclusie die exact teruggrijpt naar de onderzoeksvraag. Maak een matrix: deelvraag → bevinding → bewijskracht → antwoord → beperking. Voeg vervolgens limitations toe die aangeven welk type conclusie daardoor zwakker wordt en hoe toekomstig onderzoek dit kan testen.`,
    m19:`Schrijf een strenge peer-review. Geef een voorlopig cijfer /20 en maximaal drie major issues die eerst moeten worden opgelost om 18+ mogelijk te maken. Onderscheid fatale ontwerpzwaktes van kleine stijlproblemen. Geef per major issue een concrete revisiestrategie en een toets waarmee je controleert of de revisie geslaagd is.`,
    m20:`Ontwerp een mini-masterproef vanaf nul op basis van dit dossier: titel, probleemstelling, hoofdvraag, deelvragen, corpus, bronnenkritiek, methode, historiografische interventie, hoofdstukstructuur, verwachte bewijslogica, rivaliserende verklaring, limitations en vorm van conclusie. Sluit af met een korte verdediging tegen drie denkbeeldige kritische vragen van een promotor.`
  };
  prompt=taskMap[module.id]||taskMap.m01;
  prompt+=`\n\nSPECIFIEKE TAAKVORM — ${family.replaceAll("-"," ").toUpperCase()}\n${familyTwist(family,difficulty)}`;
  if(difficulty>=4)prompt+=`\n\n18+-voorwaarde: expliciteer je inferentiestappen en geef minstens één serieus alternatief voor je eigen voorkeursinterpretatie.`;
  if(difficulty===5)prompt+=`\n\nExamenlaag: identificeer bovendien één verborgen aanname in je eigen ontwerp en formuleer hoe je antwoord verandert als die aanname onjuist blijkt.`;
  const signature=`${module.id}|${family}|${ctx.id}|${materialType}|${sourcePack.map(x=>x.type).sort().join(",")}|${difficulty}`;
  return{
    exercise_id:`tr_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,module_id:module.id,module_n:module.n,module_title:module.title,
    family,context:ctx,difficulty,mode,material_type:materialType,seed:String(seed),signature,
    title:`Module ${module.n} · ${module.title} — ${family.replaceAll("-"," ")}`,
    intro:base,prompt,materials,
    expected:{module_focus:module.desc,hidden_flaws:materials.filter(x=>x.hidden_flaw).map(x=>x.hidden_flaw),source_biases:materials.filter(x=>x.bias).map(x=>({label:x.label,bias:x.bias}))},
    created_at:Date.now()
  };
}

function uniqueExercise(moduleId,difficulty,mode,material){
  const recent=new Set((state.training?.recent_signatures||[]).slice(-500));
  let ex=null;
  for(let i=0;i<60;i++){
    const seed=`${Date.now()}_${Math.random()}_${i}_${moduleId}`;
    ex=buildTrainingExercise(moduleId,difficulty,mode,material,seed);
    if(!recent.has(ex.signature))break;
  }
  state.training.recent_signatures=[...(state.training.recent_signatures||[]),ex.signature].slice(-500);
  return ex;
}

function moduleAttempts(id,gradedOnly=true){return(state.training?.attempts||[]).filter(a=>a.module_id===id&&(!gradedOnly||a.grade?.score!=null))}
function moduleMastery(id){
  const a=moduleAttempts(id,true);if(!a.length)return{mastered:false,label:"ongetest",best:null,avg:null,count:0};
  const recent=a.slice(-3),avg=recent.reduce((n,x)=>n+x.grade.score,0)/recent.length,best=Math.max(...a.map(x=>x.grade.score)),families=new Set(a.map(x=>x.family)),has5=a.some(x=>x.difficulty>=5),last=a[a.length-1],critical=(last.grade?.critical_issues||[]).filter(Boolean).length;
  const mastered=a.length>=4&&recent.length>=3&&avg>=18&&families.size>=3&&has5&&critical===0;
  let label=mastered?"beheerst":best>=18?"18+ gehaald":best>=16?"sterk":best>=14?"voldoende":"in opbouw";
  return{mastered,label,best,avg,count:a.length,families:families.size,has5,critical};
}

function trainingBenchmarks(module){
  const ls=collectLessons(),keys=module.keywords||[],seen=new Set(),out=[];
  const scored=ls.map(x=>{const txt=JSON.stringify(x).toLowerCase();let s=keys.reduce((n,k)=>n+(txt.includes(k.toLowerCase())?2:0),0);if(x.work?.weight==="normatief")s+=2;return{x,s}}).filter(z=>z.s>0).sort((a,b)=>b.s-a.s);
  for(const z of scored){
    const x=z.x,ev=x.evidence||x.references||[],item={principle:x.transferable_principle||x.lesson||x.technique||x.description||x.pattern||"",why:x.why_effective||"",limit:x.limits||x.when_not_to_use||x.risk||"",source:x.work?.author||"",work:x.work?.title||x.work?.filename||"",evidence:ev.slice(0,1)};
    const k=[item.principle,item.source,item.work].join('|').toLowerCase();if(!item.principle||seen.has(k))continue;seen.add(k);out.push(item);if(out.length>=5)break
  }
  return out
}

function gradingRubric(module,difficulty){
  return{
    standard:"Strenge masterstandaard met expliciet doel 18+/20. 18–20 is uitzonderlijk en vereist zelfstandige, precieze, bronkritische en methodologisch verdedigbare redenering zonder belangrijke verborgen aannames.",
    dimensions:[
      ["Taakuitvoering",15,"Volledig antwoord op wat gevraagd is; prioriteiten juist."],
      ["Bron- en corpuskritiek",20,"Bewijskracht, bias, representativiteit en grenzen expliciet."],
      ["Methodologische/inferentiële precisie",20,"Redeneringsstappen controleerbaar; methode past bij vraag."],
      ["Argumentatie",20,"Cumulatieve logica, rivalen, geen sprongen of circulariteit."],
      ["Conceptuele/historiografische scherpte",15,"Begrippen afgebakend en debat analytisch gebruikt."],
      ["Epistemische precisie & stijl",10,"Claimsterkte past bij bewijs; helder, compact en precies."]
    ],
    caps:[
      "Kernclaim rechtstreeks uit een bron halen zonder bronkritiek: maximaal 14/20.",
      "Proxy behandelen als directe historische werkelijkheid: maximaal 14/20.",
      "Chronologische correlatie als voldoende causaliteitsbewijs: maximaal 14/20.",
      "Onderzoeksvraag niet beantwoordbaar met gekozen corpus: maximaal 13/20.",
      "Essentiële taakonderdelen ontbreken: maximaal 12/20.",
      "18+ alleen wanneer minstens één serieuze alternatieve interpretatie of verborgen aanname expliciet is behandeld op moeilijkheid 4–5."
    ],
    difficulty
  };
}

function exerciseText(ex){
  const mats=(ex.materials||[]).map((m,i)=>`\n--- ${m.label} ---\n${m.text}`).join("\n");
  return `${ex.title}\nVariatie-ID: ${ex.signature}\nMoeilijkheid: ${ex.difficulty}/5 · modus: ${ex.mode}\n${ex.intro}\n${mats}\n\nOPDRACHT\n${ex.prompt}`;
}

function trainingGradeSchema(attemptId="[attempt_id]"){return{training_schema:1,attempt_id:attemptId,score:17.2,verdict:"sterk maar nog geen 18+",pass_18plus:false,dimension_scores:{"Taakuitvoering":17,"Bron- en corpuskritiek":18,"Methodologische/inferentiële precisie":16.5,"Argumentatie":17.5,"Conceptuele/historiografische scherpte":17,"Epistemische precisie & stijl":18},strengths:["..."],weaknesses:["..."],critical_issues:["..."],feedback_steps:[{"priority":1,"issue":"...","why_it_matters":"...","revision_action":"...","self_test":"..."}],missed_alternatives:["..."],model_reasoning_outline:["Alleen redeneringsstappen/bullets, geen volledige voorbeeldtekst."],next_drill:"...",grader_note:"Wees kritisch, constructief en concreet."}}

function currentAttempt(){if(!state.currentExercise)return null;return(state.training?.attempts||[]).find(a=>a.attempt_id===state.currentExercise.exercise_id)||null}
async function saveCurrentAttempt(answer,ensure=true){
  if(!state.currentExercise)return null;
  let a=currentAttempt();
  if(!a&&ensure){a={attempt_id:state.currentExercise.exercise_id,module_id:state.currentExercise.module_id,module_n:state.currentExercise.module_n,module_title:state.currentExercise.module_title,family:state.currentExercise.family,difficulty:state.currentExercise.difficulty,mode:state.currentExercise.mode,signature:state.currentExercise.signature,exercise:state.currentExercise,answer:answer||"",created_at:Date.now()};state.training.attempts.push(a)}
  if(a){a.answer=answer||a.answer||"";a.updated_at=Date.now()}
  await saveTrainingState();return a
}

function sessionTarget(kind){return kind==="single"?1:kind==="short"?3:kind==="module"?5:null}
function sessionLabel(kind){return kind==="single"?"losse oefening":kind==="short"?"korte reeks":kind==="module"?"volledige module":"tot beheersing"}
function activeSession(){return state.training?.session||null}
function sessionCompleted(s=activeSession()){return (s?.graded_ids||[]).length}
function sessionDifficultyValue(moduleId){
  const s=activeSession(),setting=s?.difficulty||$("#trainingDifficulty")?.value||"adaptive";
  if(setting!=="adaptive")return +setting;
  if(s?.kind==="module"){
    const plan=[2,3,4,4,5],i=Math.min(plan.length-1,sessionCompleted(s));
    return plan[i];
  }
  if(s?.kind==="short"){
    const plan=[2,3,4],i=Math.min(plan.length-1,sessionCompleted(s));
    return plan[i];
  }
  return adaptiveDifficulty(moduleId)
}
function sessionFinished(s=activeSession()){
  if(!s)return true;
  if(s.kind==="mastery")return moduleMastery(s.module_id).mastered;
  return sessionCompleted(s)>=sessionTarget(s.kind)
}
async function startTrainingSession(kind=null,moduleId=null){
  if(!state.training)state.training=defaultTrainingState();
  const id=moduleId||$("#trainingModule")?.value||TRAINING_MODULES[0].id;
  const k=kind||$("#trainingSessionLength")?.value||"module";
  state.training.session={
    session_id:`sess_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
    module_id:id,kind:k,started_at:Date.now(),graded_ids:[],exercise_ids:[],families:[],
    difficulty:$("#trainingDifficulty")?.value||"adaptive",
    mode:$("#trainingMode")?.value||"blind",
    material:$("#trainingMaterial")?.value||"auto"
  };
  await saveTrainingState();
  await generateExerciseFor(id,true);
}
async function resumeTrainingSession(){
  const s=activeSession();
  if(!s)return toast("Er is geen actieve trainingssessie.","warn");
  if(state.currentExercise){showPage("training-focus");renderTrainingFocus();return}
  await generateExerciseFor(s.module_id,true)
}
async function leaveTrainingFocus(){
  if(state.currentExercise&&$("#trainingAnswer")?.value.trim())await saveCurrentAttempt($("#trainingAnswer").value,true);
  showPage("training");renderTraining()
}
async function nextSessionExercise(){
  const s=activeSession();if(!s)return showPage("training");
  if(sessionFinished(s)){toast(s.kind==="mastery"?"Module beheerst.":"Sessiereeks afgewerkt.","good");state.training.session=null;await saveTrainingState();showPage("training");renderTraining();return}
  await generateExerciseFor(s.module_id,true)
}
async function generateExerciseFor(moduleId=null,openFocus=false){
  if(!state.training)state.training=defaultTrainingState();
  if(state.currentExercise&&$("#trainingAnswer")?.value.trim())await saveCurrentAttempt($("#trainingAnswer").value,true);
  const s=activeSession(),id=moduleId||s?.module_id||$("#trainingModule")?.value||TRAINING_MODULES[0].id;
  const module=TRAINING_MODULES.find(m=>m.id===id)||TRAINING_MODULES[0];
  let d=s?sessionDifficultyValue(id):($("#trainingDifficulty")?.value||"adaptive");
  d=d==="adaptive"?adaptiveDifficulty(id):+d;
  const mode=s?.mode||$("#trainingMode")?.value||"blind",material=s?.material||$("#trainingMaterial")?.value||"auto";
  let ex=null;
  for(let tries=0;tries<50;tries++){
    ex=uniqueExercise(id,d,mode,material);
    if(!s||!(s.families||[]).includes(ex.family)||tries>20)break
  }
  state.currentExercise=ex;state.training.current=ex;
  if(s){
    s.exercise_ids=[...(s.exercise_ids||[]),ex.exercise_id];
    s.families=[...(s.families||[]),ex.family];
  }
  if($("#trainingModule"))$("#trainingModule").value=id;
  await saveTrainingState();
  if(openFocus||s)showPage("training-focus");
  renderTraining();renderTrainingFocus();return ex
}

async function startModule(id,kind="single"){if($("#trainingModule"))$("#trainingModule").value=id;await startTrainingSession(kind,id)}
async function resumeCurriculum(){
  if(!state.training)state.training=defaultTrainingState();
  const idx=Math.max(0,Math.min(TRAINING_MODULES.length-1,state.training.curriculum_index||0));
  const m=TRAINING_MODULES[idx];state.training.curriculum_index=(idx+1)%TRAINING_MODULES.length;
  if(state.training.curriculum_index===0)state.training.cycle=(state.training.cycle||1)+1;
  await saveTrainingState();if($("#trainingModule"))$("#trainingModule").value=m.id;await startTrainingSession("module",m.id)
}
async function restartCurriculum(){
  if(!confirm("Nieuwe curriculumronde starten vanaf module 1? Je eerdere scores en pogingen blijven bewaard."))return;
  state.training.curriculum_index=0;state.training.cycle=(state.training.cycle||1)+1;await saveTrainingState();if($("#trainingModule"))$("#trainingModule").value=TRAINING_MODULES[0].id;await startTrainingSession("module",TRAINING_MODULES[0].id)
}

function renderExercise(){
  const ex=state.currentExercise,body=$("#exerciseBody"),empty=$("#exerciseEmpty");if(!body||!empty)return;
  if(!ex){body.style.display="none";empty.style.display="block";return}
  empty.style.display="none";body.style.display="block";
  const materials=(ex.materials||[]).map(m=>`<div class="material ${m.synthetic?"synthetic":""}"><h5>${esc(m.label)}</h5>${m.synthetic?'<div class="tiny" style="margin-bottom:7px">DIDACTISCH GECONSTRUEERD — geen authentieke antieke bron en geen echte scriptie.</div>':""}<p>${esc(m.text)}</p></div>`).join("");
  body.innerHTML=`<div class="exercise-shell"><div class="exercise-head"><div><h4 class="exercise-title">${esc(ex.title)}</h4><div class="tiny">Variatie-ID ${esc(ex.signature)} · ${esc(ex.mode)} · ${esc(ex.material_type)}</div></div></div><div class="callout">${esc(ex.intro)}</div>${materials?`<div class="material-grid">${materials}</div>`:""}<div><h4>Opdracht</h4><div class="exercise-prompt">${esc(ex.prompt)}</div></div><div id="trainingHintBox"></div></div>`;
  const a=currentAttempt();if($("#trainingAnswer"))$("#trainingAnswer").value=a?.answer||"";
  if($("#variationBadge"))$("#variationBadge").textContent=`${ex.family.replaceAll("-"," ")} · nieuwe context`;
  if($("#focusDifficultyBadge"))$("#focusDifficultyBadge").textContent=`niveau ${ex.difficulty}/5${ex.difficulty>=4?" · 18+":" "}`;
}

function renderTrainingFeedback(){
  const el=$("#trainingFeedback");if(!el)return;const a=currentAttempt(),g=a?.grade;
  if(!g){el.innerHTML='<div class="empty">Nog geen beoordeling voor deze poging.</div>';return}
  const cls=g.score>=18?"good":g.score>=14?"warn":"bad";
  const dims=Object.entries(g.dimension_scores||{}).map(([k,v])=>`<div class="dimension"><strong>${esc(k)}</strong><span>${esc(v)}/20</span></div>`).join("");
  el.innerHTML=`<div class="feedback-card"><div class="spread"><div><div class="score-big ${cls}">${Number(g.score).toFixed(1)}/20</div><div class="tiny">${esc(g.verdict||"")}</div></div><span class="badge ${g.pass_18plus?"good":"warn"}">${g.pass_18plus?"18+ gehaald":"nog geen 18+"}</span></div>${dims?`<div class="dimension-grid" style="margin-top:12px">${dims}</div>`:""}${(g.strengths||[]).length?`<h5 style="margin-top:14px">Sterktes</h5><ul>${g.strengths.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`:""}${(g.critical_issues||[]).length?`<h5 style="margin-top:14px">Kritieke problemen</h5><ul>${g.critical_issues.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`:""}${(g.feedback_steps||[]).length?`<h5 style="margin-top:14px">Prioritaire revisies</h5>${g.feedback_steps.map(x=>`<div class="callout" style="margin-top:7px"><strong>${esc(x.priority||"")}. ${esc(x.issue||"")}</strong><div class="tiny" style="margin-top:5px">${esc(x.why_it_matters||"")}</div><div style="margin-top:7px">${esc(x.revision_action||"")}</div><div class="tiny" style="margin-top:5px"><strong>Zelftest:</strong> ${esc(x.self_test||"")}</div></div>`).join("")}`:""}${g.next_drill?`<div class="callout good" style="margin-top:12px"><strong>Volgende drill:</strong> ${esc(g.next_drill)}</div>`:""}</div>`
}

function renderTrainingFocus(){
  const ex=state.currentExercise,s=activeSession();
  if(!$("#focusModuleTitle"))return;
  $("#focusModuleTitle").textContent=ex?`Module ${ex.module_n} · ${ex.module_title}`:"Training";
  $("#focusSessionType").textContent=s?sessionLabel(s.kind):"losse oefening";
  const done=s?sessionCompleted(s):0,target=s?sessionTarget(s.kind):1;
  $("#focusSessionProgress").textContent=s?(s.kind==="mastery"?`${done} beoordeeld · tot mastery`:`${Math.min(done+1,target)} / ${target}`):"1 / 1";
  const pct=s?(s.kind==="mastery"?Math.min(95,moduleMastery(s.module_id).count/4*100):Math.min(100,done/Math.max(1,target)*100)):0;
  $("#focusProgressBar").style.width=`${pct}%`;
  renderExercise();renderTrainingFeedback();
  const a=currentAttempt(),graded=Boolean(a?.grade),finished=s?sessionFinished(s):false;
  if($("#sessionScoreBadge"))$("#sessionScoreBadge").textContent=graded?`${a.grade.score.toFixed(1)}/20`:"wacht op beoordeling";
  if($("#nextSessionExercise")){
    $("#nextSessionExercise").disabled=!graded&&!finished;
    $("#nextSessionExercise").textContent=finished?(s?.kind==="mastery"?"Module beheerst · terug naar overzicht":"Sessie afronden"):"Volgende oefening · nieuwe variant";
  }
  if($("#sessionNextTitle"))$("#sessionNextTitle").textContent=finished?"Sessie afgerond":"Sessieverloop";
  if($("#sessionNextText"))$("#sessionNextText").textContent=finished?"Je behaalde het eindpunt van deze sessie. Je scores blijven bewaard en je kunt de module later opnieuw trainen.":graded?"Deze poging is beoordeeld. De volgende oefening gebruikt een andere taakfamilie/context waar mogelijk.":"Eerst deze poging laten beoordelen; daarna wordt de volgende oefening vrijgegeven.";
}
function renderTraining(){
  if(!$("#trainingModuleMap")||!state.training)return;
  const graded=state.training.attempts.filter(a=>a.grade?.score!=null),mastered=TRAINING_MODULES.filter(m=>moduleMastery(m.id).mastered).length,avg=graded.length?graded.reduce((n,a)=>n+a.grade.score,0)/graded.length:null,n18=graded.filter(a=>a.grade.score>=18).length;
  $("#trainMastered").textContent=`${mastered}/20`;$("#trainAttempts").textContent=graded.length;$("#trainAvg").textContent=avg==null?"—":avg.toFixed(1);$("#train18").textContent=n18;$("#trainCycle").textContent=state.training.cycle||1;
  $("#curriculumStrip").innerHTML=TRAINING_MODULES.map((m,i)=>{const mm=moduleMastery(m.id),active=(state.training.curriculum_index||0)===i;return`<button class="curriculum-dot ${mm.mastered?"mastered":""} ${active?"active":""}" title="${esc(m.title)}" onclick="startModule('${m.id}','module')">${m.n}</button>`}).join("");
  $("#trainingModuleMap").innerHTML=TRAINING_MODULES.map(m=>{const mm=moduleMastery(m.id),current=state.currentExercise?.module_id===m.id;return`<div class="module-card ${mm.mastered?"mastered":""} ${current?"current":""}"><div class="spread"><h5>${m.n}. ${esc(m.title)}</h5><span class="badge ${mm.mastered?"good":mm.best>=18?"accent":""}">${esc(mm.label)}</span></div><p>${esc(m.desc)}</p><div class="module-meta"><span class="badge">${mm.count} pogingen</span>${mm.best!=null?`<span class="badge">best ${mm.best.toFixed(1)}</span>`:""}${mm.avg!=null?`<span class="badge">laatste3 ${mm.avg.toFixed(1)}</span>`:""}</div><div class="module-actions"><button class="btn small" onclick="startModule('${m.id}','single')">1 oefening</button><button class="btn small primary" onclick="startModule('${m.id}','module')">Volledige module</button></div></div>`}).join("");
  const hist=[...graded].reverse().slice(0,12);$("#trainingHistory").innerHTML=hist.length?hist.map(a=>`<div class="history-row"><strong>${Number(a.grade.score).toFixed(1)}</strong><div><div>${esc(a.module_title)}</div><div class="tiny">${esc(a.family)} · niveau ${a.difficulty} · ${new Date(a.created_at).toLocaleDateString("nl-BE")}</div></div><button class="btn small" onclick="reviewTrainingAttempt('${a.attempt_id}')">Open</button></div>`).join(""):'<div class="empty">Nog geen beoordeelde pogingen.</div>';
  const s=activeSession();if($("#resumeTrainingSession")){$("#resumeTrainingSession").disabled=!s;$("#resumeTrainingSession").textContent=s?`Hervat ${sessionLabel(s.kind)} · module ${TRAINING_MODULES.find(m=>m.id===s.module_id)?.n||""}`:"Geen actieve sessie"}
}

async function reviewTrainingAttempt(id){
  const a=state.training.attempts.find(x=>x.attempt_id===id);if(!a)return;
  state.currentExercise=a.exercise;state.training.current=a.exercise;await saveTrainingState();if($("#trainingModule"))$("#trainingModule").value=a.module_id;showPage("training-focus");renderTrainingFocus()
}

async function showTrainingHint(){
  const ex=state.currentExercise;if(!ex)return toast("Genereer eerst een oefening.","warn");
  if(ex.mode!=="guided")return toast("Hints zijn alleen beschikbaar in begeleide modus.","warn");
  const m=TRAINING_MODULES.find(x=>x.id===ex.module_id),b=trainingBenchmarks(m)[0];
  const box=$("#trainingHintBox");if(!box)return;
  box.innerHTML=`<div class="callout warn"><strong>Één hint:</strong> ${esc(b?.principle||m.desc)}${b?.source?`<div class="tiny" style="margin-top:5px">Herkomst leerprincipe: ${esc(b.source)}, ${esc(b.work)}. Gebruik het principe, niet de formulering.</div>`:""}</div>`
}

async function copyExerciseOnly(){if(!state.currentExercise)return toast("Genereer eerst een oefening.","warn");await copyText(exerciseText(state.currentExercise));toast("Oefening gekopieerd.","good")}
async function saveTrainingDraft(){if(!state.currentExercise)return toast("Genereer eerst een oefening.","warn");await saveCurrentAttempt($("#trainingAnswer").value,true);toast("Concept bewaard.","good");renderTraining()}
async function copyTrainingGradingPrompt(){
  const ex=state.currentExercise;if(!ex)return toast("Genereer eerst een oefening.","warn");
  const answer=$("#trainingAnswer").value.trim();if(answer.length<80)return toast("Werk je antwoord eerst voldoende uit.","warn");
  const attempt=await saveCurrentAttempt(answer,true),module=TRAINING_MODULES.find(m=>m.id===ex.module_id),bench=trainingBenchmarks(module),rubric=gradingRubric(module,ex.difficulty);
  const prompt=`Je beoordeelt een oefening uit Scriptorium v5. Gedraag je als een zeer kritische maar constructieve masterbeoordelaar Oude Geschiedenis. Het doel is niet de student geruststellen maar hem systematisch naar 18+/20 te trainen.

BELANGRIJKE NORM
- 18/20 of hoger is uitzonderlijk.
- Geef 18+ alleen als de redenering zelfstandig, precies, bronkritisch, methodologisch coherent en vrijwel zonder belangrijke onbeantwoorde bezwaren is.
- Een “goed” antwoord met duidelijke verbeterpunten hoort eerder rond 15–17.
- Straf inhoudelijke/inferentiële fouten zwaarder dan stijl.
- Wees concreet: citeer uit het ANTWOORD van de student waar nodig, maar geef geen kant-en-klare imitatiepassage.
- Feedback moet de student laten HERZIEN: probleem → waarom belangrijk → concrete actie → zelftest.
- Nieuwe oefenmaterialen hieronder zijn synthetisch en fictief; behandel ze uitsluitend als didactisch dossier.

OEFENING
${exerciseText(ex)}

ANTWOORD STUDENT
${answer}

VERBORGEN DIDACTISCHE ONTWERPINFO
${JSON.stringify(ex.expected,null,2)}

RELEVANTE PRINCIPES UIT HET GEANALYSEERDE SCRIPTORIUM-CORPUS
${JSON.stringify(bench,null,2)}

BEOORDELINGSRUBRIC
${JSON.stringify(rubric,null,2)}

HARD CAPS
${rubric.caps.map(x=>"- "+x).join("\n")}

GEEF UITSLUITEND ÉÉN GELDIG JSON-OBJECT TERUG volgens exact dit schema:
${JSON.stringify(trainingGradeSchema(attempt.attempt_id),null,2)}

Aanvullende regels:
1. dimension_scores moeten realistisch corresponderen met de totaalscore.
2. critical_issues bevat alleen fundamentele problemen; gebruik [] als er geen zijn.
3. model_reasoning_outline mag alleen de ideale DENKSTAPPEN tonen, geen volledig uitgeschreven modelantwoord.
4. next_drill moet een nieuwe transfertaak voorstellen, niet dezelfde inhoud laten herhalen.
5. pass_18plus is alleen true bij score >=18.0 én zonder critical_issues.
`;
  await copyText(prompt);toast("Strenge beoordelingsprompt gekopieerd. Plak hem in ChatGPT.","good")
}

async function importTrainingGrade(){
  const text=$("#trainingGradePaste").value.trim();if(!text)return toast("Plak eerst de JSON-beoordeling.","warn");
  let g;try{g=JSON.parse(text.replace(/^```json\s*/i,"").replace(/```\s*$/,""))}catch(e){return toast("Ongeldige JSON: "+e.message,"bad")}
  if(g.training_schema!==1||!g.attempt_id||typeof g.score!=="number")return toast("Onverwacht beoordelingsformaat.","bad");
  const a=state.training.attempts.find(x=>x.attempt_id===g.attempt_id);if(!a)return toast("Deze attempt_id bestaat niet in je lokale trainingsgeschiedenis.","bad");
  g.pass_18plus=Boolean(g.score>=18&&(g.critical_issues||[]).filter(Boolean).length===0);a.grade=g;a.graded_at=Date.now();
  const s=activeSession();if(s&&a.module_id===s.module_id&&!s.graded_ids.includes(a.attempt_id))s.graded_ids.push(a.attempt_id);
  $("#trainingGradePaste").value="";await saveTrainingState();renderTraining();renderTrainingFocus();
  toast(`Beoordeling opgeslagen: ${g.score.toFixed(1)}/20.`,g.score>=18?"good":g.score>=14?"warn":"bad")
}

async function clearTrainingHistory(){
  if(!confirm("Alle trainingspogingen en scores wissen? Je corpus en analyses blijven behouden."))return;
  state.training=defaultTrainingState();state.currentExercise=null;await saveTrainingState();renderTraining();renderTrainingFocus();toast("Trainingsgeschiedenis gewist.","warn")
}

function extractRug(name=''){const m=name.match(/RUG01[-_: ]?(\d{6,12})/i)||name.match(/rug01:(\d{6,12})/i);return m?m[1]:''}
function yearFromText(s=''){const m=s.match(/(?:19|20)\d{2}/g);return m?m[m.length-1]:''}
function titleFromFilename(name=''){return name.replace(/\.pdf$/i,'').replace(/RUG01[-_: ]?\d+/ig,'').replace(/[_]+/g,' ').replace(/\s{2,}/g,' ').trim()}
function suggestField(title=''){const t=title.toLowerCase();if(/roman|rome|romain|romein|greek|griek|hellen|ancient|oudheid|antiqu|latin|classical|klassiek/.test(t))return 'Oude Geschiedenis';if(/history|histor|geschiedenis|medieval|middle ages|modern/.test(t))return 'Geschiedenis';return ''}
function suggestWeight(work){const inst=(work.institution||'').toLowerCase(),field=(work.field||'').toLowerCase();if((/ghent|gent|ugent/.test(inst))&&(/oude geschiedenis|ancient history/.test(field)))return 'normatief';if(/oude geschiedenis|ancient history|classics|klassieke/.test(field))return 'vaknabij';if(/geschiedenis|history|humanities|geestes/.test(field))return 'aanvullend';return 'onbekend'}
function analysisStatus(w){const ranges=w.analysis_ranges||[];if(!ranges.length)return 'geen_analyse';if(w.page_count&&coverage(ranges)>=w.page_count)return 'compleet';return 'gedeeltelijk'}
function coverage(ranges=[]){if(!ranges.length)return 0;const sorted=ranges.map(r=>[+r.start,+r.end]).sort((a,b)=>a[0]-b[0]);let total=0,[s,e]=sorted[0];for(const [a,b] of sorted.slice(1)){if(a<=e+1)e=Math.max(e,b);else{total+=Math.max(0,e-s+1);s=a;e=b}}return total+Math.max(0,e-s+1)}
function mergedRanges(ranges=[]){const xs=ranges.filter(r=>r&&+r.start>0&&+r.end>=+r.start).map(r=>[+r.start,+r.end]).sort((a,b)=>a[0]-b[0]);if(!xs.length)return[];const out=[];let[s,e]=xs[0];for(const[a,b]of xs.slice(1)){if(a<=e+1)e=Math.max(e,b);else{out.push([s,e]);s=a;e=b}}out.push([s,e]);return out}
function pendingCoverage(w){return coverage((w.pending_ranges||[]).map(r=>({start:r.start,end:r.end})))}
function missingRanges(w,includePending=true){const total=+w.page_count||0;if(!total)return[];const used=[...(w.analysis_ranges||[])];if(includePending)used.push(...(w.pending_ranges||[]));const merged=mergedRanges(used),out=[];let cur=1;for(const[s,e]of merged){if(e<1||s>total)continue;const ss=Math.max(1,s),ee=Math.min(total,e);if(cur<ss)out.push({start:cur,end:ss-1});cur=Math.max(cur,ee+1)}if(cur<=total)out.push({start:cur,end:total});return out}
function depthFor(w){return w.weight==='normatief'?'diep_normatief':w.weight==='vaknabij'?'diep_vergelijkend':w.weight==='aanvullend'?'gericht_aanvullend':'classificatie_eerst'}
function corpusWorksForExport(){const mode=$('#corpusExportMode')?.value||'open';return state.works.filter(w=>w.page_count&&w.file_size&&(mode==='all'||analysisStatus(w)!=='compleet')).sort((a,b)=>weightRank(a)-weightRank(b)||(a.created_at||0)-(b.created_at||0))}
function buildCorpusVolumePlan(){const works=corpusWorksForExport(),cap=Math.max(100,Math.min(450,parseFloat($('#corpusVolumeMB')?.value||400))),capBytes=cap*1024*1024,volumes=[];let cur={works:[],bytes:0};for(const w of works){if(cur.works.length&&cur.bytes+(w.file_size||0)>capBytes){volumes.push(cur);cur={works:[],bytes:0}}cur.works.push(w);cur.bytes+=w.file_size||0}if(cur.works.length)volumes.push(cur);return{works,volumes,cap_mb:cap,total_bytes:works.reduce((n,w)=>n+(w.file_size||0),0),total_pages:works.reduce((n,w)=>n+(w.page_count||0),0)}}
function corpusInstruction(manifest){const list=manifest.works.map((w,i)=>`${i+1}. ${w.file}\n   work_id=${w.work_id}\n   auteur=${w.author||'onbekend'}\n   titel=${w.title||w.filename}\n   brongewicht=${w.weight||'onbekend'}\n   fysieke PDF-pagina's=1-${w.page_count}\n   reeds geanalyseerde bereiken=${JSON.stringify(w.analysis_ranges||[])}`).join('\n\n');return `SCRIPTORIUM v3 — VOLLEDIGE CORPUSANALYSE

HOOFDDOEL
Leer de gebruiker beter ZELF historisch onderzoek doen en academisch schrijven aan de hand van sterke en zwakkere voorbeelden. Neem geen voorbeeldzinnen, unieke formuleringen, metaforen, specifieke paragraafopbouw of andere tekstuele uitwerkingen over als sjabloon.

BELANGRIJK VOOR DE WORKFLOW
- Dit is een CORPUSPAKKET, geen paginabatch.
- De originele volledige PDF's zijn toegevoegd.
- Beheer de interne paginadeling zelf. Als een lang werk niet in één analysestap past, verwerk je het intern in deelbereiken, maar vraag de gebruiker NIET om nieuwe PDF-batches of nieuwe ZIP's te genereren.
- Als de volledige corpusanalyse meerdere chatbeurten vraagt, gebruik je dezelfde geüploade bestanden en ga je verder waar je gebleven was.
- Streef naar één cumulatief Scriptorium-resultaat volgens schema_version 3. Een tussentijdse checkpoint-JSON mag, maar is niet verplicht.

DIDACTISCHE METHODE
Voor ieder bruikbaar voorbeeld:
WAARNEMING → OVERDRAAGBAAR PRINCIPE → WAAROM HET WERKT → GRENZEN / WANNEER AANPASSEN → OEFENING → TOEPASSING OP EIGEN ONDERZOEK.

Analyseer vooral:
- formulering en afbakening van onderzoeksvragen;
- corpus- en bronselectie;
- status quaestionis en historiografische positionering;
- methodologische verantwoording;
- bronnenkritiek en omgaan met onzekerheid;
- bewijsvoering en redenering;
- hoofdstuk- en argumentlogica;
- verhouding tussen observatie, interpretatie en conclusie;
- academische stijl, overgangen en conclusies;
- terugkerende sterke technieken;
- anti-patronen, zwakke keuzes en manieren om die in eigen werk te voorkomen.

BRONHIËRARCHIE
Normatief > vaknabij > aanvullend. Externe voorbeelden mogen technieken aanreiken maar vervangen de lokale norm niet. Ook normatieve voorbeelden worden kritisch gelezen: een thesis is geen foutloze autoriteit.

HERLEIDBAARHEID
Elke inhoudelijke bevinding uit een voorbeeld bevat auteur + oorspronkelijke FYSIEKE PDF-pagina + betrouwbaarheid (hoog/middel/laag). Gebruik de echte pagina-index van de originele PDF: eerste fysieke PDF-pagina = 1.

CORPUS_ID
${manifest.corpus_id}

WERKEN IN DIT CORPUS
${list}

UITVOER
Lever JSON volgens schema_version 3. Eén result-object per work_id. Als een werk nog niet volledig is onderzocht, geef analyzed_ranges en complete_work=false. Bij een volledig afgewerkt werk omvat analyzed_ranges uiteindelijk het volledige relevante fysieke bereik.

SCHEMA
${JSON.stringify(corpusResultSchema(manifest.works[0]||null),null,2)}
`}
function workResultSchema(w=null){return{work_id:w?.work_id||w?.id||"[work_id]",analyzed_ranges:[{start:1,end:w?.page_count||45}],complete_work:false,metadata_confirmed:{author:w?.author||"",title:w?.title||"",institution:w?.institution||"",year:w?.year||"",document_type:w?.document_type||""},scope_limits:"Wat wel en niet verantwoord uit de geanalyseerde pagina's kan worden afgeleid.",research_design:{text:"...",evidence:[]},research_question:{text:"...",evidence:[]},central_thesis:{text:"...",evidence:[]},historiography:{text:"...",evidence:[]},methodology:{text:"...",evidence:[]},primary_sources:[],secondary_literature:[],source_criticism:[],argument_structure:[],writing_techniques:[],research_techniques:[],skill_lessons:[{skill:"...",observed_pattern:"Wat de auteur doet, in eigen woorden",transferable_principle:"Algemeen principe zonder bronformulering",why_effective:"Waarom dit werkt",limits:"Wanneer aanpassen",practice_exercise:"Oefening voor de gebruiker",apply_to_own_work:"Vraag of procedure waarmee de gebruiker dit zelfstandig toepast",evidence:[{author:w?.author||"Auteur",physical_page:1,description:"Concrete vindplaats",confidence:"hoog"}]}],lessons_for_user:[],anti_patterns:[],weaknesses:[],confidence_notes:"Onzekerheden expliciet; geen voorbeeldtekst als sjabloon."}}
function corpusResultSchema(w=null){return{schema_version:3,corpus_id:"[corpus_id]",results:[workResultSchema(w)]}}
function weightRank(w){return w.weight==='normatief'?0:w.weight==='onbekend'?1:w.weight==='vaknabij'?2:3}
function chunkMissing(w,size){const chunks=[];for(const r of missingRanges(w,true)){for(let s=r.start;s<=r.end;s+=size){const e=Math.min(r.end,s+size-1);chunks.push({work_id:w.id,start:s,end:e,pages:e-s+1,depth:depthFor(w),est_mb:(w.file_size&&w.page_count)?(w.file_size/w.page_count*(e-s+1)/1024/1024):0})}}return chunks}
function buildBatchPlan(){const size=Math.max(15,Math.min(LIMITS.maxChunk,parseInt($('#chunkSize')?.value||45))),maxFiles=Math.max(1,Math.min(10,parseInt($('#batchMaxFiles')?.value||6))),maxPages=Math.max(size,parseInt($('#batchTargetPages')?.value||225)),maxMB=Math.max(20,parseFloat($('#batchMaxMB')?.value||90));const groups=new Map();for(const w of [...state.works].sort((a,b)=>weightRank(a)-weightRank(b)||(a.created_at||0)-(b.created_at||0))){if(!w.page_count||!w.file_size)continue;const cs=chunkMissing(w,size);if(cs.length)groups.set(w.id,{work:w,chunks:cs})}const ordered=[...groups.values()],picked=[];let pages=0,mb=0,round=0;while(picked.length<maxFiles&&pages<maxPages){let added=false;for(const g of ordered){const c=g.chunks[round];if(!c)continue;if(picked.length>=maxFiles)break;if(picked.length&&pages+c.pages>maxPages)continue;if(picked.length&&mb+c.est_mb>maxMB)continue;picked.push({...c,work:g.work});pages+=c.pages;mb+=c.est_mb;added=true}if(!added)break;round++}return{items:picked,pages,est_mb:mb,chunk_size:size,max_files:maxFiles,max_pages:maxPages,max_mb:maxMB}}
function statusBadge(w){const s=analysisStatus(w);return s==='compleet'?'<span class="badge good">Analyse compleet</span>':s==='gedeeltelijk'?'<span class="badge warn">Gedeeltelijk</span>':'<span class="badge">Geen analyse</span>'}
function weightHTML(w){const v=w.weight||'onbekend';return `<span class="source-weight ${esc(v)}">${esc(v)}</span>`}

async function loadWorks(){
  state.works=(await idbGetAll('works')).sort((a,b)=>(b.updated_at||0)-(a.updated_at||0));
  renderStats();
  renderRecent();
  if(document.querySelector('#page-corpus')?.classList.contains('active'))renderCorpus();
  if(document.querySelector('#page-progress')?.classList.contains('active'))renderProgress();
  if(document.querySelector('#page-exchange')?.classList.contains('active'))renderCorpusExport();
  if(document.querySelector('#page-atelier')?.classList.contains('active'))renderLessons();
  if(document.querySelector('#page-training')?.classList.contains('active'))renderTraining();
  renderStorage();
}
function renderAll(){renderStats();renderRecent();renderCorpus();renderSelects();renderProgress();renderCorpusExport();renderLessons();renderTraining();renderStorage()}
function renderStats(){const ws=state.works;$('#statWorks').textContent=ws.length;$('#statNorm').textContent=ws.filter(w=>w.weight==='normatief').length;$('#statNear').textContent=ws.filter(w=>w.weight==='vaknabij').length;$('#statExtra').textContent=ws.filter(w=>w.weight==='aanvullend').length;$('#statDone').textContent=ws.filter(w=>analysisStatus(w)==='compleet').length;let msg=ws.length===0?'Begin met het corpus. Voeg je geselecteerde proeven in uploadrondes toe.':ws.some(w=>analysisStatus(w)!=='compleet')?'Maak één corpuspakket met de volledige nog niet afgewerkte PDF’s. ChatGPT beheert de interne paginadeling; jij hoeft geen reeks 45-pagina-ZIP’s meer te maken.':'Je corpusanalyse is compleet. Gebruik het Leeratelier om terugkerende onderzoeks- en schrijfprincipes actief te oefenen op je eigen werk.';$('#nextStep').innerHTML='<strong>'+esc(msg)+'</strong>'}
function renderRecent(){const el=$('#recentWorks'),ws=state.works.slice(0,5);el.innerHTML=ws.length?ws.map(workCard).join(''):'<div class="empty">Nog geen werken toegevoegd.</div>'}
function workCard(w){return `<div class="work"><div><h5>${esc(w.title||w.filename)}</h5><p>${esc(w.author||'Auteur onbekend')} · ${esc(w.institution||'Instelling onbekend')} · ${w.page_count||'?'} p. · ${weightHTML(w)}</p></div><div class="actions">${statusBadge(w)}<button class="btn small" onclick="openDetail('${w.id}')">Open</button></div></div>`}
function filteredWorks(){const q=($('#corpusSearch')?.value||'').toLowerCase(),weight=$('#corpusWeight')?.value||'',stat=$('#corpusStatus')?.value||'';return state.works.filter(w=>(!q||[w.title,w.author,w.filename,w.rug01,w.institution].join(' ').toLowerCase().includes(q))&&(!weight||w.weight===weight)&&(!stat||analysisStatus(w)===stat))}
function renderCorpus(){if(!$('#corpusTable'))return;const ws=filteredWorks(),pages=Math.max(1,Math.ceil(ws.length/PAGE_SIZE));state.corpusPage=Math.min(state.corpusPage,pages);const start=(state.corpusPage-1)*PAGE_SIZE,part=ws.slice(start,start+PAGE_SIZE);$('#corpusTable').innerHTML=part.length?`<div class="table-wrap"><table class="table"><thead><tr><th>Werk</th><th>Auteur / instelling</th><th>Pagina's</th><th>Brongewicht</th><th>Analyse</th><th>Acties</th></tr></thead><tbody>${part.map(w=>`<tr><td class="title-cell"><strong>${esc(w.title||w.filename)}</strong><small>${esc(w.filename)}${w.rug01?` · RUG01-${esc(w.rug01)}`:''}</small></td><td>${esc(w.author||'Onbekend')}<br><span class="tiny">${esc(w.institution||'')}</span></td><td>${w.page_count||'?'}</td><td>${weightHTML(w)}</td><td>${statusBadge(w)}</td><td><div class="row"><button class="btn small" onclick="openDetail('${w.id}')">Open</button><button class="btn small" onclick="editWork('${w.id}')">Bewerk</button><button class="btn small" onclick="goCorpusExport()">Corpuspakket</button><button class="btn small danger" onclick="removeWork('${w.id}')">Verwijder</button></div></td></tr>`).join('')}</tbody></table></div>`:'<div class="empty">Geen werken gevonden.</div>';$('#corpusPageInfo').textContent=`${ws.length} werk(en) · pagina ${state.corpusPage}/${pages}`;$('#corpusPrev').disabled=state.corpusPage<=1;$('#corpusNext').disabled=state.corpusPage>=pages}
function renderSelects(){$('#benchmarkWorks').innerHTML=state.works.filter(w=>w.analysis).map(w=>`<option value="${w.id}">${esc(w.title||w.filename)} · ${esc(w.weight||'onbekend')}</option>`).join('')}
function renderProgress(){const el=$('#analysisProgressList');if(!el)return;const ws=state.works.filter(w=>w.page_count);el.innerHTML=ws.length?ws.map(w=>{const c=Math.min(w.page_count,coverage(w.analysis_ranges||[])),pct=Math.round(c/w.page_count*100);return `<div class="work"><div style="min-width:0"><h5>${esc(w.title||w.filename)}</h5><p>${c}/${w.page_count} fysieke PDF-pagina's geanalyseerd</p><div class="progress" style="margin-top:8px"><div style="width:${pct}%"></div></div></div><div class="actions"><span class="badge ${pct===100?'good':pct?'warn':''}">${pct}%</span><button class="btn small" onclick="goCorpusExport()">Corpusanalyse</button></div></div>`}).join(''):`<div class="empty">Voeg eerst PDF's toe.</div>`}
function renderBatchQueue(){return renderCorpusExport()}
function renderCorpusExport(){if(!$('#corpusExportPreview'))return;const plan=buildCorpusVolumePlan(),done=state.works.filter(w=>analysisStatus(w)==='compleet').length,open=state.works.filter(w=>w.page_count&&analysisStatus(w)!=='compleet').length,openPages=state.works.reduce((n,w)=>n+missingRanges(w,false).reduce((a,r)=>a+r.end-r.start+1,0),0);$('#corpusDoneWorks').textContent=done;$('#corpusOpenWorks').textContent=open;$('#corpusOpenPages').textContent=openPages;$('#corpusExportMB').textContent=`${MB(plan.total_bytes)} MB`;$('#corpusExportSummary').textContent=plan.works.length?`${plan.works.length} volledige PDF's · ${plan.total_pages} pagina's · ${plan.volumes.length} ZIP-volume${plan.volumes.length===1?'':'s'}`:'Geen werken geselecteerd.';$('#corpusExportPreview').innerHTML=plan.works.length?`<div class="table-wrap"><table class="table" style="min-width:760px"><thead><tr><th>Volume</th><th>Werken</th><th>Omvang</th><th>Opmerking</th></tr></thead><tbody>${plan.volumes.map((v,i)=>`<tr><td><strong>${i+1}/${plan.volumes.length}</strong></td><td>${v.works.length} volledige PDF${v.works.length===1?'':'’s'}<br><span class="tiny">${v.works.slice(0,3).map(w=>esc(w.author||w.title||w.filename)).join(' · ')}${v.works.length>3?' · …':''}</span></td><td>${MB(v.bytes)} MB</td><td>${v.works.some(w=>w.page_count>200)?'<span class="badge accent">lange werken blijven volledig</span>':'<span class="badge good">geen paginasplitsing</span>'}</td></tr>`).join('')}</tbody></table></div>`:`<div class="empty">Geen PDF's om te exporteren.</div>`}
function collectLessons(){let out=[];for(const w of state.works){if(!w.analysis)continue;const a=w.analysis;for(const key of ['skill_lessons','writing_techniques','research_techniques','lessons_for_user','anti_patterns']){for(const x of(a[key]||[])){const obj=typeof x==='string'?{transferable_principle:x}:x;out.push({...obj,work:w,kind:key})}}}return out}
function renderLessons(){const el=$('#lessons');if(!el)return;let ls=collectLessons();const rank=x=>weightRank(x.work);ls.sort((a,b)=>($('#lessonFilter')?.value==='normatief'?rank(a)-rank(b):0));el.innerHTML=ls.length?ls.slice(0,120).map(x=>{const title=x.skill||x.transferable_principle||x.technique||x.lesson||x.pattern||x.title||'Leerprincipe',body=x.transferable_principle||x.why_effective||x.lesson||x.description||x.risk||x.application||'',exercise=x.practice_exercise||x.exercise||'',limit=x.limits||x.when_not_to_use||x.boundary||'';return `<div class="lesson"><h5>${esc(title)}</h5><p>${esc(body)}</p>${limit?`<p class="tiny" style="margin-top:6px"><strong>Grens:</strong> ${esc(limit)}</p>`:''}${exercise?`<p class="tiny" style="margin-top:6px"><strong>Oefening:</strong> ${esc(exercise)}</p>`:''}<div class="tiny" style="margin-top:7px">Afgeleid uit: ${esc(x.work.author||'Auteur onbekend')}, ${esc(x.work.title||x.work.filename)} · ${weightHTML(x.work)} · geen voorbeeldformulering als sjabloon</div></div>`}).join(''):'<div class="empty">Na het importeren van analyses verschijnen hier overdraagbare onderzoeks- en schrijfprincipes met oefeningen.</div>'}
async function renderStorage(){if(!$('#storageInfo'))return;let bytes=0;try{if(navigator.storage?.estimate){const e=await navigator.storage.estimate();$('#storageInfo').textContent=`Geschat browsergebruik: ${MB(e.usage||0)} MB van ${MB(e.quota||0)} MB beschikbare quota.`;return}}catch{}$('#storageInfo').textContent='Opslagquota kon niet worden uitgelezen. PDF’s en analyses blijven in deze browser opgeslagen.'}

async function processFiles(fileList){const files=[...fileList];if(!files.length)return;if(files.length>LIMITS.count)return toast(`Te veel bestanden: ${files.length}. Kies maximaal ${LIMITS.count} PDF's per ronde.`,'bad');const total=files.reduce((a,f)=>a+f.size,0);if(total>LIMITS.totalMB*1024*1024)return toast(`Deze ronde is ${MB(total)} MB. Maximum is ${LIMITS.totalMB} MB.`,'bad');const tooBig=files.filter(f=>f.size>LIMITS.fileMB*1024*1024);if(tooBig.length)return toast(`${tooBig[0].name} is ${MB(tooBig[0].size)} MB. Maximum per PDF is ${LIMITS.fileMB} MB.`,'bad');$('#uploadStatus').style.display='block';for(let i=0;i<files.length;i++){const f=files[i];$('#uploadText').textContent=`Verwerk: ${f.name}`;$('#uploadCount').textContent=`${i+1}/${files.length}`;$('#uploadBar').style.width=`${Math.round(i/files.length*100)}%`;try{await addPDF(f)}catch(e){console.error(e);toast(`Kon ${f.name} niet toevoegen: ${e.message}`,'bad')}await sleep(40)}$('#uploadBar').style.width='100%';$('#uploadText').textContent='Klaar';await loadWorks();setTimeout(()=>$('#uploadStatus').style.display='none',1400)}

const lazyLibs=new Map();
function loadExternalOnce(src,globalName){
  if(globalName&&window[globalName])return Promise.resolve(window[globalName]);
  if(lazyLibs.has(src))return lazyLibs.get(src);
  const p=new Promise((resolve,reject)=>{
    const s=document.createElement('script');s.src=src;s.async=true;
    s.onload=()=>resolve(globalName?window[globalName]:true);
    s.onerror=()=>reject(new Error('Externe bibliotheek kon niet laden.'));
    document.head.appendChild(s);
  });
  lazyLibs.set(src,p);return p;
}
async function ensurePDFLib(){return loadExternalOnce('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js','PDFLib')}
async function ensureJSZip(){return loadExternalOnce('https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js','JSZip')}

async function addPDF(file){await ensurePDFLib();const dup=state.works.find(w=>w.filename===file.name&&w.file_size===file.size);if(dup){toast(`${file.name} staat al in het corpus.`,'warn');return}const bytes=await file.arrayBuffer();let doc;try{doc=await PDFLib.PDFDocument.load(bytes,{ignoreEncryption:false,updateMetadata:false})}catch(e){throw new Error('PDF is beschadigd, versleuteld of niet ondersteund.')}const title=(doc.getTitle()||'').trim(),author=(doc.getAuthor()||'').trim(),subject=(doc.getSubject()||'').trim(),keywords=(doc.getKeywords()||'').trim(),pages=doc.getPageCount(),rug01=extractRug(file.name+' '+title+' '+subject);const guessedTitle=title||titleFromFilename(file.name),year=yearFromText([subject,keywords,file.name].join(' '));const work={id:uid(),filename:file.name,file_size:file.size,file_last_modified:file.lastModified||0,title:guessedTitle,author,institution:/ugent|ghent|gent/i.test([subject,keywords,file.name].join(' '))?'Universiteit Gent':'',year,document_type:pages>180?'Doctoraat / lang werk':'Masterproef / proef',field:suggestField(guessedTitle),rug01,page_count:pages,weight:'onbekend',origin:'upload',source_url:rug01?`https://lib.ugent.be/catalog/rug01:${rug01}`:'',notes:'',analysis:null,analysis_ranges:[],created_at:Date.now(),updated_at:Date.now()};const sw=suggestWeight(work);if(sw!=='normatief')work.weight=sw;await idbPut('files',{id:work.id,blob:file,name:file.name,size:file.size,type:file.type||'application/pdf'});await idbPut('works',work);toast(`${file.name} toegevoegd (${pages} pagina's).`,'good')}

function editWork(id){const w=state.works.find(x=>x.id===id);if(!w)return;state.currentWork=w;$('#editForm').innerHTML=`<div class="form-grid"><div class="field full"><label>Titel</label><input id="eTitle" value="${esc(w.title)}"></div><div class="field"><label>Auteur</label><input id="eAuthor" value="${esc(w.author)}"></div><div class="field"><label>Instelling</label><input id="eInstitution" value="${esc(w.institution)}"></div><div class="field"><label>Jaar</label><input id="eYear" value="${esc(w.year)}"></div><div class="field"><label>Documenttype</label><input id="eType" value="${esc(w.document_type)}"></div><div class="field"><label>Vakgebied</label><input id="eField" value="${esc(w.field)}" placeholder="bv. Oude Geschiedenis"></div><div class="field"><label>RUG01-nummer</label><input id="eRug" value="${esc(w.rug01)}"></div><div class="field"><label>Brongewicht</label><select id="eWeight"><option value="onbekend">onbekend</option><option value="normatief">normatief</option><option value="vaknabij">vaknabij</option><option value="aanvullend">aanvullend</option></select></div><div class="field full"><label>Bron-URL</label><input id="eUrl" value="${esc(w.source_url)}"></div><div class="field full"><label>Notities</label><textarea id="eNotes">${esc(w.notes)}</textarea></div></div><div id="normWarn" class="callout warn" style="margin:10px 0;display:none"><strong>Normatief is streng.</strong> Bevestig alleen als dit daadwerkelijk een relevante UGent-proef Oude Geschiedenis of een toepasselijke UGent-rubric is.</div><div class="row"><button class="btn primary" id="saveEdit">Opslaan</button><button class="btn" onclick="closeModal('editModal')">Annuleren</button>${w.source_url?`<button class="btn" onclick="window.open('${esc(w.source_url)}','_blank')">Bron openen</button>`:''}</div>`;$('#eWeight').value=w.weight||'onbekend';const show=()=>$('#normWarn').style.display=$('#eWeight').value==='normatief'?'block':'none';$('#eWeight').onchange=show;show();$('#saveEdit').onclick=saveEdit;openModal('editModal')}
async function saveEdit(){const w=state.currentWork;if(!w)return;Object.assign(w,{title:$('#eTitle').value.trim(),author:$('#eAuthor').value.trim(),institution:$('#eInstitution').value.trim(),year:$('#eYear').value.trim(),document_type:$('#eType').value.trim(),field:$('#eField').value.trim(),rug01:$('#eRug').value.trim(),weight:$('#eWeight').value,source_url:$('#eUrl').value.trim(),notes:$('#eNotes').value.trim(),updated_at:Date.now()});await idbPut('works',w);closeModal('editModal');await loadWorks();toast('Metadata opgeslagen.','good')}
async function removeWork(id){const w=state.works.find(x=>x.id===id);if(!w||!confirm(`Verwijder “${w.title||w.filename}” en de lokale PDF?`))return;await Promise.all([idbDelete('works',id),idbDelete('files',id)]);await loadWorks();toast('Werk verwijderd.')}

function openDetail(id){const w=state.works.find(x=>x.id===id);if(!w)return;state.currentWork=w;$('#detailTitle').textContent=w.title||w.filename;const a=w.analysis||{};const meta=`<div class="analysis-grid"><div class="analysis-block"><h5>Auteur</h5>${esc(w.author||'Onbekend')}</div><div class="analysis-block"><h5>Instelling / jaar</h5>${esc(w.institution||'Onbekend')} · ${esc(w.year||'?')}</div><div class="analysis-block"><h5>Document</h5>${esc(w.document_type||'')} · ${w.page_count||'?'} fysieke PDF-pagina's</div><div class="analysis-block"><h5>Brongewicht</h5>${weightHTML(w)} · ${esc(w.field||'vakgebied onbekend')}</div>${w.rug01?`<div class="analysis-block"><h5>UGent catalogus</h5>RUG01-${esc(w.rug01)}${w.source_url?` · <a href="${esc(w.source_url)}" target="_blank" style="color:var(--accent)">open bron</a>`:''}</div>`:''}<div class="analysis-block"><h5>Analysevoortgang</h5>${coverage(w.analysis_ranges||[])}/${w.page_count||'?'} fysieke pagina's</div></div>`;const analysis=a&&Object.keys(a).length?renderAnalysis(a,w):'<div class="empty">Nog geen inhoudelijke analyse geïmporteerd.</div>';$('#detailBody').innerHTML=`<div class="tabs"><button class="active" data-tab="meta">Metadata</button><button data-tab="analysis">Analyse</button><button data-tab="notes">Notities</button></div><div id="tab-meta">${meta}<div class="row" style="margin-top:14px"><button class="btn" onclick="editWork('${w.id}')">Metadata bewerken</button><button class="btn primary" onclick="goCorpusExport()">Naar corpusanalyse</button></div></div><div id="tab-analysis" style="display:none">${analysis}</div><div id="tab-notes" style="display:none"><div class="callout">${w.notes?esc(w.notes):'Nog geen notities.'}</div></div>`;$$('#detailBody .tabs button').forEach(b=>b.onclick=()=>{$$('#detailBody .tabs button').forEach(x=>x.classList.remove('active'));b.classList.add('active');['meta','analysis','notes'].forEach(t=>$('#tab-'+t).style.display=t===b.dataset.tab?'block':'none')});openModal('detailModal')}
function renderAnalysis(a,w){const blocks=[];const simple=[['Onderzoeksopzet','research_design'],['Onderzoeksvraag','research_question'],['Centrale these','central_thesis'],['Historiografische positie','historiography'],['Methodologie','methodology'],['Bronnenkritiek','source_criticism'],['Argumentatiestructuur','argument_structure'],['Afbakening van deze analyse','scope_limits']];for(const[label,key]of simple){if(a[key]!=null)blocks.push(`<div class="analysis-block"><h5>${label}</h5>${renderValue(a[key])}</div>`)}for(const[label,key]of[['Primaire bronnen','primary_sources'],['Secundaire literatuur','secondary_literature'],['Schrijftechnieken','writing_techniques'],['Onderzoekstechnieken','research_techniques'],['Overdraagbare vaardigheidslessen','skill_lessons'],['Bruikbare lessen','lessons_for_user'],['Anti-patronen / risico’s','anti_patterns'],['Beperkingen / zwaktes','weaknesses']]){if(a[key]?.length)blocks.push(`<div class="analysis-block"><h5>${label}</h5>${a[key].map(renderValue).join('<div class="sep"></div>')}</div>`)}return `<div class="analysis-grid">${blocks.join('')}</div>`}
function renderValue(v){if(v==null)return'';if(typeof v==='string'||typeof v==='number')return esc(v);if(Array.isArray(v))return v.map(renderValue).join('<br>');const main=v.text||v.transferable_principle||v.observed_pattern||v.technique||v.source||v.lesson||v.description||v.pattern||v.title||v.name||v.claim||v.skill||'';let html=main?`<div>${esc(main)}</div>`:'';for(const k of['why_effective','application','apply_to_own_work','practice_exercise','limits','when_not_to_use','critical_note','risk','correction_strategy','type','role'])if(v[k])html+=`<div class="tiny" style="margin-top:5px"><strong>${esc(k.replaceAll('_',' '))}:</strong> ${esc(v[k])}</div>`;const ev=v.evidence||v.references||[];if(ev.length)html+=ev.map(e=>`<div class="evidence">${esc(e.description||e.note||e.text||'Vindplaats')} · ${esc(e.author||'')} p. ${esc(e.page||e.physical_page||'?')} · ${esc(e.confidence||v.confidence||'')}</div>`).join('');else if(v.page||v.physical_page)html+=`<div class="evidence">${esc(v.author||'')} p. ${esc(v.page||v.physical_page)} · ${esc(v.confidence||'')}</div>`;return html||`<span class="tiny">${esc(JSON.stringify(v))}</span>`}

function analysisResultSchema(work=null){return{work_id:work?.id||"[work_id]",analysis_depth:depthFor(work||{}),analysis_scope:{page_start:1,page_end:Math.min(work?.page_count||45,45),complete_work:false},metadata_confirmed:{author:work?.author||"",title:work?.title||"",institution:work?.institution||"",year:work?.year||"",document_type:work?.document_type||""},scope_limits:"Wat op basis van dit paginadeel wel en niet verantwoord kan worden geconcludeerd.",research_design:{text:"Hoe vraag, afbakening, corpus, methode en hoofdstuklogica op elkaar aansluiten.",evidence:[{author:work?.author||"Auteur",physical_page:1,description:"Vindplaats / parafrase",confidence:"hoog"}]},research_question:{text:"...",evidence:[]},central_thesis:{text:"...",evidence:[]},historiography:{text:"...",evidence:[]},methodology:{text:"...",evidence:[]},primary_sources:[],secondary_literature:[],source_criticism:[],argument_structure:[],writing_techniques:[{technique:"Waarneembare techniek",why_effective:"Waarom dit functioneert",when_not_to_use:"Wanneer dit niet zonder meer overdraagbaar is",evidence:[]}],research_techniques:[],skill_lessons:[{skill:"bv. probleemstelling afbakenen",observed_pattern:"Wat de auteur concreet doet, in eigen woorden",transferable_principle:"Algemene regel die losstaat van de formulering van de auteur",why_effective:"Waarom dit de kwaliteit van onderzoek of schrijven verhoogt",limits:"Context waarin dit principe moet worden aangepast",practice_exercise:"Korte oefening waarmee de gebruiker de vaardigheid zelf traint",apply_to_own_work:"Vraag of werkwijze om het principe zelfstandig op eigen materiaal toe te passen",evidence:[{author:work?.author||"Auteur",physical_page:1,description:"Concrete vindplaats",confidence:"hoog"}]}],lessons_for_user:[],anti_patterns:[{pattern:"Minder sterke keuze",risk:"Waarom dit een risico is",correction_strategy:"Hoe de gebruiker dit in eigen werk kan voorkomen",evidence:[]}],weaknesses:[],confidence_notes:"Vermeld onzekerheden expliciet. Geen voorbeeldzinnen als sjabloon bewaren."}}
function analysisSchema(work=null){return corpusResultSchema(work)}
function makePrompt(w,scope=null){const start=scope?.start||1,end=scope?.end||w.page_count||'?';return makeBatchInstruction({batch_id:'voorbeeld',items:[{work_id:w.id,start,end,depth:depthFor(w),work:w,file:'[pdf]'}]})}
async function selectPackageWork(id){goCorpusExport()}
function goBatch(){closeModal('detailModal');showPage('exchange');renderBatchQueue();window.scrollTo({top:0,behavior:'smooth'})}
function makeBatchInstruction(manifest){const items=manifest.items.map((x,i)=>`${i+1}. ${x.file}\n   work_id=${x.work_id}\n   auteur=${x.work.author||'onbekend'}\n   titel=${x.work.title||x.work.filename}\n   brongewicht=${x.work.weight||'onbekend'}\n   analysediepte=${x.depth}\n   oorspronkelijke fysieke PDF-pagina's=${x.start}-${x.end}`).join('\n\n');return `SCRIPTORIUM v2 — BATCHANALYSE

HOOFDDOEL
Gebruik de meegestuurde masterproeven/doctoraten als VOORBEELDEN OM TE LEREN ONDERZOEKEN EN SCHRIJVEN. Neem geen formuleringen, zinsbouw, unieke metaforen, paragraafstructuren of andere tekstuele uitwerkingen over als sjabloon. De gebruiker moet na de analyse beter ZELF kunnen onderzoeken en schrijven.

WERKWIJZE
- Analyseer uitsluitend wat in de meegestuurde bestanden zichtbaar is. Vul hiaten niet stilzwijgend aan met externe kennis.
- Een voorbeeld is geen autoriteit enkel omdat het in een thesis staat: beoordeel de keuze kritisch.
- Normatieve UGent-voorbeelden wegen zwaarder dan vaknabije of aanvullende werken, maar ook normatieve voorbeelden mogen niet kritiekloos worden geïmiteerd.
- Abstraheer elk nuttig voorbeeld: WAARNEMING → OVERDRAAGBAAR PRINCIPE → WAAROM HET WERKT → GRENZEN / WANNEER AANPASSEN → OEFENING → TOEPASSING OP EIGEN ONDERZOEK.
- Geef geen kant-en-klare herschreven passage die de voorbeeldtekst nabootst. Geef liever diagnostische vragen, stappenplannen en kleine oefeningen.
- Focus minder op inhoudssamenvatting en meer op onderzoeksvaardigheid: vraagstelling, afbakening, corpuskeuze, methodologische verantwoording, bronnenkritiek, status quaestionis, hoofdstuklogica, argumentopbouw, omgang met onzekerheid, bewijsvoering, overgangen, conclusies en academische stijl.
- Bij een aanvullend werk: analyseer alleen technieken die werkelijk iets nieuws toevoegen.
- Bij analysediepte "classificatie_eerst": bepaal eerst hoe relevant het werk als voorbeeld is; trek nog geen normatieve conclusies.

VERPLICHTE HERLEIDBAARHEID
Bij iedere inhoudelijke bevinding die uit een voorbeeldwerk komt: auteur + OORSPRONKELIJKE FYSIEKE PDF-PAGINA + betrouwbaarheid (hoog/middel/laag). Elk PDF-deel heeft onderaan de markering "ORIGINELE PDF-PAGINA n". Gebruik dat nummer.

BATCH
batch_id=${manifest.batch_id}

${items}

UITVOER
Lever uiteindelijk precies één JSON-object volgens schema_version 2. De sleutel "results" bevat één analyseobject per PDF-onderdeel. Gebruik exact de work_id en page_start/page_end uit het manifest. Als meerdere onderdelen bij hetzelfde werk horen, blijven het afzonderlijke results; Scriptorium voegt ze samen. Zet complete_work alleen op true wanneer het volledige oorspronkelijke werk daadwerkelijk gedekt is.

Belangrijk voor skill_lessons:
- observed_pattern beschrijft wat de auteur doet, in eigen woorden;
- transferable_principle is algemeen en bevat geen unieke formulering uit de bron;
- practice_exercise dwingt de gebruiker de vaardigheid zelf uit te voeren;
- apply_to_own_work is een vraag of werkwijze, geen voorgeschreven tekst;
- evidence bevat auteur, physical_page en confidence.

JSON-SCHEMA
${JSON.stringify({schema_version:2,batch_id:manifest.batch_id,results:[analysisResultSchema(manifest.items[0]?.work||null)]},null,2)}
`}
function makePreviewManifest(){const plan=buildBatchPlan(),batch_id=`batch_${new Date().toISOString().replace(/[-:TZ.]/g,'').slice(0,14)}`;return{scriptorium_version:'hybride-2.0',schema_version:2,batch_id,created_at:new Date().toISOString(),items:plan.items.map((x,i)=>({...x,file:`pdf/${String(i+1).padStart(2,'0')}_${slug(x.work.author||'auteur')}_${slug(x.work.title||x.work.filename)}_p${x.start}-${x.end}.pdf`,work:{id:x.work.id,title:x.work.title,author:x.work.author,institution:x.work.institution,year:x.work.year,document_type:x.work.document_type,field:x.work.field,weight:x.work.weight,page_count:x.work.page_count,filename:x.work.filename}})),selection:{chunk_size:plan.chunk_size,max_files:plan.max_files,max_pages:plan.max_pages,max_mb:plan.max_mb,selected_pages:plan.pages,estimated_mb:+plan.est_mb.toFixed(2)}}}
async function copyBatchPrompt(){return copyCorpusPrompt()}
async function makeNextBatch(){return makeCorpusPackages()}
async function clearPending(){const n=state.works.reduce((a,w)=>a+(w.pending_ranges||[]).length,0);if(!n)return toast('Er zijn geen oude v2-batchmarkeringen.');if(!confirm(`Oude v2-markeringen bij ${n} paginabereik(en) wissen? Dit verwijdert geen analyses en geen PDF’s.`))return;for(const w of state.works){if((w.pending_ranges||[]).length){w.pending_ranges=[];w.updated_at=Date.now();await idbPut('works',w)}}await loadWorks();toast('Oude v2-batchmarkeringen opgeruimd.','good')}
function goCorpusExport(){closeModal('detailModal');showPage('exchange');renderCorpusExport();window.scrollTo({top:0,behavior:'smooth'})}
function makeCorpusManifest(plan){const corpus_id=`corpus_${new Date().toISOString().replace(/[-:TZ.]/g,'').slice(0,14)}`;return{scriptorium_version:'hybride-3.0',schema_version:3,corpus_id,created_at:new Date().toISOString(),works:plan.works.map(w=>({work_id:w.id,file:`pdf/${slug(w.author||'auteur')}__${slug(w.title||w.filename)}.pdf`,filename:w.filename,title:w.title,author:w.author,institution:w.institution,year:w.year,document_type:w.document_type,field:w.field,weight:w.weight,page_count:w.page_count,file_size:w.file_size,analysis_ranges:w.analysis_ranges||[],analysis_complete:analysisStatus(w)==='compleet'})),export:{volume_cap_mb:plan.cap_mb,volume_count:plan.volumes.length,total_bytes:plan.total_bytes,total_pages:plan.total_pages}}}
async function copyCorpusPrompt(){const plan=buildCorpusVolumePlan();if(!plan.works.length)return toast('Geen werken om te exporteren.','warn');const manifest=makeCorpusManifest(plan);const short=`Analyseer mijn volledige Scriptorium-corpus uit de meegestuurde ZIP-volume(s). Beheer lange PDF's intern in paginabereiken en vraag mij niet om nieuwe batches of nieuwe ZIP's te maken. Werk desnoods over meerdere chatbeurten verder op dezelfde uploads. Het hoofddoel is dat ik leer onderzoeken en academisch schrijven aan de hand van voorbeelden, niet dat ik teksten of formuleringen overneem. Gebruik de instructies en het manifest in het corpuspakket en lever uiteindelijk één cumulatieve schema_version 3 JSON voor import in Scriptorium.`;await copyText(short);toast('Startopdracht gekopieerd.','good')}
async function makeCorpusPackages(){try{await ensureJSZip()}catch(e){return toast(e.message,'bad')}const plan=buildCorpusVolumePlan();if(!plan.works.length)return toast('Geen PDF’s om te exporteren.','warn');const manifest=makeCorpusManifest(plan);$('#makeCorpusPackage').disabled=true;$('#corpusPackageProgress').style.display='block';$('#corpusPackageBar').style.width='0%';try{const totalVol=plan.volumes.length;for(let vi=0;vi<totalVol;vi++){const volume=plan.volumes[vi],zip=new JSZip(),volumeWorks=[];for(let wi=0;wi<volume.works.length;wi++){const w=volume.works[wi],rec=await getFileRec(w.id);if(!rec?.blob)throw new Error(`PDF ontbreekt lokaal: ${w.title||w.filename}`);const mw=manifest.works.find(x=>x.work_id===w.id);zip.file(mw.file,rec.blob,{binary:true,compression:'STORE'});volumeWorks.push(mw);const overall=(vi+((wi+1)/Math.max(1,volume.works.length)))/totalVol;$('#corpusPackageBar').style.width=`${Math.round(overall*86)}%`;$('#corpusPackageText').textContent=`Volume ${vi+1}/${totalVol}: ${wi+1}/${volume.works.length} volledige PDF’s toevoegen…`;await sleep(15)}const vm={...manifest,volume:{index:vi+1,count:totalVol},works:volumeWorks};zip.file('corpus_manifest.json',JSON.stringify(vm,null,2));zip.file('ANALYSE_INSTRUCTIES.txt',corpusInstruction(manifest));zip.file('RESULTAAT_SCHEMA.json',JSON.stringify(corpusResultSchema(volumeWorks[0]||null),null,2));zip.file('START_HIER.txt',`SCRIPTORIUM v3

Upload ALLE volumes van dit corpus samen in één ChatGPT-bericht.
Gebruik daarna bijvoorbeeld:
"Analyseer mijn volledige Scriptorium-corpus. Beheer de interne paginadeling zelf en vraag mij niet om nieuwe batches."

Belangrijk:
- De PDF’s zijn volledig en origineel; er zijn geen 45-pagina-deelbestanden meer.
- ChatGPT mag lange werken intern in stappen analyseren.
- Dezelfde uploads blijven de basis voor vervolgbeurten.
- Het einddoel is één cumulatieve schema_version 3 JSON.
- Leren onderzoeken en schrijven staat centraal; voorbeeldtekst niet nabootsen.
`);$('#corpusPackageText').textContent=`Volume ${vi+1}/${totalVol} comprimeren…`;const blob=await zip.generateAsync({type:'blob',compression:'STORE'},meta=>{const base=(vi/totalVol)*100,span=100/totalVol;$('#corpusPackageBar').style.width=`${Math.min(99,Math.round(base+span*(meta.percent/100)))}%`});downloadBlob(blob,`Scriptorium_${manifest.corpus_id}_v${String(vi+1).padStart(2,'0')}of${String(totalVol).padStart(2,'0')}.zip`);await sleep(650)}await idbPut('settings',{key:'last_corpus_export',value:{corpus_id:manifest.corpus_id,created_at:manifest.created_at,work_ids:manifest.works.map(w=>w.work_id),volume_count:plan.volumes.length}});$('#corpusPackageBar').style.width='100%';$('#corpusPackageText').textContent=`Klaar: ${plan.works.length} volledige PDF’s in ${plan.volumes.length} volume${plan.volumes.length===1?'':'s'}. Upload alle volumes samen in één bericht.`;toast(`Corpuspakket klaar: ${plan.volumes.length} ZIP-volume${plan.volumes.length===1?'':'s'}, geen paginasplitsing.`,'good')}catch(e){console.error(e);toast('Corpuspakket maken mislukt: '+e.message,'bad')}finally{$(`#makeCorpusPackage`).disabled=false}}
async function getFileRec(id){const r=await idbGet('files',id);if(!r?.blob)throw new Error('Lokale PDF ontbreekt. Voeg het bestand opnieuw toe.');return r}
async function createStampedChunk(srcDoc,start0,end0){const out=await PDFLib.PDFDocument.create();const idx=[];for(let i=start0;i<end0;i++)idx.push(i);const copied=await out.copyPages(srcDoc,idx);copied.forEach((p,j)=>{out.addPage(p);const n=start0+j+1;try{p.drawText(`ORIGINELE PDF-PAGINA ${n}`,{x:8,y:7,size:6,color:PDFLib.rgb(.25,.25,.25),opacity:.55})}catch{}});return out.save()}
async function makePackage(){return makeCorpusPackages()}
async function copyPrompt(){return copyCorpusPrompt()}

function walkFindings(obj,path='',out=[]){if(obj==null)return out;if(Array.isArray(obj)){obj.forEach((v,i)=>walkFindings(v,`${path}[${i}]`,out));return out}if(typeof obj==='object'){const page=obj.physical_page??obj.page;if(page!=null)out.push({path,page:+page,author:obj.author,confidence:obj.confidence});Object.entries(obj).forEach(([k,v])=>walkFindings(v,path?path+'.'+k:k,out))}return out}
async function importAnalysis(){let text=$('#analysisPaste').value.trim();const f=$('#analysisFile').files?.[0];if(f)text=await f.text();if(!text)return toast('Kies een JSON-bestand of plak JSON.','warn');let data;try{data=JSON.parse(text.replace(/^```json\s*/i,'').replace(/```\s*$/,''))}catch(e){return toast('Dit is geen geldige JSON: '+e.message,'bad')}if(data.schema_version===1)return importLegacyAnalysis(data);if(data.schema_version===2)return importV2Analysis(data);if(data.schema_version!==3||!Array.isArray(data.results))return toast('Onbekend formaat. Verwacht schema_version 3 met een results-array.','bad');const prepared=[],errors=[],warnings=[];for(const r of data.results){const w=state.works.find(x=>x.id===r.work_id);if(!w){errors.push(`Onbekende work_id ${r.work_id}`);continue}const ranges=(r.analyzed_ranges||[]).map(x=>({start:+x.start,end:+x.end})).filter(x=>x.start&&x.end&&x.start>=1&&x.end>=x.start);if(!ranges.length){warnings.push(`${w.title||w.filename}: geen analyzed_ranges`);continue}if(ranges.some(x=>x.end>(w.page_count||x.end))){errors.push(`${w.title||w.filename}: paginabereik buiten PDF`);continue}const findings=walkFindings(r),bad=findings.filter(x=>x.page<1||(w.page_count&&x.page>w.page_count)),noA=findings.filter(x=>!x.author),noC=findings.filter(x=>!x.confidence);if(bad.length||noA.length||noC.length)warnings.push(`${w.title||w.filename}: ${bad.length} ongeldige pagina, ${noA.length} zonder auteur, ${noC.length} zonder betrouwbaarheid`);prepared.push({w,r,ranges})}if(errors.length)return toast('Import gestopt: '+errors.slice(0,3).join(' | '),'bad');if(!prepared.length)return toast('Geen bruikbare v3-resultaten gevonden.','bad');if(warnings.length&&!confirm(`Er zijn validatiewaarschuwingen:\n\n${warnings.slice(0,8).join('\n')}\n\nToch importeren?`))return;for(const x of prepared){const{w,r,ranges}=x;w.analysis=mergeAnalysis(w.analysis||{},r);w.analysis_ranges=[...(w.analysis_ranges||[]),...ranges.map(q=>({start:q.start,end:q.end,imported_at:Date.now(),corpus_id:data.corpus_id||''}))];if(r.complete_work&&w.page_count){w.analysis_ranges=[...(w.analysis_ranges||[]),{start:1,end:w.page_count,imported_at:Date.now(),corpus_id:data.corpus_id||'',complete_marker:true}]}w.pending_ranges=[];w.updated_at=Date.now();await idbPut('works',w)}$('#analysisPaste').value='';$('#analysisFile').value='';await loadWorks();toast(`${prepared.length} werkresultaten geïmporteerd. Corpusvoortgang bijgewerkt.`,'good')}
async function importV2Analysis(data){if(!Array.isArray(data.results))return toast('Ongeldig v2-resultaat.','bad');let n=0;for(const r of data.results){const w=state.works.find(x=>x.id===r.work_id),s=r.analysis_scope||{};if(!w||!s.page_start||!s.page_end)continue;w.analysis=mergeAnalysis(w.analysis||{},r);w.analysis_ranges=[...(w.analysis_ranges||[]),{start:+s.page_start,end:+s.page_end,imported_at:Date.now(),batch_id:data.batch_id||'',legacy_v2:true}];w.pending_ranges=(w.pending_ranges||[]).filter(p=>!(p.start===+s.page_start&&p.end===+s.page_end));w.updated_at=Date.now();await idbPut('works',w);n++}await loadWorks();toast(`${n} oude v2-onderdelen geïmporteerd.`,'good')}
async function importLegacyAnalysis(data){const w=state.works.find(x=>x.id===data.work_id);if(!w)return toast('work_id uit de oude analyse bestaat niet in dit corpus.','bad');const scope=data.analysis_scope||{},start=+scope.page_start,end=+scope.page_end;if(!start||!end||start<1||end<start||end>(w.page_count||end))return toast('analysis_scope bevat ongeldige fysieke paginanummers.','bad');const findings=walkFindings(data),badPages=findings.filter(x=>x.page<start||x.page>end||(w.page_count&&x.page>w.page_count)),missingAuth=findings.filter(x=>!x.author),missingConf=findings.filter(x=>!x.confidence);if((badPages.length||missingAuth.length||missingConf.length)&&!confirm(`Oud v1-resultaat: ${badPages.length} ongeldige pagina, ${missingAuth.length} zonder auteur, ${missingConf.length} zonder betrouwbaarheid. Toch importeren?`))return;w.analysis=mergeAnalysis(w.analysis||{},data);w.analysis_ranges=[...(w.analysis_ranges||[]),{start,end,imported_at:Date.now(),legacy:true}];w.pending_ranges=(w.pending_ranges||[]).filter(p=>!(p.start===start&&p.end===end));w.updated_at=Date.now();await idbPut('works',w);$('#analysisPaste').value='';$('#analysisFile').value='';await loadWorks();toast(`Oude v1-analyse p. ${start}-${end} geïmporteerd.`,'good')}
function mergeAnalysis(oldA,newA){if(!oldA||!Object.keys(oldA).length)return newA;const out={...oldA,...newA};const arrayKeys=['primary_sources','secondary_literature','source_criticism','argument_structure','writing_techniques','research_techniques','skill_lessons','lessons_for_user','anti_patterns','weaknesses'];for(const k of arrayKeys)out[k]=[...(oldA[k]||[]),...(newA[k]||[])];out.analysis_scope={page_start:Math.min(oldA.analysis_scope?.page_start||Infinity,newA.analysis_scope?.page_start||Infinity),page_end:Math.max(oldA.analysis_scope?.page_end||0,newA.analysis_scope?.page_end||0),complete_work:Boolean(oldA.analysis_scope?.complete_work||newA.analysis_scope?.complete_work)};return out}

async function searchOpenAlex(){const q=$('#oaQuery').value.trim();if(!q)return toast('Geef een zoekterm.','warn');$('#oaResults').innerHTML='<div class="empty">OpenAlex doorzoeken...</div>';try{let filter='type:dissertation';const y=$('#oaYear').value;if(y){const n=parseInt(y);filter+=`,from_publication_date:${n}-01-01`}const url=`https://api.openalex.org/works?search=${encodeURIComponent(q)}&filter=${encodeURIComponent(filter)}&per_page=20`;const r=await fetch(url);if(!r.ok)throw new Error(`OpenAlex antwoordde ${r.status}`);const data=await r.json();renderOA(data.results||[])}catch(e){console.error(e);$('#oaResults').innerHTML=`<div class="empty">Zoeken mislukt: ${esc(e.message)}. Probeer later opnieuw of gebruik de OpenAlex-website handmatig.</div>`}}
function oaAuthors(x){return (x.authorships||[]).map(a=>a.author?.display_name).filter(Boolean).slice(0,6).join(', ')}
function oaInstitutions(x){const arr=[];(x.authorships||[]).forEach(a=>(a.institutions||[]).forEach(i=>{if(i.display_name&&!arr.includes(i.display_name))arr.push(i.display_name)}));return arr.slice(0,4).join('; ')}
function oaPdf(x){return x.best_oa_location?.pdf_url||(x.locations||[]).find(l=>l.pdf_url)?.pdf_url||''}
function renderOA(xs){const el=$('#oaResults');el.innerHTML=xs.length?xs.map((x,i)=>{const authors=oaAuthors(x),inst=oaInstitutions(x),pdf=oaPdf(x);return `<div class="result"><div class="spread"><span class="badge">dissertation</span><span class="tiny">${esc(x.publication_year||'?')}</span></div><h5>${esc(x.title||'Zonder titel')}</h5><p>${esc(authors||'Auteur niet vermeld')}</p><p>${esc(inst||'Instelling niet duidelijk')}</p><div class="row">${pdf?`<button class="btn small" onclick="window.open('${esc(pdf)}','_blank')">PDF openen</button>`:''}<button class="btn small" onclick='saveOA(${JSON.stringify(i)})'>Bewaar metadata</button><button class="btn small" onclick="window.open('${esc(x.id||x.doi||'')}','_blank')">Open bron</button></div><script type="application/json" id="oa_${i}">${JSON.stringify(x).replace(/</g,'\\u003c')}<\/script></div>`}).join(''):'<div class="empty">Geen dissertations gevonden voor deze zoekterm.</div>'}
async function saveOA(i){const x=JSON.parse(document.getElementById('oa_'+i).textContent),authors=oaAuthors(x),inst=oaInstitutions(x),pdf=oaPdf(x);const work={id:uid(),filename:'(externe vondst - PDF nog toevoegen)',file_size:0,title:x.title||'',author:authors,institution:inst,year:String(x.publication_year||''),document_type:'Dissertation',field:suggestField(x.title||''),rug01:'',page_count:null,weight:'aanvullend',origin:'openalex',source_url:x.doi||x.id||'',pdf_url:pdf,notes:'Automatisch gevonden via OpenAlex. Kwaliteit/cijfer onbekend; nooit automatisch normatief.',analysis:null,analysis_ranges:[],openalex_id:x.id||'',created_at:Date.now(),updated_at:Date.now()};await idbPut('works',work);await loadWorks();toast('Metadata bewaard. Download de PDF via de bron en voeg die daarna als PDF toe; je kunt dubbele metadata later verwijderen/samenvoegen.','good')}

async function copyComparePrompt(){const ids=[...$('#benchmarkWorks').selectedOptions].map(o=>o.value),text=$('#ownText').value.trim(),goal=$('#atelierGoal').value;if(!text)return toast('Plak eerst je eigen tekst.','warn');const ws=ids.map(id=>state.works.find(w=>w.id===id)).filter(Boolean);if(!ws.length)return toast('Kies minstens één geanalyseerd benchmarkwerk.','warn');const summary=ws.map(w=>({title:w.title,author:w.author,weight:w.weight,skill_lessons:w.analysis?.skill_lessons||[],writing_techniques:w.analysis?.writing_techniques||[],research_techniques:w.analysis?.research_techniques||[],anti_patterns:w.analysis?.anti_patterns||[]}));const prompt=`Je bent mijn academische COACH, niet mijn ghostwriter. Vergelijk mijn tekst met de geabstraheerde vaardigheden uit onderstaande Scriptorium-benchmarks. Neem geen zinnen, formuleringen of unieke structuren uit de voorbeelden over. Gebruik normatieve UGent-voorbeelden als zwaarste referentie, maar beoordeel technieken kritisch. Doel: ${goal}.

BENCHMARKVAARDIGHEDEN
${JSON.stringify(summary,null,2)}

MIJN TEKST
${text}

WERKWIJZE
1. Diagnoseer mijn eigen keuzes.
2. Benoem wat ik al zelfstandig goed doe.
3. Koppel maximaal 5 verbeterpunten aan een OVERDRAAGBAAR PRINCIPE uit de benchmarks.
4. Leg voor elk punt uit waarom het principe helpt en welke contextgrens geldt.
5. Geef mij een korte oefening of controlevraag waarmee IK de verbetering uitvoer.
6. Geef een revisievolgorde, maar schrijf mijn passage niet volledig voor mij.
7. Als je een voorbeeld uit het corpus noemt: auteur + fysieke PDF-pagina + betrouwbaarheid.
8. Vermijd nabootsing van voorbeeldzinnen of voorbeeldformuleringen.`;await copyText(prompt);toast('Coachingsprompt gekopieerd.','good')}

async function exportBackup(){const data={scriptorium_backup:1,exported_at:new Date().toISOString(),works:state.works};downloadBlob(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),`Scriptorium_backup_${new Date().toISOString().slice(0,10)}.json`)}
async function importBackup(file){let data;try{data=JSON.parse(await file.text())}catch{return toast('Ongeldige backup-JSON.','bad')}if(data.scriptorium_backup!==1||!Array.isArray(data.works))return toast('Dit is geen Scriptorium-backup.','bad');if(!confirm(`Importeer ${data.works.length} werken? Bestaande werken met hetzelfde id worden overschreven; PDF-bestanden zitten niet in de backup.`))return;for(const w of data.works)await idbPut('works',w);await loadWorks();toast('Backup geïmporteerd. PDF’s die ontbreken moeten opnieuw worden toegevoegd.','good')}
async function cleanupOrphans(){const works=new Set(state.works.map(w=>w.id)),files=await idbGetAll('files');let n=0;for(const f of files)if(!works.has(f.id)){await idbDelete('files',f.id);n++}toast(`${n} wees-PDF(s) opgeruimd.`,'good');renderStorage()}
async function resetAll(){if(!confirm('Alles wissen? Dit verwijdert alle lokale metadata, analyses én PDF-bestanden uit Scriptorium.'))return;if(!confirm('Laatste bevestiging: deze actie kan niet ongedaan worden gemaakt.'))return;await Promise.all([idbClear('works'),idbClear('files'),idbClear('settings')]);await loadWorks();toast('Scriptorium is leeggemaakt.','warn')}

function openModal(id){$('#'+id).classList.add('open')}function closeModal(id){$('#'+id).classList.remove('open')}
function showPage(name){
  $$('.page').forEach(p=>p.classList.toggle('active',p.id==='page-'+name));
  $$('#nav button').forEach(b=>b.classList.toggle('active',b.dataset.page===name));
  document.body.classList.toggle('training-focus-mode',name==='training-focus');
  const names={dashboard:'Overzicht',corpus:'Corpus',discovery:'Aanvullende vondsten',exchange:'Corpusanalyse',training:'Training naar 18+',atelier:'Leeratelier',settings:'Instellingen & backup','training-focus':'Focusmodus'};
  $('#pageTitle').textContent=names[name]||'Scriptorium';
  if(name==='corpus')renderCorpus();if(name==='exchange')renderCorpusExport();if(name==='training')renderTraining();if(name==='training-focus')renderTrainingFocus();if(name==='atelier')renderLessons();if(name==='settings')renderStorage()
}

async function init(){try{db=await openDB();await migrateLegacyDBIfNeeded();await loadTrainingState();await loadWorks();}catch(e){console.error(e);alert('Scriptorium kon de lokale database niet openen. Controleer of IndexedDB in deze browser is toegestaan.')}$$('#nav button').forEach(b=>b.onclick=()=>showPage(b.dataset.page));$$('[data-go]').forEach(b=>b.onclick=()=>showPage(b.dataset.go));$$('[data-close]').forEach(b=>b.onclick=()=>closeModal(b.dataset.close));$$('.modal').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)closeModal(m.id)}));$('#helpBtn').onclick=()=>openModal('helpModal');$('#quickUpload').onclick=()=>{showPage('corpus');setTimeout(()=>$('#fileInput').click(),100)};const dz=$('#dropZone');dz.onclick=()=>$('#fileInput').click();$('#fileInput').onchange=e=>processFiles(e.target.files);['dragenter','dragover'].forEach(ev=>dz.addEventListener(ev,e=>{e.preventDefault();dz.classList.add('drag')}));['dragleave','drop'].forEach(ev=>dz.addEventListener(ev,e=>{e.preventDefault();dz.classList.remove('drag')}));dz.addEventListener('drop',e=>processFiles(e.dataTransfer.files));$('#corpusSearch').oninput=debounce(()=>{state.corpusPage=1;renderCorpus()});$('#corpusWeight').onchange=()=>{state.corpusPage=1;renderCorpus()};$('#corpusStatus').onchange=()=>{state.corpusPage=1;renderCorpus()};$('#corpusPrev').onclick=()=>{state.corpusPage--;renderCorpus()};$('#corpusNext').onclick=()=>{state.corpusPage++;renderCorpus()};$('#makeCorpusPackage').onclick=makeCorpusPackages;$('#copyCorpusPrompt').onclick=copyCorpusPrompt;$('#refreshCorpusExport').onclick=renderCorpusExport;$('#corpusVolumeMB').oninput=debounce(renderCorpusExport,120);$('#corpusExportMode').onchange=renderCorpusExport;$('#importAnalysis').onclick=importAnalysis;$('#clearPending').onclick=clearPending;$('#showSchema').onclick=()=>{$('#schemaBox').textContent=JSON.stringify(analysisSchema(state.works.find(w=>w.page_count)||null),null,2);openModal('schemaModal')};$('#oaSearch').onclick=searchOpenAlex;$('#oaQuery').addEventListener('keydown',e=>{if(e.key==='Enter')searchOpenAlex()});$('#lessonFilter').onchange=renderLessons;$('#copyComparePrompt').onclick=copyComparePrompt;$('#exportBackup').onclick=exportBackup;$('#importBackupFile').onchange=e=>e.target.files[0]&&importBackup(e.target.files[0]);$('#cleanupOrphans').onclick=cleanupOrphans;$('#resetAll').onclick=resetAll;
$('#trainingModule').innerHTML=TRAINING_MODULES.map(m=>`<option value="${m.id}">${m.n}. ${m.title}</option>`).join('');
$('#startTrainingSession').onclick=()=>startTrainingSession();$('#resumeTrainingSession').onclick=resumeTrainingSession;$('#resumeCurriculum').onclick=resumeCurriculum;$('#restartCurriculum').onclick=restartCurriculum;$('#leaveTrainingFocus').onclick=leaveTrainingFocus;$('#nextSessionExercise').onclick=nextSessionExercise;$('#showTrainingHint').onclick=showTrainingHint;$('#saveTrainingDraft').onclick=saveTrainingDraft;$('#copyGradingPrompt').onclick=copyTrainingGradingPrompt;$('#copyExerciseOnly').onclick=copyExerciseOnly;$('#importTrainingGrade').onclick=importTrainingGrade;$('#showTrainingSchema').onclick=()=>{$('#schemaBox').textContent=JSON.stringify(trainingGradeSchema(state.currentExercise?.exercise_id||'[attempt_id]'),null,2);openModal('schemaModal')};$('#clearTrainingHistory').onclick=clearTrainingHistory;renderTraining();renderTrainingFocus()}
window.openDetail=openDetail;window.editWork=editWork;window.removeWork=removeWork;window.selectPackageWork=selectPackageWork;window.goBatch=goCorpusExport;window.goCorpusExport=goCorpusExport;window.closeModal=closeModal;window.saveOA=saveOA;window.startModule=startModule;window.reviewTrainingAttempt=reviewTrainingAttempt;

/* ===== SOURCES ===== */
window.V6_AUTHENTIC_SOURCES = [
  {
    "id": "aio_salamis_1672",
    "primary": true,
    "ready": true,
    "source_type": "inscription",
    "language": "grc",
    "title": "Decree about the Athenian cleruchy on Salamis",
    "author": "Athenian People",
    "canonical_ref": "AIO 1672 = IG I³ 1 = ML 14",
    "period": "508–500 BC?",
    "place": "Athens / Salamis",
    "original_text": "ἔδοχσεν το͂ι δέμοι· τ̣[ὸς ἐΣ]αλαμ̣[ῖνι κλερόχ]ος οἰκε͂ν ἐᾶ Σαλαμῖνι ... Ἀθένεσι τελε͂ν καὶ στρατ[εύεσθ]αι ...",
    "translation_text": "The People decided: those holding allotments on Salamis are to be allowed to reside there ... at Athens they are to pay taxes and perform military service.",
    "original_source_name": "Attic Inscriptions Online — Greek text, AIO 1672",
    "original_source_url": "https://www.atticinscriptions.com/inscription/AIO/1672?text_type=greek",
    "translation_source_name": "AIO translated text — Stephen Lambert & Julian Schneider",
    "translation_source_url": "https://www.atticinscriptions.com/inscription/AIO/1672",
    "translation_credit": "Scriptorium working translation checked against AIO.",
    "context_hint": "Public decree; fragmentary inscription. Brackets and dots signal editorial restoration or loss.",
    "language_hint": "Treat restored letters differently from preserved letters.",
    "analytic_hint": "Separate what the decree prescribes from what people demonstrably did.",
    "scaffold": [
      "What is preserved?",
      "What is restored?",
      "What is normative?",
      "What would require another source type?"
    ],
    "tags": [
      "decree",
      "law",
      "citizenship",
      "taxation",
      "military",
      "epigraphy"
    ],
    "recommended_modules": [
      "m03",
      "m04",
      "m05",
      "m08",
      "m10",
      "m11",
      "m17",
      "m18",
      "m21"
    ]
  },
  {
    "id": "thuc_2_37",
    "primary": true,
    "ready": true,
    "source_type": "literary",
    "language": "grc",
    "title": "Funeral Oration: democracy and equality",
    "author": "Thucydides",
    "canonical_ref": "Thuc. 2.37.1",
    "period": "late 5th c. BC",
    "place": "Athens",
    "original_text": "καὶ ὄνομα μὲν διὰ τὸ μὴ ἐς ὀλίγους ἀλλ’ ἐς πλείονας οἰκεῖν δημοκρατία κέκληται· μέτεστι δὲ κατὰ μὲν τοὺς νόμους ... πᾶσι τὸ ἴσον.",
    "translation_text": "It is called a democracy because administration is in the hands of the many rather than the few; under the laws, equality is available to all in private disputes.",
    "original_source_name": "Perseus/Scaife — Greek edition of Thucydides",
    "original_source_url": "https://scaife.perseus.org/reader/urn:cts:greekLit:tlg0003.tlg001.perseus-grc2:2.37.1/",
    "translation_source_name": "Perseus — Richard Crawley, 1910",
    "translation_source_url": "https://www.perseus.tufts.edu/hopper/text?doc=Perseus%3Atext%3A1999.01.0200%3Abook%3D2%3Achapter%3D37%3Asection%3D1",
    "translation_credit": "Scriptorium working translation checked against Crawley.",
    "context_hint": "Thucydides presents Pericles' funeral speech; rhetorical setting and authorial mediation are central.",
    "language_hint": "δημοκρατία and τὸ ἴσον are analytically loaded terms, not transparent measurements.",
    "analytic_hint": "Do not equate political self-description with an exhaustive institutional description.",
    "scaffold": [
      "Who is speaking?",
      "For what audience?",
      "What is normative praise?",
      "What independent evidence could test the claims?"
    ],
    "tags": [
      "democracy",
      "rhetoric",
      "politics",
      "literary",
      "representation"
    ],
    "recommended_modules": [
      "m03",
      "m05",
      "m06",
      "m07",
      "m09",
      "m11",
      "m17",
      "m18",
      "m22"
    ]
  },
  {
    "id": "herodotus_5_78",
    "primary": true,
    "ready": true,
    "source_type": "literary",
    "language": "grc",
    "title": "Herodotus on isēgoriē and Athenian power",
    "author": "Herodotus",
    "canonical_ref": "Hdt. 5.78",
    "period": "5th c. BC",
    "place": "Athens",
    "original_text": "δηλοῖ δὲ ... ἡ ἰσηγορίη ὡς ἔστι χρῆμα σπουδαῖον ... ἀπαλλαχθέντες δὲ τυράννων μακρῷ πρῶτοι ἐγένοντο.",
    "translation_text": "It is evident that equality of political speech is a powerful thing: after the Athenians were rid of tyrants, they became markedly pre-eminent.",
    "original_source_name": "Perseus — Greek text of Herodotus",
    "original_source_url": "https://scaife.perseus.org/reader/urn:cts:greekLit:tlg0016.tlg001.perseus-grc2:5.78/",
    "translation_source_name": "G. C. Macaulay translation, 1890",
    "translation_source_url": "https://lexundria.com/hdt/5.78/mcly",
    "translation_credit": "Scriptorium working translation checked against Macaulay.",
    "context_hint": "Narrative explanation written after the events; the passage explicitly links political regime and military performance.",
    "language_hint": "ἰσηγορίη is a contested political term; do not silently equate it with a complete modern model of democracy.",
    "analytic_hint": "The passage contains a causal claim. Ask what alternative mechanisms could produce the same observed outcome.",
    "scaffold": [
      "What is the observed change?",
      "What cause does Herodotus propose?",
      "What evidence is missing?",
      "What rival explanation would you test?"
    ],
    "tags": [
      "causality",
      "democracy",
      "tyranny",
      "military",
      "literary"
    ],
    "recommended_modules": [
      "m03",
      "m05",
      "m09",
      "m11",
      "m12",
      "m17",
      "m18",
      "m22"
    ]
  },
  {
    "id": "caesar_bg_1_1",
    "primary": true,
    "ready": true,
    "source_type": "literary",
    "language": "lat",
    "title": "Caesar's opening ethnography of Gaul",
    "author": "Julius Caesar",
    "canonical_ref": "Caes. BG 1.1",
    "period": "mid-1st c. BC",
    "place": "Gaul",
    "original_text": "Gallia est omnis divisa in partes tres ... Hi omnes lingua, institutis, legibus inter se differunt.",
    "translation_text": "Gaul as a whole is divided into three parts ... these peoples differ from one another in language, customs and laws.",
    "original_source_name": "Perseus — T. Rice Holmes Latin edition, 1914",
    "original_source_url": "https://www.perseus.tufts.edu/hopper/text?doc=Perseus%3Atext%3A1999.02.0002%3Abook%3D1%3Achapter%3D1",
    "translation_source_name": "W. A. McDevitte & W. S. Bohn translation, 1869",
    "translation_source_url": "https://atlas.perseus.tufts.edu/library/urn%3Acts%3AlatinLit%3Aphi0448.phi001.perseus-eng2/",
    "translation_credit": "Scriptorium working translation checked against McDevitte & Bohn.",
    "context_hint": "A commander-author classifies peoples at the opening of a conquest narrative.",
    "language_hint": "Notice categorical verbs and group labels. They create analytical units before evidence is presented.",
    "analytic_hint": "Treat Caesar's ethnographic categories as claims requiring testing, not neutral dataset labels.",
    "scaffold": [
      "Who creates the categories?",
      "What function do they serve?",
      "Could local variation disappear?",
      "What source could test them?"
    ],
    "tags": [
      "ethnography",
      "categories",
      "empire",
      "literary",
      "representation"
    ],
    "recommended_modules": [
      "m03",
      "m04",
      "m05",
      "m07",
      "m09",
      "m11",
      "m14",
      "m17",
      "m22"
    ]
  },
  {
    "id": "cicero_cat_1_1",
    "primary": true,
    "ready": true,
    "source_type": "speech",
    "language": "lat",
    "title": "Cicero's opening attack on Catiline",
    "author": "Cicero",
    "canonical_ref": "Cic. Cat. 1.1",
    "period": "63 BC",
    "place": "Rome",
    "original_text": "Quo usque tandem abutere, Catilina, patientia nostra? Quam diu etiam furor iste tuus nos eludet? Quem ad finem sese effrenata iactabit audacia?",
    "translation_text": "How long, Catiline, will you continue to abuse our patience? How much longer will that madness of yours evade us? How far will your unrestrained audacity go?",
    "original_source_name": "Perseus — A. C. Clark Latin edition, 1908",
    "original_source_url": "https://atlas.perseus.tufts.edu/library/urn%3Acts%3AlatinLit%3Aphi0474.phi013.perseus-lat2/",
    "translation_source_name": "C. D. Yonge translation, 1856",
    "translation_source_url": "https://www.perseus.tufts.edu/hopper/text?doc=Perseus%3Atext%3A1999.02.0019%3Atext%3DCatil.%3Aspeech%3D1%3Achapter%3D1",
    "translation_credit": "Scriptorium working translation checked against Yonge.",
    "context_hint": "A highly adversarial senatorial speech. Accusation, persuasion and performance shape the evidence.",
    "language_hint": "The repeated rhetorical questions and loaded nouns are argumentative devices.",
    "analytic_hint": "A speech can reveal political strategies and categories even where it cannot independently establish every alleged fact.",
    "scaffold": [
      "Which statements are accusation?",
      "Which are observable circumstances?",
      "Who is the audience?",
      "What would corroboration look like?"
    ],
    "tags": [
      "rhetoric",
      "politics",
      "elite",
      "speech",
      "bias"
    ],
    "recommended_modules": [
      "m05",
      "m06",
      "m07",
      "m09",
      "m11",
      "m16",
      "m17",
      "m18",
      "m22"
    ]
  },
  {
    "id": "pliny_ep_10_96",
    "primary": true,
    "ready": true,
    "source_type": "letter",
    "language": "lat",
    "title": "Pliny asks Trajan how to handle Christians",
    "author": "Pliny the Younger",
    "canonical_ref": "Plin. Ep. 10.96.1",
    "period": "c. AD 112",
    "place": "Bithynia-Pontus",
    "original_text": "Sollemne est mihi, domine, omnia de quibus dubito ad te referre ... Cognitionibus de Christianis interfui numquam: ideo nescio quid et quatenus aut puniri soleat aut quaeri.",
    "translation_text": "It is my regular practice, lord, to refer to you everything about which I am uncertain ... I have never attended investigations of Christians, so I do not know what is usually punished or investigated, or to what extent.",
    "original_source_name": "Perseus — Latin text of Pliny, Epistles 10.96",
    "original_source_url": "https://www.perseus.tufts.edu/hopper/text?doc=Plin.+Ep.+10.96",
    "translation_source_name": "Perseus/Scaife English translation record for Pliny's Letters",
    "translation_source_url": "https://scaife.perseus.org/",
    "translation_credit": "Scriptorium working translation from the Latin; external translation link for checking.",
    "context_hint": "Official correspondence from a provincial governor to the emperor. It records uncertainty and administrative decision-making.",
    "language_hint": "Pliny explicitly marks his uncertainty with dubito, nescio and questions about procedure.",
    "analytic_hint": "This is strong evidence for Pliny's problem and procedure, but not automatically for the prevalence or beliefs of all Christians.",
    "scaffold": [
      "What does Pliny know?",
      "What does he admit he does not know?",
      "What is administrative practice?",
      "What is evidence about Christians themselves?"
    ],
    "tags": [
      "letter",
      "governance",
      "religion",
      "procedure",
      "uncertainty",
      "province"
    ],
    "recommended_modules": [
      "m05",
      "m08",
      "m10",
      "m11",
      "m13",
      "m17",
      "m18",
      "m22"
    ]
  },
  {
    "id": "rgda_34",
    "primary": true,
    "ready": true,
    "source_type": "inscription",
    "language": "lat",
    "title": "Augustus on the constitutional settlement",
    "author": "Augustus",
    "canonical_ref": "Res Gestae 34",
    "period": "text completed by AD 14",
    "place": "Rome / Ankara copy",
    "original_text": "Post id tempus auctoritate omnibus praestiti, potestatis autem nihilo amplius habui quam ceteri qui mihi quoque in magistratu conlegae fuerunt.",
    "translation_text": "After that time I surpassed everyone in authority, but I possessed no more formal power than the others who were my colleagues in each magistracy.",
    "original_source_name": "Perseus — Latin text, Res Gestae 34",
    "original_source_url": "https://www.perseus.tufts.edu/hopper/text?doc=urn%3Acts%3AlatinLit%3Aphi1221.phi007.perseus-lat1%3A34",
    "translation_source_name": "LacusCurtius — F. W. Shipley, Loeb 1924 (public-domain text)",
    "translation_source_url": "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Augustus/Res_Gestae/home.html",
    "translation_credit": "Scriptorium working translation checked against Shipley.",
    "context_hint": "Programmatic first-person political self-representation, preserved epigraphically in the provinces.",
    "language_hint": "Distinguish auctoritas from potestas; the contrast is part of Augustus' claim.",
    "analytic_hint": "Do not convert constitutional self-description into a neutral description of actual power.",
    "scaffold": [
      "What distinction does Augustus construct?",
      "Who benefits from this framing?",
      "What evidence could test de facto power?",
      "Why does epigraphic display matter?"
    ],
    "tags": [
      "princeps",
      "power",
      "self-representation",
      "inscription",
      "constitution"
    ],
    "recommended_modules": [
      "m03",
      "m05",
      "m07",
      "m09",
      "m10",
      "m11",
      "m12",
      "m17",
      "m18",
      "m22"
    ]
  },
  {
    "id": "rib_1065_regina",
    "primary": true,
    "ready": true,
    "source_type": "funerary_inscription",
    "language": "lat",
    "title": "Funerary inscription for Regina",
    "author": "Barates (dedicator)",
    "canonical_ref": "RIB 1065",
    "period": "2nd century AD",
    "place": "Arbeia / South Shields",
    "original_text": "D(is) M(anibus) Regina liberta et coniuge Barates Palmyrenus natione Catuallauna an(norum) XXX",
    "translation_text": "To the spirits of the departed, and to Regina, his freedwoman and wife, a Catuvellaunian by origin, aged thirty: Barates of Palmyra set this up.",
    "original_source_name": "Roman Inscriptions of Britain — RIB 1065",
    "original_source_url": "https://romaninscriptionsofbritain.org/inscriptions/1065",
    "translation_source_name": "Roman Inscriptions of Britain — translation",
    "translation_source_url": "https://romaninscriptionsofbritain.org/inscriptions/1065",
    "translation_credit": "Scriptorium working rendering checked against RIB.",
    "context_hint": "Bilingual funerary monument; RIB also records a Palmyrene text. Commemoration is selective social representation.",
    "language_hint": "Abbreviations such as D.M. and ann. are formulaic. Grammatical irregularity itself may be historically meaningful.",
    "analytic_hint": "Do not infer a complete household biography from what the commemorator chose to inscribe.",
    "scaffold": [
      "Who commemorates whom?",
      "Which identities are named?",
      "Which are omitted?",
      "What does bilingualism allow you to ask?"
    ],
    "tags": [
      "funerary",
      "migration",
      "freedwoman",
      "identity",
      "bilingualism",
      "epigraphy"
    ],
    "recommended_modules": [
      "m04",
      "m05",
      "m10",
      "m11",
      "m14",
      "m17",
      "m21",
      "m22"
    ]
  },
  {
    "id": "vindolanda_291",
    "primary": true,
    "ready": true,
    "source_type": "writing_tablet",
    "language": "lat",
    "title": "Birthday invitation from Claudia Severa to Sulpicia Lepidina",
    "author": "Claudia Severa",
    "canonical_ref": "Tab. Vindol. 291",
    "period": "c. AD 100",
    "place": "Vindolanda",
    "original_text": "Cl(audia) Seuerá Lepidinae suae salutem. iii Idus Septembres, soror, ad diem sollemnem natalem meum rogo libenter facias ut uenias ad nos ...",
    "translation_text": "Claudia Severa sends greetings to her Lepidina. Sister, on 11 September, for the celebration of my birthday, I warmly ask you to make sure that you come to us ...",
    "original_source_name": "Roman Inscriptions of Britain — TabVindol 291",
    "original_source_url": "https://romaninscriptionsofbritain.org/inscriptions/TabVindol291",
    "translation_source_name": "Roman Inscriptions of Britain — translation",
    "translation_source_url": "https://romaninscriptionsofbritain.org/inscriptions/TabVindol291",
    "translation_credit": "Scriptorium working translation checked against RIB.",
    "context_hint": "Private wooden writing tablet from the military frontier; a rare documentary glimpse of elite women's social networks.",
    "language_hint": "Epistolary formulae and spelling should be distinguished from analytical content.",
    "analytic_hint": "Exceptional preservation makes the source valuable but not automatically representative.",
    "scaffold": [
      "What relationship is directly attested?",
      "What social practices are only implied?",
      "Why was this preserved?",
      "What comparison would test representativeness?"
    ],
    "tags": [
      "letter",
      "women",
      "frontier",
      "social-network",
      "documentary",
      "material"
    ],
    "recommended_modules": [
      "m04",
      "m05",
      "m10",
      "m11",
      "m14",
      "m17",
      "m21",
      "m22"
    ]
  },
  {
    "id": "poxy_4_744",
    "primary": true,
    "ready": true,
    "source_type": "papyrus_letter",
    "language": "grc",
    "title": "Hilarion to Alis",
    "author": "Hilarion",
    "canonical_ref": "P.Oxy. IV 744",
    "period": "1 BC",
    "place": "Oxyrhynchus / Alexandria",
    "original_text": "ἐρωτῶ σε καὶ παρακαλῶ σε ἐπιμελήθι τῷ παιδίῳ ... ἐὰν ἦν ἄρσενον ἄφες, ἐὰν ἦν θήλεα ἔκβαλε.",
    "translation_text": "I ask and urge you to take care of the child ... if it is male, let it remain; if it is female, expose it.",
    "original_source_name": "DDbDP transcription, P.Oxy. IV 744",
    "original_source_url": "https://papyri.info/ddbdp/p.oxy;4;744",
    "translation_source_name": "Select Papyri 1.105 / Attalus",
    "translation_source_url": "https://www.attalus.org/docs/select1/p105.html",
    "translation_credit": "Scriptorium working translation checked against the published English selection.",
    "context_hint": "Private letter, not a legal prescription or population-level dataset. Its documentary immediacy does not erase individual context.",
    "language_hint": "The papyrus preserves non-classical spellings and grammar; editorial normalization can conceal historically useful linguistic evidence.",
    "analytic_hint": "One shocking instruction cannot by itself establish prevalence, normality or legal status of a practice.",
    "scaffold": [
      "What is directly instructed?",
      "What broader practice is not demonstrated?",
      "What comparison is required?",
      "Which kind of conclusion is proportionate?"
    ],
    "tags": [
      "papyrus",
      "letter",
      "family",
      "gender",
      "documentary",
      "representativeness"
    ],
    "recommended_modules": [
      "m04",
      "m05",
      "m10",
      "m11",
      "m13",
      "m14",
      "m17",
      "m21",
      "m22"
    ]
  },
  {
    "id": "ocre_aug_86a",
    "primary": true,
    "ready": true,
    "source_type": "coin",
    "language": "material",
    "title": "Augustus denarius: SIGNIS RECEPTIS",
    "author": "Roman mint authority",
    "canonical_ref": "RIC I² Augustus 86A",
    "period": "19–15 BC",
    "place": "Colonia Patricia",
    "original_text": "Obverse legend: CAESAR AVGVSTVS. Reverse legend: SIGNIS RECEPTIS. Reverse type: shield marked CL V, flanked by an aquila and a military standard.",
    "translation_text": "Object data rather than a translated text: the reverse publicly evokes the recovery of military standards and the clipeus virtutis.",
    "original_source_name": "Online Coins of the Roman Empire — RIC I² Augustus 86A",
    "original_source_url": "http://numismatics.org/ocre/id/ric.1(2).aug.86A",
    "translation_source_name": "OCRE object/legend record",
    "translation_source_url": "http://numismatics.org/ocre/id/ric.1(2).aug.86A",
    "translation_credit": "No literary translation: Scriptorium preserves the legend and object description; interpretation must be argued.",
    "context_hint": "Minted object with official iconographic and textual choices; circulation is not the same thing as proven audience reception.",
    "language_hint": "Expand AVGVSTVS and SIGNIS RECEPTIS, but keep expansion separate from historical interpretation.",
    "analytic_hint": "Coin imagery is excellent evidence for messages made available in circulation, weaker evidence for what every viewer believed.",
    "scaffold": [
      "What is physically on the coin?",
      "What is iconographic interpretation?",
      "Who issued it?",
      "How would circulation/reception be tested?"
    ],
    "tags": [
      "coin",
      "numismatics",
      "Augustus",
      "military",
      "iconography",
      "reception"
    ],
    "recommended_modules": [
      "m03",
      "m04",
      "m05",
      "m10",
      "m11",
      "m14",
      "m17",
      "m21",
      "m22"
    ]
  },
  {
    "id": "aio_aiuk2_8",
    "primary": true,
    "ready": true,
    "source_type": "inscription",
    "language": "grc",
    "title": "List of Athenians and Romans",
    "author": "Unknown civic/associational context",
    "canonical_ref": "AIUK 2 no. 8 = IG II² 2460",
    "period": "c. 100–90 BC",
    "place": "Athens",
    "original_text": "Ἀλκέτου τοῦ Εὐαγίωνος Περιθοίδου ... Λευκίου τοῦ Λευκίου ῾Ρωμαίου Μαάρκου τοῦ Μαάρκου ῾Ρωμαίου ...",
    "translation_text": "The list names Athenians by deme and also Lucius son of Lucius and Marcus son of Marcus, identified as Romans.",
    "original_source_name": "Attic Inscriptions Online — Greek text",
    "original_source_url": "https://www.atticinscriptions.com/inscription/AIUK2/8?text_type=greek",
    "translation_source_name": "AIO translation by Stephen Lambert",
    "translation_source_url": "https://www.atticinscriptions.com/inscription/AIUK2/8",
    "translation_credit": "Scriptorium working translation; check against AIO.",
    "context_hint": "A list without its lost wider context. Prosopography can suggest networks, but the original purpose is uncertain.",
    "language_hint": "Ethnics/demotics identify civic affiliations; names alone do not establish social role.",
    "analytic_hint": "Do not infer a complete Roman community from two Roman names in one fragmentary list.",
    "scaffold": [
      "What is directly listed?",
      "What context is missing?",
      "Which prosopographic inference is defensible?",
      "What comparison would test significance?"
    ],
    "tags": [
      "prosopography",
      "Romans",
      "Athens",
      "list",
      "identity"
    ],
    "recommended_modules": [
      "m04",
      "m05",
      "m10",
      "m11",
      "m14",
      "m21"
    ]
  },
  {
    "id": "aio_ro22",
    "primary": true,
    "ready": true,
    "source_type": "inscription",
    "language": "grc",
    "title": "Second Athenian League decree",
    "author": "Athenian Council and People",
    "canonical_ref": "RO 22 = IG II² 43",
    "period": "378/7 BC",
    "place": "Athens",
    "original_text": "ἔδοξεν τῆι βολῆι καὶ τῶι δήμωι ... ἐλευθέρους καὶ αὐτονόμους ... μήτε φρουρὰν ... μήτε φόρον φέροντι ...",
    "translation_text": "The decree presents prospective allies as free and autonomous, without an Athenian garrison, governor, or tribute.",
    "original_source_name": "Attic Inscriptions Online — Greek text",
    "original_source_url": "https://www.atticinscriptions.com/inscription/RO/22?text_type=greek",
    "translation_source_name": "AIO translation by Stephen Lambert & P. J. Rhodes",
    "translation_source_url": "https://www.atticinscriptions.com/inscription/RO/22",
    "translation_credit": "Scriptorium working translation; check against AIO.",
    "context_hint": "Alliance decree deliberately defines acceptable interstate relations after memories of fifth-century Athenian empire.",
    "language_hint": "ἐλευθερία, αὐτονομία and φόρος are politically charged terms.",
    "analytic_hint": "Treat promises in an alliance decree as normative commitments, then test later practice separately.",
    "scaffold": [
      "What commitments are explicit?",
      "What historical memory may shape them?",
      "What later evidence could test compliance?"
    ],
    "tags": [
      "alliance",
      "autonomy",
      "empire",
      "decree",
      "norm-practice"
    ],
    "recommended_modules": [
      "m03",
      "m05",
      "m07",
      "m10",
      "m11",
      "m12",
      "m17",
      "m21"
    ]
  },
  {
    "id": "aio_aiuk9_pan",
    "primary": true,
    "ready": true,
    "source_type": "dedication",
    "language": "grc",
    "title": "Dedication to Pan and the Nymphs",
    "author": "Private dedicator from Phlya",
    "canonical_ref": "AIUK 9 Appendix 1 = IG II³ 4, 1430",
    "period": "c. 350–330 BC",
    "place": "Attica",
    "original_text": "[- - - - - - ί]π̣πο Φλυεὺς ἀνέθηκεν.",
    "translation_text": "A man of Phlya, whose name is partly lost, dedicated the object.",
    "original_source_name": "Attic Inscriptions Online — Greek text",
    "original_source_url": "https://www.atticinscriptions.com/inscription/AIUK9/appendix-1?text_type=greek",
    "translation_source_name": "AIO translation by Peter Liddel & Polly Low",
    "translation_source_url": "https://www.atticinscriptions.com/inscription/AIUK9/appendix-1",
    "translation_credit": "Scriptorium working translation; check against AIO.",
    "context_hint": "The inscribed relief survives through an early modern depiction; object, image and text have different transmission histories.",
    "language_hint": "ἀνέθηκεν marks dedication; the lost name limits social identification.",
    "analytic_hint": "Material context and survival history are part of source criticism, not decoration.",
    "scaffold": [
      "What survives physically?",
      "What survives only through a drawing?",
      "What can the demotic tell you?"
    ],
    "tags": [
      "dedication",
      "religion",
      "relief",
      "material-culture",
      "transmission"
    ],
    "recommended_modules": [
      "m04",
      "m05",
      "m10",
      "m11",
      "m21"
    ]
  },
  {
    "id": "aio_igi3_246",
    "primary": true,
    "ready": true,
    "source_type": "sacrificial_calendar",
    "language": "grc",
    "title": "Sacrificial calendar",
    "author": "Local Attic community",
    "canonical_ref": "IG I³ 246 = AIUK 4.1 no. 2",
    "period": "470–450 BC",
    "place": "Attica",
    "original_text": "Πλυντερίοισι Ἀθεναίαι οἶν ... Hέρμει πυρῶν δύο χοίνικε ...",
    "translation_text": "At the Plynteria a sheep is assigned to Athena; another entry specifies two choenices of wheat for Hermes.",
    "original_source_name": "Attic Inscriptions Online — Greek text",
    "original_source_url": "https://www.atticinscriptions.com/inscription/AIUK41/2?text_type=greek",
    "translation_source_name": "AIO translation by Stephen Lambert & Feyo Schuddeboom",
    "translation_source_url": "https://www.atticinscriptions.com/inscription/AIUK41/2",
    "translation_credit": "Scriptorium working translation; check against AIO.",
    "context_hint": "A fragmentary ritual calendar inscribed on multiple faces; its original findspot is unknown.",
    "language_hint": "Archaic orthography and damaged text complicate normalization.",
    "analytic_hint": "Prescribed offerings reveal institutional ritual provision, not automatically actual attendance or belief.",
    "scaffold": [
      "Which entries are certain?",
      "What does a calendar regulate?",
      "Which social practices remain invisible?"
    ],
    "tags": [
      "religion",
      "calendar",
      "ritual",
      "fragmentary",
      "epigraphy"
    ],
    "recommended_modules": [
      "m05",
      "m08",
      "m10",
      "m11",
      "m13",
      "m21"
    ]
  },
  {
    "id": "aio_802_chios",
    "primary": true,
    "ready": true,
    "source_type": "inscription",
    "language": "grc",
    "title": "Alliance with Chios",
    "author": "Athenian Council and People",
    "canonical_ref": "AIO 802",
    "period": "384/3 BC",
    "place": "Athens",
    "original_text": "συμμάχους ποιεῖσθαι Χίους ἐπ’ ἐλευθερίαι καὶ αὐτονομίαι ... βοηθεῖν ... παντὶ σθένει ...",
    "translation_text": "The Chians are to become allies on terms of freedom and autonomy, with mutual military assistance.",
    "original_source_name": "Attic Inscriptions Online — Greek text",
    "original_source_url": "https://www.atticinscriptions.com/inscription/AIO/802?text_type=greek",
    "translation_source_name": "Attic Inscriptions Online translated record",
    "translation_source_url": "https://www.atticinscriptions.com/inscription/AIO/802",
    "translation_credit": "Scriptorium working translation; check against AIO.",
    "context_hint": "Formal alliance provisions encode an ideal interstate relationship.",
    "language_hint": "Pay attention to reciprocal conditional clauses and the formula κατὰ τὸ δυνατόν.",
    "analytic_hint": "Mutual obligation on stone is evidence for negotiated norms, not proof of later equal performance.",
    "scaffold": [
      "Which obligations are reciprocal?",
      "Where is discretion preserved?",
      "How could later behaviour be tested?"
    ],
    "tags": [
      "alliance",
      "autonomy",
      "diplomacy",
      "decree"
    ],
    "recommended_modules": [
      "m05",
      "m10",
      "m11",
      "m12",
      "m17",
      "m21"
    ]
  },
  {
    "id": "aio_807_dionysios",
    "primary": true,
    "ready": true,
    "source_type": "inscription",
    "language": "grc",
    "title": "Alliance with Dionysios I of Syracuse",
    "author": "Athenian People",
    "canonical_ref": "AIO 807",
    "period": "368/7 BC?",
    "place": "Athens",
    "original_text": "ἐπαινέσαι ... Διονύσιον ... σύμμαχον ... ἐάν τις ἴηι ἐπὶ τὴν χώραν ... βοηθεῖν ...",
    "translation_text": "The decree praises Dionysios and establishes mutual assistance if either party is attacked.",
    "original_source_name": "Attic Inscriptions Online — Greek text",
    "original_source_url": "https://www.atticinscriptions.com/inscription/AIO/807?text_type=greek",
    "translation_source_name": "Attic Inscriptions Online translated record",
    "translation_source_url": "https://www.atticinscriptions.com/inscription/AIO/807",
    "translation_credit": "Scriptorium working translation; check against AIO.",
    "context_hint": "Diplomatic honorific language and treaty clauses coexist in one public text.",
    "language_hint": "Separate praise formulae from operative clauses.",
    "analytic_hint": "Different parts of one inscription can have different evidential status.",
    "scaffold": [
      "Which words praise?",
      "Which clauses create obligations?",
      "Which historical claim relies on which part?"
    ],
    "tags": [
      "diplomacy",
      "treaty",
      "ruler",
      "decree",
      "genre"
    ],
    "recommended_modules": [
      "m05",
      "m10",
      "m11",
      "m16",
      "m17",
      "m21"
    ]
  },
  {
    "id": "aio_or155_coinage",
    "primary": true,
    "ready": true,
    "source_type": "inscription",
    "language": "grc",
    "title": "Decree enforcing Athenian coins, weights and measures",
    "author": "Athenian authorities",
    "canonical_ref": "OR 155 = IG I³ 1453",
    "period": "c. 414 BC?",
    "place": "Athenian sphere",
    "original_text": "ἐάν τις κόπτηι νόμισμα ... καὶ μὴ χρῆται νομίσμασιν τοῖς Ἀθηναίων ἢ σταθμοῖς ἢ μέτροις ...",
    "translation_text": "The decree penalizes minting or using currency, weights, or measures contrary to the Athenian standards it prescribes.",
    "original_source_name": "Attic Inscriptions Online — Greek text",
    "original_source_url": "https://www.atticinscriptions.com/inscription/IGI3/1453?text_type=greek",
    "translation_source_name": "Attic Inscriptions Online translated record",
    "translation_source_url": "https://www.atticinscriptions.com/inscription/IGI3/1453",
    "translation_credit": "Scriptorium working translation; check against AIO.",
    "context_hint": "Highly fragmentary coercive regulation linked to Athenian economic standards.",
    "language_hint": "Editorial restorations materially affect how the regulatory mechanism is reconstructed.",
    "analytic_hint": "Enforcement provisions indicate state intention; actual monetary circulation needs numismatic evidence.",
    "scaffold": [
      "What is normatively required?",
      "Where is the text restored?",
      "What coin evidence could corroborate practice?"
    ],
    "tags": [
      "coinage",
      "weights",
      "measures",
      "empire",
      "economy",
      "law"
    ],
    "recommended_modules": [
      "m05",
      "m10",
      "m11",
      "m12",
      "m13",
      "m21"
    ]
  },
  {
    "id": "ocre_aug_127",
    "primary": true,
    "ready": true,
    "source_type": "coin",
    "language": "material",
    "title": "Aureus: RIC I² Augustus 127",
    "author": "Roman mint authority",
    "canonical_ref": "RIC I² Augustus 127",
    "period": "18–17 BC",
    "place": "Colonia Patricia",
    "original_text": "Legend: AVGVSTVS. Type: Capricorn holding globe with rudder; cornucopia above.",
    "translation_text": "Object record: preserve the legend, denomination, mint, metal and iconographic type before interpreting the political message.",
    "original_source_name": "Online Coins of the Roman Empire (OCRE)",
    "original_source_url": "https://www.numismatics.org/ocre/id/ric.1%282%29.aug.127",
    "translation_source_name": "OCRE typological/object record",
    "translation_source_url": "https://www.numismatics.org/ocre/id/ric.1%282%29.aug.127",
    "translation_credit": "No literary translation; Scriptorium uses OCRE object data.",
    "context_hint": "Mass-produced official object; minting and circulation are distinct from individual reception.",
    "language_hint": "Expand abbreviations only after recording the legend exactly.",
    "analytic_hint": "Treat imagery and legend as issued communication; audience response requires separate evidence.",
    "scaffold": [
      "What is physically encoded?",
      "What is an iconographic interpretation?",
      "What would circulation data add?"
    ],
    "tags": [
      "coin",
      "numismatics",
      "imperial-image",
      "circulation"
    ],
    "recommended_modules": [
      "m04",
      "m05",
      "m10",
      "m11",
      "m13",
      "m14",
      "m21"
    ]
  },
  {
    "id": "ocre_aug_253",
    "primary": true,
    "ready": true,
    "source_type": "coin",
    "language": "material",
    "title": "Denarius: RIC I² Augustus 253",
    "author": "Roman mint authority",
    "canonical_ref": "RIC I² Augustus 253",
    "period": "32–29 BC",
    "place": "uncertain Italian mint",
    "original_text": "Legend: CAESAR DIVI F. Type: Octavian in military dress, with spear.",
    "translation_text": "Object record: preserve the legend, denomination, mint, metal and iconographic type before interpreting the political message.",
    "original_source_name": "Online Coins of the Roman Empire (OCRE)",
    "original_source_url": "https://numismatics.org/ocre/id/ric.1%282%29.aug.253",
    "translation_source_name": "OCRE typological/object record",
    "translation_source_url": "https://numismatics.org/ocre/id/ric.1%282%29.aug.253",
    "translation_credit": "No literary translation; Scriptorium uses OCRE object data.",
    "context_hint": "Mass-produced official object; minting and circulation are distinct from individual reception.",
    "language_hint": "Expand abbreviations only after recording the legend exactly.",
    "analytic_hint": "Treat imagery and legend as issued communication; audience response requires separate evidence.",
    "scaffold": [
      "What is physically encoded?",
      "What is an iconographic interpretation?",
      "What would circulation data add?"
    ],
    "tags": [
      "coin",
      "numismatics",
      "imperial-image",
      "circulation"
    ],
    "recommended_modules": [
      "m04",
      "m05",
      "m10",
      "m11",
      "m13",
      "m14",
      "m21"
    ]
  },
  {
    "id": "ocre_aug_11a",
    "primary": true,
    "ready": true,
    "source_type": "coin",
    "language": "material",
    "title": "As: RIC I² Augustus 11A",
    "author": "Roman mint authority",
    "canonical_ref": "RIC I² Augustus 11A",
    "period": "25–23 BC",
    "place": "Caesaraugusta",
    "original_text": "Legend: P CARISIVS LEG AVGVSTI EMERITA. Type: City wall and gateway marked EMERITA.",
    "translation_text": "Object record: preserve the legend, denomination, mint, metal and iconographic type before interpreting the political message.",
    "original_source_name": "Online Coins of the Roman Empire (OCRE)",
    "original_source_url": "https://numismatics.org/ocre/id/ric.1%282%29.aug.11A",
    "translation_source_name": "OCRE typological/object record",
    "translation_source_url": "https://numismatics.org/ocre/id/ric.1%282%29.aug.11A",
    "translation_credit": "No literary translation; Scriptorium uses OCRE object data.",
    "context_hint": "Mass-produced official object; minting and circulation are distinct from individual reception.",
    "language_hint": "Expand abbreviations only after recording the legend exactly.",
    "analytic_hint": "Treat imagery and legend as issued communication; audience response requires separate evidence.",
    "scaffold": [
      "What is physically encoded?",
      "What is an iconographic interpretation?",
      "What would circulation data add?"
    ],
    "tags": [
      "coin",
      "numismatics",
      "imperial-image",
      "circulation"
    ],
    "recommended_modules": [
      "m04",
      "m05",
      "m10",
      "m11",
      "m13",
      "m14",
      "m21"
    ]
  },
  {
    "id": "ocre_aug_126",
    "primary": true,
    "ready": true,
    "source_type": "coin",
    "language": "material",
    "title": "Denarius: RIC I² Augustus 126",
    "author": "Roman mint authority",
    "canonical_ref": "RIC I² Augustus 126",
    "period": "18–17 BC",
    "place": "Colonia Patricia",
    "original_text": "Legend: AVGVSTVS. Type: Capricorn with globe, rudder and cornucopia.",
    "translation_text": "Object record: preserve the legend, denomination, mint, metal and iconographic type before interpreting the political message.",
    "original_source_name": "Online Coins of the Roman Empire (OCRE)",
    "original_source_url": "https://numismatics.org/ocre/id/ric.1%282%29.aug.126",
    "translation_source_name": "OCRE typological/object record",
    "translation_source_url": "https://numismatics.org/ocre/id/ric.1%282%29.aug.126",
    "translation_credit": "No literary translation; Scriptorium uses OCRE object data.",
    "context_hint": "Mass-produced official object; minting and circulation are distinct from individual reception.",
    "language_hint": "Expand abbreviations only after recording the legend exactly.",
    "analytic_hint": "Treat imagery and legend as issued communication; audience response requires separate evidence.",
    "scaffold": [
      "What is physically encoded?",
      "What is an iconographic interpretation?",
      "What would circulation data add?"
    ],
    "tags": [
      "coin",
      "numismatics",
      "imperial-image",
      "circulation"
    ],
    "recommended_modules": [
      "m04",
      "m05",
      "m10",
      "m11",
      "m13",
      "m14",
      "m21"
    ]
  },
  {
    "id": "ocre_aug_220",
    "primary": true,
    "ready": true,
    "source_type": "coin",
    "language": "material",
    "title": "Denarius: RIC I² Augustus 220",
    "author": "Roman mint authority",
    "canonical_ref": "RIC I² Augustus 220",
    "period": "AD 13–14",
    "place": "Lugdunum",
    "original_text": "Legend: PONTIF MAXIM. Type: Seated female figure holding branch and sceptre.",
    "translation_text": "Object record: preserve the legend, denomination, mint, metal and iconographic type before interpreting the political message.",
    "original_source_name": "Online Coins of the Roman Empire (OCRE)",
    "original_source_url": "https://www.numismatics.org/ocre/id/ric.1%282%29.aug.220",
    "translation_source_name": "OCRE typological/object record",
    "translation_source_url": "https://www.numismatics.org/ocre/id/ric.1%282%29.aug.220",
    "translation_credit": "No literary translation; Scriptorium uses OCRE object data.",
    "context_hint": "Mass-produced official object; minting and circulation are distinct from individual reception.",
    "language_hint": "Expand abbreviations only after recording the legend exactly.",
    "analytic_hint": "Treat imagery and legend as issued communication; audience response requires separate evidence.",
    "scaffold": [
      "What is physically encoded?",
      "What is an iconographic interpretation?",
      "What would circulation data add?"
    ],
    "tags": [
      "coin",
      "numismatics",
      "imperial-image",
      "circulation"
    ],
    "recommended_modules": [
      "m04",
      "m05",
      "m10",
      "m11",
      "m13",
      "m14",
      "m21"
    ]
  },
  {
    "id": "ocre_aug_160",
    "primary": true,
    "ready": true,
    "source_type": "coin",
    "language": "material",
    "title": "As: RIC I² Augustus 160",
    "author": "Roman mint authority",
    "canonical_ref": "RIC I² Augustus 160",
    "period": "AD 10–14",
    "place": "Nemausus",
    "original_text": "Legend: COL NEM. Type: Crocodile chained to palm; Augustus and Agrippa on obverse.",
    "translation_text": "Object record: preserve the legend, denomination, mint, metal and iconographic type before interpreting the political message.",
    "original_source_name": "Online Coins of the Roman Empire (OCRE)",
    "original_source_url": "https://numismatics.org/ocre/id/ric.1%282%29.aug.160",
    "translation_source_name": "OCRE typological/object record",
    "translation_source_url": "https://numismatics.org/ocre/id/ric.1%282%29.aug.160",
    "translation_credit": "No literary translation; Scriptorium uses OCRE object data.",
    "context_hint": "Mass-produced official object; minting and circulation are distinct from individual reception.",
    "language_hint": "Expand abbreviations only after recording the legend exactly.",
    "analytic_hint": "Treat imagery and legend as issued communication; audience response requires separate evidence.",
    "scaffold": [
      "What is physically encoded?",
      "What is an iconographic interpretation?",
      "What would circulation data add?"
    ],
    "tags": [
      "coin",
      "numismatics",
      "imperial-image",
      "circulation"
    ],
    "recommended_modules": [
      "m04",
      "m05",
      "m10",
      "m11",
      "m13",
      "m14",
      "m21"
    ]
  },
  {
    "id": "ocre_aug_256",
    "primary": true,
    "ready": true,
    "source_type": "coin",
    "language": "material",
    "title": "Denarius: RIC I² Augustus 256",
    "author": "Roman mint authority",
    "canonical_ref": "RIC I² Augustus 256",
    "period": "32–29 BC",
    "place": "uncertain Italian mint",
    "original_text": "Legend: CAESAR DIVI F. Type: Victory bust; Neptune with globe, aplustre and spear.",
    "translation_text": "Object record: preserve the legend, denomination, mint, metal and iconographic type before interpreting the political message.",
    "original_source_name": "Online Coins of the Roman Empire (OCRE)",
    "original_source_url": "https://numismatics.org/ocre/id/ric.1%282%29.aug.256",
    "translation_source_name": "OCRE typological/object record",
    "translation_source_url": "https://numismatics.org/ocre/id/ric.1%282%29.aug.256",
    "translation_credit": "No literary translation; Scriptorium uses OCRE object data.",
    "context_hint": "Mass-produced official object; minting and circulation are distinct from individual reception.",
    "language_hint": "Expand abbreviations only after recording the legend exactly.",
    "analytic_hint": "Treat imagery and legend as issued communication; audience response requires separate evidence.",
    "scaffold": [
      "What is physically encoded?",
      "What is an iconographic interpretation?",
      "What would circulation data add?"
    ],
    "tags": [
      "coin",
      "numismatics",
      "imperial-image",
      "circulation"
    ],
    "recommended_modules": [
      "m04",
      "m05",
      "m10",
      "m11",
      "m13",
      "m14",
      "m21"
    ]
  },
  {
    "id": "ocre_tib_30",
    "primary": true,
    "ready": true,
    "source_type": "coin",
    "language": "material",
    "title": "Denarius: RIC I² Tiberius 30",
    "author": "Roman mint authority",
    "canonical_ref": "RIC I² Tiberius 30",
    "period": "AD 14–37",
    "place": "Lugdunum",
    "original_text": "Legend: PONTIF MAXIM. Type: Seated female figure with branch and sceptre.",
    "translation_text": "Object record: preserve the legend, denomination, mint, metal and iconographic type before interpreting the political message.",
    "original_source_name": "Online Coins of the Roman Empire (OCRE)",
    "original_source_url": "https://numismatics.org/ocre/id/ric.1%282%29.tib.30",
    "translation_source_name": "OCRE typological/object record",
    "translation_source_url": "https://numismatics.org/ocre/id/ric.1%282%29.tib.30",
    "translation_credit": "No literary translation; Scriptorium uses OCRE object data.",
    "context_hint": "Mass-produced official object; minting and circulation are distinct from individual reception.",
    "language_hint": "Expand abbreviations only after recording the legend exactly.",
    "analytic_hint": "Treat imagery and legend as issued communication; audience response requires separate evidence.",
    "scaffold": [
      "What is physically encoded?",
      "What is an iconographic interpretation?",
      "What would circulation data add?"
    ],
    "tags": [
      "coin",
      "numismatics",
      "imperial-image",
      "circulation"
    ],
    "recommended_modules": [
      "m04",
      "m05",
      "m10",
      "m11",
      "m13",
      "m14",
      "m21"
    ]
  },
  {
    "id": "ocre_nero_101",
    "primary": true,
    "ready": true,
    "source_type": "coin",
    "language": "material",
    "title": "Sestertius: RIC I² Nero 101",
    "author": "Roman mint authority",
    "canonical_ref": "RIC I² Nero 101",
    "period": "AD 62–68",
    "place": "Rome",
    "original_text": "Legend: CONG II DAT POP. Type: Imperial distribution scene with citizens, Minerva and Liberalitas.",
    "translation_text": "Object record: preserve the legend, denomination, mint, metal and iconographic type before interpreting the political message.",
    "original_source_name": "Online Coins of the Roman Empire (OCRE)",
    "original_source_url": "https://numismatics.org/ocre/id/ric.1%282%29.ner.101",
    "translation_source_name": "OCRE typological/object record",
    "translation_source_url": "https://numismatics.org/ocre/id/ric.1%282%29.ner.101",
    "translation_credit": "No literary translation; Scriptorium uses OCRE object data.",
    "context_hint": "Mass-produced official object; minting and circulation are distinct from individual reception.",
    "language_hint": "Expand abbreviations only after recording the legend exactly.",
    "analytic_hint": "Treat imagery and legend as issued communication; audience response requires separate evidence.",
    "scaffold": [
      "What is physically encoded?",
      "What is an iconographic interpretation?",
      "What would circulation data add?"
    ],
    "tags": [
      "coin",
      "numismatics",
      "imperial-image",
      "circulation"
    ],
    "recommended_modules": [
      "m04",
      "m05",
      "m10",
      "m11",
      "m13",
      "m14",
      "m21"
    ]
  },
  {
    "id": "ocre_nero_269",
    "primary": true,
    "ready": true,
    "source_type": "coin",
    "language": "material",
    "title": "Sestertius: RIC I² Nero 269",
    "author": "Roman mint authority",
    "canonical_ref": "RIC I² Nero 269",
    "period": "AD 62–68",
    "place": "Rome",
    "original_text": "Legend: PACE P R TERRA MARIQ PARTA IANVM CLVSIT S C. Type: Temple of Janus with closed doors.",
    "translation_text": "Object record: preserve the legend, denomination, mint, metal and iconographic type before interpreting the political message.",
    "original_source_name": "Online Coins of the Roman Empire (OCRE)",
    "original_source_url": "https://numismatics.org/ocre/id/ric.1%282%29.ner.269",
    "translation_source_name": "OCRE typological/object record",
    "translation_source_url": "https://numismatics.org/ocre/id/ric.1%282%29.ner.269",
    "translation_credit": "No literary translation; Scriptorium uses OCRE object data.",
    "context_hint": "Mass-produced official object; minting and circulation are distinct from individual reception.",
    "language_hint": "Expand abbreviations only after recording the legend exactly.",
    "analytic_hint": "Treat imagery and legend as issued communication; audience response requires separate evidence.",
    "scaffold": [
      "What is physically encoded?",
      "What is an iconographic interpretation?",
      "What would circulation data add?"
    ],
    "tags": [
      "coin",
      "numismatics",
      "imperial-image",
      "circulation"
    ],
    "recommended_modules": [
      "m04",
      "m05",
      "m10",
      "m11",
      "m13",
      "m14",
      "m21"
    ]
  },
  {
    "id": "ocre_trajan_318",
    "primary": true,
    "ready": true,
    "source_type": "coin",
    "language": "material",
    "title": "Denarius: RIC II Trajan 318",
    "author": "Roman mint authority",
    "canonical_ref": "RIC II Trajan 318",
    "period": "AD 114",
    "place": "Rome",
    "original_text": "Legend: P M TR P COS VI P P S P Q R FORT RED. Type: Fortuna with rudder and cornucopia.",
    "translation_text": "Object record: preserve the legend, denomination, mint, metal and iconographic type before interpreting the political message.",
    "original_source_name": "Online Coins of the Roman Empire (OCRE)",
    "original_source_url": "https://numismatics.org/ocre/id/ric.2.tr.318_denarius",
    "translation_source_name": "OCRE typological/object record",
    "translation_source_url": "https://numismatics.org/ocre/id/ric.2.tr.318_denarius",
    "translation_credit": "No literary translation; Scriptorium uses OCRE object data.",
    "context_hint": "Mass-produced official object; minting and circulation are distinct from individual reception.",
    "language_hint": "Expand abbreviations only after recording the legend exactly.",
    "analytic_hint": "Treat imagery and legend as issued communication; audience response requires separate evidence.",
    "scaffold": [
      "What is physically encoded?",
      "What is an iconographic interpretation?",
      "What would circulation data add?"
    ],
    "tags": [
      "coin",
      "numismatics",
      "imperial-image",
      "circulation"
    ],
    "recommended_modules": [
      "m04",
      "m05",
      "m10",
      "m11",
      "m13",
      "m14",
      "m21"
    ]
  },
  {
    "id": "tac_agric_30_6",
    "primary": true,
    "ready": true,
    "source_type": "literary",
    "language": "lat",
    "title": "Calgacus' speech on Roman imperialism",
    "author": "Tacitus",
    "canonical_ref": "Tac. Agr. 30.6",
    "period": "c. AD 98",
    "place": "Britain (narrative setting)",
    "original_text": "auferre trucidare rapere falsis nominibus imperium, atque ubi solitudinem faciunt, pacem appellant.",
    "translation_text": "They plunder, slaughter and seize, call it empire by false names, and where they make a wasteland they call it peace.",
    "original_source_name": "Perseus — Furneaux Latin edition",
    "original_source_url": "https://www.perseus.tufts.edu/hopper/text?doc=Perseus%3Atext%3A1999.02.0084%3Achapter%3D30%3Asection%3D6",
    "translation_source_name": "Perseus — Church & Brodribb translation",
    "translation_source_url": "https://www.perseus.tufts.edu/hopper/text?doc=Perseus%3Atext%3A1999.02.0081%3Achapter%3D30",
    "translation_credit": "Scriptorium working translation checked against Church & Brodribb.",
    "context_hint": "A Roman historian composes a speech for a British leader. It is not a transcript.",
    "language_hint": "The triad of infinitives and antithesis are rhetorical construction.",
    "analytic_hint": "Excellent evidence for Tacitean critique; much weaker as verbatim Caledonian opinion.",
    "scaffold": [
      "Whose voice is mediated?",
      "What literary function does the speech serve?",
      "Which claim is about Tacitus rather than Calgacus?"
    ],
    "tags": [
      "imperialism",
      "speech",
      "Tacitus",
      "rhetoric"
    ],
    "recommended_modules": [
      "m05",
      "m07",
      "m09",
      "m11",
      "m16",
      "m17",
      "m21"
    ]
  },
  {
    "id": "tac_ann_1_1",
    "primary": true,
    "ready": true,
    "source_type": "literary",
    "language": "lat",
    "title": "Tacitus on writing imperial history",
    "author": "Tacitus",
    "canonical_ref": "Tac. Ann. 1.1",
    "period": "early 2nd c. AD",
    "place": "Rome",
    "original_text": "urbem Romam a principio reges habuere ... Tiberii Gaique et Claudii ac Neronis res ... ob metum falsae, postquam occiderant recentibus odiis compositae sunt.",
    "translation_text": "Tacitus claims that accounts of living emperors were distorted by fear and posthumous accounts by recent hatred.",
    "original_source_name": "Perseus — Latin focus for Annals 1.1",
    "original_source_url": "https://www.perseus.tufts.edu/hopper/text?doc=Tac.+Ann.+1.1&redirect=true",
    "translation_source_name": "Perseus — Church & Brodribb translation",
    "translation_source_url": "https://www.perseus.tufts.edu/hopper/text?doc=Perseus%3Atext%3A1999.02.0078",
    "translation_credit": "Scriptorium working translation checked against Perseus English.",
    "context_hint": "Authorial program statement about bias in historical writing.",
    "language_hint": "Tacitus frames competing distortions before claiming his own stance.",
    "analytic_hint": "An author's claim to impartiality is itself evidence to evaluate, not a guarantee.",
    "scaffold": [
      "Which biases does Tacitus identify?",
      "How does he position himself?",
      "How would you test his claim of distance?"
    ],
    "tags": [
      "historiography",
      "bias",
      "Tacitus",
      "authorial-position"
    ],
    "recommended_modules": [
      "m05",
      "m06",
      "m07",
      "m09",
      "m11",
      "m17",
      "m21"
    ]
  },
  {
    "id": "sall_cat_10",
    "primary": true,
    "ready": true,
    "source_type": "literary",
    "language": "lat",
    "title": "Sallust's moral explanation of Roman decline",
    "author": "Sallust",
    "canonical_ref": "Sall. Cat. 10.1–3",
    "period": "1st c. BC",
    "place": "Rome",
    "original_text": "sed ubi labore atque iustitia res publica crevit ... igitur primo pecuniae, deinde imperi cupido crevit.",
    "translation_text": "Sallust says that after Roman power grew, desire first for money and then for command increased.",
    "original_source_name": "Perseus — Ahlberg Latin edition",
    "original_source_url": "https://www.perseus.tufts.edu/hopper/text?doc=Perseus%3Atext%3A2008.01.0002%3Atext%3DCat.%3Achapter%3D10",
    "translation_source_name": "Perseus — Watson English translation",
    "translation_source_url": "https://www.perseus.tufts.edu/hopper/text?doc=Perseus%3Atext%3A1999.02.0124",
    "translation_credit": "Scriptorium working translation checked against public-domain Perseus translation.",
    "context_hint": "Moralising historiography offers a causal narrative of decline.",
    "language_hint": "Abstract moral nouns do explanatory work; they are not directly measured variables.",
    "analytic_hint": "Turn the moral narrative into testable mechanisms before accepting it as causal explanation.",
    "scaffold": [
      "What causes are proposed?",
      "What evidence could operationalise them?",
      "Which rival explanation competes?"
    ],
    "tags": [
      "decline",
      "causality",
      "morality",
      "historiography"
    ],
    "recommended_modules": [
      "m03",
      "m07",
      "m09",
      "m11",
      "m12",
      "m17",
      "m21"
    ]
  },
  {
    "id": "suet_aug_28",
    "primary": true,
    "ready": true,
    "source_type": "biography",
    "language": "lat",
    "title": "Suetonius on Augustus and restoring the Republic",
    "author": "Suetonius",
    "canonical_ref": "Suet. Aug. 28",
    "period": "early 2nd c. AD",
    "place": "Rome",
    "original_text": "de reddenda re p. bis cogitavit ... sed reputans et se privatum non sine periculo fore ... retinuit.",
    "translation_text": "Suetonius says Augustus twice considered restoring the Republic but retained control after weighing danger to himself and the state.",
    "original_source_name": "Perseus — Suetonius, Divus Augustus",
    "original_source_url": "https://www.perseus.tufts.edu/hopper/text?doc=Suet.+Aug.+28",
    "translation_source_name": "Perseus — Alexander Thomson translation",
    "translation_source_url": "https://www.perseus.tufts.edu/hopper/text?doc=Suet.+Aug.+28",
    "translation_credit": "Scriptorium working translation checked against Thomson.",
    "context_hint": "Imperial biography written more than a century after the constitutional settlement.",
    "language_hint": "Reported intentions are mediated by biographical tradition.",
    "analytic_hint": "Distinguish evidence for later memory of Augustus from direct evidence for his private motives.",
    "scaffold": [
      "What is action?",
      "What is reported intention?",
      "What chronological distance matters?",
      "What contemporary source could compare?"
    ],
    "tags": [
      "biography",
      "Augustus",
      "Republic",
      "motives"
    ],
    "recommended_modules": [
      "m05",
      "m10",
      "m11",
      "m12",
      "m17",
      "m21"
    ]
  },
  {
    "id": "arist_athpol_42_1",
    "primary": true,
    "ready": true,
    "source_type": "literary",
    "language": "grc",
    "title": "Citizenship and age-class organization",
    "author": "Aristotle",
    "canonical_ref": "Aristot. Ath. Pol. 42.1",
    "period": "4th c. BC",
    "place": "Athens",
    "original_text": "μετέχει δὲ τῆς πολιτείας τοὺς ἐξ ἀμφοῖν γεγονότας ἀστῶν· ἐγγράφονται δ' εἰς τοὺς δημότας ὀκτωκαιδεκαετεῖς γεγονότες.",
    "translation_text": "Those born from two citizen parents share in the constitution; they are enrolled among the demesmen when they have reached the age of eighteen.",
    "original_source_name": "Perseus Digital Library — Greek text",
    "original_source_url": "https://www.perseus.tufts.edu/hopper/text?doc=Aristot.+Ath.+Pol.+42.1",
    "translation_source_name": "Perseus Digital Library — English translation",
    "translation_source_url": "https://www.perseus.tufts.edu/hopper/text?doc=Aristot.+Ath.+Pol.+42.1&fromdoc=Perseus:text:1999.01.0046",
    "translation_credit": "Scriptorium working translation checked against Perseus.",
    "context_hint": "Institutional description; consider whether Aristotle describes norm, practice, or an idealized system.",
    "language_hint": "Politeia can mean constitution/order of the state, not simply “politics”.",
    "analytic_hint": "Good for operationalizing citizenship, but insufficient for lived civic practice on its own.",
    "scaffold": [
      "What is the formal rule?",
      "What remains unknown about actual practice?",
      "Which complementary source type could test practice?"
    ],
    "tags": [
      "citizenship",
      "constitution",
      "democracy",
      "law",
      "norm-practice",
      "governance"
    ],
    "recommended_modules": [
      "m02",
      "m03",
      "m04",
      "m05",
      "m10",
      "m11",
      "m20"
    ]
  },
  {
    "id": "demosthenes_24_20",
    "primary": true,
    "ready": true,
    "source_type": "speech",
    "language": "grc",
    "title": "Why laws and decrees must be distinguished",
    "author": "Demosthenes",
    "canonical_ref": "Dem. 24.20",
    "period": "4th c. BC",
    "place": "Athens",
    "original_text": "νόμος μὲν γάρ ἐστιν ὃ πάντας ὁμοίως δεῖ κυρίως ἔχειν, ψήφισμα δ' ὃ περὶ τῶν παρόντων ἐστίν.",
    "translation_text": "A law is something that must have authoritative force equally for all, whereas a decree concerns the matter at hand.",
    "original_source_name": "Perseus Digital Library — Greek text",
    "original_source_url": "https://www.perseus.tufts.edu/hopper/text?doc=Dem.+24.20",
    "translation_source_name": "Perseus Digital Library — English translation",
    "translation_source_url": "https://www.perseus.tufts.edu/hopper/text?doc=Dem.+24.20&fromdoc=Perseus:text:1999.01.0073",
    "translation_credit": "Scriptorium working translation checked against Perseus.",
    "context_hint": "Forensic rhetoric within a specific case. The distinction is rhetorically useful but must still be contextualized.",
    "language_hint": "Nomos and psephisma are technical institutional terms.",
    "analytic_hint": "Excellent for method and concept work: formal categories are not yet evidence of consistent practice.",
    "scaffold": [
      "What distinction is being drawn?",
      "Why is that distinction useful for historians?",
      "Where might rhetoric exaggerate the clarity of the categories?"
    ],
    "tags": [
      "law",
      "decree",
      "procedure",
      "politics",
      "institutions",
      "norm-practice"
    ],
    "recommended_modules": [
      "m03",
      "m05",
      "m08",
      "m11",
      "m14",
      "m21"
    ]
  },
  {
    "id": "xenophon_poroi_4_17",
    "primary": true,
    "ready": true,
    "source_type": "literary",
    "language": "grc",
    "title": "Proposal to attract metics to Athens",
    "author": "Xenophon",
    "canonical_ref": "Xen. Vect. 4.17",
    "period": "4th c. BC",
    "place": "Athens",
    "original_text": "εἰ δὲ καὶ μετοίκοις θεραπεία τις προσγένοιτο, ἔμοιγε δοκεῖ πλείους τε ἂν ἐγγίγνεσθαι καὶ τὰς προσόδους αὐξήσεσθαι.",
    "translation_text": "If some additional consideration were granted also to metics, it seems to me that they would become more numerous and that the revenues would increase.",
    "original_source_name": "Perseus Digital Library — Greek text",
    "original_source_url": "https://www.perseus.tufts.edu/hopper/text?doc=Xen.+Vect.+4.17",
    "translation_source_name": "Perseus Digital Library — English translation",
    "translation_source_url": "https://www.perseus.tufts.edu/hopper/text?doc=Xen.+Vect.+4.17&fromdoc=Perseus:text:1999.01.0210",
    "translation_credit": "Scriptorium working translation checked against Perseus.",
    "context_hint": "Programmatic proposal, not an administrative record of what Athens actually implemented.",
    "language_hint": "Prosodoi means revenues/income.",
    "analytic_hint": "Useful for separating policy proposal from evidence of economic reality.",
    "scaffold": [
      "Is this description or recommendation?",
      "What population is targeted?",
      "What source would show actual implementation?"
    ],
    "tags": [
      "economy",
      "migration",
      "taxation",
      "metics",
      "policy",
      "norm-practice"
    ],
    "recommended_modules": [
      "m01",
      "m02",
      "m04",
      "m08",
      "m10",
      "m17"
    ]
  },
  {
    "id": "lysias_12_4",
    "primary": true,
    "ready": true,
    "source_type": "speech",
    "language": "grc",
    "title": "The Thirty seize citizens without trial",
    "author": "Lysias",
    "canonical_ref": "Lys. 12.4",
    "period": "4th c. BC",
    "place": "Athens",
    "original_text": "οἱ δὲ τριάκοντα πολλοὺς μὲν ἄνευ δίκης ἀπέκτειναν, πολλοὺς δ' ἐξέβαλον τῆς πόλεως.",
    "translation_text": "The Thirty put many to death without trial and drove many others out of the city.",
    "original_source_name": "Perseus Digital Library — Greek text",
    "original_source_url": "https://www.perseus.tufts.edu/hopper/text?doc=Lys.+12.4",
    "translation_source_name": "Perseus Digital Library — English translation",
    "translation_source_url": "https://www.perseus.tufts.edu/hopper/text?doc=Lys.+12.4&fromdoc=Perseus:text:1999.01.0158",
    "translation_credit": "Scriptorium working translation checked against Perseus.",
    "context_hint": "Court speech by an involved party. Strongly perspectival and therefore ideal for source criticism.",
    "language_hint": "Notice the compression and accusatory rhythm of the sentence.",
    "analytic_hint": "Important for debates on political violence, but numbers and generalization need corroboration.",
    "scaffold": [
      "What does the speaker want the jury to believe?",
      "Which part may still preserve a historical core?",
      "What corroboration would you need?"
    ],
    "tags": [
      "violence",
      "politics",
      "rhetoric",
      "trial",
      "tyranny",
      "representation"
    ],
    "recommended_modules": [
      "m05",
      "m06",
      "m10",
      "m11",
      "m17",
      "m22"
    ]
  },
  {
    "id": "andocides_1_81",
    "primary": true,
    "ready": true,
    "source_type": "speech",
    "language": "grc",
    "title": "The amnesty and civic reconciliation",
    "author": "Andocides",
    "canonical_ref": "Andoc. 1.81",
    "period": "4th c. BC",
    "place": "Athens",
    "original_text": "ὅρκους ὤμοσαν μὴ μνησικακήσειν ἀλλήλοις.",
    "translation_text": "They swore oaths not to remember past wrongs against one another.",
    "original_source_name": "Perseus Digital Library — Greek text",
    "original_source_url": "https://www.perseus.tufts.edu/hopper/text?doc=Andoc.+1.81",
    "translation_source_name": "Perseus Digital Library — English translation",
    "translation_source_url": "https://www.perseus.tufts.edu/hopper/text?doc=Andoc.+1.81&fromdoc=Perseus:text:1999.01.0177",
    "translation_credit": "Scriptorium working translation checked against Perseus.",
    "context_hint": "A compressed formulation of amnesty logic. Normative promise and practical enforcement are separate questions.",
    "language_hint": "Mnēsikakein concerns “remembering wrongs / bearing grudges”.",
    "analytic_hint": "Useful for norm-versus-practice analysis and for defining political reconciliation.",
    "scaffold": [
      "What is the norm?",
      "What evidence would show compliance or failure?",
      "How limited is the phrase itself?"
    ],
    "tags": [
      "amnesty",
      "law",
      "politics",
      "reconciliation",
      "norm-practice"
    ],
    "recommended_modules": [
      "m03",
      "m05",
      "m10",
      "m14",
      "m18"
    ]
  },
  {
    "id": "polyb_6_11_11",
    "primary": true,
    "ready": true,
    "source_type": "literary",
    "language": "grc",
    "title": "The Roman constitution as mixed",
    "author": "Polybius",
    "canonical_ref": "Polyb. 6.11.11",
    "period": "2nd c. BC",
    "place": "Rome",
    "original_text": "ἐκ δὲ τούτων ἁπάντων ἐγένετο τὸ πολίτευμα μικτὸν καὶ κατὰ πάντα θαυμάσιον.",
    "translation_text": "From all these elements there resulted a mixed constitution, admirable in every respect.",
    "original_source_name": "Perseus Digital Library — Greek text",
    "original_source_url": "https://www.perseus.tufts.edu/hopper/text?doc=Polyb.+6.11.11",
    "translation_source_name": "Perseus Digital Library — English translation",
    "translation_source_url": "https://www.perseus.tufts.edu/hopper/text?doc=Polyb.+6.11.11&fromdoc=Perseus:text:1999.01.0234",
    "translation_credit": "Scriptorium working translation checked against Perseus.",
    "context_hint": "Analytical model by a Greek historian explaining Roman success.",
    "language_hint": "Mixed constitution is an interpretive model, not a Roman self-description.",
    "analytic_hint": "Ideal for theory and model translation: descriptive power does not remove interpretive choices.",
    "scaffold": [
      "What model is Polybius using?",
      "How could you operationalize it historically?",
      "What would count as disconfirming evidence?"
    ],
    "tags": [
      "Republic",
      "constitution",
      "theory",
      "politics",
      "model",
      "Rome"
    ],
    "recommended_modules": [
      "m06",
      "m07",
      "m09",
      "m11",
      "m20",
      "m22"
    ]
  },
  {
    "id": "cicero_verr_2_3_163",
    "primary": true,
    "ready": true,
    "source_type": "speech",
    "language": "lat",
    "title": "Provincial grain exactions under Verres",
    "author": "Cicero",
    "canonical_ref": "Cic. Verr. 2.3.163",
    "period": "1st c. BC",
    "place": "Sicily / Rome",
    "original_text": "frumentum non modo imperatum, sed etiam ereptum atque ablatum esse dicunt.",
    "translation_text": "They say that grain was not merely requisitioned, but actually seized and carried off.",
    "original_source_name": "Perseus Digital Library — Latin text",
    "original_source_url": "https://www.perseus.tufts.edu/hopper/text?doc=Cic.+Ver.+2.3.163",
    "translation_source_name": "Perseus Digital Library — English translation",
    "translation_source_url": "https://www.perseus.tufts.edu/hopper/text?doc=Cic.+Ver.+2.3.163&fromdoc=Perseus:text:1999.02.0018",
    "translation_credit": "Scriptorium working translation checked against Perseus.",
    "context_hint": "Accusatory oratory. Distinguish forensic amplification from possible administrative realities.",
    "language_hint": "Imperatum suggests official demand; ereptum implies violent seizure.",
    "analytic_hint": "Strong for analyzing rhetoric around governance and exploitation, weaker for exact quantification alone.",
    "scaffold": [
      "Which administrative practice is alleged?",
      "What rhetorical escalation is visible?",
      "What other evidence could test the claim?"
    ],
    "tags": [
      "economy",
      "province",
      "governance",
      "rhetoric",
      "taxation",
      "norm-practice"
    ],
    "recommended_modules": [
      "m05",
      "m08",
      "m10",
      "m11",
      "m17",
      "m22"
    ]
  },
  {
    "id": "res_gestae_34",
    "primary": true,
    "ready": true,
    "source_type": "inscription",
    "language": "lat",
    "title": "Augustus restores the Republic?",
    "author": "Augustus",
    "canonical_ref": "RGDA 34.1–3",
    "period": "AD 14 copy of earlier text",
    "place": "Ancyra / empire-wide circulation",
    "original_text": "post id tempus auctoritate omnibus praestiti, potestatis autem nihilo amplius habui quam ceteri qui mihi quoque in magistratu conlegae fuerunt.",
    "translation_text": "After that time I excelled all in influence, but I possessed no more official power than the others who were my colleagues in each magistracy.",
    "original_source_name": "LacusCurtius — Latin text of the Res Gestae",
    "original_source_url": "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Augustus/Res_Gestae/34*.html",
    "translation_source_name": "LacusCurtius — English translation",
    "translation_source_url": "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Augustus/Res_Gestae/34*.html",
    "translation_credit": "Scriptorium working translation checked against the standard English rendering on LacusCurtius.",
    "context_hint": "Official self-representation of rule. Separate constitutional language from political reality.",
    "language_hint": "Auctoritas and potestas are not interchangeable.",
    "analytic_hint": "Classic source for representation, ideology, and the limits of official self-description.",
    "scaffold": [
      "What distinction does Augustus make?",
      "Why is this politically useful?",
      "What sources could test the claim?"
    ],
    "tags": [
      "Augustus",
      "princeps",
      "power",
      "representation",
      "inscription",
      "imperial-image"
    ],
    "recommended_modules": [
      "m05",
      "m09",
      "m10",
      "m11",
      "m17",
      "m18",
      "m22"
    ]
  },
  {
    "id": "dig_1_5_17",
    "primary": true,
    "ready": true,
    "source_type": "literary",
    "language": "lat",
    "title": "Legal division of persons",
    "author": "Florentinus / Digest",
    "canonical_ref": "Dig. 1.5.3 / 1.5.5 tradition",
    "period": "6th c. AD compilation of classical juristic material",
    "place": "Roman legal tradition",
    "original_text": "libertas est naturalis facultas eius quod cuique facere libet, nisi si quid vi aut iure prohibetur. servitus est constitutio iuris gentium.",
    "translation_text": "Freedom is the natural capacity to do what each person pleases, unless something is prevented by force or law. Slavery is an institution of the law of nations.",
    "original_source_name": "The Latin Library / Digest excerpt",
    "original_source_url": "https://www.thelatinlibrary.com/justinian/digest1.shtml",
    "translation_source_name": "Adapted standard English legal translation",
    "translation_source_url": "https://droitromain.univ-grenoble-alpes.fr/Corpus/digest.htm",
    "translation_credit": "Scriptorium working translation checked against standard English Digest translations.",
    "context_hint": "Normative juristic definition, not a social survey.",
    "language_hint": "Definitions are precise but highly abstract.",
    "analytic_hint": "Useful for conceptualization and category work; weak as standalone evidence for social practice.",
    "scaffold": [
      "What is being defined?",
      "Is this descriptive or normative?",
      "What social evidence would you need beyond the definition?"
    ],
    "tags": [
      "law",
      "status",
      "slavery",
      "concept",
      "norm-practice"
    ],
    "recommended_modules": [
      "m03",
      "m05",
      "m09",
      "m11",
      "m20"
    ]
  },
  {
    "id": "claudia_severa_ii_291",
    "primary": true,
    "ready": true,
    "source_type": "writing_tablet",
    "language": "lat",
    "title": "Birthday invitation from Claudia Severa to Lepidina",
    "author": "Claudia Severa",
    "canonical_ref": "Tab. Vindol. 291",
    "period": "c. AD 100",
    "place": "Vindolanda",
    "original_text": "Claudia Severa Lepidinae suae salutem. iii Idus Septembres, soror, ad diem sollemnem natalem meum rogo libenter facias ut venias ad nos.",
    "translation_text": "Claudia Severa to her Lepidina, greetings. On 11 September, sister, for the celebration of my birthday, I ask that you kindly make sure to come to us.",
    "original_source_name": "Vindolanda Tablets Online",
    "original_source_url": "https://vindolanda.csad.ox.ac.uk/TVII-291",
    "translation_source_name": "Vindolanda Tablets Online — English",
    "translation_source_url": "https://vindolanda.csad.ox.ac.uk/TVII-291",
    "translation_credit": "Scriptorium working translation checked against Vindolanda Tablets Online.",
    "context_hint": "Private social correspondence preserved on a wooden writing tablet.",
    "language_hint": "A rare glimpse of informal elite female communication.",
    "analytic_hint": "Excellent as a private-voice control source against official texts.",
    "scaffold": [
      "What makes this source socially valuable?",
      "What remains unrepresentative about it?",
      "How could you pair it with public evidence?"
    ],
    "tags": [
      "letter",
      "women",
      "social-network",
      "private",
      "writing-tablet",
      "Rome"
    ],
    "recommended_modules": [
      "m04",
      "m05",
      "m10",
      "m11",
      "m14",
      "m21"
    ]
  },
  {
    "id": "p_oxy_3313",
    "primary": true,
    "ready": true,
    "source_type": "papyrus_letter",
    "language": "grc",
    "title": "Tax receipt on papyrus",
    "author": "Local administration",
    "canonical_ref": "P.Oxy. 3313",
    "period": "Roman Egypt",
    "place": "Oxyrhynchus",
    "original_text": "ἀπέσχηκα παρὰ σοῦ τὸ δημόσιον ...",
    "translation_text": "I have received from you the public tax ...",
    "original_source_name": "Papyri.info record",
    "original_source_url": "https://papyri.info/ddbdp/p.oxy;47;3313",
    "translation_source_name": "Papyri.info / record description",
    "translation_source_url": "https://papyri.info/ddbdp/p.oxy;47;3313",
    "translation_credit": "Scriptorium working translation based on the published record description.",
    "context_hint": "Documentary papyrus. Sparse wording, but strong for concrete administrative practice.",
    "language_hint": "Formulaic receipt language often contains little interpretation.",
    "analytic_hint": "Very useful for testing whether broader claims about taxation match documentary practice.",
    "scaffold": [
      "What concrete transaction is documented?",
      "What remains unknown?",
      "Why is documentary brevity also a strength?"
    ],
    "tags": [
      "taxation",
      "economy",
      "documentary",
      "papyrus",
      "procedure",
      "norm-practice"
    ],
    "recommended_modules": [
      "m04",
      "m05",
      "m08",
      "m10",
      "m11",
      "m21"
    ]
  },
  {
    "id": "ig_ii2_43",
    "primary": true,
    "ready": true,
    "source_type": "inscription",
    "language": "grc",
    "title": "Decree concerning an alliance",
    "author": "Athenian People",
    "canonical_ref": "IG II² 43",
    "period": "4th c. BC",
    "place": "Athens",
    "original_text": "ἔδοξεν τῷ δήμῳ ... συμμαχίαν εἶναι καὶ φιλίαν ...",
    "translation_text": "It was resolved by the People ... that there shall be alliance and friendship ...",
    "original_source_name": "Attic Inscriptions Online — Greek text",
    "original_source_url": "https://www.atticinscriptions.com/inscription/IGII2/43",
    "translation_source_name": "Attic Inscriptions Online — translation/record",
    "translation_source_url": "https://www.atticinscriptions.com/inscription/IGII2/43",
    "translation_credit": "Scriptorium working translation checked against AIO.",
    "context_hint": "Public decree formula. Be careful not to confuse enacted wording with effective diplomacy.",
    "language_hint": "Formulaic decree language often hides contested politics behind standard phrasing.",
    "analytic_hint": "Strong for institutional wording and public decision, weaker for practical enforcement.",
    "scaffold": [
      "What is formulaic?",
      "What concrete act is performed?",
      "What evidence is missing about implementation?"
    ],
    "tags": [
      "decree",
      "alliance",
      "politics",
      "law",
      "epigraphy",
      "norm-practice"
    ],
    "recommended_modules": [
      "m03",
      "m04",
      "m05",
      "m08",
      "m10",
      "m14"
    ]
  },
  {
    "id": "cil_vi_8797",
    "primary": true,
    "ready": true,
    "source_type": "funerary_inscription",
    "language": "lat",
    "title": "Funerary inscription of a freedwoman",
    "author": "Commemorators",
    "canonical_ref": "CIL VI 8797",
    "period": "Imperial Rome",
    "place": "Rome",
    "original_text": "D(is) M(anibus) ... libertae bene merenti ...",
    "translation_text": "To the spirits of the dead ... for the freedwoman, well deserving ...",
    "original_source_name": "EDCS / CIL record",
    "original_source_url": "https://db.edcs.eu/epigr/epi_url.php?s_sprache=en&p_belegstelle=CIL%2006,%2008797",
    "translation_source_name": "EDCS record / standard expansion",
    "translation_source_url": "https://db.edcs.eu/epigr/epi_url.php?s_sprache=en&p_belegstelle=CIL%2006,%2008797",
    "translation_credit": "Scriptorium working expansion and translation checked against the EDCS record.",
    "context_hint": "Commemorative epigraphy. Public self-representation by family or associates.",
    "language_hint": "Standard formulae matter, but so do the chosen identifiers (status, relation, virtue).",
    "analytic_hint": "Useful for identity and status performance, not a complete biography.",
    "scaffold": [
      "Which identities are foregrounded?",
      "Which are absent?",
      "How far may you infer lived experience?"
    ],
    "tags": [
      "funerary",
      "identity",
      "freedwoman",
      "self-representation",
      "epigraphy"
    ],
    "recommended_modules": [
      "m03",
      "m05",
      "m11",
      "m14",
      "m17",
      "m21"
    ]
  },
  {
    "id": "ocrehadrian_travel",
    "primary": true,
    "ready": true,
    "source_type": "coin",
    "language": "lat",
    "title": "Hadrian travel series: Aegyptos",
    "author": "Imperial mint",
    "canonical_ref": "RIC II Hadrian travel series, Aegyptos",
    "period": "AD 134–138",
    "place": "Rome",
    "original_text": "Obv. HADRIANVS AVG COS III P P. Rev. AEGYPTOS; Egypt reclining with ibis / sistrum motif.",
    "translation_text": "Object record: coin of Hadrian presenting the province Egypt as a personified image.",
    "original_source_name": "Online Coins of the Roman Empire — coin record",
    "original_source_url": "https://numismatics.org/ocre/results?q=fulltext%3AAEGYPTOS%20HADRIAN",
    "translation_source_name": "OCRE object data",
    "translation_source_url": "https://numismatics.org/ocre/results?q=fulltext%3AAEGYPTOS%20HADRIAN",
    "translation_credit": "Scriptorium uses OCRE object data.",
    "context_hint": "Imperial provincial personification. Analyze representational politics before historical reality.",
    "language_hint": "Coin legends and images operate together.",
    "analytic_hint": "Excellent for imperial image and representation, weak for provincial reception alone.",
    "scaffold": [
      "What is physically encoded?",
      "What province-image is constructed?",
      "What would reception evidence require?"
    ],
    "tags": [
      "coinage",
      "imperial-image",
      "Hadrian",
      "representation",
      "province",
      "coin"
    ],
    "recommended_modules": [
      "m05",
      "m09",
      "m10",
      "m11",
      "m17"
    ]
  },
  {
    "id": "ocre_nero_temple_janus",
    "primary": true,
    "ready": true,
    "source_type": "coin",
    "language": "lat",
    "title": "Nero and the closing of the Temple of Janus",
    "author": "Imperial mint",
    "canonical_ref": "RIC I² Nero 50 (type with PACE P R TERRA MARIQ PARTA IANVM CLVSIT)",
    "period": "AD 65–67",
    "place": "Rome",
    "original_text": "Rev. PACE P R TERRA MARIQ PARTA IANVM CLVSIT. Temple of Janus doors closed.",
    "translation_text": "Object record: “With peace secured for the Roman People on land and sea, he closed Janus.”",
    "original_source_name": "Online Coins of the Roman Empire — coin type",
    "original_source_url": "https://numismatics.org/ocre/id/ric.1(2).ner.50",
    "translation_source_name": "OCRE object data",
    "translation_source_url": "https://numismatics.org/ocre/id/ric.1(2).ner.50",
    "translation_credit": "Scriptorium uses OCRE object data.",
    "context_hint": "Official coin type claiming universal peace.",
    "language_hint": "The legend makes a strong totalizing claim.",
    "analytic_hint": "Perfect for studying political messaging and overclaim.",
    "scaffold": [
      "What is claimed?",
      "What genre conventions amplify the claim?",
      "What independent evidence would test it?"
    ],
    "tags": [
      "coinage",
      "peace",
      "imperial-image",
      "representation",
      "Nero",
      "coin"
    ],
    "recommended_modules": [
      "m01",
      "m05",
      "m09",
      "m10",
      "m17"
    ]
  },
  {
    "id": "ocre_vespasian_judaea",
    "primary": true,
    "ready": true,
    "source_type": "coin",
    "language": "lat",
    "title": "Judaea Capta coin type",
    "author": "Imperial mint",
    "canonical_ref": "RIC II Vespasian Judaea Capta type",
    "period": "AD 71–73",
    "place": "Rome",
    "original_text": "Rev. IVDAEA CAPTA; palm tree with mourning captive figure.",
    "translation_text": "Object record: Vespasianic victory coin proclaiming “Judaea Captured”.",
    "original_source_name": "Online Coins of the Roman Empire — coin search",
    "original_source_url": "https://numismatics.org/ocre/results?q=fulltext%3AIVDAEA%20CAPTA",
    "translation_source_name": "OCRE object data",
    "translation_source_url": "https://numismatics.org/ocre/results?q=fulltext%3AIVDAEA%20CAPTA",
    "translation_credit": "Scriptorium uses OCRE object data.",
    "context_hint": "Victory imagery compresses complex war and provincial experience into a triumphant message.",
    "language_hint": "Caption and iconography work together to frame the conquered province.",
    "analytic_hint": "Use for imperial ideology, not as a full account of the conflict.",
    "scaffold": [
      "What image of victory is presented?",
      "Whose perspective is missing?",
      "What other source types would rebalance the dossier?"
    ],
    "tags": [
      "coinage",
      "imperial-image",
      "war",
      "Judaea",
      "representation",
      "coin"
    ],
    "recommended_modules": [
      "m05",
      "m10",
      "m11",
      "m17",
      "m18"
    ]
  },
  {
    "id": "josephus_bj_6_201",
    "primary": true,
    "ready": true,
    "source_type": "literary",
    "language": "grc",
    "title": "Destruction of the Temple in Josephus",
    "author": "Josephus",
    "canonical_ref": "Jos. BJ 6.201",
    "period": "1st c. AD",
    "place": "Judaea / Rome",
    "original_text": "ὁ δὲ ναὸς πᾶς ἐμπίπραται ...",
    "translation_text": "And the whole temple was set on fire ...",
    "original_source_name": "Perseus / Greek text (if unavailable, standard Josephus online edition)",
    "original_source_url": "https://www.perseus.tufts.edu/hopper/text?doc=J.+BJ+6.201",
    "translation_source_name": "Perseus / English translation (or standard online translation)",
    "translation_source_url": "https://www.perseus.tufts.edu/hopper/text?doc=J.+BJ+6.201&fromdoc=Perseus:text:1999.01.0148",
    "translation_credit": "Scriptorium working translation checked against a standard English Josephus translation.",
    "context_hint": "Narrative historiography by an implicated author with a complex Roman context.",
    "language_hint": "Emotional compression can intensify narrative effect.",
    "analytic_hint": "Useful as a counterweight to triumphal imperial imagery.",
    "scaffold": [
      "What perspective does Josephus bring?",
      "How does narrative differ from coin propaganda?",
      "What can be cross-checked?"
    ],
    "tags": [
      "war",
      "historiography",
      "Judaea",
      "representation",
      "imperialism",
      "literary"
    ],
    "recommended_modules": [
      "m06",
      "m10",
      "m11",
      "m14",
      "m17",
      "m18"
    ]
  },
  {
    "id": "pompeii_cil_iv_5296",
    "primary": true,
    "ready": true,
    "source_type": "inscription",
    "language": "lat",
    "title": "Pompeian electoral programmata",
    "author": "Unknown wall writers",
    "canonical_ref": "CIL IV 5296",
    "period": "1st c. AD",
    "place": "Pompeii",
    "original_text": "Helvium Sabinum aed(ilem) o(ro) v(os) f(aciatis).",
    "translation_text": "I ask you to make Helvius Sabinus aedile.",
    "original_source_name": "EDR / CIL IV record",
    "original_source_url": "https://db.edcs.eu/epigr/epi_url.php?s_sprache=en&p_belegstelle=CIL%2004,%2005296",
    "translation_source_name": "EDR / standard expansion",
    "translation_source_url": "https://db.edcs.eu/epigr/epi_url.php?s_sprache=en&p_belegstelle=CIL%2004,%2005296",
    "translation_credit": "Scriptorium working expansion and translation checked against epigraphic database conventions.",
    "context_hint": "Street-level electoral inscription; informal yet public.",
    "language_hint": "Programmata are formulaic, but location and brevity matter historically.",
    "analytic_hint": "Excellent for local political communication and the limits of public writing.",
    "scaffold": [
      "Who is speaking?",
      "What action is requested?",
      "What can this not tell you about the election result?"
    ],
    "tags": [
      "politics",
      "Pompeii",
      "inscription",
      "public-writing",
      "election",
      "representation"
    ],
    "recommended_modules": [
      "m04",
      "m05",
      "m10",
      "m11",
      "m21"
    ]
  },
  {
    "id": "tab_hebana_frag",
    "primary": true,
    "ready": true,
    "source_type": "inscription",
    "language": "lat",
    "title": "Tabula Hebana on honours for Germanicus",
    "author": "Roman senate / community copy",
    "canonical_ref": "Tabula Hebana (fragment)",
    "period": "AD 20",
    "place": "Italy",
    "original_text": "... honores Germanico Caesari decernuntur ...",
    "translation_text": "... honours are decreed for Germanicus Caesar ...",
    "original_source_name": "EDCS / inscription record",
    "original_source_url": "https://db.edcs.eu/epigr/epi_url.php?s_sprache=en&p_belegstelle=Tabula%20Hebana",
    "translation_source_name": "Published translation / record description",
    "translation_source_url": "https://db.edcs.eu/epigr/epi_url.php?s_sprache=en&p_belegstelle=Tabula%20Hebana",
    "translation_credit": "Scriptorium working translation based on standard record descriptions.",
    "context_hint": "Inscribed senatorial decree as locally displayed copy.",
    "language_hint": "Public honorific language performs consensus.",
    "analytic_hint": "Good for studying the circulation of central political decisions.",
    "scaffold": [
      "What kind of document is this?",
      "What is being publicly staged?",
      "What is lost in fragmentary preservation?"
    ],
    "tags": [
      "inscription",
      "senate",
      "honours",
      "Germanicus",
      "politics",
      "representation"
    ],
    "recommended_modules": [
      "m04",
      "m05",
      "m10",
      "m11",
      "m17"
    ]
  },
  {
    "id": "theocritus_idyll_15_22",
    "primary": true,
    "ready": true,
    "source_type": "literary",
    "language": "grc",
    "title": "Women moving through the Ptolemaic city",
    "author": "Theocritus",
    "canonical_ref": "Theoc. Id. 15.22–24",
    "period": "3rd c. BC",
    "place": "Alexandria",
    "original_text": "ὦ φίλα, μυρίος ὄχλος· πῶς διεκπεράσομαι;",
    "translation_text": "Dear friend, there is a huge crowd; how shall I get through?",
    "original_source_name": "Perseus Digital Library — Greek text",
    "original_source_url": "https://www.perseus.tufts.edu/hopper/text?doc=Theoc.+15.22",
    "translation_source_name": "Perseus Digital Library — English translation",
    "translation_source_url": "https://www.perseus.tufts.edu/hopper/text?doc=Theoc.+15.22&fromdoc=Perseus:text:1999.01.0243",
    "translation_credit": "Scriptorium working translation checked against Perseus.",
    "context_hint": "Literary mimesis with urban observation; neither raw transcript nor pure fiction.",
    "language_hint": "Attend to voice and staging.",
    "analytic_hint": "Useful for questions of urban experience and representation of everyday movement.",
    "scaffold": [
      "What kind of scene is being staged?",
      "What elements may reflect urban reality?",
      "How would you test representativeness?"
    ],
    "tags": [
      "city",
      "women",
      "Alexandria",
      "representation",
      "literary",
      "experience"
    ],
    "recommended_modules": [
      "m05",
      "m09",
      "m11",
      "m14",
      "m17"
    ]
  }
];

/* ===== v6.js ===== */
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
async function sbSignUp(){sbStatus("Maak je cloudaccount aan in Athenaeum → Instellingen → Synchronisatie.","good")}
async function sbSignIn(){sbStatus("Meld aan in Athenaeum → Instellingen → Synchronisatie. Scriptorium gebruikt daarna dezelfde sessie.","good")}
async function sbSignOut(){sbStatus("Meld af via Athenaeum → Instellingen → Synchronisatie.","good")}
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
  const pid=window.ATH_PROFILE_ID||localStorage.getItem("athenaeum_current_profile")||"";
  if(!pid||!window.AthSync)throw new Error("Open Scriptorium via Athenaeum om veilig te synchroniseren.");
  const c=window.AthSync.cfg(pid);
  if(!c?.enabled||!c?.user?.id)throw new Error("Meld eerst aan via Athenaeum → Instellingen → Synchronisatie.");
  sbStatus("Athenaeum split-sync uitvoeren…");
  if(mode==="pull"){
    await window.AthSync.syncScriptorium(pid,{preferRemote:true});
    sbStatus("Scriptorium incrementeel uit cloud bijgewerkt.","good");
    return;
  }
  if(mode==="push"){
    await window.AthSync.syncScriptorium(pid);
    sbStatus("Gewijzigde Scriptorium-records incrementeel gesynchroniseerd.","good");
    return;
  }
  await window.AthSync.syncAll(pid);
  sbStatus("Athenaeum + Scriptorium incrementeel gesynchroniseerd.","good");
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
};

window.openModuleTheory=openModuleTheory;
window.renderSourceLibrary=renderSourceLibrary;
window.renderV6Progress=renderV6Progress;
window.v6StartMixedReview=v6StartMixedReview;

})();
window.SCRIPTORIUM_V6_INIT=window.init;


/* ===== v6_3.js ===== */
(function(){
'use strict';

const V63_BASE_INIT = window.init;
const V63_VERSION = '6.3.1';
const FRIEND_PROMPT = 'Gebruik de geuploade Scriptorium AI Instructiegids als vast beoordelingsprotocol voor alle Scriptorium-output die ik in deze chat plak. Wanneer een Scriptorium-prompt om JSON vraagt, antwoord uitsluitend met het gevraagde JSON-object. Hanteer de strenge 18+-norm, wees kritisch maar constructief, en coach mijn redenering in plaats van mijn academische tekst voor mij te schrijven.';

function sleep63(ms){ return new Promise(r=>setTimeout(r,ms)); }
function mode63(){
  const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  return {standalone,mobile};
}
function updateMode63(){
  const chip=document.getElementById('installStatusChip');
  if(!chip) return;
  const m=mode63();
  chip.textContent=(m.standalone?'Appmodus':'Webmodus')+' · '+(m.mobile?'mobiel':'desktop');
  document.body.classList.toggle('app-standalone',m.standalone);
}
function brand63(){
  document.title='Scriptorium V6.3.1 - Academische Onderzoekscoach';
  document.querySelectorAll('.version-pill').forEach(x=>x.textContent='V6.3.1');
  const s=document.querySelector('.brand small'); if(s)s.textContent='Onderzoekscoach V6.3.1 · GitHub-ready · authentieke bronnen · training · sync';
  const sub=document.querySelector('.topbar-sub'); if(sub)sub.textContent='Scriptorium V6.3.1 · web, desktop en mobiel';
}
function notifyBoot(msg,type='warn'){
  const e=document.getElementById('bootNotice'); if(!e)return;
  e.hidden=false; e.className='boot-notice '+type; e.textContent=msg;
}
function clearBoot(){const e=document.getElementById('bootNotice'); if(e)e.hidden=true;}

async function loadScript63(url, globalName){
  if(window[globalName]) return true;
  return new Promise(resolve=>{
    const s=document.createElement('script'); s.src=url; s.async=true;
    s.onload=()=>resolve(Boolean(window[globalName]));
    s.onerror=()=>resolve(false); document.head.appendChild(s);
  });
}
async function ensureDependencies63(){
  let pdf=Boolean(window.PDFLib), zip=Boolean(window.JSZip);
  if(!pdf){
    pdf=await loadScript63('https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js','PDFLib');
  }
  if(!zip){
    zip=await loadScript63('https://unpkg.com/jszip@3.10.1/dist/jszip.min.js','JSZip');
  }
  if(!pdf || !zip){
    notifyBoot('Scriptorium is gestart, maar de PDF/ZIP-bibliotheek kon niet volledig laden. Training en bronnen werken wel; PDF-import/export vereist internet en een herlaadbeurt.','warn');
  }
  return {pdf,zip};
}

async function seedCorpus63(){
  try{
    if(!db) return {seeded:0,error:'Lokale database is niet geopend'};
    const res=await fetch('./corpus_seed.json',{cache:'no-store'});
    if(!res.ok) return {seeded:0,error:'corpus_seed.json niet gevonden'};
    const seed=await res.json();
    if(seed.scriptorium_corpus_seed!==1 || !Array.isArray(seed.works)) return {seeded:0,error:'ongeldig corpusseed-formaat'};
    const existing=await idbGetAll('works');
    const byId=new Map(existing.map(w=>[w.id,w]));
    let added=0, enriched=0;
    for(const sw of seed.works){
      const old=byId.get(sw.id);
      if(!old){ await idbPut('works',{...sw,created_at:Date.now(),updated_at:Date.now()}); added++; continue; }
      if(!old.analysis && sw.analysis){
        await idbPut('works',{...sw,...old,analysis:sw.analysis,analysis_ranges:old.analysis_ranges?.length?old.analysis_ranges:sw.analysis_ranges,updated_at:Date.now()}); enriched++;
      }
    }
    if(added||enriched) await loadWorks();
    await idbPut('settings',{key:'v63_corpus_seed',value:{version:V63_VERSION,added,enriched,at:Date.now()}});
    return {seeded:added,enriched};
  }catch(e){ console.warn('Corpus seed failed',e); return {seeded:0,error:e.message}; }
}

function bindNavigationFallback63(){
  if(document.documentElement.dataset.v63nav==='1') return;
  document.documentElement.dataset.v63nav='1';
  document.addEventListener('click',e=>{
    const pageBtn=e.target.closest('#nav button[data-page]');
    if(pageBtn && window.showPage){ e.preventDefault(); window.showPage(pageBtn.dataset.page); return; }
    const go=e.target.closest('[data-go]');
    if(go && window.showPage){ e.preventDefault(); window.showPage(go.dataset.go); return; }
    const close=e.target.closest('[data-close]');
    if(close && window.closeModal){ e.preventDefault(); window.closeModal(close.dataset.close); }
  },true);
}

async function checkAsset63(url){
  try{const r=await fetch(url,{cache:'no-store'}); return r.ok;}catch{return false;}
}
function healthRow63(label,ok,detail=''){
  return `<div class="health-row ${ok?'ok':'bad'}"><span class="health-dot"></span><div><strong>${label}</strong>${detail?`<div class="tiny">${detail}</div>`:''}</div><span>${ok?'OK':'ACTIE'}</span></div>`;
}
async function renderHealth63(){
  const box=document.getElementById('releaseHealth'); if(!box)return;
  const isHttps=location.protocol==='https:' || location.hostname==='localhost';
  const github=location.hostname.endsWith('github.io');
  const checks=await Promise.all([
    checkAsset63('./version.json'),checkAsset63('./corpus_seed.json'),checkAsset63('./sources.js'),checkAsset63('./Scriptorium_AI_Instructiegids_Vrienden.pdf'),checkAsset63('./manifest.webmanifest')
  ]);
  let sw=false; try{sw=Boolean(navigator.serviceWorker && (await navigator.serviceWorker.getRegistration('./')));}catch{}
  let idb=Boolean(window.indexedDB);
  const rows=[
    healthRow63('HTTPS / veilige context',isHttps,isHttps?'PWA en clipboard kunnen veilig werken.':'Gebruik GitHub Pages via https://.'),
    healthRow63('GitHub Pages pad',!github || location.pathname.endsWith('/') || location.pathname.includes('/'),github?'Projectsite gedetecteerd: '+location.pathname:'Niet op github.io; lokaal/andere host.'),
    healthRow63('Versiebestand',checks[0],'version.json'),
    healthRow63('Didactisch corpus ingebouwd',checks[1],'56 analyse-records voor nieuwe toestellen.'),
    healthRow63('Primaire bronnenbibliotheek',checks[2],'sources.js'),
    healthRow63('AI-instructiegids voor vrienden',checks[3],'downloadbare PDF'),
    healthRow63('PWA manifest',checks[4],'manifest.webmanifest'),
    healthRow63('Service worker',sw,sw?'Offline shell/updatebeheer actief.':'Herlaad de pagina na publicatie.'),
    healthRow63('Lokale database',idb,'IndexedDB voor eigen voortgang en PDF-bestanden.'),
    healthRow63('PDF-bibliotheek',Boolean(window.PDFLib),'Nodig voor PDF-import.'),
    healthRow63('ZIP-bibliotheek',Boolean(window.JSZip),'Nodig voor corpuspakketten.')
  ];
  box.innerHTML=rows.join('');
  const badge=document.getElementById('releaseModeBadge');
  if(badge){const failures=[!isHttps,...checks.map(x=>!x),!idb].filter(Boolean).length;badge.textContent=failures?'controle nodig':'release gereed';badge.className='badge '+(failures?'warn':'good');}
}

async function forceUpdate63(){
  if(!confirm('App-cache vernieuwen? Je IndexedDB-data, scores en lokale PDF-bestanden blijven behouden.')) return;
  try{
    if('caches' in window){for(const k of await caches.keys()) if(k.startsWith('scriptorium-')) await caches.delete(k);}
    if('serviceWorker' in navigator){
      const regs=await navigator.serviceWorker.getRegistrations();
      for(const r of regs){ try{await r.update();}catch{} }
    }
    location.reload();
  }catch(e){alert('Cache vernieuwen mislukte: '+e.message);}
}

function bindSettings63(){
  const cp=document.getElementById('copyFriendPrompt');
  if(cp) cp.onclick=async()=>{await copyText(FRIEND_PROMPT); toast('Startinstructie voor ChatGPT gekopieerd.','good');};
  const rh=document.getElementById('refreshReleaseHealth'); if(rh)rh.onclick=renderHealth63;
  const fu=document.getElementById('forceAppUpdate'); if(fu)fu.onclick=forceUpdate63;
}

function guardPdfFeatures63(){
  const file=document.getElementById('fileInput');
  if(file){
    const old=file.onchange;
    file.onchange=async e=>{
      if(!window.PDFLib){toast('PDF-bibliotheek is nog niet geladen. Controleer internet en herlaad de app.','bad');return;}
      if(old) return old.call(file,e);
    };
  }
  const pkg=document.getElementById('makeCorpusPackage');
  if(pkg){
    const old=pkg.onclick;
    pkg.onclick=async e=>{
      if(!window.JSZip || !window.PDFLib){toast('PDF/ZIP-bibliotheken ontbreken. Herlaad met internetverbinding.','bad');return;}
      if(old) return old.call(pkg,e);
    };
  }
}

async function registerSW63(){
  if(!('serviceWorker' in navigator) || !(location.protocol==='https:'||location.hostname==='localhost')) return;
  try{
    const reg=await navigator.serviceWorker.register('./sw.js',{scope:'./'});
    await reg.update().catch(()=>{});
    if(reg.waiting) reg.waiting.postMessage({type:'SKIP_WAITING'});
  }catch(e){console.warn('SW register',e);}
}

window.addEventListener('error',e=>{
  console.error('Scriptorium runtime error',e.error||e.message);
  const txt=String(e.message||'');
  if(txt && !txt.includes('ResizeObserver')) notifyBoot('Er trad een appfout op. Open Instellingen > GitHub / PWA systeemcheck voor diagnose.','bad');
});

window.init=async function(){
  brand63(); updateMode63(); bindNavigationFallback63();
  await ensureDependencies63();
  try{
    await V63_BASE_INIT();
  }catch(e){
    console.error('Base init failed',e); notifyBoot('Scriptorium kon niet volledig initialiseren: '+e.message,'bad');
  }
  const seed=await seedCorpus63();
  bindSettings63(); guardPdfFeatures63();
  await registerSW63();
  updateMode63();
  if(!seed.error && (seed.seeded||seed.enriched)) toast(`Didactisch corpus klaar: ${seed.seeded+seed.enriched} records toegevoegd/geactualiseerd.`,'good');
  if(seed.error && !db) notifyBoot('De lokale database kon niet worden geopend. Herlaad de app; blijft dit optreden, controleer of site-opslag/IndexedDB toegestaan is.','bad');
  else if(!document.getElementById('bootNotice')?.classList.contains('bad')) clearBoot();
  setTimeout(renderHealth63,500);
};

window.addEventListener('pageshow',updateMode63);
window.addEventListener('focus',updateMode63);
window.v63RenderHealth=renderHealth63;
})();

/* ===== v6_4.js ===== */
(function(){
'use strict';

const V64_VERSION='6.4';
const V64_PREV_BUILD=window.buildTrainingExercise;
const V64_PREV_RENDER=window.renderExercise;
const V64_PREV_EXERCISE_TEXT=window.exerciseText;
let V64_CORPUS_CACHE=null;

const THEORY64={
 m01:{plain:'Je leert eerst beoordelen of een onderzoek überhaupt kán werken. Niet: “zijn deze bronnen interessant?”, maar: passen onderzoeksvraag, bronnen, methode en conclusie logisch op elkaar?',steps:['Lees eerst de onderzoeksvraag. Markeer welk historisch verschijnsel werkelijk bewezen moet worden.','Vraag per bron: wat kan deze bron rechtstreeks tonen en wat niet?','Controleer of methode en corpus precies dat bewijs kunnen leveren.','Rangschik problemen: eerst wat de conclusie ongeldig maakt, pas daarna kleinere tekortkomingen.','Koppel ieder probleem aan één concrete revisie.'],example:'Een student wil met een keizerlijke munt en een door Tacitus geconstrueerde rede bewijzen “wat de bevolking van het Romeinse rijk dacht over de keizer”. Dat gaat te ver: beide bronnen tonen representaties van macht, geen representatieve opiniepeiling. Een betere vraag kan focussen op hoe macht in verschillende genres wordt voorgesteld en bestreden.',mistakes:['Meteen de broninhoud samenvatten zonder het onderzoeksontwerp te testen.','Een opvallende bron behandelen als representatief voor een hele bevolking.']},
 m02:{plain:'Een goede onderzoeksvraag vraagt precies naar iets dat je bronnen kunnen beantwoorden. De broncapaciteit begrenst dus de ambitie van je vraag.',steps:['Bepaal wat rechtstreeks observeerbaar is.','Kies tijd, ruimte en populatie expliciet.','Definieer het kernbegrip.','Formuleer één hoofdvraag die met dit corpus antwoordbaar is.','Gebruik deelvragen als noodzakelijke stappen naar het hoofdantwoord.'],example:'Als je alleen ere-inscripties hebt, is “hoe populair was de keizer?” te breed. “Hoe construeerden stedelijke elites loyaliteit aan de keizer in ere-inscripties?” sluit veel beter aan op het bewijs.',mistakes:['Een vraag formuleren over intenties of ervaringen waarvoor geen bron bestaat.','Te veel deelvragen die interessant zijn maar niet nodig voor de hoofdvraag.']},
 m03:{plain:'Woorden als democratie, Romanisering, status of sociale mobiliteit zijn geen kant-en-klare meetbare feiten. Je moet eerst beslissen waaraan je ze in bronnen zou herkennen.',steps:['Schrijf een historische werkdefinitie.','Splits het begrip in dimensies.','Maak per dimensie observeerbare indicatoren.','Bedenk false positives: dezelfde indicator kan ook iets anders betekenen.','Bepaal vooraf wanneer je níét van het begrip zult spreken.'],example:'Een Latijnse naam is geen automatische indicator voor “Romanisering”. Die naam kan juridische status, mode, familiepolitiek of epigrafische conventie weerspiegelen. Je hebt dus meerdere onafhankelijke indicatoren nodig.',mistakes:['Een modern begrip ongewijzigd op de oudheid plakken.','Een indicator verwarren met het begrip zelf.']},
 m04:{plain:'Een corpus is een selectie uit wat ooit bestond én uit wat toevallig bewaard is. De samenstelling van je corpus bepaalt dus welke conclusies je mag trekken.',steps:['Definieer de historische populatie waarover je iets wilt zeggen.','Leg inclusie- en exclusiecriteria vast.','Scheid kernbron, controlebron en contextbron.','Onderzoek overleverings- en vindplaatsbias.','Schrijf één expliciete zin over wat je corpus structureel niet kan tonen.'],example:'Als bijna al je inscripties uit rijke stedelijke centra komen, mag je niet zonder meer spreken over “de bevolking van een provincie”. De vindcontext selecteert al vóór jouw analyse.',mistakes:['De best bewaarde casus als normaal behandelen.','Bronnen kiezen omdat ze handig of bekend zijn zonder selectielogica.']},
 m05:{plain:'Bronkritiek betekent niet alleen “de auteur kan biased zijn”. Je moet aantonen hoe productie, doel, publiek, genre en overlevering de maximale bewijskracht van een bron veranderen.',steps:['Noteer wat fysiek/tekstueel rechtstreeks aanwezig is.','Identificeer producent, doel en vermoedelijk publiek.','Bepaal genre en conventies.','Onderzoek selectie en overlevering.','Formuleer de sterkste claim die de bron nog verantwoord kan dragen.'],example:'Een grafinscriptie kan rechtstreeks tonen welke identiteit de nabestaanden wilden tonen. Ze bewijst niet automatisch de volledige sociale identiteit die de overledene in het dagelijks leven had.',mistakes:['“Bias” noemen zonder gevolg voor je conclusie.','Een normatieve tekst behandelen als bewijs dat de norm in praktijk werd gevolgd.']},
 m06:{plain:'Een status quaestionis is een kaart van een debat. Je ordent dus niet per auteur, maar per echt geschilpunt: waar verschillen interpretaties, bronnen of methoden?',steps:['Formuleer het centrale historiografische probleem.','Groepeer onderzoekers per positie of verklaringsmodel.','Benoem waarop ze het wél eens zijn.','Leg uit waarom ze verschillen: ander corpus, andere methode, andere definitie?','Formuleer pas daarna de precieze lacune voor nieuw onderzoek.'],example:'“A zegt X, B zegt Y, C zegt Z” is een literatuurlijst. Sterker is: “Het debat draait om twee verklaringen; positie 1 steunt vooral op literaire bronnen, positie 2 op lokale epigrafie. Daardoor meten zij niet exact hetzelfde verschijnsel.”',mistakes:['Auteur-na-auteur samenvatten.','Een “gap” verzinnen zonder te tonen uit welk debat die voortkomt.']},
 m07:{plain:'Positioneren betekent duidelijk maken welke bestaande interpretatie jouw onderzoek beter kan toetsen, verfijnen of begrenzen. Originaliteit is niet hetzelfde als “niemand deed dit ooit”.',steps:['Benoem de bestaande verklaringen eerlijk.','Selecteer één precieze interventie.','Leg uit welke nieuwe broncombinatie, schaal of methode die interventie mogelijk maakt.','Formuleer wat jouw onderzoek zou kunnen veranderen.','Benoem ook wat mogelijk overeind blijft.'],example:'Een sterke bijdrage kan simpelweg zijn dat je een algemeen model test op lokale variatie. Als het model in drie steden anders werkt, heb je het debat inhoudelijk verfijnd zonder spectaculaire “revolutie”.',mistakes:['Een stroman maken van oudere literatuur.','Originaliteit alleen baseren op een nieuwe casus zonder analytische bijdrage.']},
 m08:{plain:'Een methode is geen decoratief label. Ze moet één concreet inferentieprobleem oplossen: welke stap van bron naar conclusie wordt door deze methode beter controleerbaar?',steps:['Formuleer het inferentieprobleem.','Beschrijf de methode als concrete procedure.','Benoem aannames en benodigde data.','Noteer welke informatie de methode níét kan produceren.','Vergelijk minstens één geloofwaardig alternatief.'],example:'Space syntax kan ruimtelijke toegankelijkheid modelleren, maar niet rechtstreeks intenties of werkelijk voetgangersgedrag bewijzen. De methode is nuttig zolang je die grens bewaakt.',mistakes:['Veel methodetermen stapelen zonder procedure.','Een methode gebruiken omdat die modern of kwantitatief klinkt.']},
 m09:{plain:'Theorie helpt je gericht kijken, maar een model is nooit identiek aan historische werkelijkheid. Je moet theoretische variabelen vertalen naar historische observaties.',steps:['Leg het model in gewone taal uit.','Bepaal welke historische observaties ermee corresponderen.','Maak toetsbare verwachtingen.','Zoek een grensgeval waar het model kan misleiden.','Behandel afwijkingen als informatie, niet als fout in de bron.'],example:'Een principal-agentmodel kan helpen vragen waarom een magistraat afwijkt van verwachtingen, maar “principal” en “agent” zijn jouw analytische categorieën, geen Romeinse zelfbeschrijvingen.',mistakes:['Modeltermen als historische feiten behandelen.','Alle afwijkingen wegverklaren om het model te redden.']},
 m10:{plain:'Triangulatie betekent dat verschillende soorten bewijs elkaar onafhankelijk controleren. Meer bronnen zijn alleen nuttig wanneer hun fouten niet allemaal dezelfde oorsprong hebben.',steps:['Formuleer de claim die je wilt testen.','Noteer per bron welke bias zij heeft.','Zoek een tweede bewijspad met andere productielogica.','Bepaal vooraf wat je doet als bronnen conflicteren.','Maak onderscheid tussen bevestiging en herhaling van hetzelfde perspectief.'],example:'Een keizerlijke munt en een keizerlijke ere-inscriptie kunnen allebei officiële beeldvorming reproduceren. Een particuliere brief of lokale archeologische praktijk kan een onafhankelijker controlepad vormen.',mistakes:['Twee officiële bronnen als volledig onafhankelijke bevestiging tellen.','Tegenstrijdige bronnen gladstrijken in plaats van analyseren.']},
 m11:{plain:'Elke historische conclusie bestaat uit stappen. Je moet kunnen aanwijzen: wat zie ik, wat betekent dat in context, welke inferentie maak ik, en hoe veralgemeen ik?',steps:['Schrijf de observatie zonder interpretatie.','Voeg contextuele betekenis toe.','Formuleer de inferentiestap expliciet.','Bepaal of de stap extra bewijs nodig heeft.','Kalibreer de eindclaim aan de zwakste noodzakelijke stap.'],example:'Observatie: een munt draagt SIGNIS RECEPTIS. Interpretatie: de munt verwijst naar teruggewonnen standaarden. Inferentie: de uitgever presenteert dit als politieke prestatie. Niet automatisch: “alle Romeinen waren hierdoor overtuigd”.',mistakes:['Van brongegeven rechtstreeks naar grote these springen.','Sterke werkwoorden gebruiken waar de inferentie indirect is.']},
 m12:{plain:'Een verklaring is pas sterk wanneer je ook serieuze alternatieven kunt bedenken en bewijs zoekt dat die verklaringen van elkaar onderscheidt.',steps:['Formuleer het waargenomen patroon.','Maak minstens drie verklaringen.','Beschrijf per verklaring het mechanisme.','Voorspel welk bewijs je zou verwachten.','Zoek een observatie waarop de rivalen verschillende voorspellingen doen.'],example:'Meer Latijnse inscripties na een verovering kunnen wijzen op culturele verandering, maar ook op veranderde administratieve epigrafische gewoonten. Alleen chronologie beslist dat niet.',mistakes:['“Na X kwam Y, dus X veroorzaakte Y.”','Alternatieven alleen noemen om ze meteen af te wijzen.']},
 m13:{plain:'Historische datasets zijn vaak onvolledig. Een getal is pas betekenisvol als je begrijpt wat geteld kon worden, wat ontbreekt en welke proxy je werkelijk gebruikt.',steps:['Definieer teller en noemer.','Bepaal wat ontbrekende data veroorzaakt.','Markeer proxies.','Vergelijk alleen periodes/casussen met voldoende vergelijkbare dekking.','Gebruik bandbreedtes of scenario’s wanneer precisie niet verantwoord is.'],example:'Een stijging van het aantal inscripties kan meer activiteit betekenen, maar ook een veranderde “epigraphic habit” of betere conservering. Het ruwe aantal is dus geen directe maat van maatschappelijke intensiteit.',mistakes:['Percentages tonen zonder betrouwbare noemer.','Ontbrekende data behandelen als toevallige leegte.']},
 m14:{plain:'Vergelijken is een onderzoeksontwerp. Je kiest casussen omdat hun overeenkomsten of verschillen een verklaring kunnen testen.',steps:['Formuleer wat precies vergeleken wordt.','Kies most-similar of most-different logica.','Controleer bronvergelijkbaarheid.','Benoem lokale factoren die het patroon kunnen verstoren.','Gebruik afwijkende casussen als stresstest.'],example:'Twee steden met dezelfde juridische status maar sterk verschillende erecultuur kunnen nuttig zijn om lokale elitecompetitie te testen. Twee willekeurige goed bewaarde steden zijn dat niet automatisch.',mistakes:['Casussen kiezen omdat ze bekend zijn.','Lokale variatie als ruis wegzetten.']},
 m15:{plain:'Een hoofdstukstructuur is een argument in grote stappen. Ieder hoofdstuk moet iets bewijzen dat noodzakelijk is voor het antwoord op de hoofdvraag.',steps:['Schrijf de hoofdclaim.','Bepaal welke tussenclaims noodzakelijk zijn.','Koppel elk hoofdstuk aan één tussenclaim.','Voer de schraptest uit.','Zet achtergrond alleen waar ze analytisch nodig is.'],example:'Een hoofdstuk “Historische context” van dertig pagina’s is niet automatisch nuttig. Als geen latere inferentie ervan afhangt, moet het worden ingekort of geïntegreerd.',mistakes:['Hoofdstukken als onderwerpendozen opbouwen.','Achtergrond verwarren met argumentatie.']},
 m16:{plain:'Een goede paragraaf doet één analytische taak. De lezer moet kunnen zien wat de claim is, welk bewijs haar ondersteunt en waarom dat bewijs relevant is.',steps:['Markeer de kernclaim.','Markeer het concrete bewijs.','Schrijf de ontbrekende “dus”-stap uit.','Controleer of alle zinnen dezelfde claim dienen.','Laat de overgang voortkomen uit een nog openstaande vraag.'],example:'“De inscriptie noemt twee Romeinen. Dit bewijst sterke romanisering.” mist de inferentie. Eerst moet je uitleggen waarom naamgeving hier een betrouwbare indicator zou zijn en welke alternatieve verklaringen bestaan.',mistakes:['Bewijs opsommen zonder warrant.','Een nieuwe claim in de laatste zin introduceren.']},
 m17:{plain:'Academische precisie betekent dat je taal exact aangeeft hoe sterk je bewijs is. Voorzichtig schrijven is niet hetzelfde als vaag schrijven.',steps:['Markeer sterke claimwerkwoorden.','Vraag of de bron rechtstreeks of indirect bewijs levert.','Vervang absolute termen door preciezere formuleringen.','Maak tijd, groep en schaal concreet.','Gebruik onzekerheid alleen waar ze inhoudelijk bestaat.'],example:'“Deze bron bewijst dat Britten Rome haatten” is te sterk. “Tacitus construeert in de Calgacus-rede een scherpe literaire kritiek op Romeinse imperiale macht” zegt precies wat de bron wél draagt.',mistakes:['Overal “misschien” schrijven.','Stelligheid gebruiken om onzeker bewijs overtuigender te laten klinken.']},
 m18:{plain:'Een conclusie beantwoordt de oorspronkelijke vraag met dezelfde begrippen en dezelfde bewijsgrenzen. Ze is geen plaats voor een nieuwe these.',steps:['Zet de hoofdvraag letterlijk naast je bevindingen.','Beantwoord iedere deelvraag.','Synthetiseer in plaats van hoofdstukken samen te vatten.','Geef het zekerheidsniveau aan.','Koppel beperkingen aan concrete gevolgen voor de conclusie.'],example:'Een limitation is niet “er waren weinig bronnen”. Sterker: “Omdat private stemmen vrijwel ontbreken, kan deze studie publieke representatie analyseren maar geen representatieve publieke receptie vaststellen.”',mistakes:['Nieuwe verklaringen introduceren in de conclusie.','Limitations als ritueel lijstje zonder gevolg.']},
 m19:{plain:'Peer review is prioriteren. Je zoekt eerst de problemen die geldigheid of bewijslogica bedreigen en pas daarna stijl.',steps:['Vat de bijdrage in één zin samen.','Benoem maximaal drie major issues.','Leg per issue uit welke conclusie daardoor gevaar loopt.','Geef een uitvoerbare revisie.','Bepaal hoe je kunt testen of die revisie geslaagd is.'],example:'Een slecht geformuleerde zin is minor. Een onderzoeksvraag die niet met het gekozen corpus kan worden beantwoord is major en kan het hele cijfer plafonneren.',mistakes:['Twintig kleine opmerkingen geven en het kernprobleem missen.','Kritiek geven zonder revisiestrategie.']},
 m20:{plain:'Hier combineer je alles. Een mini-masterproef is geen lange lijst onderdelen: ieder onderdeel moet de andere begrenzen.',steps:['Begin bij een antwoordbare vraag.','Ontwerp het corpus op die vraag.','Kies methode voor de noodzakelijke inferenties.','Bouw hoofdstukken als bewijsstappen.','Plan rivalen, beperkingen en eindclaim vooraf.'],example:'Als je vraag naar receptie gaat, maar je corpus bestaat alleen uit officiële monumenten, moet je óf de vraag veranderen óf een bronsoort toevoegen die receptie daadwerkelijk kan benaderen.',mistakes:['Eerst een favoriete these kiezen en daarna bewijs zoeken.','Methoden en hoofdstukken toevoegen zonder functie.']},
 m21:{plain:'In het Source Lab leer je eerst traag en precies kijken voordat je een grote historische interpretatie maakt.',steps:['Noteer de bronidentificatie.','Beschrijf alleen wat direct aanwezig is.','Markeer lacunes/restauraties/conventies.','Schrijf mogelijke interpretaties apart.','Bepaal welke vergelijking of controlebron je nodig hebt.'],example:'Bij een beschadigde inscriptie is een editoriale aanvulling tussen vierkante haken geen “gevonden letter”. Noteer dus apart wat steen, editie en interpretatie leveren.',mistakes:['Interpretatie al in de observatie schrijven.','Editoriale reconstructie als fysiek bewijs behandelen.']},
 m22:{plain:'Een mondelinge verdediging test of jij begrijpt waarom je onderzoek zo is ontworpen. Je hoeft niet te doen alsof er geen beperkingen zijn.',steps:['Formuleer je centrale keuze.','Geef het sterkste argument ervoor.','Erken de belangrijkste beperking.','Leg uit hoe je die beperking beheerst.','Beantwoord wat er verandert als een criticus gelijk heeft.'],example:'Sterk antwoord: “Deze inscripties zijn geen representatieve steekproef van alle inwoners; daarom beperk ik mijn claim tot publieke elite-representatie en gebruik ik papyri als controle voor private praktijk.”',mistakes:['Iedere kritiek defensief ontkennen.','Een methodische keuze verdedigen met “zo doet de literatuur het”.']},
 m23:{plain:'Thesis Studio houdt je volledige onderzoek controleerbaar: welke claim wil je bewijzen, welk bewijs draagt haar, welke bezwaren zijn nog open en wat is de volgende onderzoeksactie?',steps:['Maak een claim ledger.','Koppel bronnen aan claims.','Houd tegenargumenten apart bij.','Noteer open onderzoeksrisico’s.','Controleer per hoofdstuk welke claim het moet leveren.'],example:'Als een hoofdstuk veel interessante bronbespreking bevat maar aan geen kernclaim gekoppeld is, zie je dat in de claim ledger meteen als structuurprobleem.',mistakes:['Schrijven gebruiken om nog onopgeloste onderzoekskeuzes te verbergen.','Alle notities als even belangrijk behandelen.']}
};

const PRINCIPLE_MAP64={
 m01:[1,5,9,11,12],m02:[1,7,15],m03:[2,14],m04:[1,5,10],m05:[5,6,9,12],m06:[3,15],m07:[3,15,13],m08:[4,12],m09:[4,14],m10:[5,8,9],m11:[6,9,11],m12:[8,9,13],m13:[9,12,14],m14:[10,13],m15:[7,11],m16:[7,11],m17:[9,11],m18:[11,12],m19:[8,9,11,12],m20:[1,2,4,5,7,8,11,12],m21:[5,6,9],m22:[4,8,9,12],m23:[1,7,11,12]
};

const GENERIC_TAGS64=new Set(['literary','epigraphy','coin','material','documentary','inscription','speech','letter','decree','biography','papyrus','writing-tablet']);
const THEME_GROUPS64={
 'macht & imperium':['empire','imperialism','imperial-image','power','princeps','Augustus','ruler','military'],
 'politiek & instellingen':['democracy','politics','tyranny','Republic','constitution','autonomy','alliance','citizenship','governance'],
 'identiteit & mobiliteit':['identity','migration','Romans','ethnicity','bilingualism','freedwoman','social-network'],
 'religie & ritueel':['religion','ritual','dedication','calendar'],
 'economie & regulering':['economy','coinage','taxation','weights','measures','market','procedure'],
 'representatie & retoriek':['rhetoric','representation','self-representation','historiography','funerary','reception','bias'],
 'norm & praktijk':['law','norm-practice','procedure','decree','governance']
};

function rng64(seed){let h=2166136261>>>0;for(const c of String(seed)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return()=>{h+=0x6D2B79F5;let t=h;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
function material64(s){return{authentic:true,synthetic:false,source_id:s.id,label:`${s.canonical_ref} · ${s.title}`,text:s.original_text,translation:s.translation_text,source_type:s.source_type,language:s.language,author:s.author,period:s.period,place:s.place,original_source_name:s.original_source_name,original_source_url:s.original_source_url,translation_source_name:s.translation_source_name,translation_source_url:s.translation_source_url,translation_credit:s.translation_credit,context_hint:s.context_hint,language_hint:s.language_hint,analytic_hint:s.analytic_hint,scaffold:s.scaffold||[],tags:s.tags||[]}}
function themeFor64(srcs){
 const counts=[];
 for(const [name,tags] of Object.entries(THEME_GROUPS64)){let score=0;for(const s of srcs){const st=(s.tags||[]).map(x=>x.toLowerCase());for(const t of tags)if(st.includes(t.toLowerCase()))score++}counts.push([name,score])}
 counts.sort((a,b)=>b[1]-a[1]);return counts[0]?.[1]>0?counts[0][0]:'historische representatie en bewijs';
}
function coherentSources64(moduleId,difficulty,seed){
 const all=(window.V6_AUTHENTIC_SOURCES||[]).filter(s=>s.primary&&s.ready); if(!all.length)return[];
 const r=rng64(seed); const candidates=all.filter(s=>(s.recommended_modules||[]).includes(moduleId)); const anchors=candidates.length?candidates:all; const anchor=anchors[Math.floor(r()*anchors.length)];
 function semantic(s){let score=0;if((s.recommended_modules||[]).includes(moduleId))score+=3; const aTags=(anchor.tags||[]).map(x=>x.toLowerCase()), bTags=(s.tags||[]).map(x=>x.toLowerCase()); for(const [_,group] of Object.entries(THEME_GROUPS64)){const aa=group.some(t=>aTags.includes(t.toLowerCase())),bb=group.some(t=>bTags.includes(t.toLowerCase()));if(aa&&bb)score+=4} for(const t of aTags)if(!GENERIC_TAGS64.has(t)&&bTags.includes(t))score+=2;if(s.source_type!==anchor.source_type)score+=1;return score+r()*0.2}
 const ordered=all.filter(s=>s.id!==anchor.id).map(s=>[s,semantic(s)]).sort((a,b)=>b[1]-a[1]).map(x=>x[0]);
 const n=difficulty>=5?4:difficulty>=3?3:2;return[anchor,...ordered].slice(0,n);
}
function themeQuestion64(theme){
 const m={
  'macht & imperium':'Hoe wordt politieke of imperiale macht in verschillende primaire bronsoorten voorgesteld, gelegitimeerd of bekritiseerd?',
  'politiek & instellingen':'In hoeverre kunnen verschillende bronsoorten institutionele idealen en politieke praktijk van elkaar onderscheiden?',
  'identiteit & mobiliteit':'Hoe worden sociale of collectieve identiteiten in verschillende primaire bronnen geconstrueerd en welke grenzen heeft die representatie?',
  'religie & ritueel':'Wat kunnen normatieve en materiële bronnen samen aantonen over de organisatie en praktijk van cultus?',
  'economie & regulering':'Wat kunnen normatieve, tekstuele en materiële bronnen aantonen over economische regulering en feitelijke praktijk?',
  'representatie & retoriek':'Hoe construeren verschillende genres historische werkelijkheid en welke claims blijven beperkt tot representatie?',
  'norm & praktijk':'In welke mate kunnen voorschriften en andere bronsoorten samen het verschil tussen norm en praktijk benaderen?'
 };return m[theme]||'Welke historische claim kan dit bronnenpakket daadwerkelijk dragen, en waar liggen de inferentiële grenzen?';
}
function researchBrief64(ex,srcs,theme){
 const refs=srcs.map(s=>s.canonical_ref).join('; '), periods=[...new Set(srcs.map(s=>s.period).filter(Boolean))].join(' / '),places=[...new Set(srcs.map(s=>s.place).filter(Boolean))].join(' / ');
 const base={label:'DIDACTISCHE ONDERZOEKSOPZET',title:`Voorstel: ${theme}`,question:themeQuestion64(theme),scope:`Vergelijkende analyse van ${refs}. Datering: ${periods||'zie bronkaarten'}. Plaatsen: ${places||'zie bronkaarten'}.`,corpus:`De onderzoeker kiest deze bronnen omdat zij hetzelfde brede thema vanuit verschillende genres benaderen.`,method:'Vergelijkende close reading + expliciete bronkritiek; observatie, representatie en historische inferentie worden afzonderlijk genoteerd.',claim:`Voorlopige these: de bronnen wijzen gezamenlijk op een herkenbaar patroon binnen ${theme}, dat vervolgens voorzichtig naar een bredere historische interpretatie wordt vertaald.`};
 if(ex.module_id==='m01'){base.question=`In welke mate tonen deze bronnen hoe ${theme} door historische actoren werd ervaren en in praktijk functioneerde?`;base.claim=`Voorlopige these: omdat de bronnen een vergelijkbare spanning tonen, weerspiegelen zij waarschijnlijk een breed gedeelde historische ervaring van ${theme}.`;base.method='De onderzoeker vergelijkt de inhoud van de bronnen en behandelt overeenkomsten als wederzijdse bevestiging.';}
 if(ex.module_id==='m02'){base.label='ONDERZOEKSINTERESSE';base.question='Nog niet geformuleerd — dit is jouw taak.';base.claim='Nog geen these. Formuleer eerst een vraag die het corpus werkelijk kan beantwoorden.';}
 if(ex.module_id==='m03'){base.label='CONCEPTPROBLEEM';base.question=`De onderzoeker wil het begrip “${theme}” als centrale analytische categorie gebruiken.`;base.claim='Nog vóór de analyse moet duidelijk worden welke indicatoren wel en niet onder het begrip vallen.';}
 if(ex.module_id==='m04'){base.label='CORPUSPROBLEEM';base.question=`Doelpopulatie: alle relevante historische actoren binnen het thema ${theme}.`;base.claim=`De huidige bronnen zijn kandidaat-kerncorpus; jij moet bepalen welke rol elke bron mag krijgen en welke populatie daarmee werkelijk bereikbaar is.`;}
 if(ex.module_id==='m05'){base.label='HISTORISCHE VRAAG';base.question=themeQuestion64(theme);base.claim='Bepaal eerst per bron de maximale inferentie vóór je de bronnen combineert.';}
 if(['m08','m09','m10','m11','m12','m14'].includes(ex.module_id)){base.label='ANALYTISCH ONDERZOEKSPROBLEEM';}
 if(ex.module_id==='m15'){base.label='VOORGESTELDE THESISSTRUCTUUR';base.method='Voorlopige hoofdstukken: 1) context en begrippen; 2) eerste broncluster; 3) tweede broncluster; 4) vergelijking; 5) conclusie. Jij moet beoordelen welke hoofdstukken echte bewijsstappen zijn.';}
 if(['m16','m17'].includes(ex.module_id)){base.label='DIDACTISCH STUDENTFRAGMENT';base.method='Studentclaim: “Omdat meerdere bronnen vergelijkbare elementen tonen, bewijst dit dat het beschreven verschijnsel breed in de samenleving aanwezig was.” Gebruik dit als te analyseren formulering; het is géén primaire bron.';}
 if(ex.module_id==='m18'){base.label='VOORLOPIGE BEVINDINGEN';base.claim=`Voorlopig resultaat: de bronnen tonen een herhaald patroon rond ${theme}, maar representativiteit en bronfunctie verschillen sterk. Ontwerp een conclusie die dat verschil bewaart.`;}
 if(ex.module_id==='m19'){base.label='TE REVIEWEN ONDERZOEKSONTWERP';}
 if(ex.module_id==='m20'){base.label='STARTDOSSIER MINI-MASTERPROEF';base.question='Nog open: ontwerp zelf een antwoordbare hoofdvraag op basis van dit dossier.';base.claim='Nog geen vooraf gekozen these.';}
 if(ex.module_id==='m22'){base.label='TE VERDEDIGEN ONDERZOEKSONTWERP';}
 if(ex.module_id==='m23'){base.label='THESIS-STUDIO STARTKAART';base.claim='Bouw zelf een claim ledger; voorkom dat een voorlopige interpretatie ongemerkt als bewezen these wordt behandeld.';}
 return base;
}
function supportText64(b){return`ONDERZOEKSKADER\nType: ${b.label}\nTitel: ${b.title}\nOnderzoeksvraag/doel: ${b.question}\nVoorlopige claim: ${b.claim}\nAfbakening: ${b.scope}\nCorpuslogica: ${b.corpus}\nMethode/werkwijze: ${b.method}`}

window.buildTrainingExercise=function(moduleId,difficulty,mode,requestedMaterial,seed){
 const ex=V64_PREV_BUILD(moduleId,difficulty,mode,requestedMaterial,seed); const srcs=coherentSources64(moduleId,difficulty,seed); if(srcs.length)ex.materials=srcs.map(material64); const theme=themeFor64(srcs); ex.research_brief=researchBrief64(ex,srcs,theme); ex.intro=`Je krijgt hieronder eerst het onderzoeks- of analyseprobleem en daarna ${srcs.length} authentieke primaire bron${srcs.length===1?'':'nen'}. Alle noodzakelijke basiscontext staat zichtbaar; extra hulp blijft optioneel.`;
 if(moduleId==='m06'||moduleId==='m07'){const b=trainingBenchmarks(TRAINING_MODULES.find(m=>m.id===moduleId)).slice(0,4);ex.scholar_positions=b.map((x,i)=>({label:`Onderzoekspositie ${i+1}`,author:x.source,work:x.work,principle:x.principle,why:x.why,limit:x.limit,evidence:x.evidence||[]}));}
 ex.expected={...(ex.expected||{}),research_brief:ex.research_brief,theme,authentic_sources:srcs.map(s=>({id:s.id,ref:s.canonical_ref,type:s.source_type}))}; ex.signature=`${moduleId}|${ex.family}|V64|${theme}|${srcs.map(s=>s.id).join('+')}|${difficulty}`;
 return ex;
};

function briefHTML64(b){if(!b)return'';return`<section class="v64-brief"><div class="v64-eyebrow">${esc(b.label)}</div><h3>${esc(b.title)}</h3><div class="v64-brief-grid"><div><span>Onderzoeksvraag / doel</span><p>${esc(b.question)}</p></div><div><span>Voorlopige claim</span><p>${esc(b.claim)}</p></div><div><span>Afbakening</span><p>${esc(b.scope)}</p></div><div><span>Corpuslogica</span><p>${esc(b.corpus)}</p></div><div class="wide"><span>Methode / werkwijze</span><p>${esc(b.method)}</p></div></div><div class="v64-note"><strong>Wat moet jij doen?</strong> Beoordeel of deze opzet en de onderstaande bronnen elkaar werkelijk dragen. Je hoeft geen historische feiten te kennen die niet in het dossier staan.</div></section>`}
function scholarHTML64(arr){if(!arr?.length)return'';return`<section class="v64-scholars"><div class="v64-eyebrow">ECHTE ONDERZOEKSPOSITIES UIT HET CORPUS</div><h3>Materiaal voor historiografische analyse</h3>${arr.map(x=>`<article><strong>${esc(x.author||'Auteur')} — ${esc(x.work||'werk')}</strong><p>${esc(x.principle||'')}</p>${x.why?`<p class="tiny"><b>Waarom relevant:</b> ${esc(x.why)}</p>`:''}<div class="tiny">${(x.evidence||[]).map(e=>`${esc(e.author||x.author||'')} · fysieke PDF-p. ${esc(e.physical_page||'?')}`).join(' · ')}</div></article>`).join('')}</section>`}

window.renderExercise=function(){
 V64_PREV_RENDER(); const ex=state.currentExercise,body=document.querySelector('#exerciseBody');if(!ex||!body)return; const grid=body.querySelector('.material-grid');if(grid&&!body.querySelector('.v64-brief'))grid.insertAdjacentHTML('beforebegin',briefHTML64(ex.research_brief)+scholarHTML64(ex.scholar_positions));
 body.querySelectorAll('.material.authentic').forEach((card,i)=>{const m=ex.materials?.[i];if(!m||card.querySelector('.v64-context'))return;const head=card.querySelector('.auth-source-meta')||card.querySelector('.primary-source-head');if(head)head.insertAdjacentHTML('afterend',`<div class="v64-context"><strong>Basiscontext</strong><span>${esc(m.context_hint||'Gebruik auteur, datering, plaats, genre en provenance uit de bronkaart als uitgangspunt.')}</span></div>`)});
};

window.exerciseText=function(ex){
 const brief=ex.research_brief?`\n${supportText64(ex.research_brief)}\n`:''; const scholars=(ex.scholar_positions||[]).map(x=>`\n--- ${x.label}: ${x.author}, ${x.work} ---\n${x.principle}\n${x.why||''}`).join(''); const mats=(ex.materials||[]).map((m,i)=>`\n--- PRIMAIRE BRON ${i+1}: ${m.label} ---\nBASISCONTEXT: ${m.context_hint||''}\nORIGINEEL/OBJECTDATA:\n${m.text}\nENGLISH:\n${m.translation||''}\nHERKOMST: ${m.original_source_url||''}\nTRANSLATION/CHECK: ${m.translation_source_url||''}`).join('\n'); return `${ex.title}\nVariatie-ID: ${ex.signature}\nMoeilijkheid: ${ex.difficulty}/5 · modus: ${ex.mode}\n${ex.intro}${brief}${scholars}${mats}\n\nOPDRACHT\n${ex.prompt}`;
};

async function corpus64(){if(V64_CORPUS_CACHE)return V64_CORPUS_CACHE;try{const r=await fetch('./corpus_seed.json',{cache:'no-store'});V64_CORPUS_CACHE=await r.json();return V64_CORPUS_CACHE}catch(e){return null}}
function evidenceHTML64(e){return`<div class="v64-evidence"><b>${esc(e.author||'Auteur')}</b> · fysieke PDF-p. ${esc(e.physical_page||'?')}<br><span>${esc(e.description||'')}</span></div>`}
function sourceWorked64(m){const all=(window.V6_AUTHENTIC_SOURCES||[]).filter(s=>s.primary&&s.ready&&(s.recommended_modules||[]).includes(m.id));const s=all[0]||(window.V6_AUTHENTIC_SOURCES||[])[0];if(!s)return'';return`<div class="v64-worked"><div class="v64-eyebrow">CONCREET VOORBEELD MET EEN ECHTE BRON</div><h3>${esc(s.canonical_ref)} · ${esc(s.title)}</h3><p><b>Wat zie je rechtstreeks?</b> ${esc((s.original_text||'').slice(0,260))}${(s.original_text||'').length>260?'…':''}</p><p><b>Waarom is dat nog geen eindconclusie?</b> ${esc(s.analytic_hint||s.context_hint||'De bron heeft een specifieke productiecontext en maximale inferentie.')}</p><p><b>Denkstap:</b> noteer eerst observatie → bronfunctie → mogelijke inferentie → welke extra bron je nodig hebt om verder te gaan.</p><div class="source-links"><a target="_blank" rel="noopener" href="${esc(s.original_source_url||'#')}">Open originele editie/record ↗</a><a target="_blank" rel="noopener" href="${esc(s.translation_source_url||'#')}">Open Engelse vertaling/check ↗</a></div></div>`}

window.openModuleTheory=async function(moduleId){
 const m=TRAINING_MODULES.find(x=>x.id===moduleId)||TRAINING_MODULES[0],t=THEORY64[m.id]||{plain:m.desc,steps:[m.desc],example:'Pas het principe toe op één concrete bron voordat je veralgemeent.',mistakes:['Te snel abstraheren.']}; const seed=await corpus64(); const ranks=PRINCIPLE_MAP64[m.id]||[]; const principles=(seed?.cross_corpus_principles||[]).filter(p=>ranks.includes(p.rank)).slice(0,4); const seen=await v6SettingsGet('v6_theory_seen',{});seen[m.id]=Date.now();await v6SettingsPut('v6_theory_seen',seen);window.V6_THEORY_MODULE=m.id;
 document.querySelector('#theoryTitle').textContent=`Module ${m.n} · ${m.title}`;
 document.querySelector('#theoryMain').innerHTML=`
  <section class="theory-block v64-intro"><div class="v64-eyebrow">EERST IN GEWONE TAAL</div><h3>Wat leer je hier eigenlijk?</h3><p class="v64-lead">${esc(t.plain)}</p></section>
  <section class="theory-block"><div class="v64-eyebrow">STAPPENPLAN</div><h3>Zo pak je het aan</h3><ol class="v64-steps">${t.steps.map(x=>`<li>${esc(x)}</li>`).join('')}</ol></section>
  <section class="theory-block v64-example"><div class="v64-eyebrow">EERST EEN EENVOUDIG VOORBEELD</div><h3>Hoe ziet dat concreet eruit?</h3><p>${esc(t.example)}</p></section>
  ${sourceWorked64(m)}
  <section class="theory-block"><div class="v64-eyebrow">WAAROM DIT GEEN LOSSE AI-REGEL IS</div><h3>Voorbeelden uit de 56 echte papers</h3>${principles.length?principles.map(p=>`<article class="v64-principle"><h4>${esc(p.principle)}</h4><p>${esc(p.why||'')}</p>${(p.evidence||[]).slice(0,3).map(evidenceHTML64).join('')}<p class="v64-practice"><b>Zelf oefenen:</b> ${esc(p.practice||'Pas dit principe op je eigen ontwerp toe.')}</p></article>`).join(''):'<p>De gekoppelde corpusprincipes konden niet geladen worden. De oefening blijft beschikbaar.</p>'}</section>
  <section class="theory-block v64-mistakes"><div class="v64-eyebrow">VEELGEMAAKTE FOUTEN</div><h3>Hier moet je voor oppassen</h3><ul>${t.mistakes.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></section>
  <section class="theory-block v64-ready"><div class="v64-eyebrow">KORTE ZELFTEST</div><h3>Je bent klaar voor de oefening als…</h3><p>…je in je eigen woorden kunt uitleggen <b>welke stap van bron naar conclusie</b> deze module controleert en <b>waarom een aantrekkelijke conclusie soms toch te sterk is</b>.</p></section>`;
 showPage('training-theory');
};

const oldInit64=window.init;
window.init=async function(){if(oldInit64)await oldInit64();document.title='Scriptorium V6.5.1 - Academische Onderzoekscoach';document.querySelectorAll('.version-pill').forEach(x=>x.textContent='V6.5.1');const s=document.querySelector('.brand small');if(s)s.textContent='Onderzoekscoach V6.5.1 · duidelijke theorie · complete oefendossiers · uitgebreide authentieke bronnen';const sub=document.querySelector('.topbar-sub');if(sub)sub.textContent='Scriptorium V6.5.1 · theorie → voorbeeld → authentieke oefening';const btn=document.querySelector('#openSelectedTheory');if(btn)btn.onclick=()=>window.openModuleTheory(document.querySelector('#trainingModule').value);};
})();

/* ===== v6_5.js ===== */
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

/* ===== v6_5_2.js ===== */
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

/* ===== v7.js ===== */
(function(){
'use strict';
const V7_PREV_INIT=window.init;
const V7_PREV_SHOW=window.showPage;
const V7_PREV_RENDER_CORPUS=window.renderCorpus;
const V7_PREV_FILTERED=window.filteredWorks;
const V7_VERSION='7.0';
const UGENT_MEMBERS=['Koenraad Verboven','Arjan Zuiderhoek','Peter Van Nuffelen','Lieve Van Hoof','Wim Broekaert','Toon Bongers','Amber Brüsewitz','Maria Conterno'];
let bibSeed=null, deferredInstallPrompt=null, v7HistoryLock=false;

function q(id){return document.getElementById(id)}
function esc7(v){return window.esc?window.esc(v):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function currentPage7(){return document.querySelector('.page.active')?.id?.replace('page-','')||'dashboard'}
function provenance7(w){
  if(w.provenance_category) return w.provenance_category;
  if(w.origin==='bundled-analysis') return 'core_original';
  if(w.origin==='ugent_biblio') return 'ugent_discovery';
  if(w.origin==='bibliography_chain') return 'bibliography_chain';
  if(w.origin==='openalex') return 'external_discovery';
  return 'user_added';
}
function provenanceLabel7(cat){return ({core_original:'Oorspronkelijk kerncorpus',ugent_discovery:'Via UGent gevonden',bibliography_chain:'Via bibliografie gevonden',external_discovery:'Extern gevonden',user_added:'Zelf toegevoegd'})[cat]||'Herkomst onbekend'}
function provenanceClass7(cat){return 'prov-'+cat.replaceAll('_','-')}

async function normalizeProvenance7(){
  if(!window.idbPut||typeof state==='undefined'||!Array.isArray(state.works)) return;
  let changed=0;
  for(const w of state.works){if(!w.provenance_category){w.provenance_category=provenance7(w);w.updated_at=Date.now();await idbPut('works',w);changed++;}}
  if(changed&&window.loadWorks) await loadWorks();
}

function restructureNav7(){
  const nav=q('nav'); if(!nav)return;
  const order=[['dashboard','Home'],['corpus','Corpus'],['exchange','Corpusanalyse'],['discovery','Zoeken'],['sources','Primaire bronnen'],['atelier','Theorie'],['training','Training'],['progress','Voortgang'],['settings','Instellingen']];
  const by=new Map([...nav.querySelectorAll('button[data-page]')].map(b=>[b.dataset.page,b]));
  nav.innerHTML='';
  for(const [page,label] of order){const b=by.get(page)||document.createElement('button');b.dataset.page=page;b.textContent=label;nav.appendChild(b)}
  [...nav.querySelectorAll('button')].forEach(b=>b.classList.toggle('active',b.dataset.page===currentPage7()));
  const side=document.querySelector('.side-note'); if(side)side.innerHTML='<strong>Ad fontes, sed cum methodo.</strong><br>Herkomst, kwaliteit en didactisch gewicht blijven afzonderlijk zichtbaar.';
}

function installAnimations7(){
  if(document.documentElement.dataset.v7anim)return;document.documentElement.dataset.v7anim='1';
  const obs=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('v7-visible');obs.unobserve(e.target)}}),{threshold:.08,rootMargin:'0px 0px -30px'});
  function scan(){document.querySelectorAll('.card,.stat,.lesson,.result,.source-library-item,.auth-source-card,.v7-reveal').forEach(el=>{if(!el.dataset.v7seen){el.dataset.v7seen='1';el.classList.add('v7-reveal');obs.observe(el)}})}
  new MutationObserver(()=>requestAnimationFrame(scan)).observe(document.querySelector('.content')||document.body,{childList:true,subtree:true});scan();
  let lastY=scrollY;window.addEventListener('scroll',()=>{const y=scrollY;document.body.classList.toggle('v7-scrolled',y>90);document.body.classList.toggle('v7-scroll-down',y>lastY&&y>180);lastY=y},{passive:true});
}

function patchMobileNav7(){
  const nav=q('mobileBottomNav'); if(nav){
    const items=[['dashboard','🏠','Home'],['training','🧠','Training'],['corpus','📚','Corpus']];
    for(const [p,icon,label] of items){const b=nav.querySelector(`[data-mobile-page="${p}"]`);if(b)b.innerHTML=`<span class="mbn-icon">${icon}</span><span>${label}</span>`}
    const more=q('mobileMoreBtn');if(more)more.innerHTML='<span class="mbn-icon">☰</span><span>Menu</span>';
  }
  const grid=document.querySelector('#mobileMenuSheet .mobile-sheet-grid');if(grid){
    const labels={sources:['🏺','Primaire bronnen'],progress:['📈','Voortgang'],atelier:['📖','Theorie'],discovery:['🔎','Zoeken'],exchange:['🗂️','Corpusanalyse'],settings:['⚙️','Instellingen']};
    grid.innerHTML='';for(const [page,[icon,label]] of Object.entries(labels)){const b=document.createElement('button');b.dataset.mobilePage=page;b.innerHTML=`<span class="v7-menu-emoji">${icon}</span><span>${label}</span>`;grid.appendChild(b)}
    const tg=document.createElement('button');tg.id='v7MobileTelegram';tg.innerHTML='<span class="v7-menu-emoji">✈️</span><span>Telegram</span>';grid.appendChild(tg);
    const help=document.createElement('button');help.id='mobileHelpBtn';help.innerHTML='<span class="v7-menu-emoji">❔</span><span>Werkwijze</span>';grid.appendChild(help);
  }
}

function pageName7(n){return ({dashboard:'Home',corpus:'Corpus',exchange:'Corpusanalyse',discovery:'Zoeken',sources:'Primaire bronnen',atelier:'Theorie',training:'Training',progress:'Voortgang',settings:'Instellingen'})[n]||n}
window.showPage=function(name,opts={}){
  if(name==='sync')name='settings';
  const r=V7_PREV_SHOW?V7_PREV_SHOW(name):undefined;
  document.querySelectorAll('#nav button[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===name));
  const active=document.querySelector('.page.active');if(active){active.classList.remove('v7-page-enter');void active.offsetWidth;active.classList.add('v7-page-enter')}
  if(q('pageTitle'))q('pageTitle').textContent=pageName7(name);
  if(!opts.noHistory&&!v7HistoryLock){const u=new URL(location.href);u.searchParams.set('page',name);history.pushState({page:name},'',u)}
  if(name==='discovery')renderSearchHub7();
  if(name==='atelier')renderTheoryHub7();
  if(name==='settings'){mergeSyncIntoSettings7();renderSettingsV7();}
  setTimeout(()=>window.scrollTo({top:0,behavior:'smooth'}),10);
  return r;
};
window.addEventListener('popstate',e=>{v7HistoryLock=true;window.showPage(e.state?.page||new URL(location.href).searchParams.get('page')||'dashboard',{noHistory:true});v7HistoryLock=false});

window.filteredWorks=function(){
  const xs=V7_PREV_FILTERED?V7_PREV_FILTERED():state.works||[];const f=q('corpusProvenance')?.value||'';return f?xs.filter(w=>provenance7(w)===f):xs;
};
window.renderCorpus=function(){
  if(V7_PREV_RENDER_CORPUS)V7_PREV_RENDER_CORPUS();
  const xs=window.filteredWorks?window.filteredWorks():[];
  document.querySelectorAll('#corpusTable tbody tr').forEach((tr,i)=>{
    const open=tr.querySelector('button[onclick^="openDetail"]');const m=open?.getAttribute('onclick')?.match(/openDetail\('([^']+)'\)/);const w=m?state.works.find(x=>x.id===m[1]):xs[i];if(!w)return;
    const td=tr.querySelector('.title-cell');if(td&&!td.querySelector('.v7-prov'))td.insertAdjacentHTML('beforeend',`<span class="v7-prov ${provenanceClass7(provenance7(w))}">${provenanceLabel7(provenance7(w))}</span>`);
    const acts=tr.querySelector('td:last-child .row');if(acts&&!acts.querySelector('.v7-bib-btn')){const b=document.createElement('button');b.className='btn small v7-bib-btn';b.textContent='Bibliografie';b.onclick=()=>{window.showPage('discovery');setTimeout(()=>{selectSearchTab7('bibliography');if(q('v7BibSource')){q('v7BibSource').value=w.id;renderBibliography7()}},60)};acts.insertBefore(b,acts.firstChild)}
  });
};

async function loadBib7(){if(bibSeed)return bibSeed;try{bibSeed=await (await fetch('./bibliography_seed_v7.json',{cache:'no-store'})).json()}catch{bibSeed={references:[],per_work:[]}}return bibSeed}

function searchTabs7(){return `<div class="v7-search-tabs" role="tablist"><button class="active" data-v7-search="ugent">🏛️ UGent</button><button data-v7-search="openalex">🌍 OpenAlex</button><button data-v7-search="bibliography">🔗 Bibliografieketen</button><button data-v7-search="author">👤 Auteur</button></div><div id="v7SearchPanel"></div>`}
function renderSearchHub7(){const hub=q('v7SearchHub');if(!hub)return;hub.innerHTML=searchTabs7();hub.querySelectorAll('[data-v7-search]').forEach(b=>b.onclick=()=>selectSearchTab7(b.dataset.v7Search));selectSearchTab7('ugent')}
function selectSearchTab7(tab){document.querySelectorAll('[data-v7-search]').forEach(b=>b.classList.toggle('active',b.dataset.v7Search===tab));const p=q('v7SearchPanel');if(!p)return;
  if(tab==='ugent')renderUgSearch7();if(tab==='openalex')renderOpenAlexPanel7();if(tab==='bibliography')renderBibPanel7();if(tab==='author')renderAuthorPanel7();}

function jsonp7(baseUrl,params={}){
  return new Promise((resolve,reject)=>{
    const cb='scriptoriumV7Jsonp_'+Date.now()+'_'+Math.random().toString(36).slice(2);
    const script=document.createElement('script');
    const timer=setTimeout(()=>{cleanup();reject(new Error('UGent-zoekopdracht timeout'))},15000);
    function cleanup(){clearTimeout(timer);delete window[cb];script.remove()}
    window[cb]=data=>{cleanup();resolve(data)};
    const u=new URL(baseUrl);Object.entries({...params,callback:cb}).forEach(([k,v])=>u.searchParams.set(k,v));
    script.src=u.toString();script.onerror=()=>{cleanup();reject(new Error('UGent JSONP kon niet laden'))};document.head.appendChild(script);
  });
}

function renderUgSearch7(){const p=q('v7SearchPanel');p.innerHTML=`<div class="card v7-search-card"><div class="v7-section-head"><div><h4>UGent Oude Geschiedenis</h4><p>Zoek rechtstreeks in de UGent Academic Bibliography. De Ancient History-groep focust vooral op de Romeinse wereld sensu lato, maar omvat ook Grieks, Hellenistisch en Laatantiek onderzoek.</p></div><span class="badge accent">Biblio UGent</span></div><div class="v7-form-grid"><label>Zoekterm<input id="v7UgQuery" placeholder="bv. Roman economy, Athens, epigraphy"></label><label>Auteur<input id="v7UgAuthor" placeholder="optioneel: Verboven, Zuiderhoek…"></label><label>Type<select id="v7UgType"><option value="dissertation">Doctoraten</option><option value="all">Alle publicaties</option></select></label><label>Vanaf jaar<input id="v7UgYear" type="number" min="1900" max="2100" placeholder="bv. 2015"></label></div><div class="v7-author-chips">${UGENT_MEMBERS.map(a=>`<button data-ug-author="${esc7(a)}">${esc7(a)}</button>`).join('')}</div><div class="row"><button class="btn primary" id="v7UgSearch">Zoek UGent</button><button class="btn" id="v7UgPreset">Oude Geschiedenis breed</button><a class="btn" target="_blank" rel="noopener" href="https://biblio.ugent.be/organization/LW03">Open Biblio UGent</a><button class="btn" id="v7UgMasterCatalog">Masterproeven in UGent catalogus</button></div><div class="callout"><strong>Belangrijk:</strong> “Via UGent gevonden” is een herkomstcategorie, geen kwaliteitsstempel. Een nieuw werk start niet automatisch als normatief.</div></div><div id="v7UgResults" class="v7-results"></div>`;
  p.querySelectorAll('[data-ug-author]').forEach(b=>b.onclick=()=>{q('v7UgAuthor').value=b.dataset.ugAuthor;searchUg7()});q('v7UgSearch').onclick=searchUg7;q('v7UgPreset').onclick=()=>{q('v7UgQuery').value='Roman Greece Greek Hellenistic antiquity epigraphy papyrology economy empire late antiquity';searchUg7()};q('v7UgMasterCatalog').onclick=async()=>{const term=[q('v7UgQuery').value.trim(),q('v7UgAuthor').value.trim()].filter(Boolean).join(' ');if(term)await copyText(term);window.open('https://libcatalog.ugent.be/','_blank','noopener');toast(term?'Zoekterm gekopieerd; plak hem in de UGent-catalogus.':'UGent-catalogus geopend.','good')};}
async function searchUg7(){
  const box=q('v7UgResults');box.innerHTML='<div class="empty">UGent doorzoeken…</div>';
  let clauses=['affiliation exact LW03'];
  const term=q('v7UgQuery').value.trim(),author=q('v7UgAuthor').value.trim(),typ=q('v7UgType').value,yr=q('v7UgYear').value.trim();
  if(term)clauses.push(`basic any "${term.replaceAll('"',' ')}"`);
  if(author)clauses.push(`author any "${author.replaceAll('"',' ')}"`);
  if(typ==='dissertation')clauses.push('type exact dissertation');
  if(yr)clauses.push(`year >= ${parseInt(yr)}`);
  const cql=clauses.join(' and ');
  try{
    const d=await jsonp7('https://biblio.ugent.be/publication',{q:cql,format:'json',limit:'40',sort:'year.desc,title.asc'});
    renderUgResults7(d.hits||[]);
  }catch(e){
    box.innerHTML=`<div class="callout warn"><strong>Rechtstreeks zoeken lukte niet.</strong> ${esc7(e.message)}. <a target="_blank" rel="noopener" href="https://biblio.ugent.be/publication?q=${encodeURIComponent(cql)}">Open dezelfde zoekopdracht op Biblio UGent</a>.</div>`;
  }
}
function biblioTitle7(x){return x.title||x._source?.title||x.metadata?.title||'Zonder titel'}
function biblioAuthors7(x){const a=x.author||x.authors||x._source?.author||[];if(typeof a==='string')return a;if(Array.isArray(a))return a.map(v=>typeof v==='string'?v:(v.name||[v.first_name,v.last_name].filter(Boolean).join(' '))).filter(Boolean).join(', ');return ''}
function renderUgResults7(xs){const box=q('v7UgResults');box.innerHTML=xs.length?xs.map((x,i)=>{const title=biblioTitle7(x),author=biblioAuthors7(x),year=x.year||x._source?.year||'',id=x.id||x.biblio_id||x._id||'',url=id?`https://biblio.ugent.be/publication/${id}`:'https://biblio.ugent.be/';return `<article class="v7-result-card"><div class="v7-result-meta"><span class="v7-prov prov-ugent-discovery">Via UGent gevonden</span><span>${esc7(year)}</span></div><h4>${esc7(title)}</h4><p>${esc7(author||'Auteur niet uit resultaat gelezen')}</p><div class="row"><a class="btn small" target="_blank" rel="noopener" href="${url}">Open UGent</a><button class="btn small" data-save-ug="${i}">Bewaar kandidaat</button><button class="btn small" data-tg-share="${esc7(url)}" data-tg-text="${esc7(title)}">Telegram</button></div><script type="application/json" id="v7ug_${i}">${JSON.stringify(x).replace(/</g,'\\u003c')}<\/script></article>`}).join(''):'<div class="empty">Geen resultaten gevonden.</div>';box.querySelectorAll('[data-save-ug]').forEach(b=>b.onclick=()=>saveUg7(+b.dataset.saveUg));bindTelegramButtons7(box)}
async function saveUg7(i){const x=JSON.parse(q('v7ug_'+i).textContent),title=biblioTitle7(x),author=biblioAuthors7(x),year=String(x.year||x._source?.year||''),bid=x.id||x.biblio_id||x._id||'';const w={id:uid(),filename:'(UGent-vondst — PDF nog toevoegen)',file_size:0,title,author,institution:'Universiteit Gent',year,document_type:'Dissertation / publicatie',field:suggestField(title),rug01:'',page_count:null,weight:'vaknabij',origin:'ugent_biblio',provenance_category:'ugent_discovery',source_url:bid?`https://biblio.ugent.be/publication/${bid}`:'https://biblio.ugent.be/',notes:'Gevonden via UGent Biblio. Herkomst is UGent, maar didactisch gewicht moet nog inhoudelijk beoordeeld worden.',analysis:null,analysis_ranges:[],created_at:Date.now(),updated_at:Date.now()};await idbPut('works',w);await loadWorks();toast('UGent-kandidaat aan corpusmetadata toegevoegd. Voeg de PDF toe en beoordeel daarna het gewicht.','good')}

function renderOpenAlexPanel7(){const p=q('v7SearchPanel');p.innerHTML=`<div class="card v7-search-card"><div class="v7-section-head"><div><h4>OpenAlex</h4><p>Gebruik OpenAlex voor brede internationale ontdekking. Dit is vooral nuttig om buiten je huidige corpus nieuwe proefschriften en verwante auteurs te vinden.</p></div><span class="badge">extern</span></div><div class="v7-form-grid"><label>Zoekterm<input id="v7OaQuery" placeholder="bv. Roman civic identity"></label><label>Vanaf jaar<input id="v7OaYear" type="number" placeholder="bv. 2015"></label></div><div class="row"><button class="btn primary" id="v7OaSearch">Zoeken</button></div></div><div id="v7OaResults" class="v7-results"></div>`;q('v7OaSearch').onclick=searchOa7;q('v7OaQuery').onkeydown=e=>{if(e.key==='Enter')searchOa7()}}
async function searchOa7(){const term=q('v7OaQuery').value.trim();if(!term)return toast('Geef een zoekterm.','warn');const box=q('v7OaResults');box.innerHTML='<div class="empty">OpenAlex doorzoeken…</div>';let filter='type:dissertation';const yr=q('v7OaYear').value;if(yr)filter+=`,from_publication_date:${yr}-01-01`;try{const r=await fetch(`https://api.openalex.org/works?search=${encodeURIComponent(term)}&filter=${encodeURIComponent(filter)}&per_page=30`);if(!r.ok)throw new Error('OpenAlex '+r.status);const d=await r.json();box.innerHTML=(d.results||[]).map((x,i)=>{const authors=(x.authorships||[]).map(a=>a.author?.display_name).filter(Boolean).join(', '),pdf=x.best_oa_location?.pdf_url||x.primary_location?.pdf_url||'',url=x.doi||x.id||'';return `<article class="v7-result-card"><div class="v7-result-meta"><span class="v7-prov prov-external-discovery">Extern gevonden</span><span>${x.publication_year||''}</span></div><h4>${esc7(x.title||'')}</h4><p>${esc7(authors)}</p><div class="row">${pdf?`<a class="btn small" target="_blank" href="${esc7(pdf)}">PDF</a>`:''}<a class="btn small" target="_blank" href="${esc7(url)}">Open bron</a><button class="btn small" data-v7oa="${i}">Bewaar kandidaat</button><button class="btn small" data-tg-share="${esc7(url)}" data-tg-text="${esc7(x.title||'')}">Telegram</button></div><script type="application/json" id="v7oa_${i}">${JSON.stringify(x).replace(/</g,'\\u003c')}<\/script></article>`}).join('')||'<div class="empty">Geen resultaten.</div>';box.querySelectorAll('[data-v7oa]').forEach(b=>b.onclick=()=>saveOa7(+b.dataset.v7oa));bindTelegramButtons7(box)}catch(e){box.innerHTML=`<div class="callout warn">Zoeken mislukt: ${esc7(e.message)}</div>`}}
async function saveOa7(i){const x=JSON.parse(q('v7oa_'+i).textContent),authors=(x.authorships||[]).map(a=>a.author?.display_name).filter(Boolean).join(', ');const w={id:uid(),filename:'(externe vondst — PDF nog toevoegen)',file_size:0,title:x.title||'',author:authors,institution:(x.authorships||[]).flatMap(a=>a.institutions||[]).map(i=>i.display_name).filter(Boolean).slice(0,3).join(', '),year:String(x.publication_year||''),document_type:'Dissertation',field:suggestField(x.title||''),rug01:'',page_count:null,weight:'aanvullend',origin:'openalex',provenance_category:'external_discovery',source_url:x.doi||x.id||'',pdf_url:x.best_oa_location?.pdf_url||x.primary_location?.pdf_url||'',notes:'Extern gevonden via OpenAlex. Nog inhoudelijk beoordelen.',analysis:null,analysis_ranges:[],created_at:Date.now(),updated_at:Date.now()};await idbPut('works',w);await loadWorks();toast('Externe kandidaat bewaard.','good')}

async function renderBibPanel7(){const p=q('v7SearchPanel'),d=await loadBib7();const works=(d.per_work||[]).filter(x=>x.count).sort((a,b)=>a.author.localeCompare(b.author));p.innerHTML=`<div class="card v7-search-card"><div class="v7-section-head"><div><h4>Bibliografieketen</h4><p>Scriptorium heeft automatisch referentiekandidaten uit de bibliografieën van 55 tekstleesbare werken in het oorspronkelijke corpus gehaald. Gebruik deze als zoeksporen, niet als reeds geverifieerde metadata.</p></div><span class="badge accent">${d.references?.length||0} zoeksporen</span></div><div class="v7-form-grid"><label>Zoek in referenties<input id="v7BibQuery" placeholder="auteur, titelwoord, thema…"></label><label>Afkomstig uit<select id="v7BibSource"><option value="">Alle corpuswerken</option>${works.map(w=>`<option value="${esc7(w.work_id)}">${esc7(w.author)} — ${esc7(w.title.slice(0,70))}</option>`).join('')}</select></label></div><div class="row"><button class="btn primary" id="v7BibSearch">Filter bibliografie</button><button class="btn" id="v7BibRandom">Toon 20 andere</button></div><div class="callout"><strong>Waarom dit nuttig is:</strong> hiermee zoek je niet alleen op wat jij of OpenAlex spontaan bedenkt, maar volg je de literatuurketen die de 56 werken zelf gebruikten.</div></div><div id="v7BibResults" class="v7-results"></div>`;q('v7BibSearch').onclick=renderBibliography7;q('v7BibQuery').oninput=debounce(renderBibliography7,180);q('v7BibSource').onchange=renderBibliography7;q('v7BibRandom').onclick=()=>renderBibliography7(true);renderBibliography7()}
async function renderBibliography7(random=false){const d=await loadBib7(),box=q('v7BibResults');if(!box)return;const term=(q('v7BibQuery')?.value||'').toLowerCase(),src=q('v7BibSource')?.value||'';let refs=(d.references||[]).filter(r=>(!src||r.source_work_id===src)&&(!term||r.citation.toLowerCase().includes(term)));if(random)refs=refs.sort(()=>Math.random()-.5);refs=refs.slice(0,30);box.innerHTML=refs.map((r,i)=>{const search=r.citation.slice(0,180);const oa=`https://openalex.org/works?page=1&filter=default.search:${encodeURIComponent(search)}`;const ug=`https://biblio.ugent.be/publication?q=${encodeURIComponent('basic any "'+search.replaceAll('"',' ')+'"')}`;return `<article class="v7-result-card v7-bib-card"><div class="v7-result-meta"><span class="v7-prov prov-bibliography-chain">Via bibliografie</span><span>uit ${esc7(r.source_work_author||'corpus')}</span></div><p class="v7-citation">${esc7(r.citation)}</p><div class="tiny">Bronwerk: ${esc7(r.source_work_title||'')} · bibliografie vanaf ongeveer fysieke PDF-p. ${r.source_pdf_page_start||'?'}</div><div class="row"><a class="btn small" target="_blank" href="${oa}">Zoek OpenAlex</a><a class="btn small" target="_blank" href="${ug}">Zoek UGent</a><button class="btn small" data-bib-save="${i}">Bewaar zoekspoor</button><button class="btn small" data-tg-share="${esc7(oa)}" data-tg-text="${esc7(r.citation.slice(0,150))}">Telegram</button></div><script type="application/json" id="v7bib_${i}">${JSON.stringify(r).replace(/</g,'\\u003c')}<\/script></article>`}).join('')||'<div class="empty">Geen referenties voor deze filter.</div>';box.querySelectorAll('[data-bib-save]').forEach(b=>b.onclick=()=>saveBibLead7(+b.dataset.bibSave));bindTelegramButtons7(box)}
async function saveBibLead7(i){const r=JSON.parse(q('v7bib_'+i).textContent);const w={id:uid(),filename:'(bibliografisch zoekspoor — nog verifiëren)',file_size:0,title:r.citation.slice(0,180),author:'',institution:'',year:'',document_type:'Bibliografisch zoekspoor',field:'',rug01:'',page_count:null,weight:'aanvullend',origin:'bibliography_chain',provenance_category:'bibliography_chain',source_url:'',notes:`Automatisch uit bibliografie van ${r.source_work_author}: ${r.source_work_title}. Metadata nog verifiëren vóór inhoudelijke analyse.`,analysis:null,analysis_ranges:[],created_at:Date.now(),updated_at:Date.now()};await idbPut('works',w);await loadWorks();toast('Bibliografisch zoekspoor bewaard. Verifieer auteur/titel/PDF voordat je het als echt corpuswerk gebruikt.','good')}

function renderAuthorPanel7(){const p=q('v7SearchPanel');p.innerHTML=`<div class="card v7-search-card"><div class="v7-section-head"><div><h4>Zoek per auteur</h4><p>Gebruik een auteur als vertrekpunt om nieuwe proefschriften, publicaties en onderzoekslijnen te volgen. Voor UGent kun je rechtstreeks de Biblio-index gebruiken.</p></div><span class="badge">auteursnetwerk</span></div><div class="v7-form-grid"><label>Auteur<input id="v7AuthorName" placeholder="bv. Koenraad Verboven"></label><label>Extra thema<input id="v7AuthorTheme" placeholder="optioneel"></label></div><div class="row"><button class="btn primary" id="v7AuthorUg">Zoek UGent</button><button class="btn" id="v7AuthorOA">Zoek OpenAlex</button></div><div class="v7-author-chips">${UGENT_MEMBERS.map(a=>`<button data-author-preset="${esc7(a)}">${esc7(a)}</button>`).join('')}</div></div><div id="v7AuthorResults" class="v7-results"></div>`;p.querySelectorAll('[data-author-preset]').forEach(b=>b.onclick=()=>{q('v7AuthorName').value=b.dataset.authorPreset;q('v7AuthorUg').click()});q('v7AuthorUg').onclick=()=>{const a=q('v7AuthorName').value.trim(),t=q('v7AuthorTheme').value.trim();if(!a)return;selectSearchTab7('ugent');q('v7UgAuthor').value=a;q('v7UgQuery').value=t;searchUg7()};q('v7AuthorOA').onclick=()=>{const a=q('v7AuthorName').value.trim(),t=q('v7AuthorTheme').value.trim();if(!a)return;selectSearchTab7('openalex');q('v7OaQuery').value=[a,t].filter(Boolean).join(' ');searchOa7()}}

function renderTheoryHub7(){const hub=q('v7TheoryHub');if(!hub)return;hub.innerHTML=`<section class="v7-theory-overview"><div class="v7-section-head"><div><h3>Theorie als onderzoeksroute</h3><p>Begin niet bij losse tips. Kies de fase waarin je zit en werk van probleem naar methode, bewijs, argument en verdediging. Elke theorieles gebruikt voorbeelden uit meerdere corpuswerken.</p></div><span class="badge accent">23 modules</span></div><div class="v7-theory-pillars">${[
 ['🧭','Vraag & afbakening','m01','Modules 1–3: diagnose, onderzoeksvraag en operationalisering.'],['🏺','Corpus & bronkritiek','m04','Modules 4–5: representativiteit en maximale inferentie.'],['📚','Historiografie & methode','m06','Modules 6–10: debat, positionering, methode, theorie en triangulatie.'],['🧠','Argument & causaliteit','m11','Modules 11–18: bewijs, causaliteit, proxies, vergelijking, structuur en conclusie.'],['🛠️','Review & ontwerp','m19','Modules 19–20: peer review en geïntegreerd onderzoeksontwerp.'],['🎓','Mastery','m21','Modules 21–23: Source Lab, mondelinge verdediging en Thesis Studio.']
 ].map(([ic,t,m,d])=>`<button class="v7-theory-pillar" data-theory-module="${m}"><span>${ic}</span><strong>${t}</strong><small>${d}</small></button>`).join('')}</div><div class="v7-theory-tools"><label>Zoek in corpusprincipes<input id="v7TheorySearch" placeholder="bv. causaliteit, representativiteit, conclusie"></label><button class="btn" id="v7TheoryTraining">Naar Training</button></div></section>`;hub.querySelectorAll('[data-theory-module]').forEach(b=>b.onclick=()=>window.openModuleTheory?.(b.dataset.theoryModule));q('v7TheoryTraining').onclick=()=>window.showPage('training');q('v7TheorySearch').oninput=()=>{const term=q('v7TheorySearch').value.toLowerCase();document.querySelectorAll('#lessons .lesson').forEach(x=>x.style.display=!term||x.textContent.toLowerCase().includes(term)?'':'none')}}

function mergeSyncIntoSettings7(){const settings=q('page-settings'),sync=q('page-sync');if(!settings||!sync||q('v7SyncSettings'))return;const wrap=document.createElement('section');wrap.id='v7SyncSettings';wrap.className='v7-settings-section';wrap.innerHTML='<div class="v7-section-head"><div><h3>Synchronisatie & backup</h3><p>Bewaar je voortgang local-first en voeg desgewenst cloudsync toe. PDF-bestanden blijven lokaal; metadata, analyses, training en annotaties kunnen worden gesynchroniseerd.</p></div><span class="badge">veiligheid</span></div>';while(sync.firstChild)wrap.appendChild(sync.firstChild);settings.appendChild(wrap);sync.remove();document.querySelectorAll('#nav button[data-page="sync"]').forEach(x=>x.remove())}

function telegramShareUrl7(url,text){return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text||'')}`}
function bindTelegramButtons7(root=document){root.querySelectorAll('[data-tg-share]').forEach(b=>{if(b.dataset.tgBound)return;b.dataset.tgBound='1';b.onclick=()=>window.open(telegramShareUrl7(b.dataset.tgShare||location.href,b.dataset.tgText||''),'_blank','noopener')})}
function renderTelegramCard7(){if(q('v7TelegramCard'))return;const settings=q('page-settings');if(!settings)return;const card=document.createElement('div');card.id='v7TelegramCard';card.className='card v7-telegram-card';card.innerHTML=`<div class="v7-section-head"><div><h3>✈️ Telegram</h3><p>Deel een zoekresultaat, oefening of Scriptorium-link rechtstreeks naar Telegram. Voor automatische botmeldingen is een kleine server/Edge Function nodig; zet nooit een bot-token in deze publieke GitHub-app.</p></div><span class="badge accent">veilig delen</span></div><div class="v7-form-grid"><label>Optionele bot- of gebruikersnaam<input id="v7TelegramUser" placeholder="bv. ScriptoriumBot"></label><label>Standaardtekst<input id="v7TelegramText" value="Scriptorium — academisch onderzoek"></label></div><div class="row"><button class="btn primary" id="v7TelegramShareApp">Deel Scriptorium</button><button class="btn" id="v7TelegramShareExercise">Deel huidige oefening</button><button class="btn" id="v7TelegramOpen">Open Telegram-contact</button><a class="btn" target="_blank" href="https://t.me/BotFather">BotFather</a></div><div class="callout"><strong>Technische grens:</strong> de gewone deelfunctie werkt volledig vanuit GitHub Pages. Automatische berichten vanuit een bot vereisen server-side opslag van het bot-token; daarvoor zit een veilig Supabase Edge Function-sjabloon in het V7-pakket.</div>`;settings.appendChild(card);q('v7TelegramUser').value=localStorage.getItem('v7_telegram_user')||'';q('v7TelegramUser').onchange=()=>localStorage.setItem('v7_telegram_user',q('v7TelegramUser').value.trim());q('v7TelegramShareApp').onclick=()=>window.open(telegramShareUrl7(location.origin+location.pathname,q('v7TelegramText').value),'_blank');q('v7TelegramShareExercise').onclick=()=>{const ex=state.currentExercise;const text=ex?`Scriptorium oefening: ${ex.title}\n${ex.prompt}`:'Scriptorium training';window.open(telegramShareUrl7(location.href,text),'_blank')};q('v7TelegramOpen').onclick=()=>{const u=q('v7TelegramUser').value.trim().replace(/^@/,'');if(!u)return toast('Vul eerst een Telegram-gebruikers- of botnaam in.','warn');window.open(`https://t.me/${encodeURIComponent(u)}`,'_blank')}}

function renderPwaInstall7(){if(q('v7InstallCard'))return;const settings=q('page-settings');if(!settings)return;const card=document.createElement('div');card.id='v7InstallCard';card.className='card';card.innerHTML=`<div class="v7-section-head"><div><h3>📱 App installeren</h3><p>Een echte PWA opent zonder browserbalk en toont het Scriptorium-icoon. Een gewone homescreen-snelkoppeling blijft webmodus.</p></div><span class="badge" id="v7InstallState">controleren</span></div><div class="row"><button class="btn primary" id="v7InstallButton">Installeer Scriptorium</button><button class="btn" id="v7RefreshPwa">Vernieuw app-cache</button></div><p class="tiny" id="v7InstallHelp"></p>`;settings.appendChild(card);const update=()=>{const stand=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;const st=q('v7InstallState');st.textContent=stand?'Appmodus':'Webmodus';st.className='badge '+(stand?'good':'warn');q('v7InstallButton').disabled=stand;q('v7InstallHelp').textContent=stand?'Scriptorium draait als geïnstalleerde app.':deferredInstallPrompt?'Chrome heeft een echte installatieprompt beschikbaar. Klik op Installeer Scriptorium.':'Als de knop geen systeemvenster opent: gebruik Chrome zelf (geen custom tab), herlaad de site en open daarna opnieuw Instellingen. Op Android staat installatie vaak onder “Installeren en snelkoppelingen”.'};q('v7InstallButton').onclick=async()=>{if(deferredInstallPrompt){deferredInstallPrompt.prompt();await deferredInstallPrompt.userChoice;deferredInstallPrompt=null;update()}else toast('Chrome heeft momenteel geen PWA-installatieprompt vrijgegeven. Open de pagina rechtstreeks in Chrome en herlaad één keer.','warn')};q('v7RefreshPwa').onclick=async()=>{try{const keys=await caches.keys();await Promise.all(keys.filter(k=>k.startsWith('scriptorium-')).map(k=>caches.delete(k)));const reg=await navigator.serviceWorker?.getRegistration('./');await reg?.update();toast('App-cache vernieuwd. Herlaad nu één keer.','good')}catch(e){toast(e.message,'bad')}};update()}
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstallPrompt=e;if(q('v7InstallCard'))renderSettingsV7()});

async function hydrateSync7(){
  try{
    const rec=await idbGet('settings','v6_sb_config');const c=rec?.value||{};
    if(q('sbUrl')&&!q('sbUrl').value)q('sbUrl').value=c.url||'';
    if(q('sbKey')&&!q('sbKey').value)q('sbKey').value=c.key||'';
    if(q('sbEmail')&&!q('sbEmail').value)q('sbEmail').value=c.email||'';
    if(q('sbStatus')&&c.access_token)q('sbStatus').textContent=`Cloudsessie beschikbaar${c.user?.email?` voor ${c.user.email}`:''}.`;
  }catch(e){console.warn('V7 sync hydrate',e)}
}
function renderSettingsV7(){renderTelegramCard7();renderPwaInstall7();hydrateSync7()}

function addSourceExplorer7(){
  const page=q('page-sources');
  if(!page||q('v7SourceExplorer'))return;
  const card=document.createElement('div');
  card.id='v7SourceExplorer';
  card.className='card v7-source-explorer';
  card.innerHTML=`<div class="v7-section-head"><div><h3>🔎 Externe bronzoeker</h3><p>Gebruik de ingebouwde bibliotheek voor training en spring vanuit één zoekterm door naar gespecialiseerde brondatabanken voor epigrafie, papyrologie, munten en teksten.</p></div><span class="badge">brononderzoek</span></div><div class="v7-form-grid"><label>Zoekterm<input id="v7SourceExternalQuery" placeholder="bv. Augustus, Salamis, grain, women"></label></div><div class="v7-source-links"><a data-db="aio" target="_blank">Attic Inscriptions Online</a><a href="https://papyri.info/" target="_blank">Papyri.info</a><a href="https://numismatics.org/ocre/" target="_blank">OCRE munten</a><a href="https://scaife.perseus.org/" target="_blank">Perseus / Scaife</a><a href="https://romaninscriptionsofbritain.org/" target="_blank">RIB</a></div><div class="tiny">Scriptorium importeert resultaten niet automatisch als “waarheid”. Voeg alleen een bronrecord toe wanneer tekst/objectdata en provenance controleerbaar zijn.</div>`;
  const first=page.querySelector('.card');
  if(first)first.insertAdjacentElement('beforebegin',card);else page.appendChild(card);
  const upd=()=>{
    const term=q('v7SourceExternalQuery').value.trim();
    card.querySelector('[data-db="aio"]').href=term?`https://www.atticinscriptions.com/search/?q=${encodeURIComponent(term)}`:'https://www.atticinscriptions.com/';
  };
  q('v7SourceExternalQuery').oninput=upd;
  upd();
}

function bindGlobal7(){q('corpusProvenance')?.addEventListener('change',()=>{state.corpusPage=1;window.renderCorpus()});bindTelegramButtons7();document.addEventListener('click',e=>{const tg=e.target.closest('#v7MobileTelegram');if(tg){e.preventDefault();window.open(telegramShareUrl7(location.href,'Scriptorium V7'),'_blank')}});}

function brandV7(){
  document.title='Scriptorium V7 — Academische Onderzoekscoach';
  document.querySelectorAll('.version-pill').forEach(x=>x.textContent='V7');
  const sm=document.querySelector('.brand small');
  if(sm)sm.textContent='Academische onderzoekscoach · corpus · bronnen · theorie · training';
  const sub=document.querySelector('.topbar-sub');
  if(sub)sub.textContent='Scriptorium V7 · onderzoek, bronnen en vaardigheden in één werkruimte';
}
async function modernizeV7(){
  brandV7();
  try{await normalizeProvenance7()}catch(e){console.warn('V7 provenance',e)}
  try{restructureNav7()}catch(e){console.warn('V7 nav',e)}
  try{patchMobileNav7()}catch(e){console.warn('V7 mobile nav',e)}
  try{installAnimations7()}catch(e){console.warn('V7 animations',e)}
  try{mergeSyncIntoSettings7()}catch(e){console.warn('V7 settings merge',e)}
  try{renderSettingsV7()}catch(e){console.warn('V7 settings',e)}
  try{addSourceExplorer7()}catch(e){console.warn('V7 source explorer',e)}
  try{bindGlobal7()}catch(e){console.warn('V7 bindings',e)}
  const urlPage=new URL(location.href).searchParams.get('page');
  if(urlPage&&['dashboard','corpus','exchange','discovery','sources','atelier','training','progress','settings'].includes(urlPage)){
    v7HistoryLock=true;window.showPage(urlPage,{noHistory:true});v7HistoryLock=false
  }else{
    history.replaceState({page:currentPage7()},'',location.href)
  }
  if(currentPage7()==='discovery')renderSearchHub7();
  if(currentPage7()==='atelier')renderTheoryHub7();
  if(currentPage7()==='corpus')window.renderCorpus();
}
window.SCRIPTORIUM_V7_MODERNIZE=modernizeV7;

window.init=async function(){
  brandV7();
  try{
    if(V7_PREV_INIT)await V7_PREV_INIT();
  }catch(e){
    console.error('V7 compatibility init',e);
    const n=document.getElementById('bootNotice');
    if(n){n.hidden=false;n.textContent='Een oude compatibiliteitslaag gaf een fout; V7 is in veilige modus verder gestart.'}
  }
  await modernizeV7();
};
})();

/* ===== v7_1.js ===== */
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
  if(!text)throw new Error('Plak een H5P-URL of iframe-code.');
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
  const page=document.getElementById('page-training');if(!page||document.getElementById('v71H5PCard'))return;
  const card=document.createElement('div');card.id='v71H5PCard';card.className='card v71-h5p-card';
  card.innerHTML=`<div class="spread"><div><h4>🧩 H5P-lab <span class="badge">optioneel</span></h4><p>H5P is aanvullend op Scriptorium, niet de kern. Gebruik het voor korte interactieve retrieval; open historische redenering blijft in de native training.</p></div><span class="badge accent">licht geladen: alleen embed bij openen</span></div>
  <div class="h5p-purpose-grid">
    <div><strong>Multiple choice / invulvraag</strong><span>snelle feitenretrieval en begrippen</span></div>
    <div><strong>Drag & drop / ordenen</strong><span>chronologie, categorieën, processen</span></div>
    <div><strong>Image hotspots</strong><span>kaart, inscriptie, munt of object observeren</span></div>
    <div><strong>Interactive video</strong><span>alleen nuttig bij colleges/beeldmateriaal</span></div>
  </div>
  <div class="callout warn" style="margin-top:12px"><strong>Efficiëntste werkwijze voor Athenaeum:</strong> maak H5P in Lumi of een H5P-platform. Publiceer/exporteer de oefening vervolgens als webpagina en gebruik bij voorkeur een URL onder hetzelfde Athenaeum-domein. Same-origin oefeningen kunnen xAPI-score en voltooiing automatisch doorgeven; externe embeds blijven veilig geïsoleerd en worden desnoods handmatig voltooid. De zware H5P-editor wordt bewust niet in deze PWA ingebouwd.</div>
  <div class="grid two" style="margin-top:12px"><div class="field"><label>Doel / type<select id="v71H5PType"><option>Feitenretrieval</option><option>Chronologie / ordening</option><option>Bronobservatie</option><option>Interactieve video</option><option>Anders</option></select></label><label style="margin-top:8px">Titel<input id="v71H5PName" placeholder="bv. Epigrafische bronkritiek"></label></div><div class="field"><label>H5P-URL of iframe-code<textarea id="v71H5PCode" placeholder='<iframe src="https://…"></iframe>'></textarea></label></div></div>
  <div class="row"><button class="btn primary" id="v71H5PAdd">H5P toevoegen</button></div><div id="v71H5PList" style="margin-top:12px"></div>`;
  const launch=page.querySelector('.training-launch-card');if(launch)launch.insertAdjacentElement('afterend',card);else page.appendChild(card);
  card.querySelector('#v71H5PAdd').onclick=async()=>{try{const url=parseH5PInput(card.querySelector('#v71H5PCode').value),st=await h5pState();st.items.push({id:'h5p_'+Date.now().toString(36)+Math.random().toString(36).slice(2,7),title:card.querySelector('#v71H5PName').value.trim()||'H5P-oefening',content_type:card.querySelector('#v71H5PType').value,url,created_at:Date.now(),updated_at:Date.now()});await saveH5P(st);card.querySelector('#v71H5PName').value='';card.querySelector('#v71H5PCode').value='';renderH5PList();toast71('H5P-oefening toegevoegd.','good')}catch(e){toast71(e.message,'bad')}};
  renderH5PList()
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

async function enhanceV71(){
  brand71();
  installCentralSyncCard();
  installH5P();
  installSharedCatalog();
  enforceDeviceGrid();
  if(!document.documentElement.dataset.v71gridbound){
    document.documentElement.dataset.v71gridbound='1';
    addEventListener('resize',enforceDeviceGrid,{passive:true});
    window.visualViewport?.addEventListener('resize',enforceDeviceGrid,{passive:true});
  }
  setTimeout(()=>{patchShareButtons();renderSharedCatalog()},120);
}
window.SCRIPTORIUM_V71_ENHANCE=enhanceV71;

window.init=async function(){
  brand71();
  const compact=await compactLocalBeforeInit();
  if(compact.changed)console.info(`Scriptorium V7.1 compacted ${compact.changed} local work records before load.`);
  await PREV_INIT();
  await enhanceV71();
};

})();

/* ===== v7_2.js ===== */
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

/* ===== v7_3.js ===== */
(function(){
'use strict';
const PID=window.ATH_PROFILE_ID||localStorage.getItem('athenaeum_current_profile')||'';
const PREV_INIT=window.init;
const esc3=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function brand73(){document.title='Scriptorium V8.1 — AI-docent';document.querySelectorAll('.version-pill').forEach(x=>x.textContent='V8.1');const sm=document.querySelector('.brand small');if(sm)sm.textContent='V8.1 · AI-docent · veilige start · incrementele sync · H5P';}
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
window.SCRIPTORIUM_V73_ENHANCE=function(){brand73();bindAi73()};
window.init=async function(){await PREV_INIT();brand73();bindAi73();document.addEventListener('click',e=>{const n=e.target.closest('[data-page],[data-go]');if(n)setTimeout(bindAi73,0)},true)};
})();

/* ===== v7_4.js ===== */
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

/* ===== v7_5.js ===== */
(function(){
'use strict';
const PID=window.ATH_PROFILE_ID||localStorage.getItem('athenaeum_current_profile')||'';
const CLEAN_INIT=window.SCRIPTORIUM_V6_INIT;
let lessonCache=null,lessonCachePromise=null;
const fullCache=new Map();

function brand75(){
  document.title='Scriptorium V8.1 — Eindversie';
  document.querySelectorAll('.version-pill').forEach(x=>x.textContent='V8.1');
  const sm=document.querySelector('.brand small');if(sm)sm.textContent='V8.1 · eindversie · AI-docent · incrementele sync · H5P';
  const sub=document.querySelector('.topbar-sub');if(sub)sub.textContent='Scriptorium V8.1 · apparaatbewust · metadata-first · AI-docent';
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
  for(const id of ids){const w=await fullWork(id);if(!w?.analysis)continue;out.push({author:w.author,title:w.title,weight:w.weight,skill_lessons:(w.analysis.skill_lessons||[]).slice(0,5),writing_techniques:(w.analysis.writing_techniques||[]).slice(0,5),research_techniques:(w.analysis.research_techniques||[]).slice(0,5),anti_patterns:(w.analysis.anti_patterns||[]).slice(0,3)})}
  return out;
}
async function atelierAi75(){
  const text=document.getElementById('ownText')?.value.trim()||'';if(text.length<80)return toast('Plak eerst een voldoende lang eigen fragment.','warn');const goal=document.getElementById('atelierGoal')?.value||'Academische kwaliteit verbeteren',box=document.getElementById('atelierAiFeedback'),btn=document.getElementById('atelierAiReview');if(btn){btn.disabled=true;btn.textContent='AI-docent beoordeelt…'};if(box)box.innerHTML='<div class="empty">Gerichte feedback wordt opgebouwd…</div>';
  try{const context=await selectedBenchmarkPayload75();const r=await AthAI.feedback(PID,{mode:'scriptorium_grade',attempt_id:'atelier_'+Date.now(),question:`Beoordeel dit eigen academische tekstfragment met doel: ${goal}. Geef alleen feedback en revisieacties; schrijf het fragment niet voor de student om.`,answer:text,expected:'Zelfstandig, precies, bronkritisch, methodologisch coherent en academisch helder.',context:JSON.stringify(context,null,2),rubric:'Gebruik de zes Scriptorium-dimensies. Master-niveau geschiedenis; 18+ is uitzonderlijk.'});if(box&&window.gradeHtml)box.innerHTML=gradeHtml(r.feedback,r.quota);else if(box)box.innerHTML=`<div class="callout good"><strong>${r.feedback.score}/20</strong><br>${esc75(r.feedback.verdict||'')}</div>`}catch(e){if(box)box.innerHTML=`<div class="callout bad">${esc75(e.message)}</div>`}finally{if(btn){btn.disabled=false;btn.textContent='🧑‍🏫 AI-docent feedback'}}
}
async function aiGrade75(){
  const ex=state.currentExercise;if(!ex)return toast('Genereer eerst een oefening.','warn');
  const answer=document.getElementById('trainingAnswer')?.value.trim()||'';if(answer.length<80)return toast('Werk je antwoord eerst voldoende uit.','warn');
  const btn=document.getElementById('aiGradeTraining');if(btn){btn.disabled=true;btn.textContent='AI-docent beoordeelt…'}
  try{
    await buildLessonCache();
    const attempt=await saveCurrentAttempt(answer,true),module=TRAINING_MODULES.find(m=>m.id===ex.module_id),bench=trainingBenchmarks(module),rubric=gradingRubric(module,ex.difficulty);
    const compactRubric={standard:rubric.standard,dimensions:rubric.dimensions,caps:(rubric.caps||[]).slice(0,6),difficulty:rubric.difficulty};
    const r=await AthAI.feedback(PID,{mode:'scriptorium_grade',attempt_id:attempt.attempt_id,question:exerciseText(ex),answer,expected:JSON.stringify(ex.expected||{}),context:JSON.stringify(bench),rubric:JSON.stringify(compactRubric)}),g=r.feedback;
    g.pass_18plus=Boolean(g.score>=18&&(g.critical_issues||[]).length===0);attempt.grade=g;attempt.ai_model=r.model_used;attempt.graded_at=Date.now();
    const s=activeSession();if(s&&attempt.module_id===s.module_id&&!s.graded_ids.includes(attempt.attempt_id))s.graded_ids.push(attempt.attempt_id);
    await saveTrainingState();renderTraining();renderTrainingFocus();const el=document.getElementById('trainingFeedback');if(el&&window.gradeHtml)el.innerHTML=gradeHtml(g,r.quota);
    toast(`AI-docent: ${Number(g.score).toFixed(1)}/20.`,g.score>=18?'good':g.score>=14?'warn':'bad')
  }catch(e){toast(e.message,'bad')}finally{if(btn){btn.disabled=false;btn.textContent='🧑‍🏫 AI-docent beoordelen'}}
}

async function aiGenerateTransfer80(){
  const ex=state.currentExercise;if(!ex)return toast('Open eerst een Scriptorium-oefening.','warn');
  const btn=document.getElementById('aiGenerateTransfer');if(btn){btn.disabled=true;btn.textContent='AI maakt transfervraag…'}
  try{
    const module=TRAINING_MODULES.find(m=>m.id===ex.module_id),sourceContext=(ex.materials||[]).map(m=>({label:m.label,text:m.text,translation:m.translation||'',source_type:m.source_type||'',authentic:m.authentic!==false,provenance:m.original_source_url||m.source_url||''})).slice(0,4);
    const r=await AthAI.generate(PID,{mode:'scriptorium_generate',goal:`Maak een nieuwe transfervraag voor module ${module?.n||''}: ${module?.title||''}. De vraag moet dezelfde vaardigheid in een andere redeneringshoek testen en feitenkennis koppelen aan bronkritiek/inferentie.`,module:module?.title||'',question_type:'methodologie',difficulty:Math.min(5,Math.max(2,ex.difficulty||3)),context:JSON.stringify(sourceContext),recent:JSON.stringify((state.training?.attempts||[]).filter(a=>a.module_id===ex.module_id).slice(-6).map(a=>a.exercise?.prompt||''))});
    const f=r.feedback,newEx={...ex,exercise_id:'tr_ai_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,7),signature:`ai|${ex.module_id}|${Date.now()}`,title:`AI-transfervraag · ${module?.title||ex.title}`,prompt:f.question,family:'ai-'+(f.question_type||'transfer'),difficulty:f.difficulty||ex.difficulty,mode:'guided',intro:`Nieuwe universitaire transfervraag. ${f.source_grounding||''}`,expected:{anchor_points:f.expected_points||[],follow_up:f.follow_up_prompt||'',ai_generated:true},created_at:Date.now()};
    state.currentExercise=newEx;state.training.current=newEx;await saveTrainingState();renderTrainingFocus();renderTraining();
    const box=document.getElementById('aiTransferQuestion');if(box)box.innerHTML=`<div class="callout good"><strong>Nieuwe transfervraag actief</strong><div class="tiny">${esc(f.question_type||'toepassing')} · niveau ${f.difficulty}/5 · ±${f.time_minutes} min</div></div>`;
    toast('Nieuwe AI-transfervraag geladen.','good')
  }catch(e){toast(e.message,'bad')}finally{if(btn){btn.disabled=false;btn.textContent='🧠 AI nieuwe transfervraag'}}
}

async function copyCompare75(){
  const text=$('#ownText').value.trim(),goal=$('#atelierGoal').value;if(!text)return toast('Plak eerst je eigen tekst.','warn');const summary=await selectedBenchmarkPayload75();if(!summary.length)return toast('Kies minstens één geanalyseerd benchmarkwerk.','warn');const prompt=`Je bent mijn academische COACH, niet mijn ghostwriter. Vergelijk mijn tekst met geabstraheerde vaardigheden uit onderstaande Scriptorium-benchmarks. Doel: ${goal}.\n\nBENCHMARKVAARDIGHEDEN\n${JSON.stringify(summary,null,2)}\n\nMIJN TEKST\n${text}\n\nGeef diagnose, maximaal 5 overdraagbare verbeterprincipes, contextgrenzen, oefeningen en revisievolgorde. Schrijf mijn passage niet voor mij.`;await copyText(prompt);toast('Coachingsprompt gekopieerd.','good');
}
async function exportBackup75(){
  const keys=await storeKeys('works'),parts=[`{"scriptorium_backup":1,"exported_at":${JSON.stringify(new Date().toISOString())},"works":[`];let first=true;
  for(const key of keys){const w=await idbGet('works',key);if(!w)continue;if(!first)parts.push(',');parts.push(JSON.stringify(w));first=false}parts.push(']}');downloadBlob(new Blob(parts,{type:'application/json'}),`Scriptorium_backup_${new Date().toISOString().slice(0,10)}.json`);
}

function aiPanel75(s){
  const q=s?.quota||{},deepUsed=q.deep_used||0,deepLimit=q.deep_limit||10,deepRem=q.deep_remaining??Math.max(0,deepLimit-deepUsed),deepPct=deepLimit?Math.round(deepUsed/deepLimit*100):0,regUsed=q.regular_used||0,regLimit=q.regular_limit||60,regRem=q.regular_remaining??Math.max(0,regLimit-regUsed),regPct=regLimit?Math.round(regUsed/regLimit*100):0,p=s?.provider;
  return `<div class="card v74-ai-card"><div class="spread"><div><h4>🧑‍🏫 AI-docent</h4><p>Strenge feedback + nieuwe transfervragen. Geen chatbot en geen ghostwriter.</p></div><span class="v74-ai-led ${p?.reachable===false?'bad':'ok'}">${p?.reachable===false?'storing':'verbonden'}</span></div>
  <div class="v74-quota"><div class="spread"><strong>Diepe Scriptorium-feedback</strong><span><b>${deepRem}</b> van ${deepLimit} over</span></div><div class="v74-meter"><i style="width:${deepPct}%"></i></div></div>
  <div class="v74-quota"><div class="spread"><strong>AI-vraaggenerator / normale AI-acties</strong><span><b>${regRem}</b> van ${regLimit} over</span></div><div class="v74-meter"><i style="width:${regPct}%"></i></div></div>
  <div class="grid two" style="margin-top:12px"><div class="callout"><strong>Feedbackmodel</strong><div class="tiny">${esc75(s?.models?.scriptorium||'openai/gpt-oss-120b')}</div></div><div class="callout"><strong>Vraaggenerator</strong><div class="tiny">${esc75(s?.models?.generator||'openai/gpt-oss-20b')}</div></div></div>
  <div class="row" style="margin-top:12px"><button class="btn primary" id="v75AiRefresh">Status verversen</button><button class="btn" id="v75AiReconnect">Opnieuw verbinden</button></div><div class="tiny" style="margin-top:8px">${p?.latency_ms!=null?'Provider '+p.latency_ms+' ms · ':''}jouw volledige antwoord blijft behouden; alleen benchmarkcontext, rubric en herhaalde metadata worden compact gehouden om de TPM-limiet niet onnodig te overschrijden.</div></div>`;
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
  const e=document.getElementById('exportBackup');if(e)e.onclick=exportBackup75;const g=document.getElementById('aiGenerateTransfer');if(g)g.onclick=aiGenerateTransfer80;
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
  }catch(e){console.error('V8.1 boot',e);const n=document.getElementById('bootNotice');if(n){n.hidden=false;n.className='boot-notice bad';n.textContent='Scriptorium kon niet starten: '+(e.message||e)}}
};
})();

/* ===== BOOT ===== */
init();

/* ===== DEVICE / PWA DETECTION ===== */
(function(){
  function standalone(){
    return matchMedia('(display-mode: standalone)').matches
      || matchMedia('(display-mode: fullscreen)').matches
      || matchMedia('(display-mode: minimal-ui)').matches
      || navigator.standalone===true
      || document.referrer.startsWith('android-app://');
  }
  function device(){
    const ua=navigator.userAgent||'',touch=(navigator.maxTouchPoints||0)>0;
    const ipad=/iPad/i.test(ua)||(navigator.platform==='MacIntel'&&touch);
    const w=Math.round(visualViewport?.width||innerWidth),h=Math.round(visualViewport?.height||innerHeight);
    if(ipad)return{kind:'tablet',label:'iPad',profile:'touch-tablet'};
    if(touch&&Math.min(w,h)>=600&&Math.max(w,h)<=1500)return{kind:'tablet',label:'tablet',profile:'touch-tablet'};
    if(w<=720)return{kind:'phone',label:'telefoon',profile:'compact-touch'};
    if(touch&&w<=1180)return{kind:'tablet',label:'tablet',profile:'touch-tablet'};
    return{kind:'desktop',label:'laptop/desktop',profile:'wide-pointer'};
  }
  function apply(){
    const d=device(),a=standalone();
    document.body.classList.remove('device-phone','device-tablet','device-desktop');
    document.body.classList.add('device-'+d.kind);
    document.documentElement.dataset.device=d.kind;
    document.documentElement.dataset.displayMode=a?'app':'web';
    const chip=document.getElementById('installStatusChip');
    if(chip)chip.textContent=(a?'App':'Browser')+' · '+d.label;document.documentElement.dataset.deviceProfile=d.profile||d.kind;
  }
  addEventListener('resize',apply);
  visualViewport?.addEventListener('resize',apply);
  addEventListener('DOMContentLoaded',apply);
  apply();
})();


/* ===== V8.1 FINAL PRODUCT ENHANCEMENTS ===== */
(function(){
  const PIDF=window.ATH_PROFILE_ID||localStorage.getItem('athenaeum_current_profile')||'';
  function deviceLabelF(){const m=document.getElementById('installStatusChip')?.textContent||'automatisch';const p=document.documentElement.dataset.deviceProfile||document.documentElement.dataset.device||'auto';return{mode:m,profile:p}}
  function installDeviceCardF(){
    const page=document.getElementById('page-settings');if(!page||document.getElementById('finalDeviceCard'))return;
    const d=deviceLabelF(),card=document.createElement('div');card.className='card';card.id='finalDeviceCard';card.style.marginTop='14px';
    card.innerHTML=`<div class="spread"><div><h4>📱 Apparaat & automatische modus</h4><p>Scriptorium detecteert het toestel zelf en past layout en achtergrondwerk aan.</p></div><span class="badge good">${d.mode}</span></div>
    <div class="grid three" style="margin-top:10px"><div class="callout"><strong>Interface</strong><div class="tiny">${d.profile}</div></div><div class="callout"><strong>AI-feedback</strong><div class="tiny">cloud via Supabase/Groq · onafhankelijk van dit toestel</div></div><div class="callout"><strong>Corpus/sync</strong><div class="tiny">lokale PDF's · incrementele sync · zwaar werk vertraagd gestart</div></div></div>
    <div class="tiny" style="margin-top:8px"><strong>Gedetecteerd:</strong> ${Math.round(window.visualViewport?.width||innerWidth)}×${Math.round(window.visualViewport?.height||innerHeight)} · touch ${navigator.maxTouchPoints||0} · ${screen.orientation?.type||'oriëntatie onbekend'}<br>Vier of meer gelijktijdige gebruikers werken met gescheiden Supabase-accounts en gescheiden lokale databases. Syncstarts krijgen jitter zodat clients niet tegelijk dezelfde backendpiek veroorzaken.</div>`;
    const sys=document.getElementById('v75SystemCard');if(sys)sys.insertAdjacentElement('afterend',card);else page.appendChild(card)
  }
  function explainToolsF(){
    const c=document.querySelector('.tools-card');if(!c||c.dataset.finalized)return;c.dataset.finalized='1';
    c.querySelector('h4').textContent='Minitools · snelle werksjablonen';
    const p=c.querySelector('.spread p');if(p)p.textContent='Deze tools gebruiken geen AI. Ze kopiëren een compacte checklist of starten een lokale focustimer, zodat je sneller kunt werken zonder nieuwe afhankelijkheden.';
    const map={copyBronChecklist:['Bronkritiek-checklist','productie, doel, bias, bewijscapaciteit'],copySQChecklist:['SQ-debatkaart','orden secundaire literatuur als debat'],copyPlannerPrompt:['Onderzoeksplanner','vraag → corpus → methode → inferentie'],copyOralDefensePrompt:['Mondelinge verdediging','promotorvragen en zwakke plekken'],startPomodoro25:['25 min focus','lokale timer, geen cloud'],stopPomodoro:['Stop timer','annuleert alleen de lokale timer']};
    const grid=c.querySelector('.utility-grid');if(grid){grid.classList.add('utility-explain-grid');for(const b of grid.querySelectorAll('button')){const x=map[b.id];if(x)b.innerHTML=`<strong>${x[0]}</strong><span>${x[1]}</span>`}}
  }
  function addTransferBoxF(){const b=document.getElementById('aiGradeTraining');if(!b||document.getElementById('aiGenerateTransfer'))return;const g=document.createElement('button');g.className='btn';g.id='aiGenerateTransfer';g.textContent='🧠 AI nieuwe transfervraag';b.insertAdjacentElement('afterend',g);const box=document.createElement('div');box.id='aiTransferQuestion';box.style.marginTop='8px';g.parentElement?.insertAdjacentElement('afterend',box);g.onclick=aiGenerateTransfer80}
  const obs=new MutationObserver(()=>{installDeviceCardF();explainToolsF();addTransferBoxF()});obs.observe(document.body,{childList:true,subtree:true});
  setTimeout(()=>{installDeviceCardF();explainToolsF();addTransferBoxF()},100);
})();
