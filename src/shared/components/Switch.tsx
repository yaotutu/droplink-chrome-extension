/**
 * 开关组件
 * 使用 theme 系统统一样式
 */

import * as theme from "~/pages/options/styles/theme"

interface SwitchProps {
  checked: boolean
  onChange: () => void
  disabled?: boolean
}

export function Switch({ checked, onChange, disabled = false }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      disabled={disabled}
      style={{
        ...styles.switch,
        backgroundColor: checked ? theme.colors.primary : theme.colors.border,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer"
      }}>
      <span
        style={{
          ...styles.slider,
          transform: checked ? "translateX(20px)" : "translateX(0)"
        }}
      />
    </button>
  )
}

const styles: Record<string, React.CSSProperties> = {
  switch: {
    position: "relative",
    width: 48,
    height: 28,
    borderRadius: 28,
    border: "none",
    padding: 0,
    transition: theme.transitions.normal,
    outline: "none"
  },
  slider: {
    position: "absolute",
    width: 24,
    height: 24,
    borderRadius: "50%",
    backgroundColor: theme.colors.card,
    top: 2,
    left: 2,
    transition: theme.transitions.normal,
    boxShadow: theme.shadows.card
  }
}
