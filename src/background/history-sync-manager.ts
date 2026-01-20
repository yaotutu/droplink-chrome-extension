/**
 * 历史同步管理器
 * 负责在 WebSocket 连接成功时同步历史消息
 */

import type { Config, GotifyMessage } from "~/shared/types"
import type { MessageRouter } from "~/core/messaging/router"
import { getMessages } from "~/core/gotify/rest-client"
import {
  getProcessedIds,
  markAsProcessed,
  isProcessed,
  getInstallTime
} from "~/core/storage/history"
import { getConfig } from "~/core/storage"
import { showInfo, showError } from "~/core/notifications"

export class HistorySyncManager {
  private isSyncing = false // 防止并发同步

  constructor(private router: MessageRouter) {}

  /**
   * 同步历史消息
   * 只在 WebSocket 连接成功时调用
   */
  async sync(): Promise<void> {
    // 防重复：如果正在同步，跳过
    if (this.isSyncing) {
      console.log("[HistorySync] 同步正在进行中，跳过")
      return
    }

    this.isSyncing = true
    console.log("[HistorySync] ======== 开始历史消息同步 ========")

    try {
      // 1. 获取配置
      const config = await getConfig()
      if (!config) {
        console.warn("[HistorySync] 配置未设置，跳过同步")
        return
      }

      // 2. 检查是否启用历史同步
      if (!config.enableHistorySync) {
        console.log("[HistorySync] 历史同步已禁用，跳过")
        return
      }

      // 3. 拉取历史消息
      const fetchLimit = config.fetchHistoryLimit || 100
      console.log(`[HistorySync] 正在拉取最近 ${fetchLimit} 条消息...`)

      const allMessages = await getMessages(config, fetchLimit)
      console.log(`[HistorySync] 拉取到 ${allMessages.length} 条消息`)

      // 4. 过滤未处理的消息
      const unprocessedMessages = await this.filterUnprocessedMessages(
        allMessages,
        config
      )

      if (unprocessedMessages.length === 0) {
        console.log("[HistorySync] 没有未处理的消息")
        return
      }

      console.log(
        `[HistorySync] 发现 ${unprocessedMessages.length} 条未处理的消息，准备打开`
      )

      // 5. 批量打开标签页
      await this.processBatch(unprocessedMessages, config)

      // 6. 标记为已处理
      const processedIds = unprocessedMessages.map((msg) => msg.id)
      await markAsProcessed(processedIds)

      console.log("[HistorySync] ======== 历史消息同步完成 ========")
    } catch (error) {
      console.error("[HistorySync] 同步失败:", error)

      // 显示错误通知
      const errorMessage =
        error instanceof Error ? error.message : "未知错误"
      await showError("历史同步失败", errorMessage).catch((err) =>
        console.error("[HistorySync] 显示错误通知失败:", err)
      )
    } finally {
      this.isSyncing = false
    }
  }

  /**
   * 过滤未处理的消息
   * @param messages 所有消息
   * @param config 配置
   * @returns 未处理的 Droplink 消息（按时间倒序，最新的在前，限制数量）
   */
  private async filterUnprocessedMessages(
    messages: GotifyMessage[],
    config: Config
  ): Promise<GotifyMessage[]> {
    // 0. 获取插件安装时间
    const installTime = await getInstallTime()
    if (installTime !== null) {
      console.log(
        `[HistorySync] 插件安装时间: ${new Date(installTime).toISOString()}`
      )

      // 过滤安装时间之前的消息
      const beforeFilter = messages.length
      messages = messages.filter((msg) => {
        const messageTime = new Date(msg.date).getTime()
        return messageTime >= installTime
      })
      const filtered = beforeFilter - messages.length
      if (filtered > 0) {
        console.log(
          `[HistorySync] 过滤安装时间之前的消息: ${filtered} 条，剩余: ${messages.length} 条`
        )
      }
    } else {
      console.log("[HistorySync] 未找到安装时间，处理所有消息")
    }

    // 1. 获取已处理的消息 ID 列表
    const processedIds = await getProcessedIds()
    console.log(`[HistorySync] 已处理消息数量: ${processedIds.length}`)

    // 2. 过滤：移除已处理的消息
    const unprocessed = messages.filter((msg) => !isProcessed(msg.id, processedIds))
    console.log(`[HistorySync] 过滤已处理消息后剩余: ${unprocessed.length} 条`)

    // 3. 过滤：只保留有效的 Droplink 消息
    const droplinkMessages = unprocessed.filter((msg) => {
      // 检查是否包含 droplink 字段
      if (!msg.extras?.droplink) {
        return false
      }

      // 检查是否包含 openTab action
      const hasOpenTabAction = msg.extras.droplink.actions?.some(
        (action) => action.type === "openTab"
      )

      if (!hasOpenTabAction) {
        return false
      }

      // 检查是否有有效的 URL
      const hasValidUrl =
        msg.extras.droplink.content?.type === "url" &&
        typeof msg.extras.droplink.content.value === "string" &&
        msg.extras.droplink.content.value.trim().length > 0

      return hasValidUrl
    })

    console.log(
      `[HistorySync] 过滤非 Droplink 消息后剩余: ${droplinkMessages.length} 条`
    )

    // 4. 按时间倒序排序（新消息优先）
    // Gotify 消息的 date 字段是 ISO 8601 格式，可以直接比较
    const sorted = droplinkMessages.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })

    // 5. 限制数量：只取前 maxOpenTabs 条
    const maxOpenTabs = config.maxOpenTabs || 10
    const limited = sorted.slice(0, maxOpenTabs)

    console.log(
      `[HistorySync] 限制数量后（最多 ${maxOpenTabs} 条）: ${limited.length} 条`
    )

    return limited
  }

  /**
   * 批量打开标签页
   * @param messages 消息列表
   * @param config 配置
   */
  private async processBatch(
    messages: GotifyMessage[],
    config: Config
  ): Promise<void> {
    const batchInterval = config.batchOpenInterval || 300
    let successCount = 0

    console.log(
      `[HistorySync] 开始批量打开 ${messages.length} 个标签页，间隔 ${batchInterval}ms`
    )

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i]

      try {
        console.log(
          `[HistorySync] [${i + 1}/${messages.length}] 处理消息 ID: ${msg.id}`
        )

        // 调用路由器处理消息（会触发 openTab handler）
        await this.router.route(msg)
        successCount++

        // 如果不是最后一条消息，等待间隔时间
        if (i < messages.length - 1) {
          await this.sleep(batchInterval)
        }
      } catch (error) {
        console.error(
          `[HistorySync] 处理消息 ${msg.id} 失败:`,
          error
        )
        // 继续处理下一条消息
      }
    }

    console.log(`[HistorySync] 批量打开完成，成功: ${successCount} 条`)

    // 显示完成通知（如果启用）
    if (config.showBatchNotification && successCount > 0) {
      await showInfo(
        "历史消息已恢复",
        `已打开 ${successCount} 个链接`
      ).catch((err) =>
        console.error("[HistorySync] 显示完成通知失败:", err)
      )
    }
  }

  /**
   * 延时工具函数
   * @param ms 延时毫秒数
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
