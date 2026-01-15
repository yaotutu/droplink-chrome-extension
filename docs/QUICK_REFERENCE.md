# Chrome Web Store 提交快速参考

## 🚀 快速填写指南

这是一个快速参考文档，包含所有需要填写的内容。直接复制粘贴到 Chrome Web Store 提交表单中。

---

## 📋 基本信息

### 扩展名称
```
Droplink - Cross-Device Link Sharing
```

### 简短描述（132 字符以内）
```
Instantly receive links from your phone to your browser. One tap on mobile, auto-open on desktop.
```

### 产品类别
```
Productivity（生产力）
```

### 语言
```
主要语言: English
次要语言: 中文（简体）
```

---

## 📝 详细描述（复制到商店描述框）

### 英文版本
```
Droplink makes cross-device link sharing effortless. Share a link from your phone, and it instantly opens in your browser - no copy-paste needed.

🚀 KEY FEATURES

• Instant Link Delivery
  Share from your Android phone, auto-open in Chrome browser

• Real-time Sync
  WebSocket-based push notification, no polling, no delay

• Privacy First
  Self-hosted option available, no tracking, no analytics

• Simple Setup
  Email verification only, no phone number required

• Multiple Actions
  Open tab or just notify

📱 HOW IT WORKS

1. Install this Chrome extension
2. Install Droplink Android app (coming soon)
3. Sign in with the same email on both devices
4. Share any link from your phone
5. It opens automatically in your browser

🔒 PRIVACY & SECURITY

• No tracking, no analytics
• Messages encrypted in transit
• Self-hosted deployment supported
• Open source (MIT License)
• All data stored locally

💡 USE CASES

• Reading articles: Small phone screen → Large desktop screen
• Shopping: Browse on mobile → Checkout on desktop
• Research: Collect links on-the-go → Review on computer
• Sharing: Quick share between your devices

🛠️ TECHNICAL DETAILS

• Built with Plasmo framework
• Uses Gotify for real-time messaging
• Minimal permissions required
• Lightweight and fast
• No background data collection

📖 OPEN SOURCE

This extension is open source and available on GitHub. You can review the code, report issues, or contribute to the project.

🆘 SUPPORT

If you encounter any issues or have questions, please visit our GitHub repository or contact us via email.

---

Droplink is perfect for anyone who frequently switches between phone and computer. Stop copying and pasting links - let Droplink do it for you automatically.
```

---

## 🔒 隐私权规范（Privacy Practices）

### 1. 单一用途说明（Single Purpose）
```
Droplink is a cross-device link sharing tool with a single purpose: to receive links sent from mobile devices and automatically open them in the browser.

The extension listens for incoming link messages via WebSocket connection and performs the following actions:
- Opens the received link in a new browser tab
- Shows a notification (optional)

All features serve this single purpose of seamless cross-device link delivery.
```

### 2. 远程代码使用理由（Remote Code）
```
This extension does NOT use any remote code. All code is bundled within the extension package and executed locally.

The extension only connects to a self-hosted or user-configured Gotify server for receiving push notifications via WebSocket. No external scripts are loaded or executed.

The WebSocket connection is used solely for receiving JSON messages containing links, not for loading or executing remote code.
```

### 3. 主机权限理由（Host Permissions: https://*/*）
```
The host permission "https://*/*" is required for the following reasons:

1. User-configured server connection: Users can configure their own Gotify server URL (e.g., https://gotify.example.com). The extension needs to connect to any HTTPS domain the user specifies.

2. WebSocket connection: The extension establishes a WebSocket connection to the user's Gotify server to receive real-time link notifications.

3. No content script injection: This permission is NOT used to inject content scripts into web pages or access page content. It is solely for connecting to the user's messaging server.

The extension respects user privacy and only connects to the server URL explicitly configured by the user in the settings page.
```

