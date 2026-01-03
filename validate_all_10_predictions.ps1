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
Write-Host "TOTO 10 PREDICTIONS FOR DEC 29, 2025 - COMPLETE VALIDATION" -ForegroundColor Yellow
Write-Host ("=" * 70) -ForegroundColor Cyan
Write-Host ""

# Actual Dec 29 result
$actualNumbers = @(2, 4, 22, 24, 30, 33)
$actualAdditional = 49

Write-Host "ACTUAL DEC 29 RESULT:" -ForegroundColor Green
Write-Host "  Numbers: [$($actualNumbers -join ', ')] + $actualAdditional" -ForegroundColor Green
Write-Host ""
Write-Host ("=" * 70) -ForegroundColor Cyan
Write-Host ""

# Base numbers
$baseNumbers = @(10, 49, 2)

# Helper functions
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

function Select-WithBalance {
    param($candidates, $count = 6)
    $selected = @()
    $evenCount = 0
    $oddCount = 0
    
    foreach ($candidate in $candidates) {
        if ($selected.Count -ge $count) { break }
        $num = if ($candidate -is [hashtable]) { $candidate.n } else { $candidate }
        
        if ($baseNumbers -contains $num) { continue }
        
        $isEven = ($num % 2) -eq 0
        
        if (($isEven -and $evenCount -lt 3) -or (-not $isEven -and $oddCount -lt 3) -or $selected.Count -ge 4) {
            $selected += $num
            if ($isEven) { $evenCount++ } else { $oddCount++ }
        }
    }
    
    while ($selected.Count -lt $count) {
        for ($n = 1; $n -le 49; $n++) {
            if ($selected.Count -ge $count) { break }
            if (($baseNumbers -notcontains $n) -and ($selected -notcontains $n)) {
                $selected += $n
                break
            }
        }
    }
    
    return ($selected | Sort-Object)
}

function Validate-Prediction {
    param($name, $predicted, $index)
    
    $matches = $predicted | Where-Object { $actualNumbers -contains $_ }
    $hasAdditional = $predicted -contains $actualAdditional
    $matchCount = if ($matches) { $matches.Count } else { 0 }
    
    Write-Host "$index. $name" -ForegroundColor Cyan
    Write-Host "   Predicted: [$($predicted -join ', ')]" -ForegroundColor White
    Write-Host "   Matches: $matchCount/6" -NoNewline
    if ($matchCount -gt 0) {
        Write-Host " -> [$($matches -join ', ')]" -ForegroundColor Green
    } else {
        Write-Host " (none)" -ForegroundColor Red
    }
    
    if ($hasAdditional) {
        Write-Host "   BONUS: Additional ($actualAdditional) predicted!" -ForegroundColor Green
    }
    
    $accuracy = [math]::Round(($matchCount / 6) * 100, 1)
    Write-Host "   Accuracy: $accuracy%" -ForegroundColor $(if($matchCount -ge 3){"Green"}elseif($matchCount -ge 2){"Yellow"}else{"Red"})
    
    if ($matchCount -eq 6) {
        Write-Host "   JACKPOT! Group 1!" -ForegroundColor Magenta
    } elseif ($matchCount -eq 5 -and $hasAdditional) {
        Write-Host "   Group 2 Prize!" -ForegroundColor Green
    } elseif ($matchCount -eq 5) {
        Write-Host "   Group 3 Prize!" -ForegroundColor Green
    } elseif ($matchCount -eq 4) {
        Write-Host "   Group 4 Prize" -ForegroundColor Green
    } elseif ($matchCount -eq 3 -and $hasAdditional) {
        Write-Host "   Group 5 Prize" -ForegroundColor Yellow
    } elseif ($matchCount -eq 3) {
        Write-Host "   Group 6 Prize" -ForegroundColor Yellow
    }
    
    Write-Host ""
    return $matchCount
}

# 1. Enhanced Frequency + Compatibility
$recent25 = $historical[0..24]
$recent50 = $historical[0..49]
$recentFreq = Get-Frequency -draws $recent25 -includeAdditional $true
$overallFreq = Get-Frequency -draws $recent50 -includeAdditional $true
$compatibility = @(0) * 50

foreach ($draw in $historical[0..29]) {
    foreach ($base in $baseNumbers) {
        if ($draw.numbers -contains $base -or $draw.additional -eq $base) {
            foreach ($n in $draw.numbers) {
                if ($n -ne $base) { $compatibility[$n] += 1 }
            }
            if ($draw.additional -ne $base) { $compatibility[$draw.additional] += 0.5 }
        }
    }
}

$suggestions = @()
for ($n = 1; $n -le 49; $n++) {
    if ($baseNumbers -notcontains $n) {
        $freqScore = $recentFreq[$n] * 0.4 + $overallFreq[$n] * 0.2
        $compatScore = $compatibility[$n] * 0.3
        $recentBonus = if ($recentFreq[$n] -ge 2) { 0.1 } else { 0 }
        $suggestions += @{ n = $n; score = $freqScore + $compatScore + $recentBonus }
    }
}
$suggestions = $suggestions | Sort-Object -Property score -Descending
$pred1 = Select-WithBalance -candidates $suggestions
$score1 = Validate-Prediction -name "Enhanced Frequency + Compatibility" -predicted $pred1 -index 1

