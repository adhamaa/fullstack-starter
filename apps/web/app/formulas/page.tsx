'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { PageShell } from '../../components/site-nav'
import { type Formula, formulasApi } from '../../lib/services'

export default function FormulasPage() {
  const [formulas, setFormulas] = useState<Formula[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    formulasApi
      .getAll({ limit: 50 })
      .then((result) => {
        setFormulas(result.formulas)
        setTotal(result.total)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load formulas'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <PageShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Radionic Formulas</h1>
          <p className="text-ink-muted">
            Copen-style composite remedies with linked radionic rates
          </p>
        </div>

        {loading && <p className="text-ink-muted">Loading formulas...</p>}
        {error && <p className="text-red-400">{error}</p>}

        {!loading && !error && (
          <>
            <p className="text-sm text-ink-muted">
              Showing {formulas.length} of {total} formulas
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {formulas.map((formula) => (
                <Link
                  key={formula.id}
                  href={`/formulas/${formula.id}`}
                  className="rounded-2xl border border-slate-700 bg-bg-elevated p-5 no-underline hover:border-accent"
                >
                  <h2 className="text-xl font-bold text-ink">{formula.name}</h2>
                  {formula.indication && (
                    <p className="mt-2 text-ink-muted">{formula.indication}</p>
                  )}
                  {formula.body_system && (
                    <p className="mt-2 text-sm text-accent">{formula.body_system}</p>
                  )}
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </PageShell>
  )
}
