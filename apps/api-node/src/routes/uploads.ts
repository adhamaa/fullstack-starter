import { Router } from 'express'
import { requireAuth } from '../integrations/keycloak.js'
import {
  completeUpload,
  getDownloadUrl,
  listUploads,
  presignRequestSchema,
  presignUpload,
} from '../upload-intake/index.js'

export const uploadsRouter: Router = Router()

uploadsRouter.use(requireAuth)

function userId(response: { locals: { user?: { sub?: string } } }) {
  const sub = response.locals.user?.sub
  if (!sub) throw new Error('requireAuth must populate response.locals.user')
  return sub
}

uploadsRouter.post('/uploads/presign', async (request, response) => {
  const parsed = presignRequestSchema.safeParse(request.body)
  if (!parsed.success) {
    response.status(400).json({ error: 'invalid body', issues: parsed.error.issues })
    return
  }

  const sub = userId(response)
  const claims = response.locals.user
  if (!claims) {
    response.status(401).json({ error: 'unauthorized' })
    return
  }

  try {
    const body = await presignUpload(sub, claims, parsed.data)
    response.json(body)
  } catch (error) {
    const message = (error as Error).message
    const status = message === 'token missing sub claim' ? 400 : 500
    response.status(status).json({ error: message })
  }
})

uploadsRouter.post('/uploads/:id/complete', async (request, response) => {
  const sub = userId(response)
  const result = await completeUpload(sub, request.params.id)

  if (result.kind === 'not_found') {
    response.status(404).json({ error: 'upload not found' })
    return
  }

  if (result.kind === 'object_missing') {
    response.status(409).json({ error: 'object not found in storage', upload: result.upload })
    return
  }

  response.json(result.upload)
})

uploadsRouter.get('/uploads', async (_request, response) => {
  const sub = userId(response)
  const rows = await listUploads(sub)
  response.json({ uploads: rows })
})

uploadsRouter.get('/uploads/:id/download', async (request, response) => {
  const sub = userId(response)
  const download = await getDownloadUrl(sub, request.params.id)

  if (!download) {
    response.status(404).json({ error: 'upload not found' })
    return
  }

  response.json(download)
})
