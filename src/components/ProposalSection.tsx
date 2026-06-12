import { ReceiptText, TrendingUp, Percent } from 'lucide-react'
import type { ProducerData } from '../services/api'

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })
}

interface Props { data: ProducerData }

export function ProposalSection({ data }: Props) {
  const hasProposal = ['proposta_emitida', 'contrato_assinado', 'protocolo_bancario',
    'credito_aprovado', 'honorarios_recebidos', 'finalizado'].includes(data.crmStage)

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
          <ReceiptText className="w-5 h-5 text-amber-600" />
        </div>
        <h3 className="font-semibold text-gray-800">Proposta de Crédito</h3>
      </div>

      {!hasProposal ? (
        <div className="text-center py-6">
          <TrendingUp className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">Proposta em elaboração</p>
          <p className="text-xs text-gray-300 mt-1">Disponível após análise concluída</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Valor solicitado */}
          {data.valorCredito > 0 && (
            <div className="bg-agro-cream rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Valor de crédito</p>
              <p className="text-2xl font-bold text-agro-dark">{fmt(data.valorCredito)}</p>
              {data.linhaCredito && (
                <p className="text-sm text-agro-green mt-1">{data.linhaCredito}</p>
              )}
            </div>
          )}

          {/* Dados do produtor */}
          <div className="grid grid-cols-2 gap-3">
            {data.area && (
              <div>
                <p className="text-xs text-gray-500">Área</p>
                <p className="font-semibold text-gray-800">{data.area.toLocaleString('pt-BR')} ha</p>
              </div>
            )}
            {data.atividade && (
              <div>
                <p className="text-xs text-gray-500">Atividade</p>
                <p className="font-semibold text-gray-800">{data.atividade}</p>
              </div>
            )}
            {data.faturamento && (
              <div>
                <p className="text-xs text-gray-500">Faturamento</p>
                <p className="font-semibold text-gray-800">{fmt(data.faturamento)}</p>
              </div>
            )}
            {data.tipoProdutor && (
              <div>
                <p className="text-xs text-gray-500">Tipo</p>
                <p className="font-semibold text-gray-800">{data.tipoProdutor}</p>
              </div>
            )}
          </div>

          {/* Score */}
          {data.scoreNPL && (
            <div className="flex items-center gap-3 bg-blue-50 rounded-xl p-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Percent className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-blue-600 font-medium">Score NPL</p>
                <p className="font-bold text-blue-800">
                  {data.scoreNPL} — {data.nivelScore || 'Avaliado'}
                </p>
              </div>
            </div>
          )}

          {/* Honorários */}
          {data.honorarios > 0 && (
            <div className="border border-gray-100 rounded-xl p-3">
              <p className="text-xs text-gray-500">Honorários NPL</p>
              <p className="font-semibold text-gray-800">{fmt(data.honorarios)}</p>
            </div>
          )}

          {data.ofertaEspecial && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-700 font-medium">
              Oferta especial aplicada
            </div>
          )}
        </div>
      )}
    </div>
  )
}
