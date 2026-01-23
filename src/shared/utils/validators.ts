/**
 * 验证工具函数
 * 提供统一的数据验证逻辑
 */

/**
 * 基础 URL 验证
 * 检查 URL 是否以 http:// 或 https:// 开头
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== "string") {
    return false
  }

  const trimmedUrl = url.trim()
  return trimmedUrl.startsWith("http://") || trimmedUrl.startsWith("https://")
}

/**
 * Gotify 服务器 URL 验证
 * 更严格的验证，确保是有效的 HTTP(S) URL
 */
export function isValidGotifyUrl(url: string): boolean {
  if (!isValidUrl(url)) {
    return false
  }

  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Token 验证
 * 检查 token 是否为有效字符串且长度足够
 * 增强验证：检查字符类型和模式
 */
export function isValidToken(token: string): boolean {
  if (typeof token !== "string") return false

  const trimmed = token.trim()

  // 检查长度（Gotify token 通常是 16 个字符的字母数字组合）
  if (trimmed.length < 10) return false

  // 检查是否只包含字母数字和常见的特殊字符
  const validTokenPattern = /^[A-Za-z0-9._-]+$/
  if (!validTokenPattern.test(trimmed)) return false

  // 检查是否不是全部相同的字符（如 "0000000000"）
  const allSameChar = /^(.)\1+$/.test(trimmed)
  if (allSameChar) return false

  return true
}

/**
 * 检查 action 是否应该由 Chrome Extension 处理
 * @param handler - action 的 handler 字段
 * @returns 是否由 Chrome Extension 处理
 */
export function shouldHandleByChrome(handler?: string): boolean {
  // 未定义、null、空字符串、或 "chrome" 都视为由 Chrome 处理
  if (handler === undefined || handler === null) return true
  const trimmedHandler = handler.trim()
  if (trimmedHandler === "") return true
  return trimmedHandler.toLowerCase() === "chrome"
}

/**
 * 检查 DroplinkAction 是否应该由 Chrome Extension 处理
 * @param action - DroplinkAction 对象
 * @returns 是否由 Chrome Extension 处理
 */
export function isActionForChrome(action: {
  type: string
  handler?: string
}): boolean {
  return shouldHandleByChrome(action.handler)
}

/**
 * 验证 Droplink 消息的 content 是否为有效的 URL
 * @param content - Droplink 消息的 content 字段
 * @returns 是否为有效的 URL content
 */
export function isValidDroplinkUrl(content: any): boolean {
  return (
    content?.type === "url" &&
    typeof content.value === "string" &&
    content.value.trim().length > 0 &&
    (content.value.startsWith("http://") || content.value.startsWith("https://"))
  )
}

/**
 * 检查 Droplink actions 数组中是否包含 openTab action
 * @param actions - Droplink actions 数组
 * @returns 是否包含由 Chrome 处理的 openTab action
 */
export function hasOpenTabAction(actions: any[]): boolean {
  return actions?.some(
    (action: any) => action.type === "openTab" && isActionForChrome(action)
  )
}
