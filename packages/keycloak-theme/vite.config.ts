import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { keycloakify } from 'keycloakify/vite-plugin'
import { buildEmailTheme } from 'keycloakify-emails'
import { defineConfig } from 'vite'

const packageDir = path.dirname(fileURLToPath(import.meta.url))
const srcDir = path.join(packageDir, 'src')
const require = createRequire(import.meta.url)
const reactDir = path.dirname(require.resolve('react/package.json'))
const reactDomDir = path.dirname(require.resolve('react-dom/package.json'))

const themeNames = [
  'fullstack-web-default',
  'fullstack-web-ramadan',
  'fullstack-mobile-default',
  'fullstack-mobile-ramadan',
] as const

const shadcnEnvironmentVariables = [
  { name: 'SHADCN_THEME_LOGO_WHITE_URL', default: '' },
  { name: 'SHADCN_THEME_LOGO_DARK_URL', default: '' },
  { name: 'SHADCN_THEME_APP_NAME', default: 'Fullstack Starter' },
  { name: 'SHADCN_THEME_LAYOUT', default: 'two-column' },
  { name: 'SHADCN_THEME_SIDE_IMAGE_URL', default: '' },
  { name: 'SHADCN_THEME_PRESET', default: 'neutral' },
  { name: 'SHADCN_THEME_BASE', default: 'neutral' },
  { name: 'SHADCN_THEME_RADIUS', default: 'default' },
  { name: 'SHADCN_THEME_FONT', default: 'geist' },
  { name: 'SHADCN_THEME_PLACEHOLDER', default: 'true' },
] as const

const emailLocales = [
  'ar',
  'ca',
  'cs',
  'da',
  'de',
  'el',
  'en',
  'es',
  'fa',
  'fi',
  'fr',
  'hu',
  'it',
  'ja',
  'ka',
  'lt',
  'lv',
  'nl',
  'no',
  'pl',
  'pt',
  'pt-BR',
  'ru',
  'sk',
  'sv',
  'th',
  'tr',
  'uk',
  'zh-CN',
  'zh-TW',
] as const

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 5173,
    strictPort: true,
    open: true,
  },
  plugins: [
    react(),
    tailwindcss(),
    keycloakify({
      accountThemeImplementation: 'Multi-Page',
      themeName: [...themeNames],
      doCreateJar: false,
      environmentVariables: [...shadcnEnvironmentVariables],
      postBuild: async (buildContext) => {
        await buildEmailTheme({
          templatesSrcDirPath: path.join(buildContext.themeSrcDirPath, 'email', 'templates'),
          i18nSourceFile: path.join(buildContext.themeSrcDirPath, 'email', 'i18n.ts'),
          themeNames: buildContext.themeNames,
          keycloakifyBuildDirPath: buildContext.keycloakifyBuildDirPath,
          locales: [...emailLocales],
          esbuild: { jsx: 'automatic' },
          cwd: packageDir,
          environmentVariables: buildContext.environmentVariables,
        })
      },
    }),
  ],
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: [
      { find: '@', replacement: srcDir },
      { find: 'react', replacement: reactDir },
      { find: 'react-dom', replacement: reactDomDir },
    ],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
  },
})
