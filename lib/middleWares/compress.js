const koaCompress = require('koa-compress')

const BASE_COMPRESS_OPTIONS = {
  br: false,
}

module.exports = (koaCompressOptions) => {
  const options = Object.assign(BASE_COMPRESS_OPTIONS, koaCompressOptions)
  return koaCompress(options)
}
