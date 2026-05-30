import Link from 'next/link'
import { PageShell } from '../components/site-nav'
import { apiBaseUrl } from '../lib/api'

async function getHealth() {
  try {
    const response = await fetch(`${apiBaseUrl}/health`, { cache: 'no-store' })
    if (!response.ok) return 'unreachable'
    const body = await response.json()
    return `${body.service}: ${body.status}`
  } catch {
    return 'Node API is not reachable yet'
  }
}

export default async function HomePage() {
  const apiStatus = await getHealth()

  return (
    <PageShell>
      <section className="rounded-3xl border border-slate-700 bg-bg-elevated p-8">
        <p className="font-bold uppercase tracking-widest text-accent">Radionic Homeopathy</p>
        <h1 className="mt-4 mb-4 font-extrabold">Materia Medica & Radionic Rates</h1>
        <p className="text-ink-muted">
          Reference library for classical homeopathic remedies, Copen-style formulas, and radionic
          broadcast rates. Start Docker infra, run migrations and seed, then browse remedies and rates.
        </p>
        <div className="mt-6 inline-flex rounded-full bg-bg-muted px-4 py-3 text-[#bae6fd]">
          Node API: {apiStatus}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/remedies" className="rounded-lg bg-accent px-4 py-2.5 font-semibold text-accent-fg no-underline">
            Browse Remedies
          </Link>
          <Link href="/formulas" className="rounded-lg border border-slate-700 px-4 py-2.5 font-semibold text-ink no-underline">
            Browse Formulas
          </Link>
          <Link href="/rates" className="rounded-lg border border-slate-700 px-4 py-2.5 font-semibold text-ink no-underline">
            Search Rates
          </Link>
        </div>
      </section>
    </PageShell>
  )
}
