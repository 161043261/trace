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
  Dom = 'Dom',
  Vue = 'Vue',
  React = 'React',
  Performance = 'Performance',
  ScreenRecord = 'ScreenRecord', // todo
  WhiteScreen = 'WhiteScreen'
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
