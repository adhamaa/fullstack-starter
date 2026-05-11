import { NextResponse } from 'next/server'
import { auth } from '../../../../auth'
import { apiClient } from '../../../../lib/api'

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const body = (await request.json()) as {
    filename?: string
    contentType?: string
    sizeBytes?: number
  }

  if (!body.filename || !body.contentType || typeof body.sizeBytes !== 'number') {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
  }

  try {
    const presign = await apiClient(session.accessToken).presignUpload({
      filename: body.filename,
      contentType: body.contentType,
      sizeBytes: body.sizeBytes,
    })
    return NextResponse.json(presign)
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 502 })
  }
}
