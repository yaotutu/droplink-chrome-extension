/**
 * Token 登录表单（使用 Zustand Store）
 */

import { useState } from "react"
import { useStore } from "~/shared/store"
import type { Config } from "~/shared/types"
import { GOTIFY_SERVER_URL } from "~/shared/utils/constants"
import { t } from "~/shared/utils/i18n"

interface TokenFormProps {
  onLoginSuccess?: () => void
}

export function TokenForm({ onLoginSuccess }: TokenFormProps) {
  // 从 store 读取
  const config = useStore((state) => state.config)
  const updateField = useStore((state) => state.updateField)
  const saveConfig = useStore((state) => state.saveConfig)

  // 本地 UI 状态
  const [gotifyServerUrl, setGotifyServerUrl] = useState(GOTIFY_SERVER_URL)
  const [clientToken, setClientToken] = useState("")
  const [appToken, setAppToken] = useState("")
  const [showClientToken, setShowClientToken] = useState(false)
  const [showAppToken, setShowAppToken] = useState(false)
  const [saving, setSaving] = useState(false)

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
   * 提交登录表单
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 验证服务器地址
    if (!gotifyServerUrl) {
      alert(t("error_server_url_required"))
      return
    }

    if (!isValidUrl(gotifyServerUrl)) {
      alert(t("error_invalid_url"))
      return
    }

    // 验证 Client Token
    if (!clientToken) {
      alert(t("error_token_required"))
      return
    }

    // 验证 App Token
    if (!appToken) {
      alert("应用 Token 不能为空")
      return
    }

    setSaving(true)
    try {
      const newConfig: Config = {
        ...config,
        clientToken: clientToken,
        appToken: appToken,
        gotifyUrl: gotifyServerUrl
      }

      // 保存配置（chrome.storage.onChanged 会自动触发重连）
      console.log("[TokenForm] 保存配置...")
      await saveConfig(newConfig)

      console.log("[TokenForm] 配置已保存，等待自动连接...")

      alert(t("success_login"))
      setClientToken("")
      setAppToken("")
      // 调用成功回调，触发父组件重新加载配置
      onLoginSuccess?.()
    } catch (error: any) {
      alert(`${t("error_login_failed").replace("{error}", error.message || error)}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
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
          disabled={saving}
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>
          {t("client_token_label")} <span style={styles.required}>*</span>
        </label>
        <div style={styles.tokenContainer}>
          <input
            type={showClientToken ? "text" : "password"}
            value={clientToken}
            onChange={(e) => setClientToken(e.target.value)}
            placeholder={t("token_placeholder")}
            style={styles.tokenInput}
            disabled={saving}
          />
          <button
            type="button"
            onClick={() => setShowClientToken(!showClientToken)}
            style={styles.toggleButton}
            disabled={saving}>
            {showClientToken ? t("hide") : t("show")}
          </button>
        </div>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>
          应用 Token <span style={styles.required}>*</span>
        </label>
        <div style={styles.tokenContainer}>
          <input
            type={showAppToken ? "text" : "password"}
            value={appToken}
            onChange={(e) => setAppToken(e.target.value)}
            placeholder="从 Gotify Apps 页面获取"
            style={styles.tokenInput}
            disabled={saving}
          />
          <button
            type="button"
            onClick={() => setShowAppToken(!showAppToken)}
            style={styles.toggleButton}
            disabled={saving}>
            {showAppToken ? t("hide") : t("show")}
          </button>
        </div>
      </div>

      <button type="submit" style={styles.submitButton} disabled={saving}>
        {saving ? t("logging_in") : t("login")}
      </button>

      <div style={styles.hint}>{t("token_login_hint")}</div>
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
  tokenContainer: {
    display: "flex",
    gap: 8
  },
  tokenInput: {
    flex: 1,
    padding: "10px 12px",
    fontSize: 14,
    border: "1px solid #ddd",
    borderRadius: 6,
    outline: "none",
    fontFamily: "monospace"
  },
  toggleButton: {
    padding: "0 16px",
    fontSize: 13,
    border: "1px solid #ddd",
    borderRadius: 6,
    backgroundColor: "#fff",
    color: "#555",
    cursor: "pointer"
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
