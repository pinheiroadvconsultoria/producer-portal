import { useState } from 'react'
import { ChevronLeft, CircleAlert, CheckCircle2, Download as DownloadIcon, ExternalLink, Monitor, Sprout } from 'lucide-react'
import { detectBrowser, type DetectedBrowser } from '../utils/detectBrowser'
import { usePwaInstall } from '../hooks/usePwaInstall'

export function Download() {
  const { installed, install } = usePwaInstall()
  const [browser] = useState<DetectedBrowser>(() => detectBrowser())
  const [justInstalled, setJustInstalled] = useState(false)
  const [showManualHint, setShowManualHint] = useState(false)

  async function handleInstallChrome() {
    const outcome = await install()
    if (outcome === 'accepted') {
      setJustInstalled(true)
    } else {
      // Prompt nativo indisponível (app já instalado, Chrome não ofertou) ou
      // dispensado pelo usuário — mostrar o caminho manual.
      setShowManualHint(true)
    }
  }

  function goHome() {
    window.history.pushState(null, '', '/')
    window.dispatchEvent(new PopStateEvent('popstate'))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-agro-dark via-agro-green to-agro-lime flex items-center justify-center p-4">
      <div className="w-full max-w-xl space-y-6">
        <button onClick={goHome} className="flex items-center gap-1 text-white/70 hover:text-white text-sm font-medium">
          <ChevronLeft className="h-4 w-4" />Voltar
        </button>

        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur mb-4">
            <Sprout className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Baixe o Portal do Produtor Rural</h1>
          <p className="text-white/70 mt-2 max-w-md mx-auto text-sm">
            Acompanhe o status do seu crédito rural, propostas, contrato e pendências direto pelo aplicativo.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6 text-center space-y-4">
          {justInstalled || installed ? (
            <div className="flex flex-col items-center gap-2 py-2">
              <CheckCircle2 className="h-8 w-8 text-agro-green" />
              <p className="font-bold text-gray-800">Portal instalado com sucesso.</p>
              <p className="text-xs text-gray-500">Abra pelo ícone instalado no seu computador ou celular.</p>
            </div>
          ) : browser === 'chrome' ? (
            <>
              <div className="flex flex-col items-center gap-1">
                <p className="font-bold text-gray-800">Instale o Portal como aplicativo</p>
                <p className="text-xs text-gray-500 max-w-sm">Funciona direto pelo Chrome, abre em janela própria e fica com acesso rápido no seu computador.</p>
              </div>
              <button
                onClick={handleInstallChrome}
                className="inline-flex items-center gap-2 bg-agro-green hover:bg-agro-dark text-white font-semibold px-5 py-3 rounded-xl transition-colors mx-auto"
              >
                <DownloadIcon className="h-4 w-4" />Instalar aplicativo no Chrome
              </button>
              {showManualHint && (
                <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 text-left space-y-2">
                  <p className="text-xs font-bold text-gray-800">O Chrome não abriu o prompt automático. Instale manualmente:</p>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Clique nos três pontinhos do Chrome (⋮) &gt; <strong>Salvar e compartilhar</strong> &gt; <strong>Instalar página como app</strong>.
                  </p>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Ou clique no ícone de instalação na barra de endereço (ao lado da estrela).
                    Se o menu mostrar <strong>&quot;Abrir no Portal do Produtor Rural&quot;</strong>, o app já está instalado neste computador.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-start gap-3 text-left">
              <CircleAlert className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">Para melhor experiência e poder instalar como aplicativo, use o <strong>Google Chrome</strong>.</p>
            </div>
          )}

          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-500 mb-2">Ou continue direto pelo navegador, sem instalar nada:</p>
            <button
              onClick={goHome}
              className="inline-flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold px-5 py-2.5 rounded-xl transition-colors mx-auto"
            >
              <ExternalLink className="h-4 w-4" />Acessar pelo navegador
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-white/50 flex items-center justify-center gap-1.5">
          <Monitor className="h-3.5 w-3.5" />NPL Sociedade de Advogados
        </p>
      </div>
    </div>
  )
}
