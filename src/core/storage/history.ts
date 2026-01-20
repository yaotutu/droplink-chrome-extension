/**
 * 历史消息存储管理模块
 * 负责追踪已处理的 Gotify 消息 ID，避免重复打开标签页
 */

const STORAGE_KEY = "droplink_history"
const INSTALL_TIME_KEY = "droplink_install_time"
const MAX_HISTORY_SIZE = 1000 // 保留最近 1000 条消息 ID

/**
 * 历史记录数据结构
 */
interface HistoryRecord {
  processedIds: number[] // 已处理的消息 ID 列表（降序排列，新消息在前）
  lastSyncTime?: number // 最后同步时间戳
}

/**
 * 获取插件安装时间
 * @returns 安装时间戳（毫秒），如果不存在则返回 null
 */
export async function getInstallTime(): Promise<number | null> {
  try {
    const result = await chrome.storage.local.get(INSTALL_TIME_KEY)
    const installTime = result[INSTALL_TIME_KEY] as number | undefined
    return installTime ?? null
  } catch (error) {
    console.error("[HistoryStorage] 获取安装时间失败:", error)
    return null
  }
}

/**
 * 设置插件安装时间（只在首次安装时调用）
 * @param timestamp 安装时间戳（毫秒）
 */
export async function setInstallTime(timestamp: number): Promise<void> {
  try {
    // 检查是否已经存在
    const existing = await getInstallTime()
    if (existing !== null) {
      console.log("[HistoryStorage] 安装时间已存在，跳过设置")
      return
    }

    await chrome.storage.local.set({ [INSTALL_TIME_KEY]: timestamp })
    console.log(
      `[HistoryStorage] 安装时间已设置: ${new Date(timestamp).toISOString()}`
    )
  } catch (error) {
    console.error("[HistoryStorage] 设置安装时间失败:", error)
    throw error
  }
}

/**
 * 获取已处理的消息 ID 列表
 * @returns 已处理的消息 ID 数组（降序排列）
 */
export async function getProcessedIds(): Promise<number[]> {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEY)
    const record = result[STORAGE_KEY] as HistoryRecord | undefined

    if (!record || !Array.isArray(record.processedIds)) {
      console.log("[HistoryStorage] 首次获取，返回空数组")
      return []
    }

    console.log(
      `[HistoryStorage] 获取已处理消息 ID: ${record.processedIds.length} 条`
    )
    return record.processedIds
  } catch (error) {
    console.error("[HistoryStorage] 获取已处理 ID 失败:", error)
    return []
  }
}

/**
 * 标记消息为已处理
 * 自动去重、排序（降序）、限制数量（保留最近 1000 条）
 * @param ids 新的消息 ID 列表
 */
export async function markAsProcessed(ids: number[]): Promise<void> {
  if (!ids || ids.length === 0) {
    return
  }

  try {
    // 获取现有记录
    const existingIds = await getProcessedIds()

    // 合并新旧 ID
    const allIds = [...existingIds, ...ids]

    // 去重并降序排序（新消息在前）
    const uniqueIds = Array.from(new Set(allIds)).sort((a, b) => b - a)

    // 限制数量（保留最近 1000 条）
    const limitedIds = uniqueIds.slice(0, MAX_HISTORY_SIZE)

    // 构建新记录
    const newRecord: HistoryRecord = {
      processedIds: limitedIds,
      lastSyncTime: Date.now()
    }

    // 保存到 storage
    await chrome.storage.local.set({ [STORAGE_KEY]: newRecord })

    console.log(
      `[HistoryStorage] 已标记 ${ids.length} 条消息为已处理，` +
        `当前总计: ${limitedIds.length} 条`
    )
  } catch (error) {
    console.error("[HistoryStorage] 标记已处理消息失败:", error)
    throw error
  }
}

/**
 * 检查消息是否已处理
 * @param id 消息 ID
 * @param processedIds 已处理的消息 ID 列表
 * @returns true 表示已处理，false 表示未处理
 */
export function isProcessed(id: number, processedIds: number[]): boolean {
  return processedIds.includes(id)
}

/**
 * 清空历史记录（仅用于测试或重置）
 */
export async function clearHistory(): Promise<void> {
  try {
    await chrome.storage.local.remove(STORAGE_KEY)
    console.log("[HistoryStorage] 历史记录已清空")
  } catch (error) {
    console.error("[HistoryStorage] 清空历史记录失败:", error)
    throw error
  }
}

/**
 * 获取历史记录统计信息（用于调试）
 */
export async function getHistoryStats(): Promise<{
  count: number
  lastSyncTime?: number
  oldestId?: number
  newestId?: number
}> {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEY)
    const record = result[STORAGE_KEY] as HistoryRecord | undefined

    if (!record || !record.processedIds || record.processedIds.length === 0) {
      return { count: 0 }
    }

    return {
      count: record.processedIds.length,
      lastSyncTime: record.lastSyncTime,
      newestId: record.processedIds[0], // 降序排列，第一个是最新的
      oldestId: record.processedIds[record.processedIds.length - 1]
    }
  } catch (error) {
    console.error("[HistoryStorage] 获取统计信息失败:", error)
    return { count: 0 }
  }
}
