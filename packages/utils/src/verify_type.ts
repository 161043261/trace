function isType(type: string) {
  return function (value: any): boolean {
    return Object.prototype.toString.call(value) === `[object ${type}]`
  }
}

export const verifyType = {
  isNumber: isType('Number'),
  isString: isType('String'),
  isBoolean: isType('Boolean'),
  isNull: isType('Null'),
  isUndefined: isType('Undefined'),
  isSymbol: isType('Symbol'),
  isFunction: isType('Function'),
  isObject: isType('Object'),
  isArray: isType('Array'),
  isProcess: isType('process'), // lowerCase
  isWindow: isType('Window')
}

export function isError(error: any): boolean {
  switch (Object.prototype.toString.call(error)) {
    case '[object Error]':
    case '[object Exception]':
    case '[object DOMException]':
      return true
    default:
      return false
  }
}

export function isEmptyObject(obj: any): boolean {
  return verifyType.isObject(obj) && Object.keys(obj).length === 0
}

export function isEmpty(str: any): boolean {
  return (verifyType.isString(str) && str.trim() === '') || str === undefined || str === null
}

export function isPropertyExist(obj: any, propKey: any): boolean {
  return Object.prototype.hasOwnProperty.call(obj, propKey)
}
