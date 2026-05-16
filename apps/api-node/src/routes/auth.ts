import { Router } from 'express'
import { z } from 'zod'
import { env } from '../env.js'

const MOBILE_CLIENT_ID = 'fullstack-mobile'

const ALLOWED_REDIRECT_PREFIXES = [
  'http://localhost:8081',
  'http://127.0.0.1:8081',
  'fullstackstarter://',
  'exp://',
]

function isRedirectUriAllowed(redirectUri: string): boolean {
  try {
    const url = new URL(redirectUri)
    const normalized = `${url.protocol}//${url.host}${url.pathname}`.replace(/\/$/, '')
    return ALLOWED_REDIRECT_PREFIXES.some((prefix) => {
      if (prefix.includes('://') && !prefix.startsWith('http')) {
        return redirectUri.startsWith(prefix)
      }
      const base = prefix.replace(/\/$/, '')
      return normalized === base || normalized.startsWith(`${base}/`)
    })
  } catch {
    return ALLOWED_REDIRECT_PREFIXES.some((prefix) => redirectUri.startsWith(prefix))
  }
}

const tokenBodySchema = z.object({
  code: z.string().min(1),
  code_verifier: z.string().min(1),
  redirect_uri: z.string().min(1),
  client_id: z.string().default(MOBILE_CLIENT_ID),
})

const refreshBodySchema = z.object({
  refresh_token: z.string().min(1),
  client_id: z.string().default(MOBILE_CLIENT_ID),
})

async function postToKeycloakTokenEndpoint(body: URLSearchParams) {
  const tokenUrl = `${env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })
  const payload: unknown = await response.json().catch(() => ({}))
  return { response, payload }
}

export const authRouter = Router()

/** Browser-safe PKCE code exchange for Expo web (avoids Keycloak CORS on :8080). */
authRouter.post('/auth/token', async (request, response) => {
  const parsed = tokenBodySchema.safeParse(request.body)
  if (!parsed.success) {
    response.status(400).json({ error: 'invalid_request' })
    return
  }

  const { code, code_verifier, redirect_uri, client_id } = parsed.data
  if (client_id !== MOBILE_CLIENT_ID) {
    response.status(400).json({ error: 'invalid_client' })
    return
  }
  if (!isRedirectUriAllowed(redirect_uri)) {
    response.status(400).json({ error: 'invalid_redirect_uri' })
    return
  }

  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id,
    code,
    redirect_uri,
    code_verifier,
  })

  const { response: kcResponse, payload } = await postToKeycloakTokenEndpoint(params)
  if (!kcResponse.ok) {
    response.status(kcResponse.status).json(payload)
    return
  }

  const data = payload as Record<string, unknown>
  response.json({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_in: data.expires_in,
    token_type: data.token_type,
  })
})

authRouter.post('/auth/refresh', async (request, response) => {
  const parsed = refreshBodySchema.safeParse(request.body)
  if (!parsed.success) {
    response.status(400).json({ error: 'invalid_request' })
    return
  }

  const { refresh_token, client_id } = parsed.data
  if (client_id !== MOBILE_CLIENT_ID) {
    response.status(400).json({ error: 'invalid_client' })
    return
  }

  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id,
    refresh_token,
  })

  const { response: kcResponse, payload } = await postToKeycloakTokenEndpoint(params)
  if (!kcResponse.ok) {
    response.status(kcResponse.status).json(payload)
    return
  }

  const data = payload as Record<string, unknown>
  response.json({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_in: data.expires_in,
    token_type: data.token_type,
  })
})
