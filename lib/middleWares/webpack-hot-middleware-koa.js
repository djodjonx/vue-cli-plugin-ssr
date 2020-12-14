const hotMiddleware = require('webpack-hot-middleware')
const PassThrough = require('stream').PassThrough

module.exports = (compiler, opts) => {
  const middleware = hotMiddleware(compiler, opts)

  const koaMiddleware = async (ctx, next) => {
    const stream = new PassThrough()
    let nextFlag = false
    const nextFn = () => {
      nextFlag = true
    }
    ctx.body = stream
    ctx.compress = false
    middleware(
      ctx.req,
      {
        end: () => {
          stream.end()
        },
        setHeader: (name, value) => {
          ctx.set(name, value)
        },
        write: stream.write.bind(stream),
        writeHead: (status, headers) => {
          ctx.status = status
          Object.keys(headers).forEach(key => {
            ctx.set(key, headers[key])
          })
        },
      },
      nextFn,
    )

    if (nextFlag) {
      nextFlag = false
      await next()
    }
  }

  return koaMiddleware
}
