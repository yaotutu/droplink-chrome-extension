/**
 * OpenTab 处理器 - 打开标签页
 *
 * 支持新格式的 Droplink 消息，从 content.value 提取 URL
 * 遍历 actions 数组，处理所有 type === "openTab" 且 handler 为空或 "chrome" 的操作
 */

import type { GotifyMessage, DroplinkAction } from "~/shared/types"

import { showError, showSuccess } from "~/core/notifications"
import {
  isActionForChrome,
  isValidDroplinkUrl,
  hasOpenTabAction
} from "~/shared/utils/validators"
import type { MessageContext } from "../context"
import { MessageHandler } from "./base"

export class OpenTabHandler extends MessageHandler<GotifyMessage> {
  readonly action = "openTab" as const

  validate(message: GotifyMessage): message is GotifyMessage {
    const droplink = message.extras?.droplink
    if (!droplink) return false

    // 使用共享的验证函数
    return (
      hasOpenTabAction(droplink.actions || []) &&
      isValidDroplinkUrl(droplink.content)
    )
  }

  async handle(message: GotifyMessage, context: MessageContext): Promise<void> {
    const { config } = context
    const droplink = message.extras?.droplink
    if (!droplink) return

    const url = droplink.content?.value
    if (!url) return

    // 找到所有由 Chrome Extension 处理的 openTab actions
    const openTabActions =
      droplink.actions?.filter(
        (action: DroplinkAction) =>
          action.type === "openTab" && isActionForChrome(action)
      ) || []

    // 处理每个 openTab action
    for (const action of openTabActions) {
      // 提取 activate 选项（优先级：action.params > 默认值）
      const activate = action.params?.activate ?? true

      console.log(
        `[OpenTabHandler] 打开标签页: ${url} (激活: ${activate}, handler: ${action.handler || "chrome"})`
      )

      try {
        await chrome.tabs.create({ url, active: activate })

        if (config.openTabNotification) {
          await showSuccess("链接已打开", url)
        }
      } catch (error) {
        console.error("[OpenTabHandler] 打开失败:", error)

        if (config.openTabNotification) {
          await showError("无法打开链接", url)
        }

        throw error
      }
    }
  }
}
