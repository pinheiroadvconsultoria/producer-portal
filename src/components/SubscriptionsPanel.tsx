import { useEffect, useMemo, useState } from 'react'
import {
  RefreshCw, Search, Sprout, CheckCircle2, XCircle, Clock, Gift, Landmark,
  FileText, ShieldAlert, ShieldCheck, Lock, Unlock, Pencil,
} from 'lucide-react'
import { adminApi, type SubscriberRow, type SubStatus, type UserDetail } from '../services/api'

/**
 * Painel de usuários do FAZEND.AI (SaaS) — base única de cadastrados
 * (Portal + FAZEND.AI), com uso da plataforma e situação da assinatura.
 * A suspensão por atraso é automática (avaliada a cada request no
 * backend); aqui o advogado gerencia status, datas e bloqueio de conta.
 * subscription = null → nunca abriu o FAZEND.AI.
 */

const STATUS_LABEL: Record<SubStatus, string> = {
  trial: 'Teste grátis',
  ativa: 'Ativa',
  suspensa: 'Suspensa',
  cortesia: 'Cortesia',
}

const CLASSIFICATION_LABEL: Record<string, string> = {
  verde: '🟢 Verde',
  amarelo: '🟡 Amarelo',
  vermelho: '🔴 Vermelho',
}

const DOC_STATUS_LABEL: Record<string, string> = {
  validado: 'Validados',
  pendente: 'Pendentes',
  ausente: 'Ausentes',
  vencido: 'Vencidos',
  ilegivel: 'Ilegíveis',
  em_analise: 'Em análise',
  regularizacao_necessaria: 'Regularização',
}

const fmt = (d: string | null | undefined) =>
  d ? new Date(d).toLocaleDateString('pt-BR') : '—'

const brl = (v: number | null | undefined) =>
  v == null ? '—' : v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

function AccessBadge({ row }: { row: SubscriberRow }) {
  const sub = row.subscription
  if (!sub) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-500">
        <Clock className="h-3 w-3" /> Nunca usou
      </span>
    )
  }
  if (sub.access.allowed) {
    const Icon = sub.status === 'cortesia' ? Gift : CheckCircle2
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
        <Icon className="h-3 w-3" />
        {STATUS_LABEL[sub.status]}
        {sub.access.until ? ` até ${fmt(sub.access.until)}` : ''}
      </span>
    )
  }
  const reasonLabel: Record<string, string> = {
    trial_expirado: 'Teste expirado',
    pagamento_vencido: 'Pagamento vencido',
    suspensa: 'Suspensa',
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700">
      <XCircle className="h-3 w-3" />
      {reasonLabel[sub.access.reason] || 'Bloqueado'}
    </span>
  )
}

