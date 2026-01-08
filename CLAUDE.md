# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

**Droplink** 是一个基于 [Plasmo](https://docs.plasmo.com/) 框架构建的 Chrome 浏览器扩展项目。

### 核心功能

通过 WebSocket 连接到 Gotify 服务器，实时监听消息推送，根据消息内容自动打开指定的网页标签页。

**使用场景**：
- 从移动设备快速在电脑上打开链接
- 自动化脚本完成后自动打开结果页面
- 远程控制浏览器打开特定网页

### 技术特性

- ✅ WebSocket 实时连接 Gotify 服务器
- ✅ 自动重连机制（指数退避策略）
- ✅ 消息格式验证
- ✅ 自动打开并激活标签页
- ✅ 完整的错误处理和通知系统
- ✅ 配置管理界面

## 常用命令

### 开发
```bash
npm run dev
# 或
pnpm dev
```
启动开发服务器后，在浏览器中加载 `build/chrome-mv3-dev` 目录。

### 构建生产版本
```bash
npm run build
# 或
pnpm build
```
生成用于发布到商店的生产构建包。

### 打包
```bash
npm run package
# 或
pnpm package
```
为扩展创建可发布的打包文件。

### 代码格式化
项目配置了 Prettier，配置文件为 `.prettierrc.mjs`。

## 架构和项目结构

### 目录结构

```
droplink-chrome-extension/
├── src/                       # 所有源代码
│   ├── background.ts          # 后台服务脚本入口
│   ├── popup.tsx              # Popup 页面入口
│   ├── options.tsx            # Options 页面入口
│   │
│   ├── background/            # 后台模块
│   │   ├── connection-manager.ts      # 连接管理器
│   │   └── runtime-message-handler.ts # Runtime 消息处理
│   │
│   ├── pages/                 # 页面组件
│   │   ├── popup/
│   │   │   ├── components/    # StatusCard, FeatureInfo, WarningCard
│   │   │   └── hooks/         # usePopupState
│   │   └── options/
│   │       ├── components/    # LoginForm, ConfigCard, FeatureToggles 等
│   │       └── hooks/         # useOptionsState, useLoginForm 等
│   │
│   ├── shared/                # 共享代码
│   │   ├── components/        # 通用组件
│   │   ├── hooks/             # useConfig, useStatus, useRuntimeMessage
│   │   ├── utils/
│   │   │   └── constants.ts   # DEFAULT_CONFIG 等常量
│   │   └── types/
│   │       └── index.ts       # TypeScript 类型定义
│   │
│   └── core/                  # 核心业务逻辑
│       ├── gotify/
│       │   ├── client.ts      # WebSocket 客户端
│       │   └── auth.ts        # 认证逻辑
│       ├── messaging/
│       │   ├── router.ts      # 消息路由
│       │   ├── context.ts     # 依赖注入容器
│       │   └── handlers/      # openTab, notification
│       ├── storage/           # 配置存储
│       ├── tabs/              # 标签页管理
│       └── notifications/     # 通知管理
│
├── assets/                    # 静态资源
├── package.json               # 项目配置（含 Plasmo srcDir）
├── tsconfig.json              # TypeScript 配置（含路径别名）
├── CLAUDE.md                  # 本文件
├── DEBUG.md                   # 调试指南
└── README.md                  # 项目说明
```

### 核心模块说明

#### 1. src/background.ts - 后台服务脚本入口
- 扩展的主入口，协调所有模块
- 初始化消息路由器和连接管理器
- 监听配置变化并自动重连
- 处理 popup/options 与 background 之间的消息通信

#### 2. src/core/gotify/client.ts - Gotify WebSocket 客户端
- 建立和维护 WebSocket 连接
- 自动重连机制（1s → 2s → 4s → ... → 最大 60s）
- 接收和解析 Gotify 消息
- 连接状态管理

#### 3. src/core/messaging/ - 消息处理系统
- **router.ts**: 消息路由，分发给对应的 handler
- **context.ts**: 依赖注入容器（MessageContext），解耦 handlers 与 storage
- **handlers/**: 各种消息处理器（openTab, notification）
- 使用依赖注入模式，handlers 通过 context 获取配置

#### 4. src/background/ - 后台管理模块
- **connection-manager.ts**: 管理 Gotify 连接和状态
- **runtime-message-handler.ts**: 处理来自 UI 的 runtime 消息

#### 5. src/shared/hooks/ - 共享 React Hooks
- **useConfig**: 配置管理（读取、保存、更新）
- **useStatus**: 状态管理（连接状态等）
- **useRuntimeMessage**: Runtime 消息通信
- 消除了 popup 和 options 中的代码重复

#### 6. src/pages/ - UI 页面组件
- **popup/**: Popup 页面（状态展示）
- **options/**: Options 页面（登录、配置、功能开关）
- 采用组件化设计，单一职责原则
- 每个页面有自己的 components 和 hooks

#### 7. src/core/storage/ - 配置存储管理
- 使用 chrome.storage.sync API 存储配置
- 配置验证（URL 和 Token 格式）
- 监听配置变化

#### 8. src/core/tabs/ 和 src/core/notifications/
- **tabs/**: 使用 Chrome Tabs API 创建和管理标签页
- **notifications/**: 显示浏览器通知

#### 9. src/shared/utils/constants.ts - 常量定义
- DEFAULT_CONFIG: 配置默认值（单一数据源）
- APP_NAME, APP_VERSION 等应用常量

#### 10. src/popup.tsx 和 src/options.tsx
- **popup.tsx**: Popup 页面入口（约100行）
- **options.tsx**: Options 页面入口（约120行）
- 通过 Plasmo 的 srcDir 配置识别为入口文件

## 架构特点

### 依赖注入模式
- 使用 `MessageContext` 作为依赖注入容器
- Handlers 通过 context 参数接收配置，不直接调用 storage
- 解耦了消息处理器与配置存储的依赖关系

### 代码复用
- `DEFAULT_CONFIG` 定义在单一位置（src/shared/utils/constants.ts）
- 共享 Hooks（useConfig, useStatus, useRuntimeMessage）消除重复
- 组件化设计，便于维护和测试

### 目录分层
- **src/core/**: 核心业务逻辑（无UI依赖）
- **src/shared/**: 跨页面共享代码（hooks, types, utils）
- **src/pages/**: UI页面组件（popup, options）
- **src/background/**: 后台服务模块

### 技术栈

- **框架**: Plasmo 0.90.5
- **UI 库**: React 18.2.0
- **语言**: TypeScript 5.3.3
- **包管理器**: pnpm（推荐）或 npm
- **构建工具**: Plasmo 内置（基于 esbuild）

### TypeScript 配置

- 继承自 `plasmo/templates/tsconfig.base`
- 路径别名：`~*` 映射到项目根目录
- 基础路径设置为项目根目录

### 导入顺序规则

Prettier 配置了自动导入排序（使用 `@ianvs/prettier-plugin-sort-imports`）：

1. Node.js 内置模块
2. 第三方依赖
3. Plasmo 相关模块 (`@plasmo/*`)
4. PlasmoHQ 相关模块 (`@plasmohq/*`)
5. 项目内部模块 (`~*` 别名)
6. 相对路径导入 (`./` 或 `../`)

### Manifest 权限

在 `package.json` 中配置了以下权限：

```json
{
  "manifest": {
    "host_permissions": ["https://*/*"],
    "permissions": [
      "storage",      // 存储配置信息
      "tabs",         // 创建和管理标签页
      "notifications" // 显示错误通知
    ]
  }
}
```

## Gotify 消息格式

### Droplink 消息规范

Droplink 使用 Gotify 消息的 `extras.droplink` 字段来传递控制指令：

```json
{
  "title": "消息标题",
  "message": "消息内容",
  "priority": 5,
  "extras": {
    "droplink": {
      "action": "openTab",
      "url": "https://example.com",
      "options": {
        "activate": true
      }
    }
  }
}
```

### 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `action` | string | 是 | 操作类型，固定为 `"openTab"` |
| `url` | string | 是 | 要打开的 URL，必须是有效的 HTTP/HTTPS URL |
| `options.activate` | boolean | 否 | 是否激活标签页，默认 `true` |

### 消息验证规则

- 必须包含 `extras.droplink` 字段
- `action` 必须为 `"openTab"`
- `url` 必须符合 URL 格式，且以 `http://` 或 `https://` 开头
- 非 Droplink 格式的消息会被静默忽略

