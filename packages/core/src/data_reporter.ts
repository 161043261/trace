import { SDK_VERSION, TraceType } from '@trace-dev/constants'
import { IDataReporter, IReportData, IScreenRecordData, ITraceOptions } from '@trace-dev/types'
import { generateUUID, isBrowserEnv, traceDev, VoidFnQueue } from '@trace-dev/utils'

import { breadcrumb } from './main'

export class DataReporter implements IDataReporter {
  queue = new VoidFnQueue() // 回调函数队列
  dsn = traceDev.options.dsn // 数据上报的地址
  projectId = traceDev.options.projectId ?? 'undefined' // 前端项目的 ID
  userId = traceDev.options.userId ?? 'undefined' // 用户 ID
  useImageReport = traceDev.options.useImageReport ?? false
  beforeReportData = traceDev.options.beforeReportData
  reportId: string

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

  processReportData(data: IReportData): IReportData {
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
    if (!data.type || !excludeTraceTypes.includes(data.type)) {
      reportData.breadcrumb = breadcrumb.getHeap()
    }
    return reportData
  }

  isSdkDsn(url: string): boolean {
    return url === this.dsn
  }

  async send(data: IReportData) {
    const dsn = this.dsn
    if (dsn === '') {
      console.error('[trace-dev] DSN is empty')
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
      ;(data as IScreenRecordData).screenRecordId = traceDev.screenRecordId
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

const dataReporter = traceDev.dataReporter || (traceDev.dataReporter = new DataReporter())
export { dataReporter }
