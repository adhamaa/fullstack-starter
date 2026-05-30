'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { PageShell } from '../../../components/site-nav'
import { type RadionicRate, type RemedyDetails, remediesApi } from '../../../lib/services'

export default function RemedyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const remedyId = params.id as string
  const [remedy, setRemedy] = useState<RemedyDetails | null>(null)
  const [rates, setRates] = useState<RadionicRate[]>([])
  const [tab, setTab] = useState<'symptoms' | 'modalities' | 'mental' | 'potencies' | 'rates'>(
    'symptoms',
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [details, rateRows] = await Promise.all([
          remediesApi.getDetails(remedyId),
          remediesApi.getRates(remedyId),
        ])
        if (!cancelled) {
          setRemedy(details)
          setRates(rateRows)
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load remedy')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [remedyId])

  if (loading) {
    return (
      <PageShell>
        <p className="text-ink-muted">Loading remedy...</p>
      </PageShell>
    )
  }

  if (error || !remedy) {
    return (
      <PageShell>
        <p className="text-red-400">{error ?? 'Remedy not found'}</p>
      </PageShell>
    )
  }

  const tabs = [
    { id: 'symptoms' as const, label: 'Symptoms' },
    { id: 'modalities' as const, label: 'Modalities' },
    { id: 'mental' as const, label: 'Mental' },
    { id: 'potencies' as const, label: 'Potencies' },
    { id: 'rates' as const, label: 'Rates' },
  ]

  return (
    <PageShell>
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border border-slate-700 px-3 py-2 text-sm"
          >
            Back
          </button>
          <div>
            <h1 className="text-3xl font-bold">{remedy.name}</h1>
            {remedy.common_name && <p className="text-lg text-ink-muted">{remedy.common_name}</p>}
          </div>
        </div>

        <section className="rounded-2xl border border-slate-700 bg-bg-elevated p-6">
          {remedy.abbreviation && (
            <p>
              <strong>Abbreviation:</strong> {remedy.abbreviation}
            </p>
          )}
          {remedy.source && (
            <p>
              <strong>Source:</strong> {remedy.source}
            </p>
          )}
          {remedy.description && <p className="mt-2 text-ink-muted">{remedy.description}</p>}
          {remedy.characteristics && (
            <p className="mt-2 text-ink-muted">
              <strong>Characteristics:</strong> {remedy.characteristics}
            </p>
          )}
        </section>

        <div className="flex flex-wrap gap-2">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                tab === item.id
                  ? 'bg-accent text-accent-fg'
                  : 'border border-slate-700 text-ink-muted'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <section className="rounded-2xl border border-slate-700 bg-bg-elevated p-6">
          {tab === 'symptoms' && (
            <div className="space-y-3">
              {remedy.symptoms?.length ? (
                remedy.symptoms.map((symptom) => (
                  <div key={symptom.id} className="border-l-4 border-accent pl-4">
                    <p>{symptom.description}</p>
                    {symptom.grade && (
                      <p className="text-sm text-ink-muted">Grade {symptom.grade}</p>
                    )}
                    {symptom.body_system_name && (
                      <p className="text-sm text-ink-muted">{symptom.body_system_name}</p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-ink-muted">No symptoms recorded</p>
              )}
            </div>
          )}

          {tab === 'modalities' && (
            <div className="space-y-4">
              {['Better from', 'Worse from'].map((type) => {
                const items = remedy.modalities?.filter((m) => m.type === type) ?? []
                if (!items.length) return null
                return (
                  <div key={type}>
                    <h3 className="font-semibold">{type}</h3>
                    <ul className="mt-2 list-disc pl-5">
                      {items.map((m) => (
                        <li key={m.id}>{m.description}</li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          )}

          {tab === 'mental' && (
            <div className="space-y-2">
              {remedy.mental_symptoms?.length ? (
                remedy.mental_symptoms.map((s) => (
                  <div key={s.id} className="rounded-lg bg-bg-muted p-3">
                    {s.description}
                  </div>
                ))
              ) : (
                <p className="text-ink-muted">No mental symptoms recorded</p>
              )}
            </div>
          )}

          {tab === 'potencies' && (
            <div className="grid gap-3 md:grid-cols-3">
              {remedy.potencies?.length ? (
                remedy.potencies.map((p) => (
                  <div
                    key={p.id}
                    className={`rounded-lg border p-3 ${p.recommended ? 'border-accent' : 'border-slate-700'}`}
                  >
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-sm text-ink-muted">{p.scale}</p>
                  </div>
                ))
              ) : (
                <p className="text-ink-muted">No potencies recorded</p>
              )}
            </div>
          )}

          {tab === 'rates' && (
            <div className="space-y-3">
              {rates.length ? (
                rates.map((rate) => (
                  <div key={rate.id} className="rounded-lg bg-bg-muted p-3">
                    <p className="font-mono text-accent">{rate.value}</p>
                    <p className="text-sm text-ink-muted">
                      {rate.bank_name} · {rate.category ?? 'Uncategorised'}
                    </p>
                    {rate.notes && <p className="text-sm">{rate.notes}</p>}
                  </div>
                ))
              ) : (
                <p className="text-ink-muted">No radionic rates linked to this remedy</p>
              )}
            </div>
          )}
        </section>

        <p className="text-sm text-ink-muted">
          See also{' '}
          <Link href="/rates" className="text-accent">
            Rate Search
          </Link>{' '}
          to browse all banks.
        </p>
      </div>
    </PageShell>
  )
}
