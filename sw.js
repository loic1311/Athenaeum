const VERSION='athenaeum-v1.2.1-test-shell-2';
const CORE=['./','./index.html','./manifest.webmanifest','./shared/style.css','./shared/store.js','./shared/sync.js','./shared/telegram.js','./app.js','./assets/icons/icon-192.png','./assets/icons/icon-512.png'];
self.addEventListener('install',event=>event.waitUntil((async()=>{
  const c=await caches.open(VERSION);
  for(const u of CORE){try{await c.add(new Request(u,{cache:'reload'}))}catch(e){console.warn('cache skip',u,e)}}
  await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
  for(const k of await caches.keys())if(k.startsWith('athenaeum-')&&k!==VERSION)await caches.delete(k);
  await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const u=new URL(event.request.url);
  if(u.origin!==self.location.origin)return;
  const nav=event.request.mode==='navigate';
  const fresh=nav||['script','style','document'].includes(event.request.destination)||/\.(js|css|json|html)$/.test(u.pathname);
  event.respondWith((async()=>{
    if(fresh){
      try{
        const r=await fetch(event.request,{cache:'no-store'});
        if(r.ok){const c=await caches.open(VERSION);c.put(event.request,r.clone()).catch(()=>{})}
        return r;
      }catch(e){
        return (await caches.match(event.request))||(nav?await caches.match('./index.html'):null)||new Response('Offline',{status:503});
      }
    }
    const hit=await caches.match(event.request);if(hit)return hit;
    try{const r=await fetch(event.request);if(r.ok){const c=await caches.open(VERSION);c.put(event.request,r.clone()).catch(()=>{})}return r}
    catch(e){return new Response('Offline',{status:503})}
  })());
});
self.addEventListener('message',e=>{if(e.data?.type==='SKIP_WAITING')self.skipWaiting()});
