(function(){
'use strict';
const KEY='athenaeum_profiles_v1', CURRENT='athenaeum_current_profile';
const AVATARS=['bust','penguin','owl','lion','fox','bee'];
const APPS=['scriptorium','paideia'];
function uid(){return (crypto.randomUUID?crypto.randomUUID():'p_'+Date.now()+'_'+Math.random().toString(36).slice(2));}
function loadProfiles(){try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return []}}
function saveProfiles(v){localStorage.setItem(KEY,JSON.stringify(v))}
async function hashPin(pin,salt){if(!pin)return ''; const enc=new TextEncoder(); const data=enc.encode((salt||'')+'|'+pin); const digest=await crypto.subtle.digest('SHA-256',data); return [...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join('')}
function profileDataKey(id,key){return `ath_${id}_${key}`}
function getProfileData(id,key,def=null){try{const x=localStorage.getItem(profileDataKey(id,key)); return x===null?def:JSON.parse(x)}catch{return def}}
function setProfileData(id,key,value){localStorage.setItem(profileDataKey(id,key),JSON.stringify(value)); window.dispatchEvent(new CustomEvent('ath-data-changed',{detail:{profileId:id,key}}));}
function deleteProfileData(id){Object.keys(localStorage).filter(k=>k.startsWith(`ath_${id}_`)).forEach(k=>localStorage.removeItem(k));}
function currentProfileId(){return localStorage.getItem(CURRENT)||''}
function setCurrentProfile(id){if(id)localStorage.setItem(CURRENT,id);else localStorage.removeItem(CURRENT)}
function currentProfile(){const id=currentProfileId(); return loadProfiles().find(p=>p.id===id)||null}
function cleanApps(apps){return [...new Set(Array.isArray(apps)?apps:[])].filter(a=>APPS.includes(a))}
function profileApps(p){return Array.isArray(p?.apps)?cleanApps(p.apps):['scriptorium','paideia']}
async function createProfile({name,avatar='bust',pin='',apps=[]}){const profiles=loadProfiles(); const p={id:uid(),name:(name||'Gebruiker').trim(),avatar:AVATARS.includes(avatar)?avatar:'bust',apps:cleanApps(apps),created_at:Date.now(),updated_at:Date.now(),pin_salt:uid(),pin_hash:'',icecubes:2}; if(pin)p.pin_hash=await hashPin(pin,p.pin_salt); profiles.push(p); saveProfiles(profiles); return p}
async function updateProfile(id,patch){const ps=loadProfiles(),i=ps.findIndex(p=>p.id===id); if(i<0)throw new Error('Profiel niet gevonden'); const clean={...patch}; if(Object.prototype.hasOwnProperty.call(clean,'apps'))clean.apps=cleanApps(clean.apps); if(Object.prototype.hasOwnProperty.call(clean,'avatar')&&!AVATARS.includes(clean.avatar))clean.avatar='bust'; const next={...ps[i],...clean,updated_at:Date.now()}; if(Object.prototype.hasOwnProperty.call(clean,'pin')){next.pin_hash=clean.pin?await hashPin(clean.pin,next.pin_salt||uid()):''; delete next.pin;} ps[i]=next; saveProfiles(ps); return next}
async function verifyPin(p,pin){if(!p.pin_hash)return true; return (await hashPin(pin,p.pin_salt))===p.pin_hash}
function removeProfile(id){const ps=loadProfiles().filter(p=>p.id!==id);saveProfiles(ps);deleteProfileData(id);if(currentProfileId()===id)setCurrentProfile('')}
function ensureStarterProfiles(){const ps=loadProfiles();if(ps.length)return;saveProfiles([])}
function avatarUrl(a){return `./assets/avatars/${AVATARS.includes(a)?a:'bust'}.svg`}
function toast(msg){let wrap=document.querySelector('.toast-wrap'); if(!wrap){wrap=document.createElement('div');wrap.className='toast-wrap';document.body.appendChild(wrap)} const el=document.createElement('div');el.className='toast';el.textContent=msg;wrap.appendChild(el);setTimeout(()=>el.remove(),3200)}
window.AthStore={AVATARS,APPS,profileApps,uid,loadProfiles,saveProfiles,currentProfileId,setCurrentProfile,currentProfile,createProfile,updateProfile,verifyPin,removeProfile,getProfileData,setProfileData,ensureStarterProfiles,avatarUrl,toast,profileDataKey};
})();
