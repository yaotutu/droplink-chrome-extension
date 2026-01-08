/**
 * 配置信息卡片组件
 */

import type { Config } from "~/shared/types"

interface ConfigCardProps {
  config: Config
  onLogout: () => void
}

export function ConfigCard({ config, onLogout }: ConfigCardProps) {
  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h3 style={styles.title}>配置信息</h3>
        <button onClick={onLogout} style={styles.logoutButton}>
          退出登录
        </button>
      </div>

      <div style={styles.info}>
        <div style={styles.infoRow}>
          <span style={styles.label}>服务器:</span>
          <span style={styles.value}>{config.gotifyUrl}</span>
        </div>
        <div style={styles.infoRow}>
          <span style={styles.label}>Token:</span>
          <span style={styles.value}>
            {config.clientToken.slice(0, 10)}...
            {config.clientToken.slice(-4)}
          </span>
        </div>
        <div style={styles.infoRow}>
          <span style={styles.label}>状态:</span>
          <span
            style={{
              ...styles.value,
              color: config.enabled ? "#4caf50" : "#999"
            }}>
            {config.enabled ? "已启用" : "已禁用"}
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
