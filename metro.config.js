const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const {
  resolver: { assetExts },
} = config;

config.resolver.assetExts = [...assetExts, 'bin', 'db'];

module.exports = config;
