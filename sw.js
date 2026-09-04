/* Service worker – La Formule (SnackApp)
   - Précache de la coquille de l'application pour un démarrage instantané et hors ligne.
   - HTML / JS / CSS / config : réseau d'abord (les mises à jour arrivent tout de suite),
     cache en secours.
   - Images et polices : cache d'abord.
   - /api/ : jamais mis en cache.
   À chaque déploiement : changer VERSION ici ET le paramètre ?v= dans index.html. */

const VERSION = "laformule-20260904c";
const SHELL = [
  "/",
  "/index.html",
  "/styles.css?v=20260904c",
  "/script.js?v=20260904c",
  "/snack-runtime.js?v=20260904c",
  "/config/laformule59.config.js?v=20260904c",
  "/manifest.webmanifest",
  "/images/logoformule.webp",
  "/images/heroformule.webp",
  "/images/icon-192.png",
  "/images/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) =>
      Promise.all(SHELL.map((url) => cache.add(url).catch(() => null)))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function isApi(url) {
  return url.pathname.startsWith("/api/") || url.pathname.startsWith("/cuisine/");
}

async function networkFirst(request) {
  const cache = await caches.open(VERSION);
  try {
    // cache: "no-cache" force une revalidation auprès du serveur : on ne sert
    // jamais un vieux JS/CSS depuis le cache HTTP du navigateur.
    const fresh = await fetch(request.url, { cache: "no-cache", credentials: "same-origin" });
    if (fresh && fresh.ok) cache.put(request, fresh.clone());
    return fresh;
  } catch (e) {
    const cached = await cache.match(request, { ignoreSearch: request.mode === "navigate" });
    if (cached) return cached;
    if (request.mode === "navigate") {
      const shell = await cache.match("/index.html");
      if (shell) return shell;
    }
    throw e;
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(VERSION);
  const cached = await cache.match(request);
  if (cached) return cached;
  const fresh = await fetch(request);
  if (fresh && (fresh.ok || fresh.type === "opaque")) cache.put(request, fresh.clone());
  return fresh;
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(VERSION);
  const cached = await cache.match(request);
  const refresh = fetch(request)
    .then((fresh) => {
      if (fresh && (fresh.ok || fresh.type === "opaque")) cache.put(request, fresh.clone());
      return fresh;
    })
    .catch(() => cached);
  return cached || refresh;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  if (url.origin === self.location.origin) {
    if (isApi(url)) return; // toujours le réseau
    if (request.mode === "navigate" || /\.(js|css|webmanifest)$/.test(url.pathname)) {
      event.respondWith(networkFirst(request));
      return;
    }
    if (/\.(png|jpe?g|webp|svg|gif|ico|woff2?)$/.test(url.pathname)) {
      event.respondWith(cacheFirst(request));
      return;
    }
    event.respondWith(networkFirst(request));
    return;
  }

  // CDN Tailwind et polices Google : on sert le cache et on rafraîchit en arrière-plan
  if (/cdn\.tailwindcss\.com|fonts\.(googleapis|gstatic)\.com/.test(url.host)) {
    event.respondWith(staleWhileRevalidate(request));
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || "/?open=ticket";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ("focus" in client) {
          client.navigate && client.navigate(target).catch(() => null);
          return client.focus();
        }
      }
      return self.clients.openWindow(target);
    })
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});
