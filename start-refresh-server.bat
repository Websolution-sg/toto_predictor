@echo off
echo 🌐 Starting 4D Auto-Refresh Server...
echo.
echo This server enables the web interface to automatically
echo fetch and update 4D results from Singapore Pools.
echo.
echo Server will run on: http://localhost:3001
echo.
echo Available endpoints:
echo   POST /refresh - Trigger 4D data refresh
echo   GET  /status  - Check server and data status  
echo   GET  /test    - Test the fetcher system
echo.
echo Press Ctrl+C to stop the server
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Start the refresh server
node refresh-server.js

pause
