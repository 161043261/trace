// pnpm add @trace-dev/types --filter @trace-dev/utils
import { IAnyObject, IAnyCallback } from '@trace-dev/types' // monorepo
import { verifyType } from './verify_type'

export function on(
  target: any,
  eventName: string,
  callback: IAnyCallback,
  options = false
) {
  target.addEventListener(eventName, callback, options)
}

export function replaceAop(
  sourceObj: IAnyObject,
  propKey: string,
  wrapper: IAnyCallback,
  force = false
) {
  if (!sourceObj) return
  if (propKey in sourceObj || force) {
    const originalFn = sourceObj[propKey]
    const wrappedFn = wrapper(originalFn)
    if (typeof wrappedFn === 'function') {
      sourceObj[propKey] = wrappedFn
    }
  }
}

export const throttle = (fn: IAnyCallback, delay: number) => {
  let canCall = true
  return function (ctx: any, ...args: any[]) {
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

// > 1.toString();
// Uncaught SyntaxError: Invalid or unexpected token
// > Object.prototype.toString.call(1)
// '[object Number]'
export function typeofAny(target: any): string {
  // Object.prototype.toString.call(1) === '[object Number]'
  return Object.prototype.toString.call(target).slice(8, -1)
}

export function validateType(
  target: any,
  targetName: string,
  expectType: string
): boolean {
  if (!target) return false
  if (typeofAny(target) === expectType) return true
  console.error(
    `[trace-dev] ${targetName}: Expect ${expectType}, actually ${typeofAny(target)}`
  )
  return false
}

export function generateUUID(): string {
  let t = new Date().getTime()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (t + Math.random() * 16) % 16 | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    t = Math.floor(t / 16)
    return v.toString(16)
  })
}

export function unknown2str(target: unknown): string {
  if (verifyType.isString(target)) {
    return target as string
  }
  if (verifyType.isUndefined(target)) {
    return 'undefined'
  }
  // JSON.stringify(undefined) === undefined
  // JSON.stringify(null) === 'null'
  return JSON.stringify(target)
}

export function sliceStr(str: string, sliceLength: number) {
  if (verifyType.isString(str)) {
    return (
      str.slice(0, sliceLength) +
      (str.length > sliceLength
        ? `: Slice the first ${sliceLength} characters`
        : '')
    )
  }
  return ''
}
