/**
 * Popup 页面入口（使用 Zustand Store）
 */

import { useEffect } from "react"
import { useStore } from "~/shared/store"
import { StatusCard } from "~/pages/popup/components/StatusCard"
import { WarningCard } from "~/pages/popup/components/WarningCard"
import { APP_VERSION } from "~/shared/utils/constants"
import { t } from "~/shared/utils/i18n"

function IndexPopup() {
  // 从 store 读取状态
  const config = useStore((state) => state.config)
  const status = useStore((state) => state.status)
  const loading = useStore((state) => state.loading)
  const loadConfig = useStore((state) => state.loadConfig)
  const loadStatus = useStore((state) => state.loadStatus)

  // 初始化：加载配置和状态
  useEffect(() => {
    loadConfig()
    loadStatus()
  }, [loadConfig, loadStatus])

  // 打开设置页面
  const openSettings = () => {
    chrome.runtime.openOptionsPage()
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>{t("loading")}</div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      {/* 页面标题 */}
      <div style={styles.header}>
        <h2 style={styles.title}>{t("app_name")}</h2>
        <div style={styles.version}>v{APP_VERSION}</div>
      </div>

      {/* 连接状态 */}
      <StatusCard status={status} serverUrl={config.gotifyUrl} />

      {/* 设置按钮 */}
      <button onClick={openSettings} style={styles.settingsButton}>
        <span style={styles.buttonIcon}>⚙️</span>
        <span>{t("open_settings")}</span>
      </button>

      {/* 警告提示 */}
      {!status.configValid && <WarningCard message={t("please_configure_server")} />}
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
  loading: {
    textAlign: "center",
    padding: 40,
    color: "#999"
  }
}

export default IndexPopup
