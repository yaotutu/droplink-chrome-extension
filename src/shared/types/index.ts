/**
 * Droplink 扩展的类型定义
 */

/**
 * Gotify 服务器配置
 */
export interface Config {
  /** Gotify 服务器地址，如 "https://gotify.example.com" */
  gotifyUrl: string
  /** 客户端 Token（用于 WebSocket 连接，接收消息） */
  clientToken: string
  /** 应用 Token（用于 HTTP API，发送消息） */
  appToken: string
  /** 打开标签页时是否显示通知 */
  openTabNotification: boolean
  /** 显示所有 Gotify 通知 */
  showAllNotifications: boolean
  /** 是否启用历史消息恢复（默认 true） */
  enableHistorySync: boolean
  /** 拉取历史消息数量（默认 100，范围 1-200） */
  fetchHistoryLimit: number
  /** 最大打开标签页数量（默认 10，范围 1-50） */
  maxOpenTabs: number
  /** 批量打开间隔（毫秒，默认 300） */
  batchOpenInterval: number
  /** 是否显示批量打开完成通知（默认 true） */
  showBatchNotification: boolean
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
  /**
   * 处理端标识（v2.0 新增）
   * - 未指定或 "chrome"：由 Chrome Extension 处理
   * - "notion-worker"：由 Notion Worker 处理
   * - 其他值：由对应的处理端处理
   */
  handler?: string
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

/**
 * 二维码登录数据结构
 */
export interface QRLoginData {
  /** 数据格式版本 */
  version: string
  /** 数据类型标识 */
  type: "droplink_qr_login"
  /** 生成时间戳 */
  timestamp: number
  /** 配置数据 */
  data: {
    /** Gotify 服务器地址 */
    gotifyServerUrl: string
    /** 应用 Token（用于发送消息） */
    appToken: string
    /** 客户端 Token（用于接收消息） */
    clientToken: string
    /** 服务器名称：selfHost（自建）或 officialServer（官方） */
    serverName: "selfHost" | "officialServer"
  }
}
