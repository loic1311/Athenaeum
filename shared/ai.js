(function(){
'use strict';
const TIMEOUT=60000;
function S(){return window.AthSync}
async function call(pid,payload,timeout=TIMEOUT){
  if(!pid)throw new Error('Geen Athenaeum-profiel actief.');
  if(!S())throw new Error('Athenaeum synchronisatie is niet beschikbaar.');
  const c=S().cfg(pid);
  if(!c?.enabled||!c?.user?.id)throw new Error('Meld eerst aan via Athenaeum → Instellingen → Synchronisatie.');
  const token=await S().access(pid);
  const ctl=new AbortController(),tm=setTimeout(()=>ctl.abort(),timeout);
  let r;
  try{
    r=await fetch(c.url.replace(/\/$/,'')+'/functions/v1/ai-coach',{
      method:'POST',mode:'cors',credentials:'omit',cache:'no-store',signal:ctl.signal,
      headers:{'content-type':'application/json','apikey':c.key,'authorization':'Bearer '+token},
      body:JSON.stringify(payload||{})
    });
  }catch(e){
    clearTimeout(tm);
    if(e?.name==='AbortError')throw new Error('De AI-docent antwoordt niet op tijd.');
    throw new Error('AI-docent niet bereikbaar: '+(e?.message||'netwerkfout'));
  }
  clearTimeout(tm);
  const data=await r.json().catch(()=>({}));
  if(!r.ok||data?.ok===false)throw new Error(data?.error||`AI-docent fout ${r.status}`);
  return data;
}
async function health(pid,probe=true){return call(pid,{mode:'health',probe},20000)}
async function status(pid){return call(pid,{mode:'status'},12000)}
async function reconnect(pid){
  if(!S())throw new Error('Synchronisatie ontbreekt.');
  await S().access(pid); // refreshes Supabase JWT when necessary
  return health(pid,true);
}
function quotaText(q){
  if(!q)return '';
  const ru=q.regular_used??0,rl=q.regular_limit??60,du=q.deep_used??0,dl=q.deep_limit??10;
  return `Paideia ${ru}/${rl} · Scriptorium ${du}/${dl}`;
}
function remaining(q,kind){
  if(!q)return null;
  return kind==='deep'?(q.deep_remaining??Math.max(0,(q.deep_limit??10)-(q.deep_used??0))):(q.regular_remaining??Math.max(0,(q.regular_limit??60)-(q.regular_used??0)));
}
function percent(q,kind){
  if(!q)return 0;
  const used=kind==='deep'?(q.deep_used??0):(q.regular_used??0);
  const lim=kind==='deep'?(q.deep_limit??10):(q.regular_limit??60);
  return lim?Math.min(100,Math.round(used/lim*100)):0;
}
window.AthAI={feedback:call,call,health,status,reconnect,quotaText,remaining,percent};
})();
