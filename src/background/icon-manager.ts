/**
 * 图标管理器
 * 根据连接状态动态更新扩展图标的徽章
 */

import { ConnectionStatus } from "~/shared/types"

export class IconManager {
  /**
   * 更新图标徽章以反映连接状态
   */
  updateIcon(status: ConnectionStatus, configValid: boolean): void {
    if (!configValid) {
      // 配置无效：无徽章
      this.clearBadge()
      return
    }

    switch (status) {
      case ConnectionStatus.CONNECTED:
        // 已连接：绿色圆点
        this.setBadge("●", "#10B981") // Emerald-500
        break

      case ConnectionStatus.CONNECTING:
        // 连接中：黄色圆点
        this.setBadge("●", "#F59E0B") // Amber-500
        break

      case ConnectionStatus.RECONNECTING:
        // 重连中：橙色圆点
        this.setBadge("●", "#F97316") // Orange-500
        break

      case ConnectionStatus.ERROR:
        // 错误：红色感叹号
        this.setBadge("!", "#EF4444") // Red-500
        break

      case ConnectionStatus.DISCONNECTED:
        // 未连接：灰色圆点
        this.setBadge("●", "#9CA3AF") // Gray-400
        break

      default:
        this.clearBadge()
    }
  }

  /**
   * 设置徽章文字和背景色
   */
  private setBadge(text: string, color: string): void {
    chrome.action.setBadgeText({ text })
    chrome.action.setBadgeBackgroundColor({ color })
  }

  /**
   * 清除徽章
   */
  private clearBadge(): void {
    chrome.action.setBadgeText({ text: "" })
  }
}
