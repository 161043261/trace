// pnpm install ua-parser-js --filter @trace-dev/utils
import { UAParser } from 'ua-parser-js'
import { IDeviceInfo, ITraceDev } from '@trace-dev/types'

export function isBrowserEnv() {
  return typeof globalThis === 'object'
}

export function getTraceDev() {
  window.__traceDev__ = window.__traceDev__ ?? ({} as ITraceDev)
  return window.__traceDev__
}

export const traceDev = getTraceDev() as unknown as ITraceDev

const uaResult = new UAParser().getResult()

traceDev.deviceInfo = {
  browserVersion: uaResult.browser.version,
  browserName: uaResult.browser.name,
  osVersion: uaResult.os.version,
  osName: uaResult.os.name,
  userAgent: uaResult.ua,
  deviceModel: uaResult.device.model ?? 'unknown',
  deviceType: uaResult.device.type ?? 'unknown'
} as IDeviceInfo

traceDev.hasError = false
traceDev.errorHashes = new Set<string>()

export function supportHistory() {
  const chrome = window.chrome
  const isChromePackaged = chrome && chrome.app && chrome.app.runtime
  const hasHistoryApi =
    globalThis.history &&
    (globalThis.history as History).pushState &&
    (globalThis.history as History).replaceState
  return !isChromePackaged && hasHistoryApi
}
