import Link from 'next/link'

const links = [
  { href: '/remedies', label: 'Remedies' },
  { href: '/formulas', label: 'Formulas' },
  { href: '/rates', label: 'Rate Search' },
]

export function SiteNav() {
  return (
    <header className="border-b border-slate-700 bg-bg-elevated">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="font-bold text-accent no-underline">
          Radionic Homeopathy
        </Link>
        <div className="flex flex-wrap gap-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-ink-muted no-underline hover:bg-bg-muted hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  )
}

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg">
      <SiteNav />
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  )
}
