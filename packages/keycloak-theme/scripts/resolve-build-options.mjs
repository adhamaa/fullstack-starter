import path from 'node:path'
import * as p from '@clack/prompts'
import {
  BUILD_DEFAULTS,
  parseArgv,
  parseEnv,
  pkgDir,
  resolveOutputDir,
  shouldPrompt,
} from './build-config.mjs'

/**
 * @param {string[]} argv
 * @returns {Promise<{ skipJar: boolean; outputDir: string }>}
 */
export async function resolveBuildOptions(argv) {
  const fromArgv = parseArgv(argv)
  const fromEnv = parseEnv()

  let skipJar = fromEnv.skipJar ?? fromArgv.skipJar ?? BUILD_DEFAULTS.skipJar
  let outputDir = fromEnv.outputDir ?? fromArgv.outputDir ?? BUILD_DEFAULTS.outputDir

  if (!shouldPrompt(argv)) {
    return {
      skipJar,
      outputDir: resolveOutputDir(outputDir),
    }
  }

  p.intro('Keycloak theme build')

  const jarChoice = await p.select({
    message: 'Keycloakify output',
    options: [
      {
        value: 'jar',
        label: 'JAR (default)',
        hint: 'Writes .jar files under dist_keycloak',
      },
      {
        value: 'skip-jar',
        label: 'Skip JAR (--skip-jar)',
        hint: 'Plain theme files under dist_keycloak/theme',
      },
    ],
    initialValue: skipJar ? 'skip-jar' : 'jar',
  })

  if (p.isCancel(jarChoice)) {
    p.cancel('Build cancelled.')
    process.exit(0)
  }

  skipJar = jarChoice === 'skip-jar'

  const outputAnswer = await p.text({
    message: 'Extract themes to',
    defaultValue: outputDir,
    placeholder: path.relative(pkgDir, BUILD_DEFAULTS.outputDir) || BUILD_DEFAULTS.outputDir,
  })

  if (p.isCancel(outputAnswer)) {
    p.cancel('Build cancelled.')
    process.exit(0)
  }

  const trimmed = String(outputAnswer).trim()
  outputDir = trimmed.length > 0 ? trimmed : BUILD_DEFAULTS.outputDir

  p.outro(
    skipJar
      ? 'Building without JAR, then extracting themes…'
      : 'Building JAR, then extracting themes…',
  )

  return {
    skipJar,
    outputDir: resolveOutputDir(outputDir),
  }
}
