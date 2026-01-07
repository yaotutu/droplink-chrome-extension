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
    try {
      // 1. 验证 Droplink 消息
      const droplink = message?.extras?.droplink
      if (!droplink || typeof droplink !== "object") {
        return
      }

      const action = droplink.action
      if (!action) {
        console.warn("[Router] 消息缺少 action 字段")
        return
      }

      console.log(`[Router] 收到消息 - 类型: ${action}`)

      // 2. 检查功能是否启用
      if (!this.config?.features[action]) {
        console.log(`[Router] 功能 ${action} 未启用，跳过`)
        return
      }

      // 3. 查找处理器
      const handler = this.handlers.get(action)
      if (!handler) {
        console.warn(`[Router] 未找到处理器: ${action}`)
        return
      }

      if (!handler.validate(droplink)) {
        console.warn(`[Router] 消息验证失败: ${action}`)
        return
      }

      // 4. 创建上下文
      const context: HookContext = {
        message,
        action,
        cancelled: false
      }

      // 5. pre-process 钩子
      for (const hook of preProcessHooks) {
        try {
          await hook(context)
          if (context.cancelled) {
            console.log("[Router] 消息被 pre 钩子取消")
            return
          }
        } catch (error) {
          console.error("[Router] pre 钩子执行失败:", error)
        }
      }

      // 6. 执行处理器
      try {
        await handler.handle(droplink)
        context.result = { success: true }
        console.log(`[Router] 处理成功: ${action}`)
      } catch (error) {
        console.error(`[Router] 处理失败:`, error)
        context.result = { success: false, error: String(error) }
      }

      // 7. post-process 钩子
      for (const hook of postProcessHooks) {
        try {
          await hook(context)
        } catch (error) {
          console.error("[Router] post 钩子执行失败:", error)
        }
      }
    } catch (error) {
      console.error("[Router] 路由发生错误:", error)
    }
  }
}
