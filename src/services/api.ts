const BASE = import.meta.env.VITE_API_URL || 'https://agrocredit-7ou0.onrender.com'

function getToken() {
  return localStorage.getItem('producer_token')
}

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = getToken()
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    },
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Erro na requisição')
  return json
}

export const api = {
  auth: (whatsapp: string, cpfCnpj: string) =>
    request<{ token: string; producer: { nome: string; email: string; municipio: string; uf: string } }>(
      '/api/producer/auth',
      { method: 'POST', body: JSON.stringify({ whatsapp, cpfCnpj }) }
    ),

  me: () => request<{ data: ProducerData }>('/api/producer/me'),

  contract: () => request<{ data: ContractData | null }>('/api/producer/contract'),

  confirmDocuments: (message: string) =>
    request('/api/producer/documents/confirm', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),
}

export type CrmStage =
  | 'lead_captado'
  | 'documentacao_recebida'
  | 'analise_concluida'
  | 'regularizacao_necessaria'
  | 'proposta_emitida'
  | 'contrato_assinado'
  | 'protocolo_bancario'
  | 'credito_aprovado'
  | 'honorarios_recebidos'
  | 'finalizado'

export interface Note {
  id: string
  text: string
  author: string
  createdAt: string
}

export interface FollowUp {
  id: string
  date: string
  time: string
  type: string
  observation?: string
}

export interface Task {
  id: string
  title: string
  description?: string
  type: string
  dueDate: string
  priority: string
  status: string
}

export interface ProducerData {
  id: string
  nome: string
  email: string
  whatsapp: string
  municipio: string
  uf: string
  cpfCnpj?: string
  atividade?: string
  area?: number
  faturamento?: number
  tipoProdutor?: string
  linhaCredito?: string
  valorCredito: number
  scoreNPL?: string
  scoreGlobal?: number
  nivelScore?: string
  honorarios: number
  regularizacao: number
  ofertaEspecial: boolean
  reenquadrado: boolean
  crmStage: CrmStage
  nextAction?: string
  zapSignStatus: string
  zapSignDocUrl?: string
  contratoSignedAt?: string
  bankStatus?: string
  bankProtocolAt?: string
  creditApprovedAt?: string
  notes: Note[]
  followUps: FollowUp[]
  tasks: Task[]
  documentos?: unknown
  updatedAt: string
}

export interface ContractData {
  docName: string
  status: string
  signUrl: string | null
  signedAt: string | null
  sentAt: string
  originalUrl: string | null
  signedUrl: string | null
}
