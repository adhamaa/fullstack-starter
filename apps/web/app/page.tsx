import Link from 'next/link'
import { auth, signIn, signOut } from '../auth'
import { apiClient } from '../lib/api'

export default async function HomePage() {
  const session = await auth()
  let apiStatus = 'not checked'

  try {
    const health = await apiClient(session?.accessToken).health()
    apiStatus = `${health.service}: ${health.status}`
  } catch {
    apiStatus = 'Node API is not reachable yet'
  }

  return (
    <main className="grid min-h-screen place-items-center p-8">
      <section className="max-w-2xl w-full rounded-3xl border border-slate-700 bg-bg-elevated p-8 shadow-[0_20px_80px_rgb(0_0_0/0.35)]">
        <p className="font-bold uppercase tracking-widest text-accent">
          Universal fullstack starter
        </p>
        <h1 className="mt-4 mb-4 font-extrabold">Next.js + Expo + Node + Flask</h1>
        <p className="text-ink-muted">
          Local infra is ready for PostgreSQL, Redis, MinIO/S3, Keycloak, and Novu. Start Docker first,
          then run the apps you need.
        </p>
        <div className="inline-flex mt-6 px-4 py-3 rounded-full bg-bg-muted text-[#bae6fd]">
          Node API: {apiStatus}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {session?.user ? (
            <>
              <span className="px-3.5 py-2 rounded-full bg-bg-muted text-ink-muted text-sm">
                Signed in as {session.user.email ?? session.user.name ?? session.user.id}
              </span>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-bg-muted text-ink px-4 py-2.5 font-semibold text-sm no-underline"
              >
                Open dashboard
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
            </>
          ) : (
            <form
              action={async () => {
                'use server'
                await signIn('keycloak', { redirectTo: '/dashboard' })
              }}
            >
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-accent text-accent-fg px-4 py-2.5 font-semibold text-sm cursor-pointer"
              >
                Sign in with Keycloak
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  )
}
