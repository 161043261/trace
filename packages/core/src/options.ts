import { TraceType } from '@trace-dev/constants'
import { ITraceOptions } from '@trace-dev/types'
import { batchSetReplaceRecord, traceDev } from '@trace-dev/utils'

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
    repeatSourceCodeError: false,
    maxBreadcrumbs: 20,
    beforePushBreadcrumb: undefined,
    beforeReportData: undefined,
    whiteScreenElements: ['html', 'body', '#app', '#root']

    // hasSkeleton?: false,
    // urlRegExp?: RegExp
    // clickThrottleDelay?: number
    // requestTimeout?: number
    // handleHttpResponse ?: (data: unknown) => boolean
  }

  static #traceOptions = new TraceOptions()

  public static get traceOptions() {
    return this.#traceOptions
  }

  setOptions(options: ITraceOptions) {
    this.dsn = options.dsn
    traceDev.options = { ...this.defaultOptions, ...options }
    batchSetReplaceRecord()
  }
}
