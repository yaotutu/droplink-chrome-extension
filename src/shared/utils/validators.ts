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
 */
export function isValidToken(token: string): boolean {
  return typeof token === "string" && token.trim().length >= 10
}
