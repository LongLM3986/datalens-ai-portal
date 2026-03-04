import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import { executeQuery, listTables, describeTable, getDatabaseOverview } from './tools.js';
dotenv.config();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const SYSTEM_PROMPT = `Bạn là DataLens AI - trợ lý phân tích dữ liệu thông minh.
Định dạng output: dùng \`\`\`chart JSON\`\`\`, \`\`\`datatable JSON\`\`\`, \`\`\`sql CODE\`\`\`
Chỉ SELECT, trả lời tiếng Việt.`;
const CLAUDE_TOOLS = [
  { name: 'execute_query', description: 'Thực thi SQL SELECT', input_schema: { type: 'object', properties: { sql: { type: 'string' } }, required: ['sql'] } },
  { name: 'list_tables', description: 'Liệt kê bảng', input_schema: { type: 'object', properties: {} } },
  { name: 'describe_table', description: 'Cấu trúc bảng', input_schema: { type: 'object', properties: { table_name: { type: 'string' } }, required: ['table_name'] } },
  { name: 'get_database_overview', description: 'Tổng quan DB', input_schema: { type: 'object', properties: {} } }
];
export async function processChat(messages, onEvent, allowedTables = null) {
  const permissionNote = allowedTables !== null
    ? `\n\nQuyền truy cập: Chỉ được dùng các bảng sau: ${allowedTables.join(', ')}. TUYỆT ĐỐI không truy vấn hoặc mô tả bảng nào khác.`
    : '';
  const systemPrompt = SYSTEM_PROMPT + permissionNote;

  // Anthropic API messages format: filter out helper properties
  const apiMessages = messages.map(m => ({ role: m.role, content: m.content }));
  console.log('Claude request:', JSON.stringify(apiMessages));

  let iteration = 0;
  let currentMessages = [...apiMessages];

  while (iteration++ < 10) {
    onEvent({ type: 'thinking', message: iteration === 1 ? 'Đang phân tích...' : 'Đang xử lý...' });

    try {
      const stream = anthropic.messages.stream({
        model: process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022',
        max_tokens: 8192,
        system: systemPrompt,
        tools: CLAUDE_TOOLS,
        messages: currentMessages,
      });

      let finalMsg = null;

      stream.on('text', (text) => {
        onEvent({ type: 'text', text });
      });

      stream.on('message', (msg) => {
        finalMsg = msg;
      });

      // Đợi stream kết thúc
      const finalResponse = await stream.finalMessage();

      if (finalResponse.stop_reason === 'end_turn') {
        break;
      }

      if (finalResponse.stop_reason === 'tool_use') {
        currentMessages.push({ role: 'assistant', content: finalResponse.content });
        const toolResults = [];

        for (const block of finalResponse.content) {
          if (block.type !== 'tool_use') continue;

          onEvent({ type: 'tool_use', id: block.id, name: block.name, input: block.input });
          let result;
          let isError = false;

          try {
            if (block.name === 'execute_query') {
              if (allowedTables !== null) {
                const re = /\bFROM\s+(\w+)|\bJOIN\s+(\w+)/gi;
                let m;
                const sql = block.input.sql || '';
                while ((m = re.exec(sql)) !== null) {
                  const t = (m[1] || m[2]).toLowerCase();
                  if (!allowedTables.includes(t)) throw new Error(`Không có quyền truy vấn bảng "${t}"`);
                }
              }
              result = await executeQuery(block.input.sql);
            } else if (block.name === 'list_tables') {
              const all = await listTables();
              result = allowedTables !== null
                ? all.filter(t => allowedTables.includes(t.name))
                : all.filter(t => !['users', 'user_table_permissions', 'chat_sessions', 'chat_messages'].includes(t.name.toLowerCase()));
            } else if (block.name === 'describe_table') {
              if (allowedTables !== null && !allowedTables.includes(block.input.table_name?.toLowerCase())) {
                throw new Error(`Không có quyền xem bảng "${block.input.table_name}"`);
              }
              result = await describeTable(block.input.table_name);
            } else if (block.name === 'get_database_overview') {
              result = await getDatabaseOverview();
            } else {
              throw new Error(`Tool không tồn tại: ${block.name}`);
            }
          } catch (e) {
            result = { error: e.message };
            isError = true;
          }

          onEvent({
            type: 'tool_result',
            id: block.id,
            name: block.name,
            success: !isError,
            rowCount: result?.rowCount ?? (Array.isArray(result) ? result.length : undefined)
          });

          toolResults.push({
            type: 'tool_result',
            tool_use_id: block.id,
            content: JSON.stringify(result),
            ...(isError && { is_error: true })
          });
        }

        currentMessages.push({ role: 'user', content: toolResults });
      } else {
        break;
      }
    } catch (error) {
      console.error('Claude process error:', error);
      throw error;
    }
  }
}
