export const REFRESH_LEEWAY_MS = 30_000

export type TokenSet = {
  accessToken: string
  refreshToken: string | null
  accessTokenExpiresAt: number
}

export function needsRefresh(expiresAt: number, now = Date.now()): boolean {
  return now >= expiresAt - REFRESH_LEEWAY_MS
}

export function tokenSetFromOAuthResponse(response: {
  access_token: string
  refresh_token?: string | null
  expires_in?: number
}): TokenSet {
  return {
    accessToken: response.access_token,
    refreshToken: response.refresh_token ?? null,
    accessTokenExpiresAt: Date.now() + (response.expires_in ?? 60) * 1000,
  }
}
