/**
 * 配置信息卡片组件
 */

import type { Config } from "~/shared/types"
import { t } from "~/shared/utils/i18n"

interface ConfigCardProps {
  config: Config
  onLogout: () => void
}

export function ConfigCard({ config, onLogout }: ConfigCardProps) {
  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h3 style={styles.title}>{t("config_info")}</h3>
        <button onClick={onLogout} style={styles.logoutButton}>
          {t("logout")}
        </button>
      </div>

      <div style={styles.info}>
        <div style={styles.infoRow}>
          <span style={styles.label}>{t("server_label")}</span>
          <span style={styles.value}>{config.gotifyUrl}</span>
        </div>
        <div style={styles.infoRow}>
          <span style={styles.label}>{t("token_label")}</span>
          <span style={styles.value}>
            {config.clientToken.slice(0, 10)}...
            {config.clientToken.slice(-4)}
          </span>
        </div>
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
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    margin: 0,
    color: "#333"
  },
  logoutButton: {
    padding: "8px 16px",
    fontSize: 13,
    border: "1px solid #ddd",
    borderRadius: 6,
    backgroundColor: "#fff",
    color: "#666",
    cursor: "pointer"
  },
  info: {
    display: "flex",
    flexDirection: "column",
    gap: 12
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    borderBottom: "1px solid #f5f5f5"
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666"
  },
  value: {
    fontSize: 14,
    color: "#333",
    fontFamily: "monospace"
  }
}
