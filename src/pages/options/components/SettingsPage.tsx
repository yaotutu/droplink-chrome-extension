/**
 * SettingsPage 组件 - 设置页面（已登录状态）
 * 整合所有设置相关的子组件
 */

import React from "react"

import { colors, fontSize, fontWeight, spacing } from "~/pages/options/styles/theme"
import { AccountSection } from "~/pages/options/components/AccountSection"
import { NotificationPreferences } from "~/pages/options/components/NotificationPreferences"
import { StatusBadge } from "~/pages/options/components/ui/StatusBadge"
import { useStore } from "~/shared/store"
import { ConnectionStatus } from "~/shared/types"

export const SettingsPage: React.FC = () => {
  const status = useStore((state) => state.status)

  // 判断是否已连接
  const isConnected = status.status === ConnectionStatus.CONNECTED

  // 获取版本号
  const version = chrome.runtime.getManifest().version

  return (
    <div style={styles.container}>
      {/* 页面标题区域 */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>Settings</h1>
          <div style={styles.subtitle}>
            <span style={styles.version}>v{version}</span>
            <span style={styles.separator}>•</span>
            <span style={styles.connectionStatus}>
              {isConnected ? "Connected to server" : "Not connected"}
            </span>
          </div>
        </div>
        <StatusBadge active={isConnected} />
      </div>

      {/* 通知偏好设置 */}
      <NotificationPreferences />

      {/* 账户区域 */}
      <AccountSection />

      {/* 该页面只保留核心设置 */}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: "900px",
    margin: "0 auto",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    overflow: "auto",
    padding: `${spacing.md} 0`
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.lg
  },
  headerLeft: {
    flex: 1
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    margin: 0,
    marginBottom: spacing.xs
  },
  subtitle: {
    display: "flex",
    alignItems: "center",
    gap: spacing.xs,
    fontSize: fontSize.xs,
    color: colors.text.secondary
  },
  version: {
    fontWeight: fontWeight.medium
  },
  separator: {
    color: colors.text.muted
  },
  connectionStatus: {},
}
