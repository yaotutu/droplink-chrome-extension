/**
 * 消息处理器
 * 验证和处理 Gotify 消息
 */

import type { DroplinkMessage, GotifyMessage } from "~types"

import { openTab, showErrorNotification } from "./tab-manager"

/**
 * 检查消息是否是 Droplink 格式
 */
export function isDroplinkMessage(message: any): boolean {
  try {
    console.log("[MessageHandler] 开始验证消息格式...")

    // 检查基本结构
    if (!message || typeof message !== "object") {
      console.log("[MessageHandler] ❌ 消息不是对象")
      return false
    }

    // 检查 extras.droplink 字段
    const droplink = message?.extras?.droplink
    if (!droplink || typeof droplink !== "object") {
      console.log("[MessageHandler] ❌ 缺少 extras.droplink 字段")
      console.log("[MessageHandler] 消息结构:", JSON.stringify(message, null, 2))
      return false
    }

    console.log("[MessageHandler] ✓ 找到 extras.droplink 字段:", droplink)

    // 检查 action 字段
    if (droplink.action !== "openTab") {
      console.log(`[MessageHandler] ❌ action 不是 'openTab'，而是: ${droplink.action}`)
      return false
    }

    console.log("[MessageHandler] ✓ action 字段正确")

    // 检查 url 字段
    if (typeof droplink.url !== "string") {
      console.log(`[MessageHandler] ❌ url 不是字符串，而是: ${typeof droplink.url}`)
      return false
    }

    console.log(`[MessageHandler] ✓ url 字段正确: ${droplink.url}`)

    // 验证 URL 格式
    if (
      !droplink.url.startsWith("http://") &&
      !droplink.url.startsWith("https://")
    ) {
      console.log(`[MessageHandler] ❌ URL 格式错误，不是 http:// 或 https:// 开头`)
      return false
    }

    console.log("[MessageHandler] ✅ 消息验证通过！")
    return true
  } catch (error) {
    console.error("[MessageHandler] 验证消息格式时出错:", error)
    return false
  }
}

/**
 * 处理 Gotify 消息
 * @param message Gotify 消息对象
 */
export async function handleMessage(message: GotifyMessage): Promise<void> {
  try {
    console.log("[MessageHandler] 收到消息:", message)

    // 验证是否是 Droplink 消息
    if (!isDroplinkMessage(message)) {
      console.log("[MessageHandler] 非 Droplink 消息，忽略")
      return
    }

    // 提取 Droplink 数据
    const droplink = message.extras!.droplink as DroplinkMessage
    const { url, options } = droplink

    // 确定是否激活标签页
    const activate = options?.activate ?? true

    console.log(
      `[MessageHandler] 处理 openTab 请求: ${url} (激活: ${activate})`
    )

    // 打开标签页
    try {
      await openTab(url, activate)
      console.log(`[MessageHandler] 成功打开标签页: ${url}`)
    } catch (error) {
      console.error(`[MessageHandler] 打开标签页失败: ${url}`, error)

      // 显示错误通知
      await showErrorNotification(`无法打开链接`, url)
    }
  } catch (error) {
    console.error("[MessageHandler] 处理消息时发生错误:", error)
  }
}

/**
 * 提取 Droplink 消息数据
 * @param message Gotify 消息对象
 * @returns Droplink 消息数据，如果不是有效的 Droplink 消息则返回 null
 */
export function extractDroplinkData(
  message: any
): DroplinkMessage | null {
  if (!isDroplinkMessage(message)) {
    return null
  }

  return message.extras.droplink as DroplinkMessage
}
