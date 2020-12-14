const Koa = require('koa')
const vSsr = require('../vssr')
const portFinder = require('../utils/portFinder')
const clusterer = require('./clusterer')
const { chalk } = require('@vue/cli-shared-utils')
const { isArray } = require('../utils/sharedTools')

module.exports = class Server {
  constructor ({ host, port, config }) {
    this.host = host
    this.port = port
    this.config = config
    this.app = new Koa()

    this.createServer()
  }

  async createServer () {
    let usedPort = this.port || this.config.port || process.env.PORT
    if (!usedPort) {
      usedPort = await portFinder()
    }

    const usedHost = this.host || this.config.host || process.env.HOST || 'localhost'

    this.config.port = usedPort
    this.config.host = usedHost

    vSsr(this.app, this.config)

    if (this.config.extendMiddlewares && this.config.extendMiddlewares.length) {
      if (isArray(this.config.extendMiddlewares)) {
        this.config.extendMiddlewares.forEach(middleware => {
          this.app.use(middleware)
        })
      } else {
        console.error('extendMiddlewares must be an array of KoaMiddleware, (ex: (ctx, next) => { dosomthing(ctx) })')
      }
    }
  }

  async clusterApp () {
    await clusterer(this.start, this.config.maxCluster)
  }

  async runServer () {
    if (this.config.clustered) {
      await this.clusterApp()
      return {
        port: this.config.port,
        host: this.config.host,
      }
    } else {
      return this.start()
    }
  }

  async start () {
    this.app.listen(
      this.config.port,
      this.config.host,
      () => {
        let copied = ''
        const url = `${this.config.host}:${this.config.port}`
        if (this.config.copyUrlOnStart) {
          require('clipboardy').write(url)
          copied = chalk.dim('(copied to clipboard)')
        }
        console.info(`[info] Server SSR is running on ${chalk.cyan(url)} ${copied}}`)
      },
    )
    return {
      port: this.config.port,
      host: this.config.host,
    }
  }
}
