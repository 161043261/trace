import { OkOrError, TraceType } from '@trace-dev/constants'
import { AnyFn, IHttpData, IRouteHistory, ISourceCodeError } from '@trace-dev/types'

import {
  getErrorId,
  getTimestamp,
  hasErrorHash,
  htmlElem2str,
  parseUrl2obj,
  traceDev,
  unknown2str
} from '@trace-dev/utils'

import {
  breadcrumb,
  dataReporter,
  replaceAndPublish,
  subscribeTraceHandler,
  transformHttpData,
  transformResourceData
} from './main'
import ErrorStackParser from 'error-stack-parser'

export const traceHandler = {
  handleHttp(data: IHttpData) {
    data = transformHttpData(data)
    if (!data.url.includes(traceDev.options.dsn)) {
      breadcrumb.push({
        okOrError: data.okOrError,
        timestamp: data.timestamp ?? getTimestamp(),
        traceType: data.traceType,
        breadcrumbType: breadcrumb.traceType2breadcrumbType(data.traceType),
        data
      })
    }

    if (data.okOrError === OkOrError.Error) {
      dataReporter.send({ ...data, type: data.traceType, okOrError: OkOrError.Error })
    }
  },

  handleError(ev: ErrorEvent & { target?: { localName?: string } }) {
    const target = ev.target
    if (!target || (ev.target && !ev.target.localName)) {
      // 是 Vue 错误, React 错误或异步错误
      const stackFrame = ErrorStackParser.parse(ev.error)[0]
      const { fileName, columnNumber, lineNumber } = stackFrame
      const errorData: ISourceCodeError = {
        column: columnNumber,
        line: lineNumber,
        traceType: TraceType.Error,
        okOrError: OkOrError.Error,
        timestamp: getTimestamp(),
        message: ev.message,
        filename: fileName
      }
      breadcrumb.push({
        traceType: TraceType.Error,
        breadcrumbType: breadcrumb.traceType2breadcrumbType(TraceType.Error),
        data: errorData,
        timestamp: getTimestamp(),
        okOrError: OkOrError.Error
      })
      const errorStr = `${TraceType.Error}-${ev.message ?? 'unknownErrorMessage'}-${fileName ?? 'unknownFilename'}-${lineNumber ?? 'unknownLineNumber'}-${columnNumber ?? 'unknownColumnNumber'}`
      const errorId = getErrorId(errorStr)
      if (
        errorStr.includes('unknown') ||
        !traceDev.options.repeatSourceCodeError ||
        !hasErrorHash(errorId)
      ) {
        dataReporter.send(errorData)
      }
      return
    }
    // 是资源加载错误
    if (/** target &&  */ target?.localName) {
      const resourceData = transformResourceData(target)
      breadcrumb.push({
        traceType: TraceType.Resource,
        breadcrumbType: breadcrumb.traceType2breadcrumbType(TraceType.Resource),
        okOrError: OkOrError.Error,
        timestamp: getTimestamp(),
        data: resourceData
      })
      dataReporter.send({
        ...resourceData,
        type: TraceType.Resource,
        okOrError: OkOrError.Error
      })
    }
  },

  handleHistory(data: IRouteHistory) {
    const { from, to } = data
    const { relativePath: parsedFrom } = parseUrl2obj(from)
    const { relativePath: parsedTo } = parseUrl2obj(to)
    breadcrumb.push({
      traceType: TraceType.History,
      breadcrumbType: breadcrumb.traceType2breadcrumbType(TraceType.History),
      data: {
        from: parsedFrom ?? '/',
        to: parsedTo ?? '/'
      },
      timestamp: getTimestamp(),
      okOrError: OkOrError.Ok
    })
  },

  handleHashChange(ev: HashChangeEvent) {
    const { oldURL, newURL } = ev
    const { relativePath: from } = parseUrl2obj(oldURL)
    const { relativePath: to } = parseUrl2obj(newURL)
    breadcrumb.push({
      traceType: TraceType.HashChange,
      breadcrumbType: breadcrumb.traceType2breadcrumbType(TraceType.HashChange),
      data: { from, to },
      timestamp: getTimestamp(),
      okOrError: OkOrError.Ok
    })
  },

  handleUnhandledRejection(ev: PromiseRejectionEvent) {
    const stackFrame = ErrorStackParser.parse(ev.reason)[0]
    const { fileName, columnNumber, lineNumber } = stackFrame
    console.log('ev.reason', ev.reason)
    const message = unknown2str(ev.reason.message ?? ev.reason.stack)
    const data: ISourceCodeError = {
      traceType: TraceType.UnhandledRejection,
      okOrError: OkOrError.Error,
      timestamp: getTimestamp(),
      message,
      filename: fileName,
      line: lineNumber,
      column: columnNumber
    }
    breadcrumb.push({
      timestamp: getTimestamp(),
      traceType: TraceType.UnhandledRejection,
      breadcrumbType: breadcrumb.traceType2breadcrumbType(TraceType.UnhandledRejection),
      okOrError: OkOrError.Error,
      data
    })
    const errorStr = `${TraceType.Error}-${message}-${fileName ?? 'unknownFilename'}-${lineNumber ?? 'unknownLineNumber'}-${columnNumber ?? 'unknownColumnNumber'}`
    const errorId = getErrorId(errorStr)
    if (
      errorStr.includes('unknown') ||
      !traceDev.options.repeatSourceCodeError ||
      !hasErrorHash(errorId)
    ) {
      dataReporter.send(data)
    }
  },

  handleWhiteScreen() {
    console.log('handleWhiteScreen')
  },

  handleClick(target: EventTarget) {
    const htmlStr = htmlElem2str(target as HTMLElement)
    if (htmlStr !== '') {
      breadcrumb.push({
        timestamp: getTimestamp(),
        traceType: TraceType.Click,
        okOrError: OkOrError.Ok,
        breadcrumbType: breadcrumb.traceType2breadcrumbType(TraceType.Click),
        data: htmlStr
      })
    }
  }
}

export function addTraceHandler(traceType: TraceType, handler: AnyFn) {
  subscribeTraceHandler(traceType, handler)
  replaceAndPublish(traceType)
}

export function batchAddTraceHandlers() {
  const {
    traceXhr,
    traceClick,
    traceError,
    traceFetch,
    traceHashChange,
    traceHistory,
    traceWhiteScreen,
    traceUnhandledRejection
  } = traceDev.options
  if (traceWhiteScreen ?? true) {
    addTraceHandler(TraceType.WhiteScreen, traceHandler.handleWhiteScreen)
  }
  if (traceXhr ?? true) {
    addTraceHandler(TraceType.Xhr, traceHandler.handleHttp)
  }
  if (traceFetch ?? true) {
    addTraceHandler(TraceType.Fetch, traceHandler.handleHttp)
  }
  if (traceError ?? true) {
    addTraceHandler(TraceType.Error, traceHandler.handleError)
  }
  if (traceHistory ?? true) {
    addTraceHandler(TraceType.History, traceHandler.handleHistory)
  }
  if (traceUnhandledRejection ?? true) {
    addTraceHandler(TraceType.UnhandledRejection, traceHandler.handleUnhandledRejection)
  }
  if (traceClick ?? true) {
    addTraceHandler(TraceType.Click, traceHandler.handleClick)
  }
  if (traceHashChange ?? true) {
    addTraceHandler(TraceType.HashChange, traceHandler.handleHashChange)
  }
}
