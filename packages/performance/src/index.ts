// pnpm add @trace-dev/utils --filter @trace-dev/performance
// pnpm add @trace-dev/types --filter @trace-dev/performance
// pnpm add @trace-dev/constants --filter @trace-dev/performance
// pnpm install web-vitals --filter @trace-dev/performance
import { TraceType, OkOrError } from '@trace-dev/constants'
import { ILongTaskData, IMemoryData, IPerformanceData, TracePlugin } from '@trace-dev/types'
import { getResourceList, getWebVitals } from './main'
import { getTimestamp, traceDev } from '@trace-dev/utils'

export default class PerformancePlugin extends TracePlugin {
  constructor() {
    super(TraceType.Performance /** traceType */)
  }

  init(): void {
    getWebVitals((performanceData: IPerformanceData) => {
      const { name, score, poorOrGood } = performanceData
      traceDev.dataReporter?.send({
        name, // IPerformanceData
        okOrError: OkOrError.Ok,
        timestamp: getTimestamp(),
        traceType: TraceType.Performance,
        score, // IPerformanceData
        poorOrGood // IPerformanceData
      } as IPerformanceData)
    })

    const observer = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        traceDev.dataReporter?.send({
          name: 'longTask',
          okOrError: OkOrError.Ok,
          timestamp: getTimestamp(),
          traceType: TraceType.Performance,
          longTask: entry
        } as ILongTaskData)
      }
    })

    observer.observe({ entryTypes: ['longtask'] })
    globalThis.addEventListener('load', function () {
      traceDev.dataReporter?.send({
        name: 'resourceList',
        okOrError: OkOrError.Ok,
        timestamp: getTimestamp(),
        traceType: TraceType.Performance,
        resourceList: getResourceList()
      } as IPerformanceData)
    })

    if (performance.memory) {
      traceDev.dataReporter?.send({
        name: 'memory',
        okOrError: OkOrError.Ok,
        timestamp: getTimestamp(),
        traceType: TraceType.Performance,
        memory: {
          jsHeapSizeLimit: performance.memory && performance.memory.jsHeapSizeLimit,
          totalJSHeapSize: performance.memory && performance.memory.totalJSHeapSize,
          usedJSHeapSize: performance.memory && performance.memory.usedJSHeapSize
        }
      } as IMemoryData)
    }
  }
}
