/**
 * 账号密码登录表单（使用 Zustand Store）
 */

import { useState } from "react"
import { useStore } from "~/shared/store"
import type { Config } from "~/shared/types"
import { createClient } from "~/core/gotify/auth"

interface Credentials {
  username: string
  password: string
}

interface CredentialsFormProps {
  onLoginSuccess?: () => void
}

export function CredentialsForm({ onLoginSuccess }: CredentialsFormProps) {
  // 从 store 读取
  const config = useStore((state) => state.config)
  const updateField = useStore((state) => state.updateField)
  const saveConfig = useStore((state) => state.saveConfig)

  // 本地 UI 状态
  const [credentials, setCredentials] = useState<Credentials>({
    username: "",
    password: ""
  })
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving] = useState(false)

  /**
   * 提交登录表单
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!credentials.username || !credentials.password) {
      alert("用户名和密码不能为空")
      return
    }

    setSaving(true)
    try {
      // 创建客户端 Token
      const { token } = await createClient(
        config.gotifyUrl,
        credentials.username,
        credentials.password
      )

      // 保存配置
      const newConfig: Config = {
        ...config,
        clientToken: token,
        enabled: true
      }

      // 测试连接
      const testResponse = await chrome.runtime.sendMessage({
        type: "testConnection",
        data: newConfig
      })

      if (!testResponse.success) {
        throw new Error(testResponse.error || "连接测试失败")
      }

      await saveConfig(newConfig)

      // 清空密码
      setCredentials({ username: "", password: "" })

      alert("登录成功！")
      // 调用成功回调，触发父组件重新加载配置
      onLoginSuccess?.()
    } catch (error) {
      alert(`登录失败: ${error}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.formGroup}>
        <label style={styles.label}>
          Gotify 服务器地址 <span style={styles.required}>*</span>
        </label>
        <input
          type="text"
          value={config.gotifyUrl}
          onChange={(e) => updateField("gotifyUrl", e.target.value)}
          placeholder="http://example.com:2345"
          style={styles.input}
          disabled={saving}
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>
          用户名 <span style={styles.required}>*</span>
        </label>
        <input
          type="text"
          value={credentials.username}
          onChange={(e) =>
            setCredentials({ ...credentials, username: e.target.value })
          }
          placeholder="请输入用户名"
          style={styles.input}
          disabled={saving}
          autoComplete="username"
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>
          密码 <span style={styles.required}>*</span>
        </label>
        <div style={styles.passwordContainer}>
          <input
            type={showPassword ? "text" : "password"}
            value={credentials.password}
            onChange={(e) =>
              setCredentials({ ...credentials, password: e.target.value })
            }
            placeholder="请输入密码"
            style={styles.passwordInput}
            disabled={saving}
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={styles.toggleButton}
            disabled={saving}>
            {showPassword ? "隐藏" : "显示"}
          </button>
        </div>
      </div>

      <button type="submit" style={styles.submitButton} disabled={saving}>
        {saving ? "登录中..." : "登录"}
      </button>

      <div style={styles.hint}>
        使用 Gotify 用户账号密码登录，系统将自动创建客户端 Token
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
  passwordContainer: {
    display: "flex",
    gap: 8
  },
  passwordInput: {
    flex: 1,
    padding: "10px 12px",
    fontSize: 14,
    border: "1px solid #ddd",
    borderRadius: 6,
    outline: "none"
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
