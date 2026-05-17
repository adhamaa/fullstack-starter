import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { StorybookConfig } from '@storybook/react-vite'

const packageDir = path.dirname(fileURLToPath(import.meta.url))
const srcDir = path.join(packageDir, '../src')
const require = createRequire(import.meta.url)
const reactDir = path.dirname(require.resolve('react/package.json'))
const reactDomDir = path.dirname(require.resolve('react-dom/package.json'))

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  staticDirs: ['../public'],
  async viteFinal(config) {
    config.resolve ??= {}
    config.resolve.dedupe = [...(config.resolve.dedupe ?? []), 'react', 'react-dom']
    config.resolve.alias = [
      ...(Array.isArray(config.resolve.alias) ? config.resolve.alias : []),
      { find: '@', replacement: srcDir },
      { find: 'react', replacement: reactDir },
      { find: 'react-dom', replacement: reactDomDir },
    ]
    return config
  },
}
export default config
