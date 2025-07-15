const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configuration personnalisée
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    keep_fnames: true,
    mangle: {
      keep_fnames: true,
    },
  },
};

config.resolver = {
  ...config.resolver,
  assetExts: [...config.resolver.assetExts, 'db'],
};

module.exports = config;