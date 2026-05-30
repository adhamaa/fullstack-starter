import { request } from './api'

export interface Remedy {
  id: string
  name: string
  common_name?: string | null
  abbreviation?: string | null
  source?: string | null
  description?: string | null
  characteristics?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface Symptom {
  id: string
  description: string
  location?: string | null
  grade?: number | null
  body_system_name?: string | null
  remedy_notes?: string | null
}

export interface Potency {
  id: string
  name: string
  scale: string
  dilution_factor?: number | null
  recommended?: boolean | null
  notes?: string | null
}

export interface Modality {
  id: string
  type: string
  description: string
  category?: string | null
}

export interface MentalSymptom {
  id: string
  description: string
  intensity?: string | null
}

export interface RemedyDetails extends Remedy {
  symptoms: Symptom[]
  modalities: Modality[]
  mental_symptoms: MentalSymptom[]
  potencies: Potency[]
}

export interface Formula {
  id: string
  name: string
  indication?: string | null
  description?: string | null
  body_system?: string | null
  category?: string | null
}

export interface FormulaDetails extends Formula {
  remedies: Array<{
    remedy_id: string
    remedy_name: string
    abbreviation?: string | null
    proportion?: string | null
    notes?: string | null
  }>
}

export interface RadionicRate {
  id: string
  bank_id: string
  bank_name?: string
  value: string
  rateable_type: 'remedy' | 'formula'
  rateable_id: string
  potency_variant?: string | null
  category?: string | null
  notes?: string | null
  source_page?: string | null
  entity_name?: string | null
}

export interface RateBank {
  id: string
  name: string
  description?: string | null
  source_ref?: string | null
}

export const remediesApi = {
  getAll: (params?: { limit?: number; offset?: number; source?: string }) => {
    const search = new URLSearchParams()
    if (params?.limit) search.set('limit', String(params.limit))
    if (params?.offset) search.set('offset', String(params.offset))
    if (params?.source) search.set('source', params.source)
    const qs = search.toString()
    return request<{ remedies: Remedy[]; total: number; limit: number; offset: number }>(
      `/remedies${qs ? `?${qs}` : ''}`,
    )
  },
  search: (query: string) =>
    request<{ remedies: Remedy[]; count: number }>('/remedies/search', {
      method: 'POST',
      body: JSON.stringify({ query, limit: 20, offset: 0 }),
    }),
  getDetails: (id: string) => request<RemedyDetails>(`/remedies/${id}/details`),
  getRates: (id: string) => request<RadionicRate[]>(`/remedies/${id}/rates`),
}

export const formulasApi = {
  getAll: (params?: { limit?: number; offset?: number }) => {
    const search = new URLSearchParams()
    if (params?.limit) search.set('limit', String(params.limit))
    if (params?.offset) search.set('offset', String(params.offset))
    const qs = search.toString()
    return request<{ formulas: Formula[]; total: number }>(`/formulas${qs ? `?${qs}` : ''}`)
  },
  getOne: (id: string) => request<FormulaDetails>(`/formulas/${id}`),
  getRates: (id: string) => request<RadionicRate[]>(`/formulas/${id}/rates`),
}

export const ratesApi = {
  search: (params: { bank?: string; value?: string; q?: string; rateable_type?: string }) => {
    const search = new URLSearchParams()
    if (params.bank) search.set('bank', params.bank)
    if (params.value) search.set('value', params.value)
    if (params.q) search.set('q', params.q)
    if (params.rateable_type) search.set('rateable_type', params.rateable_type)
    return request<{ rates: RadionicRate[]; count: number }>(`/rates/search?${search.toString()}`)
  },
  getBanks: () => request<RateBank[]>('/rates/banks'),
}

export const potenciesApi = {
  getAll: () => request<Potency[]>('/potencies'),
}
