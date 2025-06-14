// pnpm add @trace-dev/constants --filter @trace-dev/core
// pnpm add @trace-dev/utils --filter @trace-dev/core
// pnpm add @trace-dev/types --filter @trace-dev/core
// pnpm install error-stack-parser --filter @trace-dev/core
import PerformancePlugin from '@trace-dev/performance'
import ScreenRecordPlugin from '@trace-dev/screen-record'
import { ITraceOptions } from '@trace-dev/types'
import { nativeTryCatch } from '@trace-dev/utils'
import { batchAddTraceHandlers, OptionsHelper, traceHandler } from './main'
import { SDK_NAME, SDK_VERSION } from '@trace-dev/constants'

function init(options: Partial<ITraceOptions> & { dsn: string }) {
  const optionsHelper = OptionsHelper.optionsHelper
  optionsHelper.setOptions(options)
  batchAddTraceHandlers()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function vuePluginFn(app: any, options: Partial<ITraceOptions> & { dsn: string }) {
  app.config.errorHandler = (err: unknown, instance: unknown, info: string) => {
    // 错误上报
    // err 错误对象
    // instance 触发该错误的组件实例
    // info 错误来源信息, 例如错误在哪个生命周期钩子上抛出
    console.error(err, instance, info)
  }
  init(options)
}

export function use(Plugin: typeof PerformancePlugin | typeof ScreenRecordPlugin) {
  const plugin = new Plugin()
  nativeTryCatch(() => {
    plugin.init()
  }, console.error)
}

export function errorBoundary(err: Error) {
  traceHandler.handleError(err)
}

export default {
  SDK_VERSION,
  SDK_NAME,
  init,
  install: vuePluginFn,
  use
}
