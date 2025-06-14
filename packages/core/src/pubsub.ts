import { TraceType } from '@trace-dev/constants'
import { VoidFn } from '@trace-dev/types'
import { nativeTryCatch } from '@trace-dev/utils'

const traceType2handler = new Map<TraceType, VoidFn>()

export function publishTraceHandlers(type: TraceType, ...args: unknown[]) {
  if (!traceType2handler.has(type)) {
    console.log(`${type}'s handler not found`)
    return
  }
  nativeTryCatch(() => traceType2handler.get(type)?.(...args), console.error)
}

export function subscribeTraceHandler(traceType: TraceType, handler: VoidFn) {
  traceType2handler.set(traceType, handler)
}
