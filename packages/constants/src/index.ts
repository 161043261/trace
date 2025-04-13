import packageJson from '../../../package.json'

export const SDK_NAME = packageJson.name

export const SDK_VERSION = packageJson.version

export enum HttpPhrase {
  Ok = 'Ok',
  // httpCode >= 400 && httpCode < 500
  Unauthenticated = 'Unauthenticated',
  PermissionDenied = 'PermissionDenied',
  NotFound = 'NotFound',
  AlreadyExist = 'AlreadyExist',
  FailedPrecondition = 'FailedPrecondition',
  ResourceExhausted = 'ResourceExhausted',
  InvalidArgument = 'InvalidArgument',
  // httpCode >= 500 && httpCode < 600
  Unimplemented = 'Unimplemented',
  Unavailable = 'Unavailable',
  DeadlineError = 'DeadlineError',
  InternalError = 'InternalError',
  UnknownError = 'UnknownError',
  // other
  Cancelled = 'Cancelled',
  Aborted = 'Aborted',
  OutOfRange = 'OutOfRange',
  DataLoss = 'DataLoss'
}

export enum BreadcrumbType {
  Http = 'Http',
  Click = 'Click',
  ResourceError = 'ResourceError',
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
  Dom = 'Dom',
  Vue = 'Vue',
  React = 'React',
  Performance = 'Performance',
  ScreenRecord = 'ScreenRecord', // todo
  WhiteScreen = 'WhiteScreen'
}

// ========== 暂未使用 ==========

export enum RequestType {
  Xhr = 'Xhr', // XMLHttpRequest
  Fetch = 'Fetch' // fetch
}

export enum HttpCode {
  BadRequest = 400,
  Unauthorized = 401
}

export enum HttpMethod {
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
