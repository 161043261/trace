import { TraceType } from '@trace-dev/constants'
import { VoidFn, AnyFn } from '@trace-dev/types'
import { nativeTryCatch } from '@trace-dev/utils'

const traceType2handler: Record<TraceType, VoidFn> = {} as Record<TraceType, VoidFn>

export function publishTraceHandlers(type: TraceType, ...args: unknown[]) {
  if (!traceType2handler[type]) {
    console.log(`${type}'s handler not found`)
    return
  }
  nativeTryCatch(() => traceType2handler[type](...args), console.error)
}

export function subscribeTraceHandler(traceType: TraceType, handler: AnyFn) {
  traceType2handler[traceType] = handler
}
