(function(){
'use strict';
const KEY='athenaeum_profiles_v1', CURRENT='athenaeum_current_profile';
const AVATARS=['bust','penguin','owl','lion','fox','bee'];
const APPS=['scriptorium','paideia'];
const uid=()=>crypto.randomUUID?crypto.randomUUID():'ath_'+Date.now()+'_'+Math.random().toString(36).slice(2);
function emit(type,detail={}){try{window.dispatchEvent(new CustomEvent(type,{detail}))}catch{}}
function storageSet(key,value){try{localStorage.setItem(key,value);return true}catch(e){const quota=e?.name==='QuotaExceededError'||e?.name==='NS_ERROR_DOM_QUOTA_REACHED';if(quota)throw new Error('Lokale opslag is vol. Synchroniseer of exporteer je profiel en verwijder oude lokale bestanden/analyses.');throw e}}
function storageUsage(){let chars=0,keys=0;try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i)||'',v=localStorage.getItem(k)||'';chars+=k.length+v.length;keys++}}catch{}return{keys,approx_bytes:chars*2,approx_mb:Number((chars*2/1048576).toFixed(2))}}
function loadProfiles(){try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return []}}
function saveProfiles(p){storageSet(KEY,JSON.stringify(p));emit('athenaeum-profile-change',{})}
async function hashPin(pin,salt){const bytes=new TextEncoder().encode(salt+'|'+pin);const d=await crypto.subtle.digest('SHA-256',bytes);return [...new Uint8Array(d)].map(x=>x.toString(16).padStart(2,'0')).join('')}
function profileDataKey(id,name){return `ath_${id}_${name}`}
function getProfileData(id,name,def=null){try{const v=localStorage.getItem(profileDataKey(id,name));return v==null?def:JSON.parse(v)}catch{return def}}
function setProfileData(id,name,value){storageSet(profileDataKey(id,name),JSON.stringify(value));emit('athenaeum-local-change',{profile_id:id,key:name})}
function deleteProfileData(id){Object.keys(localStorage).filter(k=>k.startsWith(`ath_${id}_`)).forEach(k=>localStorage.removeItem(k))}
function currentProfileId(){return localStorage.getItem(CURRENT)||''}
function setCurrentProfile(id){if(id)storageSet(CURRENT,id);else localStorage.removeItem(CURRENT)}
function currentProfile(){const id=currentProfileId(); return loadProfiles().find(p=>p.id===id)||null}
function cleanApps(apps){return [...new Set(Array.isArray(apps)?apps:[])].filter(a=>APPS.includes(a))}
function profileApps(p){return Array.isArray(p?.apps)?cleanApps(p.apps):['scriptorium','paideia']}
async function createProfile({name,avatar='bust',pin='',apps=[]}){const profiles=loadProfiles(); const p={id:uid(),name:(name||'Gebruiker').trim(),avatar:AVATARS.includes(avatar)?avatar:'bust',apps:cleanApps(apps),created_at:Date.now(),updated_at:Date.now(),pin_salt:uid(),pin_hash:'',icecubes:2}; if(pin)p.pin_hash=await hashPin(pin,p.pin_salt); profiles.push(p); saveProfiles(profiles); return p}
async function updateProfile(id,patch){const ps=loadProfiles(),i=ps.findIndex(p=>p.id===id); if(i<0)throw new Error('Profiel niet gevonden'); const clean={...patch}; if(Object.prototype.hasOwnProperty.call(clean,'apps'))clean.apps=cleanApps(clean.apps); if(Object.prototype.hasOwnProperty.call(clean,'avatar')&&!AVATARS.includes(clean.avatar))clean.avatar='bust'; const next={...ps[i],...clean,updated_at:Date.now()}; if(Object.prototype.hasOwnProperty.call(clean,'pin')){next.pin_hash=clean.pin?await hashPin(clean.pin,next.pin_salt||uid()):''; delete next.pin;} ps[i]=next; saveProfiles(ps); emit('athenaeum-local-change',{profile_id:id,key:'profile'}); return next}
async function verifyPin(profile,pin){if(!profile?.pin_hash)return true;return (await hashPin(pin,profile.pin_salt))===profile.pin_hash}
function removeProfile(id){const ps=loadProfiles().filter(p=>p.id!==id);saveProfiles(ps);deleteProfileData(id);if(currentProfileId()===id)setCurrentProfile('')}
function ensureStarterProfiles(){const ps=loadProfiles();if(ps.length)return;saveProfiles([])}
function avatarUrl(a){return `./assets/avatars/${AVATARS.includes(a)?a:'bust'}.svg`}
function toast(msg){let wrap=document.querySelector('.toast-wrap'); if(!wrap){wrap=document.createElement('div');wrap.className='toast-wrap';document.body.appendChild(wrap)} const el=document.createElement('div');el.className='toast';el.textContent=msg;wrap.appendChild(el);setTimeout(()=>el.remove(),3200)}
window.AthStore={AVATARS,APPS,profileApps,uid,loadProfiles,saveProfiles,currentProfileId,setCurrentProfile,currentProfile,createProfile,updateProfile,verifyPin,removeProfile,getProfileData,setProfileData,ensureStarterProfiles,avatarUrl,toast,profileDataKey,hashPin,storageUsage,storageSet};
})();
