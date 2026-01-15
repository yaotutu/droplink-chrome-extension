/**
 * 邮箱验证码登录表单（使用 Zustand Store）
 */

import { useState, useEffect } from "react"
import { useStore } from "~/shared/store"
import type { Config } from "~/shared/types"
import { sendVerificationCode, verifyEmailCode } from "~/core/gotify/auth"

interface EmailCodeFormProps {
  onLoginSuccess?: () => void
}

export function EmailCodeForm({ onLoginSuccess }: EmailCodeFormProps) {
  // 从 store 读取
  const config = useStore((state) => state.config)
  const updateField = useStore((state) => state.updateField)
  const saveConfig = useStore((state) => state.saveConfig)

  // 本地 UI 状态
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [codeSent, setCodeSent] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [loading, setLoading] = useState(false) // 发送验证码中
  const [verifying, setVerifying] = useState(false) // 验证登录中

  /**
   * 倒计时逻辑
   */
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (countdown === 0 && codeSent) {
      setCodeSent(false)
    }
  }, [countdown, codeSent])

  /**
   * 验证邮箱格式
   */
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * 发送验证码
   */
  const handleSendCode = async () => {
    // 验证邮箱格式
    if (!email) {
      alert("请输入邮箱地址")
      return
    }

    if (!isValidEmail(email)) {
      alert("请输入有效的邮箱地址")
      return
    }

    setLoading(true)
    try {
      await sendVerificationCode(email)

      // 开始倒计时（60 秒）
      setCodeSent(true)
      setCountdown(60)

      alert("验证码已发送到您的邮箱（测试模式：0000）")
    } catch (error: any) {
      alert(`发送验证码失败: ${error.message || error}`)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 提交登录表单
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 验证输入
    if (!email) {
      alert("请输入邮箱地址")
      return
    }

    if (!isValidEmail(email)) {
      alert("请输入有效的邮箱地址")
      return
    }

    if (!code) {
      alert("请输入验证码")
      return
    }

    setVerifying(true)
    try {
      // 调用验证 API
      const { clientToken, appToken, isNewUser } = await verifyEmailCode(
        email,
        code
      )

      // 保存 Token 到配置
      const newConfig: Config = {
        ...config,
        clientToken: clientToken
      }

      // 先保存配置
      console.log("[EmailCodeForm] 保存配置...")
      await saveConfig(newConfig)

      // 主动发送重连消息（会唤醒 Service Worker 并建立连接）
      console.log("[EmailCodeForm] 发送重连消息...")
      const reconnectResponse = await chrome.runtime.sendMessage({
        type: "reconnect"
      })

      if (!reconnectResponse.success) {
        console.error("[EmailCodeForm] 重连失败:", reconnectResponse.error)
        throw new Error(reconnectResponse.error || "连接失败")
      }

      console.log("[EmailCodeForm] 登录成功，已建立连接")

      // 显示成功提示
      if (isNewUser) {
        alert("注册成功！已自动连接到 Gotify 服务器")
      } else {
        alert("登录成功！已自动连接到 Gotify 服务器")
      }

      // 清空表单
      setEmail("")
      setCode("")
      setCodeSent(false)
      setCountdown(0)

      // 调用成功回调
      onLoginSuccess?.()
    } catch (error: any) {
      alert(`登录失败: ${error.message || error}`)
    } finally {
      setVerifying(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.formGroup}>
        <label style={styles.label}>
          邮箱地址 <span style={styles.required}>*</span>
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="user@example.com"
          style={styles.input}
          disabled={loading || verifying}
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>
          验证码 <span style={styles.required}>*</span>
        </label>
        <div style={styles.codeContainer}>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="请输入验证码"
            style={styles.codeInput}
            disabled={loading || verifying}
            maxLength={6}
          />
          <button
            type="button"
            onClick={handleSendCode}
            style={{
              ...styles.sendButton,
              ...(loading || countdown > 0
                ? styles.sendButtonDisabled
                : {})
            }}
            disabled={loading || countdown > 0}>
            {loading
              ? "发送中..."
              : countdown > 0
                ? `${countdown}s`
                : "发送验证码"}
          </button>
        </div>
      </div>

      <button
        type="submit"
        style={styles.submitButton}
        disabled={loading || verifying}>
        {verifying ? "登录中..." : "登录"}
      </button>

      <div style={styles.hint}>
        输入邮箱后点击"发送验证码"，验证码将发送到您的邮箱（测试模式下验证码固定为
        0000）
      </div>
    </form>
  )
}

const styles: Record<string, React.CSSProperties> = {
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 16
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#555"
  },
  required: {
    color: "#f44336"
  },
  input: {
    padding: "10px 12px",
    fontSize: 14,
    border: "1px solid #ddd",
    borderRadius: 6,
    outline: "none"
  },
  codeContainer: {
    display: "flex",
    gap: 8
  },
  codeInput: {
    flex: 1,
    padding: "10px 12px",
    fontSize: 14,
    border: "1px solid #ddd",
    borderRadius: 6,
    outline: "none",
    fontFamily: "monospace"
  },
  sendButton: {
    padding: "0 16px",
    fontSize: 13,
    border: "1px solid #2196f3",
    borderRadius: 6,
    backgroundColor: "#2196f3",
    color: "white",
    cursor: "pointer",
    minWidth: 100,
    whiteSpace: "nowrap"
  },
  sendButtonDisabled: {
    backgroundColor: "#ccc",
    borderColor: "#ccc",
    cursor: "not-allowed"
  },
  submitButton: {
    padding: 12,
    fontSize: 14,
    fontWeight: "500",
    border: "none",
    borderRadius: 6,
    backgroundColor: "#2196f3",
    color: "white",
    cursor: "pointer"
  },
  hint: {
    fontSize: 12,
    color: "#999",
    lineHeight: 1.5
  }
}
