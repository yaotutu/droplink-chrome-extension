/**
 * 登录表单容器（使用 Zustand Store）
 */

import { useState } from "react"
import { useStore } from "~/shared/store"
import { EmailCodeForm } from "./EmailCodeForm"
import { TokenForm } from "./TokenForm"

export type LoginMode = "email_code" | "token"

interface LoginFormProps {
  onLoginSuccess?: () => void
}

export function LoginForm({ onLoginSuccess }: LoginFormProps) {
  // 从 store 读取
  const config = useStore((state) => state.config)
  const updateField = useStore((state) => state.updateField)

  // 本地 UI 状态
  const [loginMode, setLoginMode] = useState<LoginMode>("email_code")

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>登录 Droplink</h2>
      <p style={styles.description}>
        使用邮箱验证码或客户端 Token 登录
      </p>

      {/* 登录模式切换 */}
      <div style={styles.tabs}>
        <button
          onClick={() => setLoginMode("email_code")}
          style={{
            ...styles.tab,
            ...(loginMode === "email_code" ? styles.tabActive : {})
          }}>
          邮箱验证码登录
        </button>
        <button
          onClick={() => setLoginMode("token")}
          style={{
            ...styles.tab,
            ...(loginMode === "token" ? styles.tabActive : {})
          }}>
          Token 登录
        </button>
      </div>

      {/* 表单内容 */}
      <div style={styles.formContainer}>
        {loginMode === "email_code" ? (
          <EmailCodeForm onLoginSuccess={onLoginSuccess} />
        ) : (
          <TokenForm onLoginSuccess={onLoginSuccess} />
        )}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    margin: 0,
    marginBottom: 8,
    color: "#333"
  },
  description: {
    fontSize: 13,
    color: "#666",
    marginBottom: 20
  },
  tabs: {
    display: "flex",
    gap: 8,
    marginBottom: 20,
    borderBottom: "1px solid #eee",
    paddingBottom: 0
  },
  tab: {
    padding: "10px 20px",
    fontSize: 14,
    fontWeight: "500",
    border: "none",
    borderBottom: "2px solid transparent",
    backgroundColor: "transparent",
    color: "#666",
    cursor: "pointer",
    transition: "all 0.2s"
  },
  tabActive: {
    color: "#2196f3",
    borderBottomColor: "#2196f3"
  },
  formContainer: {
    marginTop: 20
  }
}
