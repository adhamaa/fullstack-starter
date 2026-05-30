'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { PageShell } from '../../components/site-nav'
import { remediesApi, type Remedy } from '../../lib/services'

export default function RemediesPage() {
  const [remedies, setRemedies] = useState<Remedy[]>([])
  const [total, setTotal] = useState(0)
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        if (searchQuery) {
          const result = await remediesApi.search(searchQuery)
          if (!cancelled) {
            setRemedies(result.remedies)
            setTotal(result.count)
          }
        } else {
          const result = await remediesApi.getAll({ limit: 50, offset: 0 })
          if (!cancelled) {
            setRemedies(result.remedies)
            setTotal(result.total)
          }
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load remedies')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [searchQuery])

  return (
    <PageShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Homeopathic Remedies</h1>
          <p className="text-ink-muted">Browse and search classical single remedies</p>
        </div>

        <form
          className="flex flex-wrap gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            setSearchQuery(searchInput.trim())
          }}
        >
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search by name or description..."
            className="min-w-[16rem] flex-1 rounded-lg border border-slate-700 bg-bg-muted px-4 py-2 text-ink"
          />
          <button type="submit" className="rounded-lg bg-accent px-4 py-2 font-semibold text-accent-fg">
            Search
          </button>
          {searchQuery && (
            <button
              type="button"
              className="rounded-lg border border-slate-700 px-4 py-2 text-ink-muted"
              onClick={() => {
                setSearchInput('')
                setSearchQuery('')
              }}
            >
              Clear
            </button>
          )}
        </form>

        {loading && <p className="text-ink-muted">Loading remedies...</p>}
        {error && <p className="text-red-400">{error}</p>}

        {!loading && !error && (
          <>
            <p className="text-sm text-ink-muted">
              Showing {remedies.length} of {total} remedies
            </p>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {remedies.map((remedy) => (
                <Link
                  key={remedy.id}
                  href={`/remedies/${remedy.id}`}
                  className="rounded-2xl border border-slate-700 bg-bg-elevated p-5 no-underline transition hover:border-accent"
                >
                  <h2 className="text-xl font-bold text-ink">{remedy.name}</h2>
                  {remedy.common_name && <p className="text-ink-muted">{remedy.common_name}</p>}
                  {remedy.abbreviation && (
                    <p className="mt-2 text-sm font-medium text-accent">Abbr: {remedy.abbreviation}</p>
                  )}
                  {remedy.description && (
                    <p className="mt-2 line-clamp-3 text-sm text-ink-muted">{remedy.description}</p>
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
