/**
 * 状态管理 Hook
 * 用于获取连接状态信息
 */

import { useState, useEffect } from "react"
import type { StatusInfo } from "~/shared/types"
import { ConnectionStatus } from "~/shared/types"
import { useRuntimeMessage } from "./useRuntimeMessage"

export function useStatus() {
  const [status, setStatus] = useState<StatusInfo>({
    status: ConnectionStatus.DISCONNECTED,
    configValid: false
  })
  const [loading, setLoading] = useState(true)
  const { sendMessage } = useRuntimeMessage()

  useEffect(() => {
    loadStatus()
  }, [])

  /**
   * 加载状态
   */
  const loadStatus = async () => {
    try {
      setLoading(true)
      const response = await sendMessage({ type: "getStatus" })
      if (response.success) {
        setStatus(response.data)
      }
    } catch (error) {
      console.error("[useStatus] 加载状态失败:", error)
    } finally {
      setLoading(false)
    }
  }

  return {
    status,
    loading,
    reload: loadStatus
  }
}
