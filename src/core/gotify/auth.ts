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
  } catch (error: any) {
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
 * @throws 发送失败时抛出错误
 */
export async function sendVerificationCode(email: string): Promise<void> {
  console.log("[Auth] 发送验证码到:", email)

  const url = new URL("/api/auth/send-code", AUTH_SERVER_URL).href

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
  } catch (error: any) {
    console.error("[Auth] 发送验证码异常:", error)
    throw error
  }
}

/**
 * 使用邮箱和验证码登录/注册（统一接口）
 * @param email 邮箱地址
 * @param code 验证码
 * @returns 包含 clientToken、appToken 和 isNewUser 的对象
 * @throws 验证失败时抛出错误
 */
export async function verifyEmailCode(
  email: string,
  code: string
): Promise<{
  clientToken: string
  appToken: string
  isNewUser: boolean
}> {
  console.log("[Auth] 验证邮箱:", email)

  const url = new URL("/api/auth/verify", AUTH_SERVER_URL).href

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
      isNewUser: data.isNewUser
    }
  } catch (error: any) {
    console.error("[Auth] 登录异常:", error)
    throw error
  }
}
