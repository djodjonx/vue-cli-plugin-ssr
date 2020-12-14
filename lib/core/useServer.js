const fs = require('fs')
const { chalk } = require('@vue/cli-shared-utils')
const { isFunction, isClass, hasProperty } = require('../utils/sharedTools')

module.exports = (serverPath, config) => {
  let serverInstance = null

  if (!fs.existsSync(serverPath)) {
    throw new Error(`${chalk.yellow('[WARN]')}:Server not found on path ${serverPath}`)
  }

  const Server = require(serverPath)

  if (isFunction(Server)) {
    serverInstance = Server(config)
  } else if (isClass(Server)) {
    serverInstance = new Server(config)
  } else {
    throw new Error(`${chalk.yellow('[WARN]')}:Server on path ${serverPath}, is not a function or class. Server file could expose a function or a class.`)
  }

  if (!hasProperty(serverInstance, 'runServer') && !isFunction(serverInstance.runServer)) {
    throw new Error(`${chalk.yellow('[WARN]')}:Server instance from path ${serverPath}, has no property runServer or is not a function. Server instance could expose a property runServer and could be a function.`)
  }
  return serverInstance
}
