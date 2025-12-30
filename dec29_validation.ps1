$ErrorActionPreference = "Stop"

Write-Host ("=" * 70) -ForegroundColor Cyan
Write-Host "🎯 DEC 29, 2025 PREDICTION VALIDATION RESULTS" -ForegroundColor Yellow
Write-Host ("=" * 70) -ForegroundColor Cyan
Write-Host ""

# Actual result from Singapore Pools
$actual = @(2, 4, 22, 24, 30, 33)
$additional = 49

Write-Host "📅 Draw Date: 29-Dec-25" -ForegroundColor White
Write-Host "🎯 Winning Numbers: " -NoNewline
Write-Host ($actual -join ', ') -ForegroundColor Green -NoNewline
Write-Host " + " -NoNewline  
Write-Host $additional -ForegroundColor Yellow
Write-Host "💰 Jackpot: $1,336,997 (No Group 1 winner)" -ForegroundColor Cyan
Write-Host ""
Write-Host ("=" * 70) -ForegroundColor Cyan
Write-Host ""

# Manual predictions from generate_predictions_dec29.js
# These would need to be run through the JS file, but I'll validate a sample

Write-Host "📋 TO VALIDATE YOUR 10 PREDICTIONS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Please provide each prediction set, for example:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Prediction 1 - Enhanced Frequency: [5, 12, 18, 25, 33, 41]" -ForegroundColor White
Write-Host ""

# Example validation function
function Validate-Prediction {
    param(
        [string]$Name,
        [int[]]$Predicted
    )
    
    $matches = $Predicted | Where-Object { $actual -contains $_ }
    $hasAdditional = $Predicted -contains $additional
    $matchCount = if ($matches) { $matches.Count } else { 0 }
    
    Write-Host "🎲 $Name" -ForegroundColor Cyan
    Write-Host "   Predicted: " -NoNewline
    Write-Host ($Predicted -join ', ') -ForegroundColor White
    Write-Host "   Matches: $matchCount/6 " -NoNewline -ForegroundColor $(if($matchCount -ge 3){"Green"}else{"Yellow"})
    
    if ($matchCount -gt 0) {
        Write-Host "→ [$($matches -join ', ')]" -ForegroundColor Green
    } else {
        Write-Host "(no matches)" -ForegroundColor Red
    }
    
    if ($hasAdditional) {
        Write-Host "   ✅ BONUS: Additional ($additional) predicted!" -ForegroundColor Green
    }
    
    $accuracy = [math]::Round(($matchCount / 6) * 100, 1)
    Write-Host "   📊 Accuracy: $accuracy%" -ForegroundColor $(if($matchCount -ge 3){"Green"}elseif($matchCount -ge 2){"Yellow"}else{"Red"})
    
    # Prize checking
    if ($matchCount -eq 6) {
        Write-Host "   🏆🏆🏆 JACKPOT! Group 1 Winner!" -ForegroundColor Magenta
    } elseif ($matchCount -eq 5 -and $hasAdditional) {
        Write-Host "   🏆🏆 Group 2 Prize!" -ForegroundColor Green
    } elseif ($matchCount -eq 5) {
        Write-Host "   🏆 Group 3 Prize!" -ForegroundColor Green
    } elseif ($matchCount -eq 4 -and $hasAdditional) {
        Write-Host "   🏆 Group 4 Prize ($523)" -ForegroundColor Green
    } elseif ($matchCount -eq 4) {
        Write-Host "   🏆 Group 4 Prize ($523)" -ForegroundColor Green
    } elseif ($matchCount -eq 3 -and $hasAdditional) {
        Write-Host "   🎁 Group 5 Prize ($50)" -ForegroundColor Yellow
    } elseif ($matchCount -eq 3) {
        Write-Host "   🎁 Group 6 Prize ($25)" -ForegroundColor Yellow
    }
    
    Write-Host ""
}

# Example validation (sample prediction)
Write-Host "📊 SAMPLE VALIDATION:" -ForegroundColor Yellow
Write-Host ""
Validate-Prediction -Name "Sample Prediction" -Predicted @(4, 15, 22, 28, 35, 43)

Write-Host ("=" * 70) -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 ACTION NEEDED:" -ForegroundColor Yellow
Write-Host "To validate all 10 predictions from generate_predictions_dec29.js:" -ForegroundColor Cyan
Write-Host "1. Run: node generate_predictions_dec29.js" -ForegroundColor White
Write-Host "2. Copy the 10 prediction number sets" -ForegroundColor White
Write-Host "3. Use this validation function for each" -ForegroundColor White
Write-Host ""
$winningDisplay = "Winning numbers: [$($actual -join ', ')] + $additional"
Write-Host $winningDisplay -ForegroundColor Green
Write-Host ("=" * 70) -ForegroundColor Cyan