# 2. Momentum Tracker Plus
$recent12 = $historical[0..11]
$momentum = @(0) * 50

for ($i = 0; $i -lt $recent12.Count; $i++) {
    $weight = 12 - $i
    $draw = $recent12[$i]
    foreach ($n in $draw.numbers) { $momentum[$n] += $weight }
    if ($draw.additional) { $momentum[$draw.additional] += $weight * 0.6 }
}

foreach ($base in $baseNumbers) {
    foreach ($draw in $historical[0..19]) {
        if ($draw.numbers -contains $base -or $draw.additional -eq $base) {
            foreach ($n in $draw.numbers) {
                if ($n -ne $base) { $momentum[$n] += 2 }
            }
        }
    }
}

$suggestions = @()
for ($n = 1; $n -le 49; $n++) {
    if ($baseNumbers -notcontains $n) {
        $suggestions += @{ n = $n; score = $momentum[$n] }
    }
}
$suggestions = $suggestions | Sort-Object -Property score -Descending
$pred2 = Select-WithBalance -candidates $suggestions
$score2 = Validate-Prediction -name "Momentum Tracker Plus" -predicted $pred2 -index 2

# 3. Hot/Cold Analysis Refined
$recent15 = $historical[0..14]
$historical40 = $historical[15..54]
$recentFreq15 = Get-Frequency -draws $recent15 -includeAdditional $true
$historicalFreq40 = Get-Frequency -draws $historical40 -includeAdditional $false

$suggestions = @()
for ($n = 1; $n -le 49; $n++) {
    if ($baseNumbers -notcontains $n) {
        $recentRate = $recentFreq15[$n] / $recent15.Count
        $historicalRate = if ($historical40.Count -gt 0) { $historicalFreq40[$n] / $historical40.Count } else { 0 }
        $hotRatio = if ($historicalRate -gt 0) { $recentRate / $historicalRate } else { if ($recentFreq15[$n] -gt 0) { 6 } else { 0 } }
        
        $hotScore = $recentFreq15[$n] * 0.5
        if ($hotRatio -gt 1.3) { $hotScore += $hotRatio * 0.3 }
        if ($recentFreq15[$n] -ge 3) { $hotScore += 0.4 }
        if ($n -ge 20 -and $n -le 35) { $hotScore += 0.2 }
        
        $suggestions += @{ n = $n; score = $hotScore }
    }
}
$suggestions = $suggestions | Sort-Object -Property score -Descending
$pred3 = Select-WithBalance -candidates $suggestions
$score3 = Validate-Prediction -name "Hot/Cold Analysis Refined" -predicted $pred3 -index 3

# 4. Weighted Recent Enhanced
$suggestions = @()
for ($n = 1; $n -le 49; $n++) {
    if ($baseNumbers -notcontains $n) {
        $weightedScore = 0
        for ($i = 0; $i -lt [Math]::Min(25, $historical.Count); $i++) {
            $weight = [Math]::Pow(0.85, $i)
            $draw = $historical[$i]
            if ($draw.numbers -contains $n) {
                $weightedScore += $weight
            } elseif ($draw.additional -eq $n) {
                $weightedScore += $weight * 0.7
            }
        }
        $suggestions += @{ n = $n; score = $weightedScore }
    }
}
$suggestions = $suggestions | Sort-Object -Property score -Descending
$pred4 = Select-WithBalance -candidates $suggestions
$score4 = Validate-Prediction -name "Weighted Recent Enhanced" -predicted $pred4 -index 4

# 5. Pattern Analysis Advanced
$suggestions = @()
for ($n = 1; $n -le 49; $n++) {
    if ($baseNumbers -notcontains $n) {
        $score = (Get-Random) * 0.5
        if ($n -le 16) { $score += 1.5 }
        elseif ($n -le 33) { $score += 1.8 }
        else { $score += 1.2 }
        $suggestions += @{ n = $n; score = $score }
    }
}
$suggestions = $suggestions | Sort-Object -Property score -Descending
$pred5 = Select-WithBalance -candidates $suggestions
$score5 = Validate-Prediction -name "Pattern Analysis Advanced" -predicted $pred5 -index 5

# 6. Compatibility Network
$compatibility = @(0) * 50
foreach ($draw in $historical[0..29]) {
    foreach ($base in $baseNumbers) {
        if ($draw.numbers -contains $base) {
            foreach ($n in $draw.numbers) {
                if ($n -ne $base) {
                    $compatibility[$n] += 2
                    $otherBases = $baseNumbers | Where-Object { $_ -ne $base -and $draw.numbers -contains $_ }
                    if ($otherBases) {
                        $compatibility[$n] += $otherBases.Count
                    }
                }
            }
        }
    }
}

