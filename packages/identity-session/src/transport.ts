export type OAuthTokenResponse = {
  access_token: string
  refresh_token?: string
  expires_in?: number
  token_type?: string
  error?: string
  error_description?: string
}

export type ExchangeAuthorizationCodeParams = {
  code: string
  codeVerifier: string
  redirectUri: string
  clientId: string
}

export type RefreshAccessTokenParams = {
  refreshToken: string
  clientId: string
}

export type SessionEndParams = {
  refreshToken: string
  clientId: string
}

export interface SessionEndTransport {
  revokeRefreshToken(params: SessionEndParams): Promise<void>
  endIdpSession(params: SessionEndParams): Promise<void>
}

export interface TokenEndpointTransport {
  exchangeAuthorizationCode(params: ExchangeAuthorizationCodeParams): Promise<OAuthTokenResponse>
  refreshAccessToken(params: RefreshAccessTokenParams): Promise<OAuthTokenResponse>
}

export type KeycloakDirectTransportOptions = {
  issuer: string
  clientSecret?: string
}

export class KeycloakDirectTransport implements TokenEndpointTransport, SessionEndTransport {
  constructor(private readonly options: KeycloakDirectTransportOptions) {}

  private issuerBase() {
    return this.options.issuer.replace(/\/$/, '')
  }

  private tokenUrl() {
    return `${this.issuerBase()}/protocol/openid-connect/token`
  }

  private revokeUrl() {
    return `${this.issuerBase()}/protocol/openid-connect/revoke`
  }

  private logoutUrl() {
    return `${this.issuerBase()}/protocol/openid-connect/logout`
  }

  async exchangeAuthorizationCode(params: ExchangeAuthorizationCodeParams) {
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: params.clientId,
      code: params.code,
      redirect_uri: params.redirectUri,
      code_verifier: params.codeVerifier,
    })
    if (this.options.clientSecret) {
      body.set('client_secret', this.options.clientSecret)
    }
    return postTokenEndpoint(this.tokenUrl(), body)
  }

  async refreshAccessToken(params: RefreshAccessTokenParams) {
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: params.clientId,
      refresh_token: params.refreshToken,
    })
    if (this.options.clientSecret) {
      body.set('client_secret', this.options.clientSecret)
    }
    return postTokenEndpoint(this.tokenUrl(), body)
  }

  async revokeRefreshToken(params: SessionEndParams) {
    const body = new URLSearchParams({
      client_id: params.clientId,
      token: params.refreshToken,
      token_type_hint: 'refresh_token',
    })
    if (this.options.clientSecret) {
      body.set('client_secret', this.options.clientSecret)
    }
    await postRevokeEndpoint(this.revokeUrl(), body)
  }

  async endIdpSession(params: SessionEndParams) {
    const body = new URLSearchParams({
      client_id: params.clientId,
      refresh_token: params.refreshToken,
    })
    if (this.options.clientSecret) {
      body.set('client_secret', this.options.clientSecret)
    }
    await postLogoutEndpoint(this.logoutUrl(), body)
  }
}

export type ApiNodeProxyTransportOptions = {
  apiBaseUrl: string
}

export class ApiNodeProxyTransport implements TokenEndpointTransport, SessionEndTransport {
  constructor(private readonly options: ApiNodeProxyTransportOptions) {}

  async exchangeAuthorizationCode(params: ExchangeAuthorizationCodeParams) {
    return postJson<OAuthTokenResponse>(`${this.options.apiBaseUrl}/auth/token`, {
      code: params.code,
      code_verifier: params.codeVerifier,
      redirect_uri: params.redirectUri,
      client_id: params.clientId,
    })
  }

  async refreshAccessToken(params: RefreshAccessTokenParams) {
    return postJson<OAuthTokenResponse>(`${this.options.apiBaseUrl}/auth/refresh`, {
      refresh_token: params.refreshToken,
      client_id: params.clientId,
    })
  }

  async revokeRefreshToken(params: SessionEndParams) {
    await postJson(`${this.options.apiBaseUrl}/auth/revoke`, {
      refresh_token: params.refreshToken,
      client_id: params.clientId,
    })
  }

  async endIdpSession(params: SessionEndParams) {
    await postJson(`${this.options.apiBaseUrl}/auth/logout`, {
      refresh_token: params.refreshToken,
      client_id: params.clientId,
    })
  }
}

async function postTokenEndpoint(url: string, body: URLSearchParams): Promise<OAuthTokenResponse> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
    cache: 'no-store',
  })
  const payload = (await response.json().catch(() => ({}))) as OAuthTokenResponse
  if (!response.ok || !payload.access_token) {
    throw new Error(payload.error_description ?? payload.error ?? 'token_request_failed')
  }
  return payload
}

async function postJson<T>(url: string, body: Record<string, string>): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (response.status === 204) {
    return undefined as T
  }

  const payload = (await response.json().catch(() => ({}))) as T & {
    error?: string
    error_description?: string
  }
  if (!response.ok) {
    throw new Error(payload.error_description ?? payload.error ?? 'token_request_failed')
  }
  return payload
}

async function postRevokeEndpoint(url: string, body: URLSearchParams): Promise<void> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
    cache: 'no-store',
  })
  if (!response.ok) {
    throw new Error('revoke_failed')
  }
}

async function postLogoutEndpoint(url: string, body: URLSearchParams): Promise<void> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
    cache: 'no-store',
  })
  if (!response.ok) {
    throw new Error('logout_failed')
  }
}
