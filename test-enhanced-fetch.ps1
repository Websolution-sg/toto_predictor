# Simple TOTO Fetching Test Script
Write-Host "🚀 Testing Enhanced TOTO Fetching System" -ForegroundColor Green
Write-Host "📅 Test Date: $(Get-Date)" -ForegroundColor Cyan
Write-Host ""

# Test endpoints in priority order
$endpoints = @(
    "https://online.singaporepools.com/api/lottery/4d-toto-results",
    "https://online.singaporepools.com/api/widgets/lottery-results/toto", 
    "https://www.singaporepools.com.sg/en/product/Pages/toto_results.aspx",
    "https://online.singaporepools.com/en/lottery"
)

$userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"

foreach ($url in $endpoints) {
    Write-Host "🌐 Testing: $url" -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest -Uri $url -UserAgent $userAgent -TimeoutSec 20 -ErrorAction Stop
        
        Write-Host "✅ Status: $($response.StatusCode)" -ForegroundColor Green
        Write-Host "📄 Content Length: $($response.Content.Length) characters" -ForegroundColor Cyan
        
        # Simple content checks
        if ($response.Content -match "22.*25.*29.*31.*34.*43.*11") {
            Write-Host "🎯 Found specific result: 22,25,29,31,34,43,11" -ForegroundColor Green
        } elseif ($response.Content -match "Lottery4dTotoResultWidget") {
            Write-Host "🔧 Found Lottery4dTotoResultWidget component" -ForegroundColor Blue
        } elseif ($response.Content -match "data-component.*Lottery") {
            Write-Host "🔧 Found lottery data components" -ForegroundColor Blue
        } elseif ($response.Content -match "\d{1,2},\d{1,2},\d{1,2},\d{1,2},\d{1,2},\d{1,2}") {
            Write-Host "📋 Found number patterns (potential TOTO results)" -ForegroundColor Yellow
        } else {
            Write-Host "❌ No TOTO patterns found" -ForegroundColor Red
        }
        
    } catch {
        if ($_.Exception.Response) {
            $statusCode = $_.Exception.Response.StatusCode.value__
            Write-Host "❌ HTTP Error: $statusCode" -ForegroundColor Red
        } else {
            Write-Host "❌ Connection Error: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    Write-Host ""
}

Write-Host "🔍 Test Complete! Check GitHub Actions for full workflow results." -ForegroundColor Green
Write-Host "📊 GitHub Actions: https://github.com/websolution-sg/toto_predictor/actions" -ForegroundColor Cyan
