export const searchWeb = tool({
    description: `search the web for info`,
    inputSchema: z.object({
      query: z
        .string()
        .describe(
          'the query to search the web for. NEVER include dates or years in the query',
        ),
    }),
    execute: async ({ query }) => {
      const options = {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.X_AI_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "messages": [
            {
              "role": "system",
              "content": `You are an information extraction expert designed to:
1. Identify the core data requirements from any website generation request
2. Construct precise search queries to gather specific website assets
3. Return ONLY raw materials/data found through search (text snippets, image URLs, metadata, etc.)
4. NEVER generate any website components (code, layouts, designs)
5. NEVER provide implementation instructions or development advice
6. Format output as: {materials: [list of assets], data_sources: [list of URLs]}

Critical Reminders:
- Extract requirements → Search → Return ONLY raw materials
- If real-time data required: "Error: Real-time data cannot be retrieved via search"
- If assets unavailable: "No relevant materials found through search"`
            },
            {
              "role": "user",
              "content": query
            }
          ],
          "search_parameters": {
            "mode": "on",
            "sources": [
              {"type": "web"},
              {"type": "x"},
              {"type": "news"}
            ]
          },
          "model": "grok-3-latest"
        }),
      };
      const response = await fetch('https://api.x.ai/v1/chat/completions', options);
      const data = await response.json();
      return data.choices[0].message.content;
    },
  });