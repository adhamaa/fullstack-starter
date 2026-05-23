import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptsDir = path.dirname(fileURLToPath(import.meta.url))
export const pkgDir = path.join(scriptsDir, '..')

/** @type {{ skipJar: boolean; outputDir: string }} */
export const BUILD_DEFAULTS = {
  skipJar: false,
  outputDir: path.resolve(pkgDir, '..', '..', 'infra', 'keycloak', 'themes'),
}

/**
 * @param {string[]} argv
 * @returns {{ skipJar?: boolean; outputDir?: string; yes: boolean }}
 */
export function parseArgv(argv) {
  /** @type {{ skipJar?: boolean; outputDir?: string; yes: boolean }} */
  const result = { yes: false }

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--yes' || arg === '-y') {
      result.yes = true
      continue
    }
    if (arg === '--skip-jar') {
      result.skipJar = true
      continue
    }
    if (arg === '--no-skip-jar') {
      result.skipJar = false
      continue
    }
    if (arg === '--output' || arg === '-o') {
      const value = argv[++i]
      if (!value) throw new Error(`Missing value for ${arg}`)
      result.outputDir = value
      continue
    }
  }

  return result
}

/**
 * @param {string[]} argv
 */
export function shouldPrompt(argv) {
  if (parseArgv(argv).yes) return false
  if (process.env.CI === 'true' || process.env.CI === '1') return false
  if (process.env.KEYCLOAK_THEME_NON_INTERACTIVE === '1') return false
  if (!process.stdin.isTTY) return false
  return true
}

/**
 * @returns {{ skipJar?: boolean; outputDir?: string }}
 */
export function parseEnv() {
  /** @type {{ skipJar?: boolean; outputDir?: string }} */
  const result = {}

  if (process.env.KEYCLOAK_THEME_SKIP_JAR === '1') {
    result.skipJar = true
  } else if (process.env.KEYCLOAK_THEME_SKIP_JAR === '0') {
    result.skipJar = false
  }

  if (process.env.KEYCLOAK_THEME_OUTPUT_DIR?.trim()) {
    result.outputDir = process.env.KEYCLOAK_THEME_OUTPUT_DIR.trim()
  }

  return result
}

/**
 * @param {string} outputDir
 */
export function resolveOutputDir(outputDir) {
  return path.isAbsolute(outputDir) ? outputDir : path.resolve(pkgDir, outputDir)
}
