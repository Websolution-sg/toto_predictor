# Simple TOTO results fetch test
Write-Host "🚀 Testing TOTO Result Fetching from Singapore Pools" -ForegroundColor Green
Write-Host "📅 Test Date: $(Get-Date)" -ForegroundColor Cyan
Write-Host ""

$headers = @{
    'User-Agent' = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    'Accept' = 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
}

# Test primary source - Singapore Pools Legacy Page
Write-Host "🌐 Testing: Singapore Pools Legacy Page (PRIORITY)" -ForegroundColor Yellow
Write-Host "📡 URL: https://www.singaporepools.com.sg/en/product/Pages/toto_results.aspx" -ForegroundColor Gray

try {
    $response = Invoke-WebRequest -Uri "https://www.singaporepools.com.sg/en/product/Pages/toto_results.aspx" -Headers $headers -TimeoutSec 20 -ErrorAction Stop
    
    Write-Host "📊 Response Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "📄 Content Length: $($response.Content.Length) characters" -ForegroundColor Gray
    
    $content = $response.Content
    
    # Look for number patterns
    if ($content -match '(\d{1,2})\s*,\s*(\d{1,2})\s*,\s*(\d{1,2})\s*,\s*(\d{1,2})\s*,\s*(\d{1,2})\s*,\s*(\d{1,2})\s*[,\s]+(\d{1,2})') {
        $numbers = @($matches[1], $matches[2], $matches[3], $matches[4], $matches[5], $matches[6], $matches[7])
        Write-Host "✅ FOUND NUMBERS: [$($numbers -join ', ')]" -ForegroundColor Green
    } else {
        Write-Host "⚠️ No TOTO number pattern found" -ForegroundColor Yellow
        
        # Check page content indicators
        if ($content -like "*Calculate Prize*") {
            Write-Host "   📊 Page shows: Calculator interface" -ForegroundColor Gray
        }
        if ($content -like "*winning*") {
            Write-Host "   🎯 Page contains: 'winning' keyword" -ForegroundColor Gray  
        }
        if ($content -like "*result*") {
            Write-Host "   🎯 Page contains: 'result' keyword" -ForegroundColor Gray
        }
        if ($content.Length -lt 5000) {
            Write-Host "   🔄 Page appears to be JavaScript-heavy (small content)" -ForegroundColor Gray
        }
    }
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test secondary source
Write-Host "🌐 Testing: Online Singapore Pools Platform" -ForegroundColor Yellow  
Write-Host "📡 URL: https://online.singaporepools.com/en/lottery" -ForegroundColor Gray

try {
    $response = Invoke-WebRequest -Uri "https://online.singaporepools.com/en/lottery" -Headers $headers -TimeoutSec 20 -ErrorAction Stop
    
    Write-Host "📊 Response Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "📄 Content Length: $($response.Content.Length) characters" -ForegroundColor Gray
    
    $content = $response.Content
    
    # Look for number patterns
    if ($content -match '(\d{1,2})\s*,\s*(\d{1,2})\s*,\s*(\d{1,2})\s*,\s*(\d{1,2})\s*,\s*(\d{1,2})\s*,\s*(\d{1,2})\s*[,\s]+(\d{1,2})') {
        $numbers = @($matches[1], $matches[2], $matches[3], $matches[4], $matches[5], $matches[6], $matches[7])
        Write-Host "✅ FOUND NUMBERS: [$($numbers -join ', ')]" -ForegroundColor Green
    } else {
        Write-Host "⚠️ No TOTO number pattern found" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Compare with current CSV
Write-Host "📋 Current CSV Results:" -ForegroundColor Cyan
if (Test-Path ".\totoResult.csv") {
    $csvLines = Get-Content ".\totoResult.csv" -First 3
    for ($i = 0; $i -lt $csvLines.Length; $i++) {
        if ($i -eq 0) {
            Write-Host "   Latest: [$($csvLines[$i])]" -ForegroundColor Green
        } else {
            Write-Host "   Previous: [$($csvLines[$i])]" -ForegroundColor Gray
        }
    }
} else {
    Write-Host "   ❌ CSV file not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎯 Test completed at $(Get-Date)" -ForegroundColor Green
