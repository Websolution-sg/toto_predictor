const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

/**
 * Simple HTTP server to handle 4D data refresh requests
 * This allows the web interface to trigger server-side updates
 */

const PORT = 3001;
const SCRIPT_DIR = __dirname;

class RefreshServer {
  constructor() {
    this.server = http.createServer((req, res) => this.handleRequest(req, res));
  }

  async handleRequest(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // Enable CORS for browser requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    try {
      if (pathname === '/refresh' && req.method === 'POST') {
        await this.handleRefreshRequest(req, res);
      } else if (pathname === '/status' && req.method === 'GET') {
        await this.handleStatusRequest(req, res);
      } else if (pathname === '/test' && req.method === 'GET') {
        await this.handleTestRequest(req, res);
      } else {
        this.sendError(res, 404, 'Endpoint not found');
      }
    } catch (error) {
      console.error('Request handling error:', error);
      this.sendError(res, 500, 'Internal server error');
    }
  }

  async handleRefreshRequest(req, res) {
    console.log('🔄 Received refresh request from client');

    try {
      // Execute the PowerShell script to fetch latest results
      const scriptPath = path.join(SCRIPT_DIR, 'auto-4d-update.ps1');
      const command = `powershell.exe -ExecutionPolicy Bypass -File "${scriptPath}" -RunOnce`;

      console.log('🚀 Executing:', command);

      exec(command, { cwd: SCRIPT_DIR }, (error, stdout, stderr) => {
        if (error) {
          console.error('❌ Script execution error:', error);
          this.sendJSON(res, {
            success: false,
            error: error.message,
            stderr: stderr
          });
          return;
        }

        console.log('✅ Script execution completed');
        console.log('STDOUT:', stdout);

        // Check if CSV was updated
        const csvPath = path.join(SCRIPT_DIR, '4dResult.csv');
        fs.stat(csvPath, (statError, stats) => {
          const result = {
            success: true,
            stdout: stdout,
            stderr: stderr,
            csvExists: !statError,
            csvModified: statError ? null : stats.mtime.toISOString(),
            message: 'Refresh completed successfully'
          };

          this.sendJSON(res, result);
        });
      });

    } catch (error) {
      console.error('Error executing refresh:', error);
      this.sendJSON(res, {
        success: false,
        error: error.message
      });
    }
  }

  async handleStatusRequest(req, res) {
    try {
      const csvPath = path.join(SCRIPT_DIR, '4dResult.csv');
      
      fs.stat(csvPath, (error, stats) => {
        const status = {
          server: 'running',
          timestamp: new Date().toISOString(),
          csvExists: !error,
          csvSize: error ? null : stats.size,
          csvModified: error ? null : stats.mtime.toISOString()
        };

        if (!error) {
          // Read latest entry from CSV
          fs.readFile(csvPath, 'utf8', (readError, content) => {
            if (!readError) {
              const lines = content.trim().split('\n');
              if (lines.length > 1) {
                const latestEntry = lines[1].split(',');
                status.latestDraw = latestEntry[0];
                status.latestDate = latestEntry[1];
              }
            }
            this.sendJSON(res, status);
          });
        } else {
          this.sendJSON(res, status);
        }
      });

    } catch (error) {
      this.sendJSON(res, {
        server: 'error',
        error: error.message
      });
    }
  }

  async handleTestRequest(req, res) {
    try {
      // Test the 4D fetcher
      const scriptPath = path.join(SCRIPT_DIR, 'auto-4d-update.ps1');
      const command = `powershell.exe -ExecutionPolicy Bypass -File "${scriptPath}" -Test`;

      console.log('🧪 Running test:', command);

      exec(command, { cwd: SCRIPT_DIR }, (error, stdout, stderr) => {
        const result = {
          testSuccess: !error,
          stdout: stdout,
          stderr: stderr,
          error: error ? error.message : null
        };

        this.sendJSON(res, result);
      });

    } catch (error) {
      this.sendJSON(res, {
        testSuccess: false,
        error: error.message
      });
    }
  }

  sendJSON(res, data) {
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200);
    res.end(JSON.stringify(data, null, 2));
  }

  sendError(res, statusCode, message) {
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(statusCode);
    res.end(JSON.stringify({ error: message }));
  }

  start() {
    this.server.listen(PORT, () => {
      console.log(`🌐 4D Refresh Server running on http://localhost:${PORT}`);
      console.log('📡 Endpoints:');
      console.log('  POST /refresh - Trigger 4D data refresh');
      console.log('  GET  /status  - Check server and data status');
      console.log('  GET  /test    - Test the fetcher system');
    });
  }

  stop() {
    this.server.close();
  }
}

// Start server if run directly
if (require.main === module) {
  const server = new RefreshServer();
  server.start();

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    server.stop();
    process.exit(0);
  });
}

module.exports = RefreshServer;
