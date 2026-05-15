export function normalizeAud(aud: unknown): string[] {
  if (typeof aud === 'string') return [aud]
  if (Array.isArray(aud)) return aud.filter((v): v is string => typeof v === 'string')
  return []
}

/**
 * Keycloak access tokens often use `aud: "account"` with the client id in `azp`.
 * Returns true when the token satisfies the configured allow-list.
 */
export function isAudienceAllowed(
  aud: unknown,
  azp: string | undefined,
  configured: string[],
): boolean {
  if (configured.length === 0) return true

  const allowed = new Set([...configured, 'account'])
  const audValues = normalizeAud(aud)
  const audOk = audValues.some((value) => allowed.has(value))
  const azpOk = azp ? allowed.has(azp) : false
  return audOk || azpOk
}
