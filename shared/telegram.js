(function(){
'use strict';
const S=()=>window.AthStore,A=()=>window.AthSync;
function notify(pid){return S().getProfileData(pid,'notify',{morning:'08:00',reminder:'18:00',timezone:Intl.DateTimeFormat().resolvedOptions().timeZone||'Europe/Brussels',updated_at:0})}
function saveNotify(pid,n){S().setProfileData(pid,'notify',{...notify(pid),...n,updated_at:Date.now()})}
async function row(pid){const token=await A().access(pid),c=A().cfg(pid),u=c.user;if(!u?.id)throw new Error('Meld eerst aan bij synchronisatie.');const rows=await A().request(pid,`/rest/v1/athenaeum_telegram_pairing?user_id=eq.${encodeURIComponent(u.id)}&profile_key=eq.${encodeURIComponent(A().cloudKey(pid))}&select=*`,{headers:{Authorization:`Bearer ${token}`}});return Array.isArray(rows)?rows[0]||null:null}
async function upsert(pid,patch){const token=await A().access(pid),c=A().cfg(pid),u=c.user;if(!u?.id)throw new Error('Meld eerst aan bij synchronisatie.');const body={user_id:u.id,profile_key:A().cloudKey(pid),...patch,updated_at:new Date().toISOString()};await A().request(pid,'/rest/v1/athenaeum_telegram_pairing?on_conflict=user_id,profile_key',{method:'POST',headers:{Authorization:`Bearer ${token}`,Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({...body,profile_key:A().cloudKey(pid)})});return body}
async function functionCall(pid,body){const token=await A().access(pid);return A().request(pid,'/functions/v1/telegram-bot',{method:'POST',headers:{Authorization:`Bearer ${token}`},body:JSON.stringify({...body,profile_key:A().cloudKey(pid)})})}
async function diagnose(pid){
  const out={signed_in:false,table:false,function:false,bot:false,paired:false,steps:[]};
  const c=A().cfg(pid);
  if(!c.user?.id){out.steps.push('Meld eerst aan bij Athenaeum Cloud.');return out}
  out.signed_in=true;
  try{const r=await row(pid);out.table=true;out.paired=!!(r?.enabled&&r?.telegram_chat_id);out.steps.push('Telegram-koppeltabel bereikbaar.')}catch(e){out.steps.push('Telegram-tabel niet bereikbaar: '+e.message);return out}
  try{const h=await functionCall(pid,{mode:'health'});out.function=true;out.bot=!!h?.bot_username;out.bot_username=h?.bot_username||'';out.steps.push(h?.bot_username?'Edge Function + bot bereikbaar: @'+h.bot_username:'Edge Function bereikbaar, maar bot-token/configuratie ontbreekt.');}
  catch(e){out.steps.push('Edge Function niet bruikbaar: '+e.message);return out}
  if(out.paired)out.steps.push('Telegram-chat is gekoppeld.');else out.steps.push('Nog geen Telegram-chat gekoppeld: maak een koppelcode en stuur /start CODE naar de bot.');
  return out;
}
async function status(pid){let r=null;try{r=await row(pid)}catch(e){return{connected:false,error:e.message}};let bot='';try{const s=await functionCall(pid,{mode:'status'});bot=s?.bot_username||''}catch{}return{connected:!!(r?.enabled&&r?.telegram_chat_id),row:r,bot_username:bot}}
async function pair(pid){const code=Math.random().toString(36).slice(2,8).toUpperCase(),n=notify(pid);await upsert(pid,{pair_code:code,timezone:n.timezone||'Europe/Brussels',morning_time:n.morning||'08:00',reminder_time:n.reminder||'18:00',enabled:false,expires_at:new Date(Date.now()+30*60000).toISOString()});let bot='';try{const s=await functionCall(pid,{mode:'status'});bot=s?.bot_username||''}catch{}return{code,bot_username:bot,link:bot?`https://t.me/${bot}?start=${encodeURIComponent(code)}`:''}}
async function updateSchedule(pid,n){saveNotify(pid,n);const old=await row(pid).catch(()=>null);if(old)await upsert(pid,{timezone:n.timezone,morning_time:n.morning,reminder_time:n.reminder,enabled:!!old.enabled,telegram_chat_id:old.telegram_chat_id||null,pair_code:old.pair_code||Math.random().toString(36).slice(2,8).toUpperCase()})}
async function test(pid){return functionCall(pid,{mode:'test'})}
async function disconnect(pid){const token=await A().access(pid),c=A().cfg(pid),u=c.user;if(!u?.id)throw new Error('Meld eerst aan.');await A().request(pid,`/rest/v1/athenaeum_telegram_pairing?user_id=eq.${encodeURIComponent(u.id)}&profile_key=eq.${encodeURIComponent(A().cloudKey(pid))}`,{method:'PATCH',headers:{Authorization:`Bearer ${token}`,Prefer:'return=minimal'},body:JSON.stringify({enabled:false,telegram_chat_id:null,updated_at:new Date().toISOString()})});return true}
window.AthTelegram={notify,saveNotify,status,pair,updateSchedule,test,disconnect,row,diagnose};
})();
