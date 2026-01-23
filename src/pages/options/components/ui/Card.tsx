/**
 * Card 组件 - 白色卡片容器
 */

import React from "react"

import { borderRadius, colors, shadows, spacing } from "~/pages/options/styles/theme"

interface CardProps {
  children: React.ReactNode
  style?: React.CSSProperties
}

export const Card: React.FC<CardProps> = ({ children, style }) => {
  return <div style={{ ...styles.card, ...style }}>{children}</div>
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    boxShadow: shadows.card,
    padding: spacing.lg,
    marginBottom: spacing.lg
  }
}
