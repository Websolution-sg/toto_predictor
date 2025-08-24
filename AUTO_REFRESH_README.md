# 🔄 4D Auto-Refresh System

## Overview
The 4D Auto-Refresh System automatically fetches the latest 4D results from Singapore Pools and updates the predictor interface in real-time. The system works both client-side (in the browser) and server-side for maximum reliability.

## Features
- ✅ **Automatic refresh every 5 minutes**
- ✅ **Manual refresh button** for immediate updates
- ✅ **Real-time status indicator** with countdown timer
- ✅ **Client-side fetching** from Singapore Pools website
- ✅ **Server-side CSV updates** for persistence
- ✅ **Visual notifications** for update status
- ✅ **Fallback mechanisms** for reliability

## Components

### 1. Client-Side Auto-Refresh (Built into 4d_predictor.html)
- **AutoRefreshManager class**: Handles periodic checks and UI updates
- **Client4DFetcher class**: Fetches data directly from Singapore Pools
- **Status indicator**: Shows refresh status and countdown timer
- **Manual refresh button**: Allows instant refresh on demand

### 2. Server-Side Refresh Server (refresh-server.js)
- **HTTP API**: Provides endpoints for triggering updates
- **PowerShell integration**: Calls existing auto-4d-update.ps1 script
- **CORS enabled**: Allows browser requests from the web interface

### 3. Auto-Update Scripts
- **auto-4d-update.ps1**: Existing PowerShell automation script
- **new-4d-fetcher.js**: Server-side Puppeteer-based fetcher

## Quick Start

### Option 1: Client-Side Only (Immediate)
1. Open `4d_predictor.html` in your browser
2. The auto-refresh will start automatically
3. Look for the status indicator at the bottom of the "Latest 4D Results" section
4. Click "🔄 Refresh Now" for manual updates

### Option 2: Full System (Recommended)
1. **Start the refresh server**:
   ```bash
   # Option A: Use the batch file
   start-refresh-server.bat
   
   # Option B: Run directly
   node refresh-server.js
   ```

2. **Open the web interface**:
   - Navigate to `4d_predictor.html`
   - The system will automatically use both client-side and server-side refresh

3. **Verify it's working**:
   - Look for the green status indicator
   - Check console logs for refresh activity
   - Test manual refresh button

## How It Works

### Client-Side Flow
1. **AutoRefreshManager** starts when page loads
2. Every 5 minutes, it attempts to fetch fresh data from Singapore Pools
3. Uses **Client4DFetcher** with CORS proxy to bypass browser restrictions
4. If new data is found, updates the display immediately
5. Triggers server-side update to persist changes to CSV

### Server-Side Flow
1. **refresh-server.js** runs on localhost:3001
2. Receives POST requests to `/refresh` endpoint
3. Executes the PowerShell script `auto-4d-update.ps1 -RunOnce`
4. Updates the `4dResult.csv` file with latest data
5. Returns success/failure status to client

### Fallback Mechanisms
1. If Singapore Pools is unreachable, falls back to CSV file checking
2. If server is not running, continues with client-side only mode
3. If client-side fails, shows error but continues auto-refresh attempts

## API Endpoints

When `refresh-server.js` is running:

### POST /refresh
Triggers a complete 4D data refresh from Singapore Pools
```javascript
fetch('http://localhost:3001/refresh', { method: 'POST' })
```

### GET /status
Returns server and data status
```javascript
fetch('http://localhost:3001/status')
```

### GET /test
Tests the fetcher system
```javascript
fetch('http://localhost:3001/test')
```

## Configuration

### Refresh Interval
Edit `4d_predictor.html` and modify:
```javascript
this.refreshInterval = 5 * 60 * 1000; // 5 minutes (in milliseconds)
```

### Server Port
Edit `refresh-server.js` and modify:
```javascript
const PORT = 3001; // Change to desired port
```

## Status Indicators

| Indicator | Status | Description |
|-----------|--------|-------------|
| 🟢 Green | Active | Auto-refresh is running normally |
| 🟡 Yellow | Checking | Currently checking for updates |
| 🔵 Blue | Current | Results are up to date |
| 🔴 Red | Error | Update check failed |

## Troubleshooting

### Client-Side Issues
1. **CORS errors**: The system uses proxy services to bypass CORS
2. **Singapore Pools changes**: May need to update parsing logic in `client-4d-fetcher.js`
3. **Network issues**: Check browser console for detailed error messages

### Server-Side Issues
1. **Port conflicts**: Change PORT in `refresh-server.js` if 3001 is in use
2. **PowerShell execution**: Ensure PowerShell execution policy allows script running
3. **Puppeteer dependencies**: Run `npm install` to ensure all dependencies are installed

### Common Solutions
```bash
# Install dependencies
npm install

# Test the system
node refresh-server.js
# In another terminal:
curl http://localhost:3001/test

# Check PowerShell script
powershell -ExecutionPolicy Bypass -File auto-4d-update.ps1 -Test
```

## Development

### Adding New Features
1. **Client-side**: Modify `AutoRefreshManager` class in `4d_predictor.html`
2. **Server-side**: Extend `RefreshServer` class in `refresh-server.js`
3. **Fetching logic**: Update `Client4DFetcher` or `new-4d-fetcher.js`

### Testing
```javascript
// Test client-side fetcher
const fetcher = new Client4DFetcher();
fetcher.test();

// Test server endpoint
fetch('http://localhost:3001/test')
  .then(r => r.json())
  .then(console.log);
```

## Security Notes
- The system uses public CORS proxies for client-side fetching
- Server runs on localhost only (not exposed externally)
- No sensitive data is transmitted or stored
- All data comes from public Singapore Pools website

## Performance
- **Minimal impact**: Checks every 5 minutes only
- **Efficient parsing**: Only processes when new data detected
- **Caching**: Uses cache-busting to ensure fresh data
- **Graceful degradation**: Continues working even if components fail

## Support
- Check browser console for detailed logs
- Server logs provide execution details
- All components include comprehensive error handling
- Fallback mechanisms ensure continued operation
