/* Sổ Sức Khỏe — service worker
   - Giúp app mở được như ứng dụng, kể cả khi mạng chập chờn
   - Luôn ưu tiên lấy bản mới từ mạng; mất mạng mới dùng bản đã lưu
   - Không động vào dữ liệu gửi tới Google (Apps Script)            */
const CACHE = 'ssk-v2';
const FILES = ['./', './index.html', './config.js', './manifest.json', './icon.png', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return; // bỏ qua Google, CDN
  e.respondWith(
    fetch(e.request)
      .then(r => { const c = r.clone(); caches.open(CACHE).then(ca => ca.put(e.request, c)); return r; })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
