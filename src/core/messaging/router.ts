/**
 * 消息路由器
 */

import type { Config, GotifyMessage } from "~/shared/types"

import { MessageHandler } from "./handlers/base"
import { MessageContext } from "./context"
import { showInfo } from "~/core/notifications"
import { markAsProcessed } from "~/core/storage/history"

export class MessageRouter {
  private handlers = new Map<string, MessageHandler<any>>()
  private config: Config | null = null

  /**
   * 注册处理器
   */
  register(handler: MessageHandler<any>) {
    this.handlers.set(handler.action, handler)
    console.log(`[Router] 注册处理器: ${handler.action}`)
  }

  /**
   * 设置配置
   */
  setConfig(config: Config) {
    this.config = config
  }

  /**
   * 路由消息到对应的处理器
   */
  async route(message: GotifyMessage) {
    console.log(`[Router] 收到消息 - App: ${message.appid}, Title: ${message.title}`)

    // 调试：打印完整的消息内容
    console.log("[Router] 完整消息内容:", JSON.stringify(message, null, 2))

    // 调试：特别打印 droplink 字段
    if (message.extras?.droplink) {
      console.log("[Router] Droplink 字段:", JSON.stringify(message.extras.droplink, null, 2))
    } else {
      console.log("[Router] ⚠️ 消息不包含 droplink 字段")
    }

    if (!this.config) {
      console.warn("[Router] 配置未设置，忽略消息")
      return
    }

    try {
      // 如果启用了"显示所有通知"，则显示通知
      // 通知失败不应中断消息处理
      if (this.config.showAllNotifications) {
        try {
          await showInfo(message.title, message.message)
        } catch (error) {
          console.error("[Router] 显示通知失败:", error)
          // 继续处理消息，不中断
        }
      }

      // 创建上下文并传递给 handlers
      const context = new MessageContext(this.config)

      // 广播给所有 handlers（每个 handler 自己决定是否处理）
      for (const handler of this.handlers.values()) {
        try {
          // 每个 handler 独立处理消息，传入 context
          await handler.handle(message, context)
        } catch (error) {
          console.error(`[Router] Handler ${handler.action} 执行失败:`, error)
          // 继续处理其他 handlers，不中断
        }
      }

      // 标记消息为已处理（只标记 Droplink 消息）
      if (message.extras?.droplink) {
        // 异步标记，不阻塞消息处理
        markAsProcessed([message.id]).catch((error) => {
          console.error("[Router] 标记消息为已处理失败:", error)
        })
      }
    } catch (error) {
      console.error("[Router] 路由发生未预期错误:", error)
    }
  }
}
