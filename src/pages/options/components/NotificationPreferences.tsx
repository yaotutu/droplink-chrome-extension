/**
 * NotificationPreferences 组件 - 通知偏好设置
 * 包含三个开关：显示所有通知、打开标签页通知、自动打开错过的链接
 */

import React from "react"

import { colors, fontSize, spacing } from "~/pages/options/styles/theme"
import { Card } from "~/pages/options/components/ui/Card"
import { SectionTitle } from "~/pages/options/components/ui/SectionTitle"
import { Switch } from "~/shared/components/Switch"
import { useStore } from "~/shared/store"
import { t } from "~/shared/utils/i18n"

export const NotificationPreferences: React.FC = () => {
  const config = useStore((state) => state.config)
  const updateField = useStore((state) => state.updateField)

  const handleToggleShowAllNotifications = async () => {
    await updateField("showAllNotifications", !config.showAllNotifications)
  }

  const handleToggleOpenTabNotification = async () => {
    await updateField("openTabNotification", !config.openTabNotification)
  }

  const handleToggleEnableHistorySync = async () => {
    await updateField("enableHistorySync", !config.enableHistorySync)
  }

  return (
    <>
      <SectionTitle>NOTIFICATION PREFERENCES</SectionTitle>
      <Card>
        {/* Show all notifications */}
        <div style={styles.item}>
          <div style={styles.itemContent}>
            <div style={styles.itemTitle}>Show all notifications</div>
            <div style={styles.itemDesc}>
              Receive and display all Gotify messages
            </div>
          </div>
          <Switch
            checked={config.showAllNotifications}
            onChange={handleToggleShowAllNotifications}
          />
        </div>

        {/* Show notification on tab open */}
        <div style={styles.item}>
          <div style={styles.itemContent}>
            <div style={styles.itemTitle}>Show notification on tab open</div>
            <div style={styles.itemDesc}>
              Confirm when a tab opens successfully from a link
            </div>
          </div>
          <Switch
            checked={config.openTabNotification}
            onChange={handleToggleOpenTabNotification}
          />
        </div>

        {/* Auto-open missed links */}
        <div style={{ ...styles.item, marginBottom: 0 }}>
          <div style={styles.itemContent}>
            <div style={styles.itemTitle}>Auto-open missed links</div>
            <div style={styles.itemDesc}>
              Automatically open links received while browser was offline
            </div>
          </div>
          <Switch
            checked={config.enableHistorySync}
            onChange={handleToggleEnableHistorySync}
          />
        </div>
      </Card>
    </>
  )
}

const styles: Record<string, React.CSSProperties> = {
  item: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
    gap: spacing.lg
  },
  itemContent: {
    flex: 1
  },
  itemTitle: {
    fontSize: fontSize.base,
    color: colors.text.primary,
    marginBottom: spacing.xs
  },
  itemDesc: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    lineHeight: "1.5"
  }
}
