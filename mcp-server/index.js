/**
 * MCP Server - mywebportal PostgreSQL
 * Cho phép Claude Code (CLI) truy cập trực tiếp vào database mywebportal
 * Cấu hình tại: .claude/settings.json
 */
import { Server }               from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import pg     from "pg";
import dotenv from "dotenv";

dotenv.config();

// ── Database connection ───────────────────────────────────────────────────────
const pool = new pg.Pool({
  host:     process.env.DB_HOST     || "localhost",
  port:     Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME     || "mywebportal",
  user:     process.env.DB_USER     || "postgres",
  password: process.env.DB_PASSWORD || "LeMinhLong123!",
  max:      5,
});

pool.on("error", (err) => {
  console.error("[MCP] Database error:", err.message);
});

// Validate chỉ SELECT
function assertSelect(sql) {
  const upper = sql.trim().toUpperCase().replace(/\s+/g, " ");
  if (!upper.startsWith("SELECT") && !upper.startsWith("WITH")) {
    throw new Error("Chỉ cho phép câu truy vấn SELECT hoặc WITH (CTE)");
  }
}

// ── MCP Server setup ──────────────────────────────────────────────────────────
const server = new Server(
  { name: "mywebportal-db", version: "1.0.0" },
  { capabilities: { tools: {}, resources: {} } }
);

// ── Tools ─────────────────────────────────────────────────────────────────────
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name:        "query",
      description: "Thực thi câu SQL SELECT trên database mywebportal. Chỉ cho phép SELECT.",
      inputSchema: {
        type: "object",
        properties: {
          sql: { type: "string", description: "Câu SQL SELECT hoàn chỉnh" },
        },
        required: ["sql"],
      },
    },
    {
      name:        "list_tables",
      description: "Liệt kê tất cả bảng và view trong database mywebportal",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name:        "describe_table",
      description: "Xem cấu trúc chi tiết (schema) của một bảng cụ thể",
      inputSchema: {
        type: "object",
        properties: {
          table_name: { type: "string", description: "Tên bảng cần xem" },
        },
        required: ["table_name"],
      },
    },
    {
      name:        "get_sample",
      description: "Lấy dữ liệu mẫu (5 dòng đầu) của một bảng",
      inputSchema: {
        type: "object",
        properties: {
          table_name: { type: "string" },
          limit:      { type: "number", description: "Số dòng (mặc định 5, tối đa 20)" },
        },
        required: ["table_name"],
      },
    },
    {
      name:        "count_rows",
      description: "Đếm số dòng trong một bảng",
      inputSchema: {
        type: "object",
        properties: {
          table_name: { type: "string" },
        },
        required: ["table_name"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result;

    if (name === "query") {
      assertSelect(args.sql);
      const res = await pool.query(args.sql);
      result = { rowCount: res.rowCount, columns: res.fields.map(f => f.name), rows: res.rows };

    } else if (name === "list_tables") {
      const res = await pool.query(`
        SELECT
          t.table_schema                              AS schema,
          t.table_name                                AS name,
          t.table_type                                AS type,
          COALESCE(s.n_live_tup, 0)                  AS estimated_rows,
          COUNT(c.column_name)                        AS column_count
        FROM information_schema.tables t
        LEFT JOIN pg_stat_user_tables s ON s.relname = t.table_name
        LEFT JOIN information_schema.columns c
               ON c.table_name = t.table_name AND c.table_schema = t.table_schema
        WHERE t.table_schema NOT IN ('pg_catalog', 'information_schema')
        GROUP BY t.table_schema, t.table_name, t.table_type, s.n_live_tup
        ORDER BY t.table_schema, t.table_name
      `);
      result = res.rows;

    } else if (name === "describe_table") {
      const tName = args.table_name.split(".").pop();
      const res = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default, character_maximum_length
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position
      `, [tName]);
      result = res.rows;

    } else if (name === "get_sample") {
      const lim  = Math.min(Number(args.limit) || 5, 20);
      const tbl  = args.table_name.replace(/[^a-zA-Z0-9_.]/g, ""); // sanitize
      const res  = await pool.query(`SELECT * FROM ${tbl} LIMIT $1`, [lim]);
      result = { rowCount: res.rowCount, columns: res.fields.map(f => f.name), rows: res.rows };

    } else if (name === "count_rows") {
      const tbl = args.table_name.replace(/[^a-zA-Z0-9_.]/g, "");
      const res = await pool.query(`SELECT COUNT(*) AS count FROM ${tbl}`);
      result = { table: args.table_name, count: Number(res.rows[0].count) };

    } else {
      throw new Error(`Tool không tồn tại: ${name}`);
    }

    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };

  } catch (err) {
    return {
      content: [{ type: "text", text: `Lỗi: ${err.message}` }],
      isError: true,
    };
  }
});

// ── Resources: expose table list ──────────────────────────────────────────────
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  try {
    const res = await pool.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    return {
      resources: res.rows.map(r => ({
        uri:      `db://mywebportal/tables/${r.table_name}`,
        name:     r.table_name,
        mimeType: "application/json",
      })),
    };
  } catch {
    return { resources: [] };
  }
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const match = request.params.uri.match(/db:\/\/mywebportal\/tables\/(.+)/);
  if (!match) throw new Error("URI không hợp lệ");

  const tableName = match[1];
  const res = await pool.query(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = $1
    ORDER BY ordinal_position
  `, [tableName]);

  return {
    contents: [{
      uri:      request.params.uri,
      mimeType: "application/json",
      text:     JSON.stringify(res.rows, null, 2),
    }],
  };
});

// ── Start ─────────────────────────────────────────────────────────────────────
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("[MCP] mywebportal MCP Server đang chạy - Sẵn sàng kết nối với Claude");
