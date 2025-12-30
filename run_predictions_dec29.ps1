# Load CSV data
$csvData = Get-Content "c:\Users\Timothy Tong\Documents\GitHub\toto_predictor\totoResult.csv"
$historical = @()

foreach ($line in $csvData) {
    $parts = $line -split ','
    $historical += @{
        date = $parts[0]
        numbers = @([int]$parts[1], [int]$parts[2], [int]$parts[3], [int]$parts[4], [int]$parts[5], [int]$parts[6])
        additional = [int]$parts[7]
    }
}

Write-Host ("=" * 70) -ForegroundColor Cyan
Write-Host "🎯 TOTO 10 PREDICTIONS FOR DEC 29, 2025 - VALIDATION" -ForegroundColor Yellow
Write-Host ("=" * 70) -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Historical data loaded: $($historical.Count) draws" -ForegroundColor White
Write-Host "📅 Latest result: $($historical[0].date) - [$($historical[0].numbers -join ', ')] + $($historical[0].additional)" -ForegroundColor White
Write-Host ""

# Actual Dec 29 result
$actualResult = @{
    date = "29-Dec-25"
    numbers = @(2, 4, 22, 24, 30, 33)
    additional = 49
}

Write-Host "🎯 ACTUAL DEC 29 RESULT:" -ForegroundColor Green
Write-Host "   Numbers: [$($actualResult.numbers -join ', ')] + $($actualResult.additional)" -ForegroundColor Green
Write-Host ""
Write-Host ("=" * 70) -ForegroundColor Cyan
Write-Host ""

# Base numbers
$baseNumbers = @(10, 49, 2)

# Helper function to get frequency
function Get-Frequency {
    param($draws, $includeAdditional = $true)
    $freq = @(0) * 50
    foreach ($draw in $draws) {
        foreach ($n in $draw.numbers) {
            $freq[$n]++
        }
        if ($includeAdditional -and $draw.additional) {
            $freq[$draw.additional]++
        }
    }
    return $freq
}

# Enhanced Frequency + Compatibility
$recent25 = $historical[0..24]
$recent50 = $historical[0..49]
$recentFreq = Get-Frequency -draws $recent25 -includeAdditional $true
$overallFreq = Get-Frequency -draws $recent50 -includeAdditional $true
$compatibility = @(0) * 50

foreach ($draw in $historical[0..29]) {
    foreach ($base in $baseNumbers) {
        if ($draw.numbers -contains $base -or $draw.additional -eq $base) {
            foreach ($n in $draw.numbers) {
                if ($n -ne $base) {
                    $compatibility[$n] += 1
                }
            }
            if ($draw.additional -ne $base) {
                $compatibility[$draw.additional] += 0.5
            }
        }
    }
}

$suggestions = @()
for ($n = 1; $n -le 49; $n++) {
    if ($baseNumbers -notcontains $n) {
        $freqScore = $recentFreq[$n] * 0.4 + $overallFreq[$n] * 0.2
        $compatScore = $compatibility[$n] * 0.3
        $recentBonus = if ($recentFreq[$n] -ge 2) { 0.1 } else { 0 }
        
        $suggestions += @{
            n = $n
            score = $freqScore + $compatScore + $recentBonus
        }
    }
}

$suggestions = $suggestions | Sort-Object -Property score -Descending
$pred1 = ($suggestions[0..5] | ForEach-Object { $_.n } | Sort-Object)

Write-Host "1. Enhanced Frequency + Compatibility ⭐⭐⭐⭐⭐" -ForegroundColor Cyan
Write-Host "   Predicted: [$($pred1 -join ', ')]" -ForegroundColor White

$matches = $pred1 | Where-Object { $actualResult.numbers -contains $_ }
$hasAdditional = $pred1 -contains $actualResult.additional
$matchCount = if ($matches) { $matches.Count } else { 0 }

Write-Host "   ✅ Matches: $matchCount/6" -NoNewline -ForegroundColor $(if($matchCount -ge 3){"Green"}else{"Yellow"})
if ($matchCount -gt 0) {
    Write-Host " → [$($matches -join ', ')]" -ForegroundColor Green
} else {
    Write-Host "" -ForegroundColor Red
}

if ($hasAdditional) {
    Write-Host "   🌟 BONUS: Additional ($($actualResult.additional)) predicted!" -ForegroundColor Green
}

$accuracy = [math]::Round(($matchCount / 6) * 100, 1)
Write-Host "   📊 Accuracy: $accuracy%" -ForegroundColor $(if($matchCount -ge 3){"Green"}else{"Yellow"})

if ($matchCount -eq 6) {
    Write-Host "   🏆🏆🏆 JACKPOT! Group 1!" -ForegroundColor Magenta
} elseif ($matchCount -eq 5 -and $hasAdditional) {
    Write-Host "   🏆🏆 Group 2 Prize!" -ForegroundColor Green
} elseif ($matchCount -eq 5) {
    Write-Host "   🏆 Group 3 Prize!" -ForegroundColor Green
} elseif ($matchCount -eq 4) {
    Write-Host "   🏆 Group 4 Prize ($523)" -ForegroundColor Green
} elseif ($matchCount -eq 3 -and $hasAdditional) {
    Write-Host "   🎁 Group 5 Prize ($50)" -ForegroundColor Yellow
} elseif ($matchCount -eq 3) {
    Write-Host "   🎁 Group 6 Prize ($25)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host ("=" * 70) -ForegroundColor Cyan
Write-Host "Note: Showing prediction method #1. Full 10 methods available in JS version." -ForegroundColor Cyan
Write-Host ("=" * 70) -ForegroundColor Cyan
