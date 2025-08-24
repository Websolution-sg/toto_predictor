@echo off
REM Singapore Pools 4D Auto-Update Batch Script (SEPARATE from TOTO system)
REM Simple wrapper for the PowerShell automation script
REM NOTE: This is for 4D results only - TOTO system remains untouched

title Singapore Pools 4D Auto-Fetcher (4D ONLY)

echo.
echo ========================================
echo  Singapore Pools 4D Auto-Fetcher
echo ========================================
echo.

REM Check if PowerShell is available
powershell -Command "Get-Host" >nul 2>&1
if errorlevel 1 (
    echo ERROR: PowerShell is required but not found.
    echo Please ensure PowerShell is installed and available.
    pause
    exit /b 1
)

REM Get current directory
set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

:MENU
echo Please select an option:
echo.
echo 1. Test Connection and System
echo 2. Fetch 4D Results Now
echo 3. Setup Automated Daily Updates
echo 4. View Recent Log
echo 5. Exit
echo.
set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" goto TEST
if "%choice%"=="2" goto FETCH
if "%choice%"=="3" goto SCHEDULE
if "%choice%"=="4" goto VIEWLOG
if "%choice%"=="5" goto EXIT
echo Invalid choice. Please try again.
echo.
goto MENU

:TEST
echo.
echo Testing system and connection...
powershell -ExecutionPolicy Bypass -File "auto-4d-update.ps1" -Test
echo.
echo Test completed. Press any key to return to menu...
pause >nul
goto MENU

:FETCH
echo.
echo Fetching latest 4D results...
powershell -ExecutionPolicy Bypass -File "auto-4d-update.ps1" -RunOnce
echo.
echo Fetch completed. Press any key to return to menu...
pause >nul
goto MENU

:SCHEDULE
echo.
echo Setting up automated daily updates...
echo Default time is 18:00 (6:00 PM)
set /p schedule_time="Enter time for daily updates (HH:MM) or press Enter for default: "
if "%schedule_time%"=="" set schedule_time=18:00

echo Setting up daily updates at %schedule_time%...
powershell -ExecutionPolicy Bypass -File "auto-4d-update.ps1" -Schedule -Time "%schedule_time%"
echo.
echo Setup completed. Press any key to return to menu...
pause >nul
goto MENU

:VIEWLOG
echo.
echo ========== Recent Log Entries ==========
if exist "auto-4d-update.log" (
    powershell -Command "Get-Content 'auto-4d-update.log' | Select-Object -Last 20"
) else (
    echo No log file found yet. Run a test or fetch operation first.
)
echo ========================================
echo.
echo Press any key to return to menu...
pause >nul
goto MENU

:EXIT
echo.
echo Thank you for using Singapore Pools 4D Auto-Fetcher!
echo.
exit /b 0
