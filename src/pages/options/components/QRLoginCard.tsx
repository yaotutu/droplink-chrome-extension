/**
 * 二维码登录卡片组件
 */

import { useMemo } from "react"

import { QRCodeDisplay } from "~/shared/components/QRCodeDisplay"
import { useStore } from "~/shared/store"
import type { QRLoginData } from "~/shared/types"
import { GOTIFY_SERVER_URL } from "~/shared/utils/constants"
import { t } from "~/shared/utils/i18n"

export function QRLoginCard() {
  // 从 store 读取配置
  const config = useStore((state) => state.config)

  // 生成二维码数据
  const qrData: QRLoginData = useMemo(() => {
    // 判断服务器类型
    const serverName =
      config.gotifyUrl === GOTIFY_SERVER_URL ? "officialServer" : "selfHost"

    return {
      version: "1.0",
      type: "droplink_qr_login",
      timestamp: Date.now(),
      data: {
        gotifyServerUrl: config.gotifyUrl,
        appToken: config.appToken,
        clientToken: config.clientToken,
        serverName
      }
    }
  }, [config.gotifyUrl, config.appToken, config.clientToken])

  // 转换为 JSON 字符串
  const qrValue = JSON.stringify(qrData)

  // 检查配置是否完整
  const isConfigComplete =
    config.gotifyUrl && config.appToken && config.clientToken

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>{t("qr_login_title")}</h3>
      <p style={styles.description}>{t("qr_login_description")}</p>

      {isConfigComplete ? (
        <>
          <div style={styles.qrContainer}>
            <QRCodeDisplay value={qrValue} size={256} level="H" />
          </div>
          <div style={styles.hint}>
            <span style={styles.hintIcon}>⚠️</span>
            <span>{t("qr_login_hint")}</span>
          </div>
        </>
      ) : (
        <div style={styles.warning}>
          <span style={styles.warningIcon}>⚠️</span>
          <span>{t("qr_login_incomplete_config")}</span>
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    marginBottom: 20,
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    margin: 0,
    marginBottom: 8,
    color: "#333"
  },
  description: {
    fontSize: 13,
    color: "#666",
    marginBottom: 20,
    lineHeight: 1.5
  },
  qrContainer: {
    display: "flex",
    justifyContent: "center",
    marginBottom: 16
  },
  hint: {
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    backgroundColor: "#fff3cd",
    border: "1px solid #ffc107",
    borderRadius: 6,
    fontSize: 12,
    color: "#856404",
    lineHeight: 1.5
  },
  hintIcon: {
    fontSize: 14,
    flexShrink: 0
  },
  warning: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: 16,
    backgroundColor: "#f8d7da",
    border: "1px solid #f5c6cb",
    borderRadius: 6,
    fontSize: 14,
    color: "#721c24"
  },
  warningIcon: {
    fontSize: 16,
    flexShrink: 0
  }
}
