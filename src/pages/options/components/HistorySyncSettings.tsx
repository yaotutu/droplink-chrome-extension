/**
 * 历史消息同步设置组件
 */

import { useState } from "react"
import { useStore } from "~/shared/store"
import { Switch } from "~/shared/components/Switch"
import { t } from "~/shared/utils/i18n"

export function HistorySyncSettings() {
  const config = useStore((state) => state.config)
  const updateField = useStore((state) => state.updateField)

  // 本地状态用于输入验证
  const [fetchLimit, setFetchLimit] = useState(
    config.fetchHistoryLimit?.toString() || "100"
  )
  const [maxTabs, setMaxTabs] = useState(
    config.maxOpenTabs?.toString() || "10"
  )
  const [interval, setInterval] = useState(
    config.batchOpenInterval?.toString() || "300"
  )

  const handleToggleHistorySync = async () => {
    await updateField("enableHistorySync", !config.enableHistorySync)
  }

  const handleToggleBatchNotification = async () => {
    await updateField("showBatchNotification", !config.showBatchNotification)
  }

  const handleFetchLimitChange = async (value: string) => {
    setFetchLimit(value)
    const num = parseInt(value)
    if (!isNaN(num) && num >= 1 && num <= 200) {
      await updateField("fetchHistoryLimit", num)
    }
  }

  const handleMaxTabsChange = async (value: string) => {
    setMaxTabs(value)
    const num = parseInt(value)
    if (!isNaN(num) && num >= 1 && num <= 50) {
      await updateField("maxOpenTabs", num)
    }
  }

  const handleIntervalChange = async (value: string) => {
    setInterval(value)
    const num = parseInt(value)
    if (!isNaN(num) && num >= 100 && num <= 5000) {
      await updateField("batchOpenInterval", num)
    }
  }

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>{t("history_sync_title")}</h3>

      {/* 启用历史消息恢复 */}
      <div style={styles.toggleRow}>
        <div style={styles.toggleInfo}>
          <div style={styles.toggleLabel}>{t("enable_history_sync")}</div>
        </div>
        <Switch
          checked={config.enableHistorySync ?? true}
          onChange={handleToggleHistorySync}
        />
      </div>

      {/* 拉取历史消息数量 */}
      <div style={styles.inputRow}>
        <label style={styles.inputLabel}>{t("fetch_history_limit")}</label>
        <input
          type="number"
          min="1"
          max="200"
          value={fetchLimit}
          onChange={(e) => handleFetchLimitChange(e.target.value)}
          style={styles.numberInput}
          disabled={!config.enableHistorySync}
        />
      </div>

      {/* 最大打开标签页数量 */}
      <div style={styles.inputRow}>
        <label style={styles.inputLabel}>{t("max_open_tabs")}</label>
        <input
          type="number"
          min="1"
          max="50"
          value={maxTabs}
          onChange={(e) => handleMaxTabsChange(e.target.value)}
          style={styles.numberInput}
          disabled={!config.enableHistorySync}
        />
      </div>

      {/* 批量打开间隔 */}
      <div style={styles.inputRow}>
        <label style={styles.inputLabel}>{t("batch_open_interval")}</label>
        <input
          type="number"
          min="100"
          max="5000"
          step="100"
          value={interval}
          onChange={(e) => handleIntervalChange(e.target.value)}
          style={styles.numberInput}
          disabled={!config.enableHistorySync}
        />
      </div>

      {/* 显示完成通知 */}
      <div style={styles.toggleRow}>
        <div style={styles.toggleInfo}>
          <div style={styles.toggleLabel}>{t("show_batch_notification")}</div>
        </div>
        <Switch
          checked={config.showBatchNotification ?? true}
          onChange={handleToggleBatchNotification}
          disabled={!config.enableHistorySync}
        />
      </div>

      {/* 提示信息 */}
      <div style={styles.hintBox}>
        <div style={styles.hintIcon}>💡</div>
        <div style={styles.hintText}>{t("history_sync_auto_hint")}</div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    marginBottom: 20,
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    margin: 0,
    marginBottom: 20,
    color: "#333"
  },
  toggleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 0",
    borderBottom: "1px solid #f0f0f0"
  },
  toggleInfo: {
    flex: 1
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333"
  },
  inputRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 0",
    borderBottom: "1px solid #f0f0f0"
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
    flex: 1
  },
  numberInput: {
    width: 100,
    padding: "8px 12px",
    fontSize: 14,
    border: "1px solid #ddd",
    borderRadius: 6,
    textAlign: "right"
  },
  hintBox: {
    display: "flex",
    alignItems: "flex-start",
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 12,
    marginTop: 16
  },
  hintIcon: {
    fontSize: 18,
    marginRight: 8,
    flexShrink: 0
  },
  hintText: {
    fontSize: 13,
    color: "#666",
    lineHeight: 1.5
  }
}
