/**
 * 通知过滤设置组件（完整版，包含规则管理）
 */

import { useNotificationFilters } from "../hooks/useNotificationFilters"
import { Switch } from "~/shared/components/Switch"
import { RuleList } from "./RuleList"
import { AddRuleForm } from "./AddRuleForm"

export function FilterSettings() {
  const {
    filterEnabled,
    filterOpenTab,
    toggleFilterEnabled,
    toggleFilterOpenTab,
    addRule,
    deleteRule,
    addKeywordToRule,
    removeKeywordFromRule,
    editingRuleId,
    setEditingRuleId,
    newKeyword,
    setNewKeyword
  } = useNotificationFilters()

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>通知过滤</h3>
      <p style={styles.description}>
        这是标准的 Gotify 服务，会接收所有 Gotify 消息。
        <br />
        默认展示所有消息，可以选择启用过滤规则来控制哪些消息需要展示。
      </p>

      {/* 启用过滤 */}
      <div style={styles.toggleRow}>
        <div style={styles.toggleInfo}>
          <div style={styles.toggleLabel}>启用过滤规则</div>
          <div style={styles.toggleDescription}>
            开启后可以根据规则控制哪些消息显示通知
          </div>
        </div>
        <Switch checked={filterEnabled} onChange={toggleFilterEnabled} />
      </div>

      {/* 过滤配置区域 - 只有启用过滤时才显示 */}
      {filterEnabled && (
        <>
          <div style={styles.divider}></div>

          {/* 过滤 OpenTab 消息 */}
          <div style={styles.toggleRow}>
            <div style={styles.toggleInfo}>
              <div style={styles.toggleLabel}>过滤 OpenTab 消息</div>
              <div style={styles.toggleDescription}>
                不显示已自动打开标签页的消息通知
              </div>
            </div>
            <Switch checked={filterOpenTab} onChange={toggleFilterOpenTab} />
          </div>

          <div style={styles.divider}></div>

          {/* 规则列表 */}
          <div style={styles.rulesSection}>
            <RuleList
              editingRuleId={editingRuleId}
              newKeyword={newKeyword}
              onDeleteRule={deleteRule}
              onAddKeyword={addKeywordToRule}
              onRemoveKeyword={removeKeywordFromRule}
              onEditingRuleIdChange={setEditingRuleId}
              onNewKeywordChange={setNewKeyword}
            />

            {/* 添加新规则表单 */}
            <div style={styles.addRuleSection}>
              <AddRuleForm onAddRule={addRule} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    marginBottom: 20,
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    margin: 0,
    marginBottom: 8,
    color: "#333"
  },
  description: {
    fontSize: 13,
    color: "#666",
    marginBottom: 20,
    lineHeight: 1.5
  },
  toggleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 0"
  },
  toggleInfo: {
    flex: 1
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4
  },
  toggleDescription: {
    fontSize: 13,
    color: "#999"
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    margin: "8px 0"
  },
  rulesSection: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#e8f5e9",
    borderRadius: 6
  },
  addRuleSection: {
    marginTop: 12
  }
}
