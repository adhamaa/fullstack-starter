import type { ClassKey } from 'keycloakify/login'
import DefaultPage from 'keycloakify/login/DefaultPage'
import Template from 'keycloakify/login/Template'
import type { CSSProperties } from 'react'
import { lazy, Suspense } from 'react'
import { parseThemeName, variants } from '../theme/variants'
import { useI18n } from './i18n'
import type { KcContext } from './KcContext'

const UserProfileFormFields = lazy(() => import('keycloakify/login/UserProfileFormFields'))

const doMakeUserConfirmPassword = true

export default function KcPage(props: { kcContext: KcContext }) {
  const { kcContext } = props

  const { i18n } = useI18n({ kcContext })
  const { variant } = parseThemeName(kcContext.themeName)
  const theme = variants[variant]
  const themeStyle = {
    '--fs-accent': theme.tokens.accent,
    '--fs-accent-fg': theme.tokens.accentFg,
  } as CSSProperties

  return (
    <Suspense>
      {(() => {
        switch (kcContext.pageId) {
          default:
            return (
              <DefaultPage
                kcContext={kcContext}
                i18n={i18n}
                classes={classes}
                Template={(props) => (
                  <div style={themeStyle}>
                    <Template {...props} />
                  </div>
                )}
                doUseDefaultCss={true}
                UserProfileFormFields={UserProfileFormFields}
                doMakeUserConfirmPassword={doMakeUserConfirmPassword}
              />
            )
        }
      })()}
    </Suspense>
  )
}

const classes = {} satisfies { [key in ClassKey]?: string }
