import type { CurrentUser, Upload } from '@radionic-homeopathy/types'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth, signOut } from '../../auth'
import { apiBaseUrl, apiClient } from '../../lib/api'
import { UploadPanel } from './upload-panel'

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user || !session.accessToken) {
    redirect('/')
  }

  const api = apiClient(session.accessToken)

  let me: CurrentUser | undefined
  let uploads: Upload[] = []
  let loadError: string | null = null

  try {
    me = (await api.me()).user
    uploads = (await api.listUploads()).uploads
  } catch (error) {
    loadError = (error as Error).message
  }

  return (
    <main className="grid min-h-screen place-items-center p-8">
      <section className="max-w-2xl w-full rounded-3xl border border-slate-700 bg-bg-elevated p-8 shadow-[0_20px_80px_rgb(0_0_0/0.35)]">
        <p className="font-bold uppercase tracking-widest text-accent">Dashboard</p>
        <h1 className="mt-4 mb-4 font-extrabold">Welcome{me?.name ? `, ${me.name}` : ''}</h1>
        <p className="text-ink-muted">
          You are signed in via Keycloak. The Node API is at <code>{apiBaseUrl}</code>.
        </p>

        {session.error === 'RefreshAccessTokenError' && (
          <p className="inline-flex mt-6 px-4 py-3 rounded-full bg-warn-bg text-warn-fg">
            Your session expired. Please sign in again.
          </p>
        )}

        {loadError && (
          <p className="inline-flex mt-6 px-4 py-3 rounded-full bg-warn-bg text-warn-fg">
            Failed to load data: {loadError}
          </p>
        )}

        {me && (
          <div className="my-5 grid gap-3 grid-cols-[repeat(auto-fit,minmax(180px,1fr))]">
            <div className="flex flex-col gap-1 rounded-xl bg-bg-muted p-3">
              <strong className="text-[0.7rem] uppercase tracking-wider text-ink-subtle">
                User ID
              </strong>
              <code>{me.id}</code>
            </div>
            <div className="flex flex-col gap-1 rounded-xl bg-bg-muted p-3">
              <strong className="text-[0.7rem] uppercase tracking-wider text-ink-subtle">
                Email
              </strong>
              <code>{me.email ?? '—'}</code>
            </div>
            <div className="flex flex-col gap-1 rounded-xl bg-bg-muted p-3">
              <strong className="text-[0.7rem] uppercase tracking-wider text-ink-subtle">
                Roles
              </strong>
              <code>{me.roles.join(', ') || '—'}</code>
            </div>
          </div>
        )}

        <UploadPanel initialUploads={uploads} />

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-transparent text-ink-muted px-4 py-2.5 font-semibold text-sm no-underline"
          >
            Home
          </Link>
          <form
            action={async () => {
              'use server'
              await signOut({ redirectTo: '/' })
            }}
          >
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-transparent text-ink-muted px-4 py-2.5 font-semibold text-sm cursor-pointer"
            >
              Sign out
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}
