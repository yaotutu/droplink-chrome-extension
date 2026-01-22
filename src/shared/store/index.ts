/**
 * 统一的 Zustand Store - 管理所有应用状态
 */

import { create } from "zustand"
import type { Config, StatusInfo } from "~/shared/types"
import { ConnectionStatus } from "~/shared/types"
import {
  getConfig as storageGetConfig,
  saveConfig as storageSaveConfig
} from "~/core/storage"
import { DEFAULT_CONFIG } from "~/shared/utils/constants"

interface AppState {
  // ============ 状态 ============
  /** 配置 */
  config: Config
  /** 连接状态 */
  status: StatusInfo
  /** 是否正在加载 */
  loading: boolean
  /** 是否正在保存 */
  saving: boolean

  // ============ 配置相关 Actions ============
  /** 加载配置 */
  loadConfig: () => Promise<void>
  /** 保存配置 */
  saveConfig: (config: Config) => Promise<void>
  /** 更新单个配置字段 */
  updateField: (field: keyof Config, value: any) => Promise<void>
  /** 重置为默认配置 */
  resetConfig: () => Promise<void>
  /** 初始化配置同步监听器 */
  initConfigSync: () => void

  // ============ 状态相关 Actions ============
  /** 加载连接状态 */
  loadStatus: () => Promise<void>
}

// 防止重复注册监听器
let isConfigSyncInitialized = false

export const useStore = create<AppState>((set, get) => ({
  // ============ 初始状态 ============
  config: DEFAULT_CONFIG,
  status: {
    status: ConnectionStatus.DISCONNECTED,
    configValid: false
  },
  loading: false,
  saving: false,

  // ============ 配置相关 Actions ============
  loadConfig: async () => {
    set({ loading: true })
    try {
      const config = await storageGetConfig()
      set({ config })
    } catch (error) {
      console.error("[Store] 加载配置失败:", error)
    } finally {
      set({ loading: false })
    }
  },

  saveConfig: async (newConfig: Config) => {
    set({ saving: true })
    try {
      console.log("[Store] 正在保存配置:", newConfig)
      await storageSaveConfig(newConfig)
      console.log("[Store] 配置保存成功，等待 onChanged 事件...")
      // 注意：不需要手动 set({ config: newConfig })
      // chrome.storage.onChanged 会自动触发配置更新
    } catch (error) {
      console.error("[Store] 保存配置失败:", error)
      throw error
    } finally {
      set({ saving: false })
    }
  },

  updateField: async (field: keyof Config, value: any) => {
    const { config, saveConfig } = get()
    const newConfig = { ...config, [field]: value }
    await saveConfig(newConfig)
  },

  resetConfig: async () => {
    await get().saveConfig(DEFAULT_CONFIG)
  },

  initConfigSync: () => {
    if (isConfigSyncInitialized) {
      console.log("[Store] 配置同步已初始化，跳过重复注册")
      return
    }

    console.log("[Store] 初始化配置同步监听器...")
    isConfigSyncInitialized = true

    // 监听 chrome.storage 变化，同步更新 store
    chrome.storage.onChanged.addListener((changes, areaName) => {
      console.log("[Store] storage.onChanged 触发:", { areaName, changes })

      if (areaName === "sync" && changes.droplink_config) {
        const newConfig = changes.droplink_config.newValue
        if (newConfig) {
          console.log("[Store] 配置已更新，同步到 UI:", newConfig)
          set({ config: newConfig })
        }
      }
    })
  },

  // ============ 状态相关 Actions ============
  loadStatus: async () => {
    try {
      const response = await chrome.runtime.sendMessage({ type: "getStatus" })
      if (response.success) {
        set({ status: response.data })
      }
    } catch (error) {
      console.error("[Store] 加载状态失败:", error)
    }
  }
}))
