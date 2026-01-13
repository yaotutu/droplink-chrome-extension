/**
 * 标签页管理器
 * 负责创建和激活标签页
 */

import { isValidUrl } from "~/shared/utils/validators"

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

