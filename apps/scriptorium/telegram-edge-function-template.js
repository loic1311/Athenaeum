// Supabase Edge Function template — keep TELEGRAM_BOT_TOKEN server-side.
// Adapt authentication and allowed chat IDs before production use.
Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", {status:405});
  const token = Deno.env.get("TELEGRAM_BOT_TOKEN");
  if (!token) return new Response("Missing server secret", {status:500});
  const { chat_id, text } = await req.json();
  if (!chat_id || !text) return new Response("Missing chat_id/text", {status:400});
  const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method:"POST", headers:{"content-type":"application/json"},
    body:JSON.stringify({chat_id,text})
  });
  return new Response(await r.text(), {status:r.status, headers:{"content-type":"application/json"}});
});
