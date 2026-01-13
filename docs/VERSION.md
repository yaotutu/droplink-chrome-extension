# 自动版本号规则

## 版本号说明

为了符合 Chrome Extension 的版本号规范（只能是纯数字格式如 `1.0.0`），我们采用以下策略：

- **manifest 版本号**：始终使用 `package.json` 中的版本号（如 `0.0.1` 或 `1.0.0`）
- **文件名标识**：包含分支和构建信息，便于区分不同构建

## 文件命名格式

### 1. dev 分支构建

**格式**：`droplink-{基础版本}-dev.{构建次数}.zip`

**示例**：
```
droplink-0.0.1-dev.1.zip    # 第 1 次构建
droplink-0.0.1-dev.2.zip    # 第 2 次构建
droplink-0.0.1-dev.15.zip   # 第 15 次构建
```

**说明**：
- manifest 版本号：`0.0.1`（从 package.json 读取）
- 文件名标识：`-dev.{构建次数}` 用于区分不同构建
- 构建次数从 1 开始递增

### 2. main 分支构建

**格式**：`droplink-{基础版本}-{commit短hash}.zip`

**示例**：
```
droplink-0.0.1-abc1234.zip   # commit hash 的前 7 位
droplink-0.0.1-def5678.zip
droplink-0.0.1-9a8b7c6.zip
```

**说明**：
- manifest 版本号：`0.0.1`（从 package.json 读取）
- 文件名标识：`-{commit-hash}` 用于追溯代码版本
- commit hash 确保文件名唯一性

### 3. Tag 发布（正式版本）

**格式**：`droplink-v{版本号}.zip`

**示例**：
```
Tag: v1.0.0  → 文件: droplink-v1.0.0.zip  (manifest: 1.0.0)
Tag: v1.2.3  → 文件: droplink-v1.2.3.zip  (manifest: 1.2.3)
Tag: v2.0.0  → 文件: droplink-v2.0.0.zip  (manifest: 2.0.0)
```

**说明**：
- manifest 版本号：`1.0.0`（从 tag 提取，更新 package.json）
- 文件名：`droplink-v{版本号}.zip`
- **重要**：tag 必须使用纯数字格式（如 `v1.0.0`），不能包含 `-dev`、`-beta` 等后缀

## 版本号来源

### GitHub Actions 环境变量

```yaml
${{ github.run_number }}    # 构建次数：1, 2, 3, ...
${{ github.sha }}           # commit hash（完整）
${{ github.ref_name }}      # 分支名或 tag 名
```

### 读取 package.json

```bash
BASE_VERSION=$(node -p "require('./package.json').version")
# 输出: 0.0.1
```

### 生成短 hash

```bash
SHORT_SHA=$(echo ${{ github.sha }} | cut -c1-7)
# 输出: abc1234
```

## 版本号对比示例

| 触发方式 | package.json | manifest 版本 | 文件名 |
|---------|-------------|--------------|--------|
| 推送到 dev（第 5 次） | 0.0.1 | 0.0.1 | droplink-0.0.1-dev.5.zip |
| 推送到 main（commit abc1234） | 0.0.1 | 0.0.1 | droplink-0.0.1-abc1234.zip |
| 创建 tag v1.0.0 | 0.0.1 → 1.0.0 | 1.0.0 | droplink-v1.0.0.zip |

## 实际使用流程

### 开发阶段

```bash
# 在 dev 分支开发
git checkout dev
git commit -m "feat: 添加新功能"
git push origin dev

# ✅ 自动构建
# - manifest 版本: 0.0.1
# - 文件名: droplink-0.0.1-dev.23.zip
```

### 合并到 main

```bash
git checkout main
git merge dev
git push origin main

# ✅ 自动构建
# - manifest 版本: 0.0.1
# - 文件名: droplink-0.0.1-abc1234.zip
```

### 发布正式版本

```bash
# 1. 更新 package.json 版本号为 1.0.0
vim package.json  # 修改 "version": "1.0.0"

# 2. 提交版本更新
git add package.json
git commit -m "chore: bump version to 1.0.0"
git push origin main

# 3. 创建 tag（必须是纯数字格式）
git tag v1.0.0
git push origin v1.0.0

# ✅ 自动发布
# - manifest 版本: 1.0.0
# - 文件名: droplink-v1.0.0.zip
```

## 版本号演进示例

```
package.json: 0.0.1

dev:    0.0.1-dev.1
        0.0.1-dev.2
        0.0.1-dev.3
          ↓ 合并
main:   0.0.1-abc1234
          ↓ 继续开发
dev:    0.0.1-dev.4
        0.0.1-dev.5
          ↓ 合并
main:   0.0.1-def5678
          ↓ 更新 package.json → 1.0.0
tag:    v1.0.0 (正式发布)
          ↓
package.json: 1.0.0

dev:    1.0.0-dev.1
        1.0.0-dev.2
          ↓ 合并
main:   1.0.0-xyz9876
          ↓ 更新 package.json → 1.1.0
tag:    v1.1.0 (正式发布)
```

## 注意事项

1. **Chrome Extension 版本号限制**
   - manifest 中的版本号必须是纯数字格式：`1.0.0` 或 `1.0.0.1`
   - 不能包含 `-dev`、`-beta` 等后缀
   - 因此 dev 和 main 分支使用相同的 manifest 版本号
   - 通过文件名区分不同构建

2. **package.json 的版本号**
   - dev 和 main 分支：不修改 package.json
   - tag 发布：根据 tag 更新 package.json
   - 例如：tag v1.0.0 会将 package.json 改为 1.0.0

3. **Tag 版本号格式要求**
   - ✅ 正确：`v1.0.0`, `v2.1.3`, `v0.9.0`
   - ❌ 错误：`v1.0.0-beta`, `v2.0-rc1`, `1.0.0`（缺少 v 前缀）
   - 构建时会验证版本号格式

4. **构建次数**
   - `github.run_number` 是仓库级别的，不会重置
   - 即使切换分支，构建次数也会继续递增

5. **下载构建产物**
   - dev 和 main 构建：Actions → Artifacts
   - tag 发布：Releases 页面

6. **版本号语义**
   - dev 构建：开发测试，可能不稳定
   - main 构建：相对稳定，但未正式发布
   - tag 版本：正式发布，推荐用户使用
