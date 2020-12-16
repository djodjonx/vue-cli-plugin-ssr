const fs = require('fs-extra')
const path = require('path')
const { EOL } = require('os')
const { chalk } = require('@vue/cli-shared-utils')
const config = require('../lib/config')
const {
  isObject,
  isArray,
  isString,
} = require('../lib/utils/sharedTools')

module.exports = (api, options, rootOptions) => {
  if (!api.hasPlugin('router')) {
    throw new Error('Please install router plugin with \'vue add router\'.')
  }

  const scriptsToAdd = {
    'ssr:serve': 'vue-cli-service ssr:serve',
    'ssr:build': 'vue-cli-service ssr:build',
    'ssr:start': 'vue-cli-service ssr:serve --mode production',
  }

  if (options.useModernMode) {
    scriptsToAdd['ssr:build-modern'] = 'vue-cli-service ssr:build --modern'
  }

  if (!options.useBuiltInsServer) {
    scriptsToAdd['ssr:serve'] = 'vue-cli-service ssr:serve -s ./server/koaServer.js'
    scriptsToAdd['ssr:start'] = 'vue-cli-service ssr:serve -s ./server/koaServer.js --mode production'
  }

  api.extendPackage({
    scripts: scriptsToAdd,
    dependencies: {
      'vue-server-renderer': '^2.6.0',
      koa: '^2.13.0',
      'cross-env': '^7.0.3',
    },
  })

  if (!options.useVssr) {
    api.extendPackage({
      scripts: scriptsToAdd,
      dependencies: {
        '@koa/router': '^10.0.0',
      },
    })
  }

  if (api.hasPlugin('apollo')) {
    api.extendPackage({
      dependencies: {
        'isomorphic-fetch': '^2.2.1',
      },
    })
  }

  const templateOptions = {
    vuex: api.hasPlugin('vuex'),
    pwa: api.hasPlugin('pwa'),
    apollo: api.hasPlugin('apollo'),
    useVssr: options.useVssr,
    useModernMode: options.useModernMode,
    useTitlePlugin: options.useTitlePlugin,
    useBuiltInsServer: options.useBuiltInsServer,
  }

  api.render('./templates/default', templateOptions)

  if (options.useTitlePlugin) {
    api.render('./templates/extra')
  }

  if (!options.useBuiltInsServer) {
    api.render('./templates/server', Object.assign(templateOptions, { config }))
  }

  api.onCreateComplete(() => {
    api.exitLog(`Start dev server with ${chalk.cyan('npm/yarn run ssr:serve')}`, 'info')
    api.exitLog(`Build with ${chalk.cyan('npm/yarn run ssr:build')}`, 'info')
    api.exitLog(`Run in production with ${chalk.cyan('npm/yarn run ssr:start')}`, 'info')
  })

  module.exports.hooks = (api) => {
    api.afterInvoke(() => {
      // Main
      const file = getFile(api, './src/main.js')
      if (file) {
        let contents = fs.readFileSync(file, { encoding: 'utf8' })
        contents = contents.replace(/import Vue from ('|")vue('|")/, `import Vue from $1vue$2${templateOptions.useTitlePlugin ? '\nimport titlePlugin from $1./plugins/titlePlugin$2' : ''}`)
        contents = contents.replace(/import router from ('|")\.\/router(\.\w+)?('|")/, 'import { createRouter } from $1./router$3')
        contents = contents.replace(/import store from ('|")\.\/store(\.\w+)?('|")/, 'import { createStore } from $1./store$3')
        contents = contents.replace(/import ('|")\.\/registerServiceWorker('|")\n/, '')
        contents = contents.replace(/const apolloProvider = createProvider\(({(.|\s)*?})?\)\n/, '')
        contents = contents.replace(/new Vue\({((.|\s)*)}\)\.\$mount\(.*?\)/, `export async function createApp ({
          beforeApp = () => {},
          afterApp = () => {}${templateOptions.useTitlePlugin ? ',\nisServer = false' : ''}
        } = {}) {
          const router = createRouter()
          ${templateOptions.vuex ? 'const store = createStore()' : ''}
          ${templateOptions.apollo ? `const apolloProvider = createProvider({
            ssr: process.server,
          })` : ''}
          ${templateOptions.useTitlePlugin ? 'Vue.use(titlePlugin, { isServer })' : ''}
          await beforeApp({
            router,
            ${templateOptions.vuex ? 'store,' : ''}
            ${templateOptions.apollo ? 'apolloProvider,' : ''}
          })
          const app = new Vue({$1})
          const result = {
            app,
            router,
            ${templateOptions.vuex ? 'store,' : ''}
            ${templateOptions.apollo ? 'apolloProvider,' : ''}
          }
          await afterApp(result)
          return result
        }`)
        contents = contents.replace('apolloProvider: createProvider()', 'apolloProvider')
        fs.writeFileSync(file, contents, { encoding: 'utf8' })
      }

      // Config
      if (!templateOptions.useBuiltInsServer) {
        try {
          const file = getFile(api, './server/config.js')
          if (file) {
            const editedConfig = editConfig(config, {
              vssr: templateOptions.useBuiltInsServer,
              modern: templateOptions.useModernMode,
            })
            const configStringObject = stringify(editedConfig)
            let contents = fs.readFileSync(file, { encoding: 'utf8' })
            contents = contents.replace(/\/\/ config \/\//g, configStringObject)
            const configCodeMode = require('./codemod/config')
            contents = configCodeMode(contents)
            fs.writeFileSync(file, contents, { encoding: 'utf8' })
          }
        } catch (e) {
          console.error('An error occured while transforming config code', e.stack)
        }
      }

      // Router
      try {
        const file = getFile(api, './src/router.js')
        if (file) {
          let contents = fs.readFileSync(file, { encoding: 'utf8' })
          const { wrapRouterToExportedFunction } = require('./codemod/router')
          contents = wrapRouterToExportedFunction(contents)
          contents = contents.replace(/mode:\s*("|')(hash|abstract)("|'),/, '')
          fs.writeFileSync(file, contents, { encoding: 'utf8' })
        }
      } catch (e) {
        console.error('An error occured while transforming router code', e.stack)
      }

      // Vuex
      if (api.hasPlugin('vuex')) {
        try {
          const file = getFile(api, './src/store.js')
          if (file) {
            let contents = fs.readFileSync(file, { encoding: 'utf8' })
            contents = contents.replace(/export default new Vuex\.Store\({((.|\s)+)}\)/, `export function createStore () {
              return new Vuex.Store({$1})
            }`)
            contents = contents.replace(/state:\s*{((.|\s)*?)},\s*(getters|mutations|actions|modules|namespaced):/, `state () {
              return {$1}
            },
            $3:`)
            fs.writeFileSync(file, contents, { encoding: 'utf8' })
          }
        } catch (e) {
          console.error('An error occured while transforming vuex code', e.stack)
        }
      }

      // Apollo
      if (api.hasPlugin('apollo')) {
        if (fs.existsSync(api.resolve('./apollo-server'))) {
          const file = getFile(api, './apollo-server/server.js')
          let contents
          if (file) {
            contents = fs.readFileSync(file, { encoding: 'utf8' })
          } else {
            contents = `export default app => {
              
            }`
          }

          contents = contents.replace(/export default app => {((.|\s)*)}/, `export default app => {$1
            ssrMiddleware(app, { prodOnly: true })
          }`)
          contents = 'import ssrMiddleware from \'@akryum/vue-cli-plugin-ssr/lib/app\'\n' + contents
          fs.writeFileSync(file, contents, { encoding: 'utf8' })
        }

        // Replace default apollo dev script
        setTimeout(() => {
          const file = api.resolve('./package.json')
          let contents = fs.readFileSync(file, { encoding: 'utf8' })
          contents = contents.replace(/(\s*--run \\?("|')vue-cli-service) serve(\\?("|'))/g, '$1 ssr:serve$3')
          fs.writeFileSync(file, contents, { encoding: 'utf8' })
        })
      }

      // Linting
      const execa = require('execa')

      if (api.hasPlugin('apollo')) {
        // Generate JSON schema
        try {
          execa.sync('vue-cli-service', [
            'apollo:schema:generate',
            '--output',
            api.resolve('./node_modules/.temp/graphql/schema'),
          ], {
            preferLocal: true,
          })
        } catch (e) {
          console.error(e)
        }
      }

      // Lint generated/modified files
      try {
        const files = ['*.js', '.*.js', 'src']
        if (api.hasPlugin('apollo')) {
          files.push('apollo-server')
        }
        if (!templateOptions.useBuiltInsServer) {
          files.push('server')
        }
        execa.sync('vue-cli-service', [
          'lint',
          ...files,
        ], {
          preferLocal: true,
        })
      } catch (e) {
        // No ESLint vue-cli plugin
      }
    })
  }
}

function getFile (api, file) {
  let filePath = api.resolve(file)
  if (fs.existsSync(filePath)) return filePath
  filePath = api.resolve(file.replace('.js', '.ts'))
  if (fs.existsSync(filePath)) return filePath
  filePath = api.resolve(path.join(file.replace('.js', ''), 'index.js'))
  if (fs.existsSync(filePath)) return filePath
  filePath = api.resolve(path.join(file.replace('.js', ''), 'index.ts'))
  if (fs.existsSync(filePath)) return filePath

  api.exitLog(`File ${file} not found in the project. Automatic generation will be incomplete.`, 'warn')
}

function stringify (entry, start = true) {
  const stringObject = []
  if (isObject(entry)) {
    stringObject.push('{')
    for (const key in entry) {
      stringObject.push(`${key}: ${stringify(entry[key], false)}`)
    }
    stringObject.push(`}${start ? '' : ','}`)
  } else if (isArray(entry)) {
    stringObject.push('[')
    for (const value of entry) {
      stringObject.push(`${stringify(value, false)}`)
    }
    stringObject.push('],')
  } else if (isString(entry)) {
    stringObject.push(`'${entry}',`)
  } else {
    stringObject.push(`${entry},`)
  }
  return stringObject.join(EOL)
}

function editConfig (config, { vssr, modern }) {
  if (!modern) {
    delete config.modernMode
  }

  if (!vssr) {
    delete config.pageCache
    delete config.middlewares
    delete config.extendRouter
    delete config.onRender
    delete config.onBeforeSend
    delete config.onError
  }
  delete config.api
  delete config.service
  delete config.prodOnly
  return Object.assign(config, {
    rootPath: '.',
    distPath: './dist',
    templatePath: './dist/index.ssr.html',
  })
}
