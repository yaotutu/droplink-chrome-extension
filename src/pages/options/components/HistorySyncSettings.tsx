/**
 * 历史消息同步设置组件
 */

import { useStore } from "~/shared/store"
import { Switch } from "~/shared/components/Switch"
import { t } from "~/shared/utils/i18n"

export function HistorySyncSettings() {
  const config = useStore((state) => state.config)
  const updateField = useStore((state) => state.updateField)

  const handleToggleHistorySync = async () => {
    await updateField("enableHistorySync", !config.enableHistorySync)
  }

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>{t("history_sync_title")}</h3>

      {/* 启用历史消息恢复 */}
      <div style={styles.toggleRow}>
        <div style={styles.toggleInfo}>
          <div style={styles.toggleLabel}>{t("enable_history_sync")}</div>
          <div style={styles.toggleDescription}>
            {t("enable_history_sync_description")}
          </div>
        </div>
        <Switch
          checked={config.enableHistorySync ?? true}
          onChange={handleToggleHistorySync}
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
    flex: 1,
    marginRight: 16
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4
  },
  toggleDescription: {
    fontSize: 13,
    color: "#666",
    lineHeight: 1.5
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
