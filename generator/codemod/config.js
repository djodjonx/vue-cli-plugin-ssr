const { parse, types: { namedTypes, builders }, print } = require('recast')

const CONVERT_ENTRIES = ['entry', 'favicon', 'distPath', 'error500Html', 'templatePath', 'serviceWorkerPath']
const INNERS_TARGET_KEY_FUNCTION = 'expression.right.body.body'

function getNestedEntry (object, string, defaultValue) {
  const path = string.split('.')
  let index = 0
  const length = path.length

  while (object != null && index < length) {
    object = object[path[index++]]
  }
  return (index && index === length) ? object : defaultValue || null
}

function isFunctionnalNode (node) {
  return namedTypes.FunctionExpression.check(node) || namedTypes.ArrowFunctionExpression.check(node)
}

function isExpressionNode (node) {
  return namedTypes.ExpressionStatement.check(node)
}

function isModuleExport (node) {
  return isExpressionNode(node) &&
    node.expression.left.object.name === 'module' && node.expression.left.property.name === 'exports'
}

function getTargetValue (node, valueName) {
  let expression
  getNestedEntry(node, INNERS_TARGET_KEY_FUNCTION, []).forEach(subNode => {
    if (namedTypes.ReturnStatement.check(subNode)) {
      subNode.argument.properties.forEach(property => {
        if (property.key.name === valueName) {
          expression = property
        }
      })
    }
  })
  return expression
}

function createEvalFunctionNode (targetNodeValue) {
  const evalFunctionString = 'resolve(value)'
  const functionNode = parse(evalFunctionString)
  functionNode.program.body[0].expression.arguments = [targetNodeValue]
  return functionNode.program.body[0]
}

function replaceValue (node) {
  if (isFunctionnalNode(node.value)) {
    node.value.body = createEvalFunctionNode(node.value.body)
  } else {
    node.value = createEvalFunctionNode(node.value)
  }
  return node
}

function recreateFile (nodeObject) {
  const newModuleExports = nodeObject.orginalModuleExports

  getNestedEntry(newModuleExports, INNERS_TARGET_KEY_FUNCTION, []).map(subNode => {
    if (namedTypes.ReturnStatement.check(subNode)) {
      subNode.argument.properties.forEach(property => {
        nodeObject.inners.map(newNode => {
          if (newNode.key.name === property.key.name) {
            return newNode
          }
          return property
        })
      })
    }
  })

  return builders.program([
    ...nodeObject.outters,
    nodeObject.orginalModuleExports,
  ])
}

function parseFile (contents) {
  const ast = parse(contents)
  const inners = []
  const outters = []
  let orginalModuleExports

  ast.program.body.forEach(node => {
    if (isModuleExport(node)) {
      orginalModuleExports = node
    } else {
      outters.push(node)
    }
  })
  return {
    orginalModuleExports,
    inners,
    outters,
  }
}

function main (fileContent) {
  const parsedFileObject = parseFile(fileContent)

  CONVERT_ENTRIES.forEach(param => {
    parsedFileObject.inners.push(getTargetValue(parsedFileObject.orginalModuleExports, param))
  })

  parsedFileObject.inners.map(node => replaceValue(node))

  const newContents = recreateFile(parsedFileObject)

  return print(newContents).code
}

module.exports = main
