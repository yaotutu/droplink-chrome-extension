/**
 * 连接状态卡片组件
 */

import type { StatusInfo } from "~/shared/types"
import { ConnectionStatus } from "~/shared/types"
import { t } from "~/shared/utils/i18n"
import * as theme from "~/pages/options/styles/theme"

interface StatusCardProps {
  status: StatusInfo
  serverUrl: string
}

export function StatusCard({ status, serverUrl }: StatusCardProps) {
  /**
   * 获取状态文本
   */
  const getStatusText = () => {
    switch (status.status) {
      case ConnectionStatus.CONNECTED:
        return t("connected")
      case ConnectionStatus.CONNECTING:
        return t("connecting")
      case ConnectionStatus.DISCONNECTED:
        return t("disconnected")
      case ConnectionStatus.ERROR:
        return t("connection_failed")
      default:
        return t("unknown")
    }
  }

  /**
   * 获取状态颜色
   */
  const getStatusColor = () => {
    switch (status.status) {
      case ConnectionStatus.CONNECTED:
        return theme.colors.success
      case ConnectionStatus.CONNECTING:
        return theme.colors.warning
      case ConnectionStatus.DISCONNECTED:
        return theme.colors.text.muted
      case ConnectionStatus.ERROR:
        return theme.colors.danger
      default:
        return theme.colors.text.muted
    }
  }

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <span style={styles.label}>{t("connection_status")}</span>
        <div style={styles.indicatorContainer}>
          <span
            style={{
              ...styles.indicator,
              backgroundColor: getStatusColor()
            }}></span>
          <span style={styles.text}>{getStatusText()}</span>
        </div>
      </div>

      {serverUrl && (
        <div style={styles.infoRow}>
          <span style={styles.infoLabel}>{t("server_label")}</span>
          <span style={styles.infoValue}>{new URL(serverUrl).host}</span>
        </div>
      )}

      {status.lastConnected && (
        <div style={styles.infoRow}>
          <span style={styles.infoLabel}>{t("last_connected")}</span>
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

      {status.error && (
        <div style={styles.errorBox}>
          <span style={styles.errorIcon}>⚠️</span>
          <span style={styles.errorText}>{status.error}</span>
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: 12,
    boxShadow: theme.shadows.card
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottom: `1px solid ${theme.colors.border}`
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text.secondary
  },
  indicatorContainer: {
    display: "flex",
    alignItems: "center",
    gap: 6
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: "50%"
  },
  text: {
    fontSize: 13,
    color: theme.colors.text.secondary
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    fontSize: theme.fontSize.xs
  },
  infoLabel: {
    color: theme.colors.text.secondary,
    fontWeight: theme.fontWeight.medium
  },
  infoValue: {
    color: theme.colors.text.secondary
  },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    padding: 8,
    backgroundColor: "#ffebee",
    borderRadius: theme.borderRadius.sm,
    fontSize: theme.fontSize.xs
  },
  errorIcon: {
    fontSize: theme.fontSize.sm
  },
  errorText: {
    color: theme.colors.danger,
    flex: 1
  }
}
