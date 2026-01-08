/**
 * 功能信息卡片组件
 */

import type { FeatureToggles } from "~/shared/types"

interface FeatureInfoProps {
  enabled: boolean
  features: FeatureToggles
}

export function FeatureInfo({ enabled, features }: FeatureInfoProps) {
  /**
   * 获取启用的功能列表
   */
  const getEnabledFeatures = () => {
    const featureList: string[] = []
    if (features.openTab) featureList.push("自动打开标签页")
    if (features.notification) featureList.push("通知")
    return featureList.length > 0 ? featureList.join("、") : "无"
  }

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <span style={styles.label}>启用功能</span>
        <span style={styles.text}>{enabled ? "已启用" : "已禁用"}</span>
      </div>
      <div style={styles.infoRow}>
        <span style={styles.infoLabel}>功能:</span>
        <span style={styles.infoValue}>{getEnabledFeatures()}</span>
      </div>
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
  text: {
    fontSize: 13,
    color: "#555"
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 12
  },
  infoLabel: {
    color: "#777",
    fontWeight: "500"
  },
  infoValue: {
    color: "#555"
  }
}
