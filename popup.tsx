import { useEffect, useState } from "react"

import type { Config, RuntimeMessage, RuntimeResponse, StatusInfo } from "~types"

import { ConnectionStatus } from "~types"
import { getConfig, saveConfig } from "~lib/storage"

function IndexPopup() {
  // 状态
  const [config, setConfig] = useState<Config>({
    gotifyUrl: "http://111.228.1.24:2345/",
    clientToken: "",
    enabled: false
  })
  const [status, setStatus] = useState<StatusInfo>({
    status: ConnectionStatus.DISCONNECTED,
    configValid: false
  })
  const [loading, setLoading] = useState(true)

  // 加载配置和状态
  useEffect(() => {
    loadData()
  }, [])

  // 加载数据
  const loadData = async () => {
    try {
      setLoading(true)

      // 加载配置
      const loadedConfig = await getConfig()
      setConfig(loadedConfig)

      // 获取状态
      const statusResponse = await sendMessage({ type: "getStatus" })
      if (statusResponse.success) {
        setStatus(statusResponse.data)
      }
    } catch (error) {
      console.error("加载数据失败:", error)
    } finally {
      setLoading(false)
    }
  }

  // 发送消息到后台脚本
  const sendMessage = (
    message: RuntimeMessage
  ): Promise<RuntimeResponse> => {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(message, (response: RuntimeResponse) => {
        resolve(response)
      })
    })
  }

  // 处理启用/禁用切换
  const handleToggleEnabled = async () => {
    const newConfig = {
      ...config,
      enabled: !config.enabled
    }

    try {
      await saveConfig(newConfig)
      setConfig(newConfig)

      // 重新加载状态
      await loadData()
    } catch (error) {
      console.error("切换状态失败:", error)
      alert("操作失败: " + error)
    }
  }

  // 打开设置页面
  const openSettings = () => {
    chrome.runtime.openOptionsPage()
  }

  // 获取状态文本
  const getStatusText = () => {
    switch (status.status) {
      case ConnectionStatus.CONNECTED:
        return "已连接"
      case ConnectionStatus.CONNECTING:
        return "连接中..."
      case ConnectionStatus.DISCONNECTED:
        return "未连接"
      case ConnectionStatus.ERROR:
        return "连接失败"
      default:
        return "未知"
    }
  }

  // 获取状态颜色
  const getStatusColor = () => {
    switch (status.status) {
      case ConnectionStatus.CONNECTED:
        return "#4caf50"
      case ConnectionStatus.CONNECTING:
        return "#ff9800"
      case ConnectionStatus.DISCONNECTED:
        return "#9e9e9e"
      case ConnectionStatus.ERROR:
        return "#f44336"
      default:
        return "#9e9e9e"
    }
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>加载中...</div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Droplink</h2>
        <div style={styles.version}>v0.0.1</div>
      </div>

      {/* 连接状态 */}
      <div style={styles.statusCard}>
        <div style={styles.statusHeader}>
          <span style={styles.statusLabel}>连接状态</span>
          <div style={styles.statusIndicatorContainer}>
            <span
              style={{
                ...styles.statusIndicator,
                backgroundColor: getStatusColor()
              }}></span>
            <span style={styles.statusText}>{getStatusText()}</span>
          </div>
        </div>

        {/* 服务器地址 */}
        {config.gotifyUrl && (
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>服务器:</span>
            <span style={styles.infoValue}>
              {new URL(config.gotifyUrl).host}
            </span>
          </div>
        )}

        {/* 最后连接时间 */}
        {status.lastConnected && (
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>最后连接:</span>
            <span style={styles.infoValue}>
              {new Date(status.lastConnected).toLocaleString("zh-CN", {
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit"
              })}
            </span>
          </div>
        )}

        {/* 错误信息 */}
        {status.error && (
          <div style={styles.errorBox}>
            <span style={styles.errorIcon}>⚠️</span>
            <span style={styles.errorText}>{status.error}</span>
          </div>
        )}
      </div>

      {/* 启用开关 */}
      <div style={styles.toggleCard}>
        <label style={styles.toggleLabel}>
          <input
            type="checkbox"
            checked={config.enabled}
            onChange={handleToggleEnabled}
            style={styles.checkbox}
          />
          <span>启用 Droplink</span>
        </label>
      </div>

      {/* 操作按钮 */}
      <button onClick={openSettings} style={styles.settingsButton}>
        <span style={styles.buttonIcon}>⚙️</span>
        <span>打开设置</span>
      </button>

      {/* 配置提示 */}
      {!status.configValid && (
        <div style={styles.warningCard}>
          <span style={styles.warningIcon}>ℹ️</span>
          <span style={styles.warningText}>请先配置 Gotify 服务器</span>
        </div>
      )}
    </div>
  )
}

// 样式
const styles: Record<string, React.CSSProperties> = {
  container: {
    width: 320,
    padding: 16,
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f5f5f5"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    margin: 0,
    color: "#333"
  },
  version: {
    fontSize: 12,
    color: "#999"
  },
  statusCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
  },
  statusHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottom: "1px solid #eee"
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#555"
  },
  statusIndicatorContainer: {
    display: "flex",
    alignItems: "center",
    gap: 6
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: "50%"
  },
  statusText: {
    fontSize: 13,
    color: "#555"
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    fontSize: 12
  },
  infoLabel: {
    color: "#777",
    fontWeight: "500"
  },
  infoValue: {
    color: "#555"
  },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    padding: 8,
    backgroundColor: "#ffebee",
    borderRadius: 4,
    fontSize: 12
  },
  errorIcon: {
    fontSize: 14
  },
  errorText: {
    color: "#c62828",
    flex: 1
  },
  toggleCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
  },
  toggleLabel: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 14,
    color: "#555",
    cursor: "pointer",
    fontWeight: "500"
  },
  checkbox: {
    width: 18,
    height: 18,
    cursor: "pointer"
  },
  settingsButton: {
    width: "100%",
    padding: 12,
    fontSize: 14,
    fontWeight: "500",
    border: "none",
    borderRadius: 8,
    backgroundColor: "#2196f3",
    color: "white",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 12,
    transition: "background-color 0.2s",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
  },
  buttonIcon: {
    fontSize: 16
  },
  warningCard: {
    backgroundColor: "#fff3e0",
    borderRadius: 8,
    padding: 12,
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 12
  },
  warningIcon: {
    fontSize: 16
  },
  warningText: {
    color: "#f57c00",
    flex: 1
  },
  loading: {
    textAlign: "center",
    padding: 40,
    color: "#999"
  }
}

export default IndexPopup
