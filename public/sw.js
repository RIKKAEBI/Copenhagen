// 社用車予約 PWA Service Worker
// - ビルド済み静的アセット: cache-first（ハッシュ付きで不変のため）
// - /api/: 常にネットワーク（予約データを古い状態で見せない）
// - ページ遷移: network-first、オフライン時のみキャッシュへフォールバック
const CACHE = "copenhagen-v2";
const CACHE_FIRST = [/^\/_next\/static\//, /^\/icons\//, /\.svg$/];

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  if (CACHE_FIRST.some((re) => re.test(url.pathname))) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
  }
});

async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const res = await fetch(request);
  if (res.ok) cache.put(request, res.clone());
  return res;
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  try {
    const res = await fetch(request);
    if (res.ok) cache.put(request, res.clone());
    return res;
  } catch {
    const cached = await cache.match(request);
    return (
      cached ??
      new Response(
        '<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>オフライン</title><body style="font-family:sans-serif;display:grid;place-items:center;min-height:100dvh;margin:0;background:#eef1f6;color:#16202b"><p>オフラインです。接続を確認して再読み込みしてください。</p></body></html>',
        { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } },
      )
    );
  }
}
