// pnpm add @trace-dev/constants --filter @trace-dev/screen-record
// pnpm add @trace-dev/utils --filter @trace-dev/screen-record
// pnpm add @trace-dev/types --filter @trace-dev/screen-record
// pnpm install pako rrweb --filter @trace-dev/screen-record
// pnpm install @types/pako -D --filter @trace-dev/screen-record
import { TracePlugin } from '@trace-dev/types'
import { screenRecorder } from './main'
import { TraceType } from '@trace-dev/constants'
import { traceDev } from '@trace-dev/utils'

export default class ScreenRecordPlugin extends TracePlugin {
  everyNms = 3000 // 默认屏幕录制时长
  traceTypeList: TraceType[] = [
    TraceType.Error,
    TraceType.UnhandledRejection,
    TraceType.Resource,
    TraceType.Fetch,
    TraceType.Xhr
  ]
  constructor(options?: { traceTypeList: TraceType[]; everyNms: number }) {
    super(TraceType.ScreenRecord /** traceType */)
    this.type = TraceType.ScreenRecord
    if (options) {
      this.everyNms = options.everyNms
      this.traceTypeList = options.traceTypeList
    }
  }

  init() {
    traceDev.options.traceScreenRecord = true
    traceDev.options.screenRecordTraceTypeList = this.traceTypeList
    screenRecorder(this.everyNms, traceDev.dataReporter)
  }
}
