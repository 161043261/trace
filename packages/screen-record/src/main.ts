import { record } from 'rrweb'
import pako from 'pako'
import { IDataReporter } from '@trace-dev/types'
import { generateUUID, getTimestamp, MinHeap, traceDev } from '@trace-dev/utils'
import { TraceType, OkOrError } from '@trace-dev/constants'

export function screenRecorder(dataReporter: IDataReporter, screenRecordDuration: number) {
  const recordEventHeap = new MinHeap()
  record({
    emit(ev, isCheckout) {
      if (isCheckout) {
        if (traceDev.hasError) {
          const screenRecordId = traceDev.screenRecordId
          traceDev.screenRecordId = generateUUID()
          dataReporter.send({
            name: 'screenRecord',
            okOrError: OkOrError.Error,
            timestamp: getTimestamp(),
            traceType: TraceType.ScreenRecord,
            screenRecordId: screenRecordId,
            recordEvents: compress(recordEventHeap.getAndClearHeap())
          })
          traceDev.hasError = false
        } else {
          traceDev.screenRecordId = generateUUID()
          recordEventHeap.clearHeap()
        }
      }
      recordEventHeap.push(ev)
    },
    recordCanvas: true,
    checkoutEveryNms: 1000 * screenRecordDuration
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
