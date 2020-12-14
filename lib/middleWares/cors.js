const cors = require('@koa/cors')

const BASE_CORS_OPTIONS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
}

module.exports = (koaCorsOptions) => {
  const options = Object.assign(BASE_CORS_OPTIONS, koaCorsOptions)
  return cors(options)
}
