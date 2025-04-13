function isType(
  type:
    | 'Array'
    | 'Boolean'
    | 'Function'
    | 'Number'
    | 'Null'
    | 'String'
    | 'Symbol'
    | 'Object'
    | 'Undefined'
    | 'process' // lowerCase
) {
  return function (value: unknown): boolean {
    return Object.prototype.toString.call(value) === `[object ${type}]`
  }
}

function isEmptyStrOrUndefinedOrNull(emptyStrOrUndefinedOrNull: unknown): boolean {
  return (
    (typeChecker.isString(emptyStrOrUndefinedOrNull) &&
      (emptyStrOrUndefinedOrNull as string).trim() === '') ||
    emptyStrOrUndefinedOrNull === undefined ||
    emptyStrOrUndefinedOrNull === null
  )
}

function isError(error: unknown): boolean {
  switch (Object.prototype.toString.call(error)) {
    case '[object DOMException]':
    case '[object Error]':
    case '[object Exception]':
      return true
    default:
      return false
  }
}

function isEmptyObject(obj: unknown): boolean {
  return typeChecker.isObject(obj) && Object.keys(obj as object).length === 0
}

function isWindow(window_: unknown): boolean {
  const windowOrUndefined = typeof window_ === 'undefined' ? window_ : undefined
  return Object.prototype.toString.call(windowOrUndefined) === `[object Window]`
}

export const typeChecker = {
  isArray: isType('Array'),
  isBoolean: isType('Boolean'),
  isFunction: isType('Function'),
  isNumber: isType('Number'),
  isNull: isType('Null'),
  isString: isType('String'),
  isSymbol: isType('Symbol'),
  isObject: isType('Object'),
  isUndefined: isType('Undefined'),
  isProcess: isType('process'), // lowerCase
  isEmptyStrOrUndefinedOrNull,
  isEmptyObject,
  isError,
  isWindow
}

export function hasProperty(obj: unknown, propKey: number | string | symbol): boolean {
  return Object.prototype.hasOwnProperty.call(obj, propKey)
}
