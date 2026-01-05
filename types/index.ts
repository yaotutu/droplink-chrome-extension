/**
 * Droplink 扩展的类型定义
 */

/**
 * Gotify 服务器配置
 */
export interface Config {
  /** Gotify 服务器地址，如 "https://gotify.example.com" */
  gotifyUrl: string
  /** 客户端 Token（用于 WebSocket 连接） */
  clientToken: string
  /** 是否启用 Droplink 功能 */
  enabled: boolean
}

/**
 * Gotify 消息结构
 */
export interface GotifyMessage {
  /** 消息 ID */
  id: number
  /** 应用 ID */
  appid: number
  /** 消息内容 */
  message: string
  /** 消息标题 */
  title: string
  /** 优先级 */
  priority: number
  /** 消息时间 */
  date: string
  /** 扩展字段 */
  extras?: {
    /** Droplink 自定义字段 */
    droplink?: DroplinkMessage
    /** 其他扩展字段 */
    [key: string]: any
  }
}

/**
 * Droplink 消息格式
 */
export interface DroplinkMessage {
  /** 操作类型 */
  action: "openTab"
  /** 要打开的 URL */
  url: string
  /** 可选配置 */
  options?: {
    /** 是否激活标签页，默认 true */
    activate?: boolean
  }
}

/**
 * 连接状态
 */
export enum ConnectionStatus {
  /** 未连接 */
  DISCONNECTED = "disconnected",
  /** 连接中 */
  CONNECTING = "connecting",
  /** 已连接 */
  CONNECTED = "connected",
  /** 连接失败 */
  ERROR = "error"
}

/**
 * 后台脚本与 popup 之间的消息类型
 */
export interface RuntimeMessage {
  /** 消息类型 */
  type:
    | "getConfig"
    | "saveConfig"
    | "getStatus"
    | "testConnection"
    | "disconnect"
    | "reconnect"
  /** 消息数据 */
  data?: any
}

/**
 * 后台脚本响应类型
 */
export interface RuntimeResponse {
  /** 是否成功 */
  success: boolean
  /** 响应数据 */
  data?: any
  /** 错误信息 */
  error?: string
}

/**
 * 连接状态信息
 */
export interface StatusInfo {
  /** 连接状态 */
  status: ConnectionStatus
  /** 配置是否有效 */
  configValid: boolean
  /** 最后连接时间 */
  lastConnected?: string
  /** 错误信息 */
  error?: string
}
