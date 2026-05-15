import { type ApiClient } from '@fullstack/api-client'
import { presignRequestSchema } from '@fullstack/types'
import { NextResponse } from 'next/server'
import { auth } from '../auth'
import { apiClient } from './api'

type ProxyHandler = (api: ApiClient) => Promise<unknown>

async function withAuthenticatedApi(handler: ProxyHandler) {
  const session = await auth()
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  try {
    const result = await handler(apiClient(session.accessToken))
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 502 })
  }
}

export function proxyAuthenticatedApi(handler: ProxyHandler) {
  return withAuthenticatedApi(handler)
}

export async function proxyPresignUpload(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const parsed = presignRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_body', issues: parsed.error.issues }, { status: 400 })
  }

  return withAuthenticatedApi((api) => api.presignUpload(parsed.data))
}
