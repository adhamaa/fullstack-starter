'use client'

import type { Upload } from '@fullstack/types'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

export function UploadPanel({ initialUploads }: { initialUploads: Upload[] }) {
  const router = useRouter()
  const [uploads, setUploads] = useState<Upload[]>(initialUploads)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  async function onFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setBusy(true)
    setMessage(null)

    try {
      const presignResponse = await fetch('/dashboard/api/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type || 'application/octet-stream',
          sizeBytes: file.size,
        }),
      })
      if (!presignResponse.ok) {
        throw new Error(`presign failed: ${presignResponse.status}`)
      }
      const presign = (await presignResponse.json()) as {
        uploadId: string
        url: string
        headers: Record<string, string>
      }

      const putResponse = await fetch(presign.url, {
        method: 'PUT',
        headers: presign.headers,
        body: file,
      })
      if (!putResponse.ok) {
        throw new Error(`upload failed: ${putResponse.status}`)
      }

      const completeResponse = await fetch(
        `/dashboard/api/complete?id=${encodeURIComponent(presign.uploadId)}`,
        { method: 'POST' },
      )
      if (!completeResponse.ok) {
        throw new Error(`complete failed: ${completeResponse.status}`)
      }
      const completed = (await completeResponse.json()) as Upload

      setUploads((prev) => [completed, ...prev.filter((row) => row.id !== completed.id)])
      setMessage(`Uploaded ${file.name}`)
      startTransition(() => router.refresh())
    } catch (error) {
      setMessage((error as Error).message)
    } finally {
      setBusy(false)
    }
  }

  async function downloadOne(id: string) {
    const response = await fetch(`/dashboard/api/download?id=${encodeURIComponent(id)}`)
    if (!response.ok) {
      setMessage(`download URL failed: ${response.status}`)
      return
    }
    const { url } = (await response.json()) as { url: string }
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="mt-6 pt-6 border-t border-slate-700">
      <div className="flex items-center justify-between gap-4 mb-4">
        <h2 className="text-xl font-semibold">Uploads</h2>
        <label
          className={`inline-flex items-center gap-2 rounded-lg bg-accent text-accent-fg px-4 py-2.5 font-semibold text-sm cursor-pointer ${
            busy ? 'opacity-60 cursor-not-allowed' : ''
          }`}
        >
          {busy ? 'Uploading…' : 'Upload a file'}
          <input type="file" hidden disabled={busy} onChange={onFile} />
        </label>
      </div>

      {message && (
        <p className="inline-flex mt-2 mb-3 px-4 py-3 rounded-full bg-bg-muted text-[#bae6fd]">
          {message}
        </p>
      )}

      {uploads.length === 0 ? (
        <p className="text-ink-subtle text-sm">No uploads yet.</p>
      ) : (
        <ul className="list-none p-0 m-0 flex flex-col gap-2">
          {uploads.map((upload) => (
            <li
              key={upload.id}
              className="flex items-center justify-between gap-4 p-3 rounded-xl bg-bg-muted"
            >
              <div>
                <strong>{upload.filename}</strong>
                <span className="text-ink-subtle text-sm">
                  {' '}
                  · {upload.contentType} · {(upload.sizeBytes / 1024).toFixed(1)} KB ·{' '}
                  {upload.status}
                </span>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-transparent text-ink-muted px-3 py-1.5 font-semibold text-xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={() => downloadOne(upload.id)}
                disabled={upload.status !== 'ready'}
              >
                Download
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
