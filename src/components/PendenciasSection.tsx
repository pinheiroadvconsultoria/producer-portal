import { useState } from 'react'
import { AlertCircle, CheckCircle2, Send, Loader2 } from 'lucide-react'
import type { ProducerData } from '../services/api'
import { api } from '../services/api'

interface Props { data: ProducerData }

export function PendenciasSection({ data }: Props) {
  const [msg, setMsg]         = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent]       = useState(false)

  const hasPendencias = data.crmStage === 'regularizacao_necessaria' || data.tasks.length > 0

  async function handleSend() {
    if (!msg.trim()) return
    setSending(true)
    try {
      await api.confirmDocuments(msg)
      setSent(true)
      setMsg('')
    } catch {
      // silent
    } finally {
      setSending(false)
    }
  }

  if (!hasPendencias && data.crmStage !== 'documentacao_recebida') return null

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
          <AlertCircle className="w-5 h-5 text-red-500" />
        </div>
        <h3 className="font-semibold text-gray-800">Pendências e Documentação</h3>
      </div>

      {/* Tasks pendentes */}
      {data.tasks.length > 0 && (
        <div className="space-y-2 mb-4">
          {data.tasks.map(task => (
            <div key={task.id} className="flex items-start gap-3 bg-amber-50 rounded-xl p-3">
              <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-800">{task.title}</p>
                {task.description && (
                  <p className="text-xs text-gray-500 mt-0.5">{task.description}</p>
                )}
                <p className="text-xs text-amber-600 mt-1">Prazo: {task.dueDate}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mensagem para a equipe */}
      <div className="border-t border-gray-50 pt-4">
        <p className="text-xs text-gray-500 mb-2">Enviar mensagem para a equipe NPL</p>

        {sent ? (
          <div className="flex items-center gap-2 bg-green-50 rounded-xl px-4 py-3 text-sm text-green-700">
            <CheckCircle2 className="w-4 h-4" />
            Mensagem enviada! A equipe entrará em contato.
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={msg}
              onChange={e => setMsg(e.target.value)}
              placeholder="Escreva sua mensagem..."
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-agro-green"
              onKeyDown={e => e.key === 'Enter' && handleSend()}
            />
            <button
              onClick={handleSend}
              disabled={sending || !msg.trim()}
              className="px-4 py-2.5 bg-agro-green text-white rounded-xl hover:bg-agro-dark transition-colors disabled:opacity-50"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
