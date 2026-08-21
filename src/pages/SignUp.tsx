/**
 * SignUp.tsx — Autocadastro no Portal do Produtor Rural
 * Aberto a qualquer interessado: cria a conta e entra direto no portal.
 */

import { useState } from 'react'
import {
  Sprout, FileText, Lock, Phone, User, Mail, MapPin, Eye, EyeOff, Loader2, AlertCircle, ArrowLeft,
} from 'lucide-react'
import { api } from '../services/api'
import { usePortalStore } from '../store/usePortalStore'
import { LegalConsent } from '../components/LegalConsent'

function maskDoc(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 14)
  if (d.length <= 11) {
    if (d.length <= 3) return d
    if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
    if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
  }
  if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`
}

function maskPhone(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

interface Props {
  onBack: () => void
  onNeedFirstAccess: () => void
}

export function SignUp({ onBack, onNeedFirstAccess }: Props) {
  const setAuth = usePortalStore(s => s.setAuth)
  const [nome, setNome]         = useState('')
  const [doc, setDoc]           = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [email, setEmail]       = useState('')
  const [municipio, setMunicipio] = useState('')
  const [uf, setUf]             = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [showPass, setShowPass] = useState(false)
  const [aceiteTermos, setAceiteTermos] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [suggestFirstAccess, setSuggestFirstAccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuggestFirstAccess(false)

    if (!aceiteTermos) {
      setError('É preciso aceitar os Termos de Uso e a Política de Privacidade')
      return
    }
    if (password !== confirm) {
      setError('As senhas não coincidem')
      return
    }
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      return
    }

    setLoading(true)
    try {
      const res = await api.signup({
        nome,
        cpfCnpj: doc.replace(/\D/g, ''),
        whatsapp: whatsapp.replace(/\D/g, ''),
        password,
        email: email.trim() || undefined,
        municipio: municipio.trim() || undefined,
        uf: uf.trim() || undefined,
        aceiteTermos,
      })
      setAuth(res.token, res.producer.nome)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao criar conta'
      setError(msg)
      if (msg.includes('Primeiro acesso') || msg.includes('primeiro acesso')) {
        setSuggestFirstAccess(true)
      }
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-agro-green focus:border-transparent text-gray-800'

  return (
    <div className="min-h-screen bg-gradient-to-br from-agro-dark via-agro-green to-agro-lime flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur mb-3">
            <Sprout className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">AgroCredit</h1>
          <p className="text-agro-lime mt-1 font-medium text-sm">Criar minha conta</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-7">
          <button onClick={onBack} className="flex items-center gap-1 text-gray-400 hover:text-gray-600 text-sm mb-4">
            <ArrowLeft className="w-4 h-4" />Voltar ao login
          </button>

          <h2 className="text-xl font-semibold text-gray-800 mb-1">Cadastre-se gratuitamente</h2>
          <p className="text-gray-500 text-sm mb-5">
            Acompanhe seu crédito rural e processos, e fale com o Eduardo 24h
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Seu nome completo"
                  className={inputClass} required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CPF ou CNPJ *</label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={doc} onChange={e => setDoc(maskDoc(e.target.value))} placeholder="000.000.000-00"
                  className={inputClass} required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp *</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={whatsapp} onChange={e => setWhatsapp(maskPhone(e.target.value))} placeholder="(91) 98888-7777"
                  className={inputClass} required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com (opcional)"
                  className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-[1fr_5rem] gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Município</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input value={municipio} onChange={e => setMunicipio(e.target.value)} placeholder="Sua cidade"
                    className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">UF</label>
                <input value={uf} onChange={e => setUf(e.target.value.toUpperCase().slice(0, 2))} placeholder="PA" maxLength={2}
                  className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-agro-green text-gray-800 uppercase" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha (mínimo 6 caracteres) *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Crie sua senha" className={`${inputClass} pr-10`} required />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar senha *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type={showPass ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)}
                  placeholder="Repita a senha" className={inputClass} required />
              </div>
            </div>

            <LegalConsent checked={aceiteTermos} onChange={setAceiteTermos} />

            {error && (
              <div className="flex items-start gap-2 bg-red-50 text-red-700 rounded-xl px-4 py-3 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span>{error}</span>
                  {suggestFirstAccess && (
                    <button type="button" onClick={onNeedFirstAccess}
                      className="block mt-1 font-semibold underline underline-offset-2">
                      Ir para o primeiro acesso
                    </button>
                  )}
                </div>
              </div>
            )}

            <button type="submit" disabled={loading || !aceiteTermos}
              className="w-full bg-agro-green hover:bg-agro-dark text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60 mt-2">
              {loading ? (<><Loader2 className="w-4 h-4 animate-spin" /> Criando conta...</>) : 'Criar conta e acessar'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-4">
            Ao criar sua conta você poderá acompanhar seu processo e falar com nossa equipe.
          </p>
        </div>
      </div>
    </div>
  )
}
