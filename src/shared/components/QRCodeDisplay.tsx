/**
 * 二维码展示组件
 */

import { QRCodeSVG } from "qrcode.react"

interface QRCodeDisplayProps {
  /** 二维码内容（字符串） */
  value: string
  /** 二维码大小（像素），默认 256 */
  size?: number
  /** 纠错级别：L(7%), M(15%), Q(25%), H(30%)，默认 H */
  level?: "L" | "M" | "Q" | "H"
  /** 是否包含边距，默认 true */
  includeMargin?: boolean
  /** 前景色（二维码颜色），默认黑色 */
  fgColor?: string
  /** 背景色，默认白色 */
  bgColor?: string
}

/**
 * 通用二维码展示组件
 *
 * 使用示例：
 * ```tsx
 * <QRCodeDisplay
 *   value={JSON.stringify(data)}
 *   size={256}
 *   level="H"
 * />
 * ```
 */
export function QRCodeDisplay({
  value,
  size = 256,
  level = "H",
  includeMargin = true,
  fgColor = "#000000",
  bgColor = "#ffffff"
}: QRCodeDisplayProps) {
  return (
    <div style={styles.container}>
      <QRCodeSVG
        value={value}
        size={size}
        level={level}
        includeMargin={includeMargin}
        fgColor={fgColor}
        bgColor={bgColor}
      />
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    border: "1px solid #e0e0e0"
  }
}
