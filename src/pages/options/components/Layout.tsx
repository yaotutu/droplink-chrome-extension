/**
 * Layout 组件 - 页面布局
 * 包含顶部导航栏、主内容区域和页脚
 */

import React from "react"

import {
  borderRadius,
  colors,
  fontSize,
  fontWeight,
  spacing
} from "~/pages/options/styles/theme"
import { t } from "~/shared/utils/i18n"

interface LayoutProps {
  children: React.ReactNode
  showSettingsButton?: boolean
  onSettingsClick?: () => void
  showBackButton?: boolean
  onBackClick?: () => void
  tabs?: { id: string; label: string }[]
  activeTabId?: string
  onTabChange?: (id: string) => void
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  showSettingsButton = false,
  onSettingsClick,
  showBackButton = false,
  onBackClick,
  tabs,
  activeTabId,
  onTabChange
}) => {
  return (
    <div style={styles.container}>
      {/* 顶部导航栏 */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          {/* Logo + 品牌名 */}
          <div style={styles.leftGroup}>
            <div style={styles.brand}>
              <span style={styles.logo}>🔔</span>
              <span style={styles.brandName}>{t("app_name")}</span>
            </div>
            {showBackButton && (
              <button onClick={onBackClick} style={styles.backButton}>
                <span style={styles.backIcon}>←</span>
                {t("back_button")}
              </button>
            )}
          </div>

          {tabs && tabs.length > 0 && (
            <div style={styles.tabBar}>
              {tabs.map((tab) => {
                const isActive = tab.id === activeTabId
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange?.(tab.id)}
                    style={{
                      ...styles.tabButton,
                      ...(isActive ? styles.tabButtonActive : {})
                    }}>
                    {tab.label}
                  </button>
                )
              })}
            </div>
          )}

          {/* 导航链接 */}
          <nav style={styles.nav}>
            <a
              href="https://github.com/yaotutu/droplink"
              target="_blank"
              rel="noopener noreferrer"
              style={styles.navLink}>
              {t("help_link")}
            </a>
            <a
              href="https://github.com/yaotutu/droplink#readme"
              target="_blank"
              rel="noopener noreferrer"
              style={styles.navLink}>
              {t("documentation_link")}
            </a>
            <a
              href="https://github.com/yaotutu/droplink/issues"
              target="_blank"
              rel="noopener noreferrer"
              style={styles.navLink}>
              {t("support_link")}
            </a>

            {/* Settings 按钮（仅在已登录时显示） */}
            {showSettingsButton && (
              <button
                onClick={onSettingsClick}
                style={styles.settingsButton}>
                <span style={styles.settingsIcon}>⚙️</span>
                {t("settings_button")}
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* 主内容区域 */}
      <main style={styles.main}>
        <div style={styles.content}>{children}</div>
      </main>

      {/* 页脚 */}
      <footer style={styles.footer}>
        <div style={styles.footerLinks}>
          <a href="#" style={styles.footerLink}>
            <span style={styles.footerIcon}>❓</span>
            {t("help_center_link")}
          </a>
          <a href="#" style={styles.footerLink}>
            <span style={styles.footerIcon}>🔒</span>
            {t("security_faq_link")}
          </a>
        </div>
        <div style={styles.footerText}>
          {t("footer_copyright")}
        </div>
      </footer>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    height: "100vh",
    backgroundColor: colors.background,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden"
  },
  header: {
    backgroundColor: colors.card,
    borderBottom: `1px solid ${colors.border}`,
    padding: `${spacing.md} 0`,
    flexShrink: 0
  },
  headerContent: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: `0 ${spacing.md}`,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  leftGroup: {
    display: "flex",
    alignItems: "center",
    gap: spacing.md
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: spacing.xs
  },
  logo: {
    fontSize: "18px"
  },
  brandName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.text.primary
  },
  backButton: {
    display: "flex",
    alignItems: "center",
    gap: spacing.xs,
    padding: `6px ${spacing.md}`,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.primary,
    backgroundColor: colors.card,
    border: `1px solid rgba(37, 99, 235, 0.35)`,
    borderRadius: "999px",
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(37, 99, 235, 0.12)",
    outline: "none"
  },
  backIcon: {
    fontSize: fontSize.base
  },
  tabBar: {
    display: "flex",
    justifyContent: "center",
    gap: spacing.sm
  },
  tabButton: {
    padding: `${spacing.xs} ${spacing.lg}`,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text.secondary,
    backgroundColor: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: "999px",
    cursor: "pointer",
    transition: "all 0.2s",
    outline: "none"
  },
  tabButtonActive: {
    color: colors.primary,
    border: `1px solid rgba(37, 99, 235, 0.45)`,
    boxShadow: "0 4px 10px rgba(37, 99, 235, 0.12)"
  },
  nav: {
    display: "flex",
    gap: spacing.md,
    alignItems: "center"
  },
  navLink: {
    fontSize: fontSize.xs,
    color: colors.text.secondary,
    textDecoration: "none",
    transition: "color 0.2s",
    cursor: "pointer"
  },
  settingsButton: {
    display: "flex",
    alignItems: "center",
    gap: spacing.xs,
    padding: `6px ${spacing.md}`,
    fontSize: fontSize.xs,
    color: colors.text.primary,
    backgroundColor: colors.background,
    border: "none",
    borderRadius: borderRadius.md,
    cursor: "pointer",
    transition: "all 0.2s",
    outline: "none"
  },
  settingsIcon: {
    fontSize: "16px"
  },
  main: {
    flex: 1,
    padding: `${spacing.md} ${spacing.md}`,
    display: "flex",
    flexDirection: "column"
  },
  content: {
    maxWidth: "1200px",
    margin: "0 auto",
    width: "100%",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minHeight: 0
  },
  footer: {
    padding: `${spacing.sm} 0`,
    textAlign: "center",
    borderTop: `1px solid ${colors.border}`,
    backgroundColor: colors.card,
    flexShrink: 0
  },
  footerLinks: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: "4px"
  },
  footerLink: {
    fontSize: fontSize.xs,
    color: colors.text.secondary,
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    gap: "2px",
    transition: "color 0.2s"
  },
  footerIcon: {
    fontSize: fontSize.sm
  },
  footerText: {
    fontSize: fontSize.xs,
    color: colors.text.muted,
    letterSpacing: "0.1em"
  }
}
