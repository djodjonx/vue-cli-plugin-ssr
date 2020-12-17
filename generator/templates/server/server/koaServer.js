const Koa = require('koa')
const { chalk } = require('@vue/cli-shared-utils')
<%_ if (!useVssr) { _%>
const Router = require('koa-router')
const Builder = require('vue-cli-plugin-vssr/lib/core/builder')
<%_ } _%>
<%_ if (useVssr) { _%>
const vSsr = require('vue-cli-plugin-vssr/lib/core/vssr')
<%_ } _%>
<%_ if (useModernMode && !useVssr) { _%>
const cors = require('vue-cli-plugin-vssr/lib/middlewares/cors')
<%_ } _%>

function createServer (config) {
  const app = new Koa()
  <%_ if (!useVssr) { _%>
  const isProd = config.mode ? config.mode === 'production' || process.env.NODE_ENV === 'production'
  const router = new Router()
  const Builder = new Builder({ config, serve: app}, isProd)
  <%_ } _%>
  const port = config.port || process.env.SERVER_PORT || 3000
  const host = config.host || process.env.SERVER_HOST || 'localhost'

  config.port = port
  config.host = host

  <%_ if (!useVssr) { _%>
  router.get('.*', async (ctx) => {
    const context = Object.assign({
      req: ctx.request,
      url: ctx.url,
      title: config.defaultTitle,
    })

    try {
      let html = await builder.renderToString(context)
      ctx.set('type', 'text/html')
      ctx.status = 200
      ctx.body = html
      await next()
    } catch (error) {
      ctx.status = 500
      ctx.body = error
      console.error(error)
    }
  })

  app.use(router.routes())
    .use(router.allowedMethods())
  <%_ } _%>
  <%_ if (useModernMode && !useVssr) { _%>
  app.use(cors())
  <%_ } _%>
  <%_ if (useVssr) { _%>
  vSsr(app, config)
  <%_ } _%>

  function runServer () {
    app.listen(
      port,
      host,
      () => {
        let copied = ''
        const url = `${host}:${port}`
        if (config.copyUrlOnStart) {
          require('clipboardy').write(url)
          copied = chalk.dim('(copied to clipboard)')
        }
        console.info(`[info] Server SSR is running on ${chalk.cyan(url)} ${copied}}`)
      }
    )
  }

  return {
    runServer,
    app
  }
}

module.exports = createServer
