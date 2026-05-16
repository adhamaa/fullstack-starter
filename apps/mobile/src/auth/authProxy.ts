import {
  ApiNodeProxyTransport,
  exchangeAuthorizationCode,
  refreshAccessToken,
} from '@fullstack/identity-session'
import { apiBaseUrl } from '../lib/api'

const transport = new ApiNodeProxyTransport({ apiBaseUrl })

export async function exchangeCodeViaApi(
  code: string,
  codeVerifier: string,
  redirectUri: string,
  clientId: string,
) {
  const tokenSet = await exchangeAuthorizationCode(transport, {
    code,
    codeVerifier,
    redirectUri,
    clientId,
  })
  return {
    access_token: tokenSet.accessToken,
    refresh_token: tokenSet.refreshToken ?? undefined,
    expires_in: Math.max(1, Math.round((tokenSet.accessTokenExpiresAt - Date.now()) / 1000)),
  }
}

export async function refreshTokenViaApi(refreshToken: string, clientId: string) {
  const tokenSet = await refreshAccessToken(transport, {
    refreshToken,
    clientId,
  })
  return {
    access_token: tokenSet.accessToken,
    refresh_token: tokenSet.refreshToken ?? undefined,
    expires_in: Math.max(1, Math.round((tokenSet.accessTokenExpiresAt - Date.now()) / 1000)),
  }
}
