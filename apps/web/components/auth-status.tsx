import { auth, signIn, signOut } from '../auth'

/**
 * Server component that surfaces the current practitioner session.
 * Sign-in/out run through NextAuth server actions so no client JS is required.
 */
export async function AuthStatus() {
  const session = await auth()

  if (session?.user) {
    const displayName = session.user.name ?? session.user.email ?? 'Practitioner'
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-ink-muted">{displayName}</span>
        <form
          action={async () => {
            'use server'
            await signOut({ redirectTo: '/' })
          }}
        >
          <button
            type="submit"
            className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-semibold text-ink hover:bg-bg-muted"
          >
            Sign out
          </button>
        </form>
      </div>
    )
  }

  return (
    <form
      action={async () => {
        'use server'
        await signIn('keycloak', { redirectTo: '/practitioner' })
      }}
    >
      <button
        type="submit"
        className="rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-accent-fg hover:opacity-90"
      >
        Sign in
      </button>
    </form>
  )
}
