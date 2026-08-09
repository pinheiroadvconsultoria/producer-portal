const DIRECT = import.meta.env.VITE_API_URL || 'https://agrocredit-api-ix49.onrender.com'

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

  /** Autocadastro público — qualquer interessado cria sua conta */
  signup: (data: SignUpInput) =>
    request<AuthResponse>('/api/producer/signup', {
      method: 'POST',
      body: JSON.stringify(data),
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
    request<{ reply: string; fallback: boolean; escalated: boolean }>('/api/producer/chat', {
      method: 'POST',
      body: JSON.stringify({ messages }),
    }),
}

// ── Área administrativa (advogado NPL) ───────────────────────────────────────
// Autenticação por chave compartilhada (x-admin-key), não pelo token do produtor.
async function adminRequest<T>(adminKey: string, path: string, opts: RequestInit = {}): Promise<T> {
  return request<T>(path, {
    ...opts,
    headers: { 'x-admin-key': adminKey, ...(opts.headers || {}) },
  })
}

export const adminApi = {
  listLeads: (key: string) => adminRequest<{ data: AdminLeadSummary[] }>(key, '/api/admin/leads'),

  createLead: (key: string, lead: NewLeadInput) =>
    adminRequest<{ data: ProducerData }>(key, '/api/admin/leads', {
      method: 'POST',
      body: JSON.stringify(lead),
    }),

  getLead: (key: string, id: string) => adminRequest<{ data: ProducerData }>(key, `/api/admin/leads/${id}`),

  updateProcess: (key: string, id: string, patch: Partial<ProcessFields>) =>
    adminRequest(key, `/api/admin/leads/${id}/process`, { method: 'PATCH', body: JSON.stringify(patch) }),

  addMovement: (key: string, id: string, m: { data: string; titulo: string; descricao?: string }) =>
    adminRequest<{ data: ProcessMovement }>(key, `/api/admin/leads/${id}/movements`, {
      method: 'POST',
      body: JSON.stringify(m),
    }),

  deleteMovement: (key: string, movementId: string) =>
    adminRequest(key, `/api/admin/movements/${movementId}`, { method: 'DELETE' }),

  // ── Triagem do Eduardo ──────────────────────────────────────────────────────
  dashboard: (key: string) => adminRequest<{ data: AdminDashboard }>(key, '/api/admin/dashboard'),

  listAssessments: (key: string, status?: AssessmentStatus) =>
    adminRequest<{ data: Assessment[] }>(key, `/api/admin/assessments${status ? `?status=${status}` : ''}`),

  decideAssessment: (key: string, id: string, decision: 'aprovada' | 'recusada') =>
    adminRequest(key, `/api/admin/assessments/${id}/decide`, {
      method: 'POST',
      body: JSON.stringify({ decision }),
    }),

  listConsultations: (key: string, status?: ConsultationStatus) =>
    adminRequest<{ data: Consultation[] }>(key, `/api/admin/consultations${status ? `?status=${status}` : ''}`),

  updateConsultation: (key: string, id: string, patch: { scheduledAt?: string; status?: ConsultationStatus; observacao?: string }) =>
    adminRequest(key, `/api/admin/consultations/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),

  listDocPackages: (key: string, status?: DocPackageStatus) =>
    adminRequest<{ data: DocPackage[] }>(key, `/api/admin/document-packages${status ? `?status=${status}` : ''}`),

  updateDocPackage: (key: string, id: string, patch: { honorariosTipo?: string; honorariosTexto?: string; observacao?: string }) =>
    adminRequest(key, `/api/admin/document-packages/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),

  sendDocPackage: (key: string, id: string) =>
    adminRequest<{ signUrl: string | null }>(key, `/api/admin/document-packages/${id}/send`, { method: 'POST' }),

  /** URL do preview em PDF — abre em nova aba (inclui a chave para autenticar) */
  docPackagePreviewUrl: (id: string) => `/api/admin/document-packages/${id}/preview`,
}

// ── Tipos da triagem ─────────────────────────────────────────────────────────

export type PracticeArea = 'agronegocio' | 'trabalhista' | 'outro'
export type CaseViability = 'promissora' | 'requer_analise' | 'inviavel'
export type InterestLevel = 'alto' | 'medio' | 'baixo'
export type AssessmentStatus = 'aguardando_advogado' | 'aprovada' | 'recusada'
export type ConsultationStatus = 'solicitada' | 'confirmada' | 'realizada' | 'cancelada'
export type DocPackageStatus = 'rascunho' | 'aprovado' | 'enviado' | 'assinado' | 'cancelado'
export type DocKind = 'procuracao' | 'hipossuficiencia' | 'honorarios'

export interface LeadResumo {
  id: string
  nome: string
  whatsapp: string
  cpfCnpj?: string | null
  municipio?: string
  uf?: string
  email?: string
}

export interface Assessment {
  id: string
  area: PracticeArea
  viability: CaseViability
  interest: InterestLevel
  status: AssessmentStatus
  resumo: string
  fundamentos?: string | null
  pendencias?: string | null
  createdAt: string
  lead: LeadResumo
  consultations?: Consultation[]
  documents?: DocPackage[]
}

export interface Consultation {
  id: string
  area: PracticeArea
  preferencia: string
  scheduledAt?: string | null
  status: ConsultationStatus
  observacao?: string | null
  createdAt: string
  lead?: LeadResumo
}

export interface DocPackage {
  id: string
  area: PracticeArea
  kinds: DocKind[]
  status: DocPackageStatus
  honorariosTipo?: string | null
  honorariosTexto?: string | null
  observacao?: string | null
  signUrl?: string | null
  sentAt?: string | null
  signedAt?: string | null
  createdAt: string
  lead?: LeadResumo
}

export interface AdminDashboard {
  triagensPendentes: number
  consultasSolicitadas: number
  docsRascunho: number
  docsEnviados: number
  leadsTotal: number
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

export type CaseType =
  | 'alongamento_divida_rural'
  | 'revisional_contrato_bancario'
  | 'execucao_judicial'
  | 'outro'

export interface ProcessMovement {
  id: string
  data: string
  titulo: string
  descricao?: string | null
  createdAt: string
}

export interface ProcessFields {
  temProcessoJudicial: boolean
  tipoAcao: CaseType | null
  numeroProcesso: string | null
  vara: string | null
  comarca: string | null
  faseProcessual: string | null
}

export interface SignUpInput {
  nome: string
  cpfCnpj: string
  whatsapp: string
  password: string
  email?: string
  municipio?: string
  uf?: string
}

export interface NewLeadInput {
  nome: string
  cpfCnpj: string
  whatsapp: string
  email?: string
  municipio?: string
  uf?: string
  linhaCredito?: string
  valorCredito?: number
}

export interface AdminLeadSummary {
  id: string
  nome: string
  whatsapp: string
  cpfCnpj?: string
  municipio: string
  uf: string
  crmStage: CrmStage
  temProcessoJudicial: boolean
  tipoAcao: CaseType | null
  numeroProcesso: string | null
  faseProcessual: string | null
  createdAt: string
}

export interface ProducerData extends Partial<ProcessFields> {
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
  movements?: ProcessMovement[]
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
