/**
 * 通知工具函数
 */

// 1x1 透明 PNG 的 base64 编码（避免加载外部图标文件）
const TRANSPARENT_ICON =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

/**
 * 创建带自动清除的通知
 * @param title 通知标题
 * @param message 通知内容
 * @param options 通知选项
 * @param autoCloseDelay 自动关闭延迟（毫秒），0 表示不自动关闭
 * @returns 通知 ID
 */
async function createAutoCloseNotification(
  title: string,
  message: string,
  options: Partial<chrome.notifications.NotificationOptions> = {},
  autoCloseDelay: number = 5000
): Promise<string> {
  // 生成唯一的通知 ID
  const notificationId = `droplink_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

  // 构建通知选项
  const notificationOptions: chrome.notifications.NotificationOptions = {
    type: "basic",
    iconUrl: TRANSPARENT_ICON,
    title,
    message,
    priority: 0,
    ...options
  }

  try {
    // 创建通知
    await chrome.notifications.create(
      notificationId,
      notificationOptions as chrome.notifications.NotificationOptions<true>
    )

    // 自动清除（如果启用）
    if (autoCloseDelay > 0) {
      setTimeout(() => {
        chrome.notifications.clear(notificationId).catch(() => {
          // 忽略清理错误（通知可能已被用户关闭）
        })
      }, autoCloseDelay)
    }
  } catch (error) {
    console.error("[Notifications] 创建通知失败:", error)
  }

  return notificationId
}

/**
 * 显示成功通知（5秒后自动关闭）
 */
export async function showSuccess(title: string, message: string): Promise<void> {
  await createAutoCloseNotification(title, message, {}, 5000)
}

/**
 * 显示错误通知（8秒后自动关闭，高优先级）
 */
export async function showError(title: string, message: string): Promise<void> {
  await createAutoCloseNotification(
    title,
    message,
    {
      priority: 2 // 高优先级
    },
    8000 // 错误通知显示更长时间
  )
}

/**
 * 显示警告通知（6秒后自动关闭）
 */
export async function showWarning(title: string, message: string): Promise<void> {
  await createAutoCloseNotification(
    title,
    message,
    {
      priority: 1 // 中优先级
    },
    6000
  )
}

/**
 * 显示信息通知（5秒后自动关闭）
 */
export async function showInfo(title: string, message: string): Promise<void> {
  await createAutoCloseNotification(title, message, {}, 5000)
}

