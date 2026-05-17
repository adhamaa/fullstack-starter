import { describe, expect, it, vi } from 'vitest'
import {
  endIdentitySession,
  IDENTITY_SESSION_END_WARNING,
  keycloakBrowserLogoutUrl,
} from './session-end.js'
import type { SessionEndTransport } from './transport.js'

function mockTransport(overrides?: Partial<SessionEndTransport>): SessionEndTransport {
  return {
    revokeRefreshToken: vi.fn().mockResolvedValue(undefined),
    endIdpSession: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  }
}

describe('endIdentitySession', () => {
  it('revokes refresh and ends IdP session when requested', async () => {
    const transport = mockTransport()
    const result = await endIdentitySession(transport, {
      clientId: 'fullstack-mobile',
      refreshToken: 'refresh',
      endIdpSession: true,
    })

    expect(transport.revokeRefreshToken).toHaveBeenCalledOnce()
    expect(transport.endIdpSession).toHaveBeenCalledOnce()
    expect(result).toEqual({
      localCleared: true,
      refreshRevoked: true,
      idpSessionEnded: true,
    })
  })

  it('returns warning when revoke fails but still signals local clear', async () => {
    const transport = mockTransport({
      revokeRefreshToken: vi.fn().mockRejectedValue(new Error('network')),
    })

    const result = await endIdentitySession(transport, {
      clientId: 'fullstack-web',
      refreshToken: 'refresh',
    })

    expect(result.localCleared).toBe(true)
    expect(result.refreshRevoked).toBe(false)
    expect(result.warning).toBe(IDENTITY_SESSION_END_WARNING)
  })

  it('skips remote calls when no refresh token', async () => {
    const transport = mockTransport()
    const result = await endIdentitySession(transport, {
      clientId: 'fullstack-web',
      refreshToken: null,
    })

    expect(transport.revokeRefreshToken).not.toHaveBeenCalled()
    expect(result.refreshRevoked).toBe(true)
  })
})

describe('keycloakBrowserLogoutUrl', () => {
  it('builds logout URL with redirect', () => {
    const url = keycloakBrowserLogoutUrl(
      'http://localhost:8080/realms/fullstack',
      'fullstack-mobile',
      'http://localhost:8081',
    )
    expect(url).toContain('/protocol/openid-connect/logout?')
    expect(url).toContain('client_id=fullstack-mobile')
    expect(url).toContain('post_logout_redirect_uri=')
  })
})
