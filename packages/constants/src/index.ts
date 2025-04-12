import packageJson from '../../../package.json'

export const SDK_NAME = 'trace'

export const SDK_VERSION = packageJson.version

export enum InterfaceStatus {
  Ok = 'Ok',
  DeadlineError = 'DeadlineError',
  Unauthenticated = 'Unauthenticated',
  PermissionDenied = 'PermissionDenied',
  NotFount = 'NotFount',
  ResourceExhausted = 'ResourceExhausted',
  InvalidArgument = 'InvalidArgument',
  Unimplemented = 'Unimplemented',
  Unavailable = 'Unavailable',
  InternalError = 'InternalError',
  UnknownError = 'UnknownError',
  Cancelled = 'Cancelled',
  AlreadyExist = 'AlreadyExist',
  FailedPrecondition = 'FailedPrecondition',
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

export enum StatusCode {
  Error = 'Error',
  Ok = 'Ok'
}

export enum EventType {
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

export enum HttpType {
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
