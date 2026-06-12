import { Building2, CheckCircle2, Clock } from 'lucide-react'
import type { ProducerData } from '../services/api'

function fmtDate(v?: string | null) {
  if (!v) return null
  return new Date(v).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

interface Props { data: ProducerData }

export function BankingSection({ data }: Props) {
  const hasBanking = ['protocolo_bancario', 'credito_aprovado', 'honorarios_recebidos', 'finalizado']
    .includes(data.crmStage)

  if (!hasBanking) return null

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
          <Building2 className="w-5 h-5 text-blue-600" />
        </div>
        <h3 className="font-semibold text-gray-800">Status Bancário</h3>
      </div>

      <div className="space-y-3">
        {/* Protocolo */}
        <div className={`flex items-center gap-3 rounded-xl p-3 ${data.bankProtocolAt ? 'bg-blue-50' : 'bg-gray-50'}`}>
          {data.bankProtocolAt ? (
            <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
          ) : (
            <Clock className="w-5 h-5 text-gray-400 shrink-0" />
          )}
          <div>
            <p className="text-sm font-medium text-gray-800">Protocolo Bancário</p>
            {data.bankProtocolAt && (
              <p className="text-xs text-blue-600">{fmtDate(data.bankProtocolAt)}</p>
            )}
          </div>
        </div>

        {/* Aprovação */}
        <div className={`flex items-center gap-3 rounded-xl p-3 ${data.creditApprovedAt ? 'bg-green-50' : 'bg-gray-50'}`}>
          {data.creditApprovedAt ? (
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
          ) : (
            <Clock className="w-5 h-5 text-gray-400 shrink-0" />
          )}
          <div>
            <p className="text-sm font-medium text-gray-800">Crédito Aprovado</p>
            {data.creditApprovedAt && (
              <p className="text-xs text-green-600">{fmtDate(data.creditApprovedAt)}</p>
            )}
          </div>
        </div>

        {/* Status bancário customizado */}
        {data.bankStatus && (
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500">Observação bancária</p>
            <p className="text-sm text-gray-800 mt-0.5">{data.bankStatus}</p>
          </div>
        )}
      </div>
    </div>
  )
}
