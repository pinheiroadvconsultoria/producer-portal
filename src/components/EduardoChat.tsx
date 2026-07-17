/**
 * EduardoChat.tsx — Eduardo, atendente virtual 24h
 * Especialista em direito do agronegócio (NPL Sociedade de Advogados)
 */

import { useEffect, useRef, useState } from 'react'
import { Send, X, Loader2, Scale } from 'lucide-react'
import { api, type ChatMessage } from '../services/api'

const WELCOME: ChatMessage = {
  role: 'assistant',
  content:
    'Olá! Sou o Eduardo, atendente da NPL especialista em direito do agronegócio. Estou disponível 24 horas para tirar dúvidas sobre o seu processo de crédito rural, linhas de financiamento e o Plano Safra. Como posso ajudar?',
}

export function EduardoChat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  async function send() {
    const text = input.trim()
    if (!text || sending) return
    setInput('')
    const next: ChatMessage[] = [...messages, { role: 'user', content: text }]
    setMessages(next)
    setSending(true)
    try {
      // O histórico enviado exclui a mensagem de boas-vindas local
      const res = await api.chat(next.slice(1))
      setMessages([...next, { role: 'assistant', content: res.reply }])
    } catch {
      setMessages([
        ...next,
        {
          role: 'assistant',
          content:
            'Tive um problema de conexão agora. Tente novamente em instantes ou fale com a equipe NPL pelo WhatsApp cadastrado.',
        },
      ])
    } finally {
      setSending(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-agro-green hover:bg-agro-dark text-white pl-3 pr-4 py-3 rounded-full shadow-2xl transition-colors"
      >
        <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
          <Scale className="w-4 h-4" />
          <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-agro-lime border-2 border-agro-green" />
        </span>
        <span className="text-left leading-tight">
          <span className="block text-sm font-bold">Falar com Eduardo</span>
          <span className="block text-[10px] text-white/70">Atendimento 24h · Direito do Agronegócio</span>
        </span>
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[min(24rem,calc(100vw-2rem))] h-[min(32rem,calc(100vh-6rem))] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-agro-dark text-white px-4 py-3 flex items-center gap-3">
        <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-agro-green flex-shrink-0">
          <Scale className="w-4 h-4" />
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-agro-lime border-2 border-agro-dark" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold leading-tight">Eduardo</p>
          <p className="text-[10px] text-agro-lime leading-tight">Especialista em direito do agronegócio · Online 24h</p>
        </div>
        <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-agro-cream/50">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed ${
                m.role === 'user'
                  ? 'bg-agro-green text-white rounded-br-md'
                  : 'bg-white text-gray-800 border border-gray-100 shadow-sm rounded-bl-md'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-bl-md px-3 py-2">
              <Loader2 className="w-4 h-4 text-agro-green animate-spin" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-100 bg-white">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                send()
              }
            }}
            placeholder="Escreva sua dúvida..."
            rows={1}
            className="flex-1 resize-none px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-agro-green focus:border-transparent"
          />
          <button
            onClick={send}
            disabled={sending || !input.trim()}
            className="p-2.5 bg-agro-green hover:bg-agro-dark text-white rounded-xl transition-colors disabled:opacity-40 flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-gray-400 mt-1.5 text-center">
          Eduardo é um assistente virtual. Orientações finais são da equipe de advogados da NPL.
        </p>
      </div>
    </div>
  )
}
