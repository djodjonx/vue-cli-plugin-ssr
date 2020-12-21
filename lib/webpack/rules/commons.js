const HtmlFilterPlugin = require('../plugins/HtmlFilterPlugin')
const WebpackBar = require('webpackbar')

module.exports = (webpackConfig, { isProd, config, target }) => {
  webpackConfig.plugins.delete('hmr')
  webpackConfig.plugins.delete('preload')
  webpackConfig.plugins.delete('prefetch')
  webpackConfig.plugins.delete('progress')
  if (!isProd) webpackConfig.plugins.delete('no-emit-on-errors')

  webpackConfig.plugin('html-filter').use(HtmlFilterPlugin)
  if (isProd) {
    webpackConfig.plugin('html').tap(args => {
      args[0].minify.removeComments = false
      args[0].minify.caseSensitive = true
      return args
    })
  }

  const htmlPlugin = webpackConfig.plugins.get('html').store
  webpackConfig.plugin('html-ssr').use(htmlPlugin.get('plugin'), [
    {
      ...htmlPlugin.get('args')[0],
      template: config.api.resolve('public/index.ssr.html'),
      filename: 'index.ssr.html',
    },
  ])

  webpackConfig.entry('app').clear().add(config.entry(target))

  webpackConfig.plugin('define').tap(args => {
    return [Object.assign(args[0], { 'process.client': target === 'client', 'process.server': target === 'server' })]
  })

  webpackConfig.stats(isProd ? 'normal' : 'none')
  webpackConfig.devServer.stats('errors-only').quiet(true).noInfo(true)
  webpackConfig.plugin('loader').use(WebpackBar, [{ name: 'Client', color: '#17EB06' }])
}
