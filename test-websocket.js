// 在浏览器控制台（任意网页）粘贴这段代码测试 WebSocket 连接
// 替换成你的服务器地址和客户端 Token

const ws = new WebSocket('ws://111.228.1.24:2345/stream?token=CIEeZku9X9QpuH7');

ws.onopen = () => {
    console.log('✅ WebSocket 连接成功！');
};

ws.onerror = (error) => {
    console.error('❌ WebSocket 错误:', error);
};

ws.onclose = (event) => {
    console.log('WebSocket 关闭:', event.code, event.reason);
};

ws.onmessage = (event) => {
    console.log('📨 收到消息:', event.data);
};

// 10秒后关闭连接
setTimeout(() => {
    ws.close();
    console.log('测试结束');
}, 10000);
