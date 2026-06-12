import { useState } from 'react'
import { Sprout, FileText, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import { api } from '../services/api'
import { usePortalStore } from '../store/usePortalStore'
import { FirstAccess } from './FirstAccess'

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
  const [doc, setDoc]           = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [firstAccess, setFirstAccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await api.auth(doc.replace(/\D/g, ''), password)
      setAuth(res.token, res.producer.nome)
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('primeiro acesso')) {
        setFirstAccess(true)
      } else {
        setError(err instanceof Error ? err.message : 'Erro ao acessar portal')
      }
    } finally {
      setLoading(false)
    }
  }

  if (firstAccess) {
    return <FirstAccess onBack={() => setFirstAccess(false)} />
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

            {/* Senha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Sua senha de acesso"
                  className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-agro-green focus:border-transparent text-gray-800"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
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

          {/* Primeiro acesso */}
          <div className="mt-5 text-center">
            <button
              onClick={() => setFirstAccess(true)}
              className="text-sm text-agro-green hover:text-agro-dark font-medium underline underline-offset-2"
            >
              Primeiro acesso? Clique aqui para criar sua senha
            </button>
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            Acesso exclusivo para produtores cadastrados no sistema NPL
          </p>
        </div>
      </div>
    </div>
  )
}
