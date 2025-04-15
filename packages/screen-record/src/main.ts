import { record } from 'rrweb'
import pako from 'pako'
import { IDataReporter, IScreenRecordData } from '@trace-dev/types'
import { generateUUID, getTimestamp, MinHeap, traceDev } from '@trace-dev/utils'
import { TraceType, OkOrError } from '@trace-dev/constants'

export function screenRecorder(screenRecordEveryNms: number, dataReporter?: IDataReporter) {
  const recordEventHeap = new MinHeap()
  record({
    emit(ev, isCheckout) {
      if (isCheckout) {
        if (traceDev.hasError) {
          dataReporter?.send({
            name: 'screenRecord',
            okOrError: OkOrError.Error,
            timestamp: getTimestamp(),
            traceType: TraceType.ScreenRecord,
            recordId: generateUUID(),
            recordEvents: compress(recordEventHeap.getAndClearHeap())
          } as IScreenRecordData)
          traceDev.hasError = false
        } else {
          recordEventHeap.clearHeap()
        }
      }
      recordEventHeap.push(ev)
    },
    recordCanvas: true,
    checkoutEveryNms: screenRecordEveryNms
  })
}

export function compress(data: unknown): string {
  if (!data) return ''
  const jsonStr = JSON.stringify(data) // json 字符串
  // const encoder = new TextEncoder()
  // const encodedUint8Arr = encoder.encode(jsonStr)
  // const base64Str = btoa(String.fromCharCode(...encodedUint8Arr))
  const gzippedUint8Arr = pako.gzip(jsonStr)
  return btoa(String.fromCharCode(...gzippedUint8Arr))
}
