import { OkOrError, RequestMethod, RequestType, TraceType } from '@trace-dev/constants'
import { IHttpData, VoidFn } from '@trace-dev/types'
import { getTimestamp, replaceAop, supportHistory, throttle, traceDev } from '@trace-dev/utils'
import { publishTraceHandlers, dataReporter } from './main'

function isIgnoredUrl(url: string) {
  return traceDev.options.ignoredUrlRegExp && traceDev.options.ignoredUrlRegExp.test(url)
}

export function replaceAndPublish(type: TraceType) {
  switch (type) {
    case TraceType.WhiteScreen: // WhiteScreen
      //! handleWhiteScreen()
      publishTraceHandlers(TraceType.WhiteScreen)
      break

    case TraceType.Click: // Click
      listenAndPublishClick()
      break

    case TraceType.Error: // Error
      listenAndPublishError()
      break

    case TraceType.Fetch: // Fetch
      replaceAndPublishFetch()
      break

    case TraceType.HashChange: // HashChange
      listenAndPublishHashChange()
      break

    case TraceType.History: // History
      replaceAndPublishHistory()
      break

    case TraceType.Xhr: // Xhr
      replaceAndPublishXhr()
      break

    case TraceType.UnhandledRejection: // UnhandledRejection
      listenAndPublishUnhandledRejection()
      break
  }
}

function replaceAndPublishXhr() {
  const originalXhrProto = XMLHttpRequest.prototype
  replaceAop(originalXhrProto, 'open', (originalOpen: VoidFn) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return function (this: any, ...args: string[]) {
      console.log('[debug]', this)
      const xhrTraceData: IHttpData = {
        okOrError: OkOrError.Ok,
        timestamp: getTimestamp(),
        traceType: TraceType.Xhr,
        method: args[0].toUpperCase(),
        url: args[1],
        elapsedTime: 0,
        message: '',
        statusCode: 0,
        requestType: RequestType.Xhr
      }
      this.xhrTraceData = xhrTraceData
      originalOpen.apply(this, args)
    }
  })

  replaceAop(originalXhrProto, 'send', (originalSend: VoidFn) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return function (this: any, ...args: unknown[]) {
      console.log('[debug]', this)
      const { method, url } = this.xhrTraceData
      this.addEventListener('loadend', () => {
        if ((method === RequestMethod.Post && dataReporter.isSdkDsn(url)) || isIgnoredUrl(url)) {
          return
        }
        const { responseType, response, status } = this
        this.xhrTraceData.requestData = args[0]
        const endTime = getTimestamp()
        this.xhrTraceData.statusCode = Number.parseInt(status)
        if (['', 'json', 'text'].includes(responseType)) {
          this.xhrTraceData.responseData = JSON.stringify(response)
        }
        this.xhrTraceData.elapsedTime = endTime - this.xhrTraceData.timestamp
        //! handleHttp(type: TraceType, data: IHttpData)
        publishTraceHandlers(TraceType.Xhr, this.xhrTraceData)
      })
      originalSend.apply(this, args)
    }
  })
}

function replaceAndPublishFetch() {
  replaceAop(globalThis, 'fetch', (originalFetch) => {
    return function (url: string, options: RequestInit) {
      const startTime = getTimestamp()
      const method = options?.method ?? 'GET'
      const fetchTraceData: IHttpData = {
        timestamp: getTimestamp(),
        requestType: RequestType.Fetch,
        method,
        requestData: options && options.body,
        url,
        elapsedTime: 0,
        statusCode: 0,
        message: '',
        okOrError: OkOrError.Ok,
        traceType: TraceType.Fetch
      }
      const headers = new Headers(options.headers ?? {})
      // 使用 Object.assign
      Object.assign(headers, { setRequestHeader: headers.set })
      // 使用解构赋值
      options = { ...options, ...headers }
      return originalFetch.apply(globalThis, [url, options]).then(
        (res: Response) => {
          // res.clone() 克隆响应, 防止响应被标记为已消费
          const resClone = res.clone()
          const endTime = getTimestamp()
          fetchTraceData.elapsedTime = endTime - startTime
          fetchTraceData.statusCode = resClone.status
          resClone.text().then((res: string) => {
            if (
              (method === RequestMethod.Post && dataReporter.isSdkDsn(url)) ||
              isIgnoredUrl(url)
            ) {
              return
            }
            fetchTraceData.responseData = res
            //! handleHttp(type: TraceType, data: IHttpData)
            publishTraceHandlers(TraceType.Fetch, fetchTraceData)
          })
          return res
        },
        (err: unknown) => {
          const endTime = getTimestamp()
          if ((method === RequestMethod.Post && dataReporter.isSdkDsn(url)) || isIgnoredUrl(url)) {
            return
          }
          fetchTraceData.elapsedTime = endTime - startTime
          fetchTraceData.statusCode = 0
          //! handleHttp(type: TraceType, data: IHttpData)
          publishTraceHandlers(TraceType.Fetch, fetchTraceData)
          throw err
        }
      )
    }
  })
}

function listenAndPublishHashChange() {
  globalThis.addEventListener('hashchange', function (ev) {
    //! handleHashChange(ev: HashChangeEvent)
    publishTraceHandlers(TraceType.HashChange, ev)
  })
}

function listenAndPublishUnhandledRejection() {
  globalThis.addEventListener('unhandledrejection', function (ev) {
    // ev.preventDefault() // 阻止 console.error 默认行为
    //! handleUnhandledRejection(ev: PromiseRejectionEvent)
    publishTraceHandlers(TraceType.UnhandledRejection, ev)
  })
}

function listenAndPublishClick() {
  const throttledPublish = throttle(publishTraceHandlers, traceDev.options.clickThrottleDelay ?? 0)
  document.addEventListener('click', function (ctx) {
    throttledPublish(TraceType.Click, ctx)
  })
}

let lastHref = document.location.href

function replaceAndPublishHistory() {
  const originalOnpopstate = globalThis.onpopstate
  if (!supportHistory() || !originalOnpopstate) return
  globalThis.onpopstate = function (this: Window, ev: PopStateEvent) {
    const to = document.location.href
    const from = lastHref
    lastHref = to
    //! handleHistory(data: IRouteHistory)
    publishTraceHandlers(TraceType.History, { from, to })
    originalOnpopstate.call(this, ev)
  }

  const historyFnWrapper = (originalHistoryFn: VoidFn): VoidFn => {
    return function (ctx: unknown, ...args: unknown[]) {
      const url = args[2] ? String(args[2]) : undefined
      if (url) {
        const from = lastHref
        const to = url
        lastHref = url
        //! handleHistory(data: IRouteHistory)
        publishTraceHandlers(TraceType.History, { from, to })
      }
      return originalHistoryFn.apply(ctx, args)
    }
  }
  replaceAop(globalThis.history, 'pushState', historyFnWrapper)
  replaceAop(globalThis.history, 'popState', historyFnWrapper)
}

function listenAndPublishError() {
  globalThis.addEventListener(
    'error',
    (ev: ErrorEvent) => {
      //! handleError(ev: ErrorEvent & { target?: { localName?: string } })
      publishTraceHandlers(TraceType.Error, ev)
    },
    true
  )
}
