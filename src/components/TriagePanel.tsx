/**
 * TriagePanel.tsx — Painel do advogado: triagens do Eduardo, consultas
 * solicitadas e pacotes de documentos aguardando liberação.
 */

import { useCallback, useEffect, useState } from 'react'
import {
  Scale, Gavel, CalendarClock, FileSignature, Check, X, Eye, Send, RefreshCw,
  AlertCircle, TrendingUp, Loader2,
} from 'lucide-react'
import {
  adminApi, type AdminDashboard, type Assessment, type CaseViability, type Consultation,
  type DocPackage, type InterestLevel, type PracticeArea,
} from '../services/api'

const AREA: Record<PracticeArea, string> = {
  agronegocio: 'Agronegócio / Crédito Rural',
  trabalhista: 'Trabalhista',
  outro: 'Outra área',
}

const VIABILITY: Record<CaseViability, { label: string; cls: string }> = {
  promissora:     { label: 'Promissora',      cls: 'bg-green-100 text-green-800 border-green-200' },
  requer_analise: { label: 'Requer análise',  cls: 'bg-amber-100 text-amber-800 border-amber-200' },
  inviavel:       { label: 'Inviável',        cls: 'bg-red-100 text-red-700 border-red-200' },
}

const INTEREST: Record<InterestLevel, { label: string; cls: string }> = {
  alto:  { label: 'Interesse alto',  cls: 'bg-agro-green text-white' },
  medio: { label: 'Interesse médio', cls: 'bg-gray-100 text-gray-700' },
  baixo: { label: 'Interesse baixo', cls: 'bg-gray-50 text-gray-500' },
}

const DOC_NAMES: Record<string, string> = {
  procuracao: 'Procuração',
  hipossuficiencia: 'Declaração de hipossuficiência',
  honorarios: 'Contrato de honorários',
}

type Tab = 'triagens' | 'consultas' | 'documentos'

