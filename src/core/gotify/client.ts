/**
 * Gotify WebSocket 客户端
 * 负责与 Gotify 服务器建立 WebSocket 连接并接收消息
 */

import type { Config, GotifyMessage } from "~/shared/types"

import { ConnectionStatus } from "~/shared/types"
import { showWarning } from "~/core/notifications"

/**
 * Gotify WebSocket 客户端类
 */
export class GotifyClient {
  private ws: WebSocket | null = null
  private config: Config | null = null
  private reconnectAttempts = 0
  private maxReconnectDelay = 60000 // 最大重连延迟 60 秒
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private messageHandlers: Array<(message: GotifyMessage) => void> = []
  private statusHandlers: Array<(status: ConnectionStatus) => void> = []
  private currentStatus: ConnectionStatus = ConnectionStatus.DISCONNECTED
  private manualDisconnect = false
  private connectPromise: {
    resolve: () => void
    reject: (error: Error) => void
  } | null = null

  /**
   * 连接到 Gotify 服务器
   * @param config Gotify 配置
   */
  async connect(config: Config): Promise<void> {
    // 清除旧的重连定时器，防止多个定时器同时运行
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    // 如果已经连接，先断开
    if (this.ws) {
      this.disconnect()
    }

    this.config = config
    this.manualDisconnect = false

    // 创建 Promise，等待连接成功或失败
    return new Promise<void>((resolve, reject) => {
      this.connectPromise = { resolve, reject }

      try {
        // 构建 WebSocket URL
        const wsUrl = this.buildWebSocketUrl(
          config.gotifyUrl,
          config.clientToken
        )

        console.log(`[GotifyClient] 连接到: ${config.gotifyUrl}`)
        this.setStatus(ConnectionStatus.CONNECTING)

        // 创建 WebSocket 连接
        this.ws = new WebSocket(wsUrl)

        // 设置连接超时（10 秒）
        const timeout = setTimeout(() => {
          if (
            this.currentStatus === ConnectionStatus.CONNECTING &&
            this.connectPromise
          ) {
            const error = new Error("连接超时")
            this.connectPromise.reject(error)
            this.connectPromise = null
            this.disconnect()
          }
        }, 10000)

        // 连接成功后清除超时
        const originalOnOpen = this.handleOpen.bind(this)
        this.ws.onopen = () => {
          clearTimeout(timeout)
          originalOnOpen()
        }

        // 设置其他事件处理器
        this.ws.onmessage = this.handleMessage.bind(this)
        this.ws.onerror = this.handleError.bind(this)
        this.ws.onclose = this.handleClose.bind(this)
      } catch (error) {
        console.error("[GotifyClient] 连接失败:", error)
        this.setStatus(ConnectionStatus.ERROR)
        if (this.connectPromise) {
          this.connectPromise.reject(
            error instanceof Error ? error : new Error(String(error))
          )
          this.connectPromise = null
        }
        this.scheduleReconnect()
      }
    })
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    console.log("[GotifyClient] 断开连接")
    this.manualDisconnect = true

    // 清除重连定时器
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    // 关闭 WebSocket
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }

    // 清空所有处理器，防止内存泄漏
    this.messageHandlers = []
    this.statusHandlers = []

