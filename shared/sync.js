(function(){
'use strict';

const S=()=>window.AthStore;
const CLOUD_KEY='main';
const DEFAULT_URL='https://gtvgqmzkwawuhcnlkzfk.supabase.co';
const DEFAULT_KEY='sb_publishable_4okIfaZ1KklugItkYxKtDA_bzTdDgs0';
const REQUEST_TIMEOUT=15000;
const LIGHT_INTERVAL=2*60*1000;
const SCRIPTORIUM_INTERVAL=15*60*1000;

let lightTimer=null,scriptTimer=null,dirtyTimer=null;
let focusBound=false,visibilityBound=false,onlineBound=false;
let activePid='';
let suspendDirty=false;

const running=new Map();
const scriptRunning=new Map();

function cfg(pid){
  const base={
    url:DEFAULT_URL,key:DEFAULT_KEY,email:'',
    access_token:'',refresh_token:'',expires_at:0,user:null,
    enabled:false,last_sync:0,last_error:'',last_direction:'',
    cloud_profile_key:CLOUD_KEY,dirty_at:0,
    last_scriptorium_sync:0,last_scriptorium_error:''
  };
  const stored=S().getProfileData(pid,'sync',{});
  return {...base,...stored,url:stored?.url||DEFAULT_URL,key:stored?.key||DEFAULT_KEY,cloud_profile_key:CLOUD_KEY};
}

function saveCfg(pid,c){
  suspendDirty=true;
  S().setProfileData(pid,'sync',{...c,cloud_profile_key:CLOUD_KEY});
  suspendDirty=false;
}

function status(pid){
  const c=cfg(pid);
  return {
    enabled:!!c.enabled,
    signed_in:!!c.user?.id,
    email:c.user?.email||c.email||'',
    last_sync:c.last_sync||0,
    last_error:c.last_error||'',
    last_direction:c.last_direction||'',
    last_scriptorium_sync:c.last_scriptorium_sync||0,
    last_scriptorium_error:c.last_scriptorium_error||'',
    cloud_key:CLOUD_KEY,
    syncing:running.has(pid),
    scriptorium_syncing:scriptRunning.has(pid)
  };
}

function linkProfileToCloud(pid,user,email=''){
  if(!pid||!user?.id)return;
  const ps=S().loadProfiles(),i=ps.findIndex(p=>p.id===pid);
  if(i<0)return;
  ps[i]={
    ...ps[i],
    cloud_user_id:user.id,
    cloud_email:(user.email||email||ps[i].cloud_email||'').toLowerCase(),
    updated_at:Math.max(ps[i].updated_at||0,Date.now())
  };
  S().saveProfiles(ps);
}

function baseHeaders(key,extra={}){return {'apikey':key,'Content-Type':'application/json',...extra}}

async function rawRequest(url,key,path,opt={}){
  if(!url||!key)throw new Error('Supabase URL/key ontbreken.');
  const endpoint=url.replace(/\/$/,'')+path;
  const ctl=new AbortController(),tm=setTimeout(()=>ctl.abort(),REQUEST_TIMEOUT);
  let r;
  try{
    r=await fetch(endpoint,{
      ...opt,mode:'cors',credentials:'omit',cache:'no-store',
      signal:ctl.signal,
      headers:baseHeaders(key,opt.headers||{})
    });
  }catch(e){
    clearTimeout(tm);
    if(e?.name==='AbortError')throw new Error('Cloudserver antwoordt niet binnen 15 seconden.');
    throw new Error(`Cloudserver niet bereikbaar. Technisch: ${e?.message||'Failed to fetch'}`);
  }
  clearTimeout(tm);

  let data=null,text='';
  try{
    text=await r.text();
    data=text?JSON.parse(text):null;
  }catch{
    data=text||null;
  }

  if(!r.ok){
    const msg=(data&&typeof data==='object'&&(data.msg||data.message||data.error_description||data.error))
      ||String(data||'').slice(0,300)||`${r.status} ${r.statusText}`;
    throw new Error(`${r.status}: ${msg}`);
  }
  return data;
}

async function request(pid,path,opt={}){
  const c=cfg(pid);
  return rawRequest(c.url,c.key,path,opt);
}

async function storeSession(pid,d){
  const c=cfg(pid);
  saveCfg(pid,{
    ...c,
    access_token:d.access_token||c.access_token,
    refresh_token:d.refresh_token||c.refresh_token,
    user:d.user||c.user,
    expires_at:Date.now()+((d.expires_in||3600)*1000),
    enabled:true,last_error:''
  });
  linkProfileToCloud(pid,d.user||c.user,c.email);
}

async function auth(pid,email,password,signup=false){
  const c=cfg(pid);
  saveCfg(pid,{...c,email});
  const d=await request(pid,signup?'/auth/v1/signup':'/auth/v1/token?grant_type=password',{
    method:'POST',
    body:JSON.stringify({email,password})
  });
  if(d.user)linkProfileToCloud(pid,d.user,email);
  if(d.access_token)await storeSession(pid,d);
  return d;
}

async function access(pid){
  let c=cfg(pid);
  if(c.access_token&&c.expires_at>Date.now()+60000)return c.access_token;
  if(!c.refresh_token)throw new Error('Meld eerst aan.');
  const d=await request(pid,'/auth/v1/token?grant_type=refresh_token',{
    method:'POST',body:JSON.stringify({refresh_token:c.refresh_token})
  });
  await storeSession(pid,d);
  return d.access_token;
}

function plain(x){return x&&typeof x==='object'&&!Array.isArray(x)}
function stamp(x){return Number(x?.updated_at||x?.graded_at||x?.analysis_updated_at||x?.created_at||0)||0}

function stableKey(x){
  if(x==null)return 'null';
  if(typeof x!=='object')return typeof x+':'+String(x);
  for(const k of ['id','attempt_id','pack_id','work_id','key','date','source_id','doi','title']){
    if(x[k]!=null)return `${k}:${String(x[k])}`;
  }
  try{
    const keys=Object.keys(x).sort();
    return 'json:'+JSON.stringify(x,keys);
  }catch{
    return null;
  }
}

function mergeArrays(a=[],b=[]){
  if(!Array.isArray(a))a=[];
  if(!Array.isArray(b))b=[];
  const out=new Map();
  const loose=[];
  for(const x of [...a,...b]){
    const k=stableKey(x);
    if(!k){loose.push(x);continue}
    const old=out.get(k);
    if(old===undefined){out.set(k,x);continue}
    if(plain(old)&&plain(x)){
      const os=stamp(old),xs=stamp(x);
      if(os&&xs){
        out.set(k,xs>=os?x:old);
      }else{
        out.set(k,x);
      }
    }else out.set(k,x);
  }
  return [...out.values(),...loose];
}

function mergeValue(a,b){
  if(a==null)return b;
  if(b==null)return a;
  if(Array.isArray(a)||Array.isArray(b))return mergeArrays(Array.isArray(a)?a:[],Array.isArray(b)?b:[]);
  if(plain(a)&&plain(b)){
    const as=stamp(a),bs=stamp(b);
    if(as&&bs){
      if(bs>as)return {...a,...b};
      if(as>bs)return {...b,...a};
      // Same version: never recursively re-merge identical heavy objects.
      return {...a,...b};
    }
    const out={...a};
    for(const [k,v] of Object.entries(b))out[k]=k in out?mergeValue(out[k],v):v;
    return out;
  }
  return b;
}

function mergePaideia(a={},b={}){
  const newer=(stamp(b)>=stamp(a))?b:a,older=newer===b?a:b;
  const out={...older,...newer};
  for(const k of ['completed_dates','weekly_scores','monthly_scores','history']){
    out[k]=mergeArrays(a[k]||[],b[k]||[]);
  }
  out.daily_count=Math.max(Number(a.daily_count||0),Number(b.daily_count||0));
  out.updated_at=Math.max(stamp(a),stamp(b),Date.now());
  return out;
}

function mergeData(a={},b={}){
  const out={...a};
  for(const [k,v] of Object.entries(b||{})){
    if(k==='paideia_state')out[k]=mergePaideia(out[k]||{},v||{});
    else out[k]=k in out?mergeValue(out[k],v):v;
  }
  return out;
}

function profileSnapshot(p){
  const c=cfg(p.id);
  return {
    id:p.id,name:p.name,avatar:p.avatar,apps:S().profileApps(p),
    icecubes:p.icecubes,pin_hash:p.pin_hash||'',pin_salt:p.pin_salt||'',
    cloud_user_id:p.cloud_user_id||c.user?.id||'',
    cloud_email:p.cloud_email||c.user?.email||c.email||'',
    updated_at:p.updated_at||0
  };
}

function localData(pid){
  const data={};
  Object.keys(localStorage)
    .filter(k=>k.startsWith(`ath_${pid}_`)&&!k.endsWith('_sync'))
    .forEach(k=>{
      try{data[k.slice(`ath_${pid}_`.length)]=JSON.parse(localStorage.getItem(k))}
      catch{}
    });
  return data;
}

// LIGHTWEIGHT STATE ONLY.
// Scriptorium works/analyses are deliberately excluded from athenaeum_state.
async function collect(pid){
  const p=S().loadProfiles().find(x=>x.id===pid);
  if(!p)throw new Error('Profiel bestaat lokaal niet.');
  return {
    schema:3,
    profile:profileSnapshot(p),
    data:localData(pid),
    updated_at:Date.now()
  };
}

function merge(local,remote){
  if(!remote)return local;
  const lp=local.profile||{},rp=remote.profile||{};
  const newer=(rp.updated_at||0)>(lp.updated_at||0)?rp:lp;
  return {
    schema:3,
    profile:{...lp,...rp,...newer,id:lp.id},
    data:mergeData(local.data||{},remote.data||{}),
    updated_at:Date.now()
  };
}

async function apply(pid,payload){
  suspendDirty=true;
  try{
    if(payload.profile){
      const ps=S().loadProfiles(),i=ps.findIndex(p=>p.id===pid);
      if(i>=0){
        ps[i]={
          ...ps[i],
          name:payload.profile.name||ps[i].name,
          avatar:payload.profile.avatar||ps[i].avatar,
          apps:Array.isArray(payload.profile.apps)?payload.profile.apps:ps[i].apps,
          icecubes:payload.profile.icecubes??ps[i].icecubes,
          pin_hash:payload.profile.pin_hash??ps[i].pin_hash,
          pin_salt:payload.profile.pin_salt||ps[i].pin_salt,
          cloud_user_id:payload.profile.cloud_user_id||ps[i].cloud_user_id||'',
          cloud_email:(payload.profile.cloud_email||ps[i].cloud_email||'').toLowerCase(),
          updated_at:Math.max(ps[i].updated_at||0,payload.profile.updated_at||0)
        };
        S().saveProfiles(ps);
      }
    }
    for(const [k,v] of Object.entries(payload.data||{}))S().setProfileData(pid,k,v);
  }finally{
    suspendDirty=false;
  }
}

async function queryState(pid,token,userId){
  let rows=await request(pid,
    `/rest/v1/athenaeum_state?user_id=eq.${encodeURIComponent(userId)}&profile_key=eq.${CLOUD_KEY}&select=profile_key,payload,updated_at`,
    {headers:{Authorization:`Bearer ${token}`}}
  );
  if(Array.isArray(rows)&&rows[0])return rows[0];
  rows=await request(pid,
    `/rest/v1/athenaeum_state?user_id=eq.${encodeURIComponent(userId)}&select=profile_key,payload,updated_at&order=updated_at.desc&limit=1`,
    {headers:{Authorization:`Bearer ${token}`}}
  );
  return Array.isArray(rows)?rows[0]||null:null;
}

async function pull(pid){
  const token=await access(pid),c=cfg(pid),u=c.user;
  if(!u?.id)throw new Error('Gebruiker ontbreekt.');
  const row=await queryState(pid,token,u.id);
  return row?.payload||null;
}

async function push(pid,payload){
  const token=await access(pid),c=cfg(pid),u=c.user;
  if(!u?.id)throw new Error('Gebruikers-ID ontbreekt.');
  const light={
    schema:3,
    profile:payload.profile||{},
    data:payload.data||{},
    updated_at:payload.updated_at||Date.now()
  };
  await request(pid,'/rest/v1/athenaeum_state?on_conflict=user_id,profile_key',{
    method:'POST',
    headers:{
      Authorization:`Bearer ${token}`,
      Prefer:'resolution=merge-duplicates,return=minimal'
    },
    body:JSON.stringify({
      user_id:u.id,
      profile_key:CLOUD_KEY,
      payload:light,
      updated_at:new Date().toISOString()
    })
  });
}

function emitSync(pid,phase,error=''){
  try{
    window.dispatchEvent(new CustomEvent('athenaeum-sync',{
      detail:{pid,phase,error,status:status(pid)}
    }));
  }catch{}
}

async function syncNow(pid){
  if(running.has(pid))return running.get(pid);
  const task=(async()=>{
    emitSync(pid,'syncing');
    try{
      const local=await collect(pid);
      const remote=await pull(pid);
      const merged=merge(local,remote);
      await apply(pid,merged);
      await push(pid,merged);
      const c=cfg(pid);
      saveCfg(pid,{
        ...c,last_sync:Date.now(),last_error:'',
        last_direction:'licht merge',enabled:true,dirty_at:0
      });
      emitSync(pid,'done');
      return merged;
    }catch(e){
      const c=cfg(pid);
      saveCfg(pid,{...c,last_error:e.message||String(e)});
      emitSync(pid,'error',e.message||String(e));
      throw e;
    }finally{
      running.delete(pid);
    }
  })();
  running.set(pid,task);
  return task;
}

async function pullOnly(pid){
  const remote=await pull(pid);
  if(!remote)throw new Error('Nog geen cloudprofiel gevonden.');
  const local=await collect(pid),merged=merge(local,remote);
  await apply(pid,merged);
  const c=cfg(pid);
  saveCfg(pid,{...c,last_sync:Date.now(),last_error:'',last_direction:'cloud→lokaal',enabled:true});
  emitSync(pid,'done');
  return merged;
}

async function pushOnly(pid){
  const local=await collect(pid);
  await push(pid,local);
  const c=cfg(pid);
  saveCfg(pid,{...c,last_sync:Date.now(),last_error:'',last_direction:'lokaal→cloud',enabled:true,dirty_at:0});
  emitSync(pid,'done');
  return local;
}

/* ---------------- SCRIPTORIUM INCREMENTAL SYNC ---------------- */

function openIDB(name){
  return new Promise((res,rej)=>{
    const r=indexedDB.open(name,3);
    r.onupgradeneeded=e=>{
      const d=e.target.result;
      if(!d.objectStoreNames.contains('works'))d.createObjectStore('works',{keyPath:'id'});
      if(!d.objectStoreNames.contains('files'))d.createObjectStore('files',{keyPath:'id'});
      if(!d.objectStoreNames.contains('settings'))d.createObjectStore('settings',{keyPath:'key'});
    };
    r.onsuccess=()=>res(r.result);
    r.onerror=()=>rej(r.error);
  });
}

function idbGet(db,store,key){
  return new Promise((res,rej)=>{
    if(!db.objectStoreNames.contains(store))return res(null);
    const r=db.transaction(store).objectStore(store).get(key);
    r.onsuccess=()=>res(r.result||null);
    r.onerror=()=>rej(r.error);
  });
}

function idbPut(db,store,val){
  return new Promise((res,rej)=>{
    const r=db.transaction(store,'readwrite').objectStore(store).put(val);
    r.onsuccess=()=>res();
    r.onerror=()=>rej(r.error);
  });
}

function idbMeta(db,store,keyField){
  return new Promise((res,rej)=>{
    if(!db.objectStoreNames.contains(store))return res([]);
    const out=[];
    const tx=db.transaction(store,'readonly');
    const req=tx.objectStore(store).openCursor();
    req.onsuccess=e=>{
      const c=e.target.result;
      if(!c)return;
      const v=c.value||{};
      out.push({
        key:String(v[keyField]??c.primaryKey),
        updated_at:Number(v.updated_at||0)
      });
      c.continue();
    };
    req.onerror=()=>rej(req.error);
    tx.oncomplete=()=>res(out);
    tx.onerror=()=>rej(tx.error);
  });
}

function dedupeRanges(arr){
  if(!Array.isArray(arr))return [];
  const seen=new Set(),out=[];
  for(const r of arr){
    const key=plain(r)?`${r.start??''}|${r.end??''}`:JSON.stringify(r);
    if(seen.has(key))continue;
    seen.add(key);out.push(r);
  }
  return out;
}

function sanitizeWork(w){
  if(!plain(w))return w;
  const a=dedupeRanges(w.analysis_ranges||[]);
  const p=dedupeRanges(w.pending_ranges||[]);
  if(a.length===(w.analysis_ranges||[]).length&&p.length===(w.pending_ranges||[]).length)return w;
  return {...w,analysis_ranges:a,pending_ranges:p};
}

function ms(ts){
  if(typeof ts==='number')return ts;
  const n=Date.parse(ts||'');
  return Number.isFinite(n)?n:0;
}

async function cloudWorkMeta(pid,token,userId){
  const rows=await request(pid,
    `/rest/v1/athenaeum_scriptorium_works?user_id=eq.${encodeURIComponent(userId)}&select=work_id,updated_at`,
    {headers:{Authorization:`Bearer ${token}`}}
  );
  return Array.isArray(rows)?rows:[];
}

async function cloudSettingMeta(pid,token,userId){
  const rows=await request(pid,
    `/rest/v1/athenaeum_scriptorium_settings?user_id=eq.${encodeURIComponent(userId)}&select=setting_key,updated_at`,
    {headers:{Authorization:`Bearer ${token}`}}
  );
  return Array.isArray(rows)?rows:[];
}

async function fetchCloudWork(pid,token,userId,workId){
  const rows=await request(pid,
    `/rest/v1/athenaeum_scriptorium_works?user_id=eq.${encodeURIComponent(userId)}&work_id=eq.${encodeURIComponent(workId)}&select=payload,updated_at&limit=1`,
    {headers:{Authorization:`Bearer ${token}`}}
  );
  return Array.isArray(rows)&&rows[0]?rows[0]:null;
}

async function fetchCloudSetting(pid,token,userId,key){
  const rows=await request(pid,
    `/rest/v1/athenaeum_scriptorium_settings?user_id=eq.${encodeURIComponent(userId)}&setting_key=eq.${encodeURIComponent(key)}&select=payload,updated_at&limit=1`,
    {headers:{Authorization:`Bearer ${token}`}}
  );
  return Array.isArray(rows)&&rows[0]?rows[0]:null;
}

async function uploadWork(pid,token,userId,work){
  const clean=sanitizeWork(work);
  const stampMs=Number(clean?.updated_at||0)||Date.now();
  await request(pid,'/rest/v1/athenaeum_scriptorium_works?on_conflict=user_id,work_id',{
    method:'POST',
    headers:{Authorization:`Bearer ${token}`,Prefer:'resolution=merge-duplicates,return=minimal'},
    body:JSON.stringify({
      user_id:userId,work_id:String(clean.id),payload:clean,
      updated_at:new Date(stampMs).toISOString()
    })
  });
}

async function uploadSetting(pid,token,userId,setting){
  const stampMs=Number(setting?.updated_at||0)||Date.now();
  await request(pid,'/rest/v1/athenaeum_scriptorium_settings?on_conflict=user_id,setting_key',{
    method:'POST',
    headers:{Authorization:`Bearer ${token}`,Prefer:'resolution=merge-duplicates,return=minimal'},
    body:JSON.stringify({
      user_id:userId,setting_key:String(setting.key),payload:setting,
      updated_at:new Date(stampMs).toISOString()
    })
  });
}

async function syncScriptorium(pid,{preferRemote=false}={}){
  if(scriptRunning.has(pid))return scriptRunning.get(pid);
  const task=(async()=>{
    const c=cfg(pid);
    if(!c.enabled||!c.user?.id)return {skipped:true};
    const token=await access(pid),userId=cfg(pid).user.id;
    let db;
    const stats={downloaded:0,uploaded:0,settings_down:0,settings_up:0};
    try{
      db=await openIDB(`ScriptoriumDB_${pid}`);

      const [localWorks,remoteWorks,localSettings,remoteSettings]=await Promise.all([
        idbMeta(db,'works','id'),
        cloudWorkMeta(pid,token,userId),
        idbMeta(db,'settings','key'),
        cloudSettingMeta(pid,token,userId)
      ]);

      const lwork=new Map(localWorks.map(x=>[x.key,x.updated_at]));
      const rwork=new Map(remoteWorks.map(x=>[String(x.work_id),ms(x.updated_at)]));

      const allWorkIds=new Set([...lwork.keys(),...rwork.keys()]);
      for(const id of allWorkIds){
        const lt=lwork.get(id)||0,rt=rwork.get(id)||0;

        if(!lwork.has(id)){
          const row=await fetchCloudWork(pid,token,userId,id);
          if(row?.payload){await idbPut(db,'works',sanitizeWork(row.payload));stats.downloaded++}
          continue;
        }
        if(!rwork.has(id)){
          const w=await idbGet(db,'works',id);
          if(w){await uploadWork(pid,token,userId,w);stats.uploaded++}
          continue;
        }

        if(preferRemote || rt>lt+1){
          const row=await fetchCloudWork(pid,token,userId,id);
          if(row?.payload){await idbPut(db,'works',sanitizeWork(row.payload));stats.downloaded++}
        }else if(lt>rt+1){
          const w=await idbGet(db,'works',id);
          if(w){await uploadWork(pid,token,userId,w);stats.uploaded++}
        }
        // equal timestamp = same version: do nothing, avoiding heavy recursive merges.
      }

      const lset=new Map(localSettings.filter(x=>!['v6_sb_config','v6_sync_meta'].includes(x.key)).map(x=>[x.key,x.updated_at]));
      const rset=new Map(remoteSettings.map(x=>[String(x.setting_key),ms(x.updated_at)]));
      const allSetKeys=new Set([...lset.keys(),...rset.keys()]);
      for(const key of allSetKeys){
        const lt=lset.get(key)||0,rt=rset.get(key)||0;
        if(!lset.has(key)){
          const row=await fetchCloudSetting(pid,token,userId,key);
          if(row?.payload){await idbPut(db,'settings',row.payload);stats.settings_down++}
          continue;
        }
        if(!rset.has(key)){
          const s=await idbGet(db,'settings',key);
          if(s&&!['v6_sb_config','v6_sync_meta'].includes(s.key)){await uploadSetting(pid,token,userId,s);stats.settings_up++}
          continue;
        }
        if(preferRemote || rt>lt+1){
          const row=await fetchCloudSetting(pid,token,userId,key);
          if(row?.payload){await idbPut(db,'settings',row.payload);stats.settings_down++}
        }else if(lt>rt+1){
          const s=await idbGet(db,'settings',key);
          if(s&&!['v6_sb_config','v6_sync_meta'].includes(s.key)){await uploadSetting(pid,token,userId,s);stats.settings_up++}
        }
      }

      const cc=cfg(pid);
      saveCfg(pid,{...cc,last_scriptorium_sync:Date.now(),last_scriptorium_error:''});
      try{window.dispatchEvent(new CustomEvent('athenaeum-scriptorium-sync',{detail:{pid,stats}}))}catch{}
      return stats;
    }catch(e){
      const cc=cfg(pid);
      saveCfg(pid,{...cc,last_scriptorium_error:e.message||String(e)});
      throw e;
    }finally{
      try{db?.close()}catch{}
      scriptRunning.delete(pid);
    }
  })();
  scriptRunning.set(pid,task);
  return task;
}

async function syncAll(pid){
  await syncNow(pid);
  return syncScriptorium(pid);
}

/* ------------------------------------------------------------- */

async function signOut(pid){
  const c=cfg(pid);
  try{
    if(c.access_token)await request(pid,'/auth/v1/logout',{
      method:'POST',headers:{Authorization:`Bearer ${c.access_token}`}
    });
  }catch{}
  saveCfg(pid,{...c,access_token:'',refresh_token:'',expires_at:0,user:null,enabled:false,last_error:''});
  if(activePid===pid)stopAuto();
}

function markDirty(pid){
  if(suspendDirty||!pid)return;
  const c=cfg(pid);
  saveCfg(pid,{...c,dirty_at:Date.now()});
  if(!c.enabled||!navigator.onLine)return;
  clearTimeout(dirtyTimer);
  dirtyTimer=setTimeout(()=>syncNow(pid).catch(()=>{}),2500);
}

function stopAuto(){
  clearInterval(lightTimer);
  clearInterval(scriptTimer);
  clearTimeout(dirtyTimer);
  lightTimer=scriptTimer=dirtyTimer=null;
  activePid='';
}

function startAuto(pid){
  stopAuto();
  activePid=pid;
  const c=cfg(pid);
  if(!c.enabled)return;

  const light=()=>navigator.onLine&&syncNow(pid).catch(()=>{});
  const heavy=()=>navigator.onLine&&syncScriptorium(pid).catch(()=>{});

  setTimeout(light,900);
  setTimeout(heavy,5000);
  lightTimer=setInterval(light,LIGHT_INTERVAL);
  scriptTimer=setInterval(heavy,SCRIPTORIUM_INTERVAL);

  if(!focusBound){
    window.addEventListener('focus',()=>{
      const id=S().currentProfileId();
      if(id&&cfg(id).enabled){
        syncNow(id).catch(()=>{});
        const c=cfg(id);
        if(Date.now()-(c.last_scriptorium_sync||0)>5*60*1000)syncScriptorium(id).catch(()=>{});
      }
    });
    focusBound=true;
  }

  if(!visibilityBound){
    document.addEventListener('visibilitychange',()=>{
      if(document.visibilityState==='visible'){
        const id=S().currentProfileId();
        if(id&&cfg(id).enabled){
          syncNow(id).catch(()=>{});
          const c=cfg(id);
          if(Date.now()-(c.last_scriptorium_sync||0)>5*60*1000)syncScriptorium(id).catch(()=>{});
        }
      }
    });
    visibilityBound=true;
  }

  if(!onlineBound){
    window.addEventListener('online',()=>{
      const id=S().currentProfileId();
      if(id&&cfg(id).enabled){
        syncNow(id).catch(()=>{});
        syncScriptorium(id).catch(()=>{});
      }
    });
    onlineBound=true;
  }
}

async function diagnoseConnection(pid){
  const c=cfg(pid),report={
    url:c.url,key_present:!!c.key,online:navigator.onLine,
    server:false,auth:false,table:false,scriptorium_tables:false,
    signed_in:!!c.user?.id,details:[]
  };

  if(!c.url||!c.key)return {...report,error:'Supabase URL/key ontbreken.'};

  try{
    await rawRequest(c.url,c.key,'/auth/v1/settings',{method:'GET'});
    report.server=true;
    report.details.push('Cloudserver en Auth-endpoint bereikbaar.');
  }catch(e){
    report.error=e.message;
    report.details.push(e.message);
    return report;
  }

  if(c.user?.id){
    try{
      const token=await access(pid);
      await request(pid,'/auth/v1/user',{headers:{Authorization:`Bearer ${token}`}});
      report.auth=true;
      report.details.push('Gebruikerssessie geldig.');

      try{
        await request(pid,
          `/rest/v1/athenaeum_state?user_id=eq.${encodeURIComponent(c.user.id)}&profile_key=eq.${CLOUD_KEY}&select=user_id&limit=1`,
          {headers:{Authorization:`Bearer ${token}`}}
        );
        report.table=true;
        report.details.push('Lichte Athenaeum-state bereikbaar.');
      }catch(e){
        report.details.push('Athenaeum-state: '+e.message);
      }

      try{
        await request(pid,
          `/rest/v1/athenaeum_scriptorium_works?user_id=eq.${encodeURIComponent(c.user.id)}&select=work_id&limit=1`,
          {headers:{Authorization:`Bearer ${token}`}}
        );
        await request(pid,
          `/rest/v1/athenaeum_scriptorium_settings?user_id=eq.${encodeURIComponent(c.user.id)}&select=setting_key&limit=1`,
          {headers:{Authorization:`Bearer ${token}`}}
        );
        report.scriptorium_tables=true;
        report.details.push('Incrementele Scriptorium-tabellen bereikbaar.');
      }catch(e){
        report.details.push('Scriptorium-sync: '+e.message);
      }
    }catch(e){
      report.details.push('Aanmelding: '+e.message);
    }
  }else{
    report.details.push('Nog niet aangemeld; servercontrole is wel geslaagd.');
  }

  return report;
}

async function testConnection(pid){
  const rep=await diagnoseConnection(pid);
  if(!rep.server)throw new Error(rep.error||'Cloudserver niet bereikbaar.');
  if(cfg(pid).user?.id&&!rep.auth)throw new Error(rep.details.join(' '));
  return rep;
}

async function restoreRemote({url,key,email,password}){
  const d=await rawRequest(url,key,'/auth/v1/token?grant_type=password',{
    method:'POST',body:JSON.stringify({email,password})
  });
  if(!d.access_token||!d.user?.id)throw new Error('Aanmelden mislukt.');

  let rows=await rawRequest(url,key,
    `/rest/v1/athenaeum_state?user_id=eq.${encodeURIComponent(d.user.id)}&profile_key=eq.${CLOUD_KEY}&select=payload,updated_at`,
    {headers:{Authorization:`Bearer ${d.access_token}`}}
  );
  if(!(Array.isArray(rows)&&rows[0])){
    rows=await rawRequest(url,key,
      `/rest/v1/athenaeum_state?user_id=eq.${encodeURIComponent(d.user.id)}&select=payload,updated_at&order=updated_at.desc&limit=1`,
      {headers:{Authorization:`Bearer ${d.access_token}`}}
    );
  }

  const payload=Array.isArray(rows)&&rows[0]?.payload?rows[0].payload:null;
  if(!payload)throw new Error('Voor dit cloudaccount is nog geen Athenaeum-profiel opgeslagen.');
  return {auth:d,payload,url,key,email};
}

function adoptSession(pid,r){
  saveCfg(pid,{
    ...cfg(pid),
    url:r.url||DEFAULT_URL,key:r.key||DEFAULT_KEY,email:r.email,
    access_token:r.auth.access_token,refresh_token:r.auth.refresh_token,
    user:r.auth.user,expires_at:Date.now()+((r.auth.expires_in||3600)*1000),
    enabled:true,cloud_profile_key:CLOUD_KEY,last_error:''
  });
  linkProfileToCloud(pid,r.auth.user,r.email);
}

window.addEventListener('athenaeum-local-change',e=>{
  const pid=e.detail?.profile_id;
  if(pid)markDirty(pid);
});
window.addEventListener('athenaeum-profile-change',()=>{
  const pid=S().currentProfileId();
  if(pid)markDirty(pid);
});

window.AthSync={
  cfg,saveCfg,status,auth,access,request,rawRequest,
  syncNow,syncAll,syncScriptorium,startAuto,stopAuto,
  collect,pull,push,pullOnly,pushOnly,
  testConnection,diagnoseConnection,
  signOut,markDirty,restoreRemote,adoptSession,apply,merge,
  cloudKey:()=>CLOUD_KEY,
  defaults:()=>({url:DEFAULT_URL,key:DEFAULT_KEY}),
  linkProfileToCloud
};
})();