$suggestions = @()
for ($n = 1; $n -le 49; $n++) {
    if ($baseNumbers -notcontains $n) {
        $suggestions += @{ n = $n; score = $compatibility[$n] }
    }
}
$suggestions = $suggestions | Sort-Object -Property score -Descending
$pred6 = Select-WithBalance -candidates $suggestions
$score6 = Validate-Prediction -name "Compatibility Network" -predicted $pred6 -index 6

# 7. Balanced Distribution
$lowRange = @(); $midRange = @(); $highRange = @()
for ($n = 1; $n -le 49; $n++) {
    if ($baseNumbers -notcontains $n) {
        $score = (Get-Random) + 0.5
        if ($n -le 16) { $lowRange += @{ n = $n; score = $score } }
        elseif ($n -le 33) { $midRange += @{ n = $n; score = $score } }
        else { $highRange += @{ n = $n; score = $score } }
    }
}
$lowRange = $lowRange | Sort-Object -Property score -Descending
$midRange = $midRange | Sort-Object -Property score -Descending
$highRange = $highRange | Sort-Object -Property score -Descending
$pred7 = @($lowRange[0..1].n + $midRange[0..1].n + $highRange[0..1].n | Sort-Object)
$score7 = Validate-Prediction -name "Balanced Distribution" -predicted $pred7 -index 7

# 8. Trend Reversal
$suggestions = @()
for ($n = 1; $n -le 49; $n++) {
    if ($baseNumbers -notcontains $n) {
        $lastSeen = 0
        for ($i = 0; $i -lt [Math]::Min(30, $historical.Count); $i++) {
            if ($historical[$i].numbers -contains $n -or $historical[$i].additional -eq $n) {
                $lastSeen = $i
                break
            }
        }
        $score = [Math]::Min($lastSeen * 0.5, 10) + (Get-Random) * 2
        $suggestions += @{ n = $n; score = $score }
    }
}
$suggestions = $suggestions | Sort-Object -Property score -Descending
$pred8 = Select-WithBalance -candidates $suggestions
$score8 = Validate-Prediction -name "Trend Reversal" -predicted $pred8 -index 8

# 9. Frequency Hybrid
$recent20 = $historical[0..19]
$freq20 = Get-Frequency -draws $recent20 -includeAdditional $true

$suggestions = @()
for ($n = 1; $n -le 49; $n++) {
    if ($baseNumbers -notcontains $n) {
        $score = $freq20[$n] * 0.7
        if ($n -ge 10 -and $n -le 40) { $score += 0.3 }
        $score += (Get-Random) * 0.5
        $suggestions += @{ n = $n; score = $score }
    }
}
$suggestions = $suggestions | Sort-Object -Property score -Descending
$pred9 = Select-WithBalance -candidates $suggestions
$score9 = Validate-Prediction -name "Frequency Hybrid" -predicted $pred9 -index 9

# 10. Ensemble Fusion
$votes = @{}
for ($i = 1; $i -le 49; $i++) {
    if ($baseNumbers -notcontains $i) { $votes[$i] = 0 }
}

for ($i = 0; $i -lt $pred1.Count; $i++) { $votes[$pred1[$i]] += 6 - $i }
for ($i = 0; $i -lt $pred2.Count; $i++) { $votes[$pred2[$i]] += 5 - ($i * 0.8) }
for ($i = 0; $i -lt $pred3.Count; $i++) { $votes[$pred3[$i]] += 4 - ($i * 0.6) }

$pred10 = $votes.GetEnumerator() | Sort-Object -Property Value -Descending | Select-Object -First 6 | ForEach-Object { [int]$_.Key } | Sort-Object
$score10 = Validate-Prediction -name "Ensemble Fusion" -predicted $pred10 -index 10

Write-Host ("=" * 70) -ForegroundColor Cyan
Write-Host "SUMMARY" -ForegroundColor Yellow
Write-Host ("=" * 70) -ForegroundColor Cyan

$allScores = @(
    @{Method=1; Name="Enhanced Frequency"; Score=$score1}
    @{Method=2; Name="Momentum Tracker"; Score=$score2}
    @{Method=3; Name="Hot/Cold Analysis"; Score=$score3}
    @{Method=4; Name="Weighted Recent"; Score=$score4}
    @{Method=5; Name="Pattern Analysis"; Score=$score5}
    @{Method=6; Name="Compatibility Network"; Score=$score6}
    @{Method=7; Name="Balanced Distribution"; Score=$score7}
    @{Method=8; Name="Trend Reversal"; Score=$score8}
    @{Method=9; Name="Frequency Hybrid"; Score=$score9}
    @{Method=10; Name="Ensemble Fusion"; Score=$score10}
)

$allScores | Sort-Object -Property Score -Descending | ForEach-Object {
    $color = if($_.Score -ge 3){"Green"}elseif($_.Score -ge 2){"Yellow"}else{"White"}
    Write-Host "Method $($_.Method) ($($_.Name)): $($_.Score)/6 matches" -ForegroundColor $color
}

Write-Host ""
Write-Host ("=" * 70) -ForegroundColor Cyan
