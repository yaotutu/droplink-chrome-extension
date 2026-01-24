/**
 * WelcomePage 组件 - 欢迎页面（默认页面）
 * 高还原度实现设计图
 */

import React, { useMemo, useState } from "react"

import {
  borderRadius,
  colors,
  fontSize,
  fontWeight,
  shadows,
  spacing
} from "~/pages/options/styles/theme"
import { QRCodeDisplay } from "~/shared/components/QRCodeDisplay"
import { useStore } from "~/shared/store"
import type { QRLoginData } from "~/shared/types"
import { GOTIFY_SERVER_URL } from "~/shared/utils/constants"
import { t } from "~/shared/utils/i18n"

export const WelcomePage: React.FC = () => {
  // Android APK 下载链接
  const APK_DOWNLOAD_URL = "https://github.com/yaotutu/droplink-android/releases/download/main-latest/droplink-release.apk"

  // 从 store 读取配置
  const config = useStore((state) => state.config)

  // 二维码刷新key
  const [qrKey, setQrKey] = useState(0)

  const handleDownload = () => {
    window.open(APK_DOWNLOAD_URL, "_blank")
  }

  // 刷新二维码
  const handleRefreshQR = () => {
    setQrKey((prev) => prev + 1)
  }

  // 生成二维码数据
  const qrData: QRLoginData = useMemo(() => {
    const serverName =
      config.gotifyUrl === GOTIFY_SERVER_URL ? "officialServer" : "selfHost"

    return {
      version: "1.0",
      type: "droplink_qr_login",
      timestamp: Date.now(),
      data: {
        gotifyServerUrl: config.gotifyUrl,
        appToken: config.appToken,
        clientToken: config.clientToken,
        serverName
      }
    }
  }, [config.gotifyUrl, config.appToken, config.clientToken, qrKey])

  const qrValue = JSON.stringify(qrData)
  const isConfigComplete =
    config.gotifyUrl && config.appToken && config.clientToken

  // 生成下载二维码（APK下载链接）
  const downloadQRValue = APK_DOWNLOAD_URL

  return (
    <div style={styles.container}>
      {/* 主标题 */}
      <div style={styles.header}>
        <h1 style={styles.title}>{t("welcome_page_title")}</h1>
        <p style={styles.subtitle}>
          {t("welcome_page_subtitle")}
        </p>
      </div>

      {/* 主卡片 - 包含两列内容 */}
      <div style={styles.mainCard}>
        <div style={styles.twoColumns}>
          {/* 左列：下载移动应用 */}
          <div style={styles.column}>
            <div style={styles.columnHeader}>
              <span style={styles.columnIcon}>📱</span>
              <h2 style={styles.columnTitle}>{t("get_mobile_app_title")}</h2>
            </div>
            <p style={styles.columnDescription}>
              {t("get_mobile_app_desc")}
            </p>

            {/* 二维码 - 简单边框样式 */}
            <div style={styles.qrContainerLeft}>
            <div style={styles.qrBoxLeft}>
              <QRCodeDisplay value={downloadQRValue} size={175} level="M" />
            </div>
              <div style={styles.qrLabel}>{t("scan_to_download")}</div>
            </div>

            {/* 下载按钮 */}
            <button style={styles.downloadButton} onClick={handleDownload}>
              <span style={styles.buttonIcon}>⬇️</span>
              {t("download_android_apk")}
            </button>
          </div>

          {/* 右列：连接扩展 */}
          <div style={styles.column}>
            <div style={styles.columnHeader}>
              <span style={styles.columnIcon}>🔗</span>
              <h2 style={styles.columnTitle}>{t("connect_extension_title")}</h2>
            </div>
            <p style={styles.columnDescription}>
              {t("connect_extension_desc")}
            </p>

            {/* 二维码 - 3D卡片样式 */}
            <div style={styles.qrContainerRight}>
              <div style={styles.qrCard3D}>
                <div style={styles.qrBoxRight}>
                  {isConfigComplete ? (
                    <QRCodeDisplay value={qrValue} size={175} level="H" />
                  ) : (
                    <span style={styles.qrIconLarge}>🔗</span>
                  )}
                </div>
              </div>
            </div>

            {/* 刷新按钮和提示 */}
            <div style={styles.refreshContainer}>
              <button
                style={styles.refreshButton}
                onClick={handleRefreshQR}
                disabled={!isConfigComplete}>
                <span style={styles.refreshIcon}>🔄</span>
                {t("refresh_qr_code")}
              </button>
              <div style={styles.securityHint}>
                {t("qr_code_expiry_hint")}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 底部内容移到 Layout Footer */}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: "1100px",
    margin: "0 auto",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    padding: `${spacing.md} 0`,
    flex: 1
  },
  header: {
    textAlign: "center",
    marginBottom: spacing.lg,
    flexShrink: 0
  },
  title: {
    fontSize: "32px",
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
    margin: 0,
    marginBottom: spacing.xs
  },
  subtitle: {
    fontSize: fontSize.base,
    color: colors.text.secondary,
    margin: 0,
    lineHeight: "1.4"
  },
  mainCard: {
    backgroundColor: colors.card,
    borderRadius: "14px",
    boxShadow: shadows.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
    justifyContent: "center"
  },
  twoColumns: {
    display: "flex",
    gap: spacing.lg,
    flex: 1,
    minHeight: 0,
    alignItems: "center"
  },
  column: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    minHeight: 0
  },
  columnHeader: {
    display: "flex",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.xs
  },
  columnIcon: {
    fontSize: "16px",
    color: colors.primary
  },
  columnTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
    margin: 0
  },
  columnDescription: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    lineHeight: "1.5",
    marginBottom: spacing.md
  },
  // 左侧二维码 - 简单边框
  qrContainerLeft: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: spacing.sm
  },
  qrBoxLeft: {
    width: "190px",
    height: "190px",
    backgroundColor: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: borderRadius.lg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
    padding: spacing.sm,
    boxShadow: "0 4px 10px rgba(17, 24, 39, 0.06)"
  },
  // 右侧二维码 - 3D卡片效果
  qrContainerRight: {
    display: "flex",
    justifyContent: "center",
    marginBottom: spacing.sm,
    perspective: "1000px"
  },
  qrCard3D: {
    position: "relative",
    padding: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    boxShadow:
      "0 12px 24px rgba(37, 99, 235, 0.15), 0 6px 14px rgba(17, 24, 39, 0.08)",
    transform: "rotateY(-6deg)",
    border: `2px solid rgba(37, 99, 235, 0.35)`
  },
  qrBoxRight: {
    width: "190px",
    height: "190px",
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.sm,
    boxShadow: "inset 0 0 0 1px rgba(17, 24, 39, 0.06)"
  },
  qrIconLarge: {
    fontSize: "40px",
    opacity: 0.25
  },
  qrLabel: {
    fontSize: "12px",
    color: colors.text.muted,
    textAlign: "center"
  },
  downloadButton: {
    width: "auto",
    alignSelf: "center",
    minWidth: "260px",
    padding: `${spacing.xs} ${spacing.lg}`,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.card,
    backgroundColor: colors.primary,
    border: "none",
    borderRadius: borderRadius.md,
    cursor: "pointer",
    transition: "background-color 0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    outline: "none",
    boxShadow: "0 6px 14px rgba(37, 99, 235, 0.25)"
  },
  buttonIcon: {
    fontSize: fontSize.lg
  },
  refreshContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px"
  },
  refreshButton: {
    padding: `6px ${spacing.md}`,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.primary,
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "2px",
    outline: "none",
    transition: "opacity 0.2s"
  },
  refreshIcon: {
    fontSize: fontSize.base
  },
  securityHint: {
    fontSize: "11px",
    color: colors.text.muted,
    fontStyle: "italic"
  },
  footer: {},
  footerLink: {},
  footerIcon: {},
  copyright: {}
}
