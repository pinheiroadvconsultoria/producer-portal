import { useEffect, useState } from 'react'
import {
  LogOut, RefreshCw, Sprout, MapPin, Phone, Mail, Building2, ChevronLeft, ChevronRight,
  Activity, ReceiptText, FileSignature, AlertCircle, Newspaper, CheckCircle2, KeyRound,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { api } from '../services/api'
import type { ProducerData } from '../services/api'
import { usePortalStore } from '../store/usePortalStore'
import { StatusTimeline, STAGES } from '../components/StatusTimeline'
import { SummaryCards } from '../components/SummaryCards'
import { ContractSection } from '../components/ContractSection'
import { ProposalSection } from '../components/ProposalSection'
import { PendenciasSection } from '../components/PendenciasSection'
import { BankingSection } from '../components/BankingSection'
import { NewsSection, InstitutionalLinks } from '../components/NewsSection'
import { ProcessMovements } from '../components/ProcessMovements'
import { EduardoChat } from '../components/EduardoChat'
import { TiltCard } from '../components/TiltCard'
import { ProgressRing } from '../components/ProgressRing'
import { ChangePasswordForm } from '../components/ChangePasswordForm'

type ModuleKey = 'status' | 'proposta' | 'contrato' | 'bancario' | 'pendencias' | 'noticias' | 'conta'
type View = 'hub' | ModuleKey

const CONTRACT_STATUS_LABEL: Record<string, string> = {
  pendente:    'Aguardando envio',
  enviado:     'Aguardando assinatura',
  visualizado: 'Visualizado',
  assinado:    'Assinado',
  recusado:    'Recusado',
}

const HAS_PROPOSAL_STAGES = ['proposta_emitida', 'contrato_assinado', 'protocolo_bancario', 'credito_aprovado', 'honorarios_recebidos', 'finalizado']
const HAS_BANKING_STAGES  = ['protocolo_bancario', 'credito_aprovado', 'honorarios_recebidos', 'finalizado']

function fmtMoney(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })
}

function processProgress(data: ProducerData) {
  const idx = STAGES.findIndex(s => s.key === data.crmStage)
  const percent = idx >= 0 ? Math.round(((idx + 1) / STAGES.length) * 100) : 0
  const stage = idx >= 0 ? STAGES[idx] : null
  return { percent, stage }
}

function hasPendencias(data: ProducerData) {
  return data.crmStage === 'regularizacao_necessaria' || data.tasks.length > 0 || data.crmStage === 'documentacao_recebida'
}

interface ModuleDef {
  key: ModuleKey
  label: string
  icon: LucideIcon
  iconBg: string
  iconColor: string
  stat: (data: ProducerData) => string
}

const MODULES: ModuleDef[] = [
  {
    key: 'status', label: 'Status do Processo', icon: Activity,
    iconBg: 'bg-agro-green/10', iconColor: 'text-agro-green',
    stat: data => {
      const { percent, stage } = processProgress(data)
      return stage ? `${percent}% — ${stage.label}` : 'Em processamento'
    },
  },
  {
    key: 'proposta', label: 'Proposta de Crédito', icon: ReceiptText,
    iconBg: 'bg-amber-50', iconColor: 'text-amber-600',
    stat: data => HAS_PROPOSAL_STAGES.includes(data.crmStage) && data.valorCredito
      ? fmtMoney(data.valorCredito)
      : 'Em elaboração',
  },
  {
    key: 'contrato', label: 'Contrato', icon: FileSignature,
    iconBg: 'bg-agro-green/10', iconColor: 'text-agro-green',
    stat: data => CONTRACT_STATUS_LABEL[data.zapSignStatus] || 'Aguardando envio',
  },
  {
    key: 'bancario', label: 'Status Bancário', icon: Building2,
    iconBg: 'bg-blue-50', iconColor: 'text-blue-600',
    stat: data => data.creditApprovedAt ? 'Crédito aprovado' : data.bankProtocolAt ? 'Protocolado' : 'Aguardando contrato',
  },
  {
    key: 'pendencias', label: 'Pendências', icon: AlertCircle,
    iconBg: 'bg-red-50', iconColor: 'text-red-500',
    stat: data => hasPendencias(data) ? `${data.tasks.length || 1} pendência(s)` : 'Tudo em dia',
  },
  {
    key: 'noticias', label: 'Notícias & Links', icon: Newspaper,
    iconBg: 'bg-agro-lime/10', iconColor: 'text-agro-green',
    stat: () => 'Plano Safra 2026/27',
  },
  {
    key: 'conta', label: 'Minha Conta', icon: KeyRound,
    iconBg: 'bg-gray-100', iconColor: 'text-gray-600',
    stat: () => 'Senha e segurança',
  },
]

