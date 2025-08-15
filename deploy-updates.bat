@echo off
echo Testing GitHub Pages deployment...
echo.
echo Current local CSV status:
type totoResult.csv | findstr /n "." | head -n 3
echo.
echo Checking git status...
git status
echo.
echo Committing and pushing updates...
git add .
git commit -m "Update TOTO results: Latest winning numbers 22,25,29,31,34,43,11 (Aug 16, 2025)"
git push origin main
echo.
echo Updates pushed to GitHub!
echo Wait 2-3 minutes for GitHub Pages to deploy.
echo Then check: https://websolution-sg.github.io/toto_predictor/
echo.
pause
