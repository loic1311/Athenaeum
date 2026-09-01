import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN') || ''
const TELEGRAM_WEBHOOK_SECRET = Deno.env.get('TELEGRAM_WEBHOOK_SECRET') || ''
const SCHEDULER_SECRET = Deno.env.get('SCHEDULER_SECRET') || ''
const APP_URL = Deno.env.get('ATHENAEUM_APP_URL') || 'https://loic1311.github.io/Athenaeum/'
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

async function telegram(method:string, body:any={}){
  if(!TELEGRAM_BOT_TOKEN) throw new Error('TELEGRAM_BOT_TOKEN ontbreekt in Supabase Secrets.');
  const r=await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/${method}`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)})
  const data=await r.json().catch(()=>({}))
  if(!r.ok||data?.ok===false) throw new Error(data?.description||JSON.stringify(data))
  return data?.result??data
}
function cors(){return {'content-type':'application/json','access-control-allow-origin':'*','access-control-allow-headers':'authorization, x-client-info, apikey, content-type, x-telegram-bot-api-secret-token'}}
function localParts(timeZone:string){const p=new Intl.DateTimeFormat('en-CA',{timeZone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(new Date());const m=Object.fromEntries(p.map(x=>[x.type,x.value]));const date=`${m.year}-${m.month}-${m.day}`;const dow=new Date(date+'T12:00:00Z').getUTCDay();return{date,time:`${m.hour}:${m.minute}`,dow}}
function within15(now:string,target:string){const [h,m]=now.split(':').map(Number),[th,tm]=String(target).slice(0,5).split(':').map(Number);const a=h*60+m,b=th*60+tm;return a>=b&&a<b+15}
function daysUntilSunday(dow:number){return (7-dow)%7}
function examText(dow:number){const d=daysUntilSunday(dow);return d===0?'Je wekelijkse examen is vandaag.':d===1?'Je wekelijkse examen is morgen.':`Je wekelijkse examen is over ${d} dagen (zondag).`}
async function authUser(req:Request){const auth=req.headers.get('authorization')||'';const token=auth.replace(/^Bearer\s+/i,'');if(!token)throw new Error('Aanmelding ontbreekt.');const {data,error}=await supabase.auth.getUser(token);if(error||!data.user)throw new Error('Ongeldige gebruikerssessie.');return data.user}
async function botUsername(){const me=await telegram('getMe');return me?.username||''}
async function ensureWebhook(){if(!TELEGRAM_BOT_TOKEN||!TELEGRAM_WEBHOOK_SECRET)return {ok:false,reason:'secrets_missing'};const expected=`${SUPABASE_URL}/functions/v1/telegram-bot`;const info=await telegram('getWebhookInfo');if(info?.url!==expected){await telegram('setWebhook',{url:expected,secret_token:TELEGRAM_WEBHOOK_SECRET,drop_pending_updates:false});return {ok:true,changed:true,url:expected}}return {ok:true,changed:false,url:expected}}
async function handleTelegramUpdate(req:Request,update:any){if(TELEGRAM_WEBHOOK_SECRET&&req.headers.get('x-telegram-bot-api-secret-token')!==TELEGRAM_WEBHOOK_SECRET)throw new Error('Ongeldig Telegram webhook-secret.');const msg=update?.message;if(!msg?.chat?.id||!msg?.text)return;const match=String(msg.text).trim().match(/^\/start\s+([A-Z0-9]{4,12})$/i);if(!match){await telegram('sendMessage',{chat_id:msg.chat.id,text:'🏛️ Athenaeum Bot\nKoppel via Athenaeum/Paideia → Telegram en stuur daarna /start CODE.'});return}const code=match[1].toUpperCase();const {data,error}=await supabase.from('athenaeum_telegram_pairing').select('*').eq('pair_code',code).gt('expires_at',new Date().toISOString()).maybeSingle();if(error||!data){await telegram('sendMessage',{chat_id:msg.chat.id,text:'Deze koppelcode is ongeldig of verlopen.'});return}await supabase.from('athenaeum_telegram_pairing').update({telegram_chat_id:String(msg.chat.id),enabled:true,updated_at:new Date().toISOString()}).eq('id',data.id);await telegram('sendMessage',{chat_id:msg.chat.id,text:'✅ Athenaeum is gekoppeld. Ik stuur voortaan je Paideia-ochtendplanning, examenaftelling en reminder volgens je instellingen.',reply_markup:{inline_keyboard:[[{text:'Open Athenaeum',url:APP_URL}]]}})}
async function pairRow(userId:string,profileKey:string='main'){const {data,error}=await supabase.from('athenaeum_telegram_pairing').select('*').eq('user_id',userId).eq('profile_key',profileKey||'main').maybeSingle();if(error)throw error;return data}
function paideiaFromPayload(payload:any){return payload?.data?.paideia_state||payload?.paideia_state||{}}
async function stateFor(row:any){const {data}=await supabase.from('athenaeum_state').select('payload').eq('user_id',row.user_id).eq('profile_key',row.profile_key||'main').maybeSingle();return paideiaFromPayload(data?.payload||{})}
function morningMessage(pa:any,lp:any){const streak=pa.streak||0,cubes=pa.icecubes??2,count=(pa.daily_count||0)+1;const labels:any={ancient:['🏺','Oude Geschiedenis'],early_modern:['🕯️','Vroegmoderne Tijd'],general_history:['🌍','Algemene Geschiedenis'],general_knowledge:['🧠','Algemene Kennis'],pharmacy:['⚗️','Farmacie'],skill:['🛠️','Algemene Vaardigheden']};const defaults:any={ancient:{active:true,telegram:true,minutes:20},general_history:{active:true,telegram:true,minutes:10},general_knowledge:{active:true,telegram:true,minutes:10},skill:{active:true,telegram:true,minutes:12}};const paths={...defaults,...(pa.learning_paths||{})};const lines=Object.entries(paths).filter(([k,v]:any)=>v?.active&&v?.telegram!==false&&labels[k]).map(([k,v]:any)=>`${labels[k][0]} ${v.minutes||10} min ${labels[k][1]}`);return `🏛️ Athenaeum — dag ${count}\n🔥 Streak: ${streak} · 🧊 ${cubes}\n\nVandaag in Paideia:\n${lines.length?lines.join('\n'):'Geen Telegram-leerpaden actief.'}\n\n📅 ${examText(lp.dow)}`}
async function sendTest(userId:string,profileKey:string='main'){const row=await pairRow(userId,profileKey);if(!row?.enabled||!row.telegram_chat_id)throw new Error('Telegram is nog niet gekoppeld.');const pa=await stateFor(row),lp=localParts(row.timezone||'Europe/Brussels');await telegram('sendMessage',{chat_id:row.telegram_chat_id,text:'🧪 Testmelding\n\n'+morningMessage(pa,lp),reply_markup:{inline_keyboard:[[{text:'Start Paideia',url:`${APP_URL}?open=paideia`}]]}});return true}
async function schedule(){const {data:rows,error}=await supabase.from('athenaeum_telegram_pairing').select('*').eq('enabled',true).not('telegram_chat_id','is',null);if(error)throw error;for(const r of rows||[]){const lp=localParts(r.timezone||'Europe/Brussels'),pa=await stateFor(r),completed=pa.last_completed===lp.date;if(within15(lp.time,String(r.morning_time))&&r.last_morning_sent!==lp.date){await telegram('sendMessage',{chat_id:r.telegram_chat_id,text:morningMessage(pa,lp),reply_markup:{inline_keyboard:[[{text:'Start Paideia',url:`${APP_URL}?open=paideia`}]]}});await supabase.from('athenaeum_telegram_pairing').update({last_morning_sent:lp.date}).eq('id',r.id)}if(!completed&&within15(lp.time,String(r.reminder_time))&&r.last_reminder_sent!==lp.date){await telegram('sendMessage',{chat_id:r.telegram_chat_id,text:`⏳ Je Paideia-dagsessie staat nog open.\n🔥 Huidige streak: ${pa.streak||0}\n🧊 IJsblokjes: ${pa.icecubes??2}\n${examText(lp.dow)}\n\nOpen Paideia om je resterende gepersonaliseerde leerpaden af te ronden.`,reply_markup:{inline_keyboard:[[{text:'Ga naar Paideia',url:`${APP_URL}?open=paideia`}]]}});await supabase.from('athenaeum_telegram_pairing').update({last_reminder_sent:lp.date}).eq('id',r.id)}}}
Deno.serve(async req=>{
  if(req.method==='OPTIONS')return new Response('ok',{headers:cors()});
  try{
    const body=await req.json().catch(()=>({}));
    if(body?.update_id){await handleTelegramUpdate(req,body);return new Response(JSON.stringify({ok:true}),{headers:cors()})}
    if(body?.mode==='schedule'){if(SCHEDULER_SECRET&&body?.secret!==SCHEDULER_SECRET)throw new Error('Ongeldig scheduler-secret.');await schedule();return new Response(JSON.stringify({ok:true}),{headers:cors()})}
    if(body?.mode==='setup_webhook'){
      if(!SCHEDULER_SECRET||body?.secret!==SCHEDULER_SECRET)throw new Error('Ongeldig setup-secret.');
      if(!TELEGRAM_WEBHOOK_SECRET)throw new Error('TELEGRAM_WEBHOOK_SECRET ontbreekt.');
      const result=await telegram('setWebhook',{url:`${SUPABASE_URL}/functions/v1/telegram-bot`,secret_token:TELEGRAM_WEBHOOK_SECRET,drop_pending_updates:false});
      return new Response(JSON.stringify({ok:true,result}),{headers:cors()});
    }
    const user=await authUser(req);
    if(body?.mode==='health'){
      const username=await botUsername();const webhook=await ensureWebhook();
      return new Response(JSON.stringify({ok:true,bot_username:username,app_url:APP_URL,webhook}),{headers:cors()});
    }
    if(body?.mode==='test'){await sendTest(user.id,body?.profile_key||'main');return new Response(JSON.stringify({ok:true}),{headers:cors()})}
    if(body?.mode==='status'){const row=await pairRow(user.id,body?.profile_key||'main'),username=await botUsername();return new Response(JSON.stringify({ok:true,connected:!!(row?.enabled&&row?.telegram_chat_id),bot_username:username}),{headers:cors()})}
    return new Response(JSON.stringify({ok:true}),{headers:cors()});
  }catch(e){return new Response(JSON.stringify({ok:false,error:String(e?.message||e)}),{status:400,headers:cors()})}
})
