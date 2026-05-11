import {
  exchangeCodeAsync,
  makeRedirectUri,
  refreshAsync,
  revokeAsync,
  useAuthRequest,
  useAutoDiscovery,
} from 'expo-auth-session'
import * as SecureStore from 'expo-secure-store'
import * as WebBrowser from 'expo-web-browser'
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

WebBrowser.maybeCompleteAuthSession()

const ISSUER = process.env.EXPO_PUBLIC_KEYCLOAK_ISSUER ?? 'http://localhost:8080/realms/fullstack'
const CLIENT_ID = process.env.EXPO_PUBLIC_KEYCLOAK_CLIENT_ID ?? 'fullstack-mobile'
const SCHEME = 'fullstackstarter'
const STORAGE_KEY = 'fullstack.tokens.v1'
const REFRESH_LEEWAY_MS = 30_000

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
  if (tokens) {
    await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(tokens))
  } else {
    await SecureStore.deleteItemAsync(STORAGE_KEY)
  }
}

async function load(): Promise<StoredTokens | null> {
  const raw = await SecureStore.getItemAsync(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as StoredTokens
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const discovery = useAutoDiscovery(ISSUER)
  const redirectUri = useMemo(() => makeRedirectUri({ scheme: SCHEME }), [])

  const [tokens, setTokens] = useState<StoredTokens | null>(null)
  const [ready, setReady] = useState(false)
  const [signingIn, setSigningIn] = useState(false)

  const [request, , promptAsync] = useAuthRequest(
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
      .finally(() => {
        if (!cancelled) setReady(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const updateTokens = useCallback(async (next: StoredTokens | null) => {
    setTokens(next)
    await persist(next)
  }, [])

  const signIn = useCallback(async () => {
    if (!discovery || !request) return
    setSigningIn(true)
    try {
      const result = await promptAsync()
      if (result.type !== 'success' || !result.params.code) return

      const codeVerifier = request.codeVerifier
      if (!codeVerifier) {
        console.warn('[auth] missing PKCE codeVerifier')
        return
      }

      const exchange = await exchangeCodeAsync(
        {
          clientId: CLIENT_ID,
          code: result.params.code,
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
    } catch (error) {
      console.warn('[auth] signIn failed:', (error as Error).message)
    } finally {
      setSigningIn(false)
    }
  }, [discovery, promptAsync, redirectUri, request, updateTokens])

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
    if (Date.now() < tokens.accessTokenExpiresAt - REFRESH_LEEWAY_MS) {
      return tokens.accessToken
    }
    if (!discovery || !tokens.refreshToken) return tokens.accessToken

    try {
      const refreshed = await refreshAsync(
        { clientId: CLIENT_ID, refreshToken: tokens.refreshToken },
        discovery,
      )
      const next: StoredTokens = {
        accessToken: refreshed.accessToken,
        refreshToken: refreshed.refreshToken ?? tokens.refreshToken,
        accessTokenExpiresAt: Date.now() + (refreshed.expiresIn ?? 60) * 1000,
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
