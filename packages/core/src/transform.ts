import { OkOrError, StatusCode } from '@trace-dev/constants'
import { IHttpData, IResourceError } from '@trace-dev/types'
import { traceDev, statusCode2phrase, getTimestamp } from '@trace-dev/utils'

export function transformHttpData(data: IHttpData): IHttpData {
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

export function transformResourceData(data: IResourceError): IResourceError {
  return {
    ...data,
    name: data.localName,
    message: `resourceError: { src: ${data.src}, href: ${data.href} }`,
    timestamp: getTimestamp()
  }
}
