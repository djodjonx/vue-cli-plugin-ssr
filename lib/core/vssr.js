const Builder = require('./builder')
const middlewares = require('./middlewares')
const renderMiddleware = require('../middleWares/builtInsRender')
const configNormalizer = require('../utils/configNormalizer')

module.exports = (app, config) => {
  const isProd = config.mode ? config.mode === 'production' : process.env.NODE_ENV === 'production'
  try {
    // normalize config parameters before used,
    // because parameters can come from ENV and will be string

    const normalizedConf = configNormalizer(config)

    const ssrBuilder = new Builder({ config: normalizedConf, server: app }, isProd)

    const koaMiddlewares = middlewares(normalizedConf)

    koaMiddlewares.forEach(middleware => app.use(middleware))

    const ssrMiddleware = renderMiddleware(ssrBuilder, normalizedConf)

    app.use(ssrMiddleware.routes()).use(ssrMiddleware.allowedMethods())
    return app
  } catch (error) {
    console.error(error)
  }
}
