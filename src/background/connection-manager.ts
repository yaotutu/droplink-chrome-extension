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
   */
  async connect(config: Config): Promise<void> {
    // 如果已存在连接，先断开
    if (this.client) {
      console.log("[ConnectionManager] 断开旧连接")
      this.client.disconnect()
      this.client = null // 显式释放引用，确保旧客户端被垃圾回收
    }

    this.client = new GotifyClient()

    // 注册消息处理器
    this.client.onMessage((message) => {
      this.router.route(message).catch((error) => {
        console.error("[ConnectionManager] 路由消息失败:", error)
      })
    })

    // 注册状态变化处理器
    this.client.onStatusChange((status) => {
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

    // 建立连接
    await this.client.connect(config)
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    console.log("[ConnectionManager] 断开连接")
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
