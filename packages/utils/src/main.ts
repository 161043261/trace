// pnpm add @trace-dev/types --filter @trace-dev/utils
import { AnyObject, AnyFn, VoidFn } from '@trace-dev/types' // monorepo
import { typeChecker } from './type_checker'
import { isBrowserEnv, setReplaceRecord, traceDev } from './global'
import { TraceType, HttpPhrase } from '@trace-dev/constants'

export function generateUUID(): string {
  if (isBrowserEnv() && window.crypto) {
    return crypto.randomUUID()
  }
  let t = new Date().getTime()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (t + Math.random() * 16) % 16 | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    t = Math.floor(t / 16)
    return v.toString(16)
  })
}

export function getErrorId(errStr: string): string {
  return window.btoa(encodeURIComponent(errStr))
}

export function getTimestamp(): number {
  return Date.now()
}

export function getYmd(): string {
  const pad0 = (num: number) => num.toString().padStart(2, '0')
  const day = new Date()
  const year = day.getFullYear()
  const mouth = day.getMonth() + 1
  // const mouth = ("0" + (day.getMonth() + 1)).slice(-2);
  const date = day.getDate()
  // const date = ("0" + day.getDate()).slice(-2);
  return `${year}-${pad0(mouth)}-${pad0(date)}`
}

export function hasErrorHash(hash: string): boolean {
  const hasHash = traceDev.errorHashes.has(hash)
  if (!hasHash) traceDev.errorHashes.add(hash)
  return hasHash
}

export function htmlElem2str(elem: HTMLElement): string {
  const tagName = elem.tagName.toLowerCase()
  if (tagName === 'body' || tagName === 'html') return ''
  const idStr = elem.id ? ` id=${elem.id}` : ''
  let classNames = elem.classList.value
  if (classNames !== '') classNames = ` class=${classNames}`
  const innerHTML = elem.innerHTML
  return `<${tagName}${idStr}${classNames}>${innerHTML}</${tagName}>`
}

export function httpCode2message(httpCode: number) {
  if (httpCode < 400) return HttpPhrase.Ok
  if (httpCode >= 400 && httpCode < 500) {
    switch (httpCode) {
      case 401:
        return HttpPhrase.Unauthenticated
      case 403:
        return HttpPhrase.PermissionDenied
      case 404:
        return HttpPhrase.NotFound
      case 409:
        return HttpPhrase.AlreadyExist
      case 413:
        return HttpPhrase.FailedPrecondition
      case 429:
        return HttpPhrase.ResourceExhausted
      default:
        return HttpPhrase.InvalidArgument
    }
  }
  if (httpCode >= 500 && httpCode < 600) {
    switch (httpCode) {
      case 501:
        return HttpPhrase.Unimplemented
      case 503:
        return HttpPhrase.Unavailable
      case 504:
        return HttpPhrase.DeadlineError
      default:
        return HttpPhrase.InternalError
    }
  }
  return HttpPhrase.UnknownError
}

export function nativeTryCatch(fn: VoidFn, errorFn?: VoidFn) {
  try {
    fn()
  } catch (err) {
    if (err && errorFn) {
      errorFn(err)
    }
  }
}

export function parseUrl2obj(url: string) {
  const regExpMatchArr = url.match(/^(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?$/)
  if (!regExpMatchArr) return {}
  const query = regExpMatchArr[6] ?? ''
  const str = regExpMatchArr[8] ?? ''
  console.log('parseUrl2obj:', query, str)
  return {
    host: regExpMatchArr[4],
    path: regExpMatchArr[5],
    protocol: regExpMatchArr[2],
    relativePath: regExpMatchArr[5] + query + str
  }
}

export function replaceAop(sourceObj: AnyObject, propKey: string, wrapper: AnyFn, force = false) {
  if (!sourceObj) return
  if (propKey in sourceObj || force) {
    const originalFn = sourceObj[propKey]
    const wrappedFn = wrapper(originalFn)
    if (typeof wrappedFn === 'function') {
      sourceObj[propKey] = wrappedFn
    }
  }
}

export function setTrace(
  traceXhr = true,
  traceFetch = true,
  traceClick = true,
  traceHistory = true,
  traceError = true,
  traceHashChange = true,
  traceUnhandledRejection = true,
  traceWhiteScreen = true
) {
  setReplaceRecord(TraceType.Xhr, traceXhr)
  setReplaceRecord(TraceType.Fetch, traceFetch)
  setReplaceRecord(TraceType.Click, traceClick)
  setReplaceRecord(TraceType.History, traceHistory)
  setReplaceRecord(TraceType.Error, traceError)
  setReplaceRecord(TraceType.HashChange, traceHashChange)
  setReplaceRecord(TraceType.UnhandledRejection, traceUnhandledRejection)
  setReplaceRecord(TraceType.WhiteScreen, traceWhiteScreen)
}

export function simpleTypeChecker(
  target: unknown,
  expectType:
    | 'Array'
    | 'Boolean'
    | 'Function'
    | 'Number'
    | 'Null'
    | 'String'
    | 'Symbol'
    | 'Object'
    | 'Undefined'
    | 'process' /** lowerCase */
): boolean {
  if (!target) return false
  if (typeofAny(target) === expectType) return true
  console.error(`[trace-dev] Expect ${expectType}, get ${typeofAny(target)}`)
  return false
}

export function sliceStr(str: string, sliceLen: number) {
  if (typeChecker.isString(str)) {
    return str.slice(0, sliceLen) + (str.length > sliceLen ? `// str.slice(0, ${sliceLen})` : '')
  }
  return ''
}

export const throttle = (fn: AnyFn, delay: number) => {
  let canCall = true
  return function (ctx: unknown, ...args: unknown[]) {
    if (!canCall) {
      return
    }
    canCall = false
    fn.apply(ctx, args)
    setTimeout(() => {
      canCall = true
    }, delay)
  }
}

// > 1.toString();
// Uncaught SyntaxError: Invalid or unexpected token
// > Object.prototype.toString.call(1)
// '[object Number]'
export function typeofAny(target: unknown): string {
  // Object.prototype.toString.call(1) === '[object Number]'
  return Object.prototype.toString.call(target).slice(8, -1)
}

export function unknown2str(target: unknown): string {
  if (typeChecker.isString(target)) {
    return target as string
  }
  if (typeChecker.isUndefined(target)) {
    return 'undefined'
  }
  // JSON.stringify(undefined) === undefined
  // JSON.stringify(null) === 'null'
  return JSON.stringify(target)
}
