import { StatusCode, OkOrError, TraceType } from '@trace-dev/constants'
import { IErrorData, IHttpData, IResourceError } from '@trace-dev/types'
import { getTimestamp, statusCode2phrase, traceDev } from '@trace-dev/utils'
import { breadcrumb } from './breadcrumb'
import dataReporter from './data_reporter'

const traceHandler = {
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

  handleError(ev: ErrorEvent) {
    const target = ev.target
  }
}

function transformHttpData(data: IHttpData): IHttpData {
  const { elapsedTime, timestamp, method, statusCode = 200, responseData, requestType } = data
  let okOrError: OkOrError
  let message = ''
  const requestTimeout = traceDev.options.requestTimeout ?? 10_000
  const httpErrorHandler = traceDev.options.httpErrorHandler
  const requestErrorStr = `{ httpStatus: ${statusCode}${statusCode2phrase(statusCode)}, responseData: ${JSON.stringify(responseData)} }`
  if (statusCode === 0) {
    okOrError = OkOrError.Ok
    message = elapsedTime <= requestTimeout ? `requestError: ${requestErrorStr}` : `Request timeout`
  } else if (statusCode < StatusCode.BadRequest) {
    okOrError = OkOrError.Ok
    if (httpErrorHandler && httpErrorHandler(data)) {
      okOrError = OkOrError.Ok
    } else {
      okOrError = OkOrError.Error
      message = `requestError: ${requestErrorStr}`
    }
  } else {
    okOrError = OkOrError.Error
    message = `requestError: ${requestErrorStr}`
  }
  return {
    url: data.url,
    timestamp,
    statusCode,
    elapsedTime,
    message,
    method,
    okOrError,
    requestType
  }
}

function transformResourceData(data: IResourceError): IResourceError {
  return {
    ...data,
    name: data.resourceName,
    message: `resourceError: { src: ${data.src}, href: ${data.href} }`,
    timestamp: getTimestamp()
  }
}
