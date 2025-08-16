# FIX CORRUPTED SCRIPT
Write-Host "🔧 Fixing corrupted updateTotoCSV.cjs file..." -ForegroundColor Yellow

# Navigate to project directory
$projectPath = "d:\Timothy\Toto Predictor\Repository\toto_predictor"
Set-Location $projectPath

# Check if files exist
if (Test-Path "updateTotoCSV.cjs") {
    Write-Host "✅ Found updateTotoCSV.cjs (corrupted)" -ForegroundColor Red
} else {
    Write-Host "❌ updateTotoCSV.cjs not found!" -ForegroundColor Red
    exit 1
}

if (Test-Path "updateTotoCSV_CORRECT.cjs") {
    Write-Host "✅ Found updateTotoCSV_CORRECT.cjs (working version)" -ForegroundColor Green
} else {
    Write-Host "❌ updateTotoCSV_CORRECT.cjs not found!" -ForegroundColor Red
    exit 1
}

# Backup corrupted version
try {
    Move-Item "updateTotoCSV.cjs" "updateTotoCSV_BROKEN_BACKUP.cjs" -Force
    Write-Host "📦 Backed up corrupted file to updateTotoCSV_BROKEN_BACKUP.cjs" -ForegroundColor Yellow
} catch {
    Write-Host "❌ Failed to backup corrupted file: $($_.Exception.Message)" -ForegroundColor Red
}

# Copy working version
try {
    Copy-Item "updateTotoCSV_CORRECT.cjs" "updateTotoCSV.cjs" -Force
    Write-Host "✅ Replaced with working version" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to copy working file: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Verify the fix
Write-Host "🧪 Testing syntax..." -ForegroundColor Cyan
try {
    $result = node -c "updateTotoCSV.cjs" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Syntax check PASSED" -ForegroundColor Green
    } else {
        Write-Host "❌ Syntax check FAILED: $result" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Node.js test failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "🎉 Fix complete! Your updateTotoCSV.cjs should now work properly." -ForegroundColor Green
Write-Host "📋 Next: Commit and push this fix, then test your GitHub Actions workflow." -ForegroundColor Cyan
