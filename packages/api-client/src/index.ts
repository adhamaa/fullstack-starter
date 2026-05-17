import {
  parseDownloadResponse,
  parseMeResponse,
  parsePresignResponse,
  parseUpload,
  parseUploadsListResponse,
  type CurrentUser,
  type DownloadResponse,
  type HealthStatus,
  type PresignRequest,
  type PresignResponse,
  type Upload,
} from '@fullstack/types'

export type TokenProvider = () => string | null | undefined | Promise<string | null | undefined>

export type ApiClientOptions = {
  baseUrl: string
  /**
   * Static bearer token. Use `getToken` instead when a refresh flow is involved
   * so each request can pull the latest access token.
   */
  accessToken?: string
  getToken?: TokenProvider
}

export type ApiError = Error & { status: number; body?: unknown }

function makeError(status: number, statusText: string, body?: unknown): ApiError {
  const error = new Error(`API request failed: ${status} ${statusText}`) as ApiError
  error.status = status
  error.body = body
  return error
}

export function createApiClient({ baseUrl, accessToken, getToken }: ApiClientOptions) {
  const resolveToken = async (): Promise<string | null | undefined> => {
    if (getToken) return getToken()
    return accessToken
  }

  const request = async (
    path: string,
    init: RequestInit & { json?: unknown } = {},
  ): Promise<unknown> => {
    const token = await resolveToken()
    const headers = new Headers(init.headers)
    if (token) headers.set('Authorization', `Bearer ${token}`)
    if (init.json !== undefined) {
      headers.set('Content-Type', 'application/json')
    }

    const response = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers,
      body: init.json !== undefined ? JSON.stringify(init.json) : init.body,
    })

    if (!response.ok) {
      let body: unknown
      try {
        body = await response.json()
      } catch {
        // ignore
      }
      throw makeError(response.status, response.statusText, body)
    }

    if (response.status === 204) return undefined
    return response.json()
  }

  return {
    health: () => request('/health') as Promise<HealthStatus>,
    flaskHealth: () => request('/health/flask') as Promise<HealthStatus>,
    me: async () => parseMeResponse(await request('/me')),
    listUploads: async () => parseUploadsListResponse(await request('/uploads')),
    presignUpload: async (body: PresignRequest) =>
      parsePresignResponse(
        await request('/uploads/presign', {
          method: 'POST',
          json: body,
        }),
      ),
    completeUpload: async (uploadId: string) =>
      parseUpload(
        await request(`/uploads/${uploadId}/complete`, { method: 'POST', json: {} }),
      ),
    getDownloadUrl: async (uploadId: string) =>
      parseDownloadResponse(await request(`/uploads/${uploadId}/download`)),
  }
}

export type ApiClient = ReturnType<typeof createApiClient>

export { uploadFile } from './upload-intake'
export type { UploadFileInput, UploadFileOptions, UploadPutFn } from './upload-intake'
