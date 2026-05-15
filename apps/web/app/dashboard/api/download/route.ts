import { proxyAuthenticatedApi } from '../../../../lib/proxy-authenticated-api'

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get('id')
  if (!id) {
    return Response.json({ error: 'missing_id' }, { status: 400 })
  }

  return proxyAuthenticatedApi((api) => api.getDownloadUrl(id))
}
