const config = require('./lib/config')
const defaultConfig = require('./lib/default-config')
const fs = require('fs')
const { chalk } = require('@vue/cli-shared-utils')
const portFinder = require('./lib/utils/portFinder')
const path = require('path')
const { isFunction } = require('./lib/utils/sharedTools')

module.exports = (api, options) => {
  // Config
  Object.assign(config, defaultConfig(api, options), options.pluginOptions && options.pluginOptions.ssr)

  config.api = api
  const service = config.service = api.service

  api.chainWebpack(webpackConfig => {
    // Default entry
    if (!process.env.VUE_CLI_SSR_TARGET) {
      webpackConfig.entry('app').clear().add(config.entry('client'))
    } else {
      const { chainWebpack } = require('./lib/webpack')
      chainWebpack(webpackConfig)
    }
  })

  api.registerCommand('ssr:build', {
    description: 'build for production (SSR)',
    usage: 'vue-cli-service ssr:build [options]',
    options: {
      '--modern': 'modern mode',
    },
  }, async (args) => {
    const rimraf = require('rimraf')
    const modernMode = args.modern

    if (modernMode) {
      process.env.VUE_CLI_MODERN_MODE = true
    }

    rimraf.sync(api.resolve(config.distPath))

    const { getWebpackConfigs } = require('./lib/webpack')

    const compile = ({ webpackConfigs, watch, service }) => {
      if (modernMode) {
        Object.keys(require.cache)
          .filter(key => key.includes('@vue/cli-plugin-babel'))
          .forEach(key => delete require.cache[key])
      }

      const webpack = require('webpack')
      const formatStats = require('@vue/cli-service/lib/commands/build/formatStats')

      const options = service.projectOptions

      const compiler = webpack(webpackConfigs)
      return new Promise((resolve) => {
        const onCompilationComplete = (err, stats) => {
          if (err) {
            // eslint-disable-next-line
            console.error(err.stack || err)
            if (err.details) {
              // eslint-disable-next-line
              console.error(err.details)
            }
            return resolve()
          }

          if (stats.hasErrors()) {
            stats.toJson().errors.forEach(err => console.error(err))
            process.exitCode = 1
          }

          if (stats.hasWarnings()) {
            stats.toJson().warnings.forEach(warn => console.warn(warn))
          }

          try {
            // eslint-disable-next-line
            console.log(formatStats(stats, options.outputDir, api));
          } catch (e) {
          }
          resolve()
        }

        if (watch) {
          compiler.watch({}, onCompilationComplete)
        } else {
          compiler.run(onCompilationComplete)
        }
      })
    }

    if (modernMode) {
      const { clientConfigLegacy, clientConfigModern, serverConfig } = getWebpackConfigs(service, true)
      await compile({ webpackConfigs: [clientConfigLegacy, serverConfig], watch: args.watch, service })
      await compile({ webpackConfigs: [clientConfigModern], watch: args.watch, service })
    } else {
      const { clientConfig, serverConfig } = getWebpackConfigs(service)
      await compile({ webpackConfigs: [clientConfig, serverConfig], watch: args.watch, service })
    }
  })

  api.registerCommand('ssr:serve', {
    description: 'Run the included server.',
    usage: 'vue-cli-service ssr:serve [options]',
    options: {
      '-p, --port [port]': 'specify port',
      '-h, --host [host]': 'specify host',
      '-s, --server [path]': 'specify server file path',
      '-c, --config [path]': 'specify config file path',
      '-m, --mode [mode]': 'specify mode production/development',
    },
  }, async (args) => {
    const rootPath = api.getCwd()
    let serverInstance = null
    let userConfig = null

    const argsServer = args.server || args.s
    const argsConfig = args.config || args.c
    const argsPort = args.port || args.p
    const argsHost = args.host || args.h
    const argsMode = args.mode || args.m

    if (argsMode && argsMode === 'production') {
      process.env.NODE_ENV = 'production'
    } else {
      process.env.NODE_ENV = 'development'
    }

    if (config.service && config.service.projectOptions && config.service.projectOptions.pluginOptions && config.service.projectOptions.pluginOptions.vssr) {
      userConfig = config.service.projectOptions.pluginOptions.vssr
    }

    if (argsConfig) {
      const fullPath = path.resolve(rootPath, `${argsConfig}`)
      if (!fs.existsSync(fullPath)) {
        console.error(`${chalk.yellow('[WARN]')}: no config file found, use plugin config !!!`)
      } else {
        const importedConf = require(fullPath)
        userConfig = isFunction(importedConf) ? importedConf(rootPath) : importedConf

        // delete service and api from custom user config
        // we need use cli service and api
        delete userConfig.service
        delete userConfig.api
      }
    }

    let usedPort = argsPort || config.port || process.env.PORT
    if (!usedPort) {
      usedPort = await portFinder()
    }

    const usedHost = argsHost || config.host || process.env.HOST || 'localhost'

    const currentConfig = Object.assign(config, userConfig)

    currentConfig.rootPath = rootPath
    currentConfig.mode = process.env.NODE_ENV
    currentConfig.port = usedPort
    currentConfig.host = usedHost

    if (argsServer) {
      const useServer = require('./lib/core/useServer')
      try {
        const serverPath = path.resolve(rootPath, `${argsServer}`)
        serverInstance = useServer(serverPath, currentConfig)
      } catch (error) {
        console.error(error.message)
        console.error('Fallback to builtIns server')
      }
    }
    if (!serverInstance) {
      const Server = require('./lib/core/builtInsServer')
      serverInstance = new Server({
        config: currentConfig,
      })
    }

    return serverInstance.runServer()
  })
}

module.exports.defaultModes = {
  'ssr:build': 'production',
  'ssr:serve': 'development',
}
