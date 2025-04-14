import { BreadcrumbType, TraceType } from '@trace-dev/constants'
import { IBreadcrumbItem } from '@trace-dev/types'
import { MinHeap, traceDev } from '@trace-dev/utils'

export class Breadcrumb extends MinHeap<IBreadcrumbItem> {
  maxBreadcrumb = traceDev.options.maxBreadcrumbs ?? 20
  beforePushBreadcrumb = traceDev.options.beforePushBreadcrumb

  static #breadcrumb: Breadcrumb

  public static get breadcrumb() {
    if (!Breadcrumb.#breadcrumb) {
      Breadcrumb.#breadcrumb = new Breadcrumb()
    }
    return Breadcrumb.#breadcrumb
  }

  private constructor() {
    super(traceDev.options.maxBreadcrumbs ?? 20)
  }

  push(data: IBreadcrumbItem) {
    if (this.beforePushBreadcrumb) {
      data = this.beforePushBreadcrumb(data)
    }
    super.push(data)
  }

  traceType2breadcrumbType(type: TraceType): BreadcrumbType {
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
