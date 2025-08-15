# Test script to fetch latest TOTO results from Singapore Pools
# PowerShell version for testing without Node.js

Write-Host "🚀 Testing TOTO Result Fetching from Singapore Pools" -ForegroundColor Green
Write-Host "📅 Test Date: $(Get-Date)" -ForegroundColor Cyan
Write-Host ""

# Define test URLs in priority order
$testUrls = @(
    @{
        Name = "Singapore Pools Legacy Page (PRIORITY)"
        Url = "https://www.singaporepools.com.sg/en/product/Pages/toto_results.aspx"
    },
    @{
        Name = "Singapore Pools Mobile Legacy"
        Url = "https://m.singaporepools.com.sg/en/product/Pages/toto_results.aspx"
    },
    @{
        Name = "Online Singapore Pools Platform"
        Url = "https://online.singaporepools.com/en/lottery"
    },
    @{
        Name = "Singapore Pools API Direct"
        Url = "https://www.singaporepools.com.sg/api/toto/results/latest"
    }
)

$headers = @{
    'User-Agent' = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36'
    'Accept' = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
    'Accept-Language' = 'en-US,en;q=0.5'
    'Cache-Control' = 'no-cache'
    'Pragma' = 'no-cache'
}

$foundResults = @()

foreach ($source in $testUrls) {
    try {
        Write-Host "🌐 Testing: $($source.Name)" -ForegroundColor Yellow
        Write-Host "📡 URL: $($source.Url)" -ForegroundColor Gray
        
        $response = Invoke-WebRequest -Uri $source.Url -Headers $headers -TimeoutSec 20 -ErrorAction Stop
        
        Write-Host "📊 Response Status: $($response.StatusCode)" -ForegroundColor Green
        Write-Host "📄 Content Length: $($response.Content.Length) characters" -ForegroundColor Gray
        
        # Look for TOTO number patterns in the content
        $content = $response.Content
        
        # Pattern matching for TOTO numbers
        $numberPatterns = @(
            '\b(\d{1,2})\s*,\s*(\d{1,2})\s*,\s*(\d{1,2})\s*,\s*(\d{1,2})\s*,\s*(\d{1,2})\s*,\s*(\d{1,2})\s*[,\s]+(\d{1,2})\b',
            'winning.*?numbers.*?(\d{1,2})[^0-9]*(\d{1,2})[^0-9]*(\d{1,2})[^0-9]*(\d{1,2})[^0-9]*(\d{1,2})[^0-9]*(\d{1,2})[^0-9]*(\d{1,2})',
            'results.*?(\d{1,2})[^0-9]*(\d{1,2})[^0-9]*(\d{1,2})[^0-9]*(\d{1,2})[^0-9]*(\d{1,2})[^0-9]*(\d{1,2})[^0-9]*(\d{1,2})'
        )
        
        $found = $false
        foreach ($pattern in $numberPatterns) {
            if ($content -match $pattern) {
                $numbers = @($matches[1], $matches[2], $matches[3], $matches[4], $matches[5], $matches[6], $matches[7])
                $numbers = $numbers | ForEach-Object { [int]$_ }
                
                # Validate numbers are in valid range (1-49)
                $validNumbers = $numbers | Where-Object { $_ -ge 1 -and $_ -le 49 }
                
                if ($validNumbers.Count -eq 7) {
                    Write-Host "✅ FOUND NUMBERS: [$($numbers -join ', ')]" -ForegroundColor Green
                    $foundResults += @{
                        Source = $source.Name
                        Numbers = $numbers
                        Url = $source.Url
                    }
                    $found = $true
                    break
                }
            }
        }
        
        if (-not $found) {
            Write-Host "⚠️ No valid TOTO numbers found in content" -ForegroundColor Yellow
            
            # Check for common indicators
            if ($content -like "*Calculate Prize*") {
                Write-Host "   📊 Found: Calculator interface" -ForegroundColor Gray
            }
            if ($content -like "*javascript*" -and $content.Length -lt 5000) {
                Write-Host "   🔄 Page appears to be JavaScript-heavy" -ForegroundColor Gray
            }
            if ($content -like "*winning*" -or $content -like "*result*") {
                Write-Host "   🎯 Contains result-related content" -ForegroundColor Gray
            }
        }
        
        Write-Host ""
        
    } catch {
        Write-Host "❌ Error accessing $($source.Name): $($_.Exception.Message)" -ForegroundColor Red
        
        if ($_.Exception.Message -like "*403*" -or $_.Exception.Message -like "*Forbidden*") {
            Write-Host "   🚫 Access forbidden - anti-bot measures detected" -ForegroundColor Yellow
        } elseif ($_.Exception.Message -like "*timeout*") {
            Write-Host "   ⏰ Request timed out" -ForegroundColor Yellow
        }
        Write-Host ""
    }
}

# Summary
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "📊 FETCH TEST RESULTS SUMMARY" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

if ($foundResults.Count -gt 0) {
    Write-Host "✅ Successfully found $($foundResults.Count) result(s):" -ForegroundColor Green
    
    foreach ($result in $foundResults) {
        Write-Host "🎯 Source: $($result.Source)" -ForegroundColor Yellow
        Write-Host "🔢 Numbers: [$($result.Numbers -join ', ')]" -ForegroundColor Green
        Write-Host "🌐 URL: $($result.Url)" -ForegroundColor Gray
        Write-Host ""
    }
    
    # Compare with current CSV
    $csvPath = ".\totoResult.csv"
    if (Test-Path $csvPath) {
        $csvContent = Get-Content $csvPath -First 1
        $currentNumbers = $csvContent -split ','
        Write-Host "📋 Current CSV top result: [$($currentNumbers -join ', ')]" -ForegroundColor Cyan
        
        foreach ($result in $foundResults) {
            $fetchedStr = $result.Numbers -join ','
            if ($csvContent -eq $fetchedStr) {
                Write-Host "✅ Fetched result matches current CSV - Up to date!" -ForegroundColor Green
            } else {
                Write-Host "⚠️ Fetched result differs from CSV - New result available?" -ForegroundColor Yellow
                Write-Host "   CSV: [$($currentNumbers -join ', ')]" -ForegroundColor Gray
                Write-Host "   Fetched: [$($result.Numbers -join ', ')]" -ForegroundColor Gray
            }
        }
    }
    
} else {
    Write-Host "❌ No valid TOTO results found from any source" -ForegroundColor Red
    Write-Host "📊 This could indicate:" -ForegroundColor Yellow
    Write-Host "   • Website structure changes" -ForegroundColor Gray
    Write-Host "   • Anti-bot measures blocking requests" -ForegroundColor Gray
    Write-Host "   • Results displayed via JavaScript only" -ForegroundColor Gray
    Write-Host "   • Need for authentication or different endpoints" -ForegroundColor Gray
}

Write-Host ""
Write-Host "🎯 Test completed at $(Get-Date)" -ForegroundColor Green
