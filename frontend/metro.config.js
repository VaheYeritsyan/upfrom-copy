/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */
const exclusionList = require('metro-config/src/defaults/exclusionList');
const { getMetroTools, getMetroAndroidAssetsResolutionFix } = require('react-native-monorepo-tools');
// * This package allows us to take advantage of yarn workspaces and watch files outside the native folder directory
// * https://mmazzarolo.com/blog/2021-09-18-running-react-native-everywhere-mobile/
const androidAssetsResolutionFix = getMetroAndroidAssetsResolutionFix();

const monorepoMetroTools = getMetroTools();

// Add admin_portal to the blockList
const blockList = [
  ...monorepoMetroTools.blockList,
  /^(?!.*node_modules).*\/admin_portal\/.*$/,
];

module.exports = {
  transformer: {
    publicPath: androidAssetsResolutionFix.publicPath,
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  server: {
    enhanceMiddleware: middleware => {
      return androidAssetsResolutionFix.applyMiddleware(middleware);
    },
  },
  // Add additional Yarn workspace package roots to the module map.
  // This allows importing importing from all the project's packages.
  watchFolders: monorepoMetroTools.watchFolders,
  resolver: {
    // Ensure we resolve nohoist libraries from this directory.
    blockList: exclusionList(blockList),
    extraNodeModules: monorepoMetroTools.extraNodeModules,
  },
};
