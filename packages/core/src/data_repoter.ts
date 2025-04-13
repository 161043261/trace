import { SDK_VERSION, TraceType } from '@trace-dev/constants'
import {
  IUserInfo,
  IDataReporter,
  IReportData,
  IScreenRecord,
  ITraceOptions
} from '@trace-dev/types'
import { generateUUID, isBrowserEnv, traceDev, VoidFnQueue } from '@trace-dev/utils'

export class DataReporter implements IDataReporter {
  queue = new VoidFnQueue() // 回调函数队列
  projectId = traceDev.options.projectId ?? 'undefined' // 前端项目的 ID
  dsn = traceDev.options.dsn // 数据上报的地址
  userId = traceDev.options.userId ?? 'undefined' // 用户 ID
  beforeReport = traceDev.options.beforeReport
  reportId: string

  constructor() {
    this.reportId = generateUUID()
  }

  // 数据上报前的 hook
  async beforePost(data: IReportData) {
    const reportData = this.getReportData(data)
    if (this.beforeReport) {
      return this.beforeReport(reportData)
    }
    return reportData
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

  getUserInfo(): IUserInfo {
    return {
      projectId: this.projectId,
      sdkVersion: SDK_VERSION,
      userId: this.userId
    }
  }

  getReportData(data: { type?: TraceType }): IReportData {
    const reportData: IReportData = {
      ...data,
      ...this.getUserInfo(),
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
    const reportData = await this.beforePost(data)
    if (isBrowserEnv() && reportData) {
      const beaconOk = this.tryReportByBeacon(this.dsn, reportData)
      if (!beaconOk) {
        return this.reportByFetch(dsn, reportData)
      }
    }
  }
}

const dataReporter = traceDev.dataReporter || (traceDev.dataReporter = new DataReporter())
export { dataReporter }
