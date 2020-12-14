const koaStatic = require('koa-static')

const BASE_STATIC_OPTIONS = {
  maxAge: 1000 * 60 * 60 * 24 * 30,
  index: false,
  gzip: true,
}

module.exports = (filePath, koaStaticOptions) => {
  const options = Object.assign(BASE_STATIC_OPTIONS, koaStaticOptions)
  return koaStatic(filePath, options)
}
