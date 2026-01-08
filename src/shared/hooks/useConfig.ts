/**
 * 配置管理 Hook
 * 用于读取、保存和更新配置
 */

import { useState, useEffect } from "react"
import type { Config } from "~/shared/types"
import { getConfig, saveConfig as storeSaveConfig } from "~/core/storage"
import { DEFAULT_CONFIG } from "~/shared/utils/constants"

export function useConfig() {
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadConfig()
  }, [])

  /**
   * 加载配置
   */
  const loadConfig = async () => {
    try {
      setLoading(true)
      const loadedConfig = await getConfig()
      setConfig(loadedConfig)
    } catch (error) {
      console.error("[useConfig] 加载配置失败:", error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 保存配置
   */
  const saveConfig = async (newConfig: Config) => {
    try {
      setSaving(true)
      await storeSaveConfig(newConfig)
      setConfig(newConfig)
    } catch (error) {
      console.error("[useConfig] 保存配置失败:", error)
      throw error
    } finally {
      setSaving(false)
    }
  }

  /**
   * 更新单个字段
   */
  const updateField = async (field: keyof Config, value: any) => {
    const newConfig = { ...config, [field]: value }
    await saveConfig(newConfig)
  }

  return {
    config,
    setConfig,
    loading,
    saving,
    saveConfig,
    updateField,
    reload: loadConfig
  }
}
