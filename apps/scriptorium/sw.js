const CACHE='scriptorium-v8.1-shell-1';
const LOCAL_SHELL=[
  './','./index.html','./scriptorium.css','./scriptorium.app.js',
  './manifest.webmanifest','./version.json',
  './icons/icon-192-v7.png','./icons/icon-512-v7.png',
  './icons/icon-maskable-192-v7.png','./icons/icon-maskable-512-v7.png',
  './icons/apple-touch-icon-v7.png','./icons/favicon-48-v7.png','./icons/favicon-32-v7.png'
];
self.addEventListener('install',event=>event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  for(const url of LOCAL_SHELL){try{await cache.add(new Request(url,{cache:'reload'}))}catch(err){console.warn('Precache failed',url,err)}}
  await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(k=>k.startsWith('scriptorium-')&&k!==CACHE).map(k=>caches.delete(k)));
  await self.clients.claim();
})()));
self.addEventListener('message',event=>{
  if(event.data?.type==='SKIP_WAITING')self.skipWaiting();
  if(event.data?.type==='CLEAR_CACHES')event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('scriptorium-')).map(k=>caches.delete(k)))));
});
async function networkFirst(request,fallback){
  const cache=await caches.open(CACHE);
  try{
    const response=await fetch(request,{cache:'no-store'});
    if(response&&(response.ok||response.type==='opaque'))cache.put(request,response.clone()).catch(()=>{});
    return response;
  }catch(err){
    return (await cache.match(request))||(fallback?await cache.match(fallback):Response.error());
  }
}
async function cacheFirst(request){
  const cache=await caches.open(CACHE);
  const hit=await cache.match(request);
  if(hit)return hit;
  try{
    const resp=await fetch(request);
    if(resp&&(resp.ok||resp.type==='opaque'))cache.put(request,resp.clone()).catch(()=>{});
    return resp;
  }catch{return Response.error()}
}
self.addEventListener('fetch',event=>{
  const req=event.request;if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(req.mode==='navigate'){event.respondWith(networkFirst(req,'./index.html'));return}
  if(url.origin===self.location.origin){
    const ext=url.pathname.split('.').pop().toLowerCase();
    if(['js','css','json','webmanifest','html'].includes(ext))event.respondWith(networkFirst(req));
    else event.respondWith(cacheFirst(req));
    return;
  }
  event.respondWith(networkFirst(req));
});
