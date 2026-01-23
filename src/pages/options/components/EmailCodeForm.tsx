/**
 * 邮箱验证码登录表单（使用 Zustand Store）
 */

import { useState, useEffect } from "react"
import { useStore } from "~/shared/store"
import type { Config } from "~/shared/types"
import { sendVerificationCode, verifyEmailCode } from "~/core/gotify/auth"
import { AUTH_SERVER_URL, GOTIFY_SERVER_URL } from "~/shared/utils/constants"
import { t } from "~/shared/utils/i18n"

interface EmailCodeFormProps {
  onLoginSuccess?: () => void
}

export function EmailCodeForm({ onLoginSuccess }: EmailCodeFormProps) {
  // 从 store 读取
  const config = useStore((state) => state.config)
  const updateField = useStore((state) => state.updateField)
  const saveConfig = useStore((state) => state.saveConfig)

  // 本地 UI 状态
  const [authServerUrl, setAuthServerUrl] = useState(AUTH_SERVER_URL)
  const [gotifyServerUrl, setGotifyServerUrl] = useState(GOTIFY_SERVER_URL)
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
   * 验证 URL 格式
   */
  const isValidUrl = (url: string): boolean => {
    try {
      const parsedUrl = new URL(url)
      return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:"
    } catch {
      return false
    }
  }

  /**
   * 发送验证码
   */
  const handleSendCode = async () => {
    // 验证服务器地址
    if (!authServerUrl) {
      alert(t("error_server_url_required"))
      return
    }

    if (!isValidUrl(authServerUrl)) {
      alert(t("error_invalid_url"))
      return
    }

    // 验证邮箱格式
    if (!email) {
      alert(t("error_email_required"))
      return
    }

    if (!isValidEmail(email)) {
      alert(t("error_invalid_email"))
      return
    }

    setLoading(true)
    try {
      await sendVerificationCode(email, authServerUrl)

      // 开始倒计时（60 秒）
      setCodeSent(true)
      setCountdown(60)

      // 移除 alert，用户可以通过倒计时看到验证码已发送
      console.log("[EmailCodeForm] 验证码发送成功")
    } catch (error: any) {
      alert(`${t("error_send_code_failed").replace("{error}", error.message || error)}`)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 提交登录表单
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 验证认证服务器地址
    if (!authServerUrl) {
      alert(t("error_server_url_required"))
      return
    }

    if (!isValidUrl(authServerUrl)) {
      alert(t("error_invalid_url"))
      return
    }

    // 验证 Gotify 服务器地址
    if (!gotifyServerUrl) {
      alert(t("error_server_url_required"))
      return
    }

    if (!isValidUrl(gotifyServerUrl)) {
      alert(t("error_invalid_url"))
      return
    }

    // 验证输入
    if (!email) {
      alert(t("error_email_required"))
      return
    }

    if (!isValidEmail(email)) {
      alert(t("error_invalid_email"))
      return
    }

    if (!code) {
      alert(t("error_code_required"))
      return
    }

    setVerifying(true)
    try {
      console.log("[EmailCodeForm] 开始验证登录...")
      console.log("[EmailCodeForm] 邮箱:", email)
      console.log("[EmailCodeForm] 验证码长度:", code.length)
      console.log("[EmailCodeForm] 认证服务器:", authServerUrl)
      console.log("[EmailCodeForm] Gotify 服务器:", gotifyServerUrl)

      // 调用验证 API（传入 Gotify 服务器地址）
      const { clientToken, appToken, isNewUser, gotifyUrl } =
        await verifyEmailCode(email, code, authServerUrl, gotifyServerUrl)

      console.log("[EmailCodeForm] 验证成功，获得 Token")

      // 保存 Token 和服务器地址到配置
      const newConfig: Config = {
        ...config,
        clientToken: clientToken,
        appToken: appToken,
        gotifyUrl: gotifyUrl
      }

      // 保存配置（chrome.storage.onChanged 会自动触发重连）
      console.log("[EmailCodeForm] 保存配置...")
      await saveConfig(newConfig)

      console.log("[EmailCodeForm] 配置已保存，等待自动连接...")

      // 登录成功，不显示 alert，让页面自动切换
      console.log(
        `[EmailCodeForm] ${isNewUser ? "注册" : "登录"}成功，用户: ${email}`
      )

      // 清空表单
      setEmail("")
      setCode("")
      setCodeSent(false)
      setCountdown(0)

      // 调用成功回调
      onLoginSuccess?.()
    } catch (error: any) {
      console.error("[EmailCodeForm] 登录失败:", error)

      // 根据错误类型提供更详细的提示
      let errorMessage = error.message || error

      if (errorMessage.includes("验证码错误或已过期")) {
        errorMessage = "验证码错误或已过期\n\n可能的原因：\n1. 验证码输入错误（请仔细检查）\n2. 验证码已过期（请重新获取）\n3. 多次获取验证码导致旧验证码失效"
      } else if (errorMessage.includes("无法连接到服务器")) {
        errorMessage = "无法连接到认证服务器\n\n请检查：\n1. 服务器地址是否正确\n2. 网络连接是否正常\n3. 服务器是否正在运行"
      }

      alert(`${t("error_login_failed").replace("{error}", errorMessage)}`)
    } finally {
      setVerifying(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.formGroup}>
        <label style={styles.label}>
          {t("auth_server_label")} <span style={styles.required}>*</span>
        </label>
        <input
          type="text"
          value={authServerUrl}
          onChange={(e) => setAuthServerUrl(e.target.value)}
          placeholder={t("auth_server_placeholder")}
          style={styles.input}
          disabled={loading || verifying}
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>
          {t("gotify_server_label")} <span style={styles.required}>*</span>
        </label>
        <input
          type="text"
          value={gotifyServerUrl}
          onChange={(e) => setGotifyServerUrl(e.target.value)}
          placeholder={t("gotify_server_placeholder")}
          style={styles.input}
          disabled={loading || verifying}
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>
          {t("email_label")} <span style={styles.required}>*</span>
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("email_placeholder")}
          style={styles.input}
          disabled={loading || verifying}
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>
          {t("verification_code_label")} <span style={styles.required}>*</span>
        </label>
        <div style={styles.codeContainer}>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={t("code_placeholder")}
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
            {loading ? t("sending") : countdown > 0 ? `${countdown}s` : t("send_code")}
          </button>
        </div>
      </div>

      <button
        type="submit"
        style={styles.submitButton}
        disabled={loading || verifying}>
        {verifying ? t("logging_in") : t("login")}
      </button>

      <div style={styles.hint}>{t("email_code_hint")}</div>
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