## 使用指南

### 1. 配置 Gotify

#### 获取客户端 Token

1. 打开 Gotify Web 界面
2. 登录后，点击右上角的 **⚙️ 设置**
3. 在左侧菜单中，点击 **"Clients"（客户端）**（注意：不是 "Apps"）
4. 点击 **"Create Client"** 按钮
5. 填写客户端名称（如 "Droplink Chrome Extension"）
6. 创建后，复制生成的**客户端 Token**

#### 配置 Gotify 服务器 CORS

Gotify 服务器需要配置 CORS 才能允许 Chrome 扩展连接。

**Docker 方式**（推荐）：

```bash
docker run -d \
  --name gotify \
  -p 2345:80 \
  -e GOTIFY_SERVER_CORS_ALLOWORIGINS="*" \
  -v /path/to/data:/app/data \
  gotify/server
```

或在 `docker-compose.yml` 中添加：

```yaml
environment:
  - GOTIFY_SERVER_CORS_ALLOWORIGINS=*
```

**配置文件方式**：

编辑 `config.yml`：

```yaml
server:
  cors:
    alloworigins:
      - "*"
```

### 2. 配置扩展

1. 点击浏览器工具栏的 Droplink 扩展图标
2. 在弹出窗口中填写：
   - **Gotify 服务器地址**：如 `http://111.228.1.24:2345`
   - **客户端 Token**：刚才获取的客户端 Token
