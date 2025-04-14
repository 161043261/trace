import { HttpMethod, RequestType, TraceType } from '@trace-dev/constants'
import { ITraceHandler, VoidFn } from '@trace-dev/types'
import { getTimestamp, replaceAop, throttle, traceDev } from '@trace-dev/utils'
import { publishTraceHandlers, subscribeTraceHandlers } from './pubsub'
import dataReporter from './data_reporter'

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
      console.log(ctx, args)
      ctx.xhrTraceData = {
        method: typeof args[0] === 'string' ? args[0].toUpperCase() : args[0],
        url: args[1],
        timestamp: getTimestamp(),
        requestType: RequestType.Xhr,
        requestData: '',
        responseData: '',
        // todo status 类型
        status: undefined
      }
      originalOpen.apply(ctx, args)
    }
  })

  replaceAop(originalXhrProto, 'send', (originalSend: VoidFn) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return function (ctx: any, ...args: any) {
      const { method, url } = ctx.xhrTraceData
      console.log(ctx, args)
      ctx.addEventListener('loadend', () => {
        if ((method === HttpMethod.Post && dataReporter.isSdkDsn(url)) || isIgnoredUrl(url)) {
          return
        }
        const { responseType, response, status } = ctx
        ctx.xhrTraceData.requestData = args[0]
        const endTime = getTimestamp()
        ctx.xhrTraceData.status = status
        if (['', 'json', 'text'].includes(responseType)) {
          ctx.xhrTraceData.responseData =
            typeof response === 'object' ? JSON.stringify(response) : response
        }
        ctx.xhrTraceData.elapsedTime = endTime - ctx.xhrTraceData.startTime
        publishTraceHandlers(TraceType.Xhr, ctx.xhrTraceData)
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
      const fetchTraceData = {
        requestType: RequestType.Fetch,
        method,
        requestData: options && options.body,
        url,
        responseData: '',
        elapsedTime: 0,
        status: 0
      }
      const headers = new Headers(options.headers ?? {})
      Object.assign(headers, { setRequestHeader: headers.set })
      options = Object.assign({}, options, headers)
      return originalFetch.apply(globalThis, [url, options]).then(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (res: any) => {
          // res.clone() 克隆响应, 防止响应被标记为已消费
          const resClone = res.clone()
          const endTime = getTimestamp()
          fetchTraceData.elapsedTime = endTime - startTime
          fetchTraceData.status = resClone.status
          resClone.text().then((res: string) => {
            if ((method === HttpMethod.Post && dataReporter.isSdkDsn(url)) || isIgnoredUrl(url)) {
              return
            }
            fetchTraceData.responseData = res
            publishTraceHandlers(TraceType.Fetch, fetchTraceData)
          })
          return res
        },
        (err: unknown) => {
          const endTime = getTimestamp()
          if ((method === HttpMethod.Post && dataReporter.isSdkDsn(url)) || isIgnoredUrl(url)) {
            return
          }
          fetchTraceData.elapsedTime = endTime - startTime
          fetchTraceData.status = 0
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
