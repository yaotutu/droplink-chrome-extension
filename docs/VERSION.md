# 自动版本号规则

## 版本号格式

GitHub Actions 会根据不同的分支和触发方式，自动生成唯一的版本号。

### 1. dev 分支构建

**格式**：`{基础版本}-dev.{构建次数}`

**示例**：
```
0.0.1-dev.1    # 第 1 次构建
0.0.1-dev.2    # 第 2 次构建
0.0.1-dev.15   # 第 15 次构建
```

**说明**：
- 基础版本从 `package.json` 读取
- 构建次数从 1 开始递增，永不重置
- 每次推送到 dev 分支都会构建

**文件名**：`droplink-0.0.1-dev.15.zip`

### 2. main 分支构建

**格式**：`{基础版本}-{commit短hash}`

**示例**：
```
0.0.1-abc1234   # commit hash 的前 7 位
0.0.1-def5678
0.0.1-9a8b7c6
```

**说明**：
- 基础版本从 `package.json` 读取
- commit hash 确保版本唯一性
- 每次推送到 main 分支都会构建

**文件名**：`droplink-0.0.1-abc1234.zip`

### 3. Tag 发布（正式版本）

**格式**：`{tag版本号}`（去掉 v 前缀）

**示例**：
```
Tag: v1.0.0  → 版本: 1.0.0
Tag: v1.2.3  → 版本: 1.2.3
Tag: v2.0.0  → 版本: 2.0.0
```

**说明**：
- 使用 tag 名称作为版本号
- 自动去掉 v 前缀
- 永久保留在 Releases 页面

**文件名**：`droplink-v1.0.0.zip`

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

| 触发方式 | package.json | 生成的版本号 | 文件名 |
|---------|-------------|-------------|--------|
| 推送到 dev（第 5 次） | 0.0.1 | 0.0.1-dev.5 | droplink-0.0.1-dev.5.zip |
| 推送到 main（commit abc1234） | 0.0.1 | 0.0.1-abc1234 | droplink-0.0.1-abc1234.zip |
| 创建 tag v1.0.0 | 0.0.1 | 1.0.0 | droplink-v1.0.0.zip |

## 实际使用流程

### 开发阶段

```bash
# 在 dev 分支开发
git checkout dev
git commit -m "feat: 添加新功能"
git push origin dev

# ✅ 自动构建: 0.0.1-dev.23
# 下载文件: droplink-0.0.1-dev.23.zip
```

### 合并到 main

```bash
git checkout main
git merge dev
git push origin main

# ✅ 自动构建: 0.0.1-abc1234
# 下载文件: droplink-0.0.1-abc1234.zip
```

### 发布正式版本

```bash
# 更新 package.json 版本号为 1.0.0
vim package.json

git add package.json
git commit -m "chore: bump version to 1.0.0"
git push origin main

# 创建 tag
git tag v1.0.0
git push origin v1.0.0

# ✅ 自动发布: v1.0.0
# 下载文件: droplink-v1.0.0.zip
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

1. **package.json 的版本号**
   - 只需要在准备发布正式版本时手动更新
   - dev 和 main 的日常构建不需要改动
   - 构建时会临时修改版本号，但不会提交到 git

2. **构建次数**
   - `github.run_number` 是仓库级别的，不会重置
   - 即使切换分支，构建次数也会继续递增

3. **下载构建产物**
   - dev 和 main 构建：Actions → Artifacts
   - tag 发布：Releases 页面

4. **版本号语义**
   - dev 版本：开发测试，可能不稳定
   - main 版本：相对稳定，但未正式发布
   - tag 版本：正式发布，推荐用户使用
