interface Window {
  chrome: {
    app?: Record<string, unknown>
  }
  __traceDev__: {
    hasError: boolean // 某个时间段, 是否发生错误
    errorHashes: Set<string> // 源代码错误的 hash 值的集合
    screenRecordEvents: string[] // 屏幕录制信息
    screenRecordId: string // 屏幕录制 ID
    whiteScreenTimer: number // 循环检测白屏使用的定时器 ID
    reportData: unknown // 上报的数据
    options: unknown // 配置信息
    replacedRecord: unknown
    deviceInfo: unknown
  }
}

declare interface Performance {
  memory?: {
    jsHeapSizeLimit: number
    totalJSHeapSize: number
    usedJSHeapSize: number
  }
}
