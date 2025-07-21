// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

// Add this to work around the issue
defaultConfig.resolver.sourceExts.push('cjs');

// Use the legacy resolver
defaultConfig.transformer = {
  ...defaultConfig.transformer,
  assetPlugins: ['expo-asset/tools/hashAssetFiles'],
  babelTransformerPath: require.resolve('react-native/scripts/react-native-babel-transformer'),
};

module.exports = defaultConfig;