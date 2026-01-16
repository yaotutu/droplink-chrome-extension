/**
 * 连接状态卡片组件
 */

import type { StatusInfo } from "~/shared/types"
import { ConnectionStatus } from "~/shared/types"
import { t } from "~/shared/utils/i18n"

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
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottom: "1px solid #eee"
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#555"
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
  }
}
