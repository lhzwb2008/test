# Grok 搜索工具

这是一个使用X.AI的Grok模型进行网络搜索的工具。

## 配置

1. 复制配置模板文件：
   ```bash
   cp config.json.template config.json
   ```

2. 编辑 `config.json` 文件，将 `your-api-key-here` 替换为您的实际XAI API密钥：
   ```json
   {
     "xai": {
       "api_key": "你的XAI-API密钥",
       "base_url": "https://api.x.ai/v1/chat/completions",
       "model": "grok-beta"
     }
   }
   ```

## 使用方法

安装依赖：
```bash
npm install node-fetch@2
```

运行测试：
```bash
node test_grok_search.js
```

## 注意事项

- 请确保您的API密钥有效且有足够的额度
- 工具会自动添加随机延迟以避免频率限制
- 如果遇到403错误，可能是由于Cloudflare安全检查，请稍后重试 