const {
  toBool,
  toArray,
  toNumber,
} = require('./sharedTools')

module.exports = (config) => {
  const errors = []
  const VAR_BOOL = ['useComponentCache', 'useCompress', 'prodOnly', 'useServerCache', 'useStaticCache', 'isDevMode']
  const VAR_ARRAY = ['serverCacheUrls']
  const VAR_NUMBER = ['pageCacheTtl', 'staticCacheTtl', 'componentCacheTtl']

  const newConfig = { ...config }

  for (const param in config) {
    try {
      if (VAR_BOOL.includes(param)) {
        newConfig[param] = toBool(config[param])
      }
      if (VAR_ARRAY.includes(param)) {
        newConfig[param] = toArray(config[param])
      }
      if (VAR_NUMBER.includes(param)) {
        newConfig[param] = toNumber(config[param])
      }
    } catch (error) {
      errors.push(error.message.replace(/\{param\}/g, param))
    }
  }
  if (errors.length) {
    throw new Error(`Can't generate config file: \n ${errors.join('\n')}`)
  }
  return newConfig
}
