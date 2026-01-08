/**
 * 消息处理上下文（依赖注入容器）
 *
 * 用于向 handlers 传递依赖，避免直接耦合到 storage 等模块
 */

import type { Config } from "~/shared/types"

export class MessageContext {
  constructor(public readonly config: Config) {}
}