3. 勾选 **"启用 Droplink"**
4. 点击 **"测试连接"** 验证配置
5. 点击 **"保存"** 保存配置

### 3. 发送测试消息

#### 使用 curl：

```bash
curl -X POST "http://你的服务器:2345/message?token=应用TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Droplink 测试",
    "message": "自动打开 Google",
    "priority": 5,
    "extras": {
      "droplink": {
        "action": "openTab",
        "url": "https://www.google.com",
        "options": {
          "activate": true
        }
      }
    }
  }'
```

**注意**：这里使用的是**应用 Token**（用于发送消息），不是客户端 Token！

#### 使用 Python：

```python
import requests

def send_droplink(gotify_url, app_token, url, title="打开链接"):
    payload = {
        "title": title,
        "message": f"打开链接: {url}",
        "priority": 5,
        "extras": {
            "droplink": {
                "action": "openTab",
                "url": url,
                "options": {
                    "activate": True
                }
            }
        }
    }

    response = requests.post(
        f"{gotify_url}/message?token={app_token}",
        json=payload
    )
    return response

# 使用示例
send_droplink(
    "http://111.228.1.24:2345",
    "你的应用TOKEN",
    "https://github.com"
)
```

## 开发注意事项

### 热重载
开发模式下，修改代码后：
- **popup.tsx** 会自动更新
- **background.ts** 和 lib 文件需要在 `chrome://extensions/` 中点击刷新按钮

### 调试

#### 查看 Popup 日志：
1. 点击扩展图标打开弹出窗口
2. 右键点击弹出窗口，选择 **"检查"**
3. 在 Console 标签查看日志

#### 查看 Background Service Worker 日志：
1. 打开 `chrome://extensions/`
2. 找到 Droplink 扩展
3. 点击 **"Service Worker"** 的蓝色链接
4. 在 Console 标签查看详细日志

**详细的调试指南请查看 `DEBUG.md` 文件。**

### 日志过滤

开发模式下，控制台会显示大量 Plasmo HMR（热重载）日志。可以在控制台中输入过滤关键词：

- `Droplink`
- `GotifyClient`
- `MessageHandler`
- `TabManager`

### 添加新功能

如需添加新的消息处理类型：

1. 在 `types/index.ts` 中更新 `DroplinkMessage` 接口
2. 在 `lib/message-handler.ts` 中添加验证逻辑
3. 实现对应的处理函数
4. 更新本文档的消息格式说明

### 代码风格
- 不使用分号（semi: false）
- 使用双引号（singleQuote: false）
- 2 个空格缩进
- 不使用尾随逗号（trailingComma: "none"）

## 常见问题

### 1. 测试连接失败（403 错误）

**原因**：
- 使用了错误的 Token 类型（应用 Token 而非客户端 Token）
- Gotify 服务器未配置 CORS

**解决**：
- 确认使用的是**客户端 Token**（从 Clients 而非 Apps 获取）
- 配置 Gotify 服务器的 CORS 设置（见上文）

### 2. 收到消息但没有打开标签页

**排查步骤**：
1. 检查 Service Worker 控制台日志
2. 确认消息格式正确（包含 `extras.droplink` 字段）
3. 确认 URL 以 `http://` 或 `https://` 开头
4. 查看是否有红色错误信息

### 3. 连接状态显示"未连接"

**原因**：
- 配置未保存
- 未勾选"启用 Droplink"
- 服务器地址或 Token 错误
- 网络无法访问 Gotify 服务器

**解决**：
- 检查配置是否正确
- 确认"启用 Droplink"已勾选
- 使用"测试连接"功能验证

### 4. Token 的区别

Gotify 有两种 Token：

| Token 类型 | 用途 | 获取位置 |
|-----------|------|---------|
| 应用 Token | **发送**消息到 Gotify | Settings → Apps |
| 客户端 Token | **接收**消息从 Gotify | Settings → Clients |

**Droplink 扩展使用客户端 Token 接收消息。**
**发送消息的脚本使用应用 Token。**

## 安全注意事项

1. **Token 安全**：
   - Token 存储在 `chrome.storage.sync` 中（加密）
   - 不要在不安全的设备上使用
   - 定期更换 Token

2. **URL 安全**：
   - 目前只验证 URL 格式（http/https）
   - 未来可考虑添加 URL 白名单/黑名单功能

3. **消息验证**：
   - 非 Droplink 格式的消息会被忽略
   - 建议在 Gotify 中为 Droplink 创建专用的应用

## 参考资料

- [Plasmo 官方文档](https://docs.plasmo.com/)
- [Gotify 官方文档](https://gotify.net/)
- [Chrome Extension API](https://developer.chrome.com/docs/extensions/reference/)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

## 许可证

根据项目需求添加相应的开源许可证。
