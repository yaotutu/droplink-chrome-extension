/**
 * StatusBadge 组件 - 状态指示器
 * 显示 Active/Inactive 状态，带圆点指示器
 */

import React from "react"

import {
  borderRadius,
  colors,
  fontSize,
  fontWeight,
  spacing
} from "~/pages/options/styles/theme"

interface StatusBadgeProps {
  active: boolean
  activeText?: string
  inactiveText?: string
  style?: React.CSSProperties
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  active,
  activeText = "Active",
  inactiveText = "Inactive",
  style
}) => {
  return (
    <div style={{ ...styles.badge, ...style }}>
      <span
        style={{
          ...styles.dot,
          backgroundColor: active ? colors.success : colors.text.muted
        }}
      />
      <span style={styles.text}>{active ? activeText : inactiveText}</span>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: spacing.sm
  },
  dot: {
    width: "8px",
    height: "8px",
    borderRadius: borderRadius.full
  },
  text: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text.secondary
  }
}