export function TriagePanel({ adminKey }: { adminKey: string }) {
  const [tab, setTab] = useState<Tab>('triagens')
  const [dash, setDash] = useState<AdminDashboard | null>(null)
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [packages, setPackages] = useState<DocPackage[]>([])
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [d, a, c, p] = await Promise.all([
        adminApi.dashboard(adminKey),
        adminApi.listAssessments(adminKey),
        adminApi.listConsultations(adminKey),
        adminApi.listDocPackages(adminKey),
      ])
      setDash(d.data); setAssessments(a.data); setConsultations(c.data); setPackages(p.data)
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Erro ao carregar')
    } finally {
      setLoading(false)
    }
  }, [adminKey])

  useEffect(() => { load() }, [load])

  function flash(text: string) {
    setMsg(text)
    setTimeout(() => setMsg(null), 4000)
  }

  async function decide(id: string, decision: 'aprovada' | 'recusada') {
    await adminApi.decideAssessment(adminKey, id, decision)
    flash(decision === 'aprovada' ? 'Triagem aprovada.' : 'Triagem recusada.')
    load()
  }

  async function confirmConsultation(c: Consultation, whenLocal: string) {
    if (!whenLocal) return
    await adminApi.updateConsultation(adminKey, c.id, {
      status: 'confirmada',
      scheduledAt: new Date(whenLocal).toISOString(),
    })
    flash('Consulta confirmada — o cliente foi avisado por WhatsApp.')
    load()
  }

  async function sendPackage(id: string) {
    try {
      const r = await adminApi.sendDocPackage(adminKey, id)
      flash(r.signUrl ? 'Documentos enviados para assinatura — link enviado ao cliente.' : 'Documentos enviados.')
      load()
    } catch (e) {
      flash(e instanceof Error ? e.message : 'Falha ao enviar')
    }
  }

  const TABS: { key: Tab; label: string; count?: number; icon: typeof Scale }[] = [
    { key: 'triagens',   label: 'Triagens',   count: dash?.triagensPendentes,    icon: Scale },
    { key: 'consultas',  label: 'Consultas',  count: dash?.consultasSolicitadas, icon: CalendarClock },
    { key: 'documentos', label: 'Documentos', count: dash?.docsRascunho,         icon: FileSignature },
  ]

  return (
    <div className="space-y-4">
      {/* Contadores */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Triagens pendentes" value={dash?.triagensPendentes} icon={Scale} destaque />
        <Stat label="Consultas a confirmar" value={dash?.consultasSolicitadas} icon={CalendarClock} />
        <Stat label="Documentos a liberar" value={dash?.docsRascunho} icon={FileSignature} />
        <Stat label="Aguardando assinatura" value={dash?.docsEnviados} icon={TrendingUp} />
      </div>

      {msg && (
        <div className="flex items-start gap-2 bg-agro-cream border border-agro-lime/40 text-agro-dark rounded-xl px-3 py-2 text-xs">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />{msg}
        </div>
      )}

      {/* Abas */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center border-b border-gray-100 px-2">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-3 py-3 text-xs font-semibold border-b-2 transition-colors ${
                tab === t.key ? 'text-agro-green border-agro-green' : 'text-gray-400 border-transparent hover:text-gray-600'
              }`}
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
              {typeof t.count === 'number' && t.count > 0 && (
                <span className="ml-0.5 px-1.5 py-0.5 rounded-full bg-agro-green text-white text-[10px]">{t.count}</span>
              )}
            </button>
          ))}
          <button onClick={load} className="ml-auto p-2 text-gray-400 hover:text-gray-600">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="p-4 space-y-3">
          {loading && !assessments.length && (
            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 text-agro-green animate-spin" /></div>
          )}

          {tab === 'triagens' && (
            assessments.length === 0
              ? <Empty text="Nenhuma triagem registrada ainda. Quando o Eduardo atender um caso, ele aparece aqui." />
              : assessments.map(a => <AssessmentCard key={a.id} a={a} onDecide={decide} />)
          )}

          {tab === 'consultas' && (
            consultations.length === 0
              ? <Empty text="Nenhuma consulta solicitada." />
              : consultations.map(c => <ConsultationCard key={c.id} c={c} onConfirm={confirmConsultation} />)
          )}

          {tab === 'documentos' && (
            packages.length === 0
              ? <Empty text="Nenhum pacote de documentos preparado." />
              : packages.map(p => <PackageCard key={p.id} p={p} adminKey={adminKey} onSend={sendPackage} />)
          )}
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, icon: Icon, destaque }: { label: string; value?: number; icon: typeof Scale; destaque?: boolean }) {
  return (
    <div className={`rounded-2xl p-3 border ${destaque && value ? 'bg-agro-green text-white border-agro-green' : 'bg-white border-gray-100'}`}>
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className={`w-3.5 h-3.5 ${destaque && value ? 'text-white/80' : 'text-agro-green'}`} />
        <p className={`text-[10px] font-medium ${destaque && value ? 'text-white/80' : 'text-gray-400'}`}>{label}</p>
      </div>
      <p className={`text-2xl font-bold ${destaque && value ? 'text-white' : 'text-gray-800'}`}>{value ?? '—'}</p>
    </div>
  )
}

function Empty({ text }: { text: string }) {
  return <p className="text-xs text-gray-400 text-center py-8">{text}</p>
}

function AssessmentCard({ a, onDecide }: { a: Assessment; onDecide: (id: string, d: 'aprovada' | 'recusada') => void }) {
  const v = VIABILITY[a.viability]
  const i = INTEREST[a.interest]
  return (
    <div className="rounded-xl border border-gray-100 p-4">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <p className="font-semibold text-sm text-gray-800">{a.lead.nome}</p>
          <p className="text-[11px] text-gray-400">
            {a.lead.whatsapp} · {AREA[a.area]} · {new Date(a.createdAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${v.cls}`}>{v.label}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${i.cls}`}>{i.label}</span>
        </div>
      </div>

      <p className="text-xs text-gray-700 leading-relaxed">{a.resumo}</p>
      {a.fundamentos && <p className="text-[11px] text-gray-500 mt-1.5"><strong>Fundamentos:</strong> {a.fundamentos}</p>}
      {a.pendencias && <p className="text-[11px] text-amber-700 mt-1"><strong>Pendências:</strong> {a.pendencias}</p>}

      {a.status === 'aguardando_advogado' ? (
        <div className="flex items-center gap-2 mt-3">
          <button onClick={() => onDecide(a.id, 'aprovada')}
            className="inline-flex items-center gap-1.5 bg-agro-green hover:bg-agro-dark text-white text-xs font-semibold px-3 py-1.5 rounded-lg">
            <Check className="w-3.5 h-3.5" />Aprovar caso
          </button>
          <button onClick={() => onDecide(a.id, 'recusada')}
            className="inline-flex items-center gap-1.5 border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-lg">
            <X className="w-3.5 h-3.5" />Recusar
          </button>
        </div>
      ) : (
        <p className={`text-[11px] font-semibold mt-3 ${a.status === 'aprovada' ? 'text-agro-green' : 'text-gray-400'}`}>
          {a.status === 'aprovada' ? '✓ Caso aprovado' : '✕ Caso recusado'}
        </p>
      )}
    </div>
  )
}

function ConsultationCard({ c, onConfirm }: { c: Consultation; onConfirm: (c: Consultation, when: string) => void }) {
  const [when, setWhen] = useState('')
  const pendente = c.status === 'solicitada'
  return (
    <div className="rounded-xl border border-gray-100 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-sm text-gray-800">{c.lead?.nome}</p>
          <p className="text-[11px] text-gray-400">{c.lead?.whatsapp} · {AREA[c.area]}</p>
          <p className="text-xs text-gray-600 mt-1"><strong>Preferência:</strong> {c.preferencia}</p>
          {c.scheduledAt && (
            <p className="text-xs text-agro-green font-medium mt-0.5">
              📅 {new Date(c.scheduledAt).toLocaleString('pt-BR', { dateStyle: 'full', timeStyle: 'short' })}
            </p>
          )}
        </div>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 ${
          pendente ? 'bg-amber-100 text-amber-800' : 'bg-agro-green text-white'
        }`}>{c.status}</span>
      </div>

      {pendente && (
        <div className="flex items-center gap-2 mt-3">
          <input type="datetime-local" value={when} onChange={e => setWhen(e.target.value)}
            className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-agro-green" />
          <button onClick={() => onConfirm(c, when)} disabled={!when}
            className="inline-flex items-center gap-1.5 bg-agro-green hover:bg-agro-dark disabled:opacity-40 text-white text-xs font-semibold px-3 py-1.5 rounded-lg">
            <Check className="w-3.5 h-3.5" />Confirmar e avisar cliente
          </button>
        </div>
      )}
    </div>
  )
}