export function SubscriptionsPanel({ adminKey }: { adminKey: string }) {
  const [rows, setRows] = useState<SubscriberRow[]>([])
  const [trialDays, setTrialDays] = useState(14)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'todos' | 'ativos' | 'bloqueados' | 'nunca'>('todos')
  const [editing, setEditing] = useState<SubscriberRow | null>(null)
  const [msg, setMsg] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    try {
      const res = await adminApi.listSubscriptions(adminKey)
      setRows(res.data)
      setTrialDays(res.trialDays)
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Falha ao carregar assinaturas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() /* eslint-disable-line react-hooks/exhaustive-deps */ }, [])

  const filtered = useMemo(() => rows.filter((r) => {
    if (search.trim()) {
      const q = search.toLowerCase()
      if (!r.nome.toLowerCase().includes(q) && !(r.cpfCnpj || '').includes(search) && !r.whatsapp.includes(search)) {
        return false
      }
    }
    if (filter === 'ativos') return !!r.subscription?.access.allowed
    if (filter === 'bloqueados') return !!r.subscription && !r.subscription.access.allowed
    if (filter === 'nunca') return !r.subscription
    return true
  }), [rows, search, filter])

  const counts = useMemo(() => ({
    total: rows.length,
    ativos: rows.filter((r) => r.subscription?.access.allowed).length,
    bloqueados: rows.filter((r) => r.subscription && !r.subscription.access.allowed).length,
    nunca: rows.filter((r) => !r.subscription).length,
  }), [rows])

  return (
    <div className="space-y-4">
      {/* Contadores */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {([
          ['Cadastrados', counts.total, 'text-gray-800'],
          ['Com acesso ativo', counts.ativos, 'text-emerald-600'],
          ['Bloqueados', counts.bloqueados, 'text-red-600'],
          ['Nunca usaram', counts.nunca, 'text-gray-400'],
        ] as const).map(([label, value, cls]) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className={`text-2xl font-bold ${cls}`}>{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nome, CPF/CNPJ ou WhatsApp"
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-agro-green"
            />
          </div>
          {([
            ['todos', 'Todos'],
            ['ativos', 'Ativos'],
            ['bloqueados', 'Bloqueados'],
            ['nunca', 'Nunca usaram'],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                filter === key ? 'bg-agro-green text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
          <button
            onClick={load}
            disabled={loading}
            className="ml-auto p-2 rounded-xl hover:bg-gray-100 text-gray-500"
            title="Atualizar"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <p className="text-[11px] text-gray-400 mb-3">
          Novos usuários ganham {trialDays} dias de teste grátis a partir do primeiro uso do FAZEND.AI.
          A suspensão por vencimento é automática — quem pagar volta a entrar assim que a data for atualizada aqui.
        </p>

        {msg && <p className="text-xs text-red-600 mb-2">{msg}</p>}

        {/* Tabela */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-gray-400 border-b border-gray-100">
                <th className="py-2 pr-3">Produtor</th>
                <th className="py-2 pr-3">Contato</th>
                <th className="py-2 pr-3">Uso</th>
                <th className="py-2 pr-3">Assinatura</th>
                <th className="py-2 pr-3">Pago até</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50/60">
                  <td className="py-2.5 pr-3">
                    <p className="font-medium text-gray-800 flex items-center gap-1.5">
                      {r.nome}
                      {r.portalBloqueado && (
                        <span title="Conta bloqueada"><Lock className="h-3 w-3 text-red-500" /></span>
                      )}
                    </p>
                    <p className="text-[11px] text-gray-400">{r.cpfCnpj || 'sem CPF/CNPJ'}</p>
                  </td>
                  <td className="py-2.5 pr-3 text-xs text-gray-500">
                    <p>{r.whatsapp}</p>
                    <p className="text-[11px] text-gray-400">{r.municipio}/{r.uf}</p>
                  </td>
                  <td className="py-2.5 pr-3 text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1">
                      <Sprout className="h-3 w-3 text-agro-lime" />
                      {r.fazendas} faz. · {r.solicitacoesCredito} créd.
                    </span>
                  </td>
                  <td className="py-2.5 pr-3"><AccessBadge row={r} /></td>
                  <td className="py-2.5 pr-3 text-xs text-gray-500">{fmt(r.subscription?.paidUntil)}</td>
                  <td className="py-2.5 text-right">
                    <button
                      onClick={() => setEditing(r)}
                      className="text-xs font-semibold text-agro-green hover:underline"
                    >
                      Ver / gerenciar
                    </button>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sm text-gray-400">
                    {loading ? 'Carregando...' : 'Nenhum cadastrado encontrado.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <UserDetailModal
          row={editing}
          adminKey={adminKey}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load() }}
        />
      )}
    </div>
  )
}

function UserDetailModal({
  row, adminKey, onClose, onSaved,
}: { row: SubscriberRow; adminKey: string; onClose: () => void; onSaved: () => void }) {
  const [detail, setDetail] = useState<UserDetail | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(true)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [blockBusy, setBlockBusy] = useState(false)

  const sub = row.subscription
  const toInputDate = (d: string | null | undefined) => (d ? d.slice(0, 10) : '')

  const [status, setStatus] = useState<SubStatus>(sub?.status || 'trial')
  const [paidUntil, setPaidUntil] = useState(toInputDate(sub?.paidUntil))
  const [trialEndsAt, setTrialEndsAt] = useState(toInputDate(sub?.trialEndsAt))
  const [obs, setObs] = useState(sub?.obs || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Correção do WhatsApp do cadastro (identidade — é como o Eduardo reconhece
  // quem escreve no WhatsApp). Editor inline no cabeçalho do modal.
  const [waAtual, setWaAtual] = useState(row.whatsapp)
  const [editandoWa, setEditandoWa] = useState(false)
  const [novoWa, setNovoWa] = useState(row.whatsapp)
  const [waBusy, setWaBusy] = useState(false)

  async function salvarWhatsapp() {
    setWaBusy(true)
    setDetailError(null)
    try {
      await adminApi.updateWhatsapp(adminKey, row.id, novoWa)
      setWaAtual(novoWa.replace(/\D/g, ''))
      setEditandoWa(false)
    } catch (e) {
      setDetailError(e instanceof Error ? e.message : 'Falha ao alterar o WhatsApp')
    } finally {
      setWaBusy(false)
    }
  }

  // Ajuste manual de créditos de IA (Onda Q) — ex.: dar créditos extra de
  // cortesia sem esperar o ciclo de 30 dias renovar.
  const [ajusteCreditos, setAjusteCreditos] = useState('')
  const [motivoAjuste, setMotivoAjuste] = useState('')
  const [creditosBusy, setCreditosBusy] = useState(false)

  async function salvarAjusteCreditos() {
    const valor = Number(ajusteCreditos)
    if (!Number.isFinite(valor) || valor === 0) {
      setDetailError('Informe um número de créditos diferente de zero.')
      return
    }
    if (motivoAjuste.trim().length < 3) {
      setDetailError('Descreva o motivo do ajuste.')
      return
    }
    setCreditosBusy(true)
    setDetailError(null)
    try {
      const res = await adminApi.adjustCredits(adminKey, row.id, valor, motivoAjuste.trim())
      setDetail((d) => (d ? { ...d, credits: res.data } : d))
      setAjusteCreditos('')
      setMotivoAjuste('')
    } catch (e) {
      setDetailError(e instanceof Error ? e.message : 'Falha ao ajustar créditos')
    } finally {
      setCreditosBusy(false)
    }
  }

  async function loadDetail() {
    setLoadingDetail(true)
    setDetailError(null)
    try {
      const res = await adminApi.getUserDetail(adminKey, row.id)
      setDetail(res.data)
    } catch (e) {
      setDetailError(e instanceof Error ? e.message : 'Falha ao carregar detalhes')
    } finally {
      setLoadingDetail(false)
    }
  }

  useEffect(() => { loadDetail() /* eslint-disable-line react-hooks/exhaustive-deps */ }, [])

  async function toggleBlock() {
    if (!detail) return
    setBlockBusy(true)
    try {
      await adminApi.updateAccess(adminKey, detail.id, !detail.portalBloqueado)
      setDetail((d) => (d ? { ...d, portalBloqueado: !d.portalBloqueado } : d))
    } catch (e) {
      setDetailError(e instanceof Error ? e.message : 'Falha ao alterar bloqueio')
    } finally {
      setBlockBusy(false)
    }
  }

  async function save() {
    setSaving(true)
    setError(null)
    try {
      await adminApi.updateSubscription(adminKey, row.id, {
        status,
        // fim do dia local — pagamento vale o dia inteiro da data escolhida
        paidUntil: paidUntil ? new Date(`${paidUntil}T23:59:59`).toISOString() : null,
        ...(trialEndsAt ? { trialEndsAt: new Date(`${trialEndsAt}T23:59:59`).toISOString() } : {}),
        obs,
      })
      onSaved()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao salvar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-1">
          <div>
            <h3 className="font-bold text-gray-800">{row.nome}</h3>
            <p className="text-xs text-gray-400 flex items-center gap-1.5 flex-wrap">
              <span>{row.cpfCnpj || 'sem CPF/CNPJ'} ·</span>
              {editandoWa ? (
                <span className="inline-flex items-center gap-1">
                  <input
                    value={novoWa}
                    onChange={(e) => setNovoWa(e.target.value)}
                    className="border border-gray-300 rounded-lg px-2 py-0.5 text-xs w-36 text-gray-700"
                    placeholder="DDD + número"
                  />
                  <button
                    onClick={salvarWhatsapp}
                    disabled={waBusy}
                    className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 disabled:opacity-50"
                  >
                    {waBusy ? 'Salvando...' : 'Salvar'}
                  </button>
                  <button
                    onClick={() => { setEditandoWa(false); setNovoWa(waAtual) }}
                    className="px-2 py-0.5 rounded-lg text-xs text-gray-500 border border-gray-200 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1">
                  {waAtual}
                  <button
                    onClick={() => setEditandoWa(true)}
                    title="Corrigir o WhatsApp deste cadastro"
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                </span>
              )}
              <span>· {row.municipio}/{row.uf}</span>
            </p>
          </div>
          <button
            onClick={toggleBlock}
            disabled={!detail || blockBusy}
            title={detail?.portalBloqueado ? 'Desbloquear conta (portal e FAZEND.AI)' : 'Bloquear conta (portal e FAZEND.AI)'}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors disabled:opacity-50 ${
              detail?.portalBloqueado
                ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
            }`}
          >
            {detail?.portalBloqueado ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
            {detail?.portalBloqueado ? 'Desbloquear conta' : 'Bloquear conta'}
          </button>
        </div>
        {detail?.portalBloqueado && (
          <p className="mb-3 flex items-center gap-1.5 text-xs text-red-600">
            <ShieldAlert className="h-3.5 w-3.5" />
            Conta bloqueada — sem acesso ao Portal do Produtor NEM ao FAZEND.AI.
          </p>
        )}

        {detailError && <p className="text-xs text-red-600 mb-3">{detailError}</p>}

        {loadingDetail ? (
          <p className="text-sm text-gray-400 py-6 text-center">Carregando detalhes...</p>
        ) : detail && (
          <div className="space-y-4 mb-5">
            {/* Fazendas */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2 flex items-center gap-1.5">
                <Sprout className="h-3.5 w-3.5" /> Fazendas ({detail.properties.length})
              </h4>
              {detail.properties.length === 0 ? (
                <p className="text-xs text-gray-400">Nenhuma fazenda cadastrada.</p>
              ) : (
                <div className="space-y-1.5">
                  {detail.properties.map((p) => (
                    <div key={p.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2 text-xs">
                      <div>
                        <span className="font-medium text-gray-700">{p.nome}</span>
                        <span className="text-gray-400"> · {p.municipio}/{p.uf}</span>
                        {p.isActive && <span className="ml-1.5 text-agro-green">(ativa)</span>}
                      </div>
                      <span className="text-gray-400">
                        {p.areaTotal ? `${p.areaTotal} ha` : '—'} · {p._count.documents} docs · {p._count.creditRequests} créd.
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Solicitações de crédito */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2 flex items-center gap-1.5">
                <Landmark className="h-3.5 w-3.5" /> Solicitações de crédito ({detail.creditRequests.length})
              </h4>
              {detail.creditRequests.length === 0 ? (
                <p className="text-xs text-gray-400">Nenhuma solicitação.</p>
              ) : (
                <div className="space-y-1.5">
                  {detail.creditRequests.map((c) => (
                    <div key={c.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2 text-xs">
                      <div>
                        <span className="font-medium text-gray-700">{c.program}</span>
                        <span className="text-gray-400"> · {c.property?.nome || 'sem fazenda'} · {brl(c.valorPretendido)}</span>
                      </div>
                      <span>
                        {c.classification ? CLASSIFICATION_LABEL[c.classification] : 'sem análise'}
                        {c.score != null && <span className="text-gray-400"> ({c.score})</span>}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Documentos */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" /> Documentos ({detail.documentsTotal})
              </h4>
              {detail.documentsTotal === 0 ? (
                <p className="text-xs text-gray-400">Nenhum documento enviado.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(detail.documentsByStatus).map(([status, n]) => (
                    <span key={status} className="bg-gray-50 rounded-full px-2.5 py-1 text-[11px] text-gray-600">
                      {DOC_STATUS_LABEL[status] || status}: <strong>{n}</strong>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Assinatura FAZEND.AI */}
        <h4 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2 flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5" /> Assinatura FAZEND.AI
        </h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Situação</label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.entries(STATUS_LABEL) as [SubStatus, string][]).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setStatus(key)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                    status === key
                      ? 'bg-agro-green text-white border-agro-green'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-agro-green'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Pago até</label>
              <input
                type="date"
                value={paidUntil}
                onChange={(e) => setPaidUntil(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-agro-green"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Teste até</label>
              <input
                type="date"
                value={trialEndsAt}
                onChange={(e) => setTrialEndsAt(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-agro-green"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Observações</label>
            <textarea
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-agro-green"
              placeholder="Ex.: pagou por Pix em 13/08; plano anual..."
            />
          </div>

          <p className="text-[11px] text-gray-400">
            "Ativa" exige uma data em "Pago até" — vencendo a data, o acesso ao FAZEND.AI é suspenso
            automaticamente (o Portal continua livre). "Cortesia" libera sem cobrança; "Suspensa" bloqueia
            só o FAZEND.AI na hora — diferente do botão "Bloquear conta" acima, que bloqueia tudo.
          </p>

          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>

        {/* Créditos de IA (Onda Q) — junto com a assinatura, não no lugar dela */}
        <h4 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2 mt-5 flex items-center gap-1.5">
          <Sprout className="h-3.5 w-3.5" /> Créditos de IA
        </h4>
        {detail?.credits ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>
                <span className="font-semibold text-gray-800">{detail.credits.saldo}</span>
                <span className="text-gray-500"> créditos disponíveis</span>
              </span>
              <span className="text-xs text-gray-400">
                Renova em {fmt(detail.credits.renovaEm)}
              </span>
            </div>

            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Ajuste (+/-)</label>
                <input
                  type="number"
                  value={ajusteCreditos}
                  onChange={(e) => setAjusteCreditos(e.target.value)}
                  placeholder="Ex.: 50 ou -10"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-agro-green"
                />
              </div>
              <div className="flex-[2]">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Motivo</label>
                <input
                  value={motivoAjuste}
                  onChange={(e) => setMotivoAjuste(e.target.value)}
                  placeholder="Ex.: cortesia por indicação"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-agro-green"
                />
              </div>
              <button
                onClick={salvarAjusteCreditos}
                disabled={creditosBusy}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
              >
                {creditosBusy ? 'Ajustando...' : 'Ajustar'}
              </button>
            </div>

            {detail.credits.historico.length > 0 && (
              <ul className="space-y-1 text-xs text-gray-500 max-h-28 overflow-y-auto">
                {detail.credits.historico.map((t) => (
                  <li key={t.id} className="flex items-center justify-between">
                    <span>{t.motivo}</span>
                    <span className="flex items-center gap-2">
                      <span className={t.quantidade > 0 ? 'text-emerald-700 font-semibold' : ''}>
                        {t.quantidade > 0 ? `+${t.quantidade}` : t.quantidade}
                      </span>
                      <span>{fmt(t.createdAt)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <p className="text-xs text-gray-400">Este cadastrado ainda não usou o Eduardo no FAZEND.AI.</p>
        )}

        <div className="mt-5">

          <div className="flex gap-2 pt-1">
            <button
              onClick={save}
              disabled={saving || (status === 'ativa' && !paidUntil)}
              className="flex-1 bg-agro-green hover:bg-agro-dark text-white font-semibold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50"
            >
              {saving ? 'Salvando...' : 'Salvar assinatura'}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-100"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
