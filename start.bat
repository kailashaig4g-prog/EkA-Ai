@echo off
REM EkA-Ai Startup Script for Windows
REM This script sets up and starts the EkA-Ai application

echo.
echo 🚗 Starting EkA-Ai - Automotive AI Assistant
echo ===========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

echo ✅ Node.js detected
node -v

REM Check if .env file exists
if not exist .env (
    echo ⚠️  No .env file found. Creating from .env.example...
    copy .env.example .env
    echo 📝 Please edit .env file with your configuration
    echo    Minimum required: OPENAI_API_KEY, JWT_SECRET
    pause
    exit /b 1
)

REM Check if dependencies are installed
if not exist node_modules (
    echo 📦 Installing dependencies...
    call npm install
)

REM Create necessary directories
if not exist logs mkdir logs
if not exist uploads mkdir uploads

echo.
echo 🚀 Starting application...
echo.

REM Start the application
if "%1"=="dev" (
    echo 📍 Development mode
    call npm run dev
) else (
    echo 📍 Production mode
    call npm start
)
