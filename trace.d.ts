declare interface Performance {
  memory?: {
    jsHeapSizeLimit?: number
    totalJSHeapSize: number
    usedJSHeapSize: number
  }
}

declare interface Window {
  chrome: {
    app?: Record<string, unknown>
  }
  __traceDev__: {
    hasError: boolean // 某个时间段, 是否发生错误
    errorHashes: Set<string> // 存储源代码错误的 hash 值
    screenRecordEvents: string[] // 屏幕录制信息
    screenRecordId: string // 屏幕录制 ID
    timer: number // 循环检测白屏使用的定时器 ID
    reportData: unknown // 上报的数据
    options: unknown // 配置信息
    replacedRecord: Record<string, boolean>
    deviceInfo: {
      // 设备信息
      browserVersion: string | number // 浏览器的版本号
      browserName: string // 例如 chrome
      osVersion: string | number // 操作系统的版本号
      osName: string // 操作系统
      userAgent: string // 用户代理 (设备详情)
      deviceType: string // 设备种类, 例如 pc
      deviceModel: string // 设备描述
    }
  }
}
