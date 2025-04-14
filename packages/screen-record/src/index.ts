// pnpm add @trace-dev/constants --filter @trace-dev/screen-record
// pnpm add @trace-dev/utils --filter @trace-dev/screen-record
// pnpm add @trace-dev/types --filter @trace-dev/screen-record
// pnpm install pako rrweb --filter @trace-dev/screen-record
// pnpm install @types/pako -D --filter @trace-dev/screen-record
import { IScreenRecordOptions, TracePlugin } from '@trace-dev/types'
import { screenRecorder } from './main'
import { TraceType } from '@trace-dev/constants'
import { generateUUID, traceDev } from '@trace-dev/utils'

export default class ScreenRecordPlugin extends TracePlugin {
  duration = 10 // 默认屏幕录制时长
  traceTypeList: TraceType[] = [
    TraceType.Error,
    TraceType.UnhandledRejection,
    TraceType.Resource,
    TraceType.Fetch,
    TraceType.Xhr
  ]
  constructor(options?: IScreenRecordOptions) {
    super(TraceType.ScreenRecord /** traceType */)
    this.type = TraceType.ScreenRecord
    if (options) {
      this.duration = options.duration
      this.traceTypeList = options.traceTypeList
    }
  }

  init() {
    traceDev.options.traceScreenRecord = true
    traceDev.options.screenRecordTraceTypeList = this.traceTypeList
    // 初始化 screenRecordId
    traceDev.screenRecordId = generateUUID()
    screenRecorder(traceDev.dataReporter, this.duration)
  }
}
