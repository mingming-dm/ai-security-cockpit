@echo off
chcp 65001 >nul
title 智盾校园 AI 安全驾驶舱 - 启动中...

echo.
echo ═══════════════════════════════════════════════
echo   🛡️  智盾校园 · AI 安全驾驶舱
echo   Campus AI Security Cockpit v1.0
echo ═══════════════════════════════════════════════
echo.

:: 检查 Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 未检测到 Node.js！请先安装 Node.js: https://nodejs.org
    echo    推荐版本: v18 或 v20 LTS
    pause
    exit /b 1
)

echo ✅ Node.js 已就绪:
node --version

echo.
echo 📦 [1/4] 安装后端依赖...
cd /d "%~dp0backend"
if not exist "node_modules" (
    call npm install
) else (
    echo     后端依赖已安装，跳过
)

echo.
echo 🌱 [2/4] 初始化数据库...
call npx tsx src/seed.ts

echo.
echo 🚀 [3/4] 启动后端服务 (端口 3001)...
start "智盾校园-后端" cmd /k "cd /d %~dp0backend && npx tsx src/index.ts"

:: 等待后端启动
echo     等待后端服务启动...
timeout /t 3 /nobreak >nul

echo.
echo 📦 [4/4] 安装并启动前端...
cd /d "%~dp0frontend"
if not exist "node_modules" (
    call npm install
)
echo 🎨 启动前端服务 (端口 3000)...
start "智盾校园-前端" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ═══════════════════════════════════════════════
echo   🎉 启动完成！
echo.
echo   📊 前端地址: http://localhost:3000
echo   ⚙️  后端地址: http://localhost:3001
echo   💚 健康检查: http://localhost:3001/api/health
echo.
echo   💡 提示:
echo     - 默认使用 Demo 模式（无需 AI API Key）
echo     - 如需接入真实 AI，请编辑 backend/.env
echo     - 支持 OpenAI / DeepSeek / 天翼云 / OpenClaw
echo ═══════════════════════════════════════════════
echo.
echo 按任意键关闭此窗口...
pause >nul
