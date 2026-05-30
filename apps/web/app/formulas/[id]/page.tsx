'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { PageShell } from '../../../components/site-nav'
import { formulasApi, type FormulaDetails, type RadionicRate } from '../../../lib/services'

export default function FormulaDetailPage() {
  const params = useParams()
  const router = useRouter()
  const formulaId = params.id as string
  const [formula, setFormula] = useState<FormulaDetails | null>(null)
  const [rates, setRates] = useState<RadionicRate[]>([])
  const [tab, setTab] = useState<'components' | 'rates'>('components')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([formulasApi.getOne(formulaId), formulasApi.getRates(formulaId)])
      .then(([details, rateRows]) => {
        setFormula(details)
        setRates(rateRows)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load formula'))
      .finally(() => setLoading(false))
  }, [formulaId])

  if (loading) {
    return (
      <PageShell>
        <p className="text-ink-muted">Loading formula...</p>
      </PageShell>
    )
  }

  if (error || !formula) {
    return (
      <PageShell>
        <p className="text-red-400">{error ?? 'Formula not found'}</p>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <button type="button" onClick={() => router.back()} className="rounded-lg border border-slate-700 px-3 py-2 text-sm">
            Back
          </button>
          <div>
            <h1 className="text-3xl font-bold">{formula.name}</h1>
            {formula.indication && <p className="text-lg text-ink-muted">{formula.indication}</p>}
          </div>
        </div>

        <section className="rounded-2xl border border-slate-700 bg-bg-elevated p-6">
          {formula.description && <p className="text-ink-muted">{formula.description}</p>}
          {formula.body_system && <p className="mt-2"><strong>Body system:</strong> {formula.body_system}</p>}
          {formula.category && <p><strong>Category:</strong> {formula.category}</p>}
        </section>

        <div className="flex gap-2">
          {(['components', 'rates'] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize ${
                tab === value ? 'bg-accent text-accent-fg' : 'border border-slate-700 text-ink-muted'
              }`}
            >
              {value}
            </button>
          ))}
        </div>

        <section className="rounded-2xl border border-slate-700 bg-bg-elevated p-6">
          {tab === 'components' && (
            <div className="space-y-3">
              {formula.remedies?.length ? formula.remedies.map((component) => (
                <div key={component.remedy_id} className="rounded-lg bg-bg-muted p-3">
                  <Link href={`/remedies/${component.remedy_id}`} className="font-semibold text-accent">
                    {component.remedy_name}
                  </Link>
                  {component.proportion && <p className="text-sm text-ink-muted">Proportion: {component.proportion}</p>}
                </div>
              )) : <p className="text-ink-muted">No component remedies listed</p>}
            </div>
          )}

          {tab === 'rates' && (
            <div className="space-y-3">
              {rates.length ? rates.map((rate) => (
                <div key={rate.id} className="rounded-lg bg-bg-muted p-3">
                  <p className="font-mono text-accent">{rate.value}</p>
                  <p className="text-sm text-ink-muted">{rate.bank_name} · {rate.category ?? 'Uncategorised'}</p>
                  {rate.source_page && <p className="text-sm">Source page: {rate.source_page}</p>}
                </div>
              )) : <p className="text-ink-muted">No radionic rates linked to this formula</p>}
            </div>
          )}
        </section>
      </div>
    </PageShell>
  )
}
