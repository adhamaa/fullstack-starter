import {
  type AuthSessionResult,
  exchangeCodeAsync,
  makeRedirectUri,
  refreshAsync,
  revokeAsync,
  useAuthRequest,
  useAutoDiscovery,
} from 'expo-auth-session'
import * as WebBrowser from 'expo-web-browser'
import { exchangeCodeViaApi, refreshTokenViaApi } from './authProxy'
import { loadTokens, saveTokens } from './tokenStorage'
import {
  clearPendingPkce,
  clearPkceVerifier,
  loadPkceVerifier,
  readPendingPkce,
  savePkceVerifier,
  stashPendingPkce,
} from './pkceStorage'
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { needsRefresh } from '@fullstack/identity-session'
import { Platform } from 'react-native'

// Popup callback page: allow trailing-slash mismatch between redirect_uri and return URL.
WebBrowser.maybeCompleteAuthSession({ skipRedirectCheck: true })

const ISSUER = process.env.EXPO_PUBLIC_KEYCLOAK_ISSUER ?? 'http://localhost:8080/realms/fullstack'
const CLIENT_ID = process.env.EXPO_PUBLIC_KEYCLOAK_CLIENT_ID ?? 'fullstack-mobile'
const SCHEME = 'fullstackstarter'
/** Optional override when Keycloak must match a fixed callback (e.g. custom dev port). */
const REDIRECT_URI_OVERRIDE = process.env.EXPO_PUBLIC_APP_REDIRECT_URI

type StoredTokens = {
  accessToken: string
  refreshToken: string | null
  accessTokenExpiresAt: number
}

