const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("node:path");

// Standard Expo monorepo Metro setup. Without this Metro walks the workspace-root
// `node_modules` (including pnpm's deeply-nested `.pnpm/<hash>/node_modules/...`
// trees that exceed Windows MAX_PATH and trip `lstat: UNKNOWN` errors), and also
// fails to resolve hoisted workspace deps.
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [
  projectRoot,
  path.resolve(workspaceRoot, "packages/api-client"),
  path.resolve(workspaceRoot, "packages/types"),
  path.resolve(workspaceRoot, "packages/config")
];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules")
];

// Don't fall back through every parent dir's node_modules — pnpm hoists everything
// to the root, so the two paths above are sufficient and bound the file watcher.
config.resolver.disableHierarchicalLookup = true;

module.exports = withNativeWind(config, { input: "./global.css" });
