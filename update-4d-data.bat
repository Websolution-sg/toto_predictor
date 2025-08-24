@echo off
echo 🔄 Updating 4D results from Singapore Pools...
node fetch-4d-results.js

if exist 4dResult.csv (
    echo ✅ 4D results updated successfully!
    echo 🎯 Opening 4D predictor...
    start "" "4d_predictor.html"
) else (
    echo ❌ Failed to update 4D results
)

pause
