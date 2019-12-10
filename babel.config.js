// 项目发布阶段需要用到的 babel插件
const prodPlugins = []
if (process.env.NODE_ENV === 'production') {
  prodPlugins.push('transform-remove-console')
}

module.exports = {
  'presets': [
    '@vue/cli-plugin-babel/preset'
  ],
  'plugins': [
    [
      'component',
      {
        'libraryName': 'element-ui',
        'styleLibraryName': 'theme-chalk'
      }
    ],
    // 发布  bulid  时候的插件数组  开发阶段不会移除这个祛除console
    ...prodPlugins,
    // 路由懒加载
    '@babel/plugin-syntax-dynamic-import'
  ]
}
