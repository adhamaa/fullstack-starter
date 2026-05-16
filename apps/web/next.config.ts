import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@fullstack/types', '@fullstack/api-client', '@fullstack/config'],
}

export default nextConfig
