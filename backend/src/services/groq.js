/**
 * Groq AI Service - sử dụng llama-3.3-70b-versatile
 * Groq dùng OpenAI-compatible API với tool calling
 */
import dotenv from 'dotenv';
import { executeQuery, listTables, describeTable, getDatabaseOverview } from './tools.js';

dotenv.config();

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

const SYSTEM_PROMPT = `Bạn là DataLens AI - trợ lý phân tích dữ liệu thông minh tích hợp trong DataLens Portal.

## Khả năng:
- Truy vấn dữ liệu từ PostgreSQL bằng SQL
- Phân tích, mô tả và diễn giải dữ liệu
- Tạo biểu đồ và bảng trực quan
- Đưa ra insights và gợi ý

## Khi trả lời có dữ liệu, dùng định dạng:
Biểu đồ cột:
\`\`\`chart
{"type":"bar","title":"Tiêu đề","labels":["A","B"],"data":[100,200],"color":"#10B981"}
\`\`\`
Bảng dữ liệu:
\`\`\`datatable
{"headers":["Cột 1","Cột 2"],"rows":[["A","1"],["B","2"]]}
\`\`\`
SQL đã chạy:
\`\`\`sql
SELECT ...
\`\`\`

Trả lời hoàn toàn bằng **tiếng Việt**, rõ ràng và dễ hiểu.`;

const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'execute_query',
      description: 'Thực thi SQL SELECT để lấy dữ liệu từ database',
      parameters: {
        type: 'object',
        properties: { sql: { type: 'string', description: 'Câu SQL SELECT hoàn chỉnh' } },
        required: ['sql'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'list_tables',
      description: 'Liệt kê tất cả bảng và view trong database',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'describe_table',
      description: 'Xem cấu trúc chi tiết của một bảng',
      parameters: {
        type: 'object',
        properties: { table_name: { type: 'string' } },
        required: ['table_name'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_database_overview',
      description: 'Thống kê tổng quan database',
      parameters: { type: 'object', properties: {} },
    },
  },
];

async function callGroqStream(messages, useTools = true) {
  const body = {
    model: GROQ_MODEL,
    messages,
    max_tokens: 4096,
    temperature: 0.1,
    stream: true,
    ...(useTools && { tools: TOOLS, tool_choice: 'auto' }),
  };

  const resp = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Groq API error ${resp.status}: ${err}`);
  }

  return resp.body;
}

export async function processGroqChat(messages, onEvent, allowedTables = null) {
  const permissionNote = allowedTables !== null
    ? `\n\n## Quyền truy cập của người dùng này:\nChỉ được phép dùng các bảng sau: ${allowedTables.join(', ')}.\nTUYỆT ĐỐI không truy vấn hoặc mô tả bất kỳ bảng nào khác ngoài danh sách trên.`
    : '';

  const currentMessages = [
    { role: 'system', content: SYSTEM_PROMPT + permissionNote },
    ...messages.map(m => ({ role: m.role, content: m.content })),
  ];

  let iteration = 0;
  const MAX_ITER = 10;

  while (iteration < MAX_ITER) {
    iteration++;
    onEvent({ type: 'thinking', message: iteration === 1 ? 'Đang phân tích...' : 'Đang xử lý...' });

    const stream = await callGroqStream(currentMessages);
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    let lastMessage = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();

      for (const line of lines) {
        const cleaned = line.trim();
        if (!cleaned || cleaned === 'data: [DONE]') continue;
        if (!cleaned.startsWith('data: ')) continue;

        try {
          const json = JSON.parse(cleaned.slice(6));
          const delta = json.choices[0].delta;

          if (delta.content) {
            onEvent({ type: 'text', text: delta.content });
            if (!lastMessage) lastMessage = { role: 'assistant', content: '' };
            lastMessage.content += delta.content;
          }

          if (delta.tool_calls) {
            if (!lastMessage) lastMessage = { role: 'assistant', tool_calls: [] };
            if (!lastMessage.tool_calls) lastMessage.tool_calls = [];

            for (const tc of delta.tool_calls) {
              const idx = tc.index;
              if (!lastMessage.tool_calls[idx]) {
                lastMessage.tool_calls[idx] = { id: tc.id, type: 'function', function: { name: '', arguments: '' } };
              }
              if (tc.id) lastMessage.tool_calls[idx].id = tc.id;
              if (tc.function?.name) lastMessage.tool_calls[idx].function.name += tc.function.name;
              if (tc.function?.arguments) lastMessage.tool_calls[idx].function.arguments += tc.function.arguments;
            }
          }
        } catch (e) {
          // Skip invalid JSON
        }
      }
    }

    if (!lastMessage || !lastMessage.tool_calls) {
      break;
    }

    // Process Tool Calls
    currentMessages.push(lastMessage);

    for (const tc of lastMessage.tool_calls) {
      const name = tc.function.name;
      let input = {};
      try { input = JSON.parse(tc.function.arguments); } catch { input = {}; }

      onEvent({ type: 'tool_use', id: tc.id, name, input });

      let result;
      let isError = false;

      try {
        if (name === 'execute_query') {
          if (allowedTables !== null) {
            const re = /\bFROM\s+(\w+)|\bJOIN\s+(\w+)/gi;
            let m;
            while ((m = re.exec(input.sql || '')) !== null) {
              const t = (m[1] || m[2]).toLowerCase();
              if (!allowedTables.includes(t)) throw new Error(`Không có quyền truy vấn bảng "${t}"`);
            }
          }
          result = await executeQuery(input.sql);
        } else if (name === 'list_tables') {
          const all = await listTables();
          result = allowedTables !== null
            ? all.filter(t => allowedTables.includes(t.name))
            : all.filter(t => !['users', 'user_table_permissions', 'chat_sessions', 'chat_messages'].includes(t.name.toLowerCase()));
        } else if (name === 'describe_table') {
          if (allowedTables !== null && !allowedTables.includes(input.table_name?.toLowerCase())) {
            throw new Error(`Không có quyền xem bảng "${input.table_name}"`);
          }
          result = await describeTable(input.table_name);
        } else if (name === 'get_database_overview') {
          result = await getDatabaseOverview();
        } else {
          throw new Error(`Tool không tồn tại: ${name}`);
        }
      } catch (err) {
        result = { error: err.message };
        isError = true;
      }

      onEvent({
        type: 'tool_result',
        id: tc.id,
        name,
        success: !isError,
        rowCount: result?.rowCount ?? (Array.isArray(result) ? result.length : undefined)
      });

      currentMessages.push({
        role: 'tool',
        tool_call_id: tc.id,
        content: JSON.stringify(result),
      });
    }
  }
}
