const ModernModePlugin = require('@vue/cli-service/lib/webpack/ModernModePlugin')

module.exports = (webpackConfig, { modernBuild }) => {
  const targetDir = webpackConfig.output.get('path')
  if (!modernBuild) {
    webpackConfig.plugin('modern-mode-legacy').use(ModernModePlugin, [{
      isModernBuild: false,
      targetDir,
    }])

    // Edit webpack bars defined on commons.js
    webpackConfig.plugin('loader').tap(args => {
      args[0].name = 'Client (legacy)'
      args[0].color = '#2ECC71'
      return args
    })
  } else {
    webpackConfig.plugin('modern-mode-modern').use(ModernModePlugin, [{
      isModernBuild: true,
      targetDir,
      jsDirectory: 'js',
    }])

    // Edit webpack bars defined on commons.js
    webpackConfig.plugin('loader').tap(args => {
      args[0].name = 'Client (modern)'
      args[0].color = '#F8F409'
      return args
    })
  }

  // remove cache-loader causing issue

  const jsRules = webpackConfig.module.rules.get('js')

  if (jsRules) {
    const cacheRule = jsRules.uses.get('cache-loader')
    if (cacheRule) {
      jsRules.uses.delete('cache-loader')
    }
  }
}
