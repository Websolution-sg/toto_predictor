@echo off
REM This script sets up a Windows Task Scheduler job to run sync-latest.bat every hour

set SCRIPT_PATH=%~dp0sync-latest.bat
set TASK_NAME=TotoPredictorSyncLatest

SCHTASKS /Create /SC HOURLY /TN %TASK_NAME% /TR "%SCRIPT_PATH%" /F

echo Scheduled task '%TASK_NAME%' created to run sync-latest.bat every hour.
