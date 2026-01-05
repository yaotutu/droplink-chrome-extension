# 如何查看 Droplink 扩展的日志

## 1. 查看 Popup 日志

1. 点击浏览器工具栏的 Droplink 扩展图标，打开弹出窗口
2. **右键点击**弹出窗口内的任意位置
3. 选择 **"检查"** 或 **"Inspect"**
4. 这会打开 Chrome 开发者工具
5. 切换到 **Console（控制台）** 标签页
6. 现在点击"测试连接"按钮，观察控制台输出

你会看到类似这样的日志：
```
加载数据失败: ...
测试连接失败: ...
```

## 2. 查看 Background Service Worker 日志

1. 在新标签页中打开 `chrome://extensions/`
2. 确保右上角的 **"开发者模式"** 已启用
3. 找到 **Droplink chrome extension** 扩展
4. 在扩展卡片中，找到 **"Service Worker"** 链接
5. 点击 **"Service Worker"** 右侧的蓝色链接（可能显示为 "检查视图" 或 "Inspect"）
6. 这会打开另一个开发者工具窗口
7. 切换到 **Console（控制台）** 标签页

你会看到 background.ts 的日志，例如：
```
[Background] 初始化 Droplink 扩展
[GotifyClient] 连接到: https://gotify.example.com
[GotifyClient] WebSocket 错误: ...
```

## 3. 查看网络日志

在 Service Worker 的开发者工具中：
1. 切换到 **Network（网络）** 标签页
2. 确保勾选 **"Preserve log"（保留日志）**
3. 点击"测试连接"按钮
4. 观察网络请求列表

查找 WebSocket 连接请求（通常是 `stream?token=...`）：
- 如果显示红色或失败状态，点击查看详细错误
- 查看 Headers（请求头）和 Response（响应）

## 4. 常见错误和解决方法

### 错误 1: CORS 错误
```
Access to WebSocket at 'wss://...' from origin 'chrome-extension://...' has been blocked by CORS policy
```
**原因**: Gotify 服务器没有正确配置 CORS
**解决**: 需要在 Gotify 服务器配置中允许 WebSocket 连接

### 错误 2: 连接被拒绝
```
WebSocket connection to 'wss://...' failed: Error in connection establishment
```
**原因**:
- 服务器地址错误
- 服务器未运行
- 网络无法访问
**解决**: 检查服务器地址是否正确，确认服务器正在运行

### 错误 3: Token 无效
```
WebSocket connection to 'wss://...' failed: Error during WebSocket handshake: Unexpected response code: 401
```
**原因**: 客户端 Token 无效或过期
**解决**: 在 Gotify 设置中重新生成客户端 Token

### 错误 4: URL 格式错误
```
Failed to construct 'URL': Invalid URL
```
**原因**: Gotify 服务器地址格式不正确
**解决**: 确保地址格式为 `https://gotify.example.com`（不要添加 `/stream` 等路径）

## 5. 调试技巧

### 在代码中添加更多日志
如果需要更详细的日志，可以临时在代码中添加 console.log：

在 `lib/gotify-client.ts` 的 `buildWebSocketUrl` 方法后添加：
```typescript
console.log("[DEBUG] WebSocket URL:", wsUrl)
```

### 重新加载扩展
修改代码后，需要重新加载扩展：
1. 打开 `chrome://extensions/`
2. 找到 Droplink 扩展
3. 点击 **刷新（圆圈箭头）** 按钮

## 6. 完整的调试流程

1. 打开 Service Worker 控制台（始终保持打开）
2. 打开 Popup 并打开其控制台
3. 在 Popup 中输入配置信息
4. 点击"测试连接"
5. 同时观察两个控制台的输出
6. 如果有网络错误，切换到 Service Worker 的 Network 标签页查看 WebSocket 请求详情

按照这些步骤，你应该能够找到测试连接失败的具体原因了！
