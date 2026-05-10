import NextAuth, { type DefaultSession } from "next-auth";
import Keycloak from "next-auth/providers/keycloak";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    error?: "RefreshAccessTokenError";
    user: DefaultSession["user"] & { id?: string };
  }
}

type AuthToken = {
  sub?: string;
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpires?: number;
  error?: "RefreshAccessTokenError";
  [key: string]: unknown;
};

const keycloakIssuer =
  process.env.KEYCLOAK_ISSUER ?? "http://localhost:8080/realms/fullstack";
const keycloakClientId = process.env.KEYCLOAK_CLIENT_ID ?? "fullstack-web";
const keycloakClientSecret =
  process.env.KEYCLOAK_CLIENT_SECRET ?? "fullstack-web-dev-secret";

async function refreshAccessToken(refreshToken: string) {
  const response = await fetch(`${keycloakIssuer}/protocol/openid-connect/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: keycloakClientId,
      client_secret: keycloakClientSecret
    }),
    cache: "no-store"
  });

  const refreshed = (await response.json()) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    error?: string;
  };

  if (!response.ok || !refreshed.access_token) {
    throw new Error(refreshed.error ?? "failed_to_refresh_keycloak_token");
  }

  return {
    accessToken: refreshed.access_token,
    refreshToken: refreshed.refresh_token ?? refreshToken,
    accessTokenExpires: Date.now() + (refreshed.expires_in ?? 60) * 1000
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Keycloak({
      clientId: keycloakClientId,
      clientSecret: keycloakClientSecret,
      issuer: keycloakIssuer
    })
  ],
  callbacks: {
    async jwt({ token, account }) {
      const current = token as AuthToken;

      if (account?.access_token) {
        return {
          ...current,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires:
            (account.expires_at ?? Math.floor(Date.now() / 1000) + 60) * 1000,
          sub: current.sub
        } satisfies AuthToken;
      }

      if (
        typeof current.accessTokenExpires === "number" &&
        Date.now() < current.accessTokenExpires - 30_000
      ) {
        return current;
      }

      if (!current.refreshToken) {
        // Access token is expired (or its expiry is unknown) and we have no way
        // to mint a new one. Drop the stale access token and signal the error
        // so callers stop sending it and can prompt the user to sign in again.
        return {
          ...current,
          accessToken: undefined,
          error: "RefreshAccessTokenError" as const
        } satisfies AuthToken;
      }

      try {
        const refreshed = await refreshAccessToken(current.refreshToken);
        return { ...current, ...refreshed, error: undefined } satisfies AuthToken;
      } catch (error) {
        console.warn("[auth] refresh failed:", (error as Error).message);
        return {
          ...current,
          accessToken: undefined,
          error: "RefreshAccessTokenError" as const
        } satisfies AuthToken;
      }
    },
    async session({ session, token }) {
      const t = token as AuthToken;
      session.accessToken = t.accessToken;
      session.error = t.error;
      if (session.user && t.sub) {
        session.user.id = t.sub;
      }
      return session;
    }
  }
});
