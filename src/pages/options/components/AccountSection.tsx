/**
 * AccountSection 组件 - 账户区域
 * 显示服务器地址和Switch Account按钮
 */

import React from "react"

import { borderRadius, colors, fontSize, spacing } from "~/pages/options/styles/theme"
import { Button } from "~/pages/options/components/ui/Button"
import { Card } from "~/pages/options/components/ui/Card"
import { SectionTitle } from "~/pages/options/components/ui/SectionTitle"
import { useStore } from "~/shared/store"
import { DEFAULT_CONFIG } from "~/shared/utils/constants"

export const AccountSection: React.FC = () => {
  const config = useStore((state) => state.config)
  const saveConfig = useStore((state) => state.saveConfig)

  // 提取服务器地址（去掉协议和路径）
  const getServerAddress = (url: string) => {
    try {
      const urlObj = new URL(url)
      return urlObj.host
    } catch {
      return url
    }
  }

  const handleSignOut = async () => {
    if (confirm("确定要退出登录吗？这将清空所有配置。")) {
      await saveConfig(DEFAULT_CONFIG)
      // 刷新页面以显示登录表单
      window.location.reload()
    }
  }

  return (
    <>
      <SectionTitle>ACCOUNT</SectionTitle>
      <Card>
        {/* 服务器地址 */}
        <div style={styles.accountInfo}>
          <div style={styles.iconContainer}>
            <span style={styles.icon}>👤</span>
          </div>
          <div style={styles.infoContent}>
            <div style={styles.serverLabel}>Server Address</div>
            <div style={styles.serverAddress}>
              {getServerAddress(config.gotifyUrl)}
            </div>
          </div>
          <Button variant="secondary" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </Card>
    </>
  )
}

const styles: Record<string, React.CSSProperties> = {
  accountInfo: {
    display: "flex",
    alignItems: "center",
    gap: spacing.md
  },
  iconContainer: {
    width: "48px",
    height: "48px",
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px"
  },
  icon: {
    filter: "brightness(0) invert(1)" // 白色图标
  },
  infoContent: {
    flex: 1
  },
  serverLabel: {
    fontSize: fontSize.sm,
    color: colors.text.muted,
    marginBottom: spacing.xs
  },
  serverAddress: {
    fontSize: fontSize.base,
    color: colors.text.primary,
    fontWeight: "500"
  }
}
