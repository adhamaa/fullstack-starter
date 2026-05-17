import { Platform } from 'react-native'

const PENDING_KEY = 'fullstack.auth.pending-pkce'

function pkceKey(state: string) {
  return `fullstack.auth.pkce.${state}`
}

function canUseWebStorage() {
  return Platform.OS === 'web' && typeof localStorage !== 'undefined'
}

/** Persist verifier by OAuth state (shared across tabs/popups on the same origin). */
export function savePkceVerifier(state: string, codeVerifier: string) {
  if (!canUseWebStorage()) return
  localStorage.setItem(pkceKey(state), codeVerifier)
}

export function loadPkceVerifier(state: string): string | null {
  if (!canUseWebStorage()) return null
  return localStorage.getItem(pkceKey(state))
}

export function clearPkceVerifier(state: string) {
  if (!canUseWebStorage()) return
  localStorage.removeItem(pkceKey(state))
}

export function stashPendingPkce(codeVerifier: string, state: string, redirectUri: string) {
  if (!canUseWebStorage()) return
  savePkceVerifier(state, codeVerifier)
  localStorage.setItem(PENDING_KEY, JSON.stringify({ codeVerifier, state, redirectUri }))
}

export function readPendingPkce(): {
  codeVerifier: string
  state: string
  redirectUri: string
} | null {
  if (!canUseWebStorage()) return null
  const raw = localStorage.getItem(PENDING_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as { codeVerifier: string; state: string; redirectUri: string }
  } catch {
    return null
  }
}

export function clearPendingPkce() {
  if (!canUseWebStorage()) return
  localStorage.removeItem(PENDING_KEY)
}
