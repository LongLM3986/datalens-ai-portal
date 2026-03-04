@echo off
chcp 65001 > nul
echo.
echo ╔══════════════════════════════════════════════════╗
echo ║      DataLens AI Portal - Khởi động             ║
echo ╚══════════════════════════════════════════════════╝
echo.

REM Kiểm tra API key đã được cài chưa
findstr /c:"sk-ant-xxxxxxxx" "backend\.env" > nul
if %errorlevel% equ 0 (
    echo ❌ LỖI: Bạn chưa cập nhật ANTHROPIC_API_KEY trong backend\.env
    echo    Hãy mở file backend\.env và điền API key thực của bạn.
    echo    Lấy key tại: https://platform.claude.com/settings/keys
    pause
    exit /b 1
)

echo Đang khởi động Backend (port 3001)...
start "DataLens Backend" cmd /k "cd /d "%~dp0backend" && npm start"

timeout /t 3 /nobreak > nul

echo Đang khởi động Frontend (port 5173)...
start "DataLens Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

timeout /t 3 /nobreak > nul

echo.
echo ✅ Ứng dụng đang khởi động!
echo.
echo    🌐 Frontend:  http://localhost:5173
echo    🔧 Backend:   http://localhost:3001
echo    ❤️  Health:   http://localhost:3001/api/health
echo.
echo Mở trình duyệt và truy cập: http://localhost:5173
echo.

REM Tự động mở trình duyệt sau 5 giây
timeout /t 5 /nobreak > nul
start "" "http://localhost:5173"

pause
