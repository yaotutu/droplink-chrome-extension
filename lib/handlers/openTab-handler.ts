/**
 * OpenTab 处理器 - 打开标签页
 */

import type { OpenTabMessage } from "~types"

import { showError, showSuccess } from "../notifications"
import { MessageHandler } from "./base-handler"

export class OpenTabHandler extends MessageHandler<OpenTabMessage> {
  readonly action = "openTab" as const

  validate(message: any): message is OpenTabMessage {
    return (
      message?.action === "openTab" &&
      typeof message.url === "string" &&
      (message.url.startsWith("http://") || message.url.startsWith("https://"))
    )
  }

  async handle(message: OpenTabMessage): Promise<void> {
    const { url, options } = message
    const activate = options?.activate ?? true

    console.log(`[OpenTabHandler] 打开标签页: ${url} (激活: ${activate})`)

    try {
      await chrome.tabs.create({ url, active: activate })
      await showSuccess("链接已打开", url)
    } catch (error) {
      console.error("[OpenTabHandler] 打开失败:", error)
      await showError("无法打开链接", url)
      throw error
    }
  }
}
