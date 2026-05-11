import { sql } from 'drizzle-orm'
import { Router } from 'express'
import { db } from '../db/index.js'
import { users } from '../db/schema/index.js'
import { requireAuth } from '../integrations/keycloak.js'
import { identifySubscriber } from '../integrations/novu.js'

export const meRouter: Router = Router()

meRouter.get('/me', requireAuth, async (_request, response) => {
  const payload = response.locals.user as {
    sub?: string
    email?: string
    name?: string
    given_name?: string
    family_name?: string
    preferred_username?: string
    realm_access?: { roles?: string[] }
  }

  if (!payload.sub) {
    response.status(400).json({ error: 'token missing sub claim' })
    return
  }

  const fullName = [payload.given_name, payload.family_name].filter(Boolean).join(' ').trim()
  const displayName = payload.name ?? (fullName || payload.preferred_username || null)

  await db
    .insert(users)
    .values({
      id: payload.sub,
      email: payload.email ?? null,
      name: displayName,
    })
    .onDuplicateKeyUpdate({
      set: {
        email: sql`VALUES(email)`,
        name: sql`VALUES(name)`,
      },
    })

  void identifySubscriber(payload)

  response.json({
    user: {
      id: payload.sub,
      email: payload.email,
      name: displayName,
      roles: payload.realm_access?.roles ?? [],
    },
  })
})
