/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { RequestMethod, RequestType, TraceType } from '@trace-dev/constants'
import { IHttpData, ITraceHandler, VoidFn } from '@trace-dev/types'
import { getTimestamp, replaceAop, throttle, traceDev } from '@trace-dev/utils'
import { publishTraceHandlers, subscribeTraceHandlers, dataReporter } from './main'

function isIgnoredUrl(url: string) {
  return traceDev.options.ignoredUrlRegExp && traceDev.options.ignoredUrlRegExp.test(url)
}

function replace(type: TraceType) {
  switch (type) {
    case TraceType.WhiteScreen: // WhiteScreen
      handleWhiteScreen()
      break

    case TraceType.Click: // Click
      listenClick()
      break

    case TraceType.Error: // Error
    case TraceType.Fetch: // Fetch
      replaceFetch()
      break

    case TraceType.HashChange: // HashChange
      listenHashChange()
      break

    case TraceType.History: // History
      replaceHistory()
      break

    case TraceType.Xhr: // Xhr
      replaceXhr()
      break

    case TraceType.UnhandledRejection: // UnhandledRejection
      replaceUnhandledRejection()
      break
  }
}

export function addTraceHandler(replacer: ITraceHandler) {
  if (!subscribeTraceHandlers(replacer)) return
  replace(replacer.traceType)
}

function replaceXhr() {
  const originalXhrProto = XMLHttpRequest.prototype
  replaceAop(originalXhrProto, 'open', (originalOpen: VoidFn) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return function (ctx: any, ...args: any[]) {
      ctx.xhrTraceData = {
        method: typeof args[0] === 'string' ? args[0].toUpperCase() : args[0],
        url: args[1],
        timestamp: getTimestamp(),
        requestType: RequestType.Xhr
      } as IHttpData
      originalOpen.apply(ctx, args)
    }
  })

  replaceAop(originalXhrProto, 'send', (originalSend: VoidFn) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return function (ctx: any, ...args: any) {
      const xhrTraceData = ctx.xhrTraceData as IHttpData
      const { method, url } = xhrTraceData
      ctx.addEventListener('loadend', () => {
        if ((method === RequestMethod.Post && dataReporter.isSdkDsn(url!)) || isIgnoredUrl(url!)) {
          return
        }
        const { responseType, response, status } = ctx
        xhrTraceData.requestData = args[0]
        const endTime = getTimestamp()
        xhrTraceData.statusCode = Number.parseInt(status)
        if (['', 'json', 'text'].includes(responseType)) {
          xhrTraceData.responseData = JSON.stringify(response)
        }
        xhrTraceData.elapsedTime = endTime - xhrTraceData.timestamp!
        publishTraceHandlers(TraceType.Xhr, xhrTraceData)
      })
      originalSend.apply(ctx, args)
    }
  })
}

function replaceFetch() {
  replaceAop(globalThis, 'fetch', (originalFetch) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return function (url: string, options: any) {
      const startTime = getTimestamp()
      const method = options?.method ?? 'GET'
      const fetchTraceData: IHttpData = {
        timestamp: getTimestamp(),
        requestType: RequestType.Fetch,
        method,
        requestData: options && options.body,
        url,
        responseData: '',
        elapsedTime: 0,
        statusCode: 0
      }
      const headers = new Headers(options.headers ?? {})
      // 使用 Object.assign
      Object.assign(headers, { setRequestHeader: headers.set })
      // 使用解构赋值
      options = { ...options, ...headers }
      return originalFetch.apply(globalThis, [url, options]).then(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
          publishTraceHandlers(TraceType.Fetch, fetchTraceData)
          throw err
        }
      )
    }
  })
}

function listenHashChange() {
  globalThis.addEventListener('hashchange', function (ev) {
    publishTraceHandlers(TraceType.HashChange, ev)
  })
}

function replaceUnhandledRejection() {
  globalThis.addEventListener('unhandledrejection', function (ev) {
    // ev.preventDefault() // 阻止 console.error 默认行为
    publishTraceHandlers(TraceType.UnhandledRejection, ev)
  })
}

function listenClick() {
  const throttledPublish = throttle(publishTraceHandlers, traceDev.options.clickThrottleDelay ?? 0)
  document.addEventListener('click', function (ctx: unknown) {
    throttledPublish(TraceType.Click, { type: 'click', data: ctx })
  })
}

function handleWhiteScreen() {
  publishTraceHandlers(TraceType.WhiteScreen)
}

let lastHref = document.location.href

function replaceHistory() {
  const originalOnpopstate = globalThis.onpopstate
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  globalThis.onpopstate = function (ctx: any, ...args: any) {
    const to = document.location.href
    const from = lastHref
    lastHref = to
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
        publishTraceHandlers(TraceType.History, { from, to })
      }
      return originalHistoryFn.apply(ctx, args)
    }
  }
  replaceAop(globalThis.history, 'pushState', historyFnWrapper)
  replaceAop(globalThis.history, 'popState', historyFnWrapper)
}
