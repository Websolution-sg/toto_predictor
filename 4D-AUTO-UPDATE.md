# Singapore Pools 4D Auto-Update System

## Overview
Automated system to fetch the latest 4D results from Singapore Pools website and update the local CSV database for the 4D Predictor application.

## Features
- 🎯 **Automated Web Scraping**: Fetches latest 4D results from Singapore Pools official website
- 📊 **CSV Database Management**: Automatically updates `4dResult.csv` with new results
- ⏰ **Scheduled Updates**: Set up daily automated updates using Windows Task Scheduler
- 🔍 **Connection Testing**: Test system functionality before deployment
- 📝 **Comprehensive Logging**: Detailed logs for monitoring and troubleshooting
- 🛡️ **Error Handling**: Robust error handling and recovery mechanisms

## Files Structure
```
📁 TOTO Predictor Repository/
├── 🤖 auto-4d-fetcher.js      # Core Node.js scraping engine
├── ⚡ auto-4d-update.ps1      # PowerShell automation script
├── 🖥️ 4d-auto-update.bat      # Windows batch file for easy access
├── 📊 4dResult.csv            # 4D results database (auto-updated)
├── 📋 4D-AUTO-UPDATE.md       # This documentation
└── 📝 auto-4d-update.log      # System logs
```

## Quick Start

### Option 1: Use the Batch File (Recommended for Windows)
1. Double-click `4d-auto-update.bat`
2. Follow the interactive menu:
   - **Option 1**: Test the system
   - **Option 2**: Fetch results immediately
   - **Option 3**: Set up daily automation
   - **Option 4**: View recent logs

### Option 2: Use PowerShell Directly
```powershell
# Test the system
.\auto-4d-update.ps1 -Test

# Fetch results once
.\auto-4d-update.ps1 -RunOnce

# Set up daily updates at 6 PM
.\auto-4d-update.ps1 -Schedule

# Set up daily updates at custom time
.\auto-4d-update.ps1 -Schedule -Time "20:30"
```

### Option 3: Use Node.js Directly
```bash
# Install dependencies
npm install puppeteer

# Test connection
node auto-4d-fetcher.js --test

# Fetch latest results
node auto-4d-fetcher.js
```

## System Requirements
- **Windows 10/11** (for PowerShell scripts)
- **Node.js** (v14 or higher)
- **Internet Connection** (to access Singapore Pools website)
- **Administrator Rights** (for setting up scheduled tasks)

## Installation

### 1. Install Node.js
- Download from [nodejs.org](https://nodejs.org/)
- Install with default settings
- Verify installation: `node --version`

### 2. Install Dependencies
The system will automatically install Puppeteer when first run, or manually:
```bash
npm install puppeteer
```

### 3. Test the System
Run the batch file or use PowerShell:
```powershell
.\auto-4d-update.ps1 -Test
```

## Configuration

### Scheduling Options
- **Default Time**: 18:00 (6:00 PM) daily
- **Custom Time**: Any time in HH:MM format
- **Frequency**: Daily (can be modified in Task Scheduler)

### Data Management
- **CSV Format**: Maintains Singapore Pools standard format
- **Record Limit**: Keeps latest 101 results (configurable)
- **Backup**: Previous data is preserved during updates

## Monitoring

### Log File
- **Location**: `auto-4d-update.log`
- **Format**: Timestamped entries with status indicators
- **Retention**: Cumulative (manual cleanup recommended)

### Log Indicators
- ✅ **Success**: Operation completed successfully
- ❌ **Error**: Operation failed (check details)
- 🔍 **Info**: General information
- ⚠️ **Warning**: Non-critical issues

## Troubleshooting

### Common Issues

#### 1. "Node.js not found"
**Solution**: Install Node.js from [nodejs.org](https://nodejs.org/)

#### 2. "Puppeteer installation failed"
**Solutions**:
- Run as Administrator
- Check internet connection
- Manual install: `npm install puppeteer`

#### 3. "No results extracted"
**Possible Causes**:
- Singapore Pools website structure changed
- Network connectivity issues
- Website blocking automated access

**Solutions**:
- Check internet connection
- Wait and retry (temporary website issues)
- Update selectors in `auto-4d-fetcher.js`

#### 4. "Scheduled task creation failed"
**Solution**: Run PowerShell as Administrator

### Getting Help
1. Check the log file: `auto-4d-update.log`
2. Run test mode: `.\auto-4d-update.ps1 -Test`
3. Verify Node.js installation: `node --version`

## Technical Details

### Web Scraping Method
- **Engine**: Puppeteer (headless Chrome)
- **Target**: Singapore Pools 4D results page
- **Selectors**: Adaptive table detection
- **User Agent**: Standard browser simulation

### Data Processing
- **Input**: HTML table data from Singapore Pools
- **Processing**: Extract draw numbers, dates, and prize numbers
- **Output**: CSV format compatible with 4D Predictor
- **Validation**: Date formatting and data integrity checks

### Security Features
- **Headless Browser**: No GUI, reduced resource usage
- **Rate Limiting**: Respectful scraping practices
- **Error Recovery**: Graceful handling of failures

## CSV Data Format
```csv
draw,date,first,second,third,starter1,starter2,...,consolation1,consolation2,...
5123,2024-01-15,1234,5678,9012,1111,2222,3333,4444,5555,6666,7777,8888,9999,0000,1001,2002,3003,4004,5005,6006,7007,8008,9009,0100
```

## Maintenance

### Regular Tasks
1. **Weekly**: Check log file for errors
2. **Monthly**: Verify scheduled task is running
3. **Quarterly**: Update dependencies if needed

### Updates
- The system is designed to be self-maintaining
- CSV structure updates automatically adapt
- Node.js and Puppeteer updates may require manual intervention

## License
MIT License - Free for personal and educational use

## Support
For technical support or feature requests, check the system logs and troubleshooting section first.

---
*Last Updated: January 2024*
*Version: 1.0.0*
