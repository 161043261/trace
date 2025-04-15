import { TraceType } from '@trace-dev/constants'
import { IBreadcrumbItem, IReportData } from './main'

// traceDev 配置
export interface ITraceOptions {
  dsn: string // 数据上报的地址
  projectId: string // 前端项目的 ID
  disabled: boolean // 是否禁用 SDK
  userId: string // 用户 ID
  traceXhr: boolean // 是否监听 XHRHttpRequest 请求
  traceFetch: boolean // 是否监听 fetch 请求
  traceClick: boolean // 是否监听 click 用户点击事件
  traceError: boolean // 是否监听 error 错误事件
  traceUnhandledRejection: boolean // 是否监听异步错误
  traceHashChange: boolean // 是否监听 hash 的改变 (路由 hash 模式)
  traceHistory: boolean // 是否监听 history 模式 (路由 history 模式)
  tracePerformance: boolean // 是否计算页面性能指标
  traceScreenRecord: boolean // 是否开启屏幕录制
  traceWhiteScreen: boolean // 是否开启白屏检测
  useImageReport: boolean // 是否上报图片错误
  screenRecordEveryNms: number // 单次屏幕录制时长
  screenRecordTraceTypeList: TraceType[]
  hasSkeleton: boolean // 白屏时是否有骨架屏
  containerElements: string[]
  clickThrottleDelay: number // click 点击事件的节流时长
  requestTimeoutNms: number // 请求的超时时长
  maxBreadcrumbs: number // 存储用户行为的小根堆的堆容量
  repeatSourceCodeError: boolean // 是否重复上报源代码错误
  ignoredUrlRegExp?: RegExp // 接口正则
  beforePushBreadcrumb?: (data: IBreadcrumbItem) => IBreadcrumbItem // 入堆前的 hook
  beforeReportData?: (data: IReportData) => Promise<IReportData> // 数据上报前的 hook
  httpErrorHandler?: (data: unknown) => boolean // 处理 http 错误的回调函数
}
