/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
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
  let ctx: any
  replaceAop(originalXhrProto, 'open', (originalOpen: VoidFn) => {
    return function (...args: any[]) {
      // @ts-ignore
      ctx = this
      const xhrTraceData: IHttpData = {
        //! 1. okOrError: OkOrError
        okOrError: OkOrError.Ok,
        //! 2. timestamp: number
        timestamp: getTimestamp(),
        //! 3. traceType: TraceType
        traceType: TraceType.Xhr,
        //! 4. method: string
        method: typeof args[0] === 'string' ? args[0].toUpperCase() : args[0],
        //! 5. url: string
        url: args[1],
        //! 6. elapsedTime: number
        elapsedTime: 0,
        //! 7. message: string
        message: '',
        //! 8. statusCode: number
        statusCode: 0,
        //! 9. requestType: RequestType
        requestType: RequestType.Xhr
      }
      ctx.xhrTraceData = xhrTraceData
      originalOpen.apply(ctx, args)
    }
  })

  replaceAop(originalXhrProto, 'send', (originalSend: VoidFn) => {
    return function (...args: any[]) {
      // @ts-ignore
      console.log('ctx === this', ctx === this)
      const { method, url } = ctx.xhrTraceData
      // @ts-ignore
      this.addEventListener('loadend', () => {
        if ((method === RequestMethod.Post && dataReporter.isSdkDsn(url!)) || isIgnoredUrl(url!)) {
          return
        }
        // @ts-ignore
        const { responseType, response, status } = this
        ctx.xhrTraceData.requestData = args[0]
        const endTime = getTimestamp()
        ctx.xhrTraceData.statusCode = Number.parseInt(status)
        if (['', 'json', 'text'].includes(responseType)) {
          ctx.xhrTraceData.responseData = JSON.stringify(response)
        }
        ctx.xhrTraceData.elapsedTime = endTime - ctx.xhrTraceData.timestamp!
        //! handleHttp(type: TraceType, data: IHttpData)
        publishTraceHandlers(TraceType.Xhr, ctx.xhrTraceData)
      })
      originalSend.apply(ctx, args)
    }
  })
}

function replaceAndPublishFetch() {
  replaceAop(globalThis, 'fetch', (originalFetch) => {
    return function (url: string, options: any) {
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
        (res: any) => {
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
  if (!supportHistory()) return
  const originalOnpopstate = globalThis.onpopstate
  globalThis.onpopstate = function (ctx: any, ...args: any) {
    const to = document.location.href
    const from = lastHref
    lastHref = to
    //! handleHistory(data: IRouteHistory)
    publishTraceHandlers(TraceType.History, { from, to })
    originalOnpopstate?.apply(ctx, args)
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
