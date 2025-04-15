import { OkOrError, TraceType } from '@trace-dev/constants'
import { AnyFn, IPerformanceData } from '@trace-dev/types'
import { getTimestamp } from '@trace-dev/utils'
import { onFCP, onLCP, onCLS, onINP, onTTFB } from 'web-vitals'
// 首屏加载时间
let firstScreenPaint = 0
let isCompleted = false
let requestId = 0
let observer: MutationObserver | null = null

interface IEntry {
  startTime: number
  children: HTMLElement[]
}
let entries: IEntry[] = []

const viewportWidth = globalThis.innerWidth
const viewportHeight = globalThis.innerHeight

function isInScreen(dom: HTMLElement): boolean {
  const domRect = dom.getBoundingClientRect()
  return domRect.left < viewportWidth && domRect.top < viewportHeight
}

function getPaintTime(): number {
  let startTime = 0
  entries.forEach((entry) => {
    if (entry.startTime > startTime) {
      startTime = entry.startTime
    }
  })
  return startTime - performance.timeOrigin // 文档起始时间
}

function observeDomChange(reportFn: AnyFn) {
  // 取消上一个通过 requestAnimationFrame 传递的回调函数
  cancelAnimationFrame(requestId)
  // requestAnimationFrame(callback)
  // 请求浏览器在下一次重绘 (下一帧) 前, 调用传递的回调函数
  requestId = requestAnimationFrame(() => {
    if (document.readyState === 'complete') {
      isCompleted = true
    }
    if (isCompleted) {
      // 取消监听
      if (observer) observer.disconnect()
      firstScreenPaint = getPaintTime()
      entries = []
      if (reportFn) reportFn(firstScreenPaint)
    } else {
      observeDomChange(reportFn)
    }
  })
}

function getFSP(reportFn: AnyFn) {
  requestIdleCallback((deadline: IdleDeadline) => {
    // 当前空闲时间段的剩余时间 > 0
    if (deadline.timeRemaining() > 0) {
      observeFSP(reportFn)
    }
  })
}

function observeFSP(reportFn: AnyFn) {
  const ignoreDomList = ['style', 'script', 'link']
  observer = new MutationObserver((mutationList: MutationRecord[]) => {
    observeDomChange(reportFn)
    const entry: IEntry = { startTime: 0, children: [] }
    for (const mutation of mutationList) {
      if (mutation.addedNodes.length && isInScreen(mutation.target as HTMLElement)) {
        for (const node of Array.from(mutation.addedNodes)) {
          if (
            node.nodeType === 1 &&
            !ignoreDomList.includes((node as HTMLElement).tagName.toLowerCase()) &&
            isInScreen(node as HTMLElement)
          ) {
            entry.children.push(node as HTMLElement)
          }
        }
      }
    }

    if (entry.children.length > 0) {
      entries.push(entry)
      entry.startTime = new Date().getTime()
    }
  })
  observer.observe(document, {
    childList: true, // 监听添加或删除子节点
    subtree: true, // 监听整个子树
    characterData: true, // 监听元素的文本
    attributes: true // 监听元素的属性
  })
}

export function notChrome(): boolean {
  return !/Chrome/.test(navigator.userAgent)
}

export function getResourceList(): PerformanceResourceTiming[] {
  let entryList: (PerformanceResourceTiming & { fromCache?: boolean })[] =
    performance.getEntriesByType('resource')
  entryList = entryList.filter(
    (entry) => !['fetch', 'xmlhttprequest', 'beacon'].includes(entry.initiatorType)
  )
  if (entryList.length > 0) {
    // entryList = globalThis.structuredClone(entryList)
    entryList.forEach((entry) => {
      entry.fromCache = isFromCache(entry)
    })
  }
  return entryList
}

export function isFromCache(entry: PerformanceResourceTiming): boolean {
  return entry.transferSize === 0 || (entry.transferSize !== 0 && entry.encodedBodySize === 0)
}

export function getFCP(reportFn: AnyFn) {
  const performanceObserverCallback = (entryList: PerformanceObserverEntryList) => {
    for (const entry of entryList.getEntries()) {
      if (entry.name === 'first-contentful-paint') {
        observer?.disconnect()
        reportFn({
          name: 'FCP',
          value: entry.startTime,
          rating: entry.startTime > 2500 ? 'poor' : 'good'
        })
      }
    }
  }
  const observer = new PerformanceObserver(performanceObserverCallback)
  observer.observe({ type: 'paint', buffered: true })
}

export function getLCP(reportFn: AnyFn) {
  const performanceObserverCallback: PerformanceObserverCallback = (entryList) => {
    for (const entry of entryList.getEntries()) {
      observer?.disconnect()
      reportFn({
        name: 'LCP',
        value: entry.startTime,
        rating: entry.startTime > 2500 ? 'poor' : 'good'
      })
    }
  }
  const observer = new PerformanceObserver(performanceObserverCallback)
  observer.observe({ type: 'largest-contentful-paint', buffered: true })
}

export function getWebVitals(dataReporter: AnyFn): void {
  if (notChrome()) {
    getFCP((data) => {
      dataReporter(data)
    })
    getLCP((data) => {
      dataReporter(data)
    })
  } else {
    onFCP((data) => {
      dataReporter(data)
    })
    onLCP((data) => {
      dataReporter(data)
    })
    onCLS((data) => {
      dataReporter(data)
    })
    onINP((data) => {
      dataReporter(data)
    })
    onTTFB((data) => {
      dataReporter(data)
    })
  }

  getFSP((value) => {
    const data: IPerformanceData = {
      okOrError: OkOrError.Ok,
      timestamp: getTimestamp(),
      traceType: TraceType.Performance,
      name: 'FSP',
      score: value,
      poorOrGood: value > 2500 ? 'poor' : 'good'
    }
    dataReporter(data)
  })
}
