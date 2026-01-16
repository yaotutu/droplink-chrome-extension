/**
 * 消息处理器基类
 *
 * 通过依赖注入接收 MessageContext，避免直接依赖 storage 等模块
 */

import type { DroplinkAction, GotifyMessage } from "~/shared/types"
import type { MessageContext } from "../context"

export abstract class MessageHandler<T extends GotifyMessage> {
  /** 处理器支持的 action 类型 */
  abstract readonly action: string

  /** 验证消息格式 */
  abstract validate(message: GotifyMessage): message is T

  /** 处理消息（通过 context 注入依赖） */
  abstract handle(message: T, context: MessageContext): Promise<void>
}
