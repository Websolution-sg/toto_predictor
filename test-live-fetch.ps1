# Live TOTO Result Fetching Test
Write-Host "🔍 LIVE TOTO RESULT FETCHING TEST" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

$currentCSV = Get-Content "totoResult.csv" -Head 1
Write-Host "📊 Current CSV latest result: $currentCSV" -ForegroundColor Green
Write-Host ""

# Test multiple Singapore Pools endpoints
$endpoints = @(
    @{
        name = "Online Singapore Pools - Lottery"
        url = "https://online.singaporepools.com/en/lottery"
    },
    @{
        name = "Online Singapore Pools - TOTO Self Pick" 
        url = "https://online.singaporepools.com/en/lottery/toto-self-pick"
    },
    @{
        name = "Singapore Pools - TOTO Results (Legacy)"
        url = "https://www.singaporepools.com.sg/en/product/Pages/toto_results.aspx"
    }
)

foreach($endpoint in $endpoints) {
    Write-Host "🌐 Testing: $($endpoint.name)" -ForegroundColor Yellow
    Write-Host "   URL: $($endpoint.url)" -ForegroundColor Gray
    
    try {
        $response = Invoke-WebRequest -Uri $endpoint.url -TimeoutSec 20 -UserAgent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        Write-Host "   ✅ Status: $($response.StatusCode)" -ForegroundColor Green
        
        $content = $response.Content.ToLower()
        
        # Look for recent dates
        $recentDates = @()
        if($content -match "15.*aug|aug.*15|august.*15") { $recentDates += "August 15" }
        if($content -match "16.*aug|aug.*16|august.*16") { $recentDates += "August 16" }
        if($content -match "12.*aug|aug.*12|august.*12") { $recentDates += "August 12" }
        
        if($recentDates.Count -gt 0) {
            Write-Host "   📅 Found dates: $($recentDates -join ', ')" -ForegroundColor Cyan
        } else {
            Write-Host "   ⚠️  No recent August dates found" -ForegroundColor Yellow
        }
        
        # Look for potential TOTO number sets (6 numbers between 1-49)
        $numberPattern = '\b(?:[1-9]|[1-4][0-9])\b'
        $numbers = [regex]::Matches($content, $numberPattern) | ForEach-Object { [int]$_.Value } | Where-Object { $_ -ge 1 -and $_ -le 49 } | Sort-Object | Get-Unique
        
        if($numbers.Count -ge 6) {
            $uniqueNumbers = $numbers | Sort-Object | Get-Unique
            Write-Host "   🎯 Found $($uniqueNumbers.Count) unique valid TOTO numbers (1-49)" -ForegroundColor Green
            
            # Look for sequences that might be TOTO results
            for($i = 0; $i -lt $uniqueNumbers.Count - 5; $i += 6) {
                $sequence = $uniqueNumbers[$i..($i+5)] -join ","
                if($sequence -ne $currentCSV.Split(',')[0..5] -join ',') {
                    Write-Host "   🔍 Potential new sequence: $sequence" -ForegroundColor Magenta
                }
            }
        } else {
            Write-Host "   ⚠️  Insufficient valid numbers found" -ForegroundColor Yellow
        }
        
    } catch {
        Write-Host "   ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "📈 SUMMARY:" -ForegroundColor Cyan
Write-Host "Current system has enhanced fetching deployed, but may need manual verification" -ForegroundColor White
Write-Host "Check GitHub Actions for automated run status on August 15th" -ForegroundColor White
