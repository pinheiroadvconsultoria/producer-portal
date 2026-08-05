/**
 * AdminPage.tsx — Área administrativa (advogado do agronegócio / equipe NPL)
 * Acesso por chave compartilhada (não é o login do produtor).
 * Permite cadastrar/editar o processo judicial de cada produtor e registrar
 * as movimentações processuais que aparecem no dashboard dele.
 */

import { useEffect, useState } from 'react'
import {
  Lock, Search, Gavel, Plus, Trash2, Save, RefreshCw, ChevronLeft, LogOut, ShieldCheck, AlertCircle,
  UserPlus, X,
} from 'lucide-react'
import {
  adminApi, type AdminLeadSummary, type CaseType, type NewLeadInput, type ProcessMovement, type ProducerData,
} from '../services/api'
import { TriagePanel } from '../components/TriagePanel'

type Section = 'triagem' | 'clientes'

const SESSION_KEY = 'npl_admin_key'

const CASE_TYPES: { value: CaseType; label: string }[] = [
  { value: 'alongamento_divida_rural', label: 'Alongamento de Dívida Rural' },
  { value: 'revisional_contrato_bancario', label: 'Revisional de Contrato Bancário' },
  { value: 'execucao_judicial', label: 'Execução Judicial' },
  { value: 'outro', label: 'Outro' },
]

function goHome() {
  window.history.pushState(null, '', '/')
  window.dispatchEvent(new PopStateEvent('popstate'))
}

