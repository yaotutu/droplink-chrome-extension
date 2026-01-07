/**
 * Notification 处理器 - 通知
 */

import type { Config, GotifyMessage } from "~types"

import { getConfig } from "~lib/storage"

import { showInfo } from "../notifications"
import { MessageHandler } from "./base-handler"

export class NotificationHandler extends MessageHandler<GotifyMessage> {
  readonly action = "notification" as const

  validate(message: GotifyMessage): message is GotifyMessage {
    // 所有 Gotify 消息都可能被通知
    return true
  }

  async handle(message: GotifyMessage): Promise<void> {
    const config = await getConfig()

    // 如果通知功能未启用，直接返回
    if (!config.features.notification) {
      return
    }

    // 应用过滤规则
    if (!this.shouldShowNotification(message, config)) {
      return
    }

    // 使用原始 Gotify 消息的 title 和 message 字段
    const title = message.title || "通知"
    const content = message.message

    // 提取验证码
    const code = this.extractCode(content)

    // 显示通知（添加时间戳确保每次通知都不同，避免被 Chrome 合并）
    const now = new Date()
    const timeStr = now.toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    })

    const displayTitle = `${title} (${timeStr})`
    const displayContent = code ? `验证码: ${code}\n${content}` : content

    await showInfo(displayTitle, displayContent)
  }

  /**
   * 判断是否应该显示通知
   */
  private shouldShowNotification(
    message: GotifyMessage,
    config: Config
  ): boolean {
    const filters = config.notificationFilters

    // 1. 如果没有启用过滤，展示所有消息
    if (!filters?.enabled) {
      return true
    }

    // 2. 检查是否过滤 openTab 消息
    if (filters?.filterOpenTab) {
      const droplink = message.extras?.droplink
      if (droplink?.action === "openTab") {
        return false
      }
    }

    // 3. 如果没有规则，展示所有消息
    if (!filters?.rules || filters.rules.length === 0) {
      return true
    }

    // 4. 遍历所有规则，满足任一即可
    const searchText = `${message.title || ""} ${message.message || ""}`.toLowerCase()

    for (const rule of filters.rules) {
      if (this.matchesRule(searchText, rule)) {
        return true
      }
    }

    // 5. 所有规则都不满足
    return false
  }

  /**
   * 检查消息是否匹配规则
   */
  private matchesRule(searchText: string, rule: import("~types").NotificationRule): boolean {
    // 规则没有关键词，视为匹配
    if (!rule.keywords || rule.keywords.length === 0) {
      return true
    }

    switch (rule.type) {
      case "include":
        // 包含任一关键词即可
        return rule.keywords.some((keyword) =>
          searchText.includes(keyword.toLowerCase())
        )

      case "exclude":
        // 不包含所有关键词（即不包含任一）
        return !rule.keywords.some((keyword) =>
          searchText.includes(keyword.toLowerCase())
        )

      default:
        return false
    }
  }

  /**
   * 从内容中提取验证码
   */
  private extractCode(content: string): string | null {
    const patterns = [
      /验证码[：:]\s*(\d{4,8})/,
      /code[：:]\s*(\d{4,8})/i,
      /(\d{4,8})\s*为您的验证码/,
      /【.*】.*?(\d{4,8})/
    ]

    for (const pattern of patterns) {
      const match = content.match(pattern)
      if (match) return match[1]
    }

    return null
  }
}
