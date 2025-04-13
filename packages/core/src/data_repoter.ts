import {
  IDataReporter,
  IHttpData,
  ILongTaskData,
  IMemoryData,
  IPerformanceData,
  IReportData,
  IResourceError,
  IScreenRecord,
  ISourceCodeError,
  ITraceOptions
} from '@trace-dev/types'
import { traceDev, VoidFnQueue } from '@trace-dev/utils'

export class DataReporter implements IDataReporter {
  queue = new VoidFnQueue() // 回调函数队列
  projectId = '' // 前端项目的 ID
  dsn = '' // 数据上报的地址
  userId = '' // 用户 ID
  // 数据上报前的 hook
  beforeReportData: (data: IReportData) => Promise<IReportData | boolean> = async (data) => data

  sendBeacon(url: string, data: unknown): boolean {
    // 异步, 使用 POST 方法将少量数据发送到服务器
    return navigator.sendBeacon(url, JSON.stringify(data))
  }

  async send(
    data:
      | IReportData
      | IHttpData
      | IResourceError
      | ILongTaskData
      | IPerformanceData
      | IMemoryData
      | ISourceCodeError
      | IScreenRecord
  ) {
    const dsn = this.dsn
    if (dsn === '') {
      console.error('Dsn is empty')
      return
    }
    const options = traceDev.options as ITraceOptions
    if (
      options.traceScreenRecord &&
      options.screenRecordTraceTypeList &&
      data.traceType &&
      options.screenRecordTraceTypeList.includes(data.traceType)
    ) {
      traceDev.hasError = true
      ;(data as IScreenRecord).screenRecordId = traceDev.screenRecordId
    }
    // todo
  }
}
