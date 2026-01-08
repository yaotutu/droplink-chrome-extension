/**
 * 开关组件
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
        backgroundColor: checked ? "#2196f3" : "#ccc",
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
    transition: "background-color 0.3s",
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
    transition: "transform 0.3s",
    boxShadow: "0 1px 3px rgba(0,0,0,0.3)"
  }
}
