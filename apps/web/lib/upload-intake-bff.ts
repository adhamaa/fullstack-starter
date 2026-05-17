import type { ApiClient } from '@fullstack/api-client'
import {
  type PresignRequest,
  parsePresignResponse,
  parseUpload,
  presignRequestSchema,
} from '@fullstack/types'
import { NextResponse } from 'next/server'
import { auth } from '../auth'
import { apiClient } from './api'

type UploadIntakeHandler = (api: ApiClient) => Promise<unknown>

async function withUploadIntakeApi(handler: UploadIntakeHandler) {
  const session = await auth()
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  try {
    const result = await handler(apiClient(session.accessToken))
    return NextResponse.json(result)
  } catch (error) {
    const apiError = error as { status?: number; message?: string }
    const status = typeof apiError.status === 'number' ? apiError.status : 502
    return NextResponse.json({ error: apiError.message ?? 'upstream_error' }, { status })
  }
}

export function withUploadIntakeApiRoute(handler: UploadIntakeHandler) {
  return withUploadIntakeApi(handler)
}

export async function bffPresignUpload(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const parsed = presignRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid_body', issues: parsed.error.issues },
      { status: 400 },
    )
  }

  return withUploadIntakeApi((api) => api.presignUpload(parsed.data))
}

/** Client for browser upload flows: presign/complete via BFF; PUT stays client-side. */
export function createBffUploadClient(): Pick<ApiClient, 'presignUpload' | 'completeUpload'> {
  return {
    presignUpload: async (body: PresignRequest) => {
      const response = await fetch('/dashboard/api/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!response.ok) {
        throw new Error(`presign failed: ${response.status}`)
      }
      return parsePresignResponse(await response.json())
    },
    completeUpload: async (uploadId: string) => {
      const response = await fetch(`/dashboard/api/complete?id=${encodeURIComponent(uploadId)}`, {
        method: 'POST',
      })
      if (!response.ok) {
        throw new Error(`complete failed: ${response.status}`)
      }
      return parseUpload(await response.json())
    },
  }
}
