import { AnyFn } from '@trace-dev/types'
import { traceDev } from '@trace-dev/utils'
import { OkOrError } from 'packages/constants/dist/index.cjs'

export function handleWhiteScreen(whiteScreenHandler: AnyFn) {
  const {
    hasSkeleton,
    containerElements: whiteScreenElements = ['html', 'body', '#app', '#root']
  } = traceDev.options
  let loopTime: number = 0
  const skeletonPreList: string[] = []
  const skeletonCurList: string[] = []

  const getSelector = (elem: HTMLElement) => {
    if (elem.id) {
      return '#' + elem.id
    }
    if (elem.className) {
      return '.' + elem.className.split(' ').filter(Boolean).join('.')
    }
    return elem.nodeName.toLowerCase()
  }

  const isContainer = (elem: HTMLElement) => {
    const selector = getSelector(elem)

    if (hasSkeleton) {
      if (loopTime) {
        skeletonCurList.push(selector)
      } else {
        skeletonPreList.push(selector)
      }
    }
    return whiteScreenElements.includes(selector)
  }

  const screenSampling = () => {
    let emptyPoints = 0
    for (let i = 1; i <= 9; i++) {
      const rowElements = document.elementsFromPoint(
        (globalThis.innerWidth * i) / 10,
        globalThis.innerHeight / 2
      )
      const columnElements = document.elementsFromPoint(
        globalThis.innerWidth / 2,
        (globalThis.innerHeight * i) / 10
      )
      if (isContainer(rowElements[0] as HTMLElement)) emptyPoints++
      if (isContainer(columnElements[0] as HTMLElement)) emptyPoints++
    }
    if (emptyPoints !== 18) {
      if (hasSkeleton) {
        if (!loopTime /** loopTimes === 0 */) {
          loopCheckWhiteScreen()
          return
        }
        if (skeletonCurList.join() === skeletonPreList.join()) {
          return whiteScreenHandler({ okOrError: OkOrError })
        }
        if (traceDev.whiteScreenTimer) {
          clearTimeout(traceDev.whiteScreenTimer)
          traceDev.whiteScreenTimer = null
        }
      }
    }
  }

  const loopCheckWhiteScreen = () => {
    if (traceDev.whiteScreenTimer) {
      return
    }
    traceDev.whiteScreenTimer = setInterval(() => {
      if (hasSkeleton) {
      }
    })
  }

  const idleCallback = () => {
    requestIdleCallback((deadline) => {
      if (deadline.timeRemaining() > 0) {
        screenSampling()
      }
    })
  }

  if (hasSkeleton) {
    if (document.readyState != 'complete') {
      idleCallback()
    }
  } else {
    if (document.readyState === 'complete') {
      globalThis.addEventListener('load', idleCallback)
    }
  }
}
