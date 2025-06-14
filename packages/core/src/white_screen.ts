import { AnyFn } from '@trace-dev/types'
import { traceDev } from '@trace-dev/utils'
import { OkOrError } from '@trace-dev/constants'

export function checkWhiteScreen(whiteScreenHandler: AnyFn) {
  const { hasSkeleton, containerElements } = traceDev.options
  let isInitial = true
  let currentSelectorList: string[] = []
  const initialSelectorList: string[] = []
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
      if (isInitial) {
        initialSelectorList.push(selector)
      } else {
        currentSelectorList.push(selector)
      }
    }
    return containerElements.includes(selector)
  }

  const screenSampling = () => {
    let emptyPoints = 0
    // 采样
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
      // 没有白屏, 停止循环
      // 有骨架屏
      if (hasSkeleton) {
        if (isInitial) {
          isInitial = false
          return loopCheckWhiteScreen()
        }
        if (currentSelectorList.join('') === initialSelectorList.join('')) {
          return whiteScreenHandler({ okOrError: OkOrError.Ok })
        }
      }
      // 没有骨架屏
      if (traceDev.whiteScreenTimer) {
        clearTimeout(traceDev.whiteScreenTimer)
        traceDev.whiteScreenTimer = null
      }
    } else {
      // 有白屏, 开始循环白屏检测
      if (!traceDev.whiteScreenTimer) {
        loopCheckWhiteScreen()
      }
    }
    whiteScreenHandler({
      okOrError: emptyPoints === 18 ? OkOrError.Error : OkOrError.Ok
    })
  }

  const loopCheckWhiteScreen = () => {
    if (traceDev.whiteScreenTimer) {
      return
    }
    traceDev.whiteScreenTimer = setInterval(() => {
      if (hasSkeleton) {
        currentSelectorList = []
      }
      idleCallback()
    }, 1000)
  }

  const idleCallback = () => {
    requestIdleCallback((deadline) => {
      if (deadline.timeRemaining() > 0) {
        screenSampling()
      }
    })
  }

  if (hasSkeleton) {
    if (document.readyState !== 'complete') {
      idleCallback()
    }
  } else {
    if (document.readyState === 'complete') {
      idleCallback()
    } else {
      globalThis.addEventListener('load', idleCallback)
    }
  }
}
