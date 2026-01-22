# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

**Droplink** 是一个基于 [Plasmo](https://docs.plasmo.com/) 框架构建的 Chrome 浏览器扩展项目。

**项目信息**：
- **版本**: 1.0.0
- **名称**: Droplink - Cross-Device Link Sharing
- **作者**: yaotutu
- **GitHub**: https://github.com/yaotutu/droplink
- **Chrome 最低版本**: 116

### 核心功能

通过 WebSocket 连接到 Gotify 服务器，实时监听消息推送，根据消息内容自动打开指定的网页标签页。

**使用场景**：
- 📱 从移动设备快速在电脑上打开链接
- 🤖 自动化脚本完成后自动打开结果页面
- 🔗 远程控制浏览器打开特定网页
- 📋 跨设备协作，快速分享链接

### 技术特性

- ✅ WebSocket 实时连接 Gotify 服务器
- ✅ 自动重连机制（指数退避策略：1s → 2s → 4s → ... → 60s）
- ✅ 智能消息过滤（支持标签过滤）
- ✅ 消息格式验证（严格的 JSON Schema 验证）
- ✅ 自动打开并激活标签页
- ✅ 完整的错误处理和通知系统
- ✅ 多种登录方式（邮箱验证码 + Token 直连）
- ✅ 配置管理界面（Options 页面）
- ✅ 状态可视化（扩展图标徽章）
- ✅ 国际化支持（i18n）：英语 + 简体中文

---

## 常用命令

### 开发
```bash
pnpm dev
# 或
npm run dev
```
启动开发服务器后，在浏览器中加载 `build/chrome-mv3-dev` 目录。

### 构建生产版本
```bash
pnpm build
# 或
npm run build
```
生成用于发布到商店的生产构建包，输出到 `build/chrome-mv3-prod` 目录。

### 打包
```bash
pnpm package
# 或
npm run package
```
为扩展创建可发布的 ZIP 打包文件。

### 代码格式化
项目配置了 Prettier，配置文件为 `.prettierrc.mjs`。

**代码风格**：
- 不使用分号（semi: false）
- 使用双引号（singleQuote: false）
- 2 个空格缩进
- 不使用尾随逗号（trailingComma: "none"）
- 自动导入排序（使用 `@ianvs/prettier-plugin-sort-imports`）

---

## 架构和项目结构

### 目录结构

```
droplink-chrome-extension/
├── src/                       # 所有源代码
│   ├── background.ts          # 后台服务脚本入口
│   ├── popup.tsx              # Popup 页面入口
│   ├── options.tsx            # Options 页面入口
│   │
│   ├── background/            # 后台管理模块
│   │   ├── connection-manager.ts      # 连接管理器
│   │   ├── icon-manager.ts            # 图标状态管理
│   │   └── runtime-message-handler.ts # Runtime 消息处理
│   │
│   ├── pages/                 # 页面组件
│   │   ├── popup/
│   │   │   ├── components/    # StatusCard, FeatureInfo, WarningCard
│   │   │   └── hooks/         # usePopupState
│   │   └── options/
│   │       ├── components/    # LoginForm, ConfigCard, FeatureToggles 等
│   │       └── hooks/         # useOptionsState
│   │
│   ├── shared/                # 共享代码
│   │   ├── components/        # 通用组件（Switch 等）
│   │   ├── hooks/             # useConfig, useStatus, useRuntimeMessage
│   │   ├── store/             # Zustand 状态管理
│   │   ├── utils/
│   │   │   ├── constants.ts   # DEFAULT_CONFIG 等常量
│   │   │   ├── validators.ts  # 验证函数
│   │   │   ├── timeout.ts     # 超时工具
│   │   │   └── i18n.ts        # 国际化工具函数
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
│       │   └── handlers/      # openTab 等消息处理器
│       ├── storage/           # 配置存储
│       ├── tabs/              # 标签页管理
│       └── notifications/     # 通知管理
│
├── locales/                   # 国际化翻译文件
│   ├── en/
│   │   └── messages.json      # 英文翻译
│   └── zh_CN/
│       └── messages.json      # 简体中文翻译
│
├── assets/                    # 静态资源（图标等）
├── docs/                      # 文档
│   ├── QUICK_REFERENCE.md     # 快速参考
│   ├── CHROME_STORE_REQUIREMENTS.md  # Chrome 商店要求
│   └── ...
├── package.json               # 项目配置（含 Plasmo srcDir）
├── tsconfig.json              # TypeScript 配置（含路径别名）
├── .prettierrc.mjs            # Prettier 配置
├── CLAUDE.md                  # 本文件
└── README.md                  # 项目说明
```

---

## 核心模块说明

### 1. src/background.ts - 后台服务脚本入口
- 扩展的主入口，协调所有模块
- 初始化消息路由器和连接管理器
- 监听配置变化并自动重连
- 处理 popup/options 与 background 之间的消息通信

**关键职责**：
- 初始化 `ConnectionManager` 和 `RuntimeMessageHandler`
- 监听 `chrome.storage.onChanged` 事件
- 管理扩展生命周期

### 2. src/core/gotify/client.ts - Gotify WebSocket 客户端
- 建立和维护 WebSocket 连接
- 自动重连机制（指数退避：1s → 2s → 4s → ... → 最大 60s）
- 接收和解析 Gotify 消息
- 连接状态管理

**关键特性**：
- 使用 `WebSocket` API 连接 Gotify 服务器
- 实现 `EventEmitter` 模式，发出 `message`、`connected`、`disconnected` 等事件
- 自动处理网络断开和重连

### 3. src/core/messaging/ - 消息处理系统
- **router.ts**: 消息路由，分发给对应的 handler
- **context.ts**: 依赖注入容器（MessageContext），解耦 handlers 与 storage
- **handlers/**: 各种消息处理器（openTab 等）

**架构模式**：
- 使用依赖注入模式，handlers 通过 context 获取配置
- 解耦了消息处理器与配置存储的依赖关系
- 易于测试和扩展

### 4. src/background/ - 后台管理模块
- **connection-manager.ts**: 管理 Gotify 连接和状态
  - 封装 `GotifyClient`
  - 管理连接生命周期
  - 处理消息路由
- **icon-manager.ts**: 根据连接状态更新扩展图标徽章
  - 🟢 绿色圆点 = 已连接
  - 🟡 黄色圆点 = 连接中
  - 🟠 橙色圆点 = 重连中
  - 🔴 红色感叹号 = 连接错误
- **runtime-message-handler.ts**: 处理来自 UI 的 runtime 消息
  - 处理 `getConfig`、`saveConfig`、`getStatus` 等消息

### 5. src/shared/hooks/ - 共享 React Hooks
- **useConfig**: 配置管理（读取、保存、更新）
- **useStatus**: 状态管理（连接状态等）
- **useRuntimeMessage**: Runtime 消息通信
- 消除了 popup 和 options 中的代码重复

**设计原则**：
- 单一职责原则
- 可复用性
- 类型安全

### 6. src/pages/ - UI 页面组件
- **popup/**: Popup 页面（状态展示）
  - 显示连接状态
  - 显示功能信息
  - 显示警告信息
- **options/**: Options 页面（登录、配置、功能开关）
  - 邮箱验证码登录
  - Token 直连登录
  - 功能开关（通知、过滤等）
  - 配置管理

**组件化设计**：
- 采用组件化设计，单一职责原则
- 每个页面有自己的 components 和 hooks
- 使用 Zustand 进行状态管理

### 7. src/core/storage/ - 配置存储管理
- 使用 `chrome.storage.sync` API 存储配置
- 配置验证（URL 和 Token 格式）
- 监听配置变化

**存储的配置**：
- `gotifyUrl`: Gotify 服务器地址
- `clientToken`: 客户端 Token
- `openTabNotification`: 是否显示打开标签页通知
- `showAllNotifications`: 是否显示所有 Gotify 通知

### 8. src/core/tabs/ 和 src/core/notifications/
- **tabs/**: 使用 Chrome Tabs API 创建和管理标签页
  - `createTab()`: 创建新标签页
  - `activateTab()`: 激活标签页
- **notifications/**: 显示浏览器通知
  - `showNotification()`: 显示通知
  - `showError()`: 显示错误通知

### 9. src/shared/utils/constants.ts - 常量定义
- `DEFAULT_CONFIG`: 配置默认值（单一数据源）
- `APP_NAME`, `APP_VERSION`: 应用常量
- `AUTH_SERVER_URL`: 认证服务器地址
- `GOTIFY_SERVER_URL`: Gotify 服务器地址

**重要**：所有默认配置都在这里定义，避免重复。

### 10. src/popup.tsx 和 src/options.tsx
- **popup.tsx**: Popup 页面入口（约 100 行）
- **options.tsx**: Options 页面入口（约 120 行）
- 通过 Plasmo 的 `srcDir` 配置识别为入口文件

### 11. src/shared/utils/i18n.ts - 国际化工具
- 提供 `t()` 函数用于翻译文本
- 提供 `tWithPlaceholders()` 函数支持带占位符的翻译
- 使用 Chrome i18n API (`chrome.i18n.getMessage`)
- 类型安全的翻译键定义 (`I18nKey` 类型)

**翻译文件位置**：
- `locales/en/messages.json`: 英文翻译
- `locales/zh_CN/messages.json`: 简体中文翻译

**使用示例**：
```typescript
import { t } from "~/shared/utils/i18n"

// 简单翻译
const appName = t("app_name") // 返回 "Droplink"

// 带降级的翻译
const text = t("unknown_key", "默认文本")

// 带占位符的翻译（messages.json 中定义为 "Hello {name}!"）
import { tWithPlaceholders } from "~/shared/utils/i18n"
const greeting = tWithPlaceholders("greeting", { name: "World" })
```

**翻译文件格式**：
```json
{
  "app_name": {
    "message": "Droplink",
    "description": "Application name"
  },
  "settings_title": {
    "message": "{APP_NAME} Settings",
    "description": "Settings page title"
  }
}
```

---

## 架构特点

### 1. 依赖注入模式
- 使用 `MessageContext` 作为依赖注入容器
- Handlers 通过 context 参数接收配置，不直接调用 storage
- 解耦了消息处理器与配置存储的依赖关系

**优势**：
- 易于测试（可以 mock context）
- 易于扩展（添加新的 handler 不需要修改其他代码）
- 解耦模块依赖

### 2. 代码复用
- `DEFAULT_CONFIG` 定义在单一位置（src/shared/utils/constants.ts）
- 共享 Hooks（useConfig, useStatus, useRuntimeMessage）消除重复
- 组件化设计，便于维护和测试

### 3. 目录分层
- **src/core/**: 核心业务逻辑（无 UI 依赖）
- **src/shared/**: 跨页面共享代码（hooks, types, utils）
- **src/pages/**: UI 页面组件（popup, options）
- **src/background/**: 后台服务模块

**分层原则**：
- 核心逻辑与 UI 分离
- 共享代码统一管理
- 单向依赖（UI → shared → core）

### 4. 状态管理
- 使用 Zustand 进行轻量级状态管理
- 配置存储在 `chrome.storage.sync` 中
- 状态通过 Runtime 消息在 background 和 UI 之间同步

---

## 技术栈

- **框架**: Plasmo 0.90.5
- **UI 库**: React 18.2.0
- **状态管理**: Zustand 5.0.9
- **语言**: TypeScript 5.3.3
- **包管理器**: pnpm（推荐）或 npm
- **构建工具**: Plasmo 内置（基于 esbuild）
- **代码格式化**: Prettier 3.2.4

### TypeScript 配置

- 继承自 `plasmo/templates/tsconfig.base`
- 路径别名：`~*` 映射到项目根目录
- 基础路径设置为项目根目录

**示例**：
```typescript
import { Config } from "~/shared/types"
import { DEFAULT_CONFIG } from "~/shared/utils/constants"
```

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
    "permissions": [
      "storage",        // 存储配置信息
      "tabs",           // 创建和管理标签页
      "notifications"   // 显示错误通知
    ],
    "minimum_chrome_version": "116",
    "default_locale": "en"  // 默认语言为英语
  }
}
```

**语言切换**：
- 扩展会根据浏览器的语言设置自动选择对应的翻译
- 目前支持：英语 (en)、简体中文 (zh_CN)
- 如果浏览器语言不在支持列表中，会使用 `default_locale` (英语)

---

## Gotify 消息格式

### Droplink 消息规范（新格式）

Droplink 使用 Gotify 消息的 `extras.droplink` 字段来传递控制指令：

```json
{
  "title": "消息标题",
  "message": "消息内容",
  "priority": 5,
  "extras": {
    "droplink": {
      "id": "unique-message-id",
      "timestamp": 1704067200000,
      "sender": "mobile-app",
      "content": {
        "type": "url",
        "value": "https://example.com"
      },
      "actions": [
        {
          "type": "openTab",
          "params": {
            "activate": true
          }
        }
      ],
      "metadata": {
        "tags": ["work", "important"]
      }
    }
  }
}
```

### 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 否 | 消息唯一标识 |
| `timestamp` | number | 否 | 时间戳 |
| `sender` | string | 否 | 发送者标识 |
| `content.type` | string | 是 | 内容类型，固定为 `"url"` |
| `content.value` | string | 是 | 要打开的 URL |
| `actions[].type` | string | 是 | 操作类型，固定为 `"openTab"` |
| `actions[].params.activate` | boolean | 否 | 是否激活标签页，默认 `true` |
| `metadata.tags` | string[] | 否 | 消息标签，用于过滤 |

### 消息验证规则

- 必须包含 `extras.droplink` 字段
- `content.type` 必须为 `"url"`
- `content.value` 必须是有效的 HTTP/HTTPS URL
- `actions` 数组至少包含一个 `openTab` 操作
- 非 Droplink 格式的消息会被静默忽略

### 标签过滤

如果在 Options 页面配置了标签过滤：
- 只有包含指定标签的消息才会被处理
- 标签匹配不区分大小写
- 支持多个标签（OR 逻辑）

---

## 使用指南

### 1. 配置 Gotify

#### 获取客户端 Token

1. 打开 Gotify Web 界面
2. 登录后，点击右上角的 **⚙️ 设置**
3. 在左侧菜单中，点击 **"Clients"（客户端）**（⚠️ 注意：不是 "Apps"）
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

**Docker Compose**：

```yaml
services:
  gotify:
    image: gotify/server
    ports:
      - "2345:80"
    environment:
      - GOTIFY_SERVER_CORS_ALLOWORIGINS=*
    volumes:
      - ./data:/app/data
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

1. 点击浏览器工具栏的 Droplink 扩展图标，打开配置页面
2. 使用以下任一方式登录：
   - **邮箱验证码登录**：输入邮箱，获取验证码后登录
   - **Token 登录**：直接输入 Gotify 服务器地址和客户端 Token
3. 登录成功后，扩展会自动连接到 Gotify 服务器

**注意**：
- 客户端 Token 从 Gotify 的 **"Clients"（客户端）** 页面获取，不是 "Apps"
- 登录成功后可以通过扩展图标右下角的徽章颜色查看连接状态

### 3. 发送测试消息

#### 使用 curl：

```bash
curl -X POST "http://你的服务器:2345/message?token=应用TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Droplink 测试",
    "message": "打开 Google",
    "priority": 5,
    "extras": {
      "droplink": {
        "content": {
          "type": "url",
          "value": "https://www.google.com"
        },
        "actions": [
          {
            "type": "openTab",
            "params": {
              "activate": true
            }
          }
        ]
      }
    }
  }'
```

**注意**：这里使用的是**应用 Token**（用于发送消息），不是客户端 Token！

#### 使用 Python：

```python
import requests

def send_droplink(gotify_url, app_token, url, title="打开链接", tags=None):
    """发送 Droplink 消息"""
    payload = {
        "title": title,
        "message": f"打开链接: {url}",
        "priority": 5,
        "extras": {
            "droplink": {
                "content": {
                    "type": "url",
                    "value": url
                },
                "actions": [
                    {
                        "type": "openTab",
                        "params": {
                            "activate": True
                        }
                    }
                ]
            }
        }
    }

    # 添加标签（可选）
    if tags:
        payload["extras"]["droplink"]["metadata"] = {"tags": tags}

    response = requests.post(
        f"{gotify_url}/message?token={app_token}",
        json=payload
    )
    return response.json()

# 使用示例
send_droplink(
    "http://111.228.1.24:2345",
    "你的应用TOKEN",
    "https://github.com",
    tags=["work", "github"]
)
```

---

## 开发注意事项

### 热重载
开发模式下，修改代码后：
- **popup.tsx** 和 **options.tsx** 会自动更新
- **background.ts** 和 core 文件需要在 `chrome://extensions/` 中点击刷新按钮

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

**详细的调试指南请查看 `docs/` 目录下的相关文档。**

### 日志过滤

开发模式下，控制台会显示大量 Plasmo HMR（热重载）日志。可以在控制台中输入过滤关键词：

- `[Droplink]`
- `[GotifyClient]`
- `[MessageRouter]`
- `[ConnectionManager]`

### 添加新功能

#### 添加新的消息处理类型：

1. 在 `src/shared/types/index.ts` 中更新 `DroplinkAction` 接口
2. 在 `src/core/messaging/handlers/` 中创建新的 handler
3. 在 `src/core/messaging/router.ts` 中注册新的 handler
4. 更新本文档的消息格式说明

#### 添加新的配置项：

1. 在 `src/shared/types/index.ts` 中更新 `Config` 接口
2. 在 `src/shared/utils/constants.ts` 中更新 `DEFAULT_CONFIG`
3. 在 Options 页面添加对应的 UI 控件
4. 更新相关的业务逻辑

#### 添加新的翻译文本：

1. 在 `src/shared/utils/i18n.ts` 中的 `I18nKey` 类型添加新的键名
2. 在 `locales/en/messages.json` 中添加英文翻译
3. 在 `locales/zh_CN/messages.json` 中添加中文翻译
4. 在组件中使用 `t("your_key")` 调用翻译

**示例**：
```typescript
// 1. 在 i18n.ts 中添加类型
export type I18nKey =
  | "app_name"
  | "new_feature_title"  // 新增
  | ...

// 2. 在 locales/en/messages.json 中添加
{
  "new_feature_title": {
    "message": "New Feature",
    "description": "Title for new feature"
  }
}

// 3. 在 locales/zh_CN/messages.json 中添加
{
  "new_feature_title": {
    "message": "新功能",
    "description": "新功能标题"
  }
}

// 4. 在组件中使用
import { t } from "~/shared/utils/i18n"
const title = t("new_feature_title")
```

#### 添加新的语言支持：

1. 在 `locales/` 目录下创建新的语言目录（如 `ja/` 代表日语）
2. 复制 `en/messages.json` 到新目录
3. 翻译所有文本内容
4. 测试扩展在该语言环境下的显示效果

---

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
4. 检查是否配置了标签过滤，消息是否包含匹配的标签
5. 查看是否有红色错误信息

### 3. 连接状态显示"未连接"

**可能原因**：
- 配置未正确保存
- 服务器地址或 Token 错误
- 网络无法访问 Gotify 服务器
- Gotify 服务器 CORS 未配置

**解决方法**：
- 检查配置信息是否正确（服务器地址、Token）
- 确认 Gotify 服务器已配置 CORS（见上文）
- 检查网络连接
- 查看浏览器扩展的 Service Worker 控制台日志

### 4. Token 的区别

Gotify 有两种 Token：

| Token 类型 | 用途 | 获取位置 |
|-----------|------|---------|
| 应用 Token | **发送**消息到 Gotify | Settings → Apps |
| 客户端 Token | **接收**消息从 Gotify | Settings → Clients |

**Droplink 扩展使用客户端 Token 接收消息。**
**发送消息的脚本使用应用 Token。**

---

## 安全注意事项

1. **Token 安全**：
   - Token 存储在 `chrome.storage.sync` 中（Chrome 会加密）
   - 不要在不安全的设备上使用
   - 定期更换 Token
   - 不要在公共场所展示包含 Token 的配置页面

2. **URL 安全**：
   - 目前只验证 URL 格式（http/https）
   - 建议在 Gotify 中为 Droplink 创建专用的应用
   - 谨慎处理来自不可信来源的消息

3. **消息验证**：
   - 非 Droplink 格式的消息会被忽略
   - 支持标签过滤，只接收特定标签的消息
   - 严格的 JSON Schema 验证

---

## 参考资料

- [Plasmo 官方文档](https://docs.plasmo.com/)
- [Gotify 官方文档](https://gotify.net/)
- [Chrome Extension API](https://developer.chrome.com/docs/extensions/reference/)
- [Chrome i18n API](https://developer.chrome.com/docs/extensions/reference/api/i18n)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [TypeScript 官方文档](https://www.typescriptlang.org/)
- [React 官方文档](https://react.dev/)
- [Zustand 官方文档](https://zustand-demo.pmnd.rs/)

---

## 开发最佳实践

### 1. 代码组织
- 遵循单一职责原则
- 保持函数简短（< 50 行）
- 使用有意义的变量名和函数名
- 添加必要的注释和文档

### 2. 类型安全
- 充分利用 TypeScript 的类型系统
- 避免使用 `any` 类型
- 为所有函数添加类型注解
- 使用接口和类型别名

### 3. 错误处理
- 使用 try-catch 捕获异常
- 提供有意义的错误消息
- 记录错误日志
- 向用户显示友好的错误提示

### 4. 性能优化
- 避免不必要的重新渲染
- 使用 React.memo 和 useMemo
- 合理使用 useCallback
- 避免在循环中创建函数

### 5. 测试
- 为核心业务逻辑编写单元测试
- 测试边界情况和错误处理
- 使用 mock 隔离依赖
- 保持测试简单和可维护

---

## 许可证

根据项目需求添加相应的开源许可证。

---

## 经验教训和规则

以下规则是从实际开发中总结的经验教训，帮助避免重复犯同样的错误：

- 禁止使用固定延迟（setTimeout）来解决异步时序问题，必须找到并修复根本原因
- Chrome Extension 中，UI 层只负责保存配置，连接管理统一由 Background 层通过 chrome.storage.onChanged 处理
- 对于可能被多次调用的初始化函数，必须添加状态标志（isInitializing/isInitialized）防止重复执行
- Chrome Extension 中，chrome.storage.onChanged 是配置同步的唯一来源，不要在保存配置后手动更新本地状态
