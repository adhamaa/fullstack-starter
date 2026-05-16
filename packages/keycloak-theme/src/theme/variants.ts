export type ClientProfile = 'web' | 'mobile'
export type VariantId = 'default' | 'ramadan'

export type ThemeVariant = {
  id: VariantId
  label: string
  tokens: {
    accent: string
    accentFg: string
  }
}

export const variants: Record<VariantId, ThemeVariant> = {
  default: {
    id: 'default',
    label: 'Default',
    tokens: {
      accent: 'var(--color-accent)',
      accentFg: 'var(--color-accent-fg)',
    },
  },
  ramadan: {
    id: 'ramadan',
    label: 'Ramadan',
    tokens: {
      accent: '#22c55e',
      accentFg: '#052e16',
    },
  },
}

export function parseThemeName(themeName: string): { client: ClientProfile; variant: VariantId } {
  const parts = themeName.split('-')
  const client = (parts[1] as ClientProfile | undefined) ?? 'web'
  const variant = (parts[2] as VariantId | undefined) ?? 'default'
  return {
    client: client === 'mobile' ? 'mobile' : 'web',
    variant: variant === 'ramadan' ? 'ramadan' : 'default',
  }
}
