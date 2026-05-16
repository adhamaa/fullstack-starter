import { currentUserFromKeycloakClaims, parseKeycloakAccessClaims } from '@fullstack/types'
import { sql } from 'drizzle-orm'
import { Router } from 'express'
import { db } from '../db/index.js'
import { users } from '../db/schema/index.js'
import { requireAuth } from '../integrations/keycloak.js'
import { identifySubscriber } from '../integrations/novu.js'

export const meRouter: Router = Router()

meRouter.get('/me', requireAuth, async (_request, response) => {
  try {
    const claims = parseKeycloakAccessClaims(response.locals.user)
    const user = currentUserFromKeycloakClaims(claims)

    await db
      .insert(users)
      .values({
        id: user.id,
        email: user.email ?? null,
        name: user.name,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: sql`excluded.email`,
          name: sql`excluded.name`,
        },
      })

    void identifySubscriber(response.locals.user)

    response.json({ user })
  } catch (error) {
    const message = (error as Error).message
    const status = message === 'token missing sub claim' ? 400 : 500
    response.status(status).json({ error: message })
  }
})
