import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { keycloakify } from 'keycloakify/vite-plugin'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    keycloakify({
      accountThemeImplementation: 'Multi-Page',
      // Theme variants (web/mobile + seasonal)
      themeName: [
        'fullstack-web-default',
        'fullstack-web-ramadan',
        'fullstack-mobile-default',
        'fullstack-mobile-ramadan',
      ],
      // Local dev / CI friendliness: skip Maven/JAR packaging
      doCreateJar: false,
    }),
  ],
})
