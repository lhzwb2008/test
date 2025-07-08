// 导入node-fetch以支持fetch功能
const fetch = require('node-fetch');

// 简单的Zod验证实现
const z = {
  object: (shape) => ({
    parse: (data) => {
      for (const [key, validator] of Object.entries(shape)) {
        if (!(key in data)) {
          throw new Error(`Missing required field: ${key}`);
        }
        validator.parse(data[key]);
      }
      return data;
    }
  }),
  string: () => ({
    describe: (desc) => ({
      parse: (value) => {
        if (typeof value !== 'string') {
          throw new Error('Expected string');
        }
        return value;
      }
    })
  })
};

// 定义工具函数
function tool({ description, inputSchema, execute }) {
  return {
    description,
    inputSchema,
    execute
  };
}

// 添加延迟函数
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 定义搜索Web的工具
const searchWeb = tool({
  description: `search the web for info`,
  inputSchema: z.object({
    query: z
      .string()
      .describe(
        'the query to search the web for. NEVER include dates or years in the query',
      ),
  }),
  execute: async ({ query }) => {
    const API_KEY = 'xai-0E7chkGZCptPHXZq4eqQVwq0P19r14Ng8tXUUllMdiuQGKYkM17ibjxW66rkW07uCziDi2Y1asYzE5cA';
    
    // 添加随机延迟以避免频率限制
    const delay = Math.random() * 2000 + 1000; // 1-3秒随机延迟
    console.log(`等待 ${Math.round(delay)}ms 以避免频率限制...`);
    await sleep(delay);
    
    const options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'cross-site',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      body: JSON.stringify({
        "messages": [
          {
            "role": "system",
            "content": "You are a helpful assistant that can search the web for information."
          },
          {
            "role": "user",
            "content": query
          }
        ],
        "model": "grok-beta",
        "temperature": 0.7,
        "max_tokens": 1000,
        "stream": false
      }),
    };
    
    try {
      console.log('发送请求到 X.AI API...');
      console.log('请求URL:', 'https://api.x.ai/v1/chat/completions');
      console.log('请求头:', JSON.stringify(options.headers, null, 2));
      
      const response = await fetch('https://api.x.ai/v1/chat/completions', options);
      
      console.log('响应状态:', response.status, response.statusText);
      console.log('响应头:', Object.fromEntries(response.headers.entries()));
      
      const responseText = await response.text();
      console.log('响应内容前200字符:', responseText.substring(0, 200));
      
      if (!response.ok) {
        // 如果是403错误，提供更详细的错误信息
        if (response.status === 403) {
          console.error('403错误可能的原因:');
          console.error('1. API密钥无效或过期');
          console.error('2. IP地址被限制');
          console.error('3. 请求频率过高');
          console.error('4. Cloudflare安全检查');
          console.error('建议: 检查API密钥，减少请求频率，或联系X.AI支持');
        }
        throw new Error(`HTTP错误: ${response.status} ${response.statusText}\n响应内容: ${responseText}`);
      }
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(`JSON解析失败: ${parseError.message}\n响应内容: ${responseText}`);
      }
      
      console.log('解析后的数据结构:', JSON.stringify(data, null, 2));
      
      if (data.choices && data.choices[0] && data.choices[0].message) {
        return data.choices[0].message.content;
      } else {
        throw new Error(`无效的响应格式: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      console.error('搜索Web时出错:', error);
      throw error;
    }
  },
});

// 测试函数
async function testSearch() {
  try {
    console.log('开始测试Grok搜索功能...');
    
    // 验证输入
    const query = "最新的人工智能技术发展";
    const validatedInput = searchWeb.inputSchema.parse({ query });
    
    console.log(`搜索查询: ${validatedInput.query}`);
    
    // 执行搜索
    const result = await searchWeb.execute(validatedInput);
    
    console.log('搜索结果:');
    console.log(result);
    
  } catch (error) {
    console.error('测试失败:', error.message);
  }
}

// 如果直接运行此文件，则执行测试
if (require.main === module) {
  testSearch();
}

// 导出工具以供其他模块使用
module.exports = { searchWeb }; 