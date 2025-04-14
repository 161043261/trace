import { TraceType } from '@trace-dev/constants'
import { VoidFn, ITraceHandler } from '@trace-dev/types'
import { isReplaced, nativeTryCatch, setReplaceRecord } from '@trace-dev/utils'

const traceType2fnList: Record<TraceType, VoidFn[]> = {} as Record<TraceType, VoidFn[]>

export function subscribeTraceHandlers(traceHandler: ITraceHandler) {
  if (isReplaced(traceHandler.traceType)) return false
  setReplaceRecord(traceHandler.traceType, true)
  traceType2fnList[traceHandler.traceType].push(...traceHandler.fnList)
  return true
}

export function publishTraceHandlers(type: TraceType, ...args: unknown[]) {
  if (!traceType2fnList[type]) return
  traceType2fnList[type].forEach((fn) => nativeTryCatch(() => fn(...args), console.error))
}
