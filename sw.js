// Service worker: dosyaları telefona önbelleğe alır, internetsiz de açılır.
// ÖNEMLİ: index.html, style.css veya app.js'i değiştirdiğinde
// aşağıdaki sürüm numarasını artır (v1 -> v2). Yoksa telefon eski dosyaları göstermeye devam eder.
const SURUM = "butce-v2";
const DOSYALAR = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

// Kurulum: dosyaları önbelleğe koy
self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(SURUM).then(function (c) { return c.addAll(DOSYALAR); }));
  self.skipWaiting();
});

// Eski sürümlerin önbelleğini temizle
self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (adlar) {
      return Promise.all(adlar.filter(function (a) { return a !== SURUM; }).map(function (a) { return caches.delete(a); }));
    })
  );
  self.clients.claim();
});

// Her istekte önce önbelleğe bak, yoksa internetten al
self.addEventListener("fetch", function (e) {
  e.respondWith(
    caches.match(e.request).then(function (sonuc) { return sonuc || fetch(e.request); })
  );
});
