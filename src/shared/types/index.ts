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
 * Droplink 消息操作类型
 */
export type DroplinkAction = "openTab" | "notification"

/**
 * 打开标签页消息
 */
export interface OpenTabMessage {
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
 * 通知消息
 */
export interface NotificationMessage {
  /** 操作类型 */
  action: "notification"
  /** 通知内容 */
  content: string
  /** 标题（可选） */
  title?: string
  /** 验证码（可选，自动提取） */
  verificationCode?: string
}

/**
 * Droplink 消息联合类型
 */
export type DroplinkMessage = OpenTabMessage | NotificationMessage

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

/**
 * Gotify 客户端响应
 */
export interface GotifyClient {
  /** 客户端 ID */
  id: number
  /** 客户端 Token */
  token: string
  /** 客户端名称 */
  name: string
  /** 最后使用时间 */
  lastUsed?: string
}

/**
 * 创建客户端请求参数
 */
export interface CreateClientParams {
  /** 客户端名称 */
  name: string
}

/**
 * 认证凭证（仅用于临时传递，不存储）
 */
export interface Credentials {
  /** 用户名 */
  username: string
  /** 密码 */
  password: string
}

/**
 * 登录方式
 */
export enum LoginMode {
  /** 账号密码登录 */
  CREDENTIALS = "credentials",
  /** Token 登录 */
  TOKEN = "token"
}

/**
 * 钩子上下文
 */
export interface HookContext {
  /** Gotify 原始消息 */
  message: GotifyMessage
  /** 消息动作类型 */
  action: DroplinkAction
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
