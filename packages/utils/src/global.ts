// pnpm install ua-parser-js --filter @trace-dev/utils
import { UAParser } from 'ua-parser-js'
import { defaultOptions } from '@trace-dev/constants'
import { ITraceDev } from '@trace-dev/types'

export function isBrowserEnv() {
  return typeof globalThis === 'object'
}

export function getTraceDev(): ITraceDev {
  if (window.__traceDev__) {
    return window.__traceDev__ as ITraceDev
  }
  const uaResult = new UAParser().getResult()
  window.__traceDev__ = {
    hasError: false,
    errorHashes: new Set(),
    whiteScreenTimer: null,
    options: defaultOptions,
    deviceInfo: {
      browserVersion: uaResult.browser.version,
      browserName: uaResult.browser.name,
      osVersion: uaResult.os.version,
      osName: uaResult.os.name,
      userAgent: uaResult.ua,
      deviceModel: uaResult.device.model ?? 'unknown',
      deviceType: uaResult.device.type ?? 'unknown'
    },
    dataReporter: undefined
  } as ITraceDev
  return window.__traceDev__ as ITraceDev
}

export const traceDev: ITraceDev = getTraceDev()

export function supportHistory() {
  const chrome = window.chrome
  return chrome && chrome.app && chrome.app.runtime
}
