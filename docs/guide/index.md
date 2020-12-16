# Usage

::: warning
This plugin is intended to be used in a project created with Vue CLI 3.
:::

## Add plugin

```bash
vue add vue-cli-plugin-vssr
```

## Prompt

Chose your setup config

1. Use Built ins server (Yes/no)

Configure your project for use the `builtIns server`:computer:  ***made with koa*** (easy use). Can be extend & customize with configuration cf[doc].
Else, a base koa server was generate on your project on _projectRoot/server_.

2. Use Vssr module (Yes/no)
> :warning: This choice only appear when you not use the `builtIns server`:computer:

Use local server with Vssr module (0 conf), who include pre-configured :
- Koa-router
- koa-static (for assets and service-worker)
- koa-compress
- koa-cors (required for serve modern-mode)
- koa-favicon
- logger (console only)
- vue sever renderer
- webpack-hot-middleware-koa (dev mode only)
- webpack-dev-server-koa (dev mode only)
- component caching
- route caching

All middlewares and caching can be customizable with configuration file include with the local server generate.

3. Use modern-mode (yes/no)

Add vue-cli command on package.json for built your project with the modern-mode plugin vue for webpack. (:muscle: increase user expérience on modern broswer)

4. Use title plugin (yes/no)

Add a tiny Vue plugin for generate dynamically your page title with a vue component options.

## Run commands

```bash
  # run normal build
  npm run ssr:build
        # or
  yarn run ssr:build

  # run modern build (if activated)
  npm run ssr:build-modern
        # or
  yarn run ssr:build-modern

  # run dev server
  npm run ssr:serve
        # or
  yarn run ssr:serve

  # run production server
  npm run ssr:start
        # or
  yarn run ssr:start

```
## Documentation

- [Configuration](./configuration.md)
- [Directives](./directives.md)
- [Logger](./logger.md)
- [Router](./router.md)
