import packageJson from '../package.json'

export const SDK_NAME = 'trace'

export const SDK_VERSION = packageJson.version

// 接口状态
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

// 用户行为
export enum BreadcrumbType {
  Http = 'Http', // 接口调用
  Click = 'Click', // 用户点击事件
  ResourceError = 'ResourceError', // 资源加载
  CodeError = 'CodeError', // 代码报错
  Route = 'Route', // 页面跳转 (路由改变)
  Custom = 'Custom' // 其他未定义行为
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

// 接口错误
export enum HttpType {
  Xhr = 'Xhr', // XMLHttpRequest 请求
  Fetch = 'Fetch' // fetch 请求
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
