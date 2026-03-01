module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // Only include nativewind in non-test environments
    ...(process.env.NODE_ENV !== 'test' ? ['nativewind/babel'] : []),
    'react-native-reanimated/plugin',
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@': './src',
          '@components': './src/components',
          '@services': './src/services',
          '@utils': './src/utils',
          '@types': './src/types',
          '@config': './src/config',
        },
      },
    ],
  ],
};
