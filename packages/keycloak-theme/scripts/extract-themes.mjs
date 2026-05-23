import fs from 'node:fs'
import path from 'node:path'
import AdmZip from 'adm-zip'

const projectDir = path.resolve(import.meta.dirname, '..')
const distDir = path.join(projectDir, 'dist_keycloak')
const defaultOutThemesDir = path.resolve(projectDir, '..', '..', 'infra', 'keycloak', 'themes')
const outThemesDir = process.env.KEYCLOAK_THEME_OUTPUT_DIR?.trim()
  ? path.resolve(process.env.KEYCLOAK_THEME_OUTPUT_DIR.trim())
  : defaultOutThemesDir

function ensureEmptyDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true })
}

function upsertThemeProperties(themePropertiesPath) {
  const content = [
    'parent=keycloak.v2',
    // keep common resources available
    'import=common/keycloak',
    '',
  ].join('\n')
  fs.mkdirSync(path.dirname(themePropertiesPath), { recursive: true })
  fs.writeFileSync(themePropertiesPath, Buffer.from(content, 'utf8'))
}

function ensureEmailTheme(themeNameDir) {
  // Minimal email theme: inherit everything from keycloak.v2
  const emailDir = path.join(themeNameDir, 'email')
  upsertThemeProperties(path.join(emailDir, 'theme.properties'))
}

function enforceParents(themesRootDir) {
  if (!fs.existsSync(themesRootDir)) return
  for (const themeName of fs.readdirSync(themesRootDir)) {
    const themeNameDir = path.join(themesRootDir, themeName)
    if (!fs.statSync(themeNameDir).isDirectory()) continue

    for (const themeType of ['login', 'account']) {
      const themeTypeDir = path.join(themeNameDir, themeType)
      if (!fs.existsSync(themeTypeDir)) continue
      upsertThemeProperties(path.join(themeTypeDir, 'theme.properties'))
    }

    ensureEmailTheme(themeNameDir)
  }
}

function pruneUnwantedThemes(themesRootDir) {
  if (!fs.existsSync(themesRootDir)) return
  for (const entry of fs.readdirSync(themesRootDir)) {
    if (entry === '.gitkeep') continue
    if (entry.startsWith('fullstack-')) continue

    const entryPath = path.join(themesRootDir, entry)
    fs.rmSync(entryPath, { recursive: true, force: true })
  }
}

function copyDir(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return
  fs.mkdirSync(destDir, { recursive: true })
  for (const name of fs.readdirSync(srcDir)) {
    const srcPath = path.join(srcDir, name)
    const destPath = path.join(destDir, name)
    const stat = fs.statSync(srcPath)
    if (stat.isDirectory()) {
      copyDir(srcPath, destPath)
    } else if (stat.isFile()) {
      fs.mkdirSync(path.dirname(destPath), { recursive: true })
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

function listJarFiles(dirPath) {
  if (!fs.existsSync(dirPath)) return []
  return fs
    .readdirSync(dirPath)
    .filter((name) => name.toLowerCase().endsWith('.jar'))
    .map((name) => path.join(dirPath, name))
}

function extractThemesFromJar(jarPath) {
  const zip = new AdmZip(jarPath)
  const entries = zip.getEntries()

  const themeEntries = entries.filter((e) => {
    const p = e.entryName.replaceAll('\\', '/')
    return p.startsWith('theme/') && !p.endsWith('/')
  })

  if (themeEntries.length === 0) {
    throw new Error(`No theme/ entries found in jar: ${jarPath}`)
  }

  for (const entry of themeEntries) {
    const rel = entry.entryName.replaceAll('\\', '/').slice('theme/'.length)
    const destPath = path.join(outThemesDir, rel)
    fs.mkdirSync(path.dirname(destPath), { recursive: true })
    fs.writeFileSync(destPath, entry.getData())
  }
}

ensureEmptyDir(outThemesDir)

const jarFiles = listJarFiles(distDir)

if (jarFiles.length > 0) {
  // If multiple jars exist, extract all (last write wins for overlaps).
  for (const jarPath of jarFiles) {
    extractThemesFromJar(jarPath)
  }
} else {
  // When `doCreateJar: false`, Keycloakify leaves the theme as plain files in dist_keycloak/theme
  const themeDir = path.join(distDir, 'theme')
  if (!fs.existsSync(themeDir)) {
    throw new Error(
      `No .jar found in ${distDir} and no theme dir at ${themeDir}. Run "pnpm run build:kc" first.`,
    )
  }
  copyDir(themeDir, outThemesDir)
}

enforceParents(outThemesDir)
pruneUnwantedThemes(outThemesDir)

console.log(`Extracted Keycloak themes into: ${outThemesDir}`)
