Write-Host ("=" * 70) -ForegroundColor Cyan
Write-Host "VALIDATION: Jan 2 Predictions vs Actual Result" -ForegroundColor Yellow
Write-Host ("=" * 70) -ForegroundColor Cyan
Write-Host ""

# Actual Jan 2, 2026 result
$actual = @(11, 18, 20, 32, 38, 39)
$additional = 34

Write-Host "ACTUAL RESULT (Jan 2, 2026):" -ForegroundColor Green
Write-Host "  Numbers: [$($actual -join ', ')] + $additional" -ForegroundColor Green
Write-Host "  Jackpot: $7,960,105 (3 winners!)" -ForegroundColor Cyan
Write-Host ""
Write-Host ("=" * 70) -ForegroundColor Cyan
Write-Host ""

# My 10 predictions (from generate_next_draw_predictions.js output)
$predictions = @(
    @{Name="Enhanced Frequency + Compatibility"; Numbers=@(8, 19, 22, 24, 31, 35)},
    @{Name="Momentum Tracker Plus (Won $10 Dec 29)"; Numbers=@(4, 15, 22, 24, 30, 43)},
    @{Name="Hot/Cold Analysis Refined"; Numbers=@(18, 22, 24, 27, 28, 30)},
    @{Name="Weighted Recent Enhanced (Won $25 Dec 29)"; Numbers=@(11, 15, 22, 24, 30, 43)},
    @{Name="Pattern Analysis Advanced"; Numbers=@(17, 20, 23, 25, 30, 33)},
    @{Name="Compatibility Network"; Numbers=@(15, 19, 22, 24, 35, 45)},
    @{Name="Balanced Distribution"; Numbers=@(3, 13, 22, 33, 36, 39)},
    @{Name="Trend Reversal"; Numbers=@(7, 26, 29, 40, 44, 48)},
    @{Name="Frequency Hybrid"; Numbers=@(11, 22, 24, 34, 35, 39)},
    @{Name="Ensemble Fusion"; Numbers=@(4, 6, 8, 15, 22, 24)}
)

$index = 1
$bestScore = 0
$bestMethod = ""

foreach ($pred in $predictions) {
    $matches = $pred.Numbers | Where-Object { $actual -contains $_ }
    $hasAdditional = $pred.Numbers -contains $additional
    $matchCount = if ($matches) { $matches.Count } else { 0 }
    
    if ($matchCount -gt $bestScore) {
        $bestScore = $matchCount
        $bestMethod = $pred.Name
    }
    
    $color = if($matchCount -ge 3){"Green"}elseif($matchCount -ge 2){"Yellow"}else{"White"}
    
    Write-Host "$index. $($pred.Name)" -ForegroundColor Cyan
    Write-Host "   Predicted: [$($pred.Numbers -join ', ')]" -ForegroundColor White
    Write-Host "   Matches: $matchCount/6" -NoNewline -ForegroundColor $color
    
    if ($matchCount -gt 0) {
        Write-Host " -> [$($matches -join ', ')]" -ForegroundColor Green
    } else {
        Write-Host "" -ForegroundColor Red
    }
    
    if ($hasAdditional) {
        Write-Host "   BONUS: Additional ($additional) predicted!" -ForegroundColor Green
    }
    
    $accuracy = [math]::Round(($matchCount / 6) * 100, 1)
    Write-Host "   Accuracy: $accuracy%" -ForegroundColor $color
    
    Write-Host ""
    $index++
}

Write-Host ("=" * 70) -ForegroundColor Cyan
Write-Host "SUMMARY" -ForegroundColor Yellow
Write-Host ("=" * 70) -ForegroundColor Cyan
Write-Host ""
Write-Host "Best Performer: $bestMethod" -ForegroundColor Green
Write-Host "Best Score: $bestScore/6 matches" -ForegroundColor Green
Write-Host ""

if ($bestScore -eq 0) {
    Write-Host "Unfortunately, none of the predictions matched the actual result." -ForegroundColor Red
    Write-Host "The winning numbers [11, 18, 20, 32, 38, 39] were in higher ranges." -ForegroundColor Yellow
} elseif ($bestScore -ge 3) {
    Write-Host "Good performance! $bestScore matches would have won a prize!" -ForegroundColor Green
} else {
    Write-Host "Moderate performance with $bestScore matches." -ForegroundColor Yellow
}

Write-Host ""
Write-Host ("=" * 70) -ForegroundColor Cyan
