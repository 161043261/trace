import { TraceType } from '@trace-dev/constants'
import { ITraceOptions } from '@trace-dev/types'
import { traceDev } from '@trace-dev/utils'
import { dataReporter } from './main'

export class TraceOptions implements ITraceOptions {
  dsn = ''
  defaultOptions = {
    dsn: '',
    projectId: 'undefined',
    disabled: false,
    userId: 'undefined',
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
    screenRecordDuration: 10,
    screenRecordTraceTypeList: [
      TraceType.Error,
      TraceType.UnhandledRejection,
      TraceType.Resource,
      TraceType.Fetch,
      TraceType.Xhr
    ],
    hasSkeleton: false,
    whiteScreenElements: ['html', 'body', '#app', '#root'],
    // ignoredUrlRegExp?: RegExp // 接口正则
    clickThrottleDelay: 0,
    requestTimeout: 10, // 单位 s
    maxBreadcrumbs: 20,
    repeatSourceCodeError: false
  }

  static #traceOptions = new TraceOptions()

  public static get traceOptions() {
    return this.#traceOptions
  }

  setOptions(options: ITraceOptions) {
    this.dsn = options.dsn
    traceDev.options = { ...this.defaultOptions, ...options }
    dataReporter.setOptions(options)
  }
}
