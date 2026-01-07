/**
 * 消息路由器
 */

import type { Config, GotifyMessage, HookContext, HookFn } from "~types"

import { MessageHandler } from "./handlers/base-handler"

// 钩子数组
export const preProcessHooks: HookFn[] = []
export const postProcessHooks: HookFn[] = []

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

    try {
      // 检查总开关是否启用
      if (!this.config?.enabled) {
        return
      }

      // 广播给所有 handlers（每个 handler 自己决定是否处理）
      for (const handler of this.handlers.values()) {
        try {
          // 每个 handler 独立处理消息
          await handler.handle(message)
        } catch (error) {
          console.error(`[Router] Handler ${handler.action} 执行失败:`, error)
        }
      }
    } catch (error) {
      console.error("[Router] 路由发生错误:", error)
    }
  }
}
