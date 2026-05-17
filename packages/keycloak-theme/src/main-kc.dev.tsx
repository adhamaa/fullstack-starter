import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { DevErrorBoundary } from './DevErrorBoundary'
import { KcPage } from './kc.gen'
import { getKcContextMock } from './login/mocks/getKcContextMock'

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Missing #root element')
}

const kcContext = getKcContextMock({
  pageId: 'login-password.ftl',
  overrides: {
    auth: {
      showUsername: true,
      attemptedUsername: 'demo',
    },
  },
})

createRoot(rootElement).render(
  <StrictMode>
    <DevErrorBoundary>
      <KcPage kcContext={kcContext} />
    </DevErrorBoundary>
  </StrictMode>,
)
