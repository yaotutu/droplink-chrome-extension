# Droplink - 跨设备链接分享扩展

<div align="center">

**一键从手机发送链接，自动在电脑浏览器打开**

[![Chrome Web Store](https://img.shields.io/badge/Chrome-Web%20Store-blue?logo=google-chrome)](https://chrome.google.com/webstore)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-orange.svg)](package.json)

[English](README_EN.md) | 简体中文

</div>

---

## 📖 项目简介

**Droplink** 是一个基于 [Plasmo](https://docs.plasmo.com/) 框架开发的 Chrome 浏览器扩展，通过 WebSocket 实时连接 Gotify 服务器，让你能够从任何设备（手机、平板、其他电脑）快速发送链接到浏览器并自动打开。

### 🎯 使用场景

- 📱 **移动端分享**：在手机上看到有趣的文章，一键发送到电脑浏览器打开
- 🤖 **自动化脚本**：脚本任务完成后自动打开结果页面
- 🔗 **远程控制**：从任何地方远程控制浏览器打开特定网页
- 📋 **跨设备协作**：团队成员之间快速分享链接

### ✨ 核心特性

- ✅ **实时连接**：WebSocket 长连接，消息即时送达
- ✅ **自动重连**：网络断开自动重连，采用指数退避策略
- ✅ **智能过滤**：支持标签过滤，只接收你关心的消息
- ✅ **多种登录**：支持邮箱验证码登录和 Token 直连
- ✅ **状态可视**：扩展图标实时显示连接状态
- ✅ **安全可靠**：配置加密存储，消息格式严格验证
- ✅ **开源免费**：完全开源，可自建服务器

---

## 🚀 快速开始

### 前置要求

- Chrome 浏览器 116+
- Gotify 服务器（[自建教程](#gotify-服务器配置)）
- Node.js 16+ 和 pnpm（开发需要）

### 安装扩展

#### 方式一：从 Chrome 应用商店安装（推荐）

1. 访问 [Chrome Web Store](https://chrome.google.com/webstore)
2. 搜索 "Droplink"
3. 点击"添加至 Chrome"

#### 方式二：手动安装开发版

1. 下载最新的 [Release](https://github.com/yourusername/droplink/releases)
2. 解压 ZIP 文件
3. 打开 Chrome 浏览器，访问 `chrome://extensions/`
4. 开启右上角的"开发者模式"
5. 点击"加载已解压的扩展程序"，选择解压后的文件夹

---

## 📝 使用指南

### 1. 配置 Gotify 服务器

#### 获取客户端 Token

1. 打开 Gotify Web 界面并登录
2. 点击右上角的 **⚙️ 设置**
3. 在左侧菜单选择 **"Clients"（客户端）**（⚠️ 不是 "Apps"）
4. 点击 **"Create Client"** 按钮
5. 填写客户端名称（如 "Droplink Chrome Extension"）
6. 复制生成的**客户端 Token**

#### 配置 CORS（重要）

Gotify 服务器需要配置 CORS 才能允许浏览器扩展连接。

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

1. 点击浏览器工具栏的 Droplink 扩展图标
2. 选择登录方式：
   - **邮箱验证码登录**：输入邮箱，获取验证码后登录
   - **Token 登录**：直接输入 Gotify 服务器地址和客户端 Token
3. 登录成功后，扩展会自动连接到 Gotify 服务器

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

def send_droplink(gotify_url, app_token, url, title="打开链接"):
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

    response = requests.post(
        f"{gotify_url}/message?token={app_token}",
        json=payload
    )
    return response.json()

# 使用示例
send_droplink(
    "http://111.228.1.24:2345",
    "你的应用TOKEN",
    "https://github.com"
)
```

### 4. 连接状态说明

扩展图标右下角的徽章颜色表示连接状态：

| 徽章 | 状态 | 说明 |
|------|------|------|
| 🟢 绿色圆点 | 已连接 | 正常工作中 |
| 🟡 黄色圆点 | 连接中 | 正在建立连接 |
| 🟠 橙色圆点 | 重连中 | 网络断开，正在重连 |
| 🔴 红色感叹号 | 连接错误 | 配置错误或服务器不可达 |

---

## 🔧 开发指南

### 环境准备

```bash
# 克隆仓库
git clone https://github.com/yourusername/droplink-chrome-extension.git
cd droplink-chrome-extension

# 安装依赖（推荐使用 pnpm）
pnpm install
# 或
npm install
```

### 开发命令

```bash
# 启动开发服务器（支持热重载）
pnpm dev

# 构建生产版本
pnpm build

# 打包为 ZIP（用于发布）
pnpm package
```

### 加载开发版扩展

1. 运行 `pnpm dev` 启动开发服务器
2. 打开 Chrome 浏览器，访问 `chrome://extensions/`
3. 开启"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择项目的 `build/chrome-mv3-dev` 目录

### 调试技巧

#### 查看 Popup 日志：
1. 点击扩展图标打开弹出窗口
2. 右键点击弹出窗口，选择 **"检查"**
3. 在 Console 标签查看日志

#### 查看 Background Service Worker 日志：
1. 打开 `chrome://extensions/`
2. 找到 Droplink 扩展
3. 点击 **"Service Worker"** 的蓝色链接
4. 在 Console 标签查看详细日志

#### 日志过滤：

在控制台中输入以下关键词过滤日志：
- `Droplink`
- `GotifyClient`
- `MessageRouter`
- `ConnectionManager`

---

## 🏗️ 项目架构

### 目录结构

```
droplink-chrome-extension/
├── src/
│   ├── background.ts              # 后台服务入口
│   ├── popup.tsx                  # Popup 页面入口
│   ├── options.tsx                # Options 页面入口
│   │
│   ├── background/                # 后台管理模块
│   │   ├── connection-manager.ts  # 连接管理器
│   │   ├── icon-manager.ts        # 图标状态管理
│   │   └── runtime-message-handler.ts  # Runtime 消息处理
│   │
│   ├── core/                      # 核心业务逻辑
│   │   ├── gotify/                # Gotify 客户端
│   │   │   ├── client.ts          # WebSocket 客户端
│   │   │   └── auth.ts            # 认证逻辑
│   │   ├── messaging/             # 消息处理系统
│   │   │   ├── router.ts          # 消息路由
│   │   │   ├── context.ts         # 依赖注入容器
│   │   │   └── handlers/          # 消息处理器
│   │   ├── storage/               # 配置存储
│   │   ├── tabs/                  # 标签页管理
│   │   └── notifications/         # 通知管理
│   │
│   ├── pages/                     # UI 页面组件
│   │   ├── popup/                 # Popup 页面
│   │   │   ├── components/        # StatusCard, FeatureInfo, WarningCard
│   │   │   └── hooks/             # usePopupState
│   │   └── options/               # Options 页面
│   │       ├── components/        # LoginForm, ConfigCard, FeatureToggles 等
│   │       └── hooks/             # useOptionsState
│   │
│   └── shared/                    # 共享代码
│       ├── components/            # 通用组件（Switch 等）
│       ├── hooks/                 # useConfig, useStatus, useRuntimeMessage
│       ├── store/                 # Zustand 状态管理
│       ├── types/                 # TypeScript 类型定义
│       └── utils/                 # 工具函数和常量
│
├── assets/                        # 静态资源（图标等）
├── docs/                          # 文档
├── package.json                   # 项目配置
├── tsconfig.json                  # TypeScript 配置
├── .prettierrc.mjs                # Prettier 配置
├── CLAUDE.md                      # Claude Code 指南
└── README.md                      # 本文件
```

### 技术栈

- **框架**：Plasmo 0.90.5
- **UI 库**：React 18.2.0
- **状态管理**：Zustand 5.0.9
- **语言**：TypeScript 5.3.3
- **包管理器**：pnpm（推荐）
- **代码格式化**：Prettier 3.2.4

### 核心模块说明

#### 1. 后台服务（src/background/）
- **connection-manager.ts**：管理 Gotify WebSocket 连接和状态
- **icon-manager.ts**：根据连接状态更新扩展图标徽章
- **runtime-message-handler.ts**：处理来自 UI 的 runtime 消息

#### 2. 核心业务逻辑（src/core/）
- **gotify/**：WebSocket 客户端和认证逻辑
- **messaging/**：消息路由和处理系统（依赖注入模式）
- **storage/**：配置存储和验证
- **tabs/**：标签页创建和管理
- **notifications/**：浏览器通知

#### 3. UI 页面（src/pages/）
- **popup/**：状态展示页面
- **options/**：配置和登录页面

#### 4. 共享代码（src/shared/）
- **hooks/**：React Hooks（useConfig, useStatus, useRuntimeMessage）
- **store/**：Zustand 全局状态
- **types/**：TypeScript 类型定义
- **utils/**：工具函数和常量

### 架构特点

- ✅ **依赖注入**：使用 MessageContext 解耦模块依赖
- ✅ **代码复用**：共享 Hooks 消除重复代码
- ✅ **组件化设计**：单一职责原则，易于维护
- ✅ **类型安全**：完整的 TypeScript 类型定义
- ✅ **状态管理**：Zustand 轻量级状态管理

---

## 📋 Gotify 消息格式

### Droplink 消息规范

Droplink 使用 Gotify 消息的 `extras.droplink` 字段来传递控制指令：

```json
{
  "title": "消息标题",
  "message": "消息内容",
  "priority": 5,
  "extras": {
    "droplink": {
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

---

## ❓ 常见问题

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

**可能原因**：
- 配置未正确保存
- 服务器地址或 Token 错误
- 网络无法访问 Gotify 服务器
- Gotify 服务器 CORS 未配置

**解决方法**：
- 检查配置信息是否正确
- 确认 Gotify 服务器已配置 CORS
- 检查网络连接
- 查看 Service Worker 控制台日志

### 4. Token 的区别

Gotify 有两种 Token：

| Token 类型 | 用途 | 获取位置 |
|-----------|------|---------|
| 应用 Token | **发送**消息到 Gotify | Settings → Apps |
| 客户端 Token | **接收**消息从 Gotify | Settings → Clients |

**Droplink 扩展使用客户端 Token 接收消息。**
**发送消息的脚本使用应用 Token。**

---

## 🔒 安全注意事项

1. **Token 安全**：
   - Token 存储在 `chrome.storage.sync` 中（加密）
   - 不要在不安全的设备上使用
   - 定期更换 Token

2. **URL 安全**：
   - 目前只验证 URL 格式（http/https）
   - 建议在 Gotify 中为 Droplink 创建专用的应用

3. **消息验证**：
   - 非 Droplink 格式的消息会被忽略
   - 支持标签过滤，只接收特定标签的消息

---

## 🤝 贡献指南

欢迎贡献代码、报告问题或提出建议！

### 贡献流程

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 代码规范

- 使用 Prettier 格式化代码
- 遵循 TypeScript 最佳实践
- 添加必要的注释和文档
- 确保所有功能正常工作

---

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

---

## 🔗 相关链接

- [Plasmo 官方文档](https://docs.plasmo.com/)
- [Gotify 官方文档](https://gotify.net/)
- [Chrome Extension API](https://developer.chrome.com/docs/extensions/reference/)
- [问题反馈](https://github.com/yourusername/droplink/issues)

---

## 📮 联系方式

- 作者：yaotutu
- 项目主页：https://github.com/yourusername/droplink
- 问题反馈：https://github.com/yourusername/droplink/issues

---

<div align="center">

**如果这个项目对你有帮助，请给个 ⭐️ Star 支持一下！**

Made with ❤️ by yaotutu

</div>
