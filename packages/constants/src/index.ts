import { ITraceOptions } from '@trace-dev/types'
import packageJson from '../../../package.json'

export const SDK_NAME = packageJson.name

export const SDK_VERSION = packageJson.version

export enum StatusPhrase {
  Ok = 'Ok',
  Unauthenticated = 'Unauthenticated',
  PermissionDenied = 'PermissionDenied',
  NotFound = 'NotFound',
  AlreadyExist = 'AlreadyExist',
  FailedPrecondition = 'FailedPrecondition',
  ResourceExhausted = 'ResourceExhausted',
  InvalidArgument = 'InvalidArgument',
  Unimplemented = 'Unimplemented',
  Unavailable = 'Unavailable',
  DeadlineError = 'DeadlineError',
  InternalError = 'InternalError',
  UnknownError = 'UnknownError',
  Cancelled = 'Cancelled',
  Aborted = 'Aborted',
  OutOfRange = 'OutOfRange',
  DataLoss = 'DataLoss'
}

export enum BreadcrumbType {
  Http = 'Http',
  Click = 'Click',
  Resource = 'Resource',
  SourceCodeError = 'SourceCodeError',
  Route = 'Route',
  Custom = 'Custom'
}

export enum OkOrError {
  Error = 'Error',
  Ok = 'Ok'
}

export enum TraceType {
  Xhr = 'Xhr',
  Fetch = 'Fetch',
  Click = 'Click',
  History = 'History',
  Error = 'Error',
  HashChange = 'HashChange',
  UnhandledRejection = 'UnhandledRejection',
  Resource = 'Resource',
  Performance = 'Performance',
  ScreenRecord = 'ScreenRecord',
  WhiteScreen = 'WhiteScreen',
  Custom = 'Custom'
}

export enum RequestType {
  Xhr = 'Xhr', // XMLHttpRequest
  Fetch = 'Fetch' // fetch
}

export enum StatusCode {
  BadRequest = 400,
  Unauthorized = 401
}

export enum RequestMethod {
  Options = 'OPTIONS',
  Get = 'GET',
  Post = 'POST',
  Put = 'PUT',
  Patch = 'PATCH',
  Delete = 'DELETE',
  Connect = 'CONNECT',
  Head = 'HEAD',
  Trace = 'TRACE'
}

export const defaultOptions: ITraceOptions = {
  dsn: '',
  projectId: 'unknown',
  disabled: false,
  userId: 'unknown',
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
  screenRecordEveryNms: 3000,
  screenRecordTraceTypeList: [
    TraceType.Error,
    TraceType.UnhandledRejection,
    TraceType.Resource,
    TraceType.Fetch,
    TraceType.Xhr
  ],
  hasSkeleton: false,
  containerElements: ['html', 'body', '#app', '#root'],
  // ignoredUrlRegExp?: RegExp // 接口正则
  clickThrottleDelay: 0,
  requestTimeoutNms: 3000, // 单位 ms
  maxBreadcrumbs: 20,
  repeatSourceCodeError: false
}
