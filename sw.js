/* Desativado no MVP v20 para impedir que versões antigas fiquem presas no cache. */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil((async()=>{
  const keys = await caches.keys();
  await Promise.all(keys.map(key=>caches.delete(key)));
  await self.registration.unregister();
  await self.clients.claim();
})()));
self.addEventListener('fetch', () => {});
