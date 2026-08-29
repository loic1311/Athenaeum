import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')!
const APP_URL = Deno.env.get('ATHENAEUM_APP_URL') || 'https://example.github.io/Athenaeum/'
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

async function telegram(method:string, body:any){
  const r=await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/${method}`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)})
  if(!r.ok) throw new Error(await r.text())
  return r.json()
}

function localParts(timeZone:string){
  const p=new Intl.DateTimeFormat('en-CA',{timeZone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(new Date())
  const m=Object.fromEntries(p.map(x=>[x.type,x.value])); return {date:`${m.year}-${m.month}-${m.day}`,time:`${m.hour}:${m.minute}`}
}
function within15(now:string,target:string){const [h,m]=now.split(':').map(Number),[th,tm]=target.slice(0,5).split(':').map(Number);const a=h*60+m,b=th*60+tm;return a>=b&&a<b+15}

async function handleTelegramUpdate(update:any){
  const msg=update?.message; if(!msg?.chat?.id || !msg?.text) return
  const match=String(msg.text).trim().match(/^\/start\s+([A-Z0-9]{4,12})$/i)
  if(!match){await telegram('sendMessage',{chat_id:msg.chat.id,text:'Athenaeum Bot. Koppel via Athenaeum > Instellingen > Telegram en stuur daarna /start CODE.'});return}
  const code=match[1].toUpperCase()
  const {data,error}=await supabase.from('athenaeum_telegram_pairing').select('*').eq('pair_code',code).gt('expires_at',new Date().toISOString()).maybeSingle()
  if(error||!data){await telegram('sendMessage',{chat_id:msg.chat.id,text:'Deze koppelcode is ongeldig of verlopen.'});return}
  await supabase.from('athenaeum_telegram_pairing').update({telegram_chat_id:String(msg.chat.id),enabled:true,updated_at:new Date().toISOString()}).eq('id',data.id)
  await telegram('sendMessage',{chat_id:msg.chat.id,text:'✅ Athenaeum gekoppeld. Vanaf nu kan ik dagsessies, reminders en examenaftellingen sturen.'})
}

async function schedule(){
  const {data:rows,error}=await supabase.from('athenaeum_telegram_pairing').select('*').eq('enabled',true).not('telegram_chat_id','is',null)
  if(error) throw error
  for(const r of rows||[]){
    const lp=localParts(r.timezone||'Europe/Brussels')
    const {data:state}=await supabase.from('athenaeum_state').select('payload').eq('user_id',r.user_id).eq('profile_key',r.profile_key).maybeSingle()
    const pa=state?.payload?.data?.paideia_state || state?.payload?.paideia_state || {}
    const completed=pa.last_completed===lp.date
    if(within15(lp.time,String(r.morning_time)) && r.last_morning_sent!==lp.date){
      const streak=pa.streak||0, cubes=pa.icecubes??2, count=(pa.daily_count||0)+1
      await telegram('sendMessage',{chat_id:r.telegram_chat_id,text:`🏛️ Athenaeum — dag ${count}\n🔥 Streak: ${streak} · 🧊 ${cubes}\nVandaag: 20 min Oude Geschiedenis + 10 min Algemene Geschiedenis.\n${count%3===0?'Extra: algemene kennis / skill-sessie.\n':''}Je volgende wekelijkse examen is zondag.`,reply_markup:{inline_keyboard:[[{text:'Start Paideia',url:`${APP_URL}?profile=${encodeURIComponent(r.profile_key)}&open=paideia`}]]}})
      await supabase.from('athenaeum_telegram_pairing').update({last_morning_sent:lp.date}).eq('id',r.id)
    }
    if(!completed && within15(lp.time,String(r.reminder_time)) && r.last_reminder_sent!==lp.date){
      await telegram('sendMessage',{chat_id:r.telegram_chat_id,text:'⏳ Je Athenaeum-dagsessie staat nog open. 30 minuten geschiedenis volstaan om je streak vandaag te behouden.',reply_markup:{inline_keyboard:[[{text:'Ga naar Paideia',url:`${APP_URL}?profile=${encodeURIComponent(r.profile_key)}&open=paideia`}]]}})
      await supabase.from('athenaeum_telegram_pairing').update({last_reminder_sent:lp.date}).eq('id',r.id)
    }
  }
}

Deno.serve(async req=>{
  try{
    const body=await req.json().catch(()=>({}))
    if(body?.update_id) await handleTelegramUpdate(body)
    else if(body?.mode==='schedule') await schedule()
    return new Response(JSON.stringify({ok:true}),{headers:{'content-type':'application/json'}})
  }catch(e){return new Response(JSON.stringify({ok:false,error:String(e)}),{status:500,headers:{'content-type':'application/json'}})}
})
