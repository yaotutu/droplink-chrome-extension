/**
 * Gotify REST API 客户端
 * 用于获取历史消息
 */

import { fetchWithTimeout } from "~/shared/utils/timeout"
import type { Config, GotifyMessage } from "~/shared/types"

/**
 * Gotify API 响应结构（消息列表）
 */
interface GotifyMessagesResponse {
  messages: GotifyMessage[]
  paging: {
    limit: number
    since: number
    size: number
  }
}

/**
 * 获取 Gotify 历史消息
 * @param config Gotify 配置
 * @param limit 拉取消息数量（默认 10，最大 200）
 * @returns 消息列表（按时间倒序，最新的在前）
 */
export async function getMessages(
  config: Config,
  limit: number = 10
): Promise<GotifyMessage[]> {
  // 验证配置
  if (!config.gotifyUrl || !config.clientToken) {
    throw new Error("Gotify 配置不完整：缺少服务器地址或客户端 Token")
  }

  // 限制范围：1-200
  const actualLimit = Math.max(1, Math.min(200, limit))

  // 构建 API URL
  const url = new URL(`${config.gotifyUrl}/message`)
  url.searchParams.set("limit", actualLimit.toString())
  url.searchParams.set("token", config.clientToken)

  console.log(`[GotifyRestClient] 正在拉取最近 ${actualLimit} 条消息...`)

  try {
    // 发起请求（10 秒超时）
    const response = await fetchWithTimeout(url.toString(), {}, 10000)

    // 处理 HTTP 错误
    if (!response.ok) {
      throw await handleHttpError(response)
    }

    // 解析响应
    const data = (await response.json()) as GotifyMessagesResponse

    // 验证响应格式
    if (!data || !Array.isArray(data.messages)) {
      throw new Error("Gotify API 返回数据格式错误")
    }

    console.log(
      `[GotifyRestClient] 成功拉取 ${data.messages.length} 条消息`
    )
    return data.messages
  } catch (error) {
    // 统一错误处理
    if (error instanceof Error) {
      console.error(`[GotifyRestClient] 请求失败:`, error.message)
      throw error
    }
    throw new Error("未知错误")
  }
}

/**
 * 处理 HTTP 错误响应
 * @param response HTTP 响应对象
 * @returns 格式化的错误对象
 */
async function handleHttpError(response: Response): Promise<Error> {
  const status = response.status

  switch (status) {
    case 401:
    case 403:
      return new Error("客户端 Token 无效或已过期，请重新配置")

    case 404:
      return new Error("Gotify 服务器地址错误，请检查配置")

    case 500:
    case 502:
    case 503:
    case 504:
      return new Error("Gotify 服务器内部错误，请稍后重试")

    default:
      // 尝试读取错误详情
      try {
        const errorData = await response.json()
        const errorMessage =
          errorData.error ||
          errorData.message ||
          `HTTP ${status}: ${response.statusText}`
        return new Error(errorMessage)
      } catch {
        return new Error(`HTTP ${status}: ${response.statusText}`)
      }
  }
}

/**
 * 测试 Gotify REST API 连接
 * @param config Gotify 配置
 * @returns 测试是否成功
 */
export async function testConnection(config: Config): Promise<boolean> {
  try {
    // 尝试拉取 1 条消息
    await getMessages(config, 1)
    return true
  } catch (error) {
    console.error("[GotifyRestClient] 连接测试失败:", error)
    return false
  }
}
