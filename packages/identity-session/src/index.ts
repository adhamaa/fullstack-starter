import type {
  ExchangeAuthorizationCodeParams,
  RefreshAccessTokenParams,
  TokenEndpointTransport,
} from './transport.js'
import { tokenSetFromOAuthResponse, type TokenSet } from './tokens.js'

export {
  REFRESH_LEEWAY_MS,
  needsRefresh,
  tokenSetFromOAuthResponse,
  type TokenSet,
} from './tokens.js'

export {
  ApiNodeProxyTransport,
  KeycloakDirectTransport,
  type ApiNodeProxyTransportOptions,
  type ExchangeAuthorizationCodeParams,
  type KeycloakDirectTransportOptions,
  type OAuthTokenResponse,
  type RefreshAccessTokenParams,
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
