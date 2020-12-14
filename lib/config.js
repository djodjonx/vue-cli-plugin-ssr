module.exports = {
  api: null,
  service: null,
  port: null,
  host: null,
  clustered: false,
  maxCluster: null,
  rootPath: null,
  shouldNotPrefetch: [], // Array or function(file, type)
  shouldNotPreload: [], // Array or function(file, type)
  entry: target => `./src/entry-${target}`, // String path
  defaultTitle: 'My app', // String
  favicon: './public/favicon.ico', // String path
  criticalCSS: true, // boolean
  skipRequests: ctx => ctx.url === '/graphql', // function
  nodeExternalsWhitelist: [new RegExp(/\.css$/), new RegExp(/\?vue&type=style/)], // Array
  directives: {},
  copyUrlOnStart: true,
  onRender: null,
  onError: null,
  distPath: null,
  error500Html: null,
  templatePath: null,
  serviceWorkerPath: null,
  extendMiddlewares: [], // Array of KoaMiddleware
  extendRouter: [], // { method: string, path: string, action: koaMiddleware}
  customSsrPath: null, // regex for router get of Vssr
  prodOnly: false,
  modernMode: true,
  componentCache: { // boolean or object { active: true, options: lruOptions}
    active: true,
    options: {
      maxAge: 1000 * 60 * 60,
    },
  },
  pageCache: { // boolean or object { active: true, options: lruOptions, cacheUrls: Array or function(url) }
    active: true,
    options: {
      maxAge: 1000 * 60 * 60,
    },
    cacheUrls: [],
  },
  middlewares: {
    static: { // boolean or object { active: boolean, options: koa-static options }
      active: true,
      options: {
        maxAge: 1000 * 60 * 60 * 24 * 30,
      },
    },
    cors: true, // boolean or object { active: boolean, options: koa-cors options }
    compress: true, // boolean or object { active: boolean, options: koa-compress options }
    logger: true, // boolean or object { active: boolean, options: { colors: object: chalk options, types: Regexp or object { matcher: string/RegExp ignore: boolean} } }
  },
  // isDevMode: process.env.VUE_SERVER_DEV_MODE
}
