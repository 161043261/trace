import { BreadcrumbType, TraceType } from '@trace-dev/constants'
import { IBreadcrumbItem, IReportData, ITraceOptions } from '@trace-dev/types'
import { MinHeap, traceDev } from '@trace-dev/utils'

export class Breadcrumb extends MinHeap<IBreadcrumbItem> {
  static #breadcrumb: Breadcrumb
  beforeReportData?: (data: IReportData) => Promise<IReportData>

  public static get breadcrumb() {
    if (!Breadcrumb.#breadcrumb) {
      Breadcrumb.#breadcrumb = new Breadcrumb()
    }
    return Breadcrumb.#breadcrumb
  }

  setOptions(options: ITraceOptions) {
    this.heapCap = options.maxBreadcrumbs ?? 20
    this.beforeReportData = options.beforeReportData
  }

  push(data: IBreadcrumbItem) {
    if (traceDev.options.beforePushBreadcrumb) {
      data = traceDev.options.beforePushBreadcrumb(data)
    }
    super.push(data)
  }

  traceType2breadcrumbType(type?: TraceType): BreadcrumbType {
    switch (type) {
      case TraceType.Xhr:
      case TraceType.Fetch:
        return BreadcrumbType.Http

      case TraceType.Click:
        return BreadcrumbType.Click

      case TraceType.History:
      case TraceType.HashChange:
        return BreadcrumbType.Route

      case TraceType.Resource:
        return BreadcrumbType.Resource

      case TraceType.UnhandledRejection:
      case TraceType.Error:
        return BreadcrumbType.SourceCodeError

      default:
        return BreadcrumbType.Custom
    }
  }
}

export const breadcrumb = Breadcrumb.breadcrumb
