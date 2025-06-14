import { OkOrError, StatusCode, TraceType } from '@trace-dev/constants'
import { IHttpData, IResourceError } from '@trace-dev/types'
import { traceDev, statusCode2phrase, getTimestamp } from '@trace-dev/utils'

export function transformHttpData(data: IHttpData): IHttpData {
  const { elapsedTime, statusCode, responseData } = data
  let okOrError: OkOrError
  let message = ''
  const requestTimeoutNms = traceDev.options.requestTimeoutNms ?? 3000
  const httpErrorHandler = traceDev.options.httpErrorHandler
  const requestErrorStr = `{ httpStatus: ${statusCode}-${statusCode2phrase(statusCode)}, responseData: ${JSON.stringify(responseData)} }`
  if (statusCode === 0) {
    okOrError = OkOrError.Error
    message =
      elapsedTime <= requestTimeoutNms ? `requestError(1): ${requestErrorStr}` : `Request timeout`
  } else if (statusCode < StatusCode.BadRequest) {
    okOrError = OkOrError.Ok
    if (httpErrorHandler) {
      if (httpErrorHandler(data)) {
        okOrError = OkOrError.Ok
      } else {
        okOrError = OkOrError.Error
        message = `requestError(2): ${requestErrorStr}`
      }
    }
  } else {
    okOrError = OkOrError.Error
    message = `requestError(3): ${requestErrorStr}`
  }
  return {
    ...data,
    message,
    okOrError
  }
}

export function transformResourceError(data: Partial<IResourceError>): IResourceError {
  return {
    name: data.localName,
    okOrError: data.okOrError ?? OkOrError.Error,
    timestamp: getTimestamp(),
    traceType: TraceType.Resource,
    src: data.src ?? 'unknown',
    href: data.href ?? 'unknown',
    localName: data.localName ?? 'unknown'
  }
}
