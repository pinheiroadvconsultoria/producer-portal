import { useState } from 'react'
import { KeyRound, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { api } from '../services/api'

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword]         = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPass, setShowPass]   = useState(false)
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [done, setDone]           = useState(false)

  const canSubmit = currentPassword && newPassword.length >= 6 && newPassword === confirmPassword

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setSaving(true)
    setError(null)
    try {
      await api.changePassword(currentPassword, newPassword)
      setDone(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setDone(false), 4000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao trocar senha')
    } finally {
      setSaving(false)
    }
  }

  const inputClass =
    'w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-agro-green'

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-agro-green/10 flex items-center justify-center">
          <KeyRound className="w-5 h-5 text-agro-green" />
        </div>
        <h3 className="font-semibold text-gray-800">Trocar senha</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Senha atual</label>
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className={inputClass}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPass(v => !v)}
              aria-label={showPass ? 'Ocultar senha' : 'Mostrar senha'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Nova senha (mínimo 6 caracteres)</label>
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className={inputClass}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPass(v => !v)}
              aria-label={showPass ? 'Ocultar senha' : 'Mostrar senha'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Confirmar nova senha</label>
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className={inputClass}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPass(v => !v)}
              aria-label={showPass ? 'Ocultar senha' : 'Mostrar senha'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {confirmPassword && newPassword !== confirmPassword && (
            <p className="text-xs text-red-500 mt-1">As senhas não coincidem</p>
          )}
        </div>

        {error && (
          <div className="flex items-start gap-2 bg-red-50 text-red-700 rounded-xl px-3 py-2 text-xs">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />{error}
          </div>
        )}

        {done && (
          <div className="flex items-center gap-2 bg-green-50 text-green-700 rounded-xl px-3 py-2 text-xs">
            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />Senha alterada com sucesso
          </div>
        )}

        <button
          type="submit"
          disabled={saving || !canSubmit}
          className="w-full flex items-center justify-center gap-2 bg-agro-green hover:bg-agro-dark text-white text-sm font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-60"
        >
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Salvando...</> : 'Trocar senha'}
        </button>
      </form>
    </div>
  )
}
