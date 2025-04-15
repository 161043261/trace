import { BreadcrumbType, OkOrError, TraceType } from '@trace-dev/constants'
import { breadcrumb } from './breadcrumb'
import { IBreadcrumbItem } from '@trace-dev/types'
import { getTimestamp, nativeTryCatch, unknown2str } from '@trace-dev/utils'
import dataReporter from './data_reporter'

export function custom(item: Partial<IBreadcrumbItem>) {
  const {
    okOrError = OkOrError.Error,
    traceType = TraceType.Custom,
    breadcrumbType = BreadcrumbType.Custom,
    data = 'unknown'
  } = item

  nativeTryCatch(() => {
    breadcrumb.push({
      ...item,
      okOrError,
      traceType,
      breadcrumbType,
      data,
      timestamp: getTimestamp()
    })

    dataReporter.send({
      ...item,
      traceType,
      timestamp: getTimestamp(),
      okOrError,
      message: unknown2str(data)
    })
  }, console.error)
}
