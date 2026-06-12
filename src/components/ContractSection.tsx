import { FileSignature, CheckCircle2, Clock, ExternalLink, Download } from 'lucide-react'
import type { ContractData } from '../services/api'

function fmtDate(v?: string | null) {
  if (!v) return null
  return new Date(v).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

const STATUS_INFO: Record<string, { label: string; color: string }> = {
  pendente:    { label: 'Aguardando envio',   color: 'text-gray-500 bg-gray-50' },
  enviado:     { label: 'Aguardando assinatura', color: 'text-amber-600 bg-amber-50' },
  visualizado: { label: 'Visualizado',        color: 'text-blue-600 bg-blue-50' },
  assinado:    { label: 'Assinado',           color: 'text-green-600 bg-green-50' },
  recusado:    { label: 'Recusado',           color: 'text-red-600 bg-red-50' },
}

interface Props {
  contract: ContractData | null
  zapSignStatus: string
}

export function ContractSection({ contract, zapSignStatus }: Props) {
  const status = STATUS_INFO[contract?.status || zapSignStatus] || STATUS_INFO.pendente

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-agro-green/10 flex items-center justify-center">
          <FileSignature className="w-5 h-5 text-agro-green" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-800">Contrato</h3>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${status.color}`}>
            {status.label}
          </span>
        </div>
      </div>

      {!contract ? (
        <div className="text-center py-6">
          <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">Contrato ainda não disponível</p>
          <p className="text-xs text-gray-300 mt-1">Será enviado após análise concluída</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-500">Documento</p>
            <p className="font-medium text-gray-800 text-sm">{contract.docName}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-500">Enviado em</p>
              <p className="text-sm text-gray-700">{fmtDate(contract.sentAt) || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Assinado em</p>
              <p className="text-sm text-gray-700">{fmtDate(contract.signedAt) || '—'}</p>
            </div>
          </div>

          {contract.status === 'assinado' && (
            <div className="flex items-center gap-2 bg-green-50 rounded-xl px-3 py-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700 font-medium">Contrato assinado com sucesso</span>
            </div>
          )}

          {/* Ações */}
          <div className="flex flex-col gap-2 pt-2">
            {contract.signUrl && contract.status !== 'assinado' && (
              <a
                href={contract.signUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 bg-agro-green text-white rounded-xl py-3 font-semibold text-sm hover:bg-agro-dark transition-colors"
              >
                <FileSignature className="w-4 h-4" />
                Assinar contrato agora
                <ExternalLink className="w-3 h-3" />
              </a>
            )}

            {contract.signedUrl && (
              <a
                href={contract.signedUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 border border-agro-green text-agro-green rounded-xl py-3 font-semibold text-sm hover:bg-agro-green/5 transition-colors"
              >
                <Download className="w-4 h-4" />
                Baixar contrato assinado
              </a>
            )}

            {contract.originalUrl && (
              <a
                href={contract.originalUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 text-gray-500 text-sm hover:text-agro-green transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                Ver documento original
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
