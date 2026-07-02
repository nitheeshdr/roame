module.exports = function (api) {
  api.cache(true);
  // babel-preset-expo (SDK 52) includes the Reanimated/worklets plugin automatically.
  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],
  };
};
