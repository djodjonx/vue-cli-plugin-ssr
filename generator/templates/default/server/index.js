require('dotenv').config()
const Koa = require('koa')
<%_ if (!useVssr) { _%>
  const Router = require('koa-router')
<%_ } _%>
<%_ if (useVssr) { _%>
  const vSsr = require('./vSsr/core/v-ssr')
<%_ } _%>
<%_ if (!useModernMode) { _%>
  const cors = require('@koa/cors')
<%_ } _%>

<%_ if (!useVssr) { _%>
  const router = new Router()
<%_ } _%>

const app = new Koa()
const port = process.env.SERVER_PORT || 3000

<%_ if (!useVssr) { _%>
  router.get('.*', async (ctx) => {
    const context = Object.assign({
      req: ctx.request,
      url: ctx.url,
      title: config.defaultTitle,
    })

    try {
      let html = await renderer.renderToString(context)
      ctx.set('type', 'text/html')
      ctx.status = 200
      ctx.body = html
    } catch (error) {
      console.error(error)
      throw error
    }
  })

  app.use(router.routes())
    .use(router.allowedMethods())
<%_ } _%>

<%_ if (!useModernMode) { _%>
  app.use(cors({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true
  }))
<%_ } _%>

<%_ if (useVssr) { _%>
  vSsr(app)
<%_ } _%>

app.listen(port, () => console.info(`[info] Server SSR is running on ${port}`))
