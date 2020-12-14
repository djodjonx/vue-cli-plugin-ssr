const cluster = require('cluster')
const { getMoment } = require('../utils/sharedTools')

module.exports = (serverStart, config) => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    const canClustered = process.env.NODE_ENV === 'production'
    try {
      if (cluster.isMaster && canClustered) {
        const cpus = require('os').cpus().length
        const clusterNumber = config.maxCluster && config.maxCluster <= cpus ? config.maxCluster : cpus
        console.log(`[${getMoment()}] Setting up clusters for ${clusterNumber} cores`)
        for (let i = 0; i < clusterNumber; i += 1) {
          cluster.fork()
        }

        // Notify if new worker is created
        cluster.on('online', (worker) => {
          console.log(`[${getMoment()}] Worker ${worker.id} is online and listening on ${config.host}:${config.port}`)
        })

        // If a worker dies, create a new one to keep the performance steady
        cluster.on('exit', (worker, code, signal) => {
          console.log(`[${getMoment()}] Worker ${worker.id} exited with code/signal ${code || signal}, respawning...`)
          cluster.fork()
        })
      } else {
        await serverStart()
        resolve()
      }
    } catch (error) {
      reject(error)
    }
  })
}
