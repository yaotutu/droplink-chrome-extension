/**
 * Options 页面入口（使用 Zustand Store）
 */

import { useEffect, useState } from "react"
import { useStore } from "~/shared/store"
import { isConfigValid } from "~/core/storage"
import { LoginForm } from "~/pages/options/components/LoginForm"
import { ConfigCard } from "~/pages/options/components/ConfigCard"
import { FeatureToggles } from "~/pages/options/components/FeatureToggles"
import { APP_NAME, APP_VERSION } from "~/shared/utils/constants"

function OptionsPage() {
  // 从 store 读取状态
  const config = useStore((state) => state.config)
  const loading = useStore((state) => state.loading)
  const loadConfig = useStore((state) => state.loadConfig)
  const resetConfig = useStore((state) => state.resetConfig)

  // 本地 UI 状态：是否已登录
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // 初始化：加载配置
  useEffect(() => {
    loadConfig()
  }, [loadConfig])

  // 监听配置变化，更新登录状态
  useEffect(() => {
    setIsLoggedIn(isConfigValid(config))
  }, [config])

  /**
   * 退出登录
   */
  const handleLogout = async () => {
    if (confirm("确定要退出登录吗？这将清除所有配置信息。")) {
      await resetConfig()
      setIsLoggedIn(false)
    }
  }

  /**
   * 登录成功回调
   */
  const handleLoginSuccess = () => {
    loadConfig() // 重新加载配置
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>加载中...</div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      {/* 页面标题 */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>{APP_NAME} 设置</h1>
          <p style={styles.version}>版本 {APP_VERSION}</p>
        </div>
      </div>

      {/* 主要内容 */}
      <div style={styles.content}>
        {!isLoggedIn ? (
          /* 未登录：显示登录表单 */
          <LoginForm onLoginSuccess={handleLoginSuccess} />
        ) : (
          /* 已登录：显示配置和功能设置 */
          <>
            <ConfigCard config={config} onLogout={handleLogout} />
            <FeatureToggles />
          </>
        )}
      </div>

      {/* 页脚信息 */}
      <div style={styles.footer}>
        <p style={styles.footerText}>
          {APP_NAME} - 通过 Gotify 远程控制浏览器打开标签页
        </p>
        <p style={styles.footerLinks}>
          <a
            href="https://github.com/gotify"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.link}>
            Gotify 官网
          </a>
          {" · "}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.link}>
            GitHub
          </a>
        </p>
      </div>
    </div>
  )
}

// 样式
const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
    padding: "40px 20px"
  },
  header: {
    maxWidth: 800,
    margin: "0 auto 32px",
    textAlign: "center"
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    margin: 0,
    marginBottom: 8,
    color: "#333"
  },
  version: {
    fontSize: 14,
    color: "#999",
    margin: 0
  },
  content: {
    maxWidth: 800,
    margin: "0 auto"
  },
  loading: {
    textAlign: "center",
    padding: 60,
    fontSize: 16,
    color: "#999"
  },
  footer: {
    maxWidth: 800,
    margin: "40px auto 0",
    paddingTop: 32,
    borderTop: "1px solid #e0e0e0",
    textAlign: "center"
  },
  footerText: {
    fontSize: 13,
    color: "#999",
    margin: "0 0 8px 0"
  },
  footerLinks: {
    fontSize: 13,
    color: "#999",
    margin: 0
  },
  link: {
    color: "#2196f3",
    textDecoration: "none"
  }
}

export default OptionsPage
