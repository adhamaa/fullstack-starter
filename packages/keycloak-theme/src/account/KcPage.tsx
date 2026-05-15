import type { ClassKey } from 'keycloakify/account'
import DefaultPage from 'keycloakify/account/DefaultPage'
import Template from 'keycloakify/account/Template'
import type { CSSProperties } from 'react'
import { Suspense } from 'react'
import { parseThemeName, variants } from '../theme/variants'
import { useI18n } from './i18n'
import type { KcContext } from './KcContext'

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
              />
            )
        }
      })()}
    </Suspense>
  )
}

const classes = {} satisfies { [key in ClassKey]?: string }
