const path = require('path')

module.exports = (_rootPath) => {
  const currentPath = _rootPath || path.resolve(__dirname, '..')

  function resolve (target) {
    if (!target) return null
    return path.resolve(currentPath, target)
  }

  return // config //

}