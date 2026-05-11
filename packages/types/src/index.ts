export type HealthStatus = {
  service: string
  status: 'ok' | 'degraded'
  timestamp: string
  dependencies?: Record<string, 'ok' | 'missing' | 'error'>
}

export type CurrentUser = {
  id: string
  email?: string
  name?: string | null
  roles: string[]
}

export type UploadStatus = 'pending' | 'ready'

export type Upload = {
  id: string
  userId: string
  key: string
  filename: string
  contentType: string
  sizeBytes: number
  status: UploadStatus
  createdAt: string
  updatedAt: string
}

export type PresignResponse = {
  uploadId: string
  key: string
  url: string
  method: 'PUT'
  headers: Record<string, string>
  expiresAt: string
}

export type DownloadResponse = {
  uploadId: string
  url: string
  expiresAt: string
}

export type PresignRequest = {
  filename: string
  contentType: string
  sizeBytes: number
}
