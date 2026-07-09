import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export type InstallOutcome = 'accepted' | 'dismissed' | 'unavailable'

/**
 * "beforeinstallprompt" dispara apenas uma vez por carregamento de página —
 * se nenhum componente estiver montado nesse instante, o evento se perde.
 * Por isso a captura fica em estado de módulo (singleton), registrada assim
 * que este arquivo é importado, e não dentro de cada useEffect de componente.
 */
let capturedPrompt: BeforeInstallPromptEvent | null = null
let isInstalled = false

const listeners = new Set<() => void>()
const notify = () => listeners.forEach(l => l())

if (typeof window !== 'undefined') {
  isInstalled =
    window.matchMedia?.('(display-mode: standalone)').matches ||
    (window.navigator as { standalone?: boolean }).standalone === true

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    capturedPrompt = e as BeforeInstallPromptEvent
    notify()
  })

  window.addEventListener('appinstalled', () => {
    isInstalled = true
    capturedPrompt = null
    notify()
  })
}

/** Captura o "beforeinstallprompt" e expõe install() para abrir o prompt nativo. */
export function usePwaInstall() {
  const [, forceRender] = useState(0)

  useEffect(() => {
    const listener = () => forceRender(t => t + 1)
    listeners.add(listener)
    return () => { listeners.delete(listener) }
  }, [])

  async function install(): Promise<InstallOutcome> {
    if (!capturedPrompt) return 'unavailable'
    await capturedPrompt.prompt()
    const { outcome } = await capturedPrompt.userChoice
    if (outcome === 'accepted') isInstalled = true
    capturedPrompt = null
    notify()
    return outcome
  }

  return { canInstall: !!capturedPrompt, installed: isInstalled, install }
}
