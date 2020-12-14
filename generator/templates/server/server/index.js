const createServer = require('./koaServer')
const config = require('./config')

const server = createServer(config())

if (config.clustered) {
  const clusterer = require('vue-cli-plugin-vSsr/lib/core/clusterer')
  clusterer(server.runServer, config.maxCluster)
} else {
  server.runServer()
}