# DataLens AI Portal — CLAUDE.md

> File này được Claude Code đọc tự động khi bắt đầu mỗi session trong thư mục này.

## Tổng quan dự án

**DataLens AI Portal** là web application chatbot phân tích dữ liệu, cho phép người dùng hỏi đáp về dữ liệu, mô tả cấu trúc database, và vẽ dashboard trực tiếp từ giao diện web. Chatbot sử dụng Claude API (claude-opus-4-6) kết hợp với PostgreSQL.

## Tech Stack

| Layer       | Công nghệ                               |
|-------------|----------------------------------------|
| Frontend    | React 18, Vite 5, pure CSS inline      |
| Backend     | Node.js (ESM), Express 4               |
| AI          | @anthropic-ai/sdk, model claude-opus-4-6 |
| Database    | PostgreSQL 12 (Docker container: my_postgres) |
| MCP         | @modelcontextprotocol/sdk (stdio transport) |

## Cấu trúc thư mục

```
WebPortalVip/
├── CLAUDE.md                      ← File này (đọc bởi Claude Code)
├── HUONG_DAN.md                   ← Hướng dẫn người dùng cuối
├── .claude/
│   └── settings.json              ← Cấu hình MCP server cho Claude Code
├── backend/                       ← Node.js API server
│   ├── .env                       ← Biến môi trường (API key, DB)
│   ├── package.json               ← type: "module" (ESM)
│   ├── migrations/
│   │   └── 001_init.sql           ← Schema: chat_sessions, chat_messages
│   └── src/
│       ├── index.js               ← Entry point, Express server port 3001
│       ├── db/index.js            ← pg.Pool connection
│       ├── routes/
│       │   ├── chat.js            ← POST /api/chat (SSE streaming)
│       │   └── sessions.js        ← CRUD /api/sessions
│       └── services/
│           ├── claude.js          ← Agentic loop với tool_use
│           └── tools.js           ← DB tools: executeQuery, listTables, describeTable
├── frontend/                      ← React + Vite SPA
│   ├── index.html
│   ├── vite.config.js             ← Proxy /api → localhost:3001
│   └── src/
│       ├── main.jsx               ← React entry
│       └── App.jsx                ← Toàn bộ UI (single file, inline styles)
├── mcp-server/                    ← MCP Server kết nối PostgreSQL
│   ├── package.json
│   └── index.js                   ← Tools: query, list_tables, describe_table, get_sample
├── setup.bat                      ← Script cài đặt lần đầu (Windows)
└── start-all.bat                  ← Script khởi động (Windows)
```

## Lệnh quan trọng

```bash
# Chạy backend (port 3001)
cd backend && npm start
# hoặc dev mode với hot reload:
cd backend && npm run dev

# Chạy frontend (port 5173)
cd frontend && npm run dev

# Chạy MCP server (dùng cho Claude Code CLI)
cd mcp-server && npm start

# Tạo database (chỉ lần đầu)
docker exec my_postgres psql -U postgres -c "CREATE DATABASE mywebportal;"

# Chạy migration
docker exec -i my_postgres psql -U postgres -d mywebportal < backend/migrations/001_init.sql
```

## Conventions & Code Style

### Backend (Node.js ESM)
- **Tất cả files dùng ES Modules** (`import`/`export`, không dùng `require`)
- `package.json` có `"type": "module"`
- Import DB pool từ `../db/index.js`
- **Không commit** `.env` vào git
- Route handlers dùng `async/await`, bắt lỗi với `try/catch`
- SSE response: set headers trước `res.flushHeaders()`, gửi `data: {...}\n\n`

### Frontend (React)
- **Single file component** `App.jsx` chứa toàn bộ UI và sub-components
- **Inline styles** (không dùng CSS files, CSS modules, hay Tailwind)
- **Design tokens** từ `datalens-portal-v2.jsx`:
  - Background: `#060B18`
  - Sidebar: `#0A1022`
  - Card: `#0D1529`
  - Text: `#D0D9E4` (primary), `#6B7E94` (sub)
  - Accent Blue: `#3B82F6`
  - Font: `DM Sans` + `IBM Plex Mono`
- **Không thêm dependencies** ngoài react/react-dom (chart dùng SVG inline)

### Database
- DB name: `mywebportal` (không phải `my_postgres`)
- Docker container: `my_postgres`
- Credentials: `postgres` / `LeMinhLong123!`
- **Chỉ SELECT** trong tools, không cho INSERT/UPDATE/DELETE từ chatbot

## Claude API — Agentic Loop

File `backend/src/services/claude.js` xử lý theo pattern:
1. Gửi messages + tools lên API
2. Nếu `stop_reason === 'tool_use'` → thực thi tools, gửi kết quả lại
3. Lặp tối đa 15 vòng cho đến `stop_reason === 'end_turn'`
4. Stream từng event qua SSE về frontend

**Tools Claude có thể dùng:**
- `execute_query(sql)` — SELECT only
- `list_tables()` — liệt kê bảng
- `describe_table(table_name)` — cấu trúc + 5 dòng mẫu
- `get_database_overview()` — thống kê toàn DB

## Output Format từ Claude

Claude được hướng dẫn (trong system prompt) trả về:
```
```chart
{"type":"bar","title":"Tiêu đề","labels":[...],"data":[...]}
```
```datatable
{"headers":[...],"rows":[[...]]}
```
```sql
SELECT ...
```
```
Frontend parse và render tương ứng thành SVG chart, HTML table, SQL block.

## MCP Server (cho Claude Code CLI)

Đã cấu hình trong `.claude/settings.json`. Khi làm việc trong thư mục này, Claude Code có thể:
- Dùng tool `mywebportal:query` để SELECT dữ liệu
- Dùng tool `mywebportal:list_tables` để xem danh sách bảng
- Dùng tool `mywebportal:describe_table` để xem schema
- Xem resources `db://mywebportal/tables/{table_name}`

## Biến môi trường (backend/.env)

```env
ANTHROPIC_API_KEY=...  ← BẮT BUỘC
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mywebportal
DB_USER=postgres
DB_PASSWORD=LeMinhLong123!
PORT=3001
CORS_ORIGIN=http://localhost:5173
CLAUDE_MODEL=claude-opus-4-6
```

## Troubleshooting thường gặp

| Vấn đề | Nguyên nhân | Giải pháp |
|--------|-------------|-----------|
| DB connection fail | Docker chưa chạy | `docker start my_postgres` |
| API key invalid | Key sai hoặc hết credits | Kiểm tra tại platform.claude.com |
| CORS error | Frontend/backend sai port | Kiểm tra CORS_ORIGIN trong .env |
| SSE không hoạt động | Nginx buffering | Đã set `X-Accel-Buffering: no` |
| Port 3001 bị chiếm | Tiến trình cũ | Đổi PORT trong .env |
