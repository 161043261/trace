import { TraceType } from '@trace-dev/constants'
import { ITraceOptions } from '@trace-dev/types'
import { traceDev } from '@trace-dev/utils'
import { dataReporter } from './main'

export class OptionsHelper {
  dsn = ''

  defaultOptions: ITraceOptions = {
    dsn: '',
    projectId: 'unknown',
    disabled: false,
    userId: 'unknown',
    traceXhr: true,
    traceFetch: true,
    traceClick: true,
    traceError: true,
    traceUnhandledRejection: true,
    traceHashChange: true,
    traceHistory: true,
    tracePerformance: true,
    traceScreenRecord: true,
    traceWhiteScreen: true,
    useImageReport: true,
    screenRecordEveryNms: 3000,
    screenRecordTraceTypeList: [
      TraceType.Error,
      TraceType.UnhandledRejection,
      TraceType.Resource,
      TraceType.Fetch,
      TraceType.Xhr
    ],
    hasSkeleton: false,
    containerElements: ['html', 'body', '#app', '#root'],
    // ignoredUrlRegExp?: RegExp // 接口正则
    clickThrottleDelay: 0,
    requestTimeoutNms: 3000, // 单位 ms
    maxBreadcrumbs: 20,
    repeatSourceCodeError: false
  }

  static #optionsHelper = new OptionsHelper()

  public static get optionsHelper() {
    return this.#optionsHelper
  }

  setOptions(options: Partial<ITraceOptions> & { dsn: string }) {
    this.dsn = options.dsn
    traceDev.options = { ...this.defaultOptions, ...options }
    dataReporter.setOptions(traceDev.options)
  }
}
