/**
 * 标签页管理器
 * 负责创建和激活标签页
 */

/**
 * 打开新标签页
 * @param url 要打开的 URL
 * @param activate 是否激活标签页，默认 true
 */
export async function openTab(
  url: string,
  activate: boolean = true
): Promise<void> {
  try {
    // 验证 URL
    if (!isValidUrl(url)) {
      throw new Error(`无效的 URL: ${url}`)
    }

    // 创建新标签页
    const tab = await chrome.tabs.create({
      url,
      active: activate
    })

    console.log(`[TabManager] 已打开标签页: ${url} (ID: ${tab.id})`)

    // 如果需要激活，确保标签页被聚焦
    if (activate && tab.id) {
      await chrome.tabs.update(tab.id, { active: true })
    }
  } catch (error) {
    console.error("[TabManager] 打开标签页失败:", error)
    throw error
  }
}

/**
 * 验证 URL 是否有效
 */
function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return urlObj.protocol === "http:" || urlObj.protocol === "https:"
  } catch {
    return false
  }
}

/**
 * 显示错误通知
 * @param message 错误消息
 * @param url 相关的 URL
 */
export async function showErrorNotification(
  message: string,
  url?: string
): Promise<void> {
  try {
    const notificationId = `droplink_error_${Date.now()}`

    await chrome.notifications.create(notificationId, {
      type: "basic",
      iconUrl: chrome.runtime.getURL("assets/icon.png"),
      title: "Droplink 错误",
      message: url ? `${message}\nURL: ${url}` : message,
      priority: 2
    })

    // 5 秒后自动清除通知
    setTimeout(() => {
      chrome.notifications.clear(notificationId)
    }, 5000)
  } catch (error) {
    console.error("[TabManager] 显示通知失败:", error)
  }
}