function PackageCard({ p, adminKey, onSend }: { p: DocPackage; adminKey: string; onSend: (id: string) => void }) {
  const [sending, setSending] = useState(false)
  const podeEnviar = p.status === 'rascunho' || p.status === 'aprovado'

  async function preview() {
    // O preview exige a chave no header — busca e abre como blob
    const res = await fetch(adminApi.docPackagePreviewUrl(p.id), { headers: { 'x-admin-key': adminKey } })
    const blob = await res.blob()
    window.open(URL.createObjectURL(blob), '_blank')
  }

  return (
    <div className="rounded-xl border border-gray-100 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-sm text-gray-800">{p.lead?.nome}</p>
          <p className="text-[11px] text-gray-400">{p.lead?.whatsapp} · {AREA[p.area]}</p>
          <p className="text-xs text-gray-600 mt-1">{(p.kinds || []).map(k => DOC_NAMES[k] || k).join(' + ')}</p>
          {p.honorariosTexto && (
            <p className="text-[11px] text-gray-500 mt-1"><strong>Honorários:</strong> {p.honorariosTexto}</p>
          )}
        </div>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 ${
          p.status === 'assinado' ? 'bg-agro-green text-white'
          : p.status === 'enviado' ? 'bg-blue-100 text-blue-800'
          : 'bg-amber-100 text-amber-800'
        }`}>{p.status}</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-3">
        <button onClick={preview}
          className="inline-flex items-center gap-1.5 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-lg">
          <Eye className="w-3.5 h-3.5" />Conferir PDF
        </button>
        {podeEnviar && (
          <button onClick={async () => { setSending(true); await onSend(p.id); setSending(false) }} disabled={sending}
            className="inline-flex items-center gap-1.5 bg-agro-green hover:bg-agro-dark disabled:opacity-50 text-white text-xs font-semibold px-3 py-1.5 rounded-lg">
            {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            Liberar e enviar para assinatura
          </button>
        )}
        {p.signUrl && (
          <a href={p.signUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-agro-green hover:underline text-xs font-medium">
            <Gavel className="w-3.5 h-3.5" />Link de assinatura
          </a>
        )}
      </div>
    </div>
  )
}