export function AdminPage() {
  const [adminKey, setAdminKey] = useState<string | null>(() => sessionStorage.getItem(SESSION_KEY))
  const [keyInput, setKeyInput] = useState('')
  const [authError, setAuthError] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)

  const [leads, setLeads] = useState<AdminLeadSummary[]>([])
  const [loadingLeads, setLoadingLeads] = useState(false)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<ProducerData | null>(null)
  const [creating, setCreating] = useState(false)
  const [section, setSection] = useState<Section>('triagem')

  async function tryLogin(key: string) {
    setChecking(true)
    setAuthError(null)
    try {
      const res = await adminApi.listLeads(key)
      sessionStorage.setItem(SESSION_KEY, key)
      setAdminKey(key)
      setLeads(res.data)
    } catch (e) {
      setAuthError(e instanceof Error ? e.message : 'Chave inválida')
    } finally {
      setChecking(false)
    }
  }

  useEffect(() => {
    if (adminKey) tryLogin(adminKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function refreshLeads() {
    if (!adminKey) return
    setLoadingLeads(true)
    try {
      const res = await adminApi.listLeads(adminKey)
      setLeads(res.data)
    } catch { /* mantém lista anterior */ } finally {
      setLoadingLeads(false)
    }
  }

  async function openLead(id: string) {
    if (!adminKey) return
    const res = await adminApi.getLead(adminKey, id)
    setSelected(res.data)
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY)
    setAdminKey(null)
    setSelected(null)
    setLeads([])
  }

  if (!adminKey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-agro-dark via-agro-green to-agro-lime flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <button onClick={goHome} className="flex items-center gap-1 text-white/70 hover:text-white text-sm font-medium mb-6">
            <ChevronLeft className="h-4 w-4" />Voltar
          </button>
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-5 h-5 text-agro-green" />
              <h1 className="text-lg font-bold text-gray-800">Área Administrativa</h1>
            </div>
            <p className="text-xs text-gray-500 mb-5">Acesso restrito à equipe NPL — processos judiciais e crédito rural</p>
            <form onSubmit={e => { e.preventDefault(); if (keyInput.trim()) tryLogin(keyInput.trim()) }} className="space-y-3">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  value={keyInput}
                  onChange={e => setKeyInput(e.target.value)}
                  placeholder="Chave administrativa"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-agro-green text-gray-800"
                  autoFocus
                />
              </div>
              {authError && (
                <div className="flex items-center gap-2 bg-red-50 text-red-700 rounded-xl px-3 py-2 text-xs">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{authError}
                </div>
              )}
              <button
                type="submit"
                disabled={checking || !keyInput.trim()}
                className="w-full bg-agro-green hover:bg-agro-dark text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60"
              >
                {checking ? 'Verificando...' : 'Entrar'}
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  const filtered = leads.filter(l =>
    !search.trim() ||
    l.nome.toLowerCase().includes(search.toLowerCase()) ||
    (l.cpfCnpj || '').includes(search) ||
    l.whatsapp.includes(search)
  )

  return (
    <div className="min-h-screen bg-agro-cream">
      <header className="bg-agro-dark text-white sticky top-0 z-20 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-agro-lime" />
            <p className="font-bold text-sm">Área Administrativa — NPL</p>
          </div>
          <button onClick={logout} className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white">
            <LogOut className="w-3.5 h-3.5" />Sair
          </button>
        </div>
        <div className="max-w-5xl mx-auto px-4 flex border-t border-white/10">
          {([
            { key: 'triagem', label: 'Atendimento do Eduardo' },
            { key: 'clientes', label: 'Clientes e processos' },
          ] as const).map(s => (
            <button
              key={s.key}
              onClick={() => setSection(s.key)}
              className={`px-1 py-3 mr-6 text-xs font-semibold border-b-2 transition-colors ${
                section === s.key ? 'text-agro-lime border-agro-lime' : 'text-white/50 border-transparent hover:text-white/80'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </header>

      {section === 'triagem' ? (
        <main className="max-w-5xl mx-auto px-4 py-6">
          <TriagePanel adminKey={adminKey} />
        </main>
      ) : (
      <main className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
        {/* Lista de produtores */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 h-fit">
          <button
            onClick={() => { setCreating(true); setSelected(null) }}
            className="w-full flex items-center justify-center gap-2 bg-agro-green hover:bg-agro-dark text-white text-sm font-semibold py-2.5 rounded-xl transition-colors mb-3"
          >
            <UserPlus className="w-4 h-4" />Cadastrar produtor
          </button>
          <div className="flex items-center gap-2 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por nome, CPF ou WhatsApp"
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-agro-green"
              />
            </div>
            <button onClick={refreshLeads} className="p-2 rounded-lg hover:bg-gray-50 text-gray-400 flex-shrink-0">
              <RefreshCw className={`w-3.5 h-3.5 ${loadingLeads ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="space-y-1 max-h-[70vh] overflow-y-auto">
            {filtered.map(l => (
              <button
                key={l.id}
                onClick={() => { setCreating(false); openLead(l.id) }}
                className={`w-full text-left px-3 py-2.5 rounded-xl transition-colors ${
                  selected?.id === l.id ? 'bg-agro-green text-white' : 'hover:bg-agro-cream'
                }`}
              >
                <p className={`text-sm font-semibold ${selected?.id === l.id ? 'text-white' : 'text-gray-800'}`}>{l.nome}</p>
                <p className={`text-[11px] ${selected?.id === l.id ? 'text-white/70' : 'text-gray-400'}`}>
                  {l.whatsapp} · {l.municipio}/{l.uf}
                </p>
                {l.temProcessoJudicial && (
                  <span className={`inline-flex items-center gap-1 mt-1 text-[10px] font-medium ${
                    selected?.id === l.id ? 'text-agro-lime' : 'text-agro-green'
                  }`}>
                    <Gavel className="w-3 h-3" />Processo judicial
                  </span>
                )}
              </button>
            ))}
            {filtered.length === 0 && <p className="text-xs text-gray-400 text-center py-6">Nenhum produtor encontrado.</p>}
          </div>
        </div>

        {/* Detalhe / edição / cadastro */}
        {creating ? (
          <NewLeadForm
            adminKey={adminKey}
            onCancel={() => setCreating(false)}
            onCreated={async (lead) => {
              setCreating(false)
              await refreshLeads()
              openLead(lead.id)
            }}
          />
        ) : selected ? (
          <LeadEditor
            key={selected.id}
            lead={selected}
            adminKey={adminKey}
            onUpdated={() => { openLead(selected.id); refreshLeads() }}
          />
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center text-gray-400">
            Selecione um produtor na lista para editar o processo judicial e as movimentações,
            ou cadastre um novo produtor.
          </div>
        )}
      </main>
      )}
    </div>
  )
}

function NewLeadForm({
  adminKey, onCancel, onCreated,
}: { adminKey: string; onCancel: () => void; onCreated: (lead: ProducerData) => void }) {
  const [form, setForm] = useState<NewLeadInput>({
    nome: '', cpfCnpj: '', whatsapp: '', email: '', municipio: '', uf: '', linhaCredito: '', valorCredito: 0,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (k: keyof NewLeadInput) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: k === 'valorCredito' ? Number(e.target.value) || 0 : e.target.value })

  const digits = (v: string) => v.replace(/\D/g, '')
  const canSubmit = form.nome.trim() && digits(form.cpfCnpj).length >= 11 && digits(form.whatsapp).length >= 10

  async function submit() {
    if (!canSubmit) return
    setSaving(true)
    setError(null)
    try {
      const res = await adminApi.createLead(adminKey, form)
      onCreated(res.data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao cadastrar produtor')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-bold text-gray-800 flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-agro-green" />Cadastrar produtor
        </h2>
        <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-gray-50 text-gray-400">
          <X className="w-4 h-4" />
        </button>
      </div>
      <p className="text-xs text-gray-400 mb-4">
        Após o cadastro, o produtor faz o <strong>primeiro acesso</strong> no portal usando o CPF/CNPJ e o WhatsApp informados aqui.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">Nome completo *</label>
          <input value={form.nome} onChange={set('nome')} placeholder="Nome do produtor"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-agro-green" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">CPF ou CNPJ *</label>
          <input value={form.cpfCnpj} onChange={set('cpfCnpj')} placeholder="000.000.000-00"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-agro-green" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">WhatsApp (com DDD) *</label>
          <input value={form.whatsapp} onChange={set('whatsapp')} placeholder="(91) 98888-7777"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-agro-green" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">E-mail</label>
          <input value={form.email} onChange={set('email')} placeholder="produtor@email.com"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-agro-green" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Município</label>
          <input value={form.municipio} onChange={set('municipio')} placeholder="Ex.: Belém"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-agro-green" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">UF</label>
          <input value={form.uf} onChange={set('uf')} placeholder="PA" maxLength={2}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-agro-green uppercase" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Linha de crédito</label>
          <input value={form.linhaCredito} onChange={set('linhaCredito')} placeholder="Ex.: Pronaf"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-agro-green" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Valor pleiteado (R$)</label>
          <input type="number" value={form.valorCredito || ''} onChange={set('valorCredito')} placeholder="250000"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-agro-green" />
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-red-50 text-red-700 rounded-xl px-3 py-2 text-xs mt-3">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />{error}
        </div>
      )}

      <div className="flex items-center gap-2 mt-4">
        <button
          onClick={submit}
          disabled={saving || !canSubmit}
          className="inline-flex items-center gap-2 bg-agro-green hover:bg-agro-dark text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" />{saving ? 'Cadastrando...' : 'Cadastrar produtor'}
        </button>
        <button onClick={onCancel} className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2">Cancelar</button>
      </div>
    </div>
  )
}

function LeadEditor({ lead, adminKey, onUpdated }: { lead: ProducerData; adminKey: string; onUpdated: () => void }) {
  const [temProcessoJudicial, setTemProcessoJudicial] = useState(lead.temProcessoJudicial ?? false)
  const [tipoAcao, setTipoAcao] = useState<CaseType | ''>(lead.tipoAcao || '')
  const [numeroProcesso, setNumeroProcesso] = useState(lead.numeroProcesso || '')
  const [vara, setVara] = useState(lead.vara || '')
  const [comarca, setComarca] = useState(lead.comarca || '')
  const [faseProcessual, setFaseProcessual] = useState(lead.faseProcessual || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [movements, setMovements] = useState<ProcessMovement[]>(lead.movements || [])
  const [newDate, setNewDate] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [addingMovement, setAddingMovement] = useState(false)

  async function saveProcess() {
    setSaving(true)
    setSaved(false)
    try {
      await adminApi.updateProcess(adminKey, lead.id, {
        temProcessoJudicial,
        tipoAcao: tipoAcao || null,
        numeroProcesso: numeroProcesso.trim() || null,
        vara: vara.trim() || null,
        comarca: comarca.trim() || null,
        faseProcessual: faseProcessual.trim() || null,
      })
      setSaved(true)
      onUpdated()
      setTimeout(() => setSaved(false), 2500)
    } finally {
      setSaving(false)
    }
  }

  async function addMovement() {
    if (!newDate || !newTitle.trim()) return
    setAddingMovement(true)
    try {
      const res = await adminApi.addMovement(adminKey, lead.id, {
        data: newDate, titulo: newTitle.trim(), descricao: newDesc.trim() || undefined,
      })
      setMovements([res.data, ...movements])
      setNewDate(''); setNewTitle(''); setNewDesc('')
    } finally {
      setAddingMovement(false)
    }
  }

  async function removeMovement(id: string) {
    await adminApi.deleteMovement(adminKey, id)
    setMovements(movements.filter(m => m.id !== id))
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-bold text-gray-800">{lead.nome}</h2>
          <label className="flex items-center gap-2 text-xs font-medium text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={temProcessoJudicial}
              onChange={e => setTemProcessoJudicial(e.target.checked)}
              className="w-4 h-4 accent-agro-green"
            />
            Tem processo judicial
          </label>
        </div>
        <p className="text-xs text-gray-400 mb-4">{lead.cpfCnpj} · {lead.whatsapp}</p>

        {temProcessoJudicial && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tipo de ação</label>
              <select
                value={tipoAcao}
                onChange={e => setTipoAcao(e.target.value as CaseType)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-agro-green"
              >
                <option value="">Selecione...</option>
                {CASE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Número do processo</label>
              <input value={numeroProcesso} onChange={e => setNumeroProcesso(e.target.value)}
                placeholder="0000000-00.0000.0.00.0000"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-agro-green" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Vara</label>
              <input value={vara} onChange={e => setVara(e.target.value)} placeholder="Ex.: 2ª Vara Cível"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-agro-green" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Comarca</label>
              <input value={comarca} onChange={e => setComarca(e.target.value)} placeholder="Ex.: Belém/PA"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-agro-green" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Fase processual atual</label>
              <input value={faseProcessual} onChange={e => setFaseProcessual(e.target.value)}
                placeholder="Ex.: Aguardando audiência de conciliação"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-agro-green" />
            </div>
          </div>
        )}

        <button
          onClick={saveProcess}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-agro-green hover:bg-agro-dark text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors disabled:opacity-60"
        >
          <Save className="w-3.5 h-3.5" />{saving ? 'Salvando...' : saved ? 'Salvo ✓' : 'Salvar dados do processo'}
        </button>
      </div>

      {temProcessoJudicial && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
            <Gavel className="w-4 h-4 text-agro-green" />Movimentações processuais
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-2 mb-2">
            <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-agro-green" />
            <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Título (ex.: Audiência designada)"
              className="px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-agro-green" />
          </div>
          <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Descrição (opcional)" rows={2}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs mb-2 focus:outline-none focus:ring-2 focus:ring-agro-green resize-none" />
          <button
            onClick={addMovement}
            disabled={addingMovement || !newDate || !newTitle.trim()}
            className="inline-flex items-center gap-1.5 bg-agro-dark hover:bg-black text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors disabled:opacity-50 mb-4"
          >
            <Plus className="w-3.5 h-3.5" />Adicionar movimentação
          </button>

          <div className="space-y-2 border-t border-gray-100 pt-3">
            {movements.length === 0 && <p className="text-xs text-gray-400">Nenhuma movimentação registrada.</p>}
            {movements.map(m => (
              <div key={m.id} className="flex items-start justify-between gap-2 bg-agro-cream/50 rounded-lg px-3 py-2">
                <div className="min-w-0">
                  <p className="text-[11px] text-gray-400">{new Date(m.data).toLocaleDateString('pt-BR')}</p>
                  <p className="text-xs font-semibold text-gray-800">{m.titulo}</p>
                  {m.descricao && <p className="text-xs text-gray-500">{m.descricao}</p>}
                </div>
                <button onClick={() => removeMovement(m.id)} className="text-gray-300 hover:text-red-500 flex-shrink-0 p-1">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
