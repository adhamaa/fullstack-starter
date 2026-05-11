import type {
  CurrentUser,
  DownloadResponse,
  HealthStatus,
  PresignRequest,
  PresignResponse,
  Upload,
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

  const request = async <T>(
    path: string,
    init: RequestInit & { json?: unknown } = {},
  ): Promise<T> => {
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

    if (response.status === 204) return undefined as T
    return (await response.json()) as T
  }

  return {
    health: () => request<HealthStatus>('/health'),
    flaskHealth: () => request<HealthStatus>('/health/flask'),
    me: () => request<{ user: CurrentUser }>('/me'),
    listUploads: () => request<{ uploads: Upload[] }>('/uploads'),
    presignUpload: (body: PresignRequest) =>
      request<PresignResponse>('/uploads/presign', {
        method: 'POST',
        json: body,
      }),
    completeUpload: (uploadId: string) =>
      request<Upload>(`/uploads/${uploadId}/complete`, { method: 'POST', json: {} }),
    getDownloadUrl: (uploadId: string) =>
      request<DownloadResponse>(`/uploads/${uploadId}/download`),
  }
}

export type ApiClient = ReturnType<typeof createApiClient>
