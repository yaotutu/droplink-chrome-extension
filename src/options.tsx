/**
 * Options 页面入口（使用 Zustand Store）
 * 重构后的页面流程：
 * 1. 未登录 → WelcomePage（扫码下载 + 扫码登录）
 * 2. 已登录 → WelcomePage（右上角显示 Settings 按钮）
 * 3. 点击 Settings → SettingsPage（设置页面）
 */

import { useEffect, useState } from "react"

import { Layout } from "~/pages/options/components/Layout"
import { LoginForm } from "~/pages/options/components/LoginForm"
import { WelcomePage } from "~/pages/options/components/WelcomePage"
import { SettingsPage } from "~/pages/options/components/SettingsPage"
import { isConfigValid } from "~/core/storage"
import { useStore } from "~/shared/store"
import { t } from "~/shared/utils/i18n"

function OptionsPage() {
  // 从 store 读取状态
  const config = useStore((state) => state.config)
  const loading = useStore((state) => state.loading)
  const loadConfig = useStore((state) => state.loadConfig)
  const loadStatus = useStore((state) => state.loadStatus)
  const initConfigSync = useStore((state) => state.initConfigSync)

  // 本地 UI 状态
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [activeTab, setActiveTab] = useState<"welcome" | "settings">("welcome")

  // 初始化：加载配置并启动配置同步
  useEffect(() => {
    loadConfig()
    loadStatus()
    initConfigSync()
  }, [loadConfig, loadStatus, initConfigSync])

  // 全局样式修正，避免页面内容过少时出现浏览器滚动条
  useEffect(() => {
    document.documentElement.style.height = "100%"
    document.body.style.height = "100%"
    document.body.style.margin = "0"
    document.body.style.overflow = "hidden"
  }, [])

  // 监听配置变化，更新登录状态
  useEffect(() => {
    setIsLoggedIn(isConfigValid(config))
  }, [config])

  // 定期更新连接状态
  useEffect(() => {
    if (isLoggedIn) {
      const interval = setInterval(() => {
        loadStatus()
      }, 5000) // 每5秒更新一次状态

      return () => clearInterval(interval)
    }
  }, [isLoggedIn, loadStatus])

  /**
   * 登录成功回调
   */
  const handleLoginSuccess = () => {
    loadConfig() // 重新加载配置
    loadStatus() // 加载连接状态
  }

  /**
   * 切换到设置页面
   */
  const handleShowSettings = () => {
    setActiveTab("settings")
  }

  const handleShowWelcome = () => {
    setActiveTab("welcome")
  }


  if (loading) {
    return (
      <Layout>
        <div style={styles.loading}>{t("loading", "加载中...")}</div>
      </Layout>
    )
  }

  return (
    <Layout
      showSettingsButton={false}
      onSettingsClick={handleShowSettings}
      tabs={
        isLoggedIn
          ? [
              { id: "welcome", label: t("welcome_tab") },
              { id: "settings", label: t("settings_tab") }
            ]
          : undefined
      }
      activeTabId={activeTab}
      onTabChange={(id) => setActiveTab(id as "welcome" | "settings")}>
      {!isLoggedIn ? (
        /* 未登录：显示登录表单 */
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      ) : (
        activeTab === "settings" ? (
          /* 已登录 + 设置页 */
        <SettingsPage />
        ) : (
          /* 已登录 + 欢迎页 */
          <WelcomePage />
        )
      )}
    </Layout>
  )
}

// 样式
const styles: Record<string, React.CSSProperties> = {
  loading: {
    textAlign: "center",
    padding: "60px 20px",
    fontSize: "16px",
    color: "#999"
  }
}

export default OptionsPage
