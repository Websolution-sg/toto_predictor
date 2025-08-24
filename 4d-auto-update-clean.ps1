#!/usr/bin/env pwsh
# PowerShell Script for 4D Results Auto-Update (SEPARATE from TOTO system)
# Description: Automated Singapore Pools 4D results fetcher with scheduling capabilities
# NOTE: This does NOT touch totoResult.csv or any TOTO automation

param(
    [switch]$Test,
    [switch]$Schedule,
    [switch]$RunOnce,
    [string]$Time = "18:00"
)

$ScriptDir = $PSScriptRoot
$NodeScript = Join-Path $ScriptDir "new-4d-fetcher.js"
$LogFile = Join-Path $ScriptDir "4d-auto-update.log"  # Separate log from TOTO

function Write-Log {
    param([string]$Message)
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogEntry = "[$Timestamp] $Message"
    Write-Host $LogEntry
    Add-Content -Path $LogFile -Value $LogEntry
}

function Test-Dependencies {
    Write-Log "Checking 4D system dependencies (separate from TOTO)..."
    
    # Check Node.js
    try {
        $nodeVersion = node --version 2>$null
        if ($nodeVersion) {
            Write-Log "SUCCESS: Node.js found: $nodeVersion"
        } else {
            throw "Node.js not found"
        }
    } catch {
        Write-Log "ERROR: Node.js is required but not found. Please install Node.js from https://nodejs.org/"
        return $false
    }
    
    # Check if package.json exists (don't interfere if TOTO has one)
    $packagePath = Join-Path $ScriptDir "package.json"
    if (-not (Test-Path $packagePath)) {
        Write-Log "Creating package.json for 4D system..."
        $packageContent = @"
{
  "name": "singapore-pools-4d-fetcher",
  "version": "1.0.0",
  "description": "Automated 4D results fetcher for Singapore Pools (separate from TOTO)",
  "main": "auto-4d-fetcher.js",
  "scripts": {
    "test-4d": "node auto-4d-fetcher.js --test",
    "fetch-4d": "node auto-4d-fetcher.js",
    "start-4d": "node auto-4d-fetcher.js"
  },
  "dependencies": {
    "puppeteer": "^21.0.0"
  },
  "keywords": ["singapore-pools", "4d", "automation", "scraping"],
  "author": "4D Predictor System",
  "license": "MIT"
}
"@
        Set-Content -Path $packagePath -Value $packageContent
        Write-Log "SUCCESS: package.json created for 4D system"
    }
    
    # Check Puppeteer installation
    $nodeModulesPath = Join-Path $ScriptDir "node_modules"
    if (-not (Test-Path $nodeModulesPath)) {
        Write-Log "Installing Puppeteer dependencies for 4D system..."
        try {
            Set-Location $ScriptDir
            npm install puppeteer
            Write-Log "SUCCESS: Puppeteer installed successfully"
        } catch {
            Write-Log "ERROR: Failed to install Puppeteer: $_"
            return $false
        }
    } else {
        Write-Log "SUCCESS: Node modules found"
    }
    
    # Verify 4D CSV file location (separate from totoResult.csv)
    $csv4DPath = Join-Path $ScriptDir "4dResult.csv"
    if (Test-Path $csv4DPath) {
        Write-Log "SUCCESS: 4dResult.csv found (separate from TOTO system)"
    } else {
        Write-Log "INFO: 4dResult.csv will be created on first fetch"
    }
    
    return $true
}

function Invoke-4DFetch {
    param([switch]$TestMode)
    
    Write-Log "Starting 4D results fetch (NOT affecting TOTO system)$(if($TestMode){' (TEST MODE)'})"
    
    try {
        Set-Location $ScriptDir
        
        if ($TestMode) {
            $result = node $NodeScript --test
        } else {
            $result = node $NodeScript
        }
        
        $exitCode = $LASTEXITCODE
        
        if ($exitCode -eq 0) {
            Write-Log "SUCCESS: 4D fetch completed successfully"
            if (-not $TestMode) {
                # Check if 4D CSV was updated (not TOTO CSV)
                $csvPath = Join-Path $ScriptDir "4dResult.csv"
                if (Test-Path $csvPath) {
                    $csvInfo = Get-Item $csvPath
                    Write-Log "4D CSV file updated: $($csvInfo.LastWriteTime)"
                    
                    # Show latest 4D entry
                    $csvContent = Get-Content $csvPath -First 2
                    if ($csvContent.Count -ge 2) {
                        Write-Log "Latest 4D result: $($csvContent[1])"
                    }
                }
            }
        } else {
            Write-Log "ERROR: 4D fetch failed with exit code: $exitCode"
        }
        
        return $exitCode -eq 0
    } catch {
        Write-Log "ERROR: Error during 4D fetch: $_"
        return $false
    }
}

