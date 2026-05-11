import { createApiClient } from '@fullstack/api-client'

const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

export function apiClient(token?: string | null) {
  return createApiClient({
    baseUrl,
    getToken: () => token ?? null,
  })
}

export const apiBaseUrl = baseUrl