type AuthContextValue = {
  ready: boolean
  signingIn: boolean
  accessToken: string | null
  signIn: () => Promise<void>
  signOut: () => Promise<void>
  /** Returns the current access token, refreshing first if it is near expiry. */
  getAccessToken: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

async function persist(tokens: StoredTokens | null) {
  await saveTokens(tokens ? JSON.stringify(tokens) : null)
}

async function load(): Promise<StoredTokens | null> {
  try {
    const raw = await loadTokens()
    if (!raw) return null
    return JSON.parse(raw) as StoredTokens
  } catch {
    return null
  }
}

function authParamsFromResult(
  result: AuthSessionResult,
): { code: string; state?: string } | null {
  if (!('params' in result)) return null
  const code = result.params?.code
  if (!code) return null
  return { code, state: result.params.state }
}

function oauthParamsFromLocation(): { code: string; state: string } | null {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null
  const search = new URLSearchParams(window.location.search)
  const code = search.get('code')
  const state = search.get('state')
  if (code && state) return { code, state }
  const hash = window.location.hash.replace(/^#/, '')
  if (!hash) return null
  const hashParams = new URLSearchParams(hash)
  const hashCode = hashParams.get('code')
  const hashState = hashParams.get('state')
  if (hashCode && hashState) return { code: hashCode, state: hashState }
  return null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const discovery = useAutoDiscovery(ISSUER)
  const redirectUri = useMemo(
    () => REDIRECT_URI_OVERRIDE ?? makeRedirectUri({ scheme: SCHEME }),
    [],
  )

  const [tokens, setTokens] = useState<StoredTokens | null>(null)
  const [ready, setReady] = useState(false)
  const [signingIn, setSigningIn] = useState(false)
  const handledAuthRef = useRef<string | null>(null)

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: CLIENT_ID,
      redirectUri,
      scopes: ['openid', 'profile', 'email', 'offline_access'],
      usePKCE: true,
    },
    discovery,
  )

  useEffect(() => {
    let cancelled = false
    load()
      .then((stored) => {
        if (!cancelled) setTokens(stored)
      })
      .catch((error) => {
        console.warn('[auth] load failed:', (error as Error).message)
      })
      .finally(() => {
        if (!cancelled) setReady(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Keep PKCE verifier in localStorage (popup and parent share the same origin).
  useEffect(() => {
    if (!request?.codeVerifier || !request.state) return
    savePkceVerifier(request.state, request.codeVerifier)
  }, [request?.codeVerifier, request?.state])

  const updateTokens = useCallback(async (next: StoredTokens | null) => {
    setTokens(next)
    await persist(next)
  }, [])

  const clearWebOAuthParams = useCallback(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return
    const url = new URL(window.location.href)
    if (
      !url.searchParams.has('code') &&
      !url.searchParams.has('state') &&
      !url.hash.includes('code=')
    ) {
      return
    }
    url.searchParams.delete('code')
    url.searchParams.delete('state')
    url.searchParams.delete('session_state')
    url.searchParams.delete('iss')
    if (url.hash) {
      const hashParams = new URLSearchParams(url.hash.replace(/^#/, ''))
      hashParams.delete('code')
      hashParams.delete('state')
      hashParams.delete('session_state')
      hashParams.delete('iss')
      const nextHash = hashParams.toString()
      url.hash = nextHash ? `#${nextHash}` : ''
    }
    window.history.replaceState({}, '', url.pathname + url.search + url.hash)
  }, [])

  const resolveCodeVerifier = useCallback(
    (state: string | undefined, fallback?: string) => {
      if (fallback) return fallback
      if (!state) return undefined
      return loadPkceVerifier(state) ?? undefined
    },
    [],
  )

  const exchangeAuthCode = useCallback(
    async (code: string, codeVerifier: string, oauthState?: string) => {
      if (Platform.OS === 'web') {
        const exchange = await exchangeCodeViaApi(code, codeVerifier, redirectUri, CLIENT_ID)
        await updateTokens({
          accessToken: exchange.access_token,
          refreshToken: exchange.refresh_token ?? null,
          accessTokenExpiresAt: Date.now() + (exchange.expires_in ?? 60) * 1000,
        })
      } else {
        if (!discovery) return
        const exchange = await exchangeCodeAsync(
          {
            clientId: CLIENT_ID,
            code,
            redirectUri,
            extraParams: { code_verifier: codeVerifier },
          },
          discovery,
        )
        await updateTokens({
          accessToken: exchange.accessToken,
          refreshToken: exchange.refreshToken ?? null,
          accessTokenExpiresAt: Date.now() + (exchange.expiresIn ?? 60) * 1000,
        })
      }
      if (oauthState) clearPkceVerifier(oauthState)
      clearPendingPkce()
      clearWebOAuthParams()
    },
    [clearWebOAuthParams, discovery, redirectUri, updateTokens],
  )

  const completeAuthResult = useCallback(
    async (result: AuthSessionResult, codeVerifier?: string) => {
      const authParams = authParamsFromResult(result)
      if (!authParams) {
        if (result.type === 'error' || result.type === 'dismiss' || result.type === 'cancel') {
          const message =
            result.type === 'error' && 'error' in result
              ? String(result.error ?? result.type)
              : result.type
          console.warn('[auth] sign-in did not complete:', message)
        }
        return
      }
      const { code, state } = authParams

      const verifier = resolveCodeVerifier(state, codeVerifier)
      if (!verifier) {
        console.warn('[auth] missing PKCE codeVerifier for state', state)
        return
      }

      const key = code
      if (handledAuthRef.current === key) return
      handledAuthRef.current = key

      try {
        await exchangeAuthCode(code, verifier, state)
      } catch (error) {
        handledAuthRef.current = null
        console.warn('[auth] token exchange failed:', (error as Error).message, {
          redirectUri,
          state,
        })
        throw error
      }
    },
    [exchangeAuthCode, redirectUri, resolveCodeVerifier],
  )

  // Web: return URL with ?code= (full redirect or popup landing in same tab).
  useEffect(() => {
    if (Platform.OS !== 'web' || !ready || tokens) return

    const callback = oauthParamsFromLocation()
    if (!callback) return

    const verifier =
      loadPkceVerifier(callback.state) ?? readPendingPkce()?.codeVerifier ?? null
    if (!verifier) {
      console.warn('[auth] OAuth callback missing PKCE verifier for state', callback.state)
      return
    }

    const key = callback.code
    if (handledAuthRef.current === key) return
    handledAuthRef.current = key

    setSigningIn(true)
    void exchangeAuthCode(callback.code, verifier, callback.state)
      .catch((error) => {
        handledAuthRef.current = null
        console.warn('[auth] token exchange failed:', (error as Error).message, { redirectUri })
      })
      .finally(() => setSigningIn(false))
  }, [exchangeAuthCode, ready, redirectUri, tokens])

  // Popup return via useAuthRequest (parent window).
  useEffect(() => {
    if (!response) return
    const authParams = authParamsFromResult(response)
    if (!authParams) return
    const verifier = resolveCodeVerifier(authParams.state, request?.codeVerifier)
    setSigningIn(true)
    void completeAuthResult(response, verifier)
      .catch(() => {})
      .finally(() => setSigningIn(false))
  }, [completeAuthResult, request?.codeVerifier, resolveCodeVerifier, response])

  const signIn = useCallback(async () => {
    if (!discovery || !request?.codeVerifier) {
      console.warn('[auth] auth request not ready (missing PKCE)')
      return
    }
    stashPendingPkce(request.codeVerifier, request.state, redirectUri)
    setSigningIn(true)
    try {
      const result = await promptAsync()
      const params = authParamsFromResult(result)
      await completeAuthResult(
        result,
        resolveCodeVerifier(params?.state, request.codeVerifier),
      )
    } catch (error) {
      console.warn('[auth] signIn failed:', (error as Error).message, { redirectUri })
    } finally {
      setSigningIn(false)
    }
  }, [completeAuthResult, discovery, promptAsync, redirectUri, request, resolveCodeVerifier])

  const signOut = useCallback(async () => {
    if (discovery && tokens?.refreshToken) {
      try {
        await revokeAsync({ token: tokens.refreshToken, clientId: CLIENT_ID }, discovery)
      } catch {
        // best-effort
      }
    }
    await updateTokens(null)
  }, [discovery, tokens, updateTokens])

  const getAccessToken = useCallback(async () => {
    if (!tokens) return null
    if (!needsRefresh(tokens.accessTokenExpiresAt)) {
      return tokens.accessToken
    }
    if (!tokens.refreshToken) return tokens.accessToken

    try {
      let next: StoredTokens
      if (Platform.OS === 'web') {
        const refreshed = await refreshTokenViaApi(tokens.refreshToken, CLIENT_ID)
        next = {
          accessToken: refreshed.access_token,
          refreshToken: refreshed.refresh_token ?? tokens.refreshToken,
          accessTokenExpiresAt: Date.now() + (refreshed.expires_in ?? 60) * 1000,
        }
      } else {
        if (!discovery) return tokens.accessToken
        const refreshed = await refreshAsync(
          { clientId: CLIENT_ID, refreshToken: tokens.refreshToken },
          discovery,
        )
        next = {
          accessToken: refreshed.accessToken,
          refreshToken: refreshed.refreshToken ?? tokens.refreshToken,
          accessTokenExpiresAt: Date.now() + (refreshed.expiresIn ?? 60) * 1000,
        }
      }
      await updateTokens(next)
      return next.accessToken
    } catch (error) {
      console.warn('[auth] refresh failed:', (error as Error).message)
      await updateTokens(null)
      return null
    }
  }, [discovery, tokens, updateTokens])

  const value = useMemo<AuthContextValue>(
    () => ({
      ready,
      signingIn,
      accessToken: tokens?.accessToken ?? null,
      signIn,
      signOut,
      getAccessToken,
    }),
    [getAccessToken, ready, signIn, signOut, signingIn, tokens],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
