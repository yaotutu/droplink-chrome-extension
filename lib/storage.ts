/**
 * 配置存储管理模块
 * 使用 chrome.storage.sync API 存储和读取配置
 */

import type { Config } from "~types"

/** 默认配置 */
const DEFAULT_CONFIG: Config = {
  gotifyUrl: "",
  clientToken: "",
  enabled: false
}

/** Storage key */
const STORAGE_KEY = "droplink_config"

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
      enabled: config.enabled ?? DEFAULT_CONFIG.enabled
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
  // 检查 URL 是否有效
  if (!config.gotifyUrl || config.gotifyUrl.trim() === "") {
    return false
  }

  try {
    const url = new URL(config.gotifyUrl)
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return false
    }
  } catch {
    return false
  }

  // 检查 Token 是否有效
  if (!config.clientToken || config.clientToken.trim() === "") {
    return false
  }

  return true
}

/**
 * 验证 URL 格式
 */
export function validateUrl(url: string): { valid: boolean; error?: string } {
  if (!url || url.trim() === "") {
    return { valid: false, error: "URL 不能为空" }
  }

  try {
    const urlObj = new URL(url)
    if (urlObj.protocol !== "http:" && urlObj.protocol !== "https:") {
      return { valid: false, error: "URL 必须以 http:// 或 https:// 开头" }
    }
    return { valid: true }
  } catch {
    return { valid: false, error: "URL 格式无效" }
  }
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

  // Gotify token 通常是字母数字组合
  if (token.length < 10) {
    return { valid: false, error: "Token 长度太短" }
  }

  return { valid: true }
}

/**
 * 监听配置变化
 */
export function onConfigChange(
  callback: (newConfig: Config, oldConfig: Config) => void
): void {
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === "sync" && changes[STORAGE_KEY]) {
      const oldConfig = changes[STORAGE_KEY].oldValue as Config | undefined
      const newConfig = changes[STORAGE_KEY].newValue as Config | undefined

      if (oldConfig && newConfig) {
        callback(newConfig, oldConfig)
      }
    }
  })
}
