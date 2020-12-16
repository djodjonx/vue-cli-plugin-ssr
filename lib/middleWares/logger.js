const { chalk } = require('@vue/cli-shared-utils')
const {
  isString,
  isRegExp,
  getMoment,
} = require('../utils/sharedTools')

const DEFAULT_COLORS = {
  method: 'blue',
  alert: 'red',
  warning: 'yellow',
  success: 'green',
  url: 'bold',
  type: 'bold',
  date: 'bold',
}

const MATCHERS = {
  static: /\.(json|js|css|woff|eot|woff2|ttf|svg|png|jpg|jpeg|gif|ico|txt)+/g,
  page: /(.*(?!\.(json|js|css|woff|eot|woff2|ttf|svg|png|jpg|jpeg|gif|ico|txt)))+$/g,
}

function defineType (url, config) {
  for (const key in config) {
    if ((isString(config[key]) || isRegExp(config[key])) && new RegExp(config[key], 'g').test(url)) return key
    if (config[key].matcher && new RegExp(config[key].matcher, 'g').test(url)) return key
  }
  return null
}

function getIgnores (config) {
  const ignoreList = []
  for (const key in config) {
    if (config[key].ignore) {
      ignoreList.push(key)
    }
  }
  return ignoreList
}

const getCorlorByDuration = (duration, colors) => {
  if (duration < 250) {
    return colors.success
  } else if (duration < 500) {
    return colors.warning
  } else {
    return colors.alert
  }
}

const showLog = (log, isError) => {
  if (!log) return

  if (isError) {
    delete log.warning
  }
  const message = Object.entries(log)
    .sort((a, b) => a.order - b.order)
    .map(entry => chalk[entry.color || 'white'](entry.data))
    .join(' ')

  console.log(message)
}

const createLog = (ctx, config, duration) => {
  const colors = Object.assign(DEFAULT_COLORS, config.colors || {})
  const definers = Object.assign(MATCHERS, config.types || {})
  const ignoreTypes = getIgnores(config.types || [])
  const { url, method } = ctx

  if (ignoreTypes.includes(url)) return null

  return {
    date: {
      color: colors.date,
      data: getMoment(),
      order: 1,
    },
    mehtod: {
      color: colors.method,
      data: `[${method.toUpperCase()}]`,
      order: 2,
    },
    type: {
      color: colors.type,
      data: `[${defineType(url, definers)}]`,
      order: 3,
    },
    url: {
      color: colors.url,
      data: url,
      order: 4,
    },
    duration: {
      color: getCorlorByDuration(duration, colors),
      data: `${duration} ms`,
      order: 5,
    },
    warning: {
      color: colors.alert,
      data: '!!!ERROR!!!',
      order: 0,
    },
  }
}

module.exports = (config) => {
  return async (ctx, next) => {
    let isError = false
    const start = new Date()
    try {
      await next()
    } catch (error) {
      isError = true
    }
    const end = new Date()
    const duration = end - start
    const log = createLog(ctx, config, duration)
    showLog(log, isError)
  }
}
