module.exports = [
  {
    type: 'confirm',
    name: 'useVssr',
    message: 'Use Vssr for configure your server',
    default: false,
  },
  {
    type: 'confirm',
    name: 'useModernMode',
    message: 'Use Modern mode app for your SSR app',
    default: false,
  },
  {
    type: 'confirm',
    name: 'useBuiltInsServer',
    message: 'Use Koa builtIns server, if No, create local Koa server on root/server with conf',
    default: false,
  },
  {
    type: 'confirm',
    name: 'useTitlePlugin',
    message: 'use vue title plugin, allow to have dynamique title provide by vue options',
    default: false,
  },
]
