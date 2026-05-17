import { type TokenSet, tokenSetFromOAuthResponse } from './tokens.js'
import type {
  ExchangeAuthorizationCodeParams,
  RefreshAccessTokenParams,
  TokenEndpointTransport,
} from './transport.js'

export {
  type EndIdentitySessionParams,
  type EndIdentitySessionResult,
  endIdentitySession,
  IDENTITY_SESSION_END_WARNING,
  keycloakBrowserLogoutUrl,
} from './session-end.js'
export {
  needsRefresh,
  REFRESH_LEEWAY_MS,
  type TokenSet,
  tokenSetFromOAuthResponse,
} from './tokens.js'

export {
  ApiNodeProxyTransport,
  type ApiNodeProxyTransportOptions,
  type ExchangeAuthorizationCodeParams,
  KeycloakDirectTransport,
  type KeycloakDirectTransportOptions,
  type OAuthTokenResponse,
  type RefreshAccessTokenParams,
  type SessionEndParams,
  type SessionEndTransport,
  type TokenEndpointTransport,
} from './transport.js'

export async function exchangeAuthorizationCode(
  transport: TokenEndpointTransport,
  params: ExchangeAuthorizationCodeParams,
): Promise<TokenSet> {
  const response = await transport.exchangeAuthorizationCode(params)
  return tokenSetFromOAuthResponse(response)
}

export async function refreshAccessToken(
  transport: TokenEndpointTransport,
  params: RefreshAccessTokenParams,
): Promise<TokenSet> {
  const response = await transport.refreshAccessToken(params)
  return tokenSetFromOAuthResponse({
    access_token: response.access_token,
    refresh_token: response.refresh_token ?? params.refreshToken,
    expires_in: response.expires_in,
  })
}
