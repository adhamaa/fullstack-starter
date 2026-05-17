/** Git ref for `github:adhamaa/fullstack-starter#<ref>` (tag without repo prefix). */
export function resolveTemplateRef(packageVersion: string, templateTag?: string): string {
  const override = templateTag?.trim()
  if (override) {
    if (override === 'main' || override.startsWith('v')) {
      return override
    }
    return `v${override}`
  }

  if (packageVersion === '0.0.0') {
    return 'main'
  }

  return packageVersion.startsWith('v') ? packageVersion : `v${packageVersion}`
}