### 4. notifications 权限理由
```
The "notifications" permission is used to show desktop notifications when a new link is received from the mobile device.

Use case: When the user is working in another application or browser tab, the notification alerts them that a new link has been received and opened. This provides immediate feedback and improves user experience.

Notifications display:
- Title: "Droplink"
- Message: The received link URL
- Icon: Extension icon

This feature is optional and can be disabled by the user in the extension settings.
```

### 5. storage 权限理由
```
The "storage" permission is used to save user settings and authentication tokens locally.

Stored data includes:
1. Server configuration: Gotify server URL configured by the user
2. Authentication token: Client token for connecting to the Gotify server
3. User preferences: Settings such as auto-open tabs, show notifications
4. User email: Email address used for authentication

All data is stored locally using Chrome's storage API and is never transmitted to third parties. The data is only used for the extension's core functionality of receiving and processing links.
```

### 6. tabs 权限理由
```
The "tabs" permission is used to open received links in new browser tabs, which is the core functionality of this extension.

Use case: When a link is received from the mobile device, the extension automatically creates a new tab and navigates to the received URL. This allows users to seamlessly continue reading on their desktop what they found on their mobile device.

The permission is used exclusively for:
- Creating new tabs with chrome.tabs.create()
- Opening the received link URL in the new tab

The extension does NOT:
- Read content from existing tabs
- Modify existing tabs
- Track browsing history
- Access sensitive tab information
```

---

## 🔐 数据使用情况确认

### 数据收集
```
☑ 本扩展收集以下数据：
  - 用户邮箱（仅用于认证）
  - 服务器配置（本地存储）
  - 认证令牌（本地存储）
```

### 数据使用
```
☑ 收集的数据仅用于扩展的核心功能
☑ 数据不会与第三方共享
☑ 数据不会用于广告或营销目的
☑ 数据不会用于分析或追踪
```

### 数据传输
```
☑ 数据仅在用户设备和用户配置的服务器之间传输
☑ 不会将数据传输给开发者或第三方服务
☑ 所有传输都通过 HTTPS 加密
```

### 数据存储
```
☑ 数据仅存储在用户本地设备
☑ 使用 Chrome 的 storage API 进行本地存储
☑ 用户可以随时删除存储的数据
```

---

## 🌐 其他信息

### 隐私政策 URL（必填）
```
https://github.com/yourusername/droplink/blob/main/droplink-chrome-extension/PRIVACY_POLICY.md
```

**注意**: 需要先将 PRIVACY_POLICY.md 推送到 GitHub，并确保 URL 可以公开访问。

### 官方网站（可选）
```
https://github.com/yourusername/droplink
```

### 支持 URL（可选）
```
https://github.com/yourusername/droplink/issues
```

### 联系邮箱
```
support@droplink.example.com
```

**注意**: 请替换为你的真实邮箱地址。

---

## 📸 截图清单

### 必需截图（至少 1 张）
- [ ] 截图 1: 登录/配置界面
- [ ] 截图 2: 连接状态展示
- [ ] 截图 3: 自动打开链接

### 推荐截图（可选）
- [ ] 截图 4: 功能设置页面
- [ ] 截图 5: 使用场景示意

### 截图规格
- **尺寸**: 1280x800（推荐）或 640x400
- **格式**: PNG 或 JPG
- **大小**: 每张不超过 2MB

---

## 🎨 图标清单

### 应用图标（自动生成）
Plasmo 会自动从 `assets/icon.png` 生成以下尺寸：
- [x] 16x16
- [x] 32x32
- [x] 48x48
- [x] 64x64
- [x] 128x128

### 宣传图片（可选）
- [ ] 小宣传图: 440x280
- [ ] 大宣传图: 1400x560

---

## 📦 构建和打包

### 步骤 1: 更新版本号
```bash
# 已在 package.json 中更新为 1.0.0
```

### 步骤 2: 构建生产版本
```bash
cd ../droplink-chrome-extension
pnpm build
# 或
npm run build
```

