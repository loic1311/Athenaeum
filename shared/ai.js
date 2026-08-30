(function(){
'use strict';
const TIMEOUT=60000;
function S(){return window.AthSync}
async function call(pid,payload){
  if(!pid)throw new Error('Geen Athenaeum-profiel actief.');
  if(!S())throw new Error('Athenaeum synchronisatie is niet beschikbaar.');
  const c=S().cfg(pid);
  if(!c?.enabled||!c?.user?.id)throw new Error('Meld eerst aan via Athenaeum → Instellingen → Synchronisatie.');
  const token=await S().access(pid);
  const ctl=new AbortController(),tm=setTimeout(()=>ctl.abort(),TIMEOUT);
  let r;
  try{
    r=await fetch(c.url.replace(/\/$/,'')+'/functions/v1/ai-coach',{
      method:'POST',mode:'cors',credentials:'omit',cache:'no-store',signal:ctl.signal,
      headers:{'content-type':'application/json','apikey':c.key,'authorization':'Bearer '+token},
      body:JSON.stringify(payload||{})
    });
  }catch(e){
    clearTimeout(tm);
    if(e?.name==='AbortError')throw new Error('De AI-docent antwoordt niet binnen 60 seconden.');
    throw new Error('AI-docent niet bereikbaar: '+(e?.message||'netwerkfout'));
  }
  clearTimeout(tm);
  const data=await r.json().catch(()=>({}));
  if(!r.ok||data?.ok===false)throw new Error(data?.error||`AI-docent fout ${r.status}`);
  return data;
}
async function health(pid){return call(pid,{mode:'health'})}
function quotaText(q){
  if(!q)return '';
  const parts=[];
  if(q.regular_limit!=null)parts.push(`Paideia ${q.regular_used||0}/${q.regular_limit}`);
  if(q.deep_limit!=null)parts.push(`Scriptorium ${q.deep_used||0}/${q.deep_limit}`);
  return parts.join(' · ');
}
window.AthAI={feedback:call,health,quotaText};
})();