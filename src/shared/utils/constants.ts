/**
 * 应用常量定义
 */

import type { Config } from "~/shared/types"

/**
 * 认证服务器地址（默认）
 */
export const AUTH_SERVER_URL = "http://111.228.1.24:3600"

/**
 * Gotify 服务器地址（默认）
 */
export const GOTIFY_SERVER_URL = "http://111.228.1.24:2345"

/**
 * 默认配置（唯一定义处）
 */
export const DEFAULT_CONFIG: Config = {
  gotifyUrl: GOTIFY_SERVER_URL,
  clientToken: "",
  openTabNotification: false,
  showAllNotifications: false
}

/**
 * 应用版本
 */
export const APP_VERSION = "0.0.1"

/**
 * 应用名称
 */
export const APP_NAME = "Droplink"