### 步骤 3: 检查构建结果
```bash
ls -la build/chrome-mv3-prod/
```

### 步骤 4: 打包 ZIP
```bash
cd build/chrome-mv3-prod
zip -r ../../droplink-chrome-extension-v1.0.0.zip .
cd ../..
```

### 步骤 5: 验证 ZIP 文件
```bash
# 检查文件大小（不应超过 128 MB）
ls -lh droplink-chrome-extension-v1.0.0.zip

# 查看 ZIP 内容
unzip -l droplink-chrome-extension-v1.0.0.zip
```

---

## ✅ 提交前检查清单

### 基本信息
- [ ] 扩展名称已填写
- [ ] 简短描述已填写（不超过 132 字符）
- [ ] 详细描述已填写（至少 25 个字符）
- [ ] 产品类别已选择（Productivity）
- [ ] 语言已选择（English）

### 隐私权规范
- [ ] 单一用途说明已填写
- [ ] 远程代码使用理由已填写
- [ ] 主机权限理由已填写
- [ ] notifications 权限理由已填写
- [ ] storage 权限理由已填写
- [ ] tabs 权限理由已填写
- [ ] 数据使用情况已确认

### 图形资源
- [ ] 至少 1 个截图已上传
- [ ] 应用图标已包含在构建中

### 其他信息
- [ ] 隐私政策 URL 已提供（且可公开访问）
- [ ] 联系邮箱已填写
- [ ] 官方网站已填写（可选）
- [ ] 支持 URL 已填写（可选）

### 技术准备
- [ ] 生产版本已构建
- [ ] ZIP 文件已创建
- [ ] ZIP 文件大小合理（< 128 MB）
- [ ] manifest.json 版本号正确（1.0.0）

### 最终确认
- [ ] 所有必填项已填写
- [ ] 已点击"保存草稿"
- [ ] 准备提交审核

---

## 🚨 重要提醒

### 隐私政策 URL
在提交前，必须：
1. 将 `PRIVACY_POLICY.md` 推送到 GitHub
2. 确保 URL 可以公开访问
3. 在提交表单中填写正确的 URL

### GitHub URL 替换
文档中所有的 `yourusername` 需要替换为你的实际 GitHub 用户名：
- `https://github.com/yourusername/droplink`
- 替换为: `https://github.com/你的用户名/droplink`

### 邮箱地址
将 `support@droplink.example.com` 替换为你的真实邮箱地址。

### 截图制作
参考 `docs/SCREENSHOT_GUIDE.md` 制作截图。

---

## 📞 需要帮助？

### 详细文档
- **完整要求**: `docs/CHROME_STORE_REQUIREMENTS.md`
- **截图指南**: `docs/SCREENSHOT_GUIDE.md`
- **隐私政策**: `PRIVACY_POLICY.md`

### 官方资源
- [Chrome Web Store 开发者文档](https://developer.chrome.com/docs/webstore/)
- [扩展发布指南](https://developer.chrome.com/docs/webstore/publish/)
- [审核政策](https://developer.chrome.com/docs/webstore/program-policies/)

### 联系方式
- GitHub Issues: https://github.com/yourusername/droplink/issues
- 邮箱: support@droplink.example.com

---

## 🎉 提交流程

1. **注册开发者账号**
   - 访问: https://chrome.google.com/webstore/devconsole
   - 支付 $5 一次性注册费

2. **创建新项目**
   - 点击"新增项目"
   - 上传 ZIP 文件

3. **填写商店信息**
   - 使用本文档中的内容填写所有字段
   - 上传截图

4. **保存草稿**
   - 填写完成后点击"保存草稿"
   - 检查是否有错误提示

5. **提交审核**
   - 认所有信息正确
   - 点击"提交审核"
   - 等待审核结果（通常 1-3 个工作日）

---

**祝你上架顺利！** 🚀
