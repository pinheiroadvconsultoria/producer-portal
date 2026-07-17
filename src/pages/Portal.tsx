import { useEffect, useState } from 'react'
import { LogOut, RefreshCw, Sprout, MapPin, Phone, Mail, Building2 } from 'lucide-react'
import { api } from '../services/api'
import { usePortalStore } from '../store/usePortalStore'
import { StatusTimeline } from '../components/StatusTimeline'
import { SummaryCards } from '../components/SummaryCards'
import { ContractSection } from '../components/ContractSection'
import { ProposalSection } from '../components/ProposalSection'
import { PendenciasSection } from '../components/PendenciasSection'
import { BankingSection } from '../components/BankingSection'
import { NewsSection, InstitutionalLinks } from '../components/NewsSection'
import { EduardoChat } from '../components/EduardoChat'

type Tab = 'status' | 'proposta' | 'contrato' | 'bancario'

export function Portal() {
  const { producerName, data, contract, setData, setContract, setLoading, loading, logout } = usePortalStore()
  const [tab, setTab] = useState<Tab>('status')
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

  const TABS: { key: Tab; label: string }[] = [
    { key: 'status',   label: 'Status' },
    { key: 'proposta', label: 'Proposta' },
    { key: 'contrato', label: 'Contrato' },
    { key: 'bancario', label: 'Banco' },
  ]

  return (
    <div className="min-h-screen bg-agro-cream">
      {/* Header */}
      <header className="bg-agro-dark text-white sticky top-0 z-20 shadow-lg">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-agro-lime/20 flex items-center justify-center">
              <Sprout className="w-5 h-5 text-agro-lime" />
            </div>
            <div>
              <p className="text-xs text-agro-lime font-medium">AgroCredit</p>
              <p className="font-semibold text-sm leading-tight">{producerName || 'Portal do Produtor'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
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

        {/* Info strip */}
        {data && (
          <div className="max-w-lg mx-auto px-4 pb-3 flex items-center gap-4 text-xs text-white/60">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {data.municipio}/{data.uf}
            </span>
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3" />
              {data.whatsapp}
            </span>
            <span className="flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {data.email}
            </span>
          </div>
        )}

        {/* Tabs */}
        <div className="max-w-lg mx-auto px-4 flex border-t border-white/10">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-3 text-xs font-medium transition-colors border-b-2 ${
                tab === t.key
                  ? 'text-agro-lime border-agro-lime'
                  : 'text-white/50 border-transparent hover:text-white/80'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {!data ? (
          <div className="text-center py-12 text-gray-400">
            <p>Nenhum dado disponível.</p>
          </div>
        ) : (
          <>
            {tab === 'status' && (
              <>
                <SummaryCards data={data} />
                <StatusTimeline current={data.crmStage} />
                <PendenciasSection data={data} />
                <NewsSection />
                <InstitutionalLinks />
              </>
            )}

            {tab === 'proposta' && (
              <ProposalSection data={data} />
            )}

            {tab === 'contrato' && (
              <ContractSection contract={contract} zapSignStatus={data.zapSignStatus} />
            )}

            {tab === 'bancario' && (
              <>
                <BankingSection data={data} />
                {!['protocolo_bancario','credito_aprovado','honorarios_recebidos','finalizado'].includes(data.crmStage) && (
                  <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100">
                    <Building2 className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Protocolo bancário ainda não iniciado</p>
                    <p className="text-xs text-gray-300 mt-1">Disponível após assinatura do contrato</p>
                  </div>
                )}
              </>
            )}
          </>
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

