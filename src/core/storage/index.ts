/**
 * 配置存储管理模块
 * 使用 chrome.storage.sync API 存储和读取配置
 */

import type { Config } from "~/shared/types"
import { DEFAULT_CONFIG } from "~/shared/utils/constants"
import { isValidGotifyUrl, isValidToken } from "~/shared/utils/validators"

/** Storage key */
const STORAGE_KEY = "droplink_config"

/** 全局监听器引用，用于防止重复注册 */
let configChangeListener:
  | ((
      changes: chrome.storage.StorageChange,
      areaName: chrome.storage.AreaName
    ) => void)
  | null = null

/**
 * 获取配置
 */
export async function getConfig(): Promise<Config> {
  try {
    const result = await chrome.storage.sync.get(STORAGE_KEY)
    const config = result[STORAGE_KEY] as Config | undefined

    if (!config) {
      return { ...DEFAULT_CONFIG }
    }

    return {
      gotifyUrl: config.gotifyUrl || DEFAULT_CONFIG.gotifyUrl,
      clientToken: config.clientToken || DEFAULT_CONFIG.clientToken,
      appToken: config.appToken || DEFAULT_CONFIG.appToken,
      openTabNotification:
        config.openTabNotification ?? DEFAULT_CONFIG.openTabNotification,
      showAllNotifications:
        config.showAllNotifications ?? DEFAULT_CONFIG.showAllNotifications,
      // 历史同步相关配置（新增）
      enableHistorySync:
        config.enableHistorySync ?? DEFAULT_CONFIG.enableHistorySync,
      fetchHistoryLimit:
        config.fetchHistoryLimit ?? DEFAULT_CONFIG.fetchHistoryLimit,
      maxOpenTabs: config.maxOpenTabs ?? DEFAULT_CONFIG.maxOpenTabs,
      batchOpenInterval:
        config.batchOpenInterval ?? DEFAULT_CONFIG.batchOpenInterval,
      showBatchNotification:
        config.showBatchNotification ?? DEFAULT_CONFIG.showBatchNotification
    }
  } catch (error) {
    console.error("[Storage] 读取配置失败:", error)
    return { ...DEFAULT_CONFIG }
  }
}

/**
 * 保存配置
 */
export async function saveConfig(config: Config): Promise<void> {
  try {
    await chrome.storage.sync.set({
      [STORAGE_KEY]: config
    })
    console.log("[Storage] 配置已保存:", config)
  } catch (error) {
    console.error("[Storage] 保存配置失败:", error)
    throw new Error("保存配置失败")
  }
}

/**
 * 验证配置是否有效
 */
export function isConfigValid(config: Config): boolean {
  return isValidGotifyUrl(config.gotifyUrl) && isValidToken(config.clientToken)
}

/**
 * 验证 URL 格式
 */
export function validateUrl(url: string): { valid: boolean; error?: string } {
  if (!url || url.trim() === "") {
    return { valid: false, error: "URL 不能为空" }
  }

  if (!isValidGotifyUrl(url)) {
    return { valid: false, error: "URL 格式无效或不是 HTTP(S) URL" }
  }

  return { valid: true }
}

/**
 * 验证 Token 格式
 */
export function validateToken(token: string): {
  valid: boolean
  error?: string
} {
  if (!token || token.trim() === "") {
    return { valid: false, error: "Token 不能为空" }
  }

  if (!isValidToken(token)) {
    return { valid: false, error: "Token 长度太短（至少 10 个字符）" }
  }

  return { valid: true }
}

/**
 * 监听配置变化
 * 防止重复注册：如果已有监听器，会先移除旧的再注册新的
 */
export function onConfigChange(
  callback: (newConfig: Config, oldConfig: Config) => void
): void {
  // 如果已经注册过，先移除旧的监听器
  if (configChangeListener) {
    console.log("[Storage] 移除旧的配置监听器")
    chrome.storage.onChanged.removeListener(configChangeListener)
  }

  // 创建新的监听器
  configChangeListener = (changes, areaName) => {
    if (areaName === "sync" && changes[STORAGE_KEY]) {
      const oldConfig =
        (changes[STORAGE_KEY].oldValue as Config | undefined) || {
          ...DEFAULT_CONFIG
        }
      const newConfig = changes[STORAGE_KEY].newValue as Config | undefined

      if (newConfig) {
        callback(newConfig, oldConfig)
      }
    }
  }

  // 注册新的监听器
  chrome.storage.onChanged.addListener(configChangeListener)
  console.log("[Storage] 配置监听器已注册")
}

/**
 * 移除配置变化监听器
 * 用于清理资源（可选）
 */
export function offConfigChange(): void {
  if (configChangeListener) {
    console.log("[Storage] 移除配置监听器")
    chrome.storage.onChanged.removeListener(configChangeListener)
    configChangeListener = null
  }
}
