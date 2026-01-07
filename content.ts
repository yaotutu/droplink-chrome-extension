/**
 * Content Script - 用于复制内容到剪贴板
 * 因为 Service Worker 无法直接访问剪贴板
 *
 * @plasmo content-script
 * @plasmo matches <all_urls>
 * @plasmo run-at document_start
 */

export {}

// 监听来自 background 的复制请求
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "copyToClipboard" && request.text) {
    try {
      // 使用传统的 execCommand 方法（兼容性最好）
      const textarea = document.createElement("textarea")
      textarea.value = request.text
      textarea.style.position = "fixed"
      textarea.style.opacity = "0"
      document.body.appendChild(textarea)
      textarea.select()
      const success = document.execCommand("copy")
      document.body.removeChild(textarea)

      sendResponse({ success })
    } catch (error) {
      console.error("[ContentScript] 复制失败:", error)
      sendResponse({ success: false, error: String(error) })
    }
  }
  return true // 保持消息通道打开以便异步响应
})
