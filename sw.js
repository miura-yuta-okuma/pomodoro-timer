const CACHE = 'pomodoro-v2';
const ASSETS = [
  '/pomodoro-timer/',
  '/pomodoro-timer/index.html',
  '/pomodoro-timer/manifest.json',
  '/pomodoro-timer/icon-192.png',
  '/pomodoro-timer/icon-512.png',
];

// インストール時に全アセットを事前キャッシュ
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// 古いキャッシュを削除して即座に制御を取得
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// キャッシュ優先 → ネットワーク → オフライン時はキャッシュを返す
self.addEventListener('fetch', e => {
  // chrome-extension などは無視
  if (!e.request.url.startsWith('http')) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;

      return fetch(e.request.clone())
        .then(res => {
          // 正常なレスポンスだけキャッシュに保存
          if (res && res.status === 200 && res.type !== 'opaque') {
            caches.open(CACHE).then(c => c.put(e.request, res.clone()));
          }
          return res;
        })
        .catch(() => {
          // オフライン時：ナビゲーションリクエストはindex.htmlで代替
          if (e.request.mode === 'navigate') {
            return caches.match('/pomodoro-timer/index.html');
          }
          return new Response('Offline', { status: 503 });
        });
    })
  );
});
