/**
 * OpenTab 处理器 - 打开标签页
 */

import type { GotifyMessage } from "~types"

import { getConfig } from "~lib/storage"

import { showError, showSuccess } from "../notifications"
import { MessageHandler } from "./base-handler"

export class OpenTabHandler extends MessageHandler<GotifyMessage> {
  readonly action = "openTab" as const

  validate(message: GotifyMessage): message is GotifyMessage {
    // 检查是否有 droplink.action='openTab'
    const droplink = message.extras?.droplink
    return (
      droplink?.action === "openTab" &&
      typeof droplink.url === "string" &&
      (droplink.url.startsWith("http://") || droplink.url.startsWith("https://"))
    )
  }

  async handle(message: GotifyMessage): Promise<void> {
    const config = await getConfig()

    // 如果功能未启用，直接返回
    if (!config.features.openTab) {
      return
    }

    const droplink = message.extras?.droplink
    if (!droplink || droplink.action !== "openTab") {
      return
    }

    const { url, options } = droplink
    const activate = options?.activate ?? true

    console.log(`[OpenTabHandler] 打开标签页: ${url} (激活: ${activate})`)

    try {
      await chrome.tabs.create({ url, active: activate })

      // 根据配置决定是否显示通知
      if (config.openTabNotification) {
        await showSuccess("链接已打开", url)
      }
    } catch (error) {
      console.error("[OpenTabHandler] 打开失败:", error)
      await showError("无法打开链接", url)
      throw error
    }
  }
}
