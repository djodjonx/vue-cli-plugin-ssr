const statics = require('../middleWares/statics')
const favicon = require('../middleWares/favicon')
const compress = require('../middleWares/compress')
const cors = require('../middleWares/cors')
const logger = require('../middleWares/logger')
const { hasProperty, isObject } = require('../utils/sharedTools')

function isValidConfig (parameter) {
  return typeof parameter === 'boolean' ||
    parameter === undefined ||
    parameter === null ||
    hasProperty(parameter, 'active') ||
    hasProperty(parameter, 'options') ||
    (isObject(parameter))
}

function getMiddlewaresConfig (configs) {
  const MIDDLEWARE_LIST = ['static', 'cors', 'compress', 'logger']
  const errors = []
  const normalizeConfig = {}
  MIDDLEWARE_LIST.forEach(entry => {
    normalizeConfig[entry] = null
  })

  for (const param of Object.keys(configs)) {
    if (MIDDLEWARE_LIST.includes(param)) {
      if (isValidConfig(configs[param])) {
        normalizeConfig[param] = {
          active: !!configs[param],
          options: {},
        }
      }
      if (hasProperty(configs[param], 'options') || isObject(configs[param])) {
        normalizeConfig[param].options = hasProperty(configs[param], 'options') ? configs[param].options : configs[param]
      }
    }

    if (!normalizeConfig[param]) {
      errors.push(`Can't define middleware options for ${param}`)
    }
  }
  if (errors.length) {
    throw new Error(errors.join('\n'))
  } else {
    return normalizeConfig
  }
}

module.exports = (config) => {
  try {
    const normalizedConfig = getMiddlewaresConfig(config.middlewares)
    const middleWares = [
      favicon(config.favicon),
    ]

    if (normalizedConfig.logger.active) {
      middleWares.push(logger(normalizedConfig.logger.options))
    }

    if (normalizedConfig.static.active) {
      const staticDist = statics(config.distPath, normalizedConfig.static.options)
      const staticMiddleware = async (ctx, next) => {
        const STATIC_MATCH = /\.(json|js|css|woff|eot|woff2|ttf|svg|png|jpg|jpeg|gif|ico|txt)+/g
        if (!STATIC_MATCH.test(ctx.url)) {
          await next()
        } else {
          ctx.compress = true
          ctx.isStatic = true
          return staticDist(ctx, next)
        }
      }
      middleWares.push(staticMiddleware)
    }

    if (normalizedConfig.compress.active) {
      middleWares.push(compress(normalizedConfig.compress.options))
    }

    if (config.modernMode || normalizedConfig.cors.active) {
      middleWares.push(cors(normalizedConfig.cors.options))
    }

    if (config.api && config.api.hasPlugin('pwa')) {
      middleWares.push(statics({ filePath: config.serviceWorkerPath }))
    }

    return middleWares
  } catch (error) {
    console.error(error)
    throw new Error(error.message)
  }
}
