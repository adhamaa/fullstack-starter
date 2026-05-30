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
  body_system_id?: string | null
  description: string
  location?: string | null
  modality?: string | null
  severity?: string | null
  grade?: number | null
  body_system_name?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface Potency {
  id: string
  name: string
  scale: string
  dilution_factor?: number | null
  description?: string | null
  recommended?: boolean | null
  notes?: string | null
  created_at?: string | null
}

export interface ClinicalCondition {
  id: string
  name: string
  description?: string | null
  category?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface Formula {
  id: string
  name: string
  indication?: string | null
  description?: string | null
  body_system?: string | null
  category?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface RateBank {
  id: string
  name: string
  description?: string | null
  source_ref?: string | null
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
}

export type RateableType = RadionicRate['rateable_type']
