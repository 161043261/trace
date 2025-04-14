// pnpm install ua-parser-js --filter @trace-dev/utils
import { UAParser } from 'ua-parser-js'
import { IDeviceInfo, ITraceDev } from '@trace-dev/types'

export function isBrowserEnv() {
  return typeof globalThis === 'object'
}

export function getTraceDev() {
  globalThis.__traceDev__ = globalThis.__traceDev__ ?? ({} as ITraceDev)
  return globalThis.__traceDev__
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
traceDev.replacedRecord = traceDev.replacedRecord || {}

export function setReplaceRecord(replaceType: string, isReplaced: boolean) {
  traceDev.replacedRecord[replaceType] = isReplaced
}

export function isReplaced(replaceType: string): boolean {
  return traceDev.replacedRecord[replaceType] ?? false
}

export function supportHistory() {
  const chrome = globalThis.chrome
  const isChromePackaged = chrome && chrome.app && chrome.app.runtime
  const hasHistoryApi =
    globalThis.history &&
    (globalThis.history as History).pushState &&
    (globalThis.history as History).replaceState
  return !isChromePackaged && hasHistoryApi
}
