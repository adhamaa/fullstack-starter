import type { Metadata } from 'next'
import './styles.css'

export const metadata: Metadata = {
  title: 'Fullstack Starter',
  description: 'Next.js, Expo, Flask, Node.js, PostgreSQL, Redis, S3, Novu, and Keycloak starter',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
