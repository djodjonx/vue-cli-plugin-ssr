const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')

module.exports = (webpackConfig, { isProd }) => {
  webpackConfig.plugins.delete('friendly-errors')

  webpackConfig.plugin('ssr').use(VueSSRClientPlugin)

  webpackConfig.devtool(!isProd ? '#cheap-module-source-map' : undefined)

  webpackConfig.module.rule('vue').use('vue-loader').tap(options => {
    options.optimizeSSR = false
    return options
  })

  // Edit webpack bars defined on commons.js
  webpackConfig.plugin('loader').tap(args => {
    args[0].name = 'Client'
    args[0].color = '#17EB06'
    return args
  })
}
