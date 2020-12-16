# Extend buitIns router

## Data model

Router route need to follow the next model for can be used with builtIns router

```js
/**
 * Route model
 * @type {object}
 * @param {string} method CRUD method GET/POST/PUT/PATCH/DELET
 * @param {string} path url of the current route
 * @param {function} action KoaMiddleware function use on route call
 */

const route = {
  method: 'GET',
  path: '/foo'
  action: async (ctx, next) => {
    const bar = doSomthing(ctx)
    await next()
    ctx.body = bar
  }
}
```

## Config

:::warning
Work's only with builtIns server or if you use Vssr module with local server :::

For extending builtIns router just add your custom route on extendRouter config parameter. All routes are directly injects on router when app launch.

```js
// config.js
const fooRoute = require('./fooRoute')

module.exports = {
  port: 3000,
  ...,
  extendRouter: [
    fooRoute,
    {
      method: 'GET',
      path: '/bar'
      action: async (ctx, next) => {
        const baz = doSomthing(ctx)
        await next()
        ctx.body = baz
      }
    }
  ]
}
```