import { BreadcrumbType, TraceType, OkOrError, RequestType } from '@trace-dev/constants'
import { ITraceOptions } from './options'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyFn = (...args: any[]) => any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type VoidFn = (...args: any[]) => void
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyObject = Record<number | string | symbol, any>

export interface IAnyError extends Error {
  target?: {
    localName?: string
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error?: any
}

export interface IBaseData {
  name?: string
  okOrError: OkOrError
  timestamp: number
  traceType: TraceType
}

export interface IBreadcrumbItem {
  okOrError: OkOrError
  timestamp: number
  traceType: TraceType
  breadcrumbType: BreadcrumbType
  data: unknown
  [key: string]: unknown
}

export interface IDataReporter {
  send(
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
  ): Promise<void>
}

export interface IDeviceInfo {
  browserVersion: string | number // 浏览器的版本号
  browserName: string // 例如 chrome
  osVersion: string | number // 操作系统的版本号
  osName: string // 操作系统
  userAgent: string // 用户代理 (设备详情)
  deviceType: string // 设备种类, 例如 pc
  deviceModel: string // 设备描述
}

export interface IHttpData extends IBaseData {
  method: string
  url: string // 接口地址
  elapsedTime: number // 接口调用时长
  message: string // 接口信息
  statusCode: number // http 状态码
  requestType: RequestType // 请求类型: xhr 或 fetch
  requestData?: unknown
  responseData?: unknown
}

export interface ILongTaskData extends IBaseData {
  longTask: PerformanceEntry // 长任务列表
}

export interface IMemoryData extends IBaseData {
  memory: {
    jsHeapSizeLimit: number
    totalJSHeapSize: number
    usedJSHeapSize: number
  }
}

export interface IReportData extends IBaseData {
  pageUrl: string // 页面地址
  userId: string
  reportId: string // 上报数据的 ID
  projectId: string // 前端项目的 ID
  sdkVersion: string // SDK 的版本号
  breadcrumb: IBreadcrumbItem[]
  // 设备信息
  deviceInfo: IDeviceInfo
  data?: unknown
}

// TraceType.Performance 性能指标
export interface IPerformanceData extends IBaseData {
  score: number // 分数
  poorOrGood: 'poor' | 'good'
  resourceList?: PerformanceResourceTiming[]
}

// 资源加载错误
export interface IResourceError extends IBaseData {
  src: string
  href: string
  localName: string
}

// 屏幕录制信息
export interface IScreenRecordData extends IBaseData {
  recordId: string
  recordEvents: string
}

// 源代码错误
export interface ISourceCodeError extends IBaseData {
  column: number
  line: number
  message: string
  filename: string // 报错的文件名
}

// 参考 trace.d.ts
export interface ITraceDev {
  hasError: boolean // 某个时间段, 代码是否报错
  errorHashes: Set<string> // 源代码错误的 hash 值的集合
  whiteScreenTimer: number | null | NodeJS.Timeout // 循环检测白屏使用的定时器 ID
  dataReporter?: IDataReporter // 上报的数据
  options: ITraceOptions // 配置信息
  deviceInfo: IDeviceInfo // 设备信息
}

export abstract class TracePlugin {
  public type: TraceType
  constructor(type: TraceType) {
    this.type = type
  }
  abstract init(): void
}
