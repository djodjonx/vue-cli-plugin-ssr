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
  time: 'bold',
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

module.exports = (config) => {
  const colors = Object.assign(DEFAULT_COLORS, config.colors || {})
  const definers = Object.assign(MATCHERS, config.types || {})
  const ignoreTypes = getIgnores(config.types || {})

  const showLog = ({ method, url, duration, type }, isError) => {
    const message = []
    if (isError) {
      message.push(chalk[colors.alert]('!!!ERROR!!!'))
    }
    message.push(chalk[colors.time](`${getMoment()}`))
    message.push(chalk[colors.method](`[${method.toUpperCase()}]`))
    if (type) {
      message.push(chalk[colors.type](`[${type}]`))
    }
    message.push(`=> ${chalk.bold(url)}`)
    if (duration < 250) {
      message.push(` ${chalk[colors.success](`${duration} ms`)}`)
    } else if (duration < 500) {
      message.push(` ${chalk[colors.warning](`${duration} ms`)}`)
    } else {
      message.push(` ${chalk[colors.alert](`${duration} ms`)}`)
    }
    console.log(message.join(' '))
  }

  return async (ctx, next) => {
    let isError = false
    const start = new Date()
    const { url, method } = ctx
    const type = defineType(url, definers)
    try {
      await next()
    } catch (error) {
      isError = true
    }
    if (ignoreTypes.includes(url)) return
    const end = new Date()
    showLog({
      method,
      url,
      duration: end - start,
      type,
    }, isError)
  }
}
