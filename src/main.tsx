import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { warmUpApi } from './services/api'

// Acorda o backend imediatamente (evita "Failed to fetch" por cold start)
warmUpApi()

// ── Service Worker (PWA — Portal do Produtor Rural) ──────────────────────────
if ('serviceWorker' in navigator && !import.meta.env.DEV) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => {
        console.log('[PWA] SW registrado:', reg.scope)
        reg.update().catch(() => {})
      })
      .catch(err => console.warn('[PWA] SW falhou:', err))
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
