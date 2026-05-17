import type { SessionEndTransport } from './transport.js'

export const IDENTITY_SESSION_END_WARNING =
  'Signed out on this device. Remote session revoke may have failed.'

/** Browser navigation URL to end Keycloak SSO (Expo web after local clear). */
export function keycloakBrowserLogoutUrl(
  issuer: string,
  clientId: string,
  postLogoutRedirectUri: string,
): string {
  const params = new URLSearchParams({
    client_id: clientId,
    post_logout_redirect_uri: postLogoutRedirectUri,
  })
  return `${issuer.replace(/\/$/, '')}/protocol/openid-connect/logout?${params.toString()}`
}

export type EndIdentitySessionParams = {
  clientId: string
  refreshToken?: string | null
  /** Best-effort Keycloak logout (web confidential client, mobile Expo web). */
  endIdpSession?: boolean
}

export type EndIdentitySessionResult = {
  localCleared: true
  refreshRevoked: boolean
  idpSessionEnded: boolean
  warning?: string
}

export async function endIdentitySession(
  transport: SessionEndTransport,
  params: EndIdentitySessionParams,
): Promise<EndIdentitySessionResult> {
  let refreshRevoked = !params.refreshToken
  let idpSessionEnded = false
  let warning: string | undefined

  if (params.refreshToken) {
    try {
      await transport.revokeRefreshToken({
        refreshToken: params.refreshToken,
        clientId: params.clientId,
      })
      refreshRevoked = true
    } catch {
      warning = IDENTITY_SESSION_END_WARNING
    }
  }

  if (params.endIdpSession && params.refreshToken) {
    try {
      await transport.endIdpSession({
        refreshToken: params.refreshToken,
        clientId: params.clientId,
      })
      idpSessionEnded = true
    } catch {
      // Best-effort; local sign-out still proceeds.
    }
  }

  return {
    localCleared: true,
    refreshRevoked,
    idpSessionEnded,
    warning,
  }
}
