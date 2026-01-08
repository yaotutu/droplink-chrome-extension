/**
 * 消息路由器
 */

import type { Config, GotifyMessage } from "~/shared/types"

import { MessageHandler } from "./handlers/base"
import { MessageContext } from "./context"

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

    if (!this.config) {
      console.warn("[Router] 配置未设置，忽略消息")
      return
    }

    try {
      // 创建上下文并传递给 handlers
      const context = new MessageContext(this.config)

      // 广播给所有 handlers（每个 handler 自己决定是否处理）
      for (const handler of this.handlers.values()) {
        try {
          // 每个 handler 独立处理消息，传入 context
          await handler.handle(message, context)
        } catch (error) {
          console.error(`[Router] Handler ${handler.action} 执行失败:`, error)
        }
      }
    } catch (error) {
      console.error("[Router] 路由发生错误:", error)
    }
  }
}
