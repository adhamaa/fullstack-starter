import { NextResponse } from 'next/server'
import { auth } from '../../../../auth'
import { apiClient } from '../../../../lib/api'

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const id = new URL(request.url).searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'missing_id' }, { status: 400 })
  }

  try {
    const result = await apiClient(session.accessToken).completeUpload(id)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 502 })
  }
}
