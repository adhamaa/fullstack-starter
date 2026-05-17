import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: [
    '@fullstack/types',
    '@fullstack/api-client',
    '@fullstack/config',
    '@fullstack/identity-session',
  ],
}

export default nextConfig
