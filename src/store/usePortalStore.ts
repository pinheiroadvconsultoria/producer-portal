import { create } from 'zustand'
import type { ProducerData, ContractData } from '../services/api'

interface PortalState {
  token: string | null
  producerName: string | null
  data: ProducerData | null
  contract: ContractData | null
  loading: boolean
  error: string | null
  /** Mostrada uma vez na tela de login após um 401 derrubar a sessão sozinho (token expirado/bloqueio). */
  sessionExpiredMessage: string | null

  setAuth: (token: string, name: string) => void
  setData: (data: ProducerData) => void
  setContract: (contract: ContractData | null) => void
  setLoading: (v: boolean) => void
  setError: (e: string | null) => void
  setSessionExpired: (msg: string | null) => void
  logout: () => void
}

export const usePortalStore = create<PortalState>((set) => ({
  token:        localStorage.getItem('producer_token'),
  producerName: localStorage.getItem('producer_name'),
  data:         null,
  contract:     null,
  loading:      false,
  error:        null,
  sessionExpiredMessage: null,

  setAuth: (token, name) => {
    localStorage.setItem('producer_token', token)
    localStorage.setItem('producer_name', name)
    set({ token, producerName: name, error: null })
  },

  setData:     (data)     => set({ data }),
  setContract: (contract) => set({ contract }),
  setLoading:  (loading)  => set({ loading }),
  setError:    (error)    => set({ error }),
  setSessionExpired: (sessionExpiredMessage) => set({ sessionExpiredMessage }),

  logout: () => {
    localStorage.removeItem('producer_token')
    localStorage.removeItem('producer_name')
    set({ token: null, producerName: null, data: null, contract: null })
  },
}))
