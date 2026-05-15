import { proxyPresignUpload } from '../../../../lib/proxy-authenticated-api'

export async function POST(request: Request) {
  return proxyPresignUpload(request)
}
