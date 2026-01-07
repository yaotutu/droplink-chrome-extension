/**
 * 通知工具函数
 */

// 1x1 透明 PNG 的 base64 编码（避免加载外部图标文件）
const TRANSPARENT_ICON =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

/**
 * 创建通知的通用函数
 */
async function createNotification(
  title: string,
  message: string,
  options: Partial<chrome.notifications.NotificationOptions> = {}
): Promise<void> {
  // 生成唯一的通知 ID（使用随机数避免冲突）
  const notificationId = `droplink_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`

  // 构建通知选项
  const notificationOptions: chrome.notifications.NotificationOptions = {
    type: "basic",
    iconUrl: TRANSPARENT_ICON,
    title,
    message,
    priority: 0, // 默认优先级 0（范围 -2 到 2）
    ...options
  }

  try {
    // 创建通知并等待完成
    await chrome.notifications.create(notificationId, notificationOptions)
  } catch (error) {
    console.error("[Notifications] 创建通知失败:", error)
  }

  // 5秒后自动清除
  setTimeout(() => {
    chrome.notifications.clear(notificationId)
  }, 5000)
}

/**
 * 显示成功通知
 */
export async function showSuccess(title: string, message: string) {
  await createNotification(title, message)
}

/**
 * 显示错误通知
 */
export async function showError(title: string, message: string) {
  await createNotification(title, message, {
    priority: 2, // 高优先级
    requireInteraction: true // 错误通知需要用户手动关闭
  })
}

/**
 * 显示信息通知
 */
export async function showInfo(title: string, message: string) {
  await createNotification(title, message)
}
