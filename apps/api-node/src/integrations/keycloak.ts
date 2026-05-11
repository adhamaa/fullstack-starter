import type { NextFunction, Request, Response } from 'express'
import { createRemoteJWKSet, jwtVerify } from 'jose'
import { env } from '../env.js'

const jwks = createRemoteJWKSet(new URL(`${env.KEYCLOAK_ISSUER}/protocol/openid-connect/certs`))

function normalizeAud(aud: unknown): string[] {
  if (typeof aud === 'string') return [aud]
  if (Array.isArray(aud)) return aud.filter((v): v is string => typeof v === 'string')
  return []
}

export async function verifyAccessToken(token: string) {
  const configured = env.KEYCLOAK_AUDIENCE
    ? env.KEYCLOAK_AUDIENCE.split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : []

  // Keycloak access tokens often have:
  // - `aud: "account"` (or `aud: ["account"]`)
  // - and the actual client in `azp` (authorized party).
  // So we verify signature + issuer first, then enforce our own audience/azp allow-list.
  const verified = await jwtVerify(token, jwks, { issuer: env.KEYCLOAK_ISSUER })

  if (configured.length > 0) {
    const aud = normalizeAud(verified.payload.aud)
    const azp = typeof verified.payload.azp === 'string' ? verified.payload.azp : undefined

    const allowed = new Set([...configured, 'account'])
    const audOk = aud.some((a) => allowed.has(a))
    const azpOk = azp ? allowed.has(azp) : false

    if (!audOk && !azpOk) {
      throw new Error('invalid audience')
    }
  }

  return verified
}

export async function requireAuth(request: Request, response: Response, next: NextFunction) {
  const header = request.header('authorization')
  const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : undefined

  if (!token) {
    response.status(401).json({ error: 'missing bearer token' })
    return
  }

  try {
    const { payload } = await verifyAccessToken(token)
    response.locals.user = payload
    next()
  } catch (error) {
    response.status(401).json({ error: 'invalid bearer token', detail: (error as Error).message })
  }
}
