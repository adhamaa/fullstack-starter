import { createApiClient } from '@radionic-homeopathy/api-client'

export const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000'

export function makeApi(getToken: () => Promise<string | null>) {
  return createApiClient({ baseUrl: apiBaseUrl, getToken })
}
