import { useEffect, useMemo, useState } from 'react'
import { RefreshCw, Search, Sprout, CheckCircle2, XCircle, Clock, Gift } from 'lucide-react'
import { adminApi, type SubscriberRow, type SubStatus } from '../services/api'

/**
 * Painel SaaS do FAZEND.AI — base única de cadastrados (Portal + FAZEND.AI)
 * com a situação da assinatura de cada um. A suspensão por atraso é
 * automática (avaliada a cada request no backend); aqui o advogado define
 * status e datas. subscription = null → nunca abriu o FAZEND.AI.
 */

const STATUS_LABEL: Record<SubStatus, string> = {
  trial: 'Teste grátis',
  ativa: 'Ativa',
  suspensa: 'Suspensa',
  cortesia: 'Cortesia',
}

const fmt = (d: string | null | undefined) =>
  d ? new Date(d).toLocaleDateString('pt-BR') : '—'

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
                    <p className="font-medium text-gray-800">{r.nome}</p>
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
                      Gerenciar
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
        <EditModal
          row={editing}
          adminKey={adminKey}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load() }}
        />
      )}
    </div>
  )
}

function EditModal({
  row, adminKey, onClose, onSaved,
}: { row: SubscriberRow; adminKey: string; onClose: () => void; onSaved: () => void }) {
  const sub = row.subscription
  const toInputDate = (d: string | null | undefined) => (d ? d.slice(0, 10) : '')

  const [status, setStatus] = useState<SubStatus>(sub?.status || 'trial')
  const [paidUntil, setPaidUntil] = useState(toInputDate(sub?.paidUntil))
  const [trialEndsAt, setTrialEndsAt] = useState(toInputDate(sub?.trialEndsAt))
  const [obs, setObs] = useState(sub?.obs || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-bold text-gray-800">{row.nome}</h3>
        <p className="text-xs text-gray-400 mb-4">{row.cpfCnpj || 'sem CPF/CNPJ'} · {row.whatsapp}</p>

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
            "Ativa" exige uma data em "Pago até" — vencendo a data, o acesso é suspenso
            automaticamente. "Cortesia" libera sem cobrança; "Suspensa" bloqueia na hora.
          </p>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button
              onClick={save}
              disabled={saving || (status === 'ativa' && !paidUntil)}
              className="flex-1 bg-agro-green hover:bg-agro-dark text-white font-semibold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50"
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-100"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
