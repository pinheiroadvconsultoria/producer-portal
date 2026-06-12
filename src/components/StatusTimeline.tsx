import { CheckCircle2, Circle, Clock } from 'lucide-react'
import type { CrmStage } from '../services/api'

const STAGES: { key: CrmStage; label: string; description: string }[] = [
  { key: 'lead_captado',             label: 'Cadastro Recebido',       description: 'Seus dados foram registrados' },
  { key: 'documentacao_recebida',    label: 'Documentação em Análise', description: 'Documentos recebidos e em verificação' },
  { key: 'analise_concluida',        label: 'Análise Concluída',       description: 'Análise de crédito finalizada' },
  { key: 'regularizacao_necessaria', label: 'Regularização',           description: 'Pendências identificadas para regularizar' },
  { key: 'proposta_emitida',         label: 'Proposta Enviada',        description: 'Proposta de crédito gerada' },
  { key: 'contrato_assinado',        label: 'Contrato Assinado',       description: 'Contrato formalizado com assinatura digital' },
  { key: 'protocolo_bancario',       label: 'Protocolo Bancário',      description: 'Processo protocolado no banco' },
  { key: 'credito_aprovado',         label: 'Crédito Aprovado',        description: 'Crédito aprovado pela instituição' },
  { key: 'honorarios_recebidos',     label: 'Honorários',              description: 'Honorários recebidos' },
  { key: 'finalizado',               label: 'Finalizado',              description: 'Processo concluído com sucesso' },
]

interface Props {
  current: CrmStage
}

export function StatusTimeline({ current }: Props) {
  const currentIdx = STAGES.findIndex(s => s.key === current)

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-800 mb-6">Status do Processo</h2>
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-100" />

        <div className="space-y-5">
          {STAGES.map((stage, idx) => {
            const done    = idx < currentIdx
            const active  = idx === currentIdx
            const pending = idx > currentIdx

            return (
              <div key={stage.key} className="flex items-start gap-4 relative">
                {/* Icon */}
                <div className="relative z-10 flex-shrink-0">
                  {done ? (
                    <CheckCircle2 className="w-8 h-8 text-agro-green bg-white" />
                  ) : active ? (
                    <div className="w-8 h-8 rounded-full bg-agro-green flex items-center justify-center ring-4 ring-agro-lime/20">
                      <Clock className="w-4 h-4 text-white" />
                    </div>
                  ) : (
                    <Circle className="w-8 h-8 text-gray-200 bg-white" />
                  )}
                </div>

                {/* Text */}
                <div className={`pb-2 ${pending ? 'opacity-40' : ''}`}>
                  <p className={`font-medium text-sm ${active ? 'text-agro-green' : done ? 'text-gray-700' : 'text-gray-400'}`}>
                    {stage.label}
                    {active && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-agro-lime/20 text-agro-dark">
                        Atual
                      </span>
                    )}
                  </p>
                  {(done || active) && (
                    <p className="text-xs text-gray-500 mt-0.5">{stage.description}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
