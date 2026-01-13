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
  /** 打开标签页时是否显示通知 */
  openTabNotification: boolean
  /** 显示所有 Gotify 通知 */
  showAllNotifications: boolean
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
 * Droplink Action 定义
 */
export interface DroplinkAction {
  /** 操作类型，目前只处理 "openTab" */
  type: string
  /** 操作参数 */
  params?: {
    /** 是否激活标签页，默认 true */
    activate?: boolean
    [key: string]: any
  }
}

/**
 * Droplink 消息（新格式）
 */
export interface DroplinkMessage {
  /** 消息唯一标识 */
  id?: string
  /** 时间戳 */
  timestamp?: number
  /** 发送者 */
  sender?: string
  /** 内容 */
  content: {
    /** 内容类型，当前只支持 "url" */
    type: "url"
    /** 内容值（URL） */
    value: string
  }
  /** 操作列表 */
  actions: DroplinkAction[]
  /** 元数据 */
  metadata?: {
    /** 标签 */
    tags?: string[]
    [key: string]: any
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
  /** 重连中 */
  RECONNECTING = "reconnecting",
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

/**
 * 钩子上下文
 */
export interface HookContext {
  /** Gotify 原始消息 */
  message: GotifyMessage
  /** 消息动作类型（如 "openTab"） */
  action: string
  /** 是否已被取消（pre-process 钩子可设置） */
  cancelled?: boolean
  /** 处理结果（post-process 钩子可用） */
  result?: {
    success: boolean
    error?: string
  }
}

/**
 * 钩子处理函数
 */
export type HookFn = (context: HookContext) => void | Promise<void>
