import { useState } from 'react'
import { Sprout, FileText, Phone, Lock, Eye, EyeOff, Loader2, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react'
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

interface Props {
  onBack: () => void
}

export function FirstAccess({ onBack }: Props) {
  const setAuth = usePortalStore(s => s.setAuth)
  const [doc, setDoc]             = useState('')
  const [phone, setPhone]         = useState('')
  const [newPass, setNewPass]     = useState('')
  const [confirm, setConfirm]     = useState('')
  const [showPass, setShowPass]   = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [success, setSuccess]     = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (newPass.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      return
    }
    if (newPass !== confirm) {
      setError('As senhas não coincidem')
      return
    }

    setLoading(true)
    try {
      const res = await api.firstAccess(
        doc.replace(/\D/g, ''),
        phone.replace(/\D/g, ''),
        newPass
      )
      setSuccess(true)
      setTimeout(() => {
        setAuth(res.token, res.producer.nome)
      }, 1500)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao configurar acesso')
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
          <p className="text-agro-lime mt-1 font-medium">Primeiro Acesso</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-5"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar ao login
          </button>

          {success ? (
            <div className="text-center py-6">
              <CheckCircle2 className="w-14 h-14 text-agro-green mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-800">Senha criada com sucesso!</h3>
              <p className="text-gray-500 text-sm mt-1">Entrando na sua área...</p>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-gray-800 mb-1">Crie sua senha</h2>
              <p className="text-gray-500 text-sm mb-6">
                Confirme seus dados cadastrados e defina uma senha de acesso
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

                {/* Nova senha */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nova senha (mínimo 6 caracteres)
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={newPass}
                      onChange={e => setNewPass(e.target.value)}
                      placeholder="Crie uma senha"
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

                {/* Confirmar senha */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      placeholder="Repita a senha"
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-agro-green hover:bg-agro-dark text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Configurando...</>
                  ) : (
                    'Criar senha e acessar'
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