    this.setStatus(ConnectionStatus.DISCONNECTED)
    this.reconnectAttempts = 0
  }

  /**
   * 注册消息处理器
   */
  onMessage(handler: (message: GotifyMessage) => void): void {
    this.messageHandlers.push(handler)
  }

  /**
   * 移除消息处理器
   */
  offMessage(handler: (message: GotifyMessage) => void): void {
    const index = this.messageHandlers.indexOf(handler)
    if (index > -1) {
      this.messageHandlers.splice(index, 1)
    }
  }

  /**
   * 注册状态变化处理器
   */
  onStatusChange(handler: (status: ConnectionStatus) => void): void {
    this.statusHandlers.push(handler)
  }

  /**
   * 移除状态变化处理器
   */
  offStatusChange(handler: (status: ConnectionStatus) => void): void {
    const index = this.statusHandlers.indexOf(handler)
    if (index > -1) {
      this.statusHandlers.splice(index, 1)
    }
  }

  /**
   * 获取当前连接状态
   */
  getStatus(): ConnectionStatus {
    return this.currentStatus
  }

  /**
   * 是否已连接
   */
  isConnected(): boolean {
    return this.currentStatus === ConnectionStatus.CONNECTED
  }

  /**
   * WebSocket 连接成功
   */
  private handleOpen(): void {
    console.log("[GotifyClient] WebSocket 连接已建立")
    this.setStatus(ConnectionStatus.CONNECTED)
    this.reconnectAttempts = 0

    // 解析 connect() 的 Promise
    if (this.connectPromise) {
      this.connectPromise.resolve()
      this.connectPromise = null
    }
  }

  /**
   * 收到 WebSocket 消息
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data) as GotifyMessage
      console.log("[GotifyClient] 收到消息:", message)

      // 调用所有消息处理器
      this.messageHandlers.forEach((handler) => {
        try {
          handler(message)
        } catch (error) {
          console.error("[GotifyClient] 消息处理器执行失败:", error)
        }
      })
    } catch (error) {
      console.error("[GotifyClient] 解析消息失败:", error)
    }
  }

  /**
   * WebSocket 错误
   */
  private handleError(event: Event): void {
    console.error("[GotifyClient] WebSocket 错误:", event)
    this.setStatus(ConnectionStatus.ERROR)

    // 如果在连接过程中出错，reject Promise
    if (this.connectPromise) {
      this.connectPromise.reject(new Error("WebSocket 连接错误"))
      this.connectPromise = null
    }
  }

  /**
   * WebSocket 连接关闭
   */
  private handleClose(event: CloseEvent): void {
    console.log(
      `[GotifyClient] WebSocket 连接关闭 (代码: ${event.code}, 原因: ${event.reason})`
    )

    this.ws = null

    // 如果在连接过程中关闭，reject Promise
    if (this.connectPromise) {
      this.connectPromise.reject(
        new Error(`连接关闭 (代码: ${event.code})`)
      )
      this.connectPromise = null
    }

    // 如果不是手动断开，则尝试重连
    if (!this.manualDisconnect) {
      this.setStatus(ConnectionStatus.DISCONNECTED)
      this.scheduleReconnect()
    }
  }

  /**
   * 安排重连
   */
  private scheduleReconnect(): void {
    // 如果是手动断开或没有配置，不重连
    if (this.manualDisconnect || !this.config) {
      return
    }

    // 计算重连延迟（指数退避）
    const delay = Math.min(
      1000 * Math.pow(2, this.reconnectAttempts),
      this.maxReconnectDelay
    )

    this.reconnectAttempts++

    console.log(
      `[GotifyClient] 将在 ${delay / 1000} 秒后重连 (第 ${this.reconnectAttempts} 次尝试)`
    )

    // 显示通知
    this.showReconnectNotification(delay / 1000)

    // 设置重连定时器
    this.reconnectTimer = setTimeout(() => {
      console.log("[GotifyClient] 尝试重连...")
      this.connect(this.config!)
    }, delay)
  }

  /**
   * 构建 WebSocket URL
   */
  private buildWebSocketUrl(gotifyUrl: string, clientToken: string): string {
    const url = new URL(gotifyUrl)
    const protocol = url.protocol === "https:" ? "wss:" : "ws:"
    const host = url.host
    const path = url.pathname.endsWith("/")
      ? url.pathname + "stream"
      : url.pathname + "/stream"

    return `${protocol}//${host}${path}?token=${clientToken}`
  }

  /**
   * 设置连接状态
   */
  private setStatus(status: ConnectionStatus): void {
    if (this.currentStatus !== status) {
      this.currentStatus = status
      console.log(`[GotifyClient] 状态变更: ${status}`)

      // 调用所有状态处理器
      this.statusHandlers.forEach((handler) => {
        try {
          handler(status)
        } catch (error) {
          console.error("[GotifyClient] 状态处理器执行失败:", error)
        }
      })
    }
  }

  /**
   * 显示重连通知
   */
  private showReconnectNotification(seconds: number): void {
    showWarning(
      "Droplink 连接断开",
      `将在 ${seconds} 秒后尝试重新连接`
    ).catch((error) => {
      console.error("[GotifyClient] 显示重连通知失败:", error)
    })
  }
}
