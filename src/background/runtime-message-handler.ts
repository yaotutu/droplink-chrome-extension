/**
 * Runtime 消息处理器
 * 负责处理来自 popup 和 options 页面的消息
 */

import type { RuntimeMessage, RuntimeResponse, Config } from "~/shared/types"
import { getConfig, isConfigValid } from "~/core/storage"
import { GotifyClient } from "~/core/gotify/client"
import { ConnectionStatus } from "~/shared/types"
import { ConnectionManager } from "./connection-manager"

export class RuntimeMessageHandler {
  constructor(private connectionManager: ConnectionManager) {}

  /**
   * 处理 runtime 消息
   */
  async handle(message: RuntimeMessage): Promise<RuntimeResponse> {
    try {
      switch (message.type) {
        case "getConfig":
          return await this.handleGetConfig()

        case "getStatus":
          return await this.handleGetStatus()

        case "testConnection":
          return await this.handleTestConnection(message.data as Config)

        case "reconnect":
          return await this.handleReconnect()

        case "disconnect":
          return await this.handleDisconnect()

        default:
          return { success: false, error: "未知消息类型" }
      }
    } catch (error) {
      console.error("[RuntimeMessageHandler] 处理消息失败:", error)
      return { success: false, error: String(error) }
    }
  }

  /**
   * 获取配置
   */
  private async handleGetConfig(): Promise<RuntimeResponse> {
    try {
      const config = await getConfig()
      return { success: true, data: config }
    } catch (error) {
      return { success: false, error: "获取配置失败" }
    }
  }

  /**
   * 获取状态
   */
  private async handleGetStatus(): Promise<RuntimeResponse> {
    try {
      const status = this.connectionManager.getStatus()
      return { success: true, data: status }
    } catch (error) {
      return { success: false, error: "获取状态失败" }
    }
  }

  /**
   * 测试连接
   */
  private async handleTestConnection(config: Config): Promise<RuntimeResponse> {
    if (!isConfigValid(config)) {
      return { success: false, error: "配置无效" }
    }

    const testClient = new GotifyClient()
    let testSuccess = false

    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        if (!testSuccess) {
          testClient.disconnect()
          resolve({ success: false, error: "连接超时" })
        }
      }, 10000)

      testClient.onStatusChange((status) => {
        if (status === ConnectionStatus.CONNECTED) {
          testSuccess = true
          clearTimeout(timeoutId)
          testClient.disconnect()
          resolve({ success: true, data: { connected: true } })
        } else if (status === ConnectionStatus.ERROR) {
          clearTimeout(timeoutId)
          testClient.disconnect()
          resolve({ success: false, error: "连接失败" })
        }
      })

      testClient.connect(config).catch((error) => {
        clearTimeout(timeoutId)
        testClient.disconnect()
        resolve({ success: false, error: String(error) })
      })
    })
  }

  /**
   * 重连
   */
  private async handleReconnect(): Promise<RuntimeResponse> {
    try {
      const config = await getConfig()
      if (!isConfigValid(config) || !config.enabled) {
        return { success: false, error: "配置无效或未启用" }
      }

      await this.connectionManager.connect(config)
      return { success: true }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  /**
   * 断开连接
   */
  private async handleDisconnect(): Promise<RuntimeResponse> {
    try {
      this.connectionManager.disconnect()
      return { success: true }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }
}
