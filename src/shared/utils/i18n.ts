/**
 * 国际化 (i18n) 工具函数
 *
 * 提供 Chrome 扩展的国际化支持，使用 chrome.i18n API
 */

// 翻译键的类型定义
export type I18nKey =
  | "app_name"
  | "loading"
  | "open_settings"
  | "please_configure_server"
  | "settings_title"
  | "version"
  | "logout_confirm"
  | "app_description"
  | "gotify_website"
  | "github"
  | "connection_status"
  | "connected"
  | "connecting"
  | "disconnected"
  | "connection_failed"
  | "unknown"
  | "server_label"
  | "last_connected"
  | "enabled_features"
  | "enabled"
  | "disabled"
  | "auto_open_tab"
  | "notifications"
  | "none"
  | "features_label"
  | "login_title"
  | "login_description"
  | "email_code_login"
  | "token_login"
  | "config_info"
  | "logout"
  | "token_label"
  | "error_email_required"
  | "error_invalid_email"
  | "success_code_sent"
  | "error_send_code_failed"
  | "error_code_required"
  | "success_register"
  | "success_login"
  | "error_login_failed"
  | "email_label"
  | "verification_code_label"
  | "email_placeholder"
  | "code_placeholder"
  | "sending"
  | "send_code"
  | "logging_in"
  | "login"
  | "email_code_hint"
  | "error_token_required"
  | "error_connection_failed"
  | "client_token_label"
  | "token_placeholder"
  | "hide"
  | "show"
  | "token_login_hint"
  | "feature_settings"
  | "show_all_notifications"
  | "show_all_notifications_desc"
  | "open_tab_notification"
  | "open_tab_notification_desc"
  | "notification_filter"
  | "standard_gotify_service"
  | "default_all_messages"
  | "enable_filter_rules"
  | "enable_filter_rules_desc"
  | "filter_open_tab_messages"
  | "filter_open_tab_messages_desc"
  | "history_sync_title"
  | "enable_history_sync"
  | "enable_history_sync_description"
  | "history_sync_auto_hint"
  | "error_server_url_required"
  | "error_invalid_url"
  | "gotify_server_label"
  | "gotify_server_placeholder"
  | "auth_server_label"
  | "auth_server_placeholder"
  | "auto_register_hint"
  | "twitter_link"

/**
 * 获取翻译文本
 *
 * @param key - 翻译键
 * @param fallback - 降级文本（当翻译不存在时使用）
 * @returns 翻译后的文本
 *
 * @example
 * ```ts
 * const text = t("app_name") // 返回 "Droplink" 或对应的翻译
 * const text2 = t("welcome_message", "Welcome") // 如果翻译不存在，返回 "Welcome"
 * ```
 */
export function t(key: I18nKey, fallback?: string): string {
  const message = chrome.i18n.getMessage(key)
  return message || fallback || key
}

/**
 * 获取带占位符的翻译文本
 *
 * @param key - 翻译键
 * @param placeholders - 占位符对象
 * @param fallback - 降级文本
 * @returns 替换占位符后的翻译文本
 *
 * @example
 * ```ts
 * // messages.json: "greeting": { "message": "Hello {name}!" }
 * const text = tWithPlaceholders("greeting", { name: "World" }) // 返回 "Hello World!"
 * ```
 */
export function tWithPlaceholders(
  key: I18nKey,
  placeholders: Record<string, string>,
  fallback?: string
): string {
  // 获取原始翻译文本
  let message = chrome.i18n.getMessage(key)

  // 如果没有找到翻译,使用降级文本或键名
  if (!message) {
    return fallback || key
  }

  // 手动替换占位符 {KEY} -> value
  // 使用 split().join() 避免正则表达式特殊字符问题
  Object.entries(placeholders).forEach(([key, value]) => {
    const placeholder = `{${key}}`
    message = message.split(placeholder).join(value)
  })

  return message
}
