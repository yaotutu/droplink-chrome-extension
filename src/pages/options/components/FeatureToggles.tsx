/**
 * 功能设置组件
 */

import { useStore } from "~/shared/store"
import { Switch } from "~/shared/components/Switch"
import { t } from "~/shared/utils/i18n"

export function FeatureToggles() {
  const config = useStore((state) => state.config)
  const updateField = useStore((state) => state.updateField)

  console.log("[FeatureToggles] 当前配置:", config)

  const handleToggleOpenTabNotification = async () => {
    console.log("[FeatureToggles] 切换 openTabNotification:", !config.openTabNotification)
    await updateField("openTabNotification", !config.openTabNotification)
  }

  const handleToggleShowAllNotifications = async () => {
    console.log("[FeatureToggles] 切换 showAllNotifications:", !config.showAllNotifications)
    await updateField("showAllNotifications", !config.showAllNotifications)
  }

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>{t("feature_settings")}</h3>

      {/* 显示所有通知 */}
      <div style={styles.toggleRow}>
        <div style={styles.toggleInfo}>
          <div style={styles.toggleLabel}>{t("show_all_notifications")}</div>
          <div style={styles.toggleDescription}>{t("show_all_notifications_desc")}</div>
        </div>
        <Switch
          checked={config.showAllNotifications}
          onChange={handleToggleShowAllNotifications}
        />
      </div>

      {/* 打开标签页时显示通知 */}
      <div style={styles.toggleRow}>
        <div style={styles.toggleInfo}>
          <div style={styles.toggleLabel}>{t("open_tab_notification")}</div>
          <div style={styles.toggleDescription}>{t("open_tab_notification_desc")}</div>
        </div>
        <Switch
          checked={config.openTabNotification}
          onChange={handleToggleOpenTabNotification}
        />
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
    padding: "16px 0"
  },
  toggleInfo: {
    flex: 1
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4
  },
  toggleDescription: {
    fontSize: 13,
    color: "#999"
  }
}
