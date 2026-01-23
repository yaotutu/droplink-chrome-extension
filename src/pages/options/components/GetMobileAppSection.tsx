/**
 * GetMobileAppSection 组件 - 移动应用下载区域
 * 显示下载移动应用的二维码和下载按钮
 */

import React from "react"

import {
  borderRadius,
  colors,
  fontSize,
  spacing
} from "~/pages/options/styles/theme"
import { Button } from "~/pages/options/components/ui/Button"
import { Card } from "~/pages/options/components/ui/Card"
import { SectionTitle } from "~/pages/options/components/ui/SectionTitle"

export const GetMobileAppSection: React.FC = () => {
  // TODO: 替换为实际的移动应用下载链接
  const APK_DOWNLOAD_URL = "https://github.com/yaotutu/droplink/releases"

  const handleDownload = () => {
    window.open(APK_DOWNLOAD_URL, "_blank")
  }

  return (
    <>
      <SectionTitle>GET MOBILE APP</SectionTitle>
      <Card>
        <div style={styles.container}>
          {/* 说明文字 */}
          <div style={styles.description}>
            <p style={styles.descText}>
              Take Gotify on the go. Download the official Android client to
              receive real-time push notifications directly on your mobile
              device.
            </p>
          </div>

          {/* 二维码区域 */}
          <div style={styles.qrContainer}>
            <div style={styles.qrPlaceholder}>
              <span style={styles.qrIcon}>📱</span>
              <div style={styles.qrText}>QR Code</div>
              <div style={styles.qrSubtext}>Scan to download APK</div>
            </div>
          </div>

          {/* 下载按钮 */}
          <Button
            variant="primary"
            onClick={handleDownload}
            icon={<span>⬇️</span>}
            style={styles.downloadButton}>
            Download Android APK
          </Button>
        </div>
      </Card>
    </>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: spacing.lg
  },
  description: {
    textAlign: "center",
    maxWidth: "600px"
  },
  descText: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    lineHeight: "1.6",
    margin: 0
  },
  qrContainer: {
    display: "flex",
    justifyContent: "center",
    padding: spacing.lg
  },
  qrPlaceholder: {
    width: "200px",
    height: "200px",
    backgroundColor: colors.background,
    border: `2px dashed ${colors.border}`,
    borderRadius: borderRadius.md,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm
  },
  qrIcon: {
    fontSize: "48px"
  },
  qrText: {
    fontSize: fontSize.base,
    color: colors.text.primary,
    fontWeight: "500"
  },
  qrSubtext: {
    fontSize: fontSize.xs,
    color: colors.text.muted
  },
  downloadButton: {
    width: "100%",
    maxWidth: "300px"
  }
}
