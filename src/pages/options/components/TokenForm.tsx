/**
 * Token 登录表单（使用 Zustand Store）
 */

import { useState } from "react"
import { useStore } from "~/shared/store"
import type { Config } from "~/shared/types"

interface TokenFormProps {
  onLoginSuccess?: () => void
}

export function TokenForm({ onLoginSuccess }: TokenFormProps) {
  // 从 store 读取
  const config = useStore((state) => state.config)
  const updateField = useStore((state) => state.updateField)
  const saveConfig = useStore((state) => state.saveConfig)

  // 本地 UI 状态
  const [token, setToken] = useState("")
  const [showToken, setShowToken] = useState(false)
  const [saving, setSaving] = useState(false)

  /**
   * 提交登录表单
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token) {
      alert("Token 不能为空")
      return
    }

    setSaving(true)
    try {
      const newConfig: Config = {
        ...config,
        clientToken: token
      }

      // 先保存配置
      console.log("[TokenForm] 保存配置...")
      await saveConfig(newConfig)

      // 主动发送重连消息（会唤醒 Service Worker 并建立连接）
      console.log("[TokenForm] 发送重连消息...")
      const reconnectResponse = await chrome.runtime.sendMessage({
        type: "reconnect"
      })

      if (!reconnectResponse.success) {
        console.error("[TokenForm] 重连失败:", reconnectResponse.error)
        throw new Error(reconnectResponse.error || "连接失败")
      }

      console.log("[TokenForm] 登录成功，已建立连接")

      alert("登录成功！已自动连接到 Gotify 服务器")
      setToken("")
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
          客户端 Token <span style={styles.required}>*</span>
        </label>
        <div style={styles.tokenContainer}>
          <input
            type={showToken ? "text" : "password"}
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="请输入客户端 Token"
            style={styles.tokenInput}
            disabled={saving}
          />
          <button
            type="button"
            onClick={() => setShowToken(!showToken)}
            style={styles.toggleButton}
            disabled={saving}>
            {showToken ? "隐藏" : "显示"}
          </button>
        </div>
      </div>

      <button type="submit" style={styles.submitButton} disabled={saving}>
        {saving ? "登录中..." : "登录"}
      </button>

      <div style={styles.hint}>
        如果您已有客户端 Token，可以直接输入进行登录
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
