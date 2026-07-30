/**
 * ProcessMovements.tsx — Movimentação processual (ações judiciais)
 * Exibido quando o produtor tem um processo judicial vinculado
 * (ex.: ação de alongamento de dívida rural).
 */

import { Gavel, Scale, MapPin, FileText } from 'lucide-react'
import type { CaseType, ProcessMovement } from '../services/api'

const CASE_TYPE_LABELS: Record<CaseType, string> = {
  alongamento_divida_rural: 'Ação de Alongamento de Dívida Rural',
  revisional_contrato_bancario: 'Ação Revisional de Contrato Bancário',
  execucao_judicial: 'Execução Judicial',
  outro: 'Ação Judicial',
}

interface Props {
  tipoAcao?: CaseType | null
  numeroProcesso?: string | null
  vara?: string | null
  comarca?: string | null
  faseProcessual?: string | null
  movements: ProcessMovement[]
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function ProcessMovements({ tipoAcao, numeroProcesso, vara, comarca, faseProcessual, movements }: Props) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-1">
        <Gavel className="w-5 h-5 text-agro-green" />
        <h2 className="text-lg font-semibold text-gray-800">Processo Judicial</h2>
      </div>
      <p className="text-xs text-gray-400 mb-4">
        Movimentação do seu processo judicial de crédito rural, acompanhado pela equipe NPL
      </p>

      <div className="rounded-xl bg-agro-cream/60 border border-agro-lime/30 p-4 mb-5 space-y-2">
        <p className="text-sm font-semibold text-agro-dark flex items-center gap-2">
          <Scale className="w-4 h-4 flex-shrink-0" />
          {tipoAcao ? CASE_TYPE_LABELS[tipoAcao] : 'Ação Judicial'}
        </p>
        {numeroProcesso && (
          <p className="text-xs text-gray-600 flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 flex-shrink-0" />
            Processo nº {numeroProcesso}
          </p>
        )}
        {(vara || comarca) && (
          <p className="text-xs text-gray-600 flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            {[vara, comarca].filter(Boolean).join(' — ')}
          </p>
        )}
        {faseProcessual && (
          <p className="text-xs font-medium text-agro-green mt-1">Fase atual: {faseProcessual}</p>
        )}
      </div>

      {movements.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <Gavel className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">Nenhuma movimentação registrada ainda.</p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-100" />
          <div className="space-y-5">
            {movements.map((m, idx) => (
              <div key={m.id} className="flex items-start gap-4 relative">
                <div className="relative z-10 flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    idx === 0 ? 'bg-agro-green ring-4 ring-agro-lime/20' : 'bg-white border-2 border-gray-200'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-white' : 'bg-gray-300'}`} />
                  </div>
                </div>
                <div className="pb-1">
                  <p className="text-xs text-gray-400 font-medium">{formatDate(m.data)}</p>
                  <p className={`font-medium text-sm ${idx === 0 ? 'text-agro-green' : 'text-gray-700'}`}>
                    {m.titulo}
                    {idx === 0 && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-agro-lime/20 text-agro-dark">
                        Mais recente
                      </span>
                    )}
                  </p>
                  {m.descricao && <p className="text-xs text-gray-500 mt-0.5">{m.descricao}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
