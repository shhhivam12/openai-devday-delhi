const CACHE='together-v1';
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(['/','/manifest.webmanifest','/brand/mark.svg','/icon-192.png','/icon-512.png'])));self.skipWaiting()});
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{const request=event.request;const url=new URL(request.url);if(request.method!=='GET'||url.origin!==location.origin||url.pathname.startsWith('/api/'))return;
 event.respondWith(caches.match(request).then(cached=>cached||fetch(request).then(response=>{if(response.ok&&!response.headers.get('content-type')?.includes('text/x-component')){const clone=response.clone();caches.open(CACHE).then(cache=>cache.put(request,clone))}return response}).catch(()=>request.mode==='navigate'?caches.match('/'):Response.error())))});
