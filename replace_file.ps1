# AUTOMATED FILE REPLACEMENT SCRIPT
# Run this in PowerShell to replace the corrupted file

Write-Host "🔧 AUTOMATED FILE REPLACEMENT" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Set project path
$projectPath = "d:\Timothy\Toto Predictor\Repository\toto_predictor"
Write-Host "📁 Project Path: $projectPath" -ForegroundColor Yellow

# Navigate to project directory
try {
    Set-Location $projectPath
    Write-Host "✅ Successfully navigated to project directory" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to navigate to project directory: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Check if files exist
Write-Host ""
Write-Host "🔍 CHECKING FILES:" -ForegroundColor Cyan

if (Test-Path "updateTotoCSV.cjs") {
    $corruptedSize = (Get-Item "updateTotoCSV.cjs").Length
    Write-Host "📄 Found updateTotoCSV.cjs (Size: $corruptedSize bytes) - CORRUPTED" -ForegroundColor Red
} else {
    Write-Host "❌ updateTotoCSV.cjs not found!" -ForegroundColor Red
    exit 1
}

if (Test-Path "updateTotoCSV_NEW.cjs") {
    $workingSize = (Get-Item "updateTotoCSV_NEW.cjs").Length
    Write-Host "📄 Found updateTotoCSV_NEW.cjs (Size: $workingSize bytes) - WORKING VERSION" -ForegroundColor Green
} else {
    Write-Host "❌ updateTotoCSV_NEW.cjs not found!" -ForegroundColor Red
    Write-Host "💡 The working version may have a different name. Looking for alternatives..." -ForegroundColor Yellow
    
    # Look for other working versions
    $alternatives = @("updateTotoCSV_CORRECT.cjs", "updateTotoCSV_clean.cjs", "updateTotoCSV_FIXED.cjs")
    $found = $false
    
    foreach ($alt in $alternatives) {
        if (Test-Path $alt) {
            Write-Host "✅ Found alternative working version: $alt" -ForegroundColor Green
            $workingFile = $alt
            $found = $true
            break
        }
    }
    
    if (-not $found) {
        Write-Host "❌ No working version found!" -ForegroundColor Red
        exit 1
    }
} else {
    $workingFile = "updateTotoCSV_NEW.cjs"
}

# Perform replacement
Write-Host ""
Write-Host "🔄 PERFORMING REPLACEMENT:" -ForegroundColor Cyan

try {
    # Step 1: Backup corrupted file
    Write-Host "📦 Backing up corrupted file..." -ForegroundColor Yellow
    Move-Item "updateTotoCSV.cjs" "updateTotoCSV_CORRUPTED_BACKUP.cjs" -Force
    Write-Host "✅ Corrupted file backed up as updateTotoCSV_CORRUPTED_BACKUP.cjs" -ForegroundColor Green
    
    # Step 2: Copy working version
    Write-Host "📋 Copying working version..." -ForegroundColor Yellow
    Copy-Item $workingFile "updateTotoCSV.cjs" -Force
    Write-Host "✅ Working version copied as updateTotoCSV.cjs" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Replacement failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Verify replacement
Write-Host ""
Write-Host "🧪 VERIFYING REPLACEMENT:" -ForegroundColor Cyan

# Check file exists and size
if (Test-Path "updateTotoCSV.cjs") {
    $newSize = (Get-Item "updateTotoCSV.cjs").Length
    Write-Host "✅ New updateTotoCSV.cjs exists (Size: $newSize bytes)" -ForegroundColor Green
} else {
    Write-Host "❌ New updateTotoCSV.cjs not found!" -ForegroundColor Red
    exit 1
}

# Test syntax
Write-Host "🔍 Testing syntax..." -ForegroundColor Yellow
try {
    $syntaxResult = node -c "updateTotoCSV.cjs" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Syntax check PASSED - No errors found!" -ForegroundColor Green
    } else {
        Write-Host "❌ Syntax check FAILED:" -ForegroundColor Red
        Write-Host $syntaxResult -ForegroundColor Red
    }
} catch {
    Write-Host "⚠️ Could not test syntax (Node.js may not be in PATH)" -ForegroundColor Yellow
}

# Show file content preview
Write-Host ""
Write-Host "📋 FILE PREVIEW (First 10 lines):" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
try {
    Get-Content "updateTotoCSV.cjs" -Head 10 | ForEach-Object { Write-Host $_ -ForegroundColor White }
} catch {
    Write-Host "❌ Could not read file content" -ForegroundColor Red
}

# Final status
Write-Host ""
Write-Host "🎉 REPLACEMENT COMPLETED!" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 NEXT STEPS:" -ForegroundColor Cyan
Write-Host "1. Test the script: node updateTotoCSV.cjs" -ForegroundColor White
Write-Host "2. Commit changes: git add updateTotoCSV.cjs" -ForegroundColor White
Write-Host "3. Push to GitHub: git commit -m 'Fix corrupted script' && git push" -ForegroundColor White
Write-Host "4. Test GitHub Actions workflow" -ForegroundColor White
Write-Host ""
Write-Host "✅ Your TOTO workflow should now work correctly!" -ForegroundColor Green
