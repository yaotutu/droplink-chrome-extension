/**
 * 后台服务脚本
 * 协调各模块，实现消息监听和处理
 */

import type { Config } from "~/shared/types"
import { getConfig, isConfigValid, onConfigChange } from "~/core/storage"
import { MessageRouter } from "~/core/messaging/router"
import { OpenTabHandler } from "~/core/messaging/handlers"
import { ConnectionManager } from "./background/connection-manager"
import { RuntimeMessageHandler } from "./background/runtime-message-handler"

// 初始化路由器
const router = new MessageRouter()
router.register(new OpenTabHandler())

// 初始化连接管理器
const connectionManager = new ConnectionManager(router)

// 初始化消息处理器
const messageHandler = new RuntimeMessageHandler(connectionManager)

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

  // 设置路由器配置
  router.setConfig(config)

  // 检查配置是否有效
  const configValid = isConfigValid(config)
  connectionManager.updateConfigValidity(configValid)

  // 如果配置有效，则连接
  if (configValid) {
    await connectionManager.connect(config)
  } else {
    console.log("[Background] 配置无效，不连接")
  }

  // 监听配置变化
  onConfigChange(handleConfigChange)

  console.log("[Background] 初始化完成")
}

/**
 * 处理配置变化
 */
async function handleConfigChange(
  newConfig: Config,
  oldConfig: Config
): Promise<void> {
  console.log("[Background] 配置已更新")

  // 更新路由器配置
  router.setConfig(newConfig)

  // 更新配置有效性
  const configValid = isConfigValid(newConfig)
  connectionManager.updateConfigValidity(configValid)

  // 如果配置有实质性变化，需要重连
  const needReconnect =
    newConfig.gotifyUrl !== oldConfig.gotifyUrl ||
    newConfig.clientToken !== oldConfig.clientToken

  if (needReconnect) {
    console.log("[Background] 配置变化，重新连接")

    // 先断开旧连接
    connectionManager.disconnect()

    // 如果新配置有效，则连接
    if (configValid) {
      await connectionManager.connect(newConfig)
    }
  }
}

/**
 * 处理来自 popup 和 options 的消息
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  messageHandler.handle(message).then(sendResponse)
  return true // 表示会异步发送响应
})

// 扩展启动时初始化
initialize()

// 导出供测试使用
export { initialize, connectionManager, messageHandler }
