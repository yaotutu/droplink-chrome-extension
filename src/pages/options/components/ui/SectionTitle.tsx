/**
 * SectionTitle 组件 - 蓝色分区标题
 */

import React from "react"

import { colors, fontSize, fontWeight, spacing } from "~/pages/options/styles/theme"

interface SectionTitleProps {
  children: React.ReactNode
  style?: React.CSSProperties
}

export const SectionTitle: React.FC<SectionTitleProps> = ({
  children,
  style
}) => {
  return <h2 style={{ ...styles.title, ...style }}>{children}</h2>
}

const styles: Record<string, React.CSSProperties> = {
  title: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: spacing.md,
    marginTop: spacing.xl
  }
}
