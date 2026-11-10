const CACHE="cosmetics-app-v31";
const FILES=["./","./index.html","./manifest.webmanifest","./icon.svg"];
self.addEventListener("install",event=>{
 event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith("cosmetics-app-")&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch",event=>{
 if(event.request.method!=="GET")return;
 const isAppPage=event.request.mode==="navigate"||new URL(event.request.url).pathname.endsWith("/index.html")||new URL(event.request.url).pathname.endsWith("/");
 const networkFirst=()=>{
  return fetch(event.request).then(response=>{
   if(response&&response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));}
   return response;
  }).catch(()=>caches.match(event.request).then(cached=>cached||caches.match("./index.html")));
 };
 if(isAppPage){event.respondWith(networkFirst());return;}
 event.respondWith(caches.match(event.request).then(cached=>{
  if(cached)return cached;
  return networkFirst();
 }));
});
