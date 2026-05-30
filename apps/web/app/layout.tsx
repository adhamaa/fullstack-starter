import type { Metadata } from 'next'
import './styles.css'

export const metadata: Metadata = {
  title: 'Radionic Homeopathy',
  description: 'Homeopathic materia medica with radionic formulas and rate catalogues',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
