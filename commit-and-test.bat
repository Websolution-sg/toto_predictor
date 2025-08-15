@echo off
echo Committing enhanced TOTO workflow changes...
git add .
git commit -m "🎯 Enhanced TOTO workflow: Priority legacy page + latest results (22,25,29,31,34,43,11)"
git push origin main
echo.
echo Enhanced workflow committed and pushed!
echo.
echo To test the enhanced system:
echo 1. Visit: https://github.com/Websolution-sg/toto_predictor/actions/workflows/update-toto.yml
echo 2. Click "Run workflow" button
echo 3. Click green "Run workflow" button
echo 4. Monitor execution logs
echo.
pause
