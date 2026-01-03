Write-Host ("=" * 70) -ForegroundColor Cyan
Write-Host "🎯 VALIDATING DEC 29 PREDICTIONS vs ACTUAL RESULT" -ForegroundColor Yellow
Write-Host ("=" * 70) -ForegroundColor Cyan
Write-Host ""

# Actual Dec 29, 2025 result from Singapore Pools
$winningNumbers = @(2, 4, 22, 24, 30, 33)
$additionalNumber = 49

Write-Host "📅 Draw Date: 29-Dec-25" -ForegroundColor White
Write-Host "🎯 Winning Numbers: " -NoNewline
Write-Host ($winningNumbers -join ', ') -ForegroundColor Green
Write-Host "➕ Additional: " -NoNewline
Write-Host $additionalNumber -ForegroundColor Green
Write-Host "💰 Jackpot: $1,336,997 (No Group 1 winner)" -ForegroundColor Cyan
Write-Host ""
Write-Host ("=" * 70) -ForegroundColor Cyan
Write-Host ""

# My 10 predictions - need to extract from generate_predictions_dec29.js output
# Running a temporary extraction to get the numbers

Write-Host "📊 EXTRACTING PREDICTIONS..." -ForegroundColor Yellow
Write-Host ""

# Since we need Node.js to run the script, let's check for Python as alternative
if (Get-Command python -ErrorAction SilentlyContinue) {
    Write-Host "✅ Creating Python validation script..." -ForegroundColor Green
    
    $pythonScript = @'
import csv

# Actual result
actual = [2, 4, 22, 24, 30, 33]
additional = 49

print("🔍 Note: To complete validation, we need the predicted numbers")
print("from generate_predictions_dec29.js")
print("")
print("Please run the prediction script to get the 10 prediction sets.")
print("")
print(f"Actual winning: {actual} + {additional}")
'@
    
    $pythonScript | Out-File -FilePath "temp_validate.py" -Encoding UTF8
    python temp_validate.py
    Remove-Item "temp_validate.py" -ErrorAction SilentlyContinue
} else {
    Write-Host "⚠️  To validate predictions, I need the actual predicted numbers" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "The prediction file is: generate_predictions_dec29.js" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Winning numbers to validate against: " -NoNewline
    Write-Host "[$($winningNumbers -join ', ')] + $additionalNumber" -ForegroundColor Green
}

Write-Host ""
Write-Host ("=" * 70) -ForegroundColor Cyan
