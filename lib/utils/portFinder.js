const portfinder = require('portfinder')

module.exports = async () => {
  return await portfinder.getPortPromise()
}
