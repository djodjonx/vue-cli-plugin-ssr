const isObject = (parameter) => {
  return typeof parameter === 'object' && !Array.isArray(parameter) && !isRegExp(parameter) && !isBoolean(parameter) && !isString(parameter) && !isNull(parameter)
}

const isRegExp = (parameter) => {
  return Object.prototype.toString.call(parameter) === '[object RegExp]'
}

const isArray = (parameter) => {
  return Array.isArray(parameter)
}

const isString = (parameter) => {
  return typeof parameter === 'string'
}

const isNumber = (parameter) => {
  return typeof parameter === 'number' && !isNaN(parameter)
}

const isBoolean = (parameter) => {
  return typeof parameter === 'boolean'
}

const isNull = (parameter) => {
  return parameter === undefined || parameter === null
}

const isFunction = (parameter) => {
  return typeof parameter === 'function'
}

const isClass = (parameter) => {
  return parameter.constructor.name !== 'Function' && parameter.constructor.name !== 'Object'
}

const hasProperty = (object, key) => {
  return Object.prototype.hasOwnProperty.call(object, key)
}

const toBool = (param) => {
  const VALID_STRINGS = ['true', 'false']
  if (isNumber(param)) {
    return param !== 0
  }

  if (isString(param) && VALID_STRINGS.includes(param)) {
    return param !== 0
  }

  if (isBoolean(param)) {
    return param
  }

  if (isNull(param)) {
    return false
  }

  throw new Error('parameter {param} can\'t be convert to Boolean')
}
const toArray = (param) => {
  const MATCH_COMMA = /(.*,{1})*/g

  if (isString(param)) {
    if (MATCH_COMMA.test(param)) {
      return param.split(',')
    } else {
      return [param]
    }
  }

  throw new Error('parameter {param} can\'t be convert to Array')
}
const toNumber = (param) => {
  const MATCH_NUMBER_ONLY = /\d*/g
  if (isNumber(param)) {
    return param
  }
  if (isString(param) && MATCH_NUMBER_ONLY.test(param)) {
    return parseInt(param, 10)
  }
  throw new Error('parameter {param} can\'t be convert to Number')
}

const getMoment = () => {
  const date = new Date()
  return `${date.toLocaleString()}:${date.getMilliseconds()} `
}

const applyOnArrayMap = (array, cb, args) => {
  const cloneArray = new Array(...array)
  for (const index in array) {
    cloneArray[index] = cb(cloneArray[index], args)
  }
  return cloneArray
}

const applyOnObjectMap = (object, cb, args) => {
  const cloneObject = Object.assign({}, object)
  for (const property in object) {
    cloneObject[property] = cb(cloneObject[property], args)
  }
  return cloneObject
}

module.exports = {
  isObject,
  isArray,
  isNumber,
  isString,
  isBoolean,
  isNull,
  isClass,
  isRegExp,
  hasProperty,
  toBool,
  toArray,
  toNumber,
  isFunction,
  getMoment,
  applyOnArrayMap,
  applyOnObjectMap,
}
