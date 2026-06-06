// babel.config.js
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    ['module-resolver', {
      root: ['.'],
      alias: {
        '@screens':    './src/screens',
        '@components': './src/components',
        '@utils':      './src/utils',
        '@hooks':      './src/hooks',
        '@assets':     './src/assets',
        '@store':      './src/store',
      },
    }],
    'react-native-reanimated/plugin',
  ],
};
