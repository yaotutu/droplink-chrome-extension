import { useEffect, useState } from "react"

import type { Config, RuntimeMessage, RuntimeResponse, StatusInfo } from "~types"

import { ConnectionStatus } from "~types"
import {
  getConfig,
  isConfigValid,
  saveConfig,
  validateToken,
  validateUrl
} from "~lib/storage"

function IndexPopup() {
  // 状态
  const [config, setConfig] = useState<Config>({
    gotifyUrl: "",
    clientToken: "",
    enabled: false
  })
  const [status, setStatus] = useState<StatusInfo>({
    status: ConnectionStatus.DISCONNECTED,
    configValid: false
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [showToken, setShowToken] = useState(false)
  const [errors, setErrors] = useState<{
    url?: string
    token?: string
  }>({})

  // 加载配置和状态
  useEffect(() => {
    loadData()
  }, [])

  // 加载数据
  const loadData = async () => {
    try {
      setLoading(true)

      // 加载配置
      const loadedConfig = await getConfig()
      setConfig(loadedConfig)

      // 获取状态
      const statusResponse = await sendMessage({ type: "getStatus" })
      if (statusResponse.success) {
        setStatus(statusResponse.data)
      }
    } catch (error) {
      console.error("加载数据失败:", error)
    } finally {
      setLoading(false)
    }
  }

  // 发送消息到后台脚本
  const sendMessage = (
    message: RuntimeMessage
  ): Promise<RuntimeResponse> => {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(message, (response: RuntimeResponse) => {
        resolve(response)
      })
    })
  }

  // 处理配置变化
  const handleConfigChange = (field: keyof Config, value: any) => {
    setConfig((prev) => ({
      ...prev,
      [field]: value
    }))

    // 清除对应字段的错误
    if (field === "gotifyUrl" || field === "clientToken") {
      setErrors((prev) => ({
        ...prev,
        [field === "gotifyUrl" ? "url" : "token"]: undefined
      }))
    }
  }

  // 验证表单
  const validateForm = (): boolean => {
    const newErrors: { url?: string; token?: string } = {}

    // 验证 URL
    const urlValidation = validateUrl(config.gotifyUrl)
    if (!urlValidation.valid) {
      newErrors.url = urlValidation.error
    }

    // 验证 Token
    const tokenValidation = validateToken(config.clientToken)
    if (!tokenValidation.valid) {
      newErrors.token = tokenValidation.error
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 保存配置
  const handleSave = async () => {
    // 验证表单
    if (!validateForm()) {
      return
    }

    try {
      setSaving(true)

      // 保存到 storage
      await saveConfig(config)

      alert("配置已保存!")

      // 重新加载状态
      await loadData()
    } catch (error) {
      console.error("保存配置失败:", error)
      alert("保存配置失败: " + error)
    } finally {
      setSaving(false)
    }
  }

  // 测试连接
  const handleTest = async () => {
    // 验证表单
    if (!validateForm()) {
      return
    }

    try {
      setTesting(true)

      const response = await sendMessage({
        type: "testConnection",
        data: config
      })

      if (response.success) {
        alert("连接成功!")
      } else {
        alert("连接失败: " + (response.error || "未知错误"))
      }
    } catch (error) {
      console.error("测试连接失败:", error)
      alert("测试连接失败: " + error)
    } finally {
      setTesting(false)
    }
  }

  // 获取状态文本
  const getStatusText = () => {
    switch (status.status) {
      case ConnectionStatus.CONNECTED:
        return "已连接"
      case ConnectionStatus.CONNECTING:
        return "连接中..."
      case ConnectionStatus.DISCONNECTED:
        return "未连接"
      case ConnectionStatus.ERROR:
        return "连接失败"
      default:
        return "未知"
    }
  }

  // 获取状态颜色
  const getStatusColor = () => {
    switch (status.status) {
      case ConnectionStatus.CONNECTED:
        return "#4caf50"
      case ConnectionStatus.CONNECTING:
        return "#ff9800"
      case ConnectionStatus.DISCONNECTED:
        return "#9e9e9e"
      case ConnectionStatus.ERROR:
        return "#f44336"
      default:
        return "#9e9e9e"
    }
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
      <h2 style={styles.title}>Droplink 配置</h2>

      <div style={styles.form}>
        {/* Gotify 服务器地址 */}
        <div style={styles.field}>
          <label style={styles.label}>Gotify 服务器地址:</label>
          <input
            type="text"
            placeholder="https://gotify.example.com"
            value={config.gotifyUrl}
            onChange={(e) => handleConfigChange("gotifyUrl", e.target.value)}
            style={{
              ...styles.input,
              ...(errors.url ? styles.inputError : {})
            }}
          />
          {errors.url && <div style={styles.errorText}>{errors.url}</div>}
        </div>

        {/* 客户端 Token */}
        <div style={styles.field}>
          <label style={styles.label}>客户端 Token:</label>
          <div style={styles.passwordContainer}>
            <input
              type={showToken ? "text" : "password"}
              placeholder="输入 Gotify 客户端 Token"
              value={config.clientToken}
              onChange={(e) =>
                handleConfigChange("clientToken", e.target.value)
              }
              style={{
                ...styles.input,
                ...(errors.token ? styles.inputError : {}),
                flex: 1
              }}
            />
            <button
              onClick={() => setShowToken(!showToken)}
              style={styles.toggleButton}>
              {showToken ? "隐藏" : "显示"}
            </button>
          </div>
          {errors.token && <div style={styles.errorText}>{errors.token}</div>}
        </div>

        {/* 启用开关 */}
        <div style={styles.field}>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={config.enabled}
              onChange={(e) => handleConfigChange("enabled", e.target.checked)}
              style={styles.checkbox}
            />
            启用 Droplink
          </label>
        </div>

        {/* 连接状态 */}
        <div style={styles.statusContainer}>
          <span style={styles.statusLabel}>状态:</span>
          <span
            style={{
              ...styles.statusIndicator,
              backgroundColor: getStatusColor()
            }}></span>
          <span style={styles.statusText}>{getStatusText()}</span>
        </div>

        {/* 最后连接时间 */}
        {status.lastConnected && (
          <div style={styles.infoText}>
            最后连接: {new Date(status.lastConnected).toLocaleString("zh-CN")}
          </div>
        )}

        {/* 错误信息 */}
        {status.error && (
          <div style={styles.errorText}>错误: {status.error}</div>
        )}

        {/* 按钮 */}
        <div style={styles.buttonContainer}>
          <button
            onClick={handleTest}
            disabled={testing || !isConfigValid(config)}
            style={{
              ...styles.button,
              ...styles.testButton,
              ...(testing || !isConfigValid(config)
                ? styles.buttonDisabled
                : {})
            }}>
            {testing ? "测试中..." : "测试连接"}
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !isConfigValid(config)}
            style={{
              ...styles.button,
              ...styles.saveButton,
              ...(saving || !isConfigValid(config)
                ? styles.buttonDisabled
                : {})
            }}>
            {saving ? "保存中..." : "保存"}
          </button>
        </div>
      </div>

      {/* 帮助文本 */}
      <div style={styles.helpText}>
        <p>提示:</p>
        <ul style={styles.helpList}>
          <li>在 Gotify 设置中创建一个客户端，获取客户端 Token</li>
          <li>Token 将用于 WebSocket 连接接收实时消息</li>
          <li>启用后扩展将自动连接到 Gotify 服务器</li>
        </ul>
      </div>
    </div>
  )
}

// 样式
const styles: Record<string, React.CSSProperties> = {
  container: {
    width: 400,
    padding: 20,
    fontFamily: "Arial, sans-serif"
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    marginTop: 0,
    color: "#333"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 16
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 6
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#555"
  },
  input: {
    padding: 8,
    fontSize: 14,
    border: "1px solid #ddd",
    borderRadius: 4,
    outline: "none"
  },
  inputError: {
    borderColor: "#f44336"
  },
  passwordContainer: {
    display: "flex",
    gap: 8
  },
  toggleButton: {
    padding: "8px 12px",
    fontSize: 12,
    border: "1px solid #ddd",
    borderRadius: 4,
    backgroundColor: "#f5f5f5",
    cursor: "pointer"
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 14,
    color: "#555",
    cursor: "pointer"
  },
  checkbox: {
    width: 16,
    height: 16,
    cursor: "pointer"
  },
  statusContainer: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 4
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#555"
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: "50%"
  },
  statusText: {
    fontSize: 14,
    color: "#555"
  },
  infoText: {
    fontSize: 12,
    color: "#777"
  },
  errorText: {
    fontSize: 12,
    color: "#f44336"
  },
  buttonContainer: {
    display: "flex",
    gap: 10,
    marginTop: 8
  },
  button: {
    flex: 1,
    padding: 10,
    fontSize: 14,
    fontWeight: "500",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
    transition: "background-color 0.2s"
  },
  testButton: {
    backgroundColor: "#2196f3",
    color: "white"
  },
  saveButton: {
    backgroundColor: "#4caf50",
    color: "white"
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: "not-allowed"
  },
  helpText: {
    marginTop: 20,
    padding: 12,
    backgroundColor: "#e3f2fd",
    borderRadius: 4,
    fontSize: 12,
    color: "#555"
  },
  helpList: {
    margin: "8px 0 0 0",
    paddingLeft: 20
  },
  loading: {
    textAlign: "center",
    padding: 40,
    color: "#999"
  }
}

export default IndexPopup
