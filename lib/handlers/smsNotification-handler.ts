/**
 * SmsNotification 处理器 - 短信通知
 */

import type { SmsNotificationMessage } from "~types"

import { showInfo } from "../notifications"
import { MessageHandler } from "./base-handler"

export class SmsNotificationHandler extends MessageHandler<SmsNotificationMessage> {
  readonly action = "smsNotification" as const

  validate(message: any): message is SmsNotificationMessage {
    return (
      message?.action === "smsNotification" &&
      typeof message.content === "string" &&
      message.content.trim() !== ""
    )
  }

  async handle(message: SmsNotificationMessage): Promise<void> {
    const { content, sender, verificationCode } = message

    // 提取验证码
    const code = verificationCode || this.extractCode(content)

    // 显示通知（添加时间戳确保每次通知都不同，避免被 Chrome 合并）
    const now = new Date()
    const timeStr = now.toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    })

    const title = sender ? `来自 ${sender} 的短信 (${timeStr})` : `短信通知 (${timeStr})`
    const msg = code ? `验证码: ${code}\n${content}` : content

    await showInfo(title, msg)
  }

  /**
   * 从短信内容中提取验证码
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
