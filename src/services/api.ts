const DIRECT = import.meta.env.VITE_API_URL || 'https://agrocredit-api-txbj.onrender.com'

/**
 * Dois caminhos até o backend, tentados em sequência:
 *   ''      → mesma origem (proxy /api do próprio site) — imune a extensões
 *             bloqueadoras; em dev, o proxy do Vite cumpre o mesmo papel.
 *   DIRECT  → URL direta do backend — funciona mesmo sem o proxy configurado.
 */
const BASES = ['', DIRECT]

function getToken() {
  return localStorage.getItem('producer_token')
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

/** Erro HTTP definitivo (credencial errada etc.) — não adianta tentar outro caminho. */
class ApiHttpError extends Error {}

/**
 * Acorda o backend (plano free do Render hiberna após inatividade).
 * Chamado no carregamento do app — assim, quando o produtor enviar o
 * formulário, o servidor já está de pé.
 */
export function warmUpApi() {
  fetch(`${DIRECT}/health`).catch(() => {})
  fetch('/api/health').catch(() => {})
}

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(opts.headers || {}),
  }

  for (let round = 0; round < 3; round++) {
    if (round > 0) await sleep(round * 3000)
    for (const base of BASES) {
      try {
        const res = await fetch(`${base}${path}`, { ...opts, headers })
        const ct = res.headers.get('content-type') || ''
        // HTML = proxy inexistente ou página de erro do host — tenta o próximo caminho
        if (!ct.includes('application/json')) continue
        const json = await res.json()
        if (!res.ok) throw new ApiHttpError(json.error || 'Erro na requisição')
        return json
      } catch (e) {
        if (e instanceof ApiHttpError) throw e
        // falha de rede (bloqueio, cold start, queda) — tenta o próximo caminho
      }
    }
  }

  throw new Error(
    'Não foi possível conectar ao servidor. Se você usa bloqueador de anúncios, ' +
    'antivírus com proteção web ou VPN, permita o site e tente novamente.'
  )
}

type AuthResponse = { token: string; producer: { nome: string; email: string; municipio: string; uf: string } }

export const api = {
  auth: (cpfCnpj: string, password: string) =>
    request<AuthResponse>('/api/producer/auth', {
      method: 'POST',
      body: JSON.stringify({ cpfCnpj, password }),
    }),

  firstAccess: (cpfCnpj: string, whatsapp: string, newPassword: string) =>
    request<AuthResponse>('/api/producer/first-access', {
      method: 'POST',
      body: JSON.stringify({ cpfCnpj, whatsapp, newPassword }),
    }),

  changePassword: (currentPassword: string, newPassword: string) =>
    request('/api/producer/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  me: () => request<{ data: ProducerData }>('/api/producer/me'),

  contract: () => request<{ data: ContractData | null }>('/api/producer/contract'),

  confirmDocuments: (message: string) =>
    request('/api/producer/documents/confirm', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),

  chat: (messages: ChatMessage[]) =>
    request<{ reply: string; fallback: boolean }>('/api/producer/chat', {
      method: 'POST',
      body: JSON.stringify({ messages }),
    }),
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
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
