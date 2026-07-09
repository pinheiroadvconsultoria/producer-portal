/**
 * Portal do Produtor Rural — Service Worker
 * Permite instalação como PWA (Chrome), cache básico e funcionamento offline parcial.
 */

const CACHE_NAME = 'portal-produtor-v1.0.0'
const OFFLINE_URL = '/offline.html'

const PRECACHE = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE).catch(() => {}))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  // Nunca cachear chamadas de API — dados do produtor sempre atualizados
  const url = new URL(request.url)
  if (url.pathname.startsWith('/api/')) return

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match('/').then(r => r || caches.match(OFFLINE_URL))
      )
    )
    return
  }

  if (url.origin === self.location.origin && url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(request).then(cached =>
        cached || fetch(request).then(response => {
          if (response && response.status === 200) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone)).catch(() => {})
          }
          return response
        })
      )
    )
    return
  }

  event.respondWith(
    fetch(request)
      .then(response => {
        if (response && response.status === 200 && url.origin === self.location.origin) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone)).catch(() => {})
        }
        return response
      })
      .catch(() => caches.match(request))
  )
})
