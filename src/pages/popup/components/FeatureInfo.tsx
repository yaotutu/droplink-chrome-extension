/**
 * 功能信息卡片组件
 */

import type { FeatureToggles } from "~/shared/types"
import { t } from "~/shared/utils/i18n"

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
    if (features.openTab) featureList.push(t("auto_open_tab"))
    if (features.notification) featureList.push(t("notifications"))
    return featureList.length > 0 ? featureList.join("、") : t("none")
  }

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <span style={styles.label}>{t("enabled_features")}</span>
        <span style={styles.text}>{enabled ? t("enabled") : t("disabled")}</span>
      </div>
      <div style={styles.infoRow}>
        <span style={styles.infoLabel}>{t("features_label")}</span>
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
