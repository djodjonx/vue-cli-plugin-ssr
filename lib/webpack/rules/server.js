
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin')
const nodeExternals = require('webpack-node-externals')
const CssContextLoader = require.resolve('../loaders/css-context')

module.exports = (webpackConfig, { config }) => {
  webpackConfig.plugins.delete('friendly-errors')

  const babelConf = webpackConfig.module.rule('js').uses.get('babel-loader')

  babelConf.tap(options => {
    options = options || {}
    options.presets = [[
      '@vue/cli-plugin-babel/preset',
      {
        useBuiltIns: 'entry',
      },
    ]]
    return options
  })

  const isExtracting = webpackConfig.plugins.has('extract-css')
  if (isExtracting && config.criticalCSS) {
    // Remove extract
    const langs = ['css', 'postcss', 'scss', 'sass', 'less', 'stylus']
    const types = ['vue-modules', 'vue', 'normal-modules', 'normal']
    for (const lang of langs) {
      for (const type of types) {
        const rule = webpackConfig.module.rule(lang).oneOf(type)
        rule.uses.delete('extract-css-loader')
        // Critical CSS
        rule.use('css-context').loader(CssContextLoader).before('css-loader')
      }
    }
    webpackConfig.plugins.delete('extract-css')
  }
  webpackConfig.plugin('ssr').use(VueSSRServerPlugin)

  webpackConfig.devtool('source-map')
  webpackConfig.externals(nodeExternals({ whitelist: config.nodeExternalsWhitelist }))
  webpackConfig.output.libraryTarget('commonjs2'); webpackConfig.target('node')
  webpackConfig.optimization.splitChunks(false).minimize(false)

  webpackConfig.node.clear()

  webpackConfig.module.rule('vue').use('cache-loader').tap(options => {
    // Change cache directory for server-side
    options.cacheIdentifier += '-server'
    options.cacheDirectory += '-server'
    return options
  })

  webpackConfig.module.rule('vue').use('vue-loader').tap(options => {
    options.cacheIdentifier += '-server'
    options.cacheDirectory += '-server'
    options.optimizeSSR = true
    return options
  })

  // Edit webpack bars defined on commons.js
  webpackConfig.plugin('loader').tap(args => {
    args[0].name = 'Server'
    args[0].color = '#09D4F8'
    return args
  })
}
