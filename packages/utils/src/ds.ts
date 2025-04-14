import { VoidFn } from '@trace-dev/types'

export class MinHeap<T extends { timestamp: number }> {
  heapCap = 20
  itemList: T[] = []

  constructor(heapCap_ = 20) {
    this.heapCap = heapCap_
  }

  push(data: T) {
    if (this.itemList.length === this.heapCap) {
      this.itemList[0] = data
    } else {
      this.itemList.unshift(data)
    }
    this.minHeapify(0, this.itemList.length)
    return
  }

  buildMinHeap(lastHeapifyIdx: number, heapSize: number) {
    const lastLeafIdx = heapSize - 1
    const lastNonLeafIdx = Math.floor((lastLeafIdx - 1) / 2)
    lastHeapifyIdx = Math.min(lastHeapifyIdx, lastNonLeafIdx)
    for (let i = lastHeapifyIdx; i >= 0; i--) {
      this.minHeapify(i, heapSize)
    }
  }

  minHeapify(idx: number, heapSize: number) {
    let childIdx = idx
    const left = idx * 2 + 1
    const right = idx * 2 + 2
    if (left < heapSize && this.itemList[left].timestamp < this.itemList[childIdx].timestamp) {
      childIdx = left
    }
    if (right < heapSize && this.itemList[right].timestamp < this.itemList[childIdx].timestamp) {
      childIdx = right
    }
    if (childIdx !== idx) {
      ;[this.itemList[idx], this.itemList[childIdx]] = [this.itemList[childIdx], this.itemList[idx]]
      this.minHeapify(childIdx, heapSize)
    }
  }

  getHeap() {
    return this.itemList
  }

  clearHeap() {
    this.itemList = []
  }

  getAndClearHeap() {
    const oldMinHeap = this.itemList
    this.itemList = []
    return oldMinHeap
  }

  shift() {
    const item = this.itemList.shift()
    this.minHeapify(0, this.itemList.length)
    return item
  }
}

export class VoidFnQueue {
  private fnList: VoidFn[] = []

  // run = this.runFnUseRequestIdleCallback;
  push(fn: VoidFn, ctx?: unknown, ...args: unknown[]) {
    this.runFnUseRequestIdleCallback(fn, ctx, ...args)
  }

  runFnUseRequestIdleCallback(fn: VoidFn, ctx?: unknown, ...args: unknown[]) {
    if (typeof fn !== 'function') return
    this.fnList.push(fn.bind(ctx, ...args))
    requestIdleCallback(() => this.flushFnList())
  }

  runFnUsePromise(fn: VoidFn, ctx?: unknown, ...args: unknown[]) {
    if (typeof fn !== 'function') return
    this.fnList.push(fn.bind(ctx, ...args))
    Promise.resolve().then(() => this.flushFnList())
  }

  clear() {
    this.fnList = []
  }

  flushFnList() {
    const oldFnList = this.fnList
    this.fnList = []
    oldFnList.forEach((fn) => fn())
  }
}
