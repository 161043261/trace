import { AnyObject, AnyFn, VoidFn } from '@trace-dev/types' // monorepo
import { isBrowserEnv, setReplaceRecord, traceDev } from './global'
import { TraceType, StatusPhrase } from '@trace-dev/constants'

export function generateUUID(): string {
  if (isBrowserEnv() && globalThis.crypto) {
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
  return globalThis.btoa(encodeURIComponent(errStr))
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

export function statusCode2phrase(statusCode: number) {
  if (statusCode < 400) return StatusPhrase.Ok
  if (statusCode >= 400 && statusCode < 500) {
    switch (statusCode) {
      case 401:
        return StatusPhrase.Unauthenticated
      case 403:
        return StatusPhrase.PermissionDenied
      case 404:
        return StatusPhrase.NotFound
      case 409:
        return StatusPhrase.AlreadyExist
      case 413:
        return StatusPhrase.FailedPrecondition
      case 429:
        return StatusPhrase.ResourceExhausted
      default:
        return StatusPhrase.InvalidArgument
    }
  }
  if (statusCode >= 500 && statusCode < 600) {
    switch (statusCode) {
      case 501:
        return StatusPhrase.Unimplemented
      case 503:
        return StatusPhrase.Unavailable
      case 504:
        return StatusPhrase.DeadlineError
      default:
        return StatusPhrase.InternalError
    }
  }
  return StatusPhrase.UnknownError
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

export function batchSetReplaceRecord() {
  const {
    traceXhr,
    traceFetch,
    traceClick,
    traceHistory,
    traceError,
    traceHashChange,
    traceUnhandledRejection,
    traceWhiteScreen
  } = traceDev.options
  setReplaceRecord(TraceType.Xhr, traceXhr ?? false)
  setReplaceRecord(TraceType.Fetch, traceFetch ?? false)
  setReplaceRecord(TraceType.Click, traceClick ?? false)
  setReplaceRecord(TraceType.History, traceHistory ?? false)
  setReplaceRecord(TraceType.Error, traceError ?? false)
  setReplaceRecord(TraceType.HashChange, traceHashChange ?? false)
  setReplaceRecord(TraceType.UnhandledRejection, traceUnhandledRejection ?? false)
  setReplaceRecord(TraceType.WhiteScreen, traceWhiteScreen ?? false)
}

export const throttle = (fn: AnyFn, delay: number, ctx?: unknown) => {
  let canRun = true
  return function (...args: unknown[]) {
    if (!canRun) {
      return
    }
    canRun = false
    fn.apply(ctx, args)
    setTimeout(() => {
      canRun = true
    }, delay)
  } as typeof fn
}

// > 1.toString();
// Uncaught SyntaxError: Invalid or unexpected token
// > Object.prototype.toString.call(1)
// '[object Number]'
export function typeofUnknown(target: unknown): string {
  // Object.prototype.toString.call(1) === '[object Number]'
  return Object.prototype.toString.call(target).slice(8, -1).toLowerCase()
}

export function unknown2str(target: unknown): string {
  if (target === undefined) {
    return 'undefined'
  }
  // JSON.stringify(undefined) === undefined
  // JSON.stringify(null) === 'null'
  return JSON.stringify(target)
}
