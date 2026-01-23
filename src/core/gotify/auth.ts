/**
 * Gotify 认证模块 - 邮箱验证码登录
 */

import { AUTH_SERVER_URL } from "~/shared/utils/constants"
import { fetchWithTimeout as fetchWithTimeoutUtil } from "~/shared/utils/timeout"

/**
 * 请求超时时间（10秒）
 */
const TIMEOUT = 10000

/**
 * 带超时和 CORS 错误处理的 fetch 请求
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number = TIMEOUT
): Promise<Response> {
  try {
    return await fetchWithTimeoutUtil(url, options, timeout)
  } catch (error: unknown) {
    // CORS 错误检测
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error(
        "无法连接到服务器，可能的原因：\n" +
          "1. 服务器地址错误\n" +
          "2. 服务器未配置 CORS\n" +
          "3. 网络连接问题"
      )
    }
    throw error
  }
}

/**
 * 发送验证码到邮箱
 * @param email 邮箱地址
 * @param authServerUrl 认证服务器地址（可选，默认使用 AUTH_SERVER_URL）
 * @throws 发送失败时抛出错误
 */
export async function sendVerificationCode(
  email: string,
  authServerUrl?: string
): Promise<void> {
  const serverUrl = authServerUrl || AUTH_SERVER_URL
  console.log("[Auth] 发送验证码到:", email, "服务器:", serverUrl)

  const url = new URL("/api/auth/send-code", serverUrl).href

  try {
    const response = await fetchWithTimeout(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email })
    })

    if (!response.ok) {
      const errorMessages: Record<number, string> = {
        400: "邮箱格式错误",
        429: "发送验证码过于频繁，请稍后再试",
        500: "服务器错误，无法发送验证码"
      }

      const errorMsg =
        errorMessages[response.status] ||
        `发送验证码失败 (${response.status})`

      console.error(`[Auth] 发送验证码失败 (${response.status}):`, errorMsg)
      throw new Error(errorMsg)
    }

    console.log("[Auth] 验证码发送成功")
  } catch (error: unknown) {
    console.error("[Auth] 发送验证码异常:", error)
    throw error
  }
}

/**
 * 使用邮箱和验证码登录/注册（统一接口）
 * @param email 邮箱地址
 * @param code 验证码
 * @param authServerUrl 认证服务器地址（可选，默认使用 AUTH_SERVER_URL）
 * @param gotifyUrl Gotify 服务器地址（用于保存到配置）
 * @returns 包含 clientToken、appToken、isNewUser 和 gotifyUrl 的对象
 * @throws 验证失败时抛出错误
 */
export async function verifyEmailCode(
  email: string,
  code: string,
  authServerUrl?: string,
  gotifyUrl?: string
): Promise<{
  clientToken: string
  appToken: string
  isNewUser: boolean
  gotifyUrl: string
}> {
  const serverUrl = authServerUrl || AUTH_SERVER_URL
  const finalGotifyUrl = gotifyUrl || serverUrl
  console.log("[Auth] 验证邮箱:", email, "认证服务器:", serverUrl)

  const url = new URL("/api/auth/verify", serverUrl).href

  try {
    const response = await fetchWithTimeout(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, code })
    })

    if (!response.ok) {
      const errorMessages: Record<number, string> = {
        400: "验证码错误或已过期",
        401: "验证失败",
        403: "账号已被禁用",
        404: "服务器地址错误",
        500: "服务器内部错误"
      }

      const errorMsg =
        errorMessages[response.status] || `登录失败 (${response.status})`

      console.error(`[Auth] 登录失败 (${response.status}):`, errorMsg)
      throw new Error(errorMsg)
    }

    const result = await response.json()

    // 服务器返回格式：{ status: "success", data: { user: { tokens: {...} }, isNewUser: ... } }
    const data = result.data

    console.log("[Auth] 登录成功:", {
      isNewUser: data.isNewUser,
      email: data.user.email,
      clientToken: "***",
      appToken: "***"
    })

    return {
      clientToken: data.user.tokens.clientToken,
      appToken: data.user.tokens.appToken,
      isNewUser: data.isNewUser,
      gotifyUrl: finalGotifyUrl
    }
  } catch (error: unknown) {
    console.error("[Auth] 登录异常:", error)
    throw error
  }
}
