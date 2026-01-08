/**
 * Runtime 消息通信 Hook
 * 用于与 background service worker 通信
 */

import type { RuntimeMessage, RuntimeResponse } from "~/shared/types"

export function useRuntimeMessage() {
  /**
   * 发送消息到 background
   */
  const sendMessage = (message: RuntimeMessage): Promise<RuntimeResponse> => {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(message, (response: RuntimeResponse) => {
        resolve(response)
      })
    })
  }

  return { sendMessage }
}
