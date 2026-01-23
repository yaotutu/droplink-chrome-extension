/**
 * Button 组件 - 统一的按钮组件
 * 支持 primary、secondary、danger 三种样式
 */

import React from "react"

import {
  borderRadius,
  colors,
  fontSize,
  fontWeight,
  spacing,
  transitions
} from "~/pages/options/styles/theme"

interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: "primary" | "secondary" | "danger"
  disabled?: boolean
  style?: React.CSSProperties
  icon?: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  style,
  icon
}) => {
  const [isHovered, setIsHovered] = React.useState(false)

  const buttonStyle = {
    ...styles.base,
    ...styles[variant],
    ...(isHovered && !disabled ? styles[`${variant}Hover`] : {}),
    ...(disabled ? styles.disabled : {}),
    ...style
  }

  return (
    <button
      style={buttonStyle}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      {icon && <span style={styles.icon}>{icon}</span>}
      {children}
    </button>
  )
}

const styles: Record<string, React.CSSProperties> = {
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: `${spacing.sm} ${spacing.lg}`,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    borderRadius: borderRadius.md,
    border: "none",
    cursor: "pointer",
    transition: transitions.normal,
    outline: "none"
  },
  primary: {
    backgroundColor: colors.primary,
    color: colors.card
  },
  primaryHover: {
    backgroundColor: colors.primaryHover
  },
  secondary: {
    backgroundColor: colors.card,
    color: colors.text.primary,
    border: `1px solid ${colors.border}`
  },
  secondaryHover: {
    backgroundColor: colors.background
  },
  danger: {
    backgroundColor: colors.danger,
    color: colors.card
  },
  dangerHover: {
    backgroundColor: colors.dangerHover
  },
  disabled: {
    opacity: 0.5,
    cursor: "not-allowed"
  },
  icon: {
    marginRight: spacing.sm,
    display: "flex",
    alignItems: "center"
  }
}
