@echo off
echo 🔧 QUICK FILE REPLACEMENT
echo ========================
echo.

cd /d "d:\Timothy\Toto Predictor\Repository\toto_predictor"

echo 📁 Current directory: %CD%
echo.

echo 🔍 Checking files...
if exist "updateTotoCSV.cjs" (
    echo ✅ Found updateTotoCSV.cjs (corrupted)
) else (
    echo ❌ updateTotoCSV.cjs not found!
    pause
    exit /b 1
)

if exist "updateTotoCSV_NEW.cjs" (
    echo ✅ Found updateTotoCSV_NEW.cjs (working version)
    set "workingFile=updateTotoCSV_NEW.cjs"
) else if exist "updateTotoCSV_CORRECT.cjs" (
    echo ✅ Found updateTotoCSV_CORRECT.cjs (working version)
    set "workingFile=updateTotoCSV_CORRECT.cjs"
) else (
    echo ❌ No working version found!
    pause
    exit /b 1
)

echo.
echo 🔄 Performing replacement...

echo 📦 Backing up corrupted file...
move "updateTotoCSV.cjs" "updateTotoCSV_CORRUPTED_BACKUP.cjs" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backup completed
) else (
    echo ❌ Backup failed
)

echo 📋 Copying working version...
copy "%workingFile%" "updateTotoCSV.cjs" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ File replaced successfully
) else (
    echo ❌ Replacement failed
    pause
    exit /b 1
)

echo.
echo 🧪 Testing syntax...
node -c "updateTotoCSV.cjs" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Syntax check PASSED
) else (
    echo ❌ Syntax check FAILED
)

echo.
echo 🎉 REPLACEMENT COMPLETED!
echo.
echo 📋 Next steps:
echo 1. Test: node updateTotoCSV.cjs
echo 2. Commit: git add updateTotoCSV.cjs
echo 3. Push: git commit -m "Fix corrupted script" ^&^& git push
echo.
pause
