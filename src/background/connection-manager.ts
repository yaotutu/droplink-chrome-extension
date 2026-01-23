/**
 * 连接管理器
 * 负责管理 Gotify WebSocket 连接和状态
 */

import type { Config, StatusInfo } from "~/shared/types"
import { ConnectionStatus } from "~/shared/types"
import { GotifyClient } from "~/core/gotify/client"
import { MessageRouter } from "~/core/messaging/router"
import { IconManager } from "./icon-manager"
import type { HistorySyncManager } from "./history-sync-manager"

export class ConnectionManager {
  private client: GotifyClient | null = null
  private connectPromise: Promise<void> | null = null // 用于防止并发连接
  private statusInfo: StatusInfo = {
    status: ConnectionStatus.DISCONNECTED,
    configValid: false
  }
  private iconManager: IconManager

  constructor(
    private router: MessageRouter,
    private historySyncManager?: HistorySyncManager // 可选依赖
  ) {
    this.iconManager = new IconManager()
    // 初始化时更新图标
    this.updateIcon()
  }

  /**
   * 连接到 Gotify 服务器
   * 如果已有连接操作在进行中，返回现有的 Promise
   */
  async connect(config: Config): Promise<void> {
    // 如果正在连接，返回现有的 Promise
    if (this.connectPromise) {
      console.log("[ConnectionManager] 连接正在进行中，等待完成")
      return this.connectPromise
    }

    this.connectPromise = this._doConnect(config)
    try {
      await this.connectPromise
    } finally {
      this.connectPromise = null
    }
  }

  /**
   * 实际的连接逻辑
   */
  private async _doConnect(config: Config): Promise<void> {
    // 如果已存在连接，先断开
    if (this.client) {
      console.log("[ConnectionManager] 断开旧连接")
      this.client.disconnect()
      this.client = null // 显式释放引用，确保旧客户端被垃圾回收
    }

    console.log("[ConnectionManager] 创建新的 Gotify 客户端")
    const newClient = new GotifyClient()

    // 注册消息处理器
    newClient.onMessage((message) => {
      this.router.route(message).catch((error) => {
        console.error("[ConnectionManager] 路由消息失败:", error)
      })
    })

    // 注册状态变化处理器
    newClient.onStatusChange((status) => {
      this.statusInfo.status = status
      if (status === ConnectionStatus.CONNECTED) {
        this.statusInfo.lastConnected = new Date().toISOString()
        this.statusInfo.error = undefined

        // ✅ 核心触发点：WebSocket 连接成功时触发历史同步
        if (this.historySyncManager) {
          console.log("[ConnectionManager] WebSocket 连接成功，触发历史同步")
          this.historySyncManager.sync().catch((error) => {
            console.error("[ConnectionManager] 历史同步失败:", error)
          })
        }
      } else if (status === ConnectionStatus.ERROR) {
        this.statusInfo.error = "连接失败"
      }
      // 状态变化时更新图标
      this.updateIcon()
    })

    try {
      // 尝试建立连接
      console.log("[ConnectionManager] 开始连接到 Gotify 服务器")
      await newClient.connect(config)

      // 连接成功后才设置 this.client
      this.client = newClient
      console.log("[ConnectionManager] 连接成功")
    } catch (error) {
      // 连接失败，清理客户端
      console.error("[ConnectionManager] 连接失败:", error)
      newClient.disconnect()
      throw error
    }
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    console.log("[ConnectionManager] 断开连接")
    this.connectPromise = null // 清除连接 Promise
    if (this.client) {
      this.client.disconnect()
      this.client = null
    }
    this.statusInfo.status = ConnectionStatus.DISCONNECTED
    this.updateIcon()
  }

  /**
   * 获取当前状态
   */
  getStatus(): StatusInfo {
    return { ...this.statusInfo }
  }

  /**
   * 更新配置有效性
   */
  updateConfigValidity(valid: boolean): void {
    this.statusInfo.configValid = valid
    this.updateIcon()
  }

  /**
   * 是否已连接
   */
  isConnected(): boolean {
    return this.client?.isConnected() ?? false
  }

  /**
   * 更新图标徽章
   */
  private updateIcon(): void {
    this.iconManager.updateIcon(this.statusInfo.status, this.statusInfo.configValid)
  }
}
