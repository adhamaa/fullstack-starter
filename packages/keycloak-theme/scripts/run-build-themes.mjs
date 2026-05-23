#!/usr/bin/env node
/**
 * Interactive theme build: keycloakify (optional --skip-jar) + extract to infra/themes.
 */
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { resolveBuildOptions } from './resolve-build-options.mjs'

const scriptsDir = path.dirname(fileURLToPath(import.meta.url))
const pkgDir = path.join(scriptsDir, '..')

const argv = process.argv.slice(2)
const options = await resolveBuildOptions(argv)

process.env.KEYCLOAK_THEME_SKIP_JAR = options.skipJar ? '1' : '0'
process.env.KEYCLOAK_THEME_OUTPUT_DIR = options.outputDir

function runNodeScript(scriptName) {
  const scriptPath = path.join(scriptsDir, scriptName)
  const r = spawnSync(process.execPath, [scriptPath], {
    stdio: 'inherit',
    cwd: pkgDir,
    env: process.env,
  })
  if (r.error) {
    console.error(`[keycloak-theme] Failed to run ${scriptName}: ${r.error.message}`)
    return 1
  }
  return r.status ?? 1
}

let code = runNodeScript('run-build-kc.mjs')
if (code !== 0) process.exit(code)

code = runNodeScript('extract-themes.mjs')
process.exit(code)
