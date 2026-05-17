import {
  endIdentitySession,
  KeycloakDirectTransport,
  needsRefresh,
  refreshAccessToken,
} from '@fullstack/identity-session'
import NextAuth, { type DefaultSession } from 'next-auth'
import Keycloak from 'next-auth/providers/keycloak'

declare module 'next-auth' {
  interface Session {
    accessToken?: string
    error?: 'RefreshAccessTokenError'
    user: DefaultSession['user'] & { id?: string }
  }
}

type AuthToken = {
  sub?: string
  accessToken?: string
  refreshToken?: string
  accessTokenExpires?: number
  error?: 'RefreshAccessTokenError'
  [key: string]: unknown
}

const keycloakIssuer = process.env.KEYCLOAK_ISSUER ?? 'http://localhost:8080/realms/fullstack'
const keycloakClientId = process.env.KEYCLOAK_CLIENT_ID ?? 'fullstack-web'
const keycloakClientSecret = process.env.KEYCLOAK_CLIENT_SECRET ?? 'fullstack-web-dev-secret'

const keycloakTransport = new KeycloakDirectTransport({
  issuer: keycloakIssuer,
  clientSecret: keycloakClientSecret,
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Keycloak({
      clientId: keycloakClientId,
      clientSecret: keycloakClientSecret,
      issuer: keycloakIssuer,
    }),
  ],
  events: {
    async signOut(message) {
      const token = (message as { token?: AuthToken }).token
      const result = await endIdentitySession(keycloakTransport, {
        clientId: keycloakClientId,
        refreshToken: token?.refreshToken,
        endIdpSession: true,
      })
      if (result.warning) {
        console.warn('[auth] identity session end:', result.warning)
      }
    },
  },
  callbacks: {
    async jwt({ token, account }) {
      const current = token as AuthToken

      if (account?.access_token) {
        return {
          ...current,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: (account.expires_at ?? Math.floor(Date.now() / 1000) + 60) * 1000,
          sub: current.sub,
        } satisfies AuthToken
      }

      if (
        typeof current.accessTokenExpires === 'number' &&
        !needsRefresh(current.accessTokenExpires)
      ) {
        return current
      }

      if (!current.refreshToken) {
        // Access token is expired (or its expiry is unknown) and we have no way
        // to mint a new one. Drop the stale access token and signal the error
        // so callers stop sending it and can prompt the user to sign in again.
        return {
          ...current,
          accessToken: undefined,
          error: 'RefreshAccessTokenError' as const,
        } satisfies AuthToken
      }

      try {
        const refreshed = await refreshAccessToken(keycloakTransport, {
          refreshToken: current.refreshToken,
          clientId: keycloakClientId,
        })
        return {
          ...current,
          accessToken: refreshed.accessToken,
          refreshToken: refreshed.refreshToken ?? current.refreshToken,
          accessTokenExpires: refreshed.accessTokenExpiresAt,
          error: undefined,
        } satisfies AuthToken
      } catch (error) {
        console.warn('[auth] refresh failed:', (error as Error).message)
        return {
          ...current,
          accessToken: undefined,
          error: 'RefreshAccessTokenError' as const,
        } satisfies AuthToken
      }
    },
    async session({ session, token }) {
      const t = token as AuthToken
      session.accessToken = t.accessToken
      session.error = t.error
      if (session.user && t.sub) {
        session.user.id = t.sub
      }
      return session
    },
  },
})
