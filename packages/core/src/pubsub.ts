import { TraceType } from '@trace-dev/constants'
import { VoidFn, ITraceHandler } from '@trace-dev/types'
import { isReplaced, nativeTryCatch, setReplaceRecord } from '@trace-dev/utils'

const traceType2handler: Record<TraceType, VoidFn> = {} as Record<TraceType, VoidFn>

export function subscribeTraceHandlers(traceHandler: ITraceHandler) {
  if (isReplaced(traceHandler.traceType)) return false
  setReplaceRecord(traceHandler.traceType, true)
  traceType2handler[traceHandler.traceType] = traceHandler.handler
  return true
}

export function publishTraceHandlers(type: TraceType, ...args: unknown[]) {
  if (!traceType2handler[type]) return
  nativeTryCatch(() => traceType2handler[type](...args), console.error)
}
