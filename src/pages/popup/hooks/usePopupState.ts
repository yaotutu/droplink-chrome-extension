/**
 * Popup 状态管理 Hook
 */

import { useConfig } from "~/shared/hooks/useConfig"
import { useStatus } from "~/shared/hooks/useStatus"

export function usePopupState() {
  const { config, loading: configLoading } = useConfig()
  const { status, loading: statusLoading } = useStatus()

  /**
   * 打开设置页面
   */
  const openSettings = () => {
    chrome.runtime.openOptionsPage()
  }

  return {
    config,
    status,
    loading: configLoading || statusLoading,
    openSettings
  }
}
