#!/usr/bin/env pwsh
# PowerShell Script for 4D Results Auto-Update
# Description: Automated Singapore Pools 4D results fetcher with scheduling capabilities

param(
    [switch]$Test,
    [switch]$Schedule,
    [switch]$RunOnce,
    [string]$Time = "18:00"
)

$ScriptDir = $PSScriptRoot
$NodeScript = Join-Path $ScriptDir "auto-4d-fetcher.js"
$LogFile = Join-Path $ScriptDir "auto-4d-update.log"

function Write-Log {
    param([string]$Message)
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogEntry = "[$Timestamp] $Message"
    Write-Host $LogEntry
    Add-Content -Path $LogFile -Value $LogEntry
}

function Test-Dependencies {
    Write-Log "🔍 Checking dependencies..."
    
    # Check Node.js
    try {
        $nodeVersion = node --version 2>$null
        if ($nodeVersion) {
            Write-Log "✅ Node.js found: $nodeVersion"
        } else {
            throw "Node.js not found"
        }
    } catch {
        Write-Log "❌ Node.js is required but not found. Please install Node.js from https://nodejs.org/"
        return $false
    }
    
    # Check if package.json exists
    $packagePath = Join-Path $ScriptDir "package.json"
    if (-not (Test-Path $packagePath)) {
        Write-Log "📦 Creating package.json..."
        $packageContent = @"
{
  "name": "singapore-pools-4d-fetcher",
  "version": "1.0.0",
  "description": "Automated 4D results fetcher for Singapore Pools",
  "main": "auto-4d-fetcher.js",
  "scripts": {
    "test": "node auto-4d-fetcher.js --test",
    "fetch": "node auto-4d-fetcher.js",
    "start": "node auto-4d-fetcher.js"
  },
  "dependencies": {
    "puppeteer": "^21.0.0"
  },
  "keywords": ["singapore-pools", "4d", "automation", "scraping"],
  "author": "TOTO Predictor System",
  "license": "MIT"
}
"@
        Set-Content -Path $packagePath -Value $packageContent
        Write-Log "✅ package.json created"
    }
    
    # Check Puppeteer installation
    $nodeModulesPath = Join-Path $ScriptDir "node_modules"
    if (-not (Test-Path $nodeModulesPath)) {
        Write-Log "📦 Installing Puppeteer dependencies..."
        try {
            Set-Location $ScriptDir
            npm install puppeteer
            Write-Log "✅ Puppeteer installed successfully"
        } catch {
            Write-Log "❌ Failed to install Puppeteer: $_"
            return $false
        }
    } else {
        Write-Log "✅ Node modules found"
    }
    
    return $true
}

function Invoke-4DFetch {
    param([switch]$TestMode)
    
    Write-Log "🚀 Starting 4D results fetch$(if($TestMode){' (TEST MODE)'})"
    
    try {
        Set-Location $ScriptDir
        
        if ($TestMode) {
            $result = node $NodeScript --test
        } else {
            $result = node $NodeScript
        }
        
        $exitCode = $LASTEXITCODE
        
        if ($exitCode -eq 0) {
            Write-Log "✅ 4D fetch completed successfully"
            if (-not $TestMode) {
                # Check if CSV was updated
                $csvPath = Join-Path $ScriptDir "4dResult.csv"
                if (Test-Path $csvPath) {
                    $csvInfo = Get-Item $csvPath
                    Write-Log "📊 CSV file updated: $($csvInfo.LastWriteTime)"
                    
                    # Show latest entry
                    $csvContent = Get-Content $csvPath -First 2
                    if ($csvContent.Count -ge 2) {
                        Write-Log "🎯 Latest result: $($csvContent[1])"
                    }
                }
            }
        } else {
            Write-Log "❌ 4D fetch failed with exit code: $exitCode"
        }
        
        return $exitCode -eq 0
    } catch {
        Write-Log "❌ Error during 4D fetch: $_"
        return $false
    }
}

