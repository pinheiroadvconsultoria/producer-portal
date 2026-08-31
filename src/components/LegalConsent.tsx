import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { api } from '../services/api'
import LegalMarkdown from './LegalMarkdown'

/**
 * Checkbox de aceite dos Termos de Uso/Política de Privacidade + WhatsApp,
 * usado no cadastro e no primeiro acesso. O texto vem do backend
 * (GET /api/legal) — fonte única, evita duplicar/desatualizar o conteúdo
 * entre este app e o fazendai-app.
 */
export function LegalConsent({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  const [open, setOpen] = useState(false)
  const [texto, setTexto] = useState<string | null>(null)
  const [loadingTexto, setLoadingTexto] = useState(false)

  async function toggle() {
    const next = !open
    setOpen(next)
    if (next && !texto) {
      setLoadingTexto(true)
      try {
        const res = await api.legal()
        setTexto(res.texto)
      } catch {
        setTexto('Não foi possível carregar o texto agora. Tente novamente em alguns instantes.')
      } finally {
        setLoadingTexto(false)
      }
    }
  }

  return (
    <div>
      <label className="flex items-start gap-2 text-xs text-gray-600">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 flex-shrink-0 accent-agro-green"
          required
        />
        <span>
          Li e aceito os{' '}
          <button type="button" onClick={toggle} className="underline underline-offset-2 text-agro-green hover:text-agro-dark inline-flex items-center gap-0.5">
            Termos de Uso e a Política de Privacidade
            {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          , e autorizo contato via WhatsApp pela NPL Sociedade de Advogados.
        </span>
      </label>

      {open && (
        <div className="mt-2 max-h-48 overflow-y-auto rounded-xl bg-gray-50 p-3 text-xs text-gray-600">
          {loadingTexto ? 'Carregando...' : <LegalMarkdown text={texto || ''} />}
        </div>
      )}
    </div>
  )
}
