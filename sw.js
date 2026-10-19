// Gorilla News — service worker (PWA: instalable y con lectura sin conexión)
// Al cambiar archivos del sitio, subí VERSION para que los usuarios reciban la caché nueva.

const VERSION = 'v2';
const CACHE = `gorilla-${VERSION}`;

// Lo mínimo para que el sitio (2026 y 2022) abra sin Internet. Las imágenes se guardan a medida que se ven.
const PAGINAS = [
  'index.html',
  'gen1.html', 'gen2.html', 'gen3.html', 'gen4.html', 'gen5.html',
  'gen6.html', 'gen7.html', 'gen8.html', 'gen9.html',
  'formulario.html',
];

const BASE = [
  ...PAGINAS.map((p) => '2022/' + p),
  '2022/Generaciones/estilo.css',
  '2022/carrusel.js',
  '2022/formulario.js',
  './',
  ...PAGINAS,
  'css/estilo.css?v=4',
  'js/version.js?v=3',
  'js/main.js?v=5',
  'manifest.webmanifest',
  'Generaciones/Icono.png',
  'Generaciones/imgConsolas/BannerIndex.jpg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/favicon-32.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(BASE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((claves) => Promise.all(
        claves.filter((c) => c.startsWith('gorilla-') && c !== CACHE)
          .map((c) => caches.delete(c))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const pedido = e.request;
  if (pedido.method !== 'GET') return;

  const url = new URL(pedido.url);
  const propio = url.origin === location.origin;
  const fuentes = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if (!propio && !fuentes) return;

  if (pedido.mode === 'navigate') {
    e.respondWith(primeroRed(pedido));
  } else if (pedido.destination === 'image') {
    e.respondWith(primeroCache(pedido));
  } else {
    e.respondWith(cacheYActualizar(pedido, e));
  }
});

// Páginas: siempre la versión más nueva si hay red; si no, la guardada.
// Sin red y sin copia guardada se redirige a la portada (redirigir, y no servirla en esa
// dirección, para que sus rutas relativas a CSS e imágenes sigan funcionando).
async function primeroRed(pedido) {
  try {
    const resp = await fetch(pedido);
    if (resp.ok) guardar(pedido, resp.clone());
    return resp;
  } catch (err) {
    const guardada = await caches.match(pedido, { ignoreSearch: true });
    if (guardada) return guardada;
    return Response.redirect(new URL('index.html', self.registration.scope), 302);
  }
}

// Imágenes: no cambian, así que se sirven desde la caché apenas se guardaron una vez.
async function primeroCache(pedido) {
  const guardada = await caches.match(pedido);
  if (guardada) return guardada;
  try {
    const resp = await fetch(pedido);
    if (resp.ok) guardar(pedido, resp.clone());
    return resp;
  } catch (err) {
    return Response.error();
  }
}

// CSS, JS y fuentes: respuesta inmediata desde la caché y actualización en segundo plano.
async function cacheYActualizar(pedido, evento) {
  const guardada = await caches.match(pedido);
  const red = fetch(pedido)
    .then((resp) => {
      if (resp.ok) guardar(pedido, resp.clone());
      return resp;
    })
    .catch(() => null);
  if (guardada) {
    evento.waitUntil(red);
    return guardada;
  }
  return (await red) || Response.error();
}

function guardar(pedido, resp) {
  return caches.open(CACHE).then((cache) => cache.put(pedido, resp));
}
