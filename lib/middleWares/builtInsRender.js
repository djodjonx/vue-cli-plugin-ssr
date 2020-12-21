const fs = require('fs')
const Router = require('@koa/router')
const LRU = require('lru-cache')
const { hasProperty, isBoolean, isFunction, isArray } = require('../utils/sharedTools')

const isCacheable = (url, config) => {
  // if true cache all pages
  if (isBoolean(config.pageCache)) {
    return true
  }
  if (hasProperty(config.pageCache, 'cacheUrls')) {
    if (isFunction(config.pageCache.cacheUrls) && config.pageCache.cacheUrls(url)) {
      return true
    }
    if (isArray(config.pageCache.cacheUrls) && config.pageCache.cacheUrls.includes(url)) {
      return true
    }
  }
  return false
}

const BASE_CACHE_CONFIG = {
  max: 100,
  maxAge: 1000 * 60 * 60,
}
module.exports = (renderer, config) => {
  const isProd = config.mode ? config.mode === 'production' : process.env.NODE_ENV === 'production'
  const router = new Router()

  const optionsCache = Object.assign(BASE_CACHE_CONFIG, hasProperty(config.pageCache, 'options') && config.pageCache.options)

  const cacheActive = (isBoolean(config.pageCache) && config.pageCache) || (hasProperty(config.pageCache, 'active') && config.pageCache.active)
  const microCache = cacheActive ? new LRU(optionsCache) : null

  if (config.extendRouter && config.extendRouter.length) {
    if (isArray(config.extendRouter)) {
      config.customsRoutes.forEach(route => {
        router[route.method](route.path, route.action)
      })
    } else {
      console.error('extendRouter must be an array of routes, (ex: {method: get, path: \'/something\', action: (ctx) => doSomthing(ctx)})')
    }
  }

  const ssrRoute = config.customSsrPath || /.*/

  router.get(ssrRoute, async (ctx, next) => {
    if (ctx.isStatic) {
      await next()
      return
    }

    let cacheable
    try {
      cacheable = isProd && cacheActive && isCacheable(ctx.url, config)
    } catch (error) {
      console.error(error)
    }
    if (config.skipRequests(ctx)) {
      await next()
    }

    if (cacheable) {
      const html = microCache.get(ctx.url)
      if (html) {
        ctx.set('X-Cache', 'hit')
        ctx.body = html
        await next()
        return
      }
    }

    try {
      let html = await renderer.renderToString(ctx)
      if (!config.fullControlRender) {
        html = html.replace(/<script src="[^"]+" defer><\/script>/g, '')
      }

      if (cacheable) {
        microCache.set(ctx.url, html)
      }

      ctx.set('Content-Type', 'text/html')
      ctx.status = 200
      ctx.body = html

      if (config.onRender && isFunction(config.onRender)) {
        const mode = isProd ? 'production' : 'development'
        ctx.body = config.onRender(html, mode)
      }

      if (config.onBeforeSend && isFunction(config.onBeforeSend)) {
        config.onBeforeSend(ctx, process)
      }
      await next()
    } catch (error) {
      console.error(`error during render url : ${ctx.url}`)
      console.error(error)

      // Render Error Page
      let errorHtml = config.error500Html
        ? fs.readFileSync(config.error500Html, 'utf-8')
        : '500 | Internal Server Error'

      if (!isProd) {
        const errorMessage = `<pre>${error.stack}</pre>`
        config.error500Html
          ? errorHtml = errorHtml.replace('<!--server-error-msg-->', errorMessage)
          : errorHtml += errorMessage
      }

      if (config.onError) {
        config.onError(error)
      }

      ctx.status = 500
      ctx.body = errorHtml
    }
  })
  return router
}