function Install-ScheduledTask {
    param([string]$ScheduleTime)
    
    Write-Log "Setting up scheduled task for daily 4D updates at $ScheduleTime (separate from TOTO)"
    
    try {
        # Create scheduled task to run daily (separate from TOTO tasks)
        $TaskName = "Singapore-Pools-4D-Auto-Update"
        $TaskDescription = "Automatically fetch latest 4D results from Singapore Pools (separate from TOTO system)"
        $TaskAction = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-ExecutionPolicy Bypass -File `"$PSCommandPath`" -RunOnce"
        $TaskTrigger = New-ScheduledTaskTrigger -Daily -At $ScheduleTime
        $TaskSettings = New-ScheduledTaskSettingsSet -AllowStartIfOnDemand -DontStopIfGoingOnBatteries -PowerShellExecutionPolicy Bypass
        
        # Check if task already exists
        $ExistingTask = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
        if ($ExistingTask) {
            Write-Log "Updating existing 4D scheduled task..."
            Set-ScheduledTask -TaskName $TaskName -Action $TaskAction -Trigger $TaskTrigger -Settings $TaskSettings
        } else {
            Write-Log "Creating new 4D scheduled task..."
            Register-ScheduledTask -TaskName $TaskName -Description $TaskDescription -Action $TaskAction -Trigger $TaskTrigger -Settings $TaskSettings -User "SYSTEM"
        }
        
        Write-Log "SUCCESS: Scheduled task '$TaskName' configured successfully"
        Write-Log "The 4D task will run daily at $ScheduleTime (TOTO system unaffected)"
        Write-Log "You can manage this task in Windows Task Scheduler"
        
        return $true
    } catch {
        Write-Log "ERROR: Failed to create 4D scheduled task: $_"
        Write-Log "You may need to run PowerShell as Administrator to create scheduled tasks"
        return $false
    }
}

function Show-Usage {
    Write-Host @"
Singapore Pools 4D Auto-Fetcher (SEPARATE from TOTO system)

Usage:
  .\4d-auto-update-clean.ps1 [OPTIONS]

Options:
  -Test           Test 4D connection and data extraction
  -RunOnce        Fetch 4D results once and exit
  -Schedule       Set up automated daily 4D updates
  -Time <HH:MM>   Specify time for scheduled 4D updates (default: 18:00)

Examples:
  .\4d-auto-update-clean.ps1 -Test                    # Test the 4D system
  .\4d-auto-update-clean.ps1 -RunOnce                 # Fetch 4D results now
  .\4d-auto-update-clean.ps1 -Schedule                # Schedule daily 4D updates at 6 PM
  .\4d-auto-update-clean.ps1 -Schedule -Time "20:30"  # Schedule daily 4D updates at 8:30 PM

Log File: 4d-auto-update.log (separate from TOTO logs)
4D Data File: 4dResult.csv (your TOTO system uses totoResult.csv)
"@
}

# Main execution
Write-Log "Singapore Pools 4D Auto-Fetcher Started (TOTO system unaffected)"
Write-Log "Working directory: $ScriptDir"
Write-Log "Target file: 4dResult.csv (NOT totoResult.csv)"

# Check dependencies first
if (-not (Test-Dependencies)) {
    Write-Log "ERROR: Dependency check failed. Exiting."
    exit 1
}

# Handle different modes
if ($Test) {
    Write-Log "Running 4D system test mode..."
    $success = Invoke-4DFetch -TestMode
    if ($success) {
        Write-Log "SUCCESS: 4D test completed successfully"
        exit 0
    } else {
        Write-Log "ERROR: 4D test failed"
        exit 1
    }
} elseif ($RunOnce) {
    Write-Log "Running single 4D fetch operation..."
    $success = Invoke-4DFetch
    if ($success) {
        Write-Log "SUCCESS: Single 4D fetch completed successfully"
        exit 0
    } else {
        Write-Log "ERROR: Single 4D fetch failed"
        exit 1
    }
} elseif ($Schedule) {
    Write-Log "Setting up 4D scheduled automation..."
    $success = Install-ScheduledTask -ScheduleTime $Time
    if ($success) {
        Write-Log "SUCCESS: 4D scheduling completed successfully"
        exit 0
    } else {
        Write-Log "ERROR: 4D scheduling failed"
        exit 1
    }
} else {
    Show-Usage
    Write-Log "Use -Test to test the 4D system, -RunOnce to fetch 4D now, or -Schedule to set up 4D automation"
}

Write-Log "4D Auto-Fetcher session completed (TOTO system remains untouched)"
