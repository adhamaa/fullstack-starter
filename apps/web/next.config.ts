import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: [
    '@radionic-homeopathy/types',
    '@radionic-homeopathy/api-client',
    '@radionic-homeopathy/config',
    '@radionic-homeopathy/identity-session',
  ],
  webpack: (config) => {
    config.resolve.extensionAlias = {
      '.js': ['.ts', '.tsx', '.js'],
      '.mjs': ['.mts', '.mjs'],
      '.cjs': ['.cts', '.cjs'],
    }
    return config
  },
}

export default nextConfig
