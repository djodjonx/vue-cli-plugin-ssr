const config = require('../config')
const clientConf = require('./rules/client')
const commonsConf = require('./rules/commons')
const serverConf = require('./rules/server')
const modernConf = require('./rules/modern')

exports.chainWebpack = (webpackConfig) => {
  const target = process.env.VUE_CLI_SSR_TARGET
  if (!target) return
  const isClient = target === 'client'
  const isProd = process.env.NODE_ENV === 'production'
  const modernMode = !!process.env.VUE_CLI_MODERN_MODE
  const modernBuild = !!process.env.VUE_CLI_MODERN_BUILD

  commonsConf(webpackConfig, { isProd, config, target })

  if (isClient) {
    clientConf(webpackConfig, { isProd })
    if (modernMode) {
      modernConf(webpackConfig, { modernBuild })
    }
  } else {
    serverConf(webpackConfig, { config })
  }
}

exports.getWebpackConfigs = (service, modernMode = false) => {
  let clientConfigModern = null
  let clientConfigLegacy = null
  let clientConfig = null
  process.env.VUE_CLI_MODE = service.mode
  process.env.VUE_CLI_SSR_TARGET = 'client'
  delete process.env.VUE_CLI_MODERN_MODE
  delete process.env.VUE_CLI_MODERN_BUILD
  if (modernMode) {
    delete process.env.VUE_CLI_MODERN_BUILD
    process.env.VUE_CLI_MODERN_MODE = true
    clientConfigLegacy = service.resolveWebpackConfig()
    process.env.VUE_CLI_MODERN_BUILD = true
    clientConfigModern = service.resolveWebpackConfig()
    delete process.env.VUE_CLI_MODERN_MODE
    delete process.env.VUE_CLI_MODERN_BUILD
  } else {
    clientConfig = service.resolveWebpackConfig()
  }
  process.env.VUE_CLI_SSR_TARGET = 'server'
  const serverConfig = service.resolveWebpackConfig()
  return { clientConfigModern, clientConfigLegacy, clientConfig, serverConfig }
}
