/**
 * OpenTab 处理器 - 打开标签页
 *
 * 使用依赖注入获取配置，避免直接耦合 storage 模块
 */

import type { GotifyMessage } from "~/shared/types"

import { showError, showSuccess } from "~/core/notifications"
import type { MessageContext } from "../context"
import { MessageHandler } from "./base"

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

  async handle(message: GotifyMessage, context: MessageContext): Promise<void> {
    // 从 context 获取配置
    const { config } = context

    const droplink = message.extras?.droplink
    if (!droplink || droplink.action !== "openTab") {
      return
    }

    const { url, options } = droplink
    const activate = options?.activate ?? true

    console.log(`[OpenTabHandler] 打开标签页: ${url} (激活: ${activate})`)

    try {
      await chrome.tabs.create({ url, active: activate })

      // 根据配置决定是否显示成功通知
      if (config.openTabNotification) {
        await showSuccess("链接已打开", url)
      }
    } catch (error) {
      console.error("[OpenTabHandler] 打开失败:", error)

      // 错误通知也应该受配置控制
      if (config.openTabNotification) {
        await showError("无法打开链接", url)
      }

      throw error
    }
  }
}
