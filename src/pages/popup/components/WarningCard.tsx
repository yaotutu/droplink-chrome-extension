/**
 * 警告卡片组件
 */

interface WarningCardProps {
  message: string
}

export function WarningCard({ message }: WarningCardProps) {
  return (
    <div style={styles.card}>
      <span style={styles.icon}>ℹ️</span>
      <span style={styles.text}>{message}</span>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: "#fff3e0",
    borderRadius: 8,
    padding: 12,
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 12,
    marginBottom: 12
  },
  icon: {
    fontSize: 16
  },
  text: {
    color: "#f57c00",
    flex: 1
  }
}