function Install-ScheduledTask {
    param([string]$ScheduleTime)
    
    Write-Log "⏰ Setting up scheduled task for daily 4D updates at $ScheduleTime"
    
    try {
        # Create scheduled task to run daily
        $TaskName = "Singapore-Pools-4D-Auto-Update"
        $TaskDescription = "Automatically fetch latest 4D results from Singapore Pools"
        $TaskAction = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-ExecutionPolicy Bypass -File `"$PSCommandPath`" -RunOnce"
        $TaskTrigger = New-ScheduledTaskTrigger -Daily -At $ScheduleTime
        $TaskSettings = New-ScheduledTaskSettingsSet -AllowStartIfOnDemand -DontStopIfGoingOnBatteries -PowerShellExecutionPolicy Bypass
        
        # Check if task already exists
        $ExistingTask = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
        if ($ExistingTask) {
            Write-Log "🔄 Updating existing scheduled task..."
            Set-ScheduledTask -TaskName $TaskName -Action $TaskAction -Trigger $TaskTrigger -Settings $TaskSettings
        } else {
            Write-Log "➕ Creating new scheduled task..."
            Register-ScheduledTask -TaskName $TaskName -Description $TaskDescription -Action $TaskAction -Trigger $TaskTrigger -Settings $TaskSettings -User "SYSTEM"
        }
        
        Write-Log "✅ Scheduled task '$TaskName' configured successfully"
        Write-Log "📅 The task will run daily at $ScheduleTime"
        Write-Log "🔧 You can manage this task in Windows Task Scheduler"
        
        return $true
    } catch {
        Write-Log "❌ Failed to create scheduled task: $_"
        Write-Log "💡 You may need to run PowerShell as Administrator to create scheduled tasks"
        return $false
    }
}

function Show-Usage {
    Write-Host @"
🎯 Singapore Pools 4D Auto-Fetcher

Usage:
  .\auto-4d-update.ps1 [OPTIONS]

Options:
  -Test           Test connection and data extraction
  -RunOnce        Fetch 4D results once and exit
  -Schedule       Set up automated daily updates
  -Time <HH:MM>   Specify time for scheduled updates (default: 18:00)

Examples:
  .\auto-4d-update.ps1 -Test                    # Test the system
  .\auto-4d-update.ps1 -RunOnce                 # Fetch results now
  .\auto-4d-update.ps1 -Schedule                # Schedule daily updates at 6 PM
  .\auto-4d-update.ps1 -Schedule -Time "20:30"  # Schedule daily updates at 8:30 PM

Log File: auto-4d-update.log
"@
}

# Main execution
Write-Log "🎯 Singapore Pools 4D Auto-Fetcher Started"
Write-Log "📁 Working directory: $ScriptDir"

# Check dependencies first
if (-not (Test-Dependencies)) {
    Write-Log "❌ Dependency check failed. Exiting."
    exit 1
}

# Handle different modes
if ($Test) {
    Write-Log "🧪 Running in test mode..."
    $success = Invoke-4DFetch -TestMode
    if ($success) {
        Write-Log "✅ Test completed successfully"
        exit 0
    } else {
        Write-Log "❌ Test failed"
        exit 1
    }
} elseif ($RunOnce) {
    Write-Log "🎯 Running single fetch operation..."
    $success = Invoke-4DFetch
    if ($success) {
        Write-Log "✅ Single fetch completed successfully"
        exit 0
    } else {
        Write-Log "❌ Single fetch failed"
        exit 1
    }
} elseif ($Schedule) {
    Write-Log "⏰ Setting up scheduled automation..."
    $success = Install-ScheduledTask -ScheduleTime $Time
    if ($success) {
        Write-Log "✅ Scheduling completed successfully"
        exit 0
    } else {
        Write-Log "❌ Scheduling failed"
        exit 1
    }
} else {
    Show-Usage
    Write-Log "💡 Use -Test to test the system, -RunOnce to fetch now, or -Schedule to set up automation"
}

Write-Log "🏁 Auto-Fetcher session completed"
