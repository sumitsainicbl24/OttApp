const ReactCompilerConfig = {
  target: '19',
};

module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [[
    'babel-plugin-react-compiler', ReactCompilerConfig
  ]],
};
