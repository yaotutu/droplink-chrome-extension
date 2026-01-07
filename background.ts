/**
 * 后台服务脚本
 * 协调各模块，实现消息监听和处理
 */

import type {
  Config,
  RuntimeMessage,
  RuntimeResponse,
  StatusInfo
} from "~types"

import { ConnectionStatus } from "~types"

import { GotifyClient } from "./lib/gotify-client"
import { OpenTabHandler, SmsNotificationHandler } from "./lib/handlers"
import { MessageRouter } from "./lib/message-router"
import { getConfig, isConfigValid, onConfigChange } from "./lib/storage"

// 全局 Gotify 客户端实例
let gotifyClient: GotifyClient | null = null

// 连接状态信息
let statusInfo: StatusInfo = {
  status: ConnectionStatus.DISCONNECTED,
  configValid: false
}

// 创建消息路由器
const router = new MessageRouter()
router.register(new OpenTabHandler())
router.register(new SmsNotificationHandler())

/**
 * 初始化扩展
 */
async function initialize(): Promise<void> {
  console.log("[Background] 初始化 Droplink 扩展")

  // 读取配置
  const config = await getConfig()
  console.log("[Background] 已读取配置:", {
    ...config,
    clientToken: "***"
  })

  // 检查配置是否有效
  statusInfo.configValid = isConfigValid(config)

  // 设置路由器配置
  router.setConfig(config)

  // 如果配置有效且启用，则连接
  if (statusInfo.configValid && config.enabled) {
    await connectToGotify(config)
  } else {
    console.log("[Background] 配置无效或未启用，不连接")
  }

  // 监听配置变化
  onConfigChange(handleConfigChange)

  console.log("[Background] 初始化完成")
}

/**
 * 连接到 Gotify 服务器
 */
async function connectToGotify(config: Config): Promise<void> {
  try {
    // 如果已有客户端实例，先断开
    if (gotifyClient) {
      gotifyClient.disconnect()
    }

    // 创建新的客户端实例
    gotifyClient = new GotifyClient()

    // 注册消息处理器 - 使用路由器
    gotifyClient.onMessage((message) => {
      router.route(message).catch((error) => {
        console.error("[Background] 路由消息时出错:", error)
      })
    })

    // 注册状态变化处理器
    gotifyClient.onStatusChange((status) => {
      statusInfo.status = status

      if (status === ConnectionStatus.CONNECTED) {
        statusInfo.lastConnected = new Date().toISOString()
        statusInfo.error = undefined
      } else if (status === ConnectionStatus.ERROR) {
        statusInfo.error = "连接失败"
      }

      console.log(`[Background] 连接状态: ${status}`)
    })

    // 连接到服务器
    await gotifyClient.connect(config)
  } catch (error) {
    console.error("[Background] 连接 Gotify 失败:", error)
    statusInfo.status = ConnectionStatus.ERROR
    statusInfo.error = String(error)
  }
}

/**
 * 断开 Gotify 连接
 */
function disconnectFromGotify(): void {
  if (gotifyClient) {
    gotifyClient.disconnect()
    gotifyClient = null
  }

  statusInfo.status = ConnectionStatus.DISCONNECTED
  statusInfo.error = undefined
}

/**
 * 处理配置变化
 */
async function handleConfigChange(
  newConfig: Config,
  oldConfig: Config
): Promise<void> {
  console.log("[Background] 配置已更新")

  // 更新配置有效性
  statusInfo.configValid = isConfigValid(newConfig)

  // 更新路由器配置
  router.setConfig(newConfig)

  // 如果配置有实质性变化，需要重连
  const needReconnect =
    newConfig.gotifyUrl !== oldConfig.gotifyUrl ||
    newConfig.clientToken !== oldConfig.clientToken ||
    newConfig.enabled !== oldConfig.enabled

  if (needReconnect) {
    console.log("[Background] 配置变化，重新连接")

    // 先断开旧连接
    disconnectFromGotify()

    // 如果新配置有效且启用，则连接
    if (statusInfo.configValid && newConfig.enabled) {
      await connectToGotify(newConfig)
    }
  }
}

/**
 * 处理来自 popup 的消息
 */
chrome.runtime.onMessage.addListener(
  (
    message: RuntimeMessage,
    sender,
    sendResponse: (response: RuntimeResponse) => void
  ) => {
    // 异步处理消息
    ;(async () => {
      try {
        switch (message.type) {
          case "getConfig":
            const config = await getConfig()
            sendResponse({
              success: true,
              data: config
            })
            break

          case "saveConfig":
            // 配置会通过 storage.onChanged 自动触发重连
            sendResponse({
              success: true
            })
            break

          case "getStatus":
            sendResponse({
              success: true,
              data: statusInfo
            })
            break

          case "testConnection":
            const testConfig = message.data as Config
            if (!isConfigValid(testConfig)) {
              sendResponse({
                success: false,
                error: "配置无效"
              })
              return
            }

            // 创建临时客户端测试连接
            const testClient = new GotifyClient()
            let testSuccess = false

            testClient.onStatusChange((status) => {
              if (status === ConnectionStatus.CONNECTED) {
                testSuccess = true
                testClient.disconnect()
                sendResponse({
                  success: true,
                  data: { connected: true }
                })
              } else if (status === ConnectionStatus.ERROR) {
                testClient.disconnect()
                sendResponse({
                  success: false,
                  error: "连接失败"
                })
              }
            })

            await testClient.connect(testConfig)

            // 10 秒超时
            setTimeout(() => {
              if (!testSuccess) {
                testClient.disconnect()
                sendResponse({
                  success: false,
                  error: "连接超时"
                })
              }
            }, 10000)

            // 返回 true 表示会异步发送响应
            return true

          case "disconnect":
            disconnectFromGotify()
            sendResponse({
              success: true
            })
            break

          case "reconnect":
            const currentConfig = await getConfig()
            if (isConfigValid(currentConfig) && currentConfig.enabled) {
              await connectToGotify(currentConfig)
              sendResponse({
                success: true
              })
            } else {
              sendResponse({
                success: false,
                error: "配置无效或未启用"
              })
            }
            break

          default:
            sendResponse({
              success: false,
              error: "未知消息类型"
            })
        }
      } catch (error) {
        console.error("[Background] 处理消息失败:", error)
        sendResponse({
          success: false,
          error: String(error)
        })
      }
    })()

    // 返回 true 表示会异步发送响应
    return true
  }
)

// 扩展启动时初始化
initialize()

// 导出供测试使用
export { connectToGotify, disconnectFromGotify, initialize }
