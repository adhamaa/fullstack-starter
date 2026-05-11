import type { NextFunction, Request, Response } from 'express'
import { createRemoteJWKSet, jwtVerify } from 'jose'
import { env } from '../env.js'

const jwks = createRemoteJWKSet(new URL(`${env.KEYCLOAK_ISSUER}/protocol/openid-connect/certs`))

export async function verifyAccessToken(token: string) {
  const audience = env.KEYCLOAK_AUDIENCE ? [env.KEYCLOAK_AUDIENCE, 'account'] : undefined
  return jwtVerify(token, jwks, {
    issuer: env.KEYCLOAK_ISSUER,
    ...(audience ? { audience } : {}),
  })
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
  } catch {
    response.status(401).json({ error: 'invalid bearer token' })
  }
}
