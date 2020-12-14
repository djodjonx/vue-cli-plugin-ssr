const fs = require('fs')
const path = require('path')
const { createBundleRenderer } = require('vue-server-renderer')
const { isBoolean, hasProperty, isNull } = require('../utils/sharedTools')

const VAR_PROD = 'prod'
const VAR_DEV = 'dev'

module.exports = class Renderer {
  constructor ({ config, server }, mode) {
    this.config = config
    this.server = server
    this.templatePath = config.templatePath
    this.distPath = config.distPath
    this.defaultRenderOptions = this.renderOptionsGenerator(config)
    this.template = fs.readFileSync(config.templatePath, 'utf-8')
    this.contex = null
    this.renderer = null
    this.mode = VAR_PROD
    this.devServer = null

    this.setMode(mode)
  }

  setMode (parameter) {
    const currentMode = parameter || this.config.mode === 'production'
    this.mode = !isNull(currentMode) && isBoolean(currentMode) && currentMode ? VAR_PROD : VAR_DEV
    this.createRenderer()
  }

  renderOptionsGenerator (config) {
    let cache
    const directives = config.directives

    const cacheActive = (isBoolean(config.componentCache) && config.componentCache) ||
      (hasProperty(config.componentCache, 'active') && config.componentCache.active)

    if (cacheActive) {
      const LRU = require('lru-cache')
      const optionsCache = Object.assign({
        max: 1000,
        maxAge: 1000 * 60 * 60,
      }, config.componentCache.options)
      cache = new LRU(optionsCache)
    }
    const defaultRendererOptions = {
      cache,
      runInNewContext: false,
      inject: false,
      directives,
      basedir: this.distPath,
      shouldPrefetch: (file, type) => {
        if (Array.isArray(config.shouldNotPrefetch)) {
          if (config.shouldNotPrefetch.indexOf(file) > -1) return false
        }
        if (typeof config.shouldNotPrefetch === 'function') {
          if (config.shouldNotPrefetch(file, type)) return false
        }
        if (type === 'style' || type === 'script') return true
      },
      shouldPreload: (file, type) => {
        if (Array.isArray(config.shouldNotPreload)) {
          if (config.shouldNotPreload.indexOf(file) > -1) return false
        }
        if (typeof config.shouldNotPreload === 'function') {
          if (config.shouldNotPreload(file, type)) return false
        }
        if (type === 'style' || type === 'script') return true
      },
    }

    return defaultRendererOptions
  }

  setContext (ctx) {
    this.context = Object.assign({
      req: ctx.request,
      url: ctx.url,
      title: this.config.defaultTitle,
      basedir: this.distPath,
    })
  }

  bundleRenderer (serverBundle, options) {
    return createBundleRenderer(serverBundle, {
      ...options,
      ...this.defaultRenderOptions,
    })
  }

  createRenderer () {
    if (this.mode === VAR_PROD) {
      const serverBundleProd = require(path.resolve(this.distPath, 'vue-ssr-server-bundle.json'))
      const clientManifest = require(path.resolve(this.distPath, 'vue-ssr-client-manifest.json'))

      this.renderer = this.bundleRenderer(
        serverBundleProd,
        {
          template: this.template,
          clientManifest,
        },
      )
    } else {
      if (!this.server) {
        console.error('No server intanciate, use builtIns server')
        const Server = require('./builtInsServer')
        this.server = new Server({ config: this.config })
      }
      const { setupDevServer } = require('./dev-server')
      this.devServer = setupDevServer({
        server: this.server,
        templatePath: this.templatePath,
        onUpdate: ({ serverBundle }, options) => {
          // Re-create the bundle renderer
          this.renderer = this.bundleRenderer(serverBundle, {
            ...this.defaultRenderOptions,
            ...options,
          })
        },
      })
    }
  }

  async renderToString (ctx) {
    this.setContext(ctx)
    if (this.mode === VAR_DEV) {
      if (this.devServer) {
        await this.devServer
      } else {
        throw new Error('no dev server instanciate')
      }
    }

    try {
      const html = await this.renderer.renderToString(this.context)
      return html
    } catch (error) {
      console.error(error)
      throw error
    }
  }
}
