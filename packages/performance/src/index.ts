// pnpm add @trace-dev/utils --filter @trace-dev/performance
// pnpm add @trace-dev/types --filter @trace-dev/performance
// pnpm install web-vitals --filter @trace-dev/performance

import { TraceType, OkOrError } from '@trace-dev/constants'
import { ILongTaskData, IMemoryData, IPerformanceData, TracePlugin } from '@trace-dev/types'
import { getEntryList, getWebVitals } from './main'
import { getTimestamp, traceDev } from '@trace-dev/utils'

export default class PerformancePlugin extends TracePlugin {
  constructor() {
    super(TraceType.Performance /** traceType */)
  }
  init(): void {
    getWebVitals((performanceData: IPerformanceData) => {
      const { name, score, poorOrGood } = performanceData
      traceDev.dataReporter.send({
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
        traceDev.dataReporter.send({
          name: 'longTask',
          okOrError: OkOrError.Ok,
          timestamp: getTimestamp(),
          traceType: TraceType.Performance,
          longTask: entry
        } as ILongTaskData)
      }
    })
    observer.observe({ entryTypes: ['longtask'] })
    window.addEventListener('load', function () {
      traceDev.dataReporter.send({
        name: 'entryList',
        okOrError: OkOrError.Ok,
        timestamp: getTimestamp(),
        traceType: TraceType.Performance,
        entryList: getEntryList()
      })
    })

    if (performance.memory) {
      traceDev.dataReporter.send({
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
