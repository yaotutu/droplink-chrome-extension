/**
 * 消息处理器基类
 */

import type { DroplinkAction, DroplinkMessage } from "~types"

export abstract class MessageHandler<T extends DroplinkMessage> {
  /** 处理器支持的 action 类型 */
  abstract readonly action: DroplinkAction

  /** 验证消息格式 */
  abstract validate(message: any): message is T

  /** 处理消息 */
  abstract handle(message: T): Promise<void>
}
