import { withUploadIntakeApiRoute } from '../../../../lib/upload-intake-bff'

export async function POST(request: Request) {
  const id = new URL(request.url).searchParams.get('id')
  if (!id) {
    return Response.json({ error: 'missing_id' }, { status: 400 })
  }

  return withUploadIntakeApiRoute((api) => api.completeUpload(id))
}
