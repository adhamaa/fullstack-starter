#!/usr/bin/env node
/**
 * Runs `build:app` then `keycloakify build` with repo-local portable JDK + Maven
 * (tools/jdk21, tools/apache-maven-3.9.6) when present.
 */
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pkgDir = path.join(__dirname, '..')
const root = path.join(pkgDir, '..', '..')
const jdk = path.join(root, 'tools', 'jdk21')
const mavenHome = path.join(root, 'tools', 'apache-maven-3.9.6')

const isWin = process.platform === 'win32'
const javaExe = path.join(jdk, 'bin', isWin ? 'java.exe' : 'java')
const mvnBin = path.join(mavenHome, 'bin', isWin ? 'mvn.cmd' : 'mvn')

if (!existsSync(javaExe)) {
  console.error(`[keycloakify] Missing portable JDK (expected ${javaExe}).`)
  console.error('Unpack Temurin 21 into tools/jdk21 or set JAVA_HOME to a JDK 21 install.')
  process.exit(1)
}
if (!existsSync(mvnBin)) {
  console.error(`[keycloakify] Missing portable Maven (expected ${mvnBin}).`)
  console.error(
    'Unpack Apache Maven 3.9.x into tools/apache-maven-3.9.6 or install Maven and add mvn to PATH.',
  )
  process.exit(1)
}

const env = {
  ...process.env,
  JAVA_HOME: jdk,
  MAVEN_HOME: mavenHome,
  PATH: [path.join(jdk, 'bin'), path.join(mavenHome, 'bin'), process.env.PATH]
    .filter(Boolean)
    .join(path.delimiter),
}

function run(cmd, args) {
  const r = spawnSync(cmd, args, {
    stdio: 'inherit',
    cwd: pkgDir,
    env,
    // Windows: Node cannot spawn `pnpm` when it is only a .cmd/shim on PATH (ENOENT without shell).
    shell: process.platform === 'win32',
  })
  if (r.error) {
    console.error(`[keycloakify] Failed to spawn ${cmd}: ${r.error.message}`)
    return 1
  }
  return r.status ?? 1
}

const skipJar = process.env.KEYCLOAK_THEME_SKIP_JAR === '1' || process.argv.includes('--skip-jar')

function keycloakifySupportsSkipJar() {
  try {
    const keycloakifyPkgJson = require.resolve('keycloakify/package.json')
    const mainJs = path.join(path.dirname(keycloakifyPkgJson), 'bin', 'main.js')
    return readFileSync(mainJs, 'utf8').includes('skip-jar')
  } catch {
    return false
  }
}

if (skipJar && !keycloakifySupportsSkipJar()) {
  console.error(
    '[keycloakify] --skip-jar is not supported by this keycloakify version. Re-run without skip-jar or upgrade keycloakify.',
  )
  process.exit(1)
}

let code = run('pnpm', ['run', 'build:app'])
if (code !== 0) process.exit(code)

const keycloakifyArgs = ['exec', 'keycloakify', 'build']
if (skipJar) keycloakifyArgs.push('--skip-jar')

code = run('pnpm', keycloakifyArgs)
process.exit(code ?? 0)
