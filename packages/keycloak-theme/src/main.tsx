import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { KcPage } from './kc.gen'
import './theme/tailwind.css'

// The following block can be uncommented to test a specific page with `yarn dev`
// Don't forget to comment back or your bundle size will increase

import { getKcContextMock } from "./login/KcPageStory";

if (import.meta.env.DEV) {
    window.kcContext = getKcContextMock({
        pageId: "login.ftl",
        overrides: {}
    });
}


const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Missing #root element')
}

createRoot(rootElement).render(
  <StrictMode>
    {!window.kcContext ? <h1>No Keycloak Context</h1> : <KcPage kcContext={window.kcContext} />}
  </StrictMode>,
)
