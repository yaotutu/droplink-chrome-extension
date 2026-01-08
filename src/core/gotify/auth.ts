/**
 * Gotify 认证和客户端管理模块
 */

import type { GotifyClient } from "~/shared/types"

/**
 * HTTP 错误状态码映射
 */
const ERROR_MESSAGES: Record<number, string> = {
  400: "请求参数错误",
  401: "用户名或密码错误",
  403: "权限不足，无法创建客户端",
  404: "API 端点不存在，请检查服务器地址",
  500: "服务器内部错误",
  503: "服务器暂时不可用"
}

/**
 * 请求超时时间（10秒）
 */
const TIMEOUT = 10000

/**
 * 带超时的 fetch 请求
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number = TIMEOUT
): Promise<Response> {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    })
    clearTimeout(id)
    return response
  } catch (error: any) {
    clearTimeout(id)
    if (error.name === "AbortError") {
      throw new Error("请求超时，请检查网络连接")
    }
    // CORS 错误检测
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error(
        "无法连接到 Gotify 服务器，可能的原因：\n" +
          "1. 服务器地址错误\n" +
          "2. 服务器未配置 CORS（需要设置 GOTIFY_SERVER_CORS_ALLOWORIGINS）\n" +
          "3. 网络连接问题"
      )
    }
    throw error
  }
}

/**
 * 生成客户端名称
 * @returns 格式: "Droplink - Chrome (2026-01-05 19:45:30)"
 */
export function generateClientName(): string {
  const now = new Date()
  const dateStr = now.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  })
  return `Droplink - Chrome (${dateStr})`
}

/**
 * 创建 Gotify 客户端
 * @param gotifyUrl Gotify 服务器地址
 * @param username 用户名
 * @param password 密码
 * @param clientName 客户端名称（可选，默认自动生成）
 * @returns 包含 token 和 clientId 的对象
 * @throws 创建失败时抛出错误
 */
export async function createClient(
  gotifyUrl: string,
  username: string,
  password: string,
  clientName?: string
): Promise<{ token: string; clientId: number }> {
  const name = clientName || generateClientName()

  console.log("[Auth] 创建客户端:", name)

  // 构建请求 URL
  const url = new URL("/client", gotifyUrl).href

  // Base64 编码用户名和密码
  const credentials = btoa(`${username}:${password}`)

  try {
    const response = await fetchWithTimeout(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${credentials}`
      },
      body: JSON.stringify({ name })
    })

    if (!response.ok) {
      const errorMsg =
        ERROR_MESSAGES[response.status] || `请求失败: ${response.statusText}`
      console.error(`[Auth] 创建客户端失败 (${response.status}):`, errorMsg)
      throw new Error(errorMsg)
    }

    const data: GotifyClient = await response.json()

    console.log("[Auth] 客户端创建成功:", {
      id: data.id,
      name: data.name,
      token: "***" // 不输出完整 token
    })

    return {
      token: data.token,
      clientId: data.id
    }
  } catch (error: any) {
    console.error("[Auth] 创建客户端异常:", error)
    throw error
  }
}

/**
 * 删除 Gotify 客户端
 * @param gotifyUrl Gotify 服务器地址
 * @param username 用户名
 * @param password 密码
 * @param clientId 客户端 ID
 */
export async function deleteClient(
  gotifyUrl: string,
  username: string,
  password: string,
  clientId: number
): Promise<void> {
  console.log("[Auth] 删除客户端:", clientId)

  // 构建请求 URL
  const url = new URL(`/client/${clientId}`, gotifyUrl).href

  // Base64 编码用户名和密码
  const credentials = btoa(`${username}:${password}`)

  try {
    const response = await fetchWithTimeout(url, {
      method: "DELETE",
      headers: {
        Authorization: `Basic ${credentials}`
      }
    })

    if (!response.ok) {
      console.warn(
        `[Auth] 删除客户端失败 (${response.status}): ${response.statusText}`
      )
      // 不抛出错误，因为这是清理操作
    } else {
      console.log("[Auth] 客户端删除成功")
    }
  } catch (error) {
    console.warn("[Auth] 删除客户端异常:", error)
    // 不抛出错误，因为这是清理操作
  }
}

/**
 * 验证凭证是否有效（测试 Basic Auth）
 * @param gotifyUrl Gotify 服务器地址
 * @param username 用户名
 * @param password 密码
 * @returns 凭证是否有效
 */
export async function validateCredentials(
  gotifyUrl: string,
  username: string,
  password: string
): Promise<boolean> {
  console.log("[Auth] 验证凭证")

  try {
    // 尝试获取当前用户信息来验证凭证
    const url = new URL("/current/user", gotifyUrl).href
    const credentials = btoa(`${username}:${password}`)

    const response = await fetchWithTimeout(url, {
      method: "GET",
      headers: {
        Authorization: `Basic ${credentials}`
      }
    })

    const isValid = response.ok
    console.log("[Auth] 凭证验证结果:", isValid)
    return isValid
  } catch (error) {
    console.error("[Auth] 凭证验证失败:", error)
    return false
  }
}
