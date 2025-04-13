// import PerformancePlugin from '@trace-dev/performance'
// import { AnyFn } from '@trace-dev/types'
// import { nativeTryCatch } from '@trace-dev/utils'

// const vuePlugin = {
//   install(app: {
//     config: {
//       errorHandler: AnyFn
//     }
//   }) {
//     app.config.errorHandler = (err, instance, info) => {
//       // 错误上报
//       // err 错误对象
//       // instance 触发该错误的组件实例
//       // info 错误来源信息, 例如错误在哪个生命周期钩子上抛出
//       console.error(err)
//     }
//   }
// }

// export function use(Plugin: typeof PerformancePlugin, options: unknown) {
//   const plugin = new Plugin()
//   nativeTryCatch(() => {
//     plugin.useSdkCore({})
//   })
// }
