const koaFavicon = require('koa-favicon')
const {
  favicon,
} = require('../config')

module.exports = (path) => {
  return koaFavicon(path || favicon)
}
