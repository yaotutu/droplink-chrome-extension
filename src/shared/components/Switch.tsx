/**
 * 开关组件
 * 更新样式以匹配新设计（蓝色激活状态）
 */

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
        backgroundColor: checked ? "#2563EB" : "#E5E7EB",
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
    transition: "background-color 0.2s ease-in-out",
    outline: "none"
  },
  slider: {
    position: "absolute",
    width: 24,
    height: 24,
    borderRadius: "50%",
    backgroundColor: "#fff",
    top: 2,
    left: 2,
    transition: "transform 0.2s ease-in-out",
    boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
  }
}
