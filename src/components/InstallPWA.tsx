/**
 * InstallPWA.tsx — banner flutuante de instalação do app
 * Aparece automaticamente quando o Chrome sinaliza que pode instalar
 */

import { useState } from 'react'
import { Download, CheckCircle2, X } from 'lucide-react'
import { usePwaInstall } from '../hooks/usePwaInstall'

export function InstallPWA() {
  const { canInstall, installed, install } = usePwaInstall()
  const [dismissed, setDismissed] = useState(false)
  const [justInstalled, setJustInstalled] = useState(false)

  async function handleInstall() {
    const outcome = await install()
    if (outcome === 'accepted') {
      setJustInstalled(true)
      setTimeout(() => setJustInstalled(false), 6000)
    }
  }

  if (justInstalled) {
    return (
      <div className="fixed bottom-4 left-4 z-50 flex items-center gap-3 bg-agro-green text-white px-4 py-3 rounded-2xl shadow-2xl max-w-xs">
        <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
        <p className="text-xs font-bold">Portal instalado com sucesso.</p>
      </div>
    )
  }

  if (installed || dismissed || !canInstall) return null

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-3 bg-agro-dark text-white px-4 py-3 rounded-2xl shadow-2xl max-w-xs">
      <div className="h-10 w-10 bg-agro-green rounded-xl flex items-center justify-center flex-shrink-0">
        <span className="text-white font-black text-sm">PR</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold leading-tight">Instalar aplicativo no Chrome</p>
        <p className="text-[10px] text-white/60 leading-tight">Portal do Produtor Rural como app</p>
      </div>
      <div className="flex gap-1.5 flex-shrink-0">
        <button
          onClick={handleInstall}
          className="flex items-center gap-1 bg-agro-green hover:bg-agro-lime text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
        >
          <Download className="h-3 w-3" />
          Instalar
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="text-white/40 hover:text-white/80 text-xs px-2 py-1.5 rounded-lg transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
