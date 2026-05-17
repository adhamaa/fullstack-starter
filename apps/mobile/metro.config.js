const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro')
const { resolve } = require('metro-resolver')
const path = require('node:path')

const projectRoot = __dirname
const workspaceRoot = path.resolve(projectRoot, '../..')

const config = getDefaultConfig(projectRoot)

function packageRoot(name) {
  return path.dirname(require.resolve(`${name}/package.json`))
}

const linkedPackages = [
  'expo-router',
  '@expo/metro-runtime',
  'expo',
  'react',
  'react-dom',
  'react-native',
  'react-native-web',
  'react-native-css-interop',
  'react-native-reanimated',
  'react-native-safe-area-context',
  'react-native-screens',
]

config.watchFolders = [
  projectRoot,
  // Required so Metro can SHA-1 pnpm store paths resolved below.
  path.resolve(workspaceRoot, 'node_modules'),
  ...linkedPackages.map(packageRoot),
  path.resolve(workspaceRoot, 'packages/api-client'),
  path.resolve(workspaceRoot, 'packages/identity-session'),
  path.resolve(workspaceRoot, 'packages/types'),
  path.resolve(workspaceRoot, 'packages/config'),
]

config.resolver.blockList = [...(config.resolver.blockList ?? []), /[/\\]infra[/\\].*/]

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
]

config.resolver.disableHierarchicalLookup = true

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  ...Object.fromEntries(linkedPackages.map((name) => [name, packageRoot(name)])),
}

const finalConfig = withNativeWind(config, { input: './global.css' })

const resolveRoots = [
  projectRoot,
  path.resolve(projectRoot, 'node_modules'),
  workspaceRoot,
  path.resolve(workspaceRoot, 'node_modules'),
]

const upstreamResolveRequest = finalConfig.resolver.resolveRequest
finalConfig.resolver.resolveRequest = (context, moduleName, platform) => {
  if (upstreamResolveRequest) {
    try {
      const result = upstreamResolveRequest(context, moduleName, platform)
      if (result != null) return result
    } catch {
      // fall through
    }
  }

  let metroError
  try {
    return resolve(context, moduleName, platform)
  } catch (error) {
    metroError = error
  }

  try {
    const filePath = require.resolve(moduleName, {
      paths: [path.dirname(context.originModulePath), ...resolveRoots],
    })
    return { type: 'sourceFile', filePath }
  } catch (nodeError) {
    const origin = context.originModulePath ?? '(unknown)'
    const metroMessage = metroError instanceof Error ? metroError.message : String(metroError)
    const nodeMessage = nodeError instanceof Error ? nodeError.message : String(nodeError)
    throw new Error(
      `Unable to resolve module "${moduleName}" from "${origin}"\n` +
        `  metro-resolver: ${metroMessage}\n` +
        `  require.resolve: ${nodeMessage}`,
      { cause: metroError ?? nodeError },
    )
  }
}

module.exports = finalConfig
