# Configuration

Here are the optional settings available in your `vue.config.js` if you use `builtIns Server` or in dedicated file on **/server/config**:

```js
const path = require('path')

module.exports = {
  pluginOptions: {
    vssr: {
      /**
       * Listening port for `serve` command
       * @type {string}
       * or
       * @type {number}
       */
      port: null,
      /**
       * Listening host for `serve` command
       * @type {string}
       * or
       * @type {number}
       */
      host: null,
      /**
       * Specify public file paths to disable resource prefetch hints for
       * @type {array} String fileName (ex: app.js)
       * or
       * @type {function} (file, type) => boolean
       *    @param {string} file file name
       *    @param {string} type file type
       *    @return {boolean}
       */
      shouldNotPrefetch: [],
      /**
       * Specify public file paths to disable resource preload hints for
       * @type {array} String fileName (ex: app.js)
       * or
       * @type {function} (file, type) => boolean
       *    @param {string} file file name
       *    @param {string} type file type
       *    @return {boolean}
       */
      shouldNotPreload: [],
      /**
       * Entry for each target
       * @type {function} (target) => string
       *    @param {string} target Target name
       *    @return {string}
       */
      entry: target => `./src/entry-${target}`,
      /**
       * Default title
       * @type {string} App title
       */
      defaultTitle: 'My app',
       /**
       * Path to favicon
       * @type {string} Favicon path
       */
      favicon: './public/favicon.ico',
       /**
       * Enable Critical CSS
       * @type {boolean} Use criticals Css
       */
      criticalCSS: true,
       /**
       * Skip some requests from being server-side rendered
       * @type {function} (ctx) => boolean
       *    @param {koaContext} ctx koa context object
       *    @return {boolean}
       */
      skipRequests: ctx => ctx.url === '/graphql',
      /**
       * Whitelist node externals Webpack
       * @type {array} regex
       *  @see https://ssr.vuejs.org/guide/build-config.html#externals-caveats
       */
      nodeExternalsWhitelist: [/\.css$/, /\?vue&type=style/],
      /**
       * Enable node cluster for the production server
       * @type {boolean} Use node cluster
       */
      clustered: false,
      /**
       * Max Node cluster used, max available if null
       * @type {number} cluster number
       */
      maxCluster: null,
      /**
       * Project root path
       * @type {string} path
       */
      rootPath: null,
       /**
       * Directives fallback
       * @type {object} Vue js directive
       *  @see Directive chapter
       */
      directives: {},
       /**
       * Copy URL to system clipboard on start
       * @type {boolean} Copy url
       */
      copyUrlOnStart: true,
      /**
       * Remove builtIns html alteration (avoid duplicate scipt inject)
       * @type {boolean} Copy url
       */
      fullControlRender: false
      /**
       * Function to call after rendering for alter html
       * @type {function} (html) => boolean
       *    @param {sting} html html string generate by vue sever renderer.toString()
       *    @param {boolean} mode development or production
       *    @return {string} html string to send
       */
      onRender: (html, mode) => {
        return html = html.replace(/<script src="[^"]+" defer><\/script>/g, '')
        }
      },
      /**
       * Function to call before send for alter context
       * @type {function} (ctx, context) => boolean
       *    @param {koaContext} ctx koa context object
       *    @param {object} context context used for render
       *    @return {void}
       */
      onBeforeSend: (ctx, context) => {
        res.setHeader(`Cache-Control', 'public, max-age=${context.maxAge}`)
      },
      /**
       * Function for monitoring error service
       * @type {function} (error) => boolean
       *    @param {error} error Error prototype
       *    @return {void}
       */
      onError: error => {
        // Send to error monitoring service
      },
      /**
       * Dist folder path
       * @type {string} path of dist directory
       */
      distPath: path.resolve(__dirname, './dist'),
      /**
       * Template for 500 error
       * @type {string} path of error 500 template file
       */
      error500Html: path.resolve(__dirname, './dist/500.html'),
      /**
       * SSR template path
       * @type {string} path of ssr template file
       */
      templatePath: path.resolve(__dirname, './dist/index.ssr.html'),
       /**
       * Service worker path
       * @type {string} path of service worker file
       */
      serviceWorkerPath: path.resolve(__dirname, './dist/service-worker.js'),
      /**
       * Extend builtIns server with middlewares
       * @type {Array} Array of KoaMiddlewares
       */
      extendMiddlewares: [],
      /**
       * Extend builtIns server with middlewares
       * @type {Array} Array of routesObject
       *  @see CustomRoute chapter
       */
      extendRouter: [], // { method: string, path: string, action: koaMiddleware}
      /**
       * Custom Route Regex for builtIns router
       * @type {string} regex matcher for page routes
       */
      customSsrPath: null,
      /**
       * Serve modern mode App, force active cors middleware
       * @type {boolean} use modern mode
       */
      modernMode: true,
      /**
       * Component caching config
       * @type {boolean} active component caching with default configuration
       * or
       * @type {object}
       *    @param {boolean} active Active component caching
       *    @param {object} options LRU config option
       *     @see https://github.com/isaacs/node-lru-cache#readme
       */
      componentCache: {
        active: true,
        options: {
          maxAge: 1000 * 60 * 60,
        },
      },
      /**
       * Page route caching config
       * @type {boolean} active component caching with default configuration
       * or
       * @type {object}
       *    @param {boolean} active Active component caching
       *    @param {object} options LRU config option
       *     @see https://github.com/isaacs/node-lru-cache#readme
       *    @param {array} cacheUrls list au string url
       * or
       *    @param {function} cacheUrls function define cache url
       *        @param {string} url url of page call
       *        @return {boolean}
       */
      pageCache: {
        active: true,
        options: {
          maxAge: 1000 * 60 * 60,
        },
        cacheUrls: [],
      },
      /**
       * BuiltIns middlewares config
       * @type {object}
       *    @param {object} static configure static middleware
       *    @param {object} cors configure cors middleware
       *    @param {object} compress configure compress middleware
       *    @param {object} logger configure logger middleware
       */
      middlewares: {
        /**
         * Static middleware config
         * @type {boolean} Active static middleware with default configuration
         * or
         * @type {object}
         *    @param {boolean} active Active static middleware
         *    @param {object} options Koa-static options
         *     @see https://github.com/koajs/static
         */
        static: {
          active: true,
          options: {
            maxAge: 1000 * 60 * 60 * 24 * 30,
          },
        },
        /**
         * Cors middleware config
         * @type {boolean} Active cors middleware with default configuration
         * or
         * @type {object}
         *    @param {boolean} active Active cors middleware
         *    @param {object} options Koa-cors options
         *     @see https://github.com/koajs/cors
         */
        cors: true,
        /**
         * Compress middleware config
         * @type {boolean} Active compress middleware with default configuration
         * or
         * @type {object}
         *    @param {boolean} active Active compress middleware
         *    @param {object} options Koa-compress options
         *     @see https://github.com/koajs/compress
         */
        compress: true,
        /**
         * Logger middleware config
         * @type {boolean} Active logger middleware with default configuration
         * or
         * @type {object}
         *    @param {boolean} active Active logger middleware
         *    @param {object} options Logger options
         *      @param {object} colors colors object
         *        @param {sting} method method message color (ex: 'blue')
         *        @param {sting} alert alert message color (ex: 'red')
         *        @param {sting} warning warning message color (ex: 'yellow')
         *        @param {sting} success success message color (ex: 'green')
         *        @param {sting} url url message color (ex: 'bold')
         *        @param {sting} type type message color (ex: 'bold')
         *        @param {sting} date date message color (ex: 'bold')
         *        @see https://github.com/chalk/chalk#readme
         *    @param {object} types defines types
         *      @param {object} typesName name of type, use for add type of dat in log (ex: static: {})
         *        @type {string} regex for match type
         *          or
         *        @param {string} matcher regex for match type
         *        @param {boolean} ignore ignore log for this type
         */
        logger: true,
        }
      }
    }
```