const MODULE_TITLES: Record<ModuleKey, string> = {
  status:     'Status do Processo',
  proposta:   'Proposta de Crédito',
  contrato:   'Contrato',
  bancario:   'Status Bancário',
  pendencias: 'Pendências',
  noticias:   'Notícias & Links',
  conta:      'Minha Conta',
}

export function Portal() {
  const { producerName, data, contract, setData, setContract, setLoading, loading, logout } = usePortalStore()
  const [view, setView] = useState<View>('hub')
  const [refreshing, setRefreshing] = useState(false)

  async function load(silent = false) {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const [meRes, contractRes] = await Promise.all([
        api.me(),
        api.contract(),
      ])
      setData(meRes.data)
      setContract(contractRes.data)
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('autorizado')) logout()
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { load() }, [])

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-agro-cream flex items-center justify-center">
        <div className="text-center">
          <Sprout className="w-10 h-10 text-agro-green mx-auto mb-3 animate-pulse" />
          <p className="text-gray-600">Carregando seus dados...</p>
        </div>
      </div>
    )
  }

  const { percent, stage } = data ? processProgress(data) : { percent: 0, stage: null }

  return (
    <div className="min-h-screen bg-agro-cream">
      {/* Header */}
      <header className="bg-agro-dark text-white sticky top-0 z-20 shadow-lg">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {view !== 'hub' ? (
              <button
                onClick={() => setView('hub')}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/15 flex items-center justify-center transition-colors shrink-0"
                aria-label="Voltar aos módulos"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            ) : (
              <div className="w-9 h-9 rounded-xl bg-agro-lime/20 flex items-center justify-center shrink-0">
                <Sprout className="w-5 h-5 text-agro-lime" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs text-agro-lime font-medium">AgroCredit</p>
              <p className="font-semibold text-sm leading-tight truncate">
                {view === 'hub' ? (producerName || 'Portal do Produtor') : MODULE_TITLES[view]}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => load(true)}
              disabled={refreshing}
              className="p-2 rounded-xl hover:bg-white/10 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={logout}
              className="p-2 rounded-xl hover:bg-white/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Info strip — só no hub, pra não repetir em todo módulo */}
        {view === 'hub' && data && (
          <div className="max-w-lg mx-auto px-4 pb-3 flex items-center gap-4 text-xs text-white/60 overflow-hidden">
            <span className="flex items-center gap-1 shrink-0">
              <MapPin className="w-3 h-3" />
              {data.municipio}/{data.uf}
            </span>
            <span className="flex items-center gap-1 shrink-0">
              <Phone className="w-3 h-3" />
              {data.whatsapp}
            </span>
            <span className="flex items-center gap-1 truncate">
              <Mail className="w-3 h-3 shrink-0" />
              {data.email}
            </span>
          </div>
        )}
      </header>

      {/* Content */}
      <main className="max-w-lg mx-auto px-4 py-6">
        {!data ? (
          <div className="text-center py-12 text-gray-400">
            <p>Nenhum dado disponível.</p>
          </div>
        ) : view === 'hub' ? (
          <div key="hub" className="view-enter space-y-5">
            {/* Hero — visão geral do andamento, com leve inclinação 3D */}
            <TiltCard
              maxTilt={6}
              className="rounded-3xl bg-gradient-to-br from-agro-dark via-agro-green to-[#2d6a4f] p-5 shadow-xl"
            >
              <div className="flex items-center gap-5">
                <ProgressRing percent={percent} label={stage?.label} />
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wide text-white/60 font-medium">Andamento geral</p>
                  <p className="text-lg font-bold text-white leading-tight mt-0.5">
                    {stage ? stage.label : 'Em processamento'}
                  </p>
                  {data.nextAction && (
                    <p className="text-xs text-white/70 mt-1.5 leading-relaxed">{data.nextAction}</p>
                  )}
                </div>
              </div>
            </TiltCard>

            {/* Módulos */}
            <div className="grid grid-cols-2 gap-3">
              {MODULES.map(mod => {
                const Icon = mod.icon
                return (
                  <TiltCard
                    key={mod.key}
                    onClick={() => setView(mod.key)}
                    className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100 cursor-pointer"
                  >
                    <div className={`w-10 h-10 rounded-xl ${mod.iconBg} flex items-center justify-center mb-3`}>
                      <Icon className={`w-5 h-5 ${mod.iconColor}`} />
                    </div>
                    <p className="text-sm font-semibold text-gray-800 leading-tight">{mod.label}</p>
                    <p className="text-xs text-gray-500 mt-1 leading-snug">{mod.stat(data)}</p>
                    <div className="flex items-center justify-end mt-2">
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    </div>
                  </TiltCard>
                )
              })}
            </div>
          </div>
        ) : (
          <div key={view} className="view-enter space-y-4">
            {view === 'status' && (
              <>
                <SummaryCards data={data} />
                <StatusTimeline current={data.crmStage} />
                {data.temProcessoJudicial && (
                  <ProcessMovements
                    tipoAcao={data.tipoAcao}
                    numeroProcesso={data.numeroProcesso}
                    vara={data.vara}
                    comarca={data.comarca}
                    faseProcessual={data.faseProcessual}
                    movements={data.movements || []}
                  />
                )}
              </>
            )}

            {view === 'proposta' && (
              <ProposalSection data={data} />
            )}

            {view === 'contrato' && (
              <ContractSection contract={contract} zapSignStatus={data.zapSignStatus} />
            )}

            {view === 'bancario' && (
              <>
                <BankingSection data={data} />
                {!HAS_BANKING_STAGES.includes(data.crmStage) && (
                  <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100">
                    <Building2 className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Protocolo bancário ainda não iniciado</p>
                    <p className="text-xs text-gray-300 mt-1">Disponível após assinatura do contrato</p>
                  </div>
                )}
              </>
            )}

            {view === 'pendencias' && (
              <>
                <PendenciasSection data={data} />
                {!hasPendencias(data) && (
                  <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100">
                    <CheckCircle2 className="w-8 h-8 text-agro-green/40 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Nenhuma pendência no momento</p>
                    <p className="text-xs text-gray-300 mt-1">Avisamos por aqui assim que surgir algo</p>
                  </div>
                )}
              </>
            )}

            {view === 'noticias' && (
              <>
                <NewsSection />
                <InstitutionalLinks />
              </>
            )}

            {view === 'conta' && (
              <ChangePasswordForm />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-lg mx-auto px-4 py-6 pb-24 text-center">
        <p className="text-xs text-gray-400">
          <a href="https://npladvogados.com.br/" target="_blank" rel="noopener noreferrer" className="hover:text-agro-green">
            NPL Sociedade de Advogados
          </a>
          {' · '}
          <a href="https://npladvs.com.br/credito-rural" target="_blank" rel="noopener noreferrer" className="hover:text-agro-green">
            AgroCredit
          </a>
        </p>
        <p className="text-xs text-gray-300 mt-0.5">Portal do Produtor Rural</p>
      </footer>

      {/* Eduardo — atendimento 24h */}
      <EduardoChat />
    </div>
  )
}
