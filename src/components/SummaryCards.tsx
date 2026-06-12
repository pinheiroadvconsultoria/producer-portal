import { DollarSign, TrendingUp, AlertTriangle, FileCheck } from 'lucide-react'
import type { ProducerData } from '../services/api'

const STAGE_LABELS: Record<string, string> = {
  lead_captado:             'Cadastro Recebido',
  documentacao_recebida:    'Documentação em Análise',
  analise_concluida:        'Análise Concluída',
  regularizacao_necessaria: 'Regularização Necessária',
  proposta_emitida:         'Proposta Enviada',
  contrato_assinado:        'Contrato Assinado',
  protocolo_bancario:       'Protocolo Bancário',
  credito_aprovado:         'Crédito Aprovado',
  honorarios_recebidos:     'Honorários Recebidos',
  finalizado:               'Finalizado',
}

const SCORE_COLORS: Record<string, string> = {
  A: 'text-green-600 bg-green-50',
  B: 'text-blue-600 bg-blue-50',
  C: 'text-yellow-600 bg-yellow-50',
  D: 'text-orange-600 bg-orange-50',
  E: 'text-red-600 bg-red-50',
}

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })
}

interface Props { data: ProducerData }

export function SummaryCards({ data }: Props) {
  const scoreColor = data.scoreNPL ? (SCORE_COLORS[data.scoreNPL] || 'text-gray-600 bg-gray-50') : 'text-gray-400 bg-gray-50'

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Crédito Solicitado */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-agro-green/10 flex items-center justify-center">
            <DollarSign className="w-4 h-4 text-agro-green" />
          </div>
          <span className="text-xs text-gray-500 font-medium">Crédito</span>
        </div>
        <p className="text-lg font-bold text-gray-800">
          {data.valorCredito ? fmt(data.valorCredito) : '—'}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{data.linhaCredito || 'Linha a definir'}</p>
      </div>

      {/* Score NPL */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <span className="text-xs text-gray-500 font-medium">Score</span>
        </div>
        <div className="flex items-center gap-2">
          {data.scoreNPL ? (
            <span className={`text-2xl font-bold px-3 py-1 rounded-xl ${scoreColor}`}>
              {data.scoreNPL}
            </span>
          ) : (
            <p className="text-lg font-bold text-gray-400">Em análise</p>
          )}
        </div>
        {data.nivelScore && <p className="text-xs text-gray-400 mt-0.5">{data.nivelScore}</p>}
      </div>

      {/* Status atual */}
      <div className="col-span-2 bg-gradient-to-r from-agro-green to-agro-lime rounded-2xl p-4 text-white">
        <div className="flex items-center gap-2 mb-1">
          <FileCheck className="w-4 h-4" />
          <span className="text-xs font-medium opacity-80">Status Atual</span>
        </div>
        <p className="font-semibold">{STAGE_LABELS[data.crmStage] || data.crmStage}</p>
        {data.nextAction && (
          <p className="text-xs opacity-75 mt-1">{data.nextAction}</p>
        )}
      </div>

      {/* Regularização */}
      {data.regularizacao > 0 && (
        <div className="col-span-2 bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-medium text-amber-700">Regularização necessária</span>
          </div>
          <p className="font-bold text-amber-800">{fmt(data.regularizacao)}</p>
          <p className="text-xs text-amber-600 mt-0.5">Entre em contato com a equipe NPL</p>
        </div>
      )}
    </div>
  )
}
