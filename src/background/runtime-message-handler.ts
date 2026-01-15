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

    try {
      // connect() 现在会等待连接真正建立
      await testClient.connect(config)
      testClient.disconnect()
      return { success: true, data: { connected: true } }
    } catch (error) {
      testClient.disconnect()
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }
    }
  }

  /**
   * 重连
   */
  private async handleReconnect(): Promise<RuntimeResponse> {
    try {
      console.log("[RuntimeMessageHandler] 收到重连请求")

      const config = await getConfig()
      if (!isConfigValid(config)) {
        console.error("[RuntimeMessageHandler] 配置无效")
        return { success: false, error: "配置无效" }
      }

      console.log("[RuntimeMessageHandler] 配置有效，开始重连...")

      // 先断开旧连接（如果存在）
      this.connectionManager.disconnect()

      // 建立新连接
      await this.connectionManager.connect(config)

      console.log("[RuntimeMessageHandler] 重连成功")
      return { success: true }
    } catch (error) {
      console.error("[RuntimeMessageHandler] 重连失败:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }
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
