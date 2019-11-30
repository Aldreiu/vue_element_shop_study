module.exports = {
  root: true,
  env: {
    node: true
  },
  'extends': [
    'plugin:vue/essential',
    '@vue/standard'
  ],
  rules: {
    'no-console': 'off',
    'no-debugger': 'off',
    'vue/no-unused-vars': 'warning',
    'vue/no-unused-components': 'warning'
  },
  parserOptions: {
    parser: 'babel-eslint'
  }
}
