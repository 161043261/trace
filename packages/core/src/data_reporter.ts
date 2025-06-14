import { SDK_VERSION, TraceType } from '@trace-dev/constants'
import {
  IBaseData,
  IDataReporter,
  IHttpData,
  ILongTaskData,
  IPerformanceData,
  IReportData,
  IResourceError,
  IScreenRecordData,
  ISourceCodeError,
  ITraceOptions
} from '@trace-dev/types'
import { generateUUID, isBrowserEnv, traceDev, VoidFnQueue } from '@trace-dev/utils'
import { breadcrumb } from './main'

export class DataReporter implements IDataReporter {
  queue = new VoidFnQueue() // 回调函数队列
  reportId: string
  dsn = '' // 必填
  projectId = 'unknown'
  userId = 'unknown'
  useImageReport = false
  beforeReportData?: (data: IReportData) => Promise<IReportData>

  static #dataReporter: DataReporter

  static get dataReporter() {
    if (!this.#dataReporter) {
      this.#dataReporter = new DataReporter()
    }
    return this.#dataReporter
  }

  setOptions(options: ITraceOptions) {
    const { dsn, projectId, userId, useImageReport, beforeReportData } = options
    this.dsn = dsn
    this.projectId = projectId
    this.userId = userId
    this.useImageReport = useImageReport
    this.beforeReportData = beforeReportData
  }

  constructor() {
    this.reportId = generateUUID()
  }

  tryReportByBeacon(url: string, data: unknown): boolean {
    // 异步, 使用 POST 方法将少量数据发送到服务器
    return navigator.sendBeacon(url, JSON.stringify(data))
  }

  reportByFetch(url: string, data: unknown) {
    const requestFn = () => {
      fetch(url, {
        method: 'POST',
        body: JSON.stringify(data),
        // headers: [['Content-Type', 'application/json']]
        headers: { 'Content-Type': 'application/json' }
      })
    }
    this.queue.push(requestFn)
  }

  reportByImage(url: string, data: unknown) {
    const requestFn = () => {
      const image = new Image()
      const sep = url.includes('?') ? '&' : '?'
      image.src = `${url}${sep}data=${encodeURIComponent(JSON.stringify(data))}`
    }
    this.queue.push(requestFn)
  }

  processReportData(
    data:
      | IReportData
      | IBaseData
      | IHttpData
      | ILongTaskData
      | IReportData
      | IPerformanceData
      | IResourceError
      | IScreenRecordData
      | ISourceCodeError
  ): IReportData {
    const reportData: IReportData = {
      ...data,
      projectId: this.projectId,
      sdkVersion: SDK_VERSION,
      userId: this.userId,
      reportId: this.reportId,
      pageUrl: document.location.href,
      deviceInfo: traceDev.deviceInfo,
      breadcrumb: []
    }
    const excludeTraceTypes = [TraceType.Performance, TraceType.ScreenRecord, TraceType.WhiteScreen]
    if (!data.traceType || !excludeTraceTypes.includes(data.traceType)) {
      reportData.breadcrumb = breadcrumb.getHeap()
    }
    return reportData
  }

  isSdkDsn(url: string): boolean {
    return url === this.dsn
  }

  async send(
    data:
      | IReportData
      | IBaseData
      | IHttpData
      | ILongTaskData
      | IReportData
      | IPerformanceData
      | IResourceError
      | IScreenRecordData
      | ISourceCodeError
  ) {
    const dsn = this.dsn
    if (dsn === '') {
      console.error('[trace-dev] DSN is empty')
      return
    }
    const options = traceDev.options
    if (options.screenRecordTraceTypeList.includes(data.traceType)) {
      traceDev.hasError = true
    }
    let reportData = this.processReportData(data)
    if (this.beforeReportData) {
      reportData = await this.beforeReportData(reportData)
    }
    if (isBrowserEnv() && reportData) {
      const beaconOk = this.tryReportByBeacon(this.dsn, reportData)
      if (!beaconOk) {
        return this.useImageReport
          ? this.reportByImage(this.dsn, reportData)
          : this.reportByFetch(dsn, reportData)
      }
    }
  }
}

traceDev.dataReporter = DataReporter.dataReporter
export default DataReporter.dataReporter
