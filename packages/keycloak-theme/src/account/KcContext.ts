/* eslint-disable @typescript-eslint/ban-types */
import type { ExtendKcContext } from 'keycloakify/account'
import type { KcEnvName, ThemeName } from '../kc.gen'

export type KcContextExtension = {
  themeName: ThemeName
  properties: Record<KcEnvName, string> & {}
}

// biome-ignore lint/complexity/noBannedTypes: Keycloakify expects an empty extension object here
export type KcContextExtensionPerPage = {}

export type KcContext = ExtendKcContext<KcContextExtension, KcContextExtensionPerPage>
