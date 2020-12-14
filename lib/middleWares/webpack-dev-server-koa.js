const devMiddleware = require('webpack-dev-middleware')
module.exports = (compiler, opts) => {
  const middleware = devMiddleware(compiler, opts)
  let nextFlag = false
  const nextFn = () => {
    nextFlag = true
  }
  const koaMiddleware = async (ctx, next) => {
    middleware(
      ctx.req,
      {
        end: content => (ctx.body = content),
        send: content => (ctx.body = content),
        setHeader: (name, value) => {
          ctx.set(name, value)
        },
      },
      nextFn,
    )
    if (nextFlag) {
      nextFlag = false
      await next()
    }
  }

  Object.keys(middleware).forEach(p => {
    koaMiddleware[p] = middleware[p]
  })
  koaMiddleware.fileSystem = middleware.fileSystem
  return koaMiddleware
}
