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
      const response = await fetch('https://api.x.ai/v1/chat/completions', options);
      const data = await response.json();
      return data.choices[0].message.content;
    },
  });