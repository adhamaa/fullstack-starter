import { redirect } from 'next/navigation'
import { auth } from '../../auth'
import { AuthStatus } from '../../components/auth-status'
import { PageShell } from '../../components/site-nav'

export default async function PractitionerPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/api/auth/signin?callbackUrl=/practitioner')
  }

  const displayName = session.user.name ?? session.user.email ?? 'Practitioner'

  return (
    <PageShell>
      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Practitioner Workspace</h1>
            <p className="text-ink-muted">Signed in as {displayName}</p>
          </div>
          <AuthStatus />
        </div>

        <div className="rounded-2xl border border-slate-700 bg-bg-elevated p-6">
          <p className="text-ink-muted">
            This area is protected by Keycloak. Authenticated practitioners can manage materia
            medica, formulas, and radionic rates here. Mutating API calls should forward the session
            access token as a <code>Bearer</code> token to the Node API.
          </p>
        </div>
      </section>
    </PageShell>
  )
}
