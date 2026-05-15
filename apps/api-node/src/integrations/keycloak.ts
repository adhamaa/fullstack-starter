import type { NextFunction, Request, Response } from 'express'
import { createRemoteJWKSet, jwtVerify } from 'jose'
import { env } from '../env.js'
import { isAudienceAllowed } from './audience.js'

const jwks = createRemoteJWKSet(new URL(`${env.KEYCLOAK_ISSUER}/protocol/openid-connect/certs`))

function configuredAudiences(): string[] {
  return env.KEYCLOAK_AUDIENCE
    ? env.KEYCLOAK_AUDIENCE.split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : []
}

export async function verifyAccessToken(token: string) {
  const configured = configuredAudiences()
  const verified = await jwtVerify(token, jwks, { issuer: env.KEYCLOAK_ISSUER })

  const azp = typeof verified.payload.azp === 'string' ? verified.payload.azp : undefined
  if (!isAudienceAllowed(verified.payload.aud, azp, configured)) {
    throw new Error('invalid audience')
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
