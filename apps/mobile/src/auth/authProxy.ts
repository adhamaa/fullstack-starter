import { apiBaseUrl } from '../lib/api'

type TokenResponse = {
  access_token: string
  refresh_token?: string
  expires_in?: number
}

async function postAuthJson<T>(path: string, body: Record<string, string>): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const payload: unknown = await response.json().catch(() => ({}))
  if (!response.ok) {
    const detail =
      typeof payload === 'object' &&
      payload !== null &&
      'error_description' in payload &&
      typeof (payload as { error_description: unknown }).error_description === 'string'
        ? (payload as { error_description: string }).error_description
        : typeof payload === 'object' &&
            payload !== null &&
            'error' in payload &&
            typeof (payload as { error: unknown }).error === 'string'
          ? (payload as { error: string }).error
          : response.statusText
    throw new Error(detail || 'token request failed')
  }
  return payload as T
}

export async function exchangeCodeViaApi(
  code: string,
  codeVerifier: string,
  redirectUri: string,
  clientId: string,
): Promise<TokenResponse> {
  return postAuthJson<TokenResponse>('/auth/token', {
    code,
    code_verifier: codeVerifier,
    redirect_uri: redirectUri,
    client_id: clientId,
  })
}

export async function refreshTokenViaApi(
  refreshToken: string,
  clientId: string,
): Promise<TokenResponse> {
  return postAuthJson<TokenResponse>('/auth/refresh', {
    refresh_token: refreshToken,
    client_id: clientId,
  })
}
