/**
 * Options 页面全局状态管理
 */

import { useState, useEffect } from "react"
import { useConfig } from "~/shared/hooks/useConfig"
import { useStatus } from "~/shared/hooks/useStatus"
import { isConfigValid } from "~/core/storage"

export function useOptionsState() {
  const { config, loading: configLoading, saveConfig, reload, updateField } = useConfig()
  const { status, loading: statusLoading } = useStatus()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    setIsLoggedIn(isConfigValid(config))
  }, [config])

  return {
    isLoggedIn,
    setIsLoggedIn,
    config,
    status,
    loading: configLoading || statusLoading,
    saveConfig,
    reload,
    updateField
  }
}
