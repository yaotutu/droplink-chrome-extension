import { useEffect, useState } from "react"

import type {
  Config,
  Credentials,
  FeatureToggles,
  RuntimeMessage,
  RuntimeResponse,
  StatusInfo
} from "~types"

import { ConnectionStatus, LoginMode } from "~types"
import { createClient } from "~lib/auth"
import {
  getConfig,
  isConfigValid,
  saveConfig,
  validateToken,
  validateUrl
} from "~lib/storage"

function OptionsPage() {
  // 登录状态（是否已有有效配置）
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // 登录方式状态
  const [loginMode, setLoginMode] = useState<LoginMode>(LoginMode.CREDENTIALS)

  // 配置状态
  const [config, setConfig] = useState<Config>({
    gotifyUrl: "http://111.228.1.24:2345/",
    clientToken: "",
    enabled: false,
    features: {
      openTab: true,
      smsNotification: false,
      copyToClipboard: false
    }
  })

  // 凭证状态（仅用于临时输入，不存储）
  const [credentials, setCredentials] = useState<Credentials>({
    username: "",
    password: ""
  })

  // 密码显示状态
  const [showPassword, setShowPassword] = useState(false)

  // 状态信息
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
  const [credentialsErrors, setCredentialsErrors] = useState<{
    username?: string
    password?: string
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

      // 检查是否已登录（有有效的配置）
      setIsLoggedIn(isConfigValid(loadedConfig))

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

  // 验证凭证表单
  const validateCredentialsForm = (): boolean => {
    const newErrors: { url?: string; username?: string; password?: string } = {}

    // 验证 URL
    const urlValidation = validateUrl(config.gotifyUrl)
    if (!urlValidation.valid) {
      newErrors.url = urlValidation.error
    }

    // 验证用户名
    if (!credentials.username.trim()) {
      newErrors.username = "用户名不能为空"
    }

    // 验证密码
    if (!credentials.password.trim()) {
      newErrors.password = "密码不能为空"
    }

    // 设置错误（URL 错误放到 errors，凭证错误放到 credentialsErrors）
    setErrors({ url: newErrors.url })
    setCredentialsErrors({
      username: newErrors.username,
      password: newErrors.password
    })

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

  // 账号密码登录 - 保存配置
  const handleSaveWithCredentials = async () => {
    // 验证凭证表单
    if (!validateCredentialsForm()) {
      return
    }

    try {
      setSaving(true)

      console.log("[Options] 使用账号密码登录并创建客户端")

      // 1. 调用 API 创建客户端
      const { token } = await createClient(
        config.gotifyUrl,
        credentials.username,
        credentials.password
      )

      console.log("[Options] 客户端创建成功，保存 Token")

      // 2. 保存 Token（不保存用户名密码）
      const newConfig: Config = {
        ...config,
        clientToken: token
      }

      await saveConfig(newConfig)

      console.log("[Options] 配置已保存，测试连接...")

      // 3. 自动测试连接
      const testResponse = await sendMessage({
        type: "testConnection",
        data: newConfig
      })

      // 4. 清空密码字段（安全考虑）
      setCredentials({ username: "", password: "" })

      // 5. 重新加载状态
      await loadData()

      // 6. 显示结果
      if (testResponse.success) {
        alert("登录成功！客户端已创建，连接测试通过 ✓")
      } else {
        alert(
          `登录成功，但连接测试失败: ${testResponse.error || "未知错误"}\n\n请检查网络或在 Popup 中重新连接。`
        )
      }
    } catch (error: any) {
      console.error("[Options] 登录失败:", error)
      alert(`登录失败: ${error.message || error}`)
    } finally {
      setSaving(false)
    }
  }

  // 注销（清除配置）
  const handleLogout = async () => {
    if (!confirm("确定要注销吗？这将清除所有配置信息。")) {
      return
    }

    try {
      // 清空配置（但保留默认服务器地址）
      const emptyConfig: Config = {
        gotifyUrl: "http://111.228.1.24:2345/",
        clientToken: "",
        enabled: false
      }

      await saveConfig(emptyConfig)

      // 更新状态
      setConfig(emptyConfig)
      setIsLoggedIn(false)

      // 清空表单
      setCredentials({ username: "", password: "" })
      setErrors({})
      setCredentialsErrors({})

      alert("已注销")
    } catch (error) {
      console.error("注销失败:", error)
      alert("注销失败: " + error)
    }
  }

  // 重新登录（切换到登录界面）
  const handleRelogin = () => {
    setIsLoggedIn(false)
    // 清空表单，但保留服务器地址
    setCredentials({ username: "", password: "" })
    setErrors({})
    setCredentialsErrors({})
  }

  // 处理功能开关切换
  const handleFeatureToggle = async (
    feature: keyof FeatureToggles,
    enabled: boolean
  ) => {
    const newConfig = {
      ...config,
      features: {
        ...config.features,
        [feature]: enabled
      }
    }

    try {
      await saveConfig(newConfig)
      setConfig(newConfig)
      console.log(`[Options] 功能 ${feature} ${enabled ? "已启用" : "已禁用"}`)
    } catch (error) {
      console.error(`[Options] 更新功能开关失败:`, error)
      alert(`操作失败: ${error}`)
    }
  }

  // 隐藏 Token 中间部分（显示前4位和后4位）
  const maskToken = (token: string) => {
    if (token.length <= 8) return token
    return `${token.slice(0, 4)}••••••••${token.slice(-4)}`
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
      <h2 style={styles.title}>Droplink 设置</h2>

      {/* 根据登录状态显示不同内容 */}
      {isLoggedIn ? (
        // 已登录状态 - 显示配置信息
        <div style={styles.form}>
          <div style={styles.infoCard}>
            <div style={styles.infoHeader}>
              <span style={styles.infoTitle}>✓ 配置已保存</span>
            </div>

            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>服务器地址:</span>
              <span style={styles.infoValue}>{config.gotifyUrl}</span>
            </div>

            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>客户端 Token:</span>
              <span style={styles.infoValue}>{maskToken(config.clientToken)}</span>
            </div>
          </div>

          {/* 功能开关区域 */}
          <div
            style={{
              marginTop: 20,
              padding: 16,
              backgroundColor: "#f5f5f5",
              borderRadius: 6
            }}>
            <h4 style={{ marginTop: 0, marginBottom: 12 }}>功能设置</h4>

            <label
              style={{
                display: "block",
                marginBottom: 12,
                cursor: "pointer"
              }}>
              <input
                type="checkbox"
                checked={config.features.openTab}
                onChange={(e) => handleFeatureToggle("openTab", e.target.checked)}
                style={{ marginRight: 8 }}
              />
              自动打开标签页
            </label>

            <label
              style={{
                display: "block",
                marginBottom: 12,
                cursor: "pointer"
              }}>
              <input
                type="checkbox"
                checked={config.features.smsNotification}
                onChange={(e) =>
                  handleFeatureToggle("smsNotification", e.target.checked)
                }
                style={{ marginRight: 8 }}
              />
              短信通知（显示通知 + 复制验证码）
            </label>

            <label style={{ display: "block", opacity: 0.5 }}>
              <input type="checkbox" disabled style={{ marginRight: 8 }} />
              复制到剪贴板（即将推出）
            </label>
          </div>

          <div style={styles.actionButtons}>
            <button onClick={handleRelogin} style={styles.reloginButton}>
              🔄 重新登录
            </button>
            <button onClick={handleLogout} style={styles.logoutButton}>
              🚪 注销
            </button>
          </div>

          <div style={styles.helpText}>
            <p>提示:</p>
            <ul style={styles.helpList}>
              <li>点击"重新登录"可以使用新的账号密码或 Token 重新配置</li>
              <li>点击"注销"将清除所有配置信息</li>
              <li>在扩展弹出窗口中可以启用/禁用 Droplink 和查看连接状态</li>
            </ul>
          </div>
        </div>
      ) : (
        // 未登录状态 - 显示登录表单
        <>
          {/* 登录方式标签 */}
          <div style={styles.tabContainer}>
        <button
          onClick={() => setLoginMode(LoginMode.CREDENTIALS)}
          style={{
            ...styles.tab,
            ...(loginMode === LoginMode.CREDENTIALS ? styles.tabActive : {})
          }}>
          账号密码登录
        </button>
        <button
          onClick={() => setLoginMode(LoginMode.TOKEN)}
          style={{
            ...styles.tab,
            ...(loginMode === LoginMode.TOKEN ? styles.tabActive : {})
          }}>
          Token 登录
        </button>
      </div>

      <div style={styles.form}>
        {/* 服务器地址（两种模式共享） */}
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

        {/* 根据登录方式显示不同的表单 */}
        {loginMode === LoginMode.CREDENTIALS ? (
          <>
            {/* 账号密码登录表单 */}
            <div style={styles.field}>
              <label style={styles.label}>用户名:</label>
              <input
                type="text"
                placeholder="admin"
                value={credentials.username}
                onChange={(e) =>
                  setCredentials((prev) => ({ ...prev, username: e.target.value }))
                }
                style={{
                  ...styles.input,
                  ...(credentialsErrors.username ? styles.inputError : {})
                }}
              />
              {credentialsErrors.username && (
                <div style={styles.errorText}>{credentialsErrors.username}</div>
              )}
            </div>

            <div style={styles.field}>
              <label style={styles.label}>密码:</label>
              <div style={styles.passwordContainer}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials((prev) => ({ ...prev, password: e.target.value }))
                  }
                  style={{
                    ...styles.input,
                    ...(credentialsErrors.password ? styles.inputError : {}),
                    flex: 1
                  }}
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.toggleButton}>
                  {showPassword ? "隐藏" : "显示"}
                </button>
              </div>
              {credentialsErrors.password && (
                <div style={styles.errorText}>{credentialsErrors.password}</div>
              )}
            </div>

            {/* HTTPS 安全提示 */}
            {config.gotifyUrl && !config.gotifyUrl.startsWith("https://") && (
              <div style={styles.warningText}>
                ⚠️ 建议使用 HTTPS 确保密码安全
              </div>
            )}
          </>
        ) : (
          <>
            {/* Token 登录表单 */}
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
          </>
        )}

        {/* 按钮 */}
        <div style={styles.buttonContainer}>
          {loginMode === LoginMode.CREDENTIALS ? (
            // 账号密码模式：只有一个"登录并保存"按钮
            <button
              onClick={handleSaveWithCredentials}
              disabled={saving}
              style={{
                ...styles.button,
                ...styles.saveButton,
                ...(saving ? styles.buttonDisabled : {}),
                flex: 1
              }}>
              {saving ? "登录中..." : "登录并保存"}
            </button>
          ) : (
            // Token 模式：有"测试连接"和"保存"两个按钮
            <>
              <button
                onClick={handleTest}
                disabled={testing}
                style={{
                  ...styles.button,
                  ...styles.testButton,
                  ...(testing ? styles.buttonDisabled : {})
                }}>
                {testing ? "测试中..." : "测试连接"}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  ...styles.button,
                  ...styles.saveButton,
                  ...(saving ? styles.buttonDisabled : {})
                }}>
                {saving ? "保存中..." : "保存"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* 帮助文本 */}
      <div style={styles.helpText}>
        <p>提示:</p>
        {loginMode === LoginMode.CREDENTIALS ? (
          <ul style={styles.helpList}>
            <li>使用 Gotify 管理员账号密码登录</li>
            <li>扩展将自动创建客户端并获取 Token</li>
            <li>用户名和密码仅用于一次性创建客户端，不会被存储</li>
            <li>建议使用 HTTPS 确保密码安全</li>
            <li>配置保存后，请在扩展弹出窗口中启用 Droplink</li>
          </ul>
        ) : (
          <ul style={styles.helpList}>
            <li>在 Gotify 设置中创建一个客户端，获取客户端 Token</li>
            <li>Token 将用于 WebSocket 连接接收实时消息</li>
            <li>配置保存后，请在扩展弹出窗口中启用 Droplink</li>
          </ul>
        )}
      </div>
        </>
      )}
    </div>
  )
}

