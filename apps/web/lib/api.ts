import { createApiClient } from '@radionic-homeopathy/api-client'

const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.error ?? `Request failed: ${response.status}`)
  }

  return response.json() as Promise<T>
}

export function apiClient(token?: string | null) {
  return createApiClient({
    baseUrl,
    getToken: () => token ?? null,
  })
}

export const apiBaseUrl = baseUrl
export { request }
