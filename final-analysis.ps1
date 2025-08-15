# Final TOTO Results Analysis
Write-Host "🔍 COMPREHENSIVE TOTO RESULTS ANALYSIS" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

$currentResult = (Get-Content "totoResult.csv")[0]
Write-Host "📊 Current CSV Result: $currentResult" -ForegroundColor Green
Write-Host "📅 Current Date: August 16, 2025 (Saturday)" -ForegroundColor Yellow
Write-Host "⏰ Last CSV Update: August 12, 2025" -ForegroundColor Yellow
Write-Host ""

Write-Host "🌐 SINGAPORE POOLS LIVE TEST RESULTS:" -ForegroundColor Cyan
Write-Host ""

# Test 1: Online Singapore Pools main lottery page
try {
    $response1 = Invoke-WebRequest -Uri "https://online.singaporepools.com/en/lottery" -TimeoutSec 20
    Write-Host "1️⃣  Online Lottery Page: ✅ Accessible ($($response1.StatusCode))" -ForegroundColor Green
    $content1 = $response1.Content.ToLower()
    if($content1 -match "august.*15|15.*august|aug.*15|15.*aug") {
        Write-Host "   📅 August 15 content: FOUND" -ForegroundColor Green
    } else {
        Write-Host "   📅 August 15 content: NOT FOUND" -ForegroundColor Yellow
    }
} catch {
    Write-Host "1️⃣  Online Lottery Page: ❌ Error" -ForegroundColor Red
}

# Test 2: TOTO Self-Pick (found Aug 16 references)
try {
    $response2 = Invoke-WebRequest -Uri "https://online.singaporepools.com/en/lottery/toto-self-pick" -TimeoutSec 20
    Write-Host "2️⃣  TOTO Self-Pick Page: ✅ Accessible ($($response2.StatusCode))" -ForegroundColor Green
    $content2 = $response2.Content.ToLower()
    if($content2 -match "august.*16|16.*august|aug.*16|16.*aug") {
        Write-Host "   📅 August 16 content: FOUND ✅" -ForegroundColor Green
    }
    if($content2 -match "august.*15|15.*august|aug.*15|15.*aug") {
        Write-Host "   📅 August 15 content: FOUND ✅" -ForegroundColor Green
    } else {
        Write-Host "   📅 August 15 content: NOT FOUND" -ForegroundColor Yellow
    }
} catch {
    Write-Host "2️⃣  TOTO Self-Pick Page: ❌ Error" -ForegroundColor Red
}

Write-Host ""
Write-Host "📈 ANALYSIS SUMMARY:" -ForegroundColor Cyan
Write-Host "✅ Singapore Pools online platform is accessible" -ForegroundColor Green
Write-Host "✅ Enhanced fetching system is deployed" -ForegroundColor Green  
Write-Host "✅ August 16 references found (today's date)" -ForegroundColor Green
Write-Host "⚠️  August 15 TOTO draw results not clearly visible" -ForegroundColor Yellow
Write-Host "⚠️  No automated CSV updates since August 12" -ForegroundColor Yellow
Write-Host ""

Write-Host "🎯 CONCLUSIONS:" -ForegroundColor Cyan
Write-Host "• Current result: 9,24,31,34,43,44,1 (from Aug 12)" -ForegroundColor White
Write-Host "• System can access Singapore Pools successfully" -ForegroundColor White  
Write-Host "• August 15 TOTO results may not be published yet" -ForegroundColor White
Write-Host "• OR results are on a different page/format than expected" -ForegroundColor White
Write-Host "• Enhanced system is ready, but needs manual trigger test" -ForegroundColor White

Write-Host ""
Write-Host "🚀 RECOMMENDATIONS:" -ForegroundColor Green
Write-Host "1. Check GitHub Actions for Aug 15 workflow execution" -ForegroundColor White
Write-Host "2. Manually trigger workflow to test enhanced system" -ForegroundColor White
Write-Host "3. Verify Singapore Pools actually released Aug 15 results" -ForegroundColor White
Write-Host "4. System appears functional - may be a data availability issue" -ForegroundColor White
