// pnpm add @trace-dev/constants --filter @trace-dev/core
// pnpm add @trace-dev/utils --filter @trace-dev/core
// pnpm add @trace-dev/types --filter @trace-dev/core

import PerformancePlugin from '@trace-dev/performance'
import ScreenRecordPlugin from '@trace-dev/screen-record'
import { AnyFn, ITraceOptions } from '@trace-dev/types'
import { nativeTryCatch } from '@trace-dev/utils'
import { TraceOptions } from './main'

function init(option: ITraceOptions) {
  const traceOptions = TraceOptions.traceOptions
  traceOptions.setOptions(option)
}

export const vuePluginObj = {
  install(app: { config: { errorHandler: AnyFn } }, options: ITraceOptions) {
    app.config.errorHandler = (err, instance, info) => {
      // 错误上报
      // err 错误对象
      // instance 触发该错误的组件实例
      // info 错误来源信息, 例如错误在哪个生命周期钩子上抛出
      console.error(err, instance, info)
      init(options)
    }
  }
}

// 也可以是一个安装函数
export function vuePluginFn(app: { config: { errorHandler: AnyFn } }, options: ITraceOptions) {
  app.config.errorHandler = (err, instance, info) => {
    // 错误上报
    // err 错误对象
    // instance 触发该错误的组件实例
    // info 错误来源信息, 例如错误在哪个生命周期钩子上抛出
    console.error(err, instance, info)
    init(options)
  }
}

export function use(Plugin: typeof PerformancePlugin | typeof ScreenRecordPlugin) {
  const plugin = new Plugin()
  nativeTryCatch(() => {
    plugin.init()
  })
}
