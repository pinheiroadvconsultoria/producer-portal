import { useState } from 'react'
import { Sprout, Phone, FileText, Loader2, AlertCircle } from 'lucide-react'
import { api } from '../services/api'
import { usePortalStore } from '../store/usePortalStore'

function maskPhone(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 7) return `(${d.slice(0,2)}) ${d.slice(2)}`
  return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`
}

function maskDoc(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 14)
  if (d.length <= 11) {
    if (d.length <= 3) return d
    if (d.length <= 6) return `${d.slice(0,3)}.${d.slice(3)}`
    if (d.length <= 9) return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6)}`
    return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`
  }
  if (d.length <= 12) return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8)}`
  return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8,12)}-${d.slice(12)}`
}

export function Login() {
  const setAuth = usePortalStore(s => s.setAuth)
  const [phone, setPhone]   = useState('')
  const [doc, setDoc]       = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await api.auth(
        phone.replace(/\D/g, ''),
        doc.replace(/\D/g, '')
      )
      setAuth(res.token, res.producer.nome)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao acessar portal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-agro-dark via-agro-green to-agro-lime flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur mb-4">
            <Sprout className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">AgroCredit</h1>
          <p className="text-agro-lime mt-1 font-medium">Portal do Produtor Rural</p>
          <p className="text-white/60 text-sm mt-2">NPL Sociedade de Advogados</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-1">Acesse sua área</h2>
          <p className="text-gray-500 text-sm mb-6">
            Acompanhe o status do seu crédito rural
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* WhatsApp */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                WhatsApp cadastrado
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(maskPhone(e.target.value))}
                  placeholder="(65) 99999-9999"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-agro-green focus:border-transparent text-gray-800"
                  required
                />
              </div>
            </div>

            {/* CPF/CNPJ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CPF ou CNPJ
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={doc}
                  onChange={e => setDoc(maskDoc(e.target.value))}
                  placeholder="000.000.000-00"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-agro-green focus:border-transparent text-gray-800"
                  required
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 text-red-700 rounded-xl px-4 py-3 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-agro-green hover:bg-agro-dark text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Verificando...</>
              ) : (
                'Acessar minha área'
              )}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            Acesso exclusivo para produtores cadastrados no sistema NPL
          </p>
        </div>
      </div>
    </div>
  )
}
