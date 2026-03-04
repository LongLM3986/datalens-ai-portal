# DataLens AI Portal

Web chatbot phân tích dữ liệu thông minh, sử dụng Claude AI + PostgreSQL. Người dùng có thể hỏi đáp về dữ liệu, xem kết quả dạng bảng và biểu đồ trực tiếp từ trình duyệt.

## Tính năng

- Hỏi đáp dữ liệu bằng tiếng Việt
- Claude tự động viết và thực thi SQL
- Hiển thị kết quả dạng bảng, biểu đồ cột, biểu đồ đường
- Lưu lịch sử hội thoại
- Hỗ trợ phân quyền người dùng

## Tech Stack

| Layer | Công nghệ |
|-------|-----------|
| Frontend | React 18 + Vite 5 + Nginx |
| Backend | Node.js + Express 4 |
| AI | Claude API (Anthropic) |
| Database | PostgreSQL 16 |
| Deploy | Docker + Docker Compose |

---

## Hướng dẫn cài đặt

### Yêu cầu

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) đã cài và **đang chạy**
- Anthropic API Key — lấy tại [platform.anthropic.com](https://platform.anthropic.com)

---

### Bước 1 — Clone repo

```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
```

### Bước 2 — Tạo file cấu hình

Tạo file `backend/.env.docker` với nội dung sau:

```env
# Bắt buộc: lấy API Key tại platform.anthropic.com
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=mywebportal
DB_USER=postgres
DB_PASSWORD=your_db_password_here

# Server
PORT=3001
CORS_ORIGIN=*

# Claude Model
CLAUDE_MODEL=claude-3-5-sonnet-20241022

# JWT — đặt một chuỗi bí mật bất kỳ
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
```

### Bước 3 — Build và chạy

```bash
docker-compose up -d --build
```

Lần đầu mất khoảng 3-5 phút để build.

### Bước 4 — Kiểm tra

Mở trình duyệt vào: **http://localhost:8080/api/health**

Nếu thấy kết quả sau là thành công:
```json
{"status":"ok","db":"connected","db_name":"mywebportal"}
```

### Bước 5 — Sử dụng

Truy cập: **http://localhost:8080**

---

## Lệnh quản lý

```bash
# Dừng ứng dụng
docker-compose down

# Xem logs
docker-compose logs -f

# Khởi động lại (không build lại)
docker-compose up -d

# Build lại từ đầu
docker-compose up -d --build
```

---

## Cấu trúc thư mục

```
WebPortalVip/
├── docker-compose.yml       ← Điều phối toàn bộ services
├── backend/
│   ├── Dockerfile           ← Build Node.js container
│   ├── .env.docker          ← Biến môi trường (tự tạo, không commit)
│   ├── migrations/          ← SQL schema tự động chạy khi khởi động
│   └── src/                 ← Source code API
├── frontend/
│   ├── Dockerfile           ← Build React → Nginx container
│   ├── nginx.conf           ← Config proxy và SPA routing
│   └── src/                 ← Source code React
└── mcp-server/              ← MCP Server cho Claude Code CLI
```

---

## Troubleshooting

| Vấn đề | Giải pháp |
|--------|-----------|
| `docker-compose up` lỗi | Kiểm tra Docker Desktop đang chạy |
| `/api/health` trả về lỗi DB | Chờ thêm 30 giây để PostgreSQL khởi động |
| Chatbot không phản hồi | Kiểm tra `ANTHROPIC_API_KEY` trong `backend/.env.docker` |
| Port 8080 bị chiếm | Đổi `"8080:80"` thành `"9090:80"` trong `docker-compose.yml` |
