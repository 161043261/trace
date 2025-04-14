import { BreadcrumbType, TraceType, OkOrError, RequestType } from '@trace-dev/constants'
import { ITraceOptions } from './options'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyFn = (...args: any[]) => any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type VoidFn = (...args: any[]) => void
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyObject = Record<number | string | symbol, any>

export interface IBaseData {
  name?: string
  okOrError?: OkOrError
  timestamp?: number
  traceType?: TraceType
}

export interface IBreadcrumbItem {
  okOrError?: OkOrError
  timestamp: number
  traceType?: TraceType
  breadcrumbType?: BreadcrumbType
  data: unknown
}

export interface IDataReporter {
  send(data: IReportData): Promise<void>
}

//! [暂未使用]
export interface IUserEventData {
  traceType: TraceType // 事件类型
  behaviorType: BreadcrumbType // 用户行为类型
  statusCode: OkOrError
  data: unknown
  message: string
  name?: string
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

export interface IErrorData extends ISourceCodeError, IResourceError {
  errorType: TraceType.Vue | TraceType.React | TraceType.Resource
  error?: unknown
  message: string
}

export interface IHttpData extends IBaseData {
  // name?: string
  // okOrError?: OkOrError
  // timestamp?: number
  // traceType?: TraceType
  method: string
  url: string // 接口地址
  elapsedTime: number // 接口调用时长
  message?: string // 接口信息
  statusCode: number // http 状态码
  requestType: RequestType // 请求类型: xhr 或 fetch
  requestData?: unknown
  responseData?: unknown
}

export interface ILongTaskData extends IBaseData {
  // name?: string
  // okOrError?: OkOrError
  // timestamp?: number
  // traceType?: TraceType
  longTask?: PerformanceEntry // 长任务列表
}

export interface IMemoryData extends IBaseData {
  // name?: string
  // okOrError?: OkOrError
  // timestamp?: number
  // traceType?: TraceType
  memory?: {
    jsHeapSizeLimit: number
    totalJSHeapSize: number
    usedJSHeapSize: number
  }
}

export interface IReportData extends IBaseData {
  name?: string
  okOrError?: OkOrError // 事件状态
  timestamp?: number // 发生的时间戳
  type?: TraceType // 事件类型
  pageUrl?: string // 页面地址
  userId?: string
  reportId?: string // 上报数据的 ID
  projectId?: string // 前端项目的 ID
  sdkVersion?: string // SDK 的版本号
  breadcrumb?: IBreadcrumbItem[]
  // 设备信息
  deviceInfo?: IDeviceInfo
}

// TraceType.Performance 性能指标
export interface IPerformanceData extends IBaseData {
  // name?: string
  // okOrError?: OkOrError
  // timestamp?: number
  // traceType?: TraceType
  score?: number // 分数
  poorOrGood?: 'poor' | 'good'
  entryList?: PerformanceResourceTiming[]
}

// 资源加载错误
export interface IResourceError extends IBaseData {
  // name?: string
  // okOrError?: OkOrError
  // timestamp?: number
  // traceType?: TraceType
  src?: string
  href?: string
  resourceName?: string
  message?: string // 资源加载失败的信息
}

export interface IRouteHistory {
  from: string
  to: string
}

// todo 屏幕录制信息
export interface IScreenRecordData extends IBaseData {
  // name?: string
  // okOrError?: OkOrError
  // timestamp?: number
  // traceType?: TraceType
  screenRecordId?: string
  recordEvents?: string
}

// 源代码错误
export interface ISourceCodeError extends IBaseData {
  // name?: string
  // okOrError?: OkOrError
  // timestamp?: number
  // traceType?: TraceType
  column?: number
  line?: number
  message?: string
  filename?: string // 报错的文件名
}

export interface ISubscribeHandler {
  type: TraceType
  callback: AnyFn
}

// 参考 trace.d.ts
export interface ITraceDev {
  hasError: boolean // 某个时间段, 代码是否报错
  errorHashes: Set<string> // 源代码错误的 hash 值的集合
  screenRecordEvents: string[] // 屏幕录制信息
  screenRecordId: string // 屏幕录制 ID
  whiteScreenTimer: number // 循环检测白屏使用的定时器 ID
  dataReporter: IDataReporter // 上报的数据
  options: ITraceOptions // 配置信息
  // todo
  replacedRecord: Record<string, boolean>
  deviceInfo: IDeviceInfo // 设备信息
}

export abstract class TracePlugin {
  public type: TraceType
  constructor(type: TraceType) {
    this.type = type
  }
  abstract init(): void
}

export interface ITraceHandler {
  traceType: TraceType
  handler: AnyFn
}
