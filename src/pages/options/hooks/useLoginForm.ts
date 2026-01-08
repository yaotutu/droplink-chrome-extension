/**
 * 登录表单逻辑 Hook
 */

import { useState } from "react"
import type { Config } from "~/shared/types"
import { createClient } from "~/core/gotify/auth"
import { useConfig } from "~/shared/hooks/useConfig"
import { useRuntimeMessage } from "~/shared/hooks/useRuntimeMessage"

export type LoginMode = "credentials" | "token"

export interface Credentials {
  username: string
  password: string
}

export function useLoginForm() {
  const [loginMode, setLoginMode] = useState<LoginMode>("credentials")
  const [credentials, setCredentials] = useState<Credentials>({
    username: "",
    password: ""
  })
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving] = useState(false)

  const { config, saveConfig } = useConfig()
  const { sendMessage } = useRuntimeMessage()

  /**
   * 使用账号密码登录
   */
  const handleSaveWithCredentials = async () => {
    if (!credentials.username || !credentials.password) {
      throw new Error("用户名和密码不能为空")
    }

    setSaving(true)
    try {
      // 创建客户端
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

      await saveConfig(newConfig)

      // 测试连接
      const testResponse = await sendMessage({
        type: "testConnection",
        data: newConfig
      })

      if (!testResponse.success) {
        throw new Error(testResponse.error || "连接测试失败")
      }

      // 清空密码
      setCredentials({ username: "", password: "" })

      return true
    } catch (error) {
      throw error
    } finally {
      setSaving(false)
    }
  }

  /**
   * 使用Token登录
   */
  const handleSaveWithToken = async (token: string) => {
    if (!token) {
      throw new Error("Token 不能为空")
    }

    setSaving(true)
    try {
      const newConfig: Config = {
        ...config,
        clientToken: token,
        enabled: true
      }

      // 测试连接
      const testResponse = await sendMessage({
        type: "testConnection",
        data: newConfig
      })

      if (!testResponse.success) {
        throw new Error(testResponse.error || "连接测试失败")
      }

      await saveConfig(newConfig)

      return true
    } catch (error) {
      throw error
    } finally {
      setSaving(false)
    }
  }

  return {
    loginMode,
    setLoginMode,
    credentials,
    setCredentials,
    showPassword,
    setShowPassword,
    saving,
    handleSaveWithCredentials,
    handleSaveWithToken
  }
}
