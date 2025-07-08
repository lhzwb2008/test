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
    
    const options = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "messages": [
          {
            "role": "user",
            "content": query
          }
        ],
        "search_parameters": {
          "mode": "auto"
        },
        "model": "grok-3-latest"
      }),
    };
    
    try {
      console.log('发送请求到 X.AI API...');
      const response = await fetch('https://api.x.ai/v1/chat/completions', options);
      
      console.log('响应状态:', response.status, response.statusText);
      console.log('响应头:', Object.fromEntries(response.headers.entries()));
      
      const responseText = await response.text();
      console.log('响应内容前200字符:', responseText.substring(0, 200));
      
      if (!response.ok) {
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