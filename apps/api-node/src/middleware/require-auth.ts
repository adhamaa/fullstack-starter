import type { NextFunction, Request, Response } from 'express'
import { verifyAccessToken } from '../integrations/keycloak.js'

/** Verified Keycloak access-token claims attached to the request. */
export type AuthContext = {
  sub?: string
  [claim: string]: unknown
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext
    }
  }
}

/**
 * Express guard for future write/edit routes. Validates a Keycloak-issued
 * `Authorization: Bearer <token>` against the realm JWKS + issuer (reusing
 * {@link verifyAccessToken}) and the configured audience allow-list. On success
 * it attaches the verified claims to `request.auth`; otherwise it responds 401.
 */
export async function requireAuth(request: Request, response: Response, next: NextFunction) {
  const header = request.header('authorization')
  const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : undefined

  if (!token) {
    response.status(401).json({ error: 'missing bearer token' })
    return
  }

  try {
    const { payload } = await verifyAccessToken(token)
    request.auth = {
      ...payload,
      sub: typeof payload.sub === 'string' ? payload.sub : undefined,
    }
    next()
  } catch (error) {
    response.status(401).json({ error: 'invalid bearer token', detail: (error as Error).message })
  }
}
