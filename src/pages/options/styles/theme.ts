/**
 * Options 页面样式主题系统
 * 定义统一的颜色、间距、圆角、阴影等样式常量
 */

export const colors = {
  // 主色调
  primary: "#2563EB", // 蓝色
  primaryHover: "#1D4ED8", // 蓝色悬停态

  // 背景色
  background: "#F3F4F6", // 浅灰色背景
  card: "#FFFFFF", // 白色卡片

  // 文字颜色
  text: {
    primary: "#111827", // 深色文字
    secondary: "#6B7280", // 灰色文字
    muted: "#9CA3AF" // 更浅的灰色
  },

  // 状态颜色
  success: "#10B981", // 绿色（Active状态）
  danger: "#EF4444", // 红色（Sign Out按钮）
  dangerHover: "#DC2626", // 红色悬停态
  warning: "#F59E0B", // 黄色（警告）

  // 边框颜色
  border: "#E5E7EB", // 边框颜色
  borderLight: "#F3F4F6" // 浅色边框
}

export const spacing = {
  xs: "4px",
  sm: "8px",
  md: "16px",
  lg: "24px",
  xl: "32px",
  xxl: "48px"
}

export const borderRadius = {
  sm: "4px",
  md: "8px",
  lg: "12px",
  full: "9999px"
}

export const shadows = {
  card: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
  hover: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
}

export const fontSize = {
  xs: "12px",
  sm: "14px",
  base: "16px",
  lg: "18px",
  xl: "20px",
  "2xl": "24px"
}

export const fontWeight = {
  normal: "400",
  medium: "500",
  semibold: "600",
  bold: "700"
}

export const transitions = {
  fast: "150ms ease-in-out",
  normal: "200ms ease-in-out",
  slow: "300ms ease-in-out"
}
