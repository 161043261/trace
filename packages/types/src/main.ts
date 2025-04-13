import { BreadcrumbType, EventType, StatusCode } from '@trace-dev/constants'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyFn = (...args: any[]) => any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type VoidFn = (...args: any[]) => void
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyObject = Record<number | string | symbol, any>

// todo: Without 在表达什么
export type Without<T, U> = Partial<Record<Exclude<keyof T, keyof U>, never>>
// todo: Xor 又在表达什么
export type Xor<T, U> = (Without<T, U> & U) | (Without<U, T> & T)

// 身份验证信息
export interface IAuthInfo {
  apiKey: string
  sdkVersion: string
  userId?: string
}

// 用户行为
export interface IBehaviorData {
  eventType: EventType // 事件类型
  behaviorType: BreadcrumbType // 用户行为类型
  statusCode: StatusCode
  data: Xor<IHttpData, Xor<ISourceCodeError, IRouteHistory>>
  message: string
  name?: string
}

export interface IBreadcrumbData {
  eventType: EventType
  behaviorType: BreadcrumbType
  statusCode: StatusCode
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

export interface IErrorData {
  localName?: string
  error?: unknown
  message: string
}

// http 请求
export interface IHttpData {
  type?: string
  method?: string
  time: number
  url: string // 接口地址
  elapsedTime: number // 接口调用时长
  message: string // 接口信息
  statusCode?: number // http 状态码
  status: string // 接口状态
  request?: {
    how: 'xhr' | 'fetch' // 请求类型: xhr 或 fetch
    method: string // 请求方式
    data: unknown
  }
  response?: {
    statusCode: number // http 状态码
    data: unknown
  }
}
// 长任务列表
export interface ILongTask {
  timestamp: number
  name: string // longTask
  longTask: [] // 长任务列表
}

// 内存信息
export interface IMemoryData {
  name: string
  memory: {
    jsHeapSizeLimit: number
    totalJSHeapSize: number
    usedJSHeapSize: number
  }
}

export interface IReportData
  extends IHttpData,
    IResourceError,
    ILongTask,
    IPerformanceData,
    IMemoryData,
    ISourceCodeError,
    IScreenRecord {
  type: string // 事件类型
  pageUrl: string // 页面地址
  timestamp: number // 发生的时间戳
  uuid: string // 页面的唯一标识
  apiKey: string // 前端项目的 ID
  status: string // 事件状态
  sdkVersion: string // SDK 的版本号
  breadcrumb: IBreadcrumbData[]
  // 设备信息
  deviceInfo: IDeviceInfo
}

// 性能指标
export interface IPerformanceData {
  name: string // FCP
  value: number // 数值
  level: string // 等级
}

export interface IResourceData {
  src?: string
  href?: string
  localName?: string
}

// 资源加载失败
export interface IResourceError {
  timestamp: number
  name: string // JS 脚本等
  message: string // 资源加载失败的信息
}

export interface IRouteHistory {
  from: string
  to: string
}

// todo 屏幕录制信息
export interface IScreenRecord {
  key: string
  events: string
}

export interface ISdkCore {
  dataReporter: unknown // 数据上报
  breadcrumb: unknown // 用户行为
  options: unknown // 配置信息
  publish: unknown // 发布消息
}

// 源代码错误
export interface ISourceCodeError {
  column: number
  line: number
  message: string
  filename: string // 报错的文件名
}

export interface ISubscribeHandler {
  type: EventType
  callback: AnyFn
}

export interface ITraceDev {
  hasError: boolean // 某个时间段, 代码是否报错
  screenRecordEvents: string[] // 屏幕录制信息
  screenRecordId: number // 屏幕录制 ID
  loopTimer: number // 循环检测白屏使用的定时器 ID
  reportData: IReportData // 上报的数据
  options: unknown // 配置信息
  replacedSet: Record<string, boolean>
  deviceInfo: IDeviceInfo // 设备信息
}

export abstract class BasePlugin {
  public type: string
  constructor(type: string) {
    this.type = type
  }
  abstract setOptions(options: unknown): void
  abstract setSdkCore(sdkCore: ISdkCore): void
  abstract transformer(data: unknown): void
}
