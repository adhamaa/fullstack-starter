import { bffPresignUpload } from '../../../../lib/upload-intake-bff'

export async function POST(request: Request) {
  return bffPresignUpload(request)
}
