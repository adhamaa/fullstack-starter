'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { PageShell } from '../../components/site-nav'
import { ratesApi, type RadionicRate, type RateBank } from '../../lib/services'

export default function RatesSearchPage() {
  const [banks, setBanks] = useState<RateBank[]>([])
  const [rates, setRates] = useState<RadionicRate[]>([])
  const [bank, setBank] = useState('')
  const [value, setValue] = useState('')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    ratesApi.getBanks().then(setBanks).catch(() => {})
  }, [])

  async function runSearch(event?: React.FormEvent) {
    event?.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const result = await ratesApi.search({
        bank: bank || undefined,
        value: value || undefined,
        q: query || undefined,
      })
      setRates(result.rates)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runSearch()
  }, [])

  return (
    <PageShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Radionic Rate Search</h1>
          <p className="text-ink-muted">Filter by rate bank, value, or linked remedy/formula name</p>
        </div>

        <form onSubmit={runSearch} className="grid gap-3 md:grid-cols-4">
          <select
            value={bank}
            onChange={(event) => setBank(event.target.value)}
            className="rounded-lg border border-slate-700 bg-bg-muted px-3 py-2"
          >
            <option value="">All banks</option>
            {banks.map((item) => (
              <option key={item.id} value={item.name}>{item.name}</option>
            ))}
          </select>
          <input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="Rate value e.g. SC/3"
            className="rounded-lg border border-slate-700 bg-bg-muted px-3 py-2"
          />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search notes or entity name"
            className="rounded-lg border border-slate-700 bg-bg-muted px-3 py-2 md:col-span-2"
          />
          <button type="submit" className="rounded-lg bg-accent px-4 py-2 font-semibold text-accent-fg md:col-span-4 md:w-fit">
            Search rates
          </button>
        </form>

        {loading && <p className="text-ink-muted">Searching...</p>}
        {error && <p className="text-red-400">{error}</p>}

        <div className="space-y-3">
          {rates.map((rate) => (
            <div key={rate.id} className="rounded-2xl border border-slate-700 bg-bg-elevated p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-mono text-xl text-accent">{rate.value}</p>
                <span className="text-sm text-ink-muted">{rate.bank_name}</span>
              </div>
              <p className="mt-2 text-sm">
                Linked to{' '}
                {rate.rateable_type === 'remedy' ? (
                  <Link href={`/remedies/${rate.rateable_id}`} className="text-accent">
                    {rate.entity_name ?? 'Remedy'}
                  </Link>
                ) : (
                  <Link href={`/formulas/${rate.rateable_id}`} className="text-accent">
                    {rate.entity_name ?? 'Formula'}
                  </Link>
                )}
                {' '}({rate.rateable_type})
              </p>
              {rate.category && <p className="text-sm text-ink-muted">Category: {rate.category}</p>}
              {rate.notes && <p className="text-sm">{rate.notes}</p>}
            </div>
          ))}
          {!loading && rates.length === 0 && <p className="text-ink-muted">No rates found</p>}
        </div>
      </div>
    </PageShell>
  )
}
