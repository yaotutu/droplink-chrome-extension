/**
 * 功能设置组件
 */

import { useStore } from "~/shared/store"
import { Switch } from "~/shared/components/Switch"

export function FeatureToggles() {
  const config = useStore((state) => state.config)
  const updateField = useStore((state) => state.updateField)

  const handleToggleOpenTabNotification = async () => {
    await updateField("openTabNotification", !config.openTabNotification)
  }

  const handleToggleShowAllNotifications = async () => {
    await updateField("showAllNotifications", !config.showAllNotifications)
  }

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>功能设置</h3>

      {/* 显示所有通知 */}
      <div style={styles.toggleRow}>
        <div style={styles.toggleInfo}>
          <div style={styles.toggleLabel}>显示所有通知</div>
          <div style={styles.toggleDescription}>
            作为 Gotify 客户端接收并显示所有消息通知
          </div>
        </div>
        <Switch
          checked={config.showAllNotifications}
          onChange={handleToggleShowAllNotifications}
        />
      </div>

      {/* 打开标签页时显示通知 */}
      <div style={styles.toggleRow}>
        <div style={styles.toggleInfo}>
          <div style={styles.toggleLabel}>打开标签页时显示通知</div>
          <div style={styles.toggleDescription}>
            成功打开标签页后显示确认通知
          </div>
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
