import { currentUserFromKeycloakClaims, parseKeycloakAccessClaims } from '@radionic-homeopathy/types'
import { Router } from 'express'
import { requireAuth } from '../integrations/keycloak.js'

export const meRouter: Router = Router()

meRouter.get('/me', requireAuth, async (_request, response) => {
  try {
    const claims = parseKeycloakAccessClaims(response.locals.user)
    const user = currentUserFromKeycloakClaims(claims)
    response.json({ user })
  } catch (error) {
    const message = (error as Error).message
    const status = message === 'token missing sub claim' ? 400 : 500
    response.status(status).json({ error: message })
  }
})