// 样式
const styles: Record<string, React.CSSProperties> = {
  container: {
    width: 600,
    maxWidth: "90%",
    margin: "40px auto",
    padding: 30,
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#fff",
    borderRadius: 8,
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    marginTop: 0,
    color: "#333"
  },
  tabContainer: {
    display: "flex",
    borderBottom: "2px solid #e0e0e0",
    marginBottom: 16
  },
  tab: {
    flex: 1,
    padding: 12,
    fontSize: 14,
    fontWeight: "500",
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
    color: "#666",
    borderBottom: "2px solid transparent",
    marginBottom: -2,
    transition: "all 0.2s"
  },
  tabActive: {
    color: "#2196f3",
    borderBottomColor: "#2196f3"
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
  errorText: {
    fontSize: 12,
    color: "#f44336"
  },
  infoCard: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 20,
    marginBottom: 16
  },
  infoHeader: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottom: "2px solid #4caf50"
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4caf50"
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 12,
    padding: 8,
    backgroundColor: "#fff",
    borderRadius: 4
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#777",
    minWidth: 120
  },
  infoValue: {
    fontSize: 14,
    color: "#333",
    wordBreak: "break-all",
    flex: 1,
    textAlign: "right"
  },
  actionButtons: {
    display: "flex",
    gap: 12,
    marginBottom: 16
  },
  reloginButton: {
    flex: 1,
    padding: 12,
    fontSize: 14,
    fontWeight: "500",
    border: "none",
    borderRadius: 8,
    backgroundColor: "#2196f3",
    color: "white",
    cursor: "pointer",
    transition: "background-color 0.2s"
  },
  logoutButton: {
    flex: 1,
    padding: 12,
    fontSize: 14,
    fontWeight: "500",
    border: "none",
    borderRadius: 8,
    backgroundColor: "#f44336",
    color: "white",
    cursor: "pointer",
    transition: "background-color 0.2s"
  },
  warningText: {
    fontSize: 12,
    color: "#ff9800",
    backgroundColor: "#fff3e0",
    padding: 8,
    borderRadius: 4,
    marginTop: 8
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

export default OptionsPage
