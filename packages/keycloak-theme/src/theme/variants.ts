export type ClientProfile = 'web' | 'mobile'
export type VariantId = 'default' | 'ramadan'

export type ThemeVariant = {
  id: VariantId
  label: string
  tokens: {
    accent: string
    accentFg: string
    bg: string
    ink: string
  }
  assets: {
    logoText: string
  }
}

export const variants: Record<VariantId, ThemeVariant> = {
  default: {
    id: 'default',
    label: 'Default',
    tokens: {
      accent: 'var(--color-accent)',
      accentFg: 'var(--color-accent-fg)',
      bg: 'var(--color-bg)',
      ink: 'var(--color-ink)',
    },
    assets: {
      logoText: 'Fullstack Starter',
    },
  },
  ramadan: {
    id: 'ramadan',
    label: 'Ramadan',
    tokens: {
      accent: '#22c55e',
      accentFg: '#052e16',
      bg: 'var(--color-bg)',
      ink: 'var(--color-ink)',
    },
    assets: {
      logoText: 'Fullstack Starter',
    },
  },
}

export function parseThemeName(themeName: string): { client: ClientProfile; variant: VariantId } {
  // Expected: fullstack-<client>-<variant>
  const parts = themeName.split('-')
  const client = (parts[1] as ClientProfile | undefined) ?? 'web'
  const variant = (parts[2] as VariantId | undefined) ?? 'default'
  return {
    client: client === 'mobile' ? 'mobile' : 'web',
    variant: variant === 'ramadan' ? 'ramadan' : 'default',
  }
}
