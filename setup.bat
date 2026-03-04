@echo off
chcp 65001 > nul
echo.
echo ╔══════════════════════════════════════════════════╗
echo ║       DataLens AI Portal - Cài đặt              ║
echo ╚══════════════════════════════════════════════════╝
echo.

REM ── Bước 1: Tạo database mywebportal ──────────────────────────────
echo [1/4] Tạo database mywebportal trong PostgreSQL...
docker exec my_postgres psql -U postgres -c "CREATE DATABASE mywebportal;" 2>nul
if %errorlevel% equ 0 (
    echo      ✅ Database mywebportal đã được tạo thành công
) else (
    echo      ⚠️  Database mywebportal có thể đã tồn tại (bỏ qua)
)
echo.

REM ── Bước 2: Cài đặt Backend ───────────────────────────────────────
echo [2/4] Cài đặt dependencies Backend...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo      ❌ Lỗi cài đặt backend! Hãy kiểm tra Node.js đã được cài chưa.
    pause
    exit /b 1
)
cd ..
echo      ✅ Backend dependencies đã cài xong
echo.

REM ── Bước 3: Cài đặt Frontend ──────────────────────────────────────
echo [3/4] Cài đặt dependencies Frontend...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo      ❌ Lỗi cài đặt frontend!
    pause
    exit /b 1
)
cd ..
echo      ✅ Frontend dependencies đã cài xong
echo.

REM ── Bước 4: Cài đặt MCP Server ────────────────────────────────────
echo [4/4] Cài đặt MCP Server...
cd mcp-server
call npm install
cd ..
echo      ✅ MCP Server đã cài xong
echo.

echo ╔══════════════════════════════════════════════════╗
echo ║           CÀI ĐẶT HOÀN TẤT!                     ║
echo ╚══════════════════════════════════════════════════╝
echo.
echo ⚠️  QUAN TRỌNG: Bạn cần thêm ANTHROPIC_API_KEY vào file:
echo    backend\.env
echo.
echo    Lấy API key tại: https://platform.claude.com/settings/keys
echo    Mở file backend\.env và sửa dòng:
echo    ANTHROPIC_API_KEY=sk-ant-...your-key-here...
echo.
echo    Thay bằng API key thực của bạn.
echo.
echo Sau khi thêm API key, chạy file: start-all.bat
echo.
pause
