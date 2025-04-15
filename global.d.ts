declare interface Window {
  chrome: {
    app?: Record<string, unknown>
  }
  __traceDev__: {
    hasError: boolean // 某个时间段, 是否发生错误
    errorHashes: Set<string> // 源代码错误的 hash 值的集合
    whiteScreenTimer: number | null | NodeJS.Timeout // 循环检测白屏使用的定时器 ID
    options: unknown // 配置信息
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
