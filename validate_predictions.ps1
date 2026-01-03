Write-Host "=" -NoNewline; Write-Host ("=" * 69)
Write-Host "🔍 VALIDATING DEC 29 PREDICTIONS vs ACTUAL RESULT (25-Dec-25)" -ForegroundColor Yellow
Write-Host ("=" * 70)
Write-Host ""

# Latest winning result from totoResult.csv
$winningNumbers = @(3, 8, 15, 28, 37, 43)
$additionalNumber = 49

Write-Host "📅 Latest Draw: 25-Dec-25" -ForegroundColor White
Write-Host "🎯 Winning Numbers: " -NoNewline -ForegroundColor White
Write-Host ($winningNumbers -join ', ') -ForegroundColor Green
Write-Host "➕ Additional: " -NoNewline -ForegroundColor White
Write-Host $additionalNumber -ForegroundColor Green
Write-Host ""
Write-Host ("=" * 70)
Write-Host ""

# Sample predictions - you need to paste the actual numbers from running generate_predictions_dec29.js
Write-Host "⚠️  TO COMPLETE VALIDATION:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Please provide the 10 prediction sets from your Dec 29 predictions" -ForegroundColor Cyan
Write-Host "2. I will validate each against winning: [3, 8, 15, 28, 37, 43] + 49" -ForegroundColor Cyan
Write-Host ""
Write-Host "Example validation for a sample prediction:" -ForegroundColor White
Write-Host ""

# Sample validation
$samplePrediction = @(5, 12, 18, 25, 33, 41)
$matches = $samplePrediction | Where-Object { $winningNumbers -contains $_ }
$hasAdditional = $samplePrediction -contains $additionalNumber

Write-Host "Sample Prediction: " -NoNewline
Write-Host ($samplePrediction -join ', ') -ForegroundColor Cyan
Write-Host "Matches: $($matches.Count)/6 main numbers" -NoNewline
if ($matches.Count -gt 0) {
    Write-Host " ($($matches -join ', '))" -ForegroundColor Green
} else {
    Write-Host "" -ForegroundColor Red
}
if ($hasAdditional) {
    Write-Host "✅ Additional number ($additionalNumber) also predicted!" -ForegroundColor Green
}
$accuracy = [math]::Round(($matches.Count / 6.0) * 100, 1)
Write-Host "Accuracy: $accuracy%" -ForegroundColor $(if($matches.Count -ge 3){"Green"}else{"Yellow"})
Write-Host ""
Write-Host ("=" * 70)
Write-Host ""
Write-Host "📋 Please paste your 10 prediction sets to complete validation" -ForegroundColor Cyan
