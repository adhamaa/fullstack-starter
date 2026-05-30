import type { Upload } from '@radionic-homeopathy/types'
import type { ApiClient } from './index'

export type UploadFileInput = {
  file: Blob
  filename: string
  contentType: string
}

export type UploadPutFn = (
  url: string,
  headers: Record<string, string>,
  body: Blob,
) => Promise<void>

export type UploadFileOptions = {
  put: UploadPutFn
}

export async function uploadFile(
  client: Pick<ApiClient, 'presignUpload' | 'completeUpload'>,
  input: UploadFileInput,
  options: UploadFileOptions,
): Promise<Upload> {
  const presign = await client.presignUpload({
    filename: input.filename,
    contentType: input.contentType,
    sizeBytes: input.file.size,
  })

  await options.put(presign.url, presign.headers, input.file)

  return client.completeUpload(presign.uploadId)
}
