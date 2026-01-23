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
      <SectionTitle>{t("notification_preferences_title").toUpperCase()}</SectionTitle>
      <Card>
        {/* Show all notifications */}
        <div style={styles.item}>
          <div style={styles.itemContent}>
            <div style={styles.itemTitle}>{t("show_all_notifications")}</div>
            <div style={styles.itemDesc}>
              {t("show_all_notifications_desc")}
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
            <div style={styles.itemTitle}>{t("show_notification_on_tab_open")}</div>
            <div style={styles.itemDesc}>
              {t("show_notification_on_tab_open_desc")}
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
            <div style={styles.itemTitle}>{t("auto_open_missed_links")}</div>
            <div style={styles.itemDesc}>
              {t("auto_open_missed_links_desc")}
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
