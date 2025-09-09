import { app, BrowserWindow, ipcMain, shell } from 'electron';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { parse } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const isDev = process.env.NODE_ENV === 'development';
// OAuth state
let oauthTokens = null;
// Create a simple HTTP server for OAuth callback
const authServer = createServer((req, res) => {
    const url = parse(req.url, true);
    if (url.pathname === '/auth/callback') {
        const code = url.query.code;
        const error = url.query.error;
        if (error) {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`
        <html>
          <head><title>Authorization Failed</title></head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: #e74c3c;">Authorization Failed</h1>
            <p>There was an error during authorization: ${error}</p>
            <p>You can close this tab and try again.</p>
          </body>
        </html>
      `);
            return;
        }
        if (code) {
            const focusedWindow = BrowserWindow.getFocusedWindow();
            const allWindows = BrowserWindow.getAllWindows();
            // Try to send to focused window, fallback to all windows
            if (focusedWindow) {
                focusedWindow.webContents.send('oauth-code-received', code);
            }
            else if (allWindows.length > 0) {
                allWindows[0].webContents.send('oauth-code-received', code);
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`
        <html>
          <head><title>Authorization Successful</title></head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: #27ae60;">Authorization Successful!</h1>
            <p>You have successfully authorized the application.</p>
            <p><strong>You can now close this tab.</strong></p>
            <script>
              // Auto-close after 3 seconds if possible
              setTimeout(() => {
                try { window.close(); } catch(e) {}
              }, 3000);
            </script>
          </body>
        </html>
      `);
        }
    }
    else {
        res.writeHead(404);
        res.end('Not found');
    }
});
// Start auth server on port 3001
authServer.listen(3001, () => {
    console.log('OAuth callback server listening on http://localhost:3001');
});
function createWindow() {
    const preloadPath = join(__dirname, 'preload.cjs');
    console.log('Preload path:', preloadPath);
    console.log('__dirname:', __dirname);
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: preloadPath
        },
        titleBarStyle: 'hiddenInset',
        backgroundColor: '#1a1a1a',
        show: false
    });
    // Show window when ready to prevent visual flash
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });
    if (isDev) {
        mainWindow.loadURL('http://localhost:3000');
        mainWindow.webContents.openDevTools();
    }
    else {
        mainWindow.loadFile(join(__dirname, '../dist/index.html'));
    }
}
app.whenReady().then(() => {
    createWindow();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
});
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin')
        app.quit();
});
// Handle OAuth URL opening
ipcMain.handle('open-oauth-url', async (_, url) => {
    shell.openExternal(url);
});
// Handle OAuth code exchange
ipcMain.handle('exchange-oauth-code', async (_, code, clientId, clientSecret) => {
    try {
        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                code: code,
                grant_type: 'authorization_code',
                redirect_uri: 'http://localhost:3001/auth/callback',
            }),
        });
        if (!response.ok) {
            throw new Error('Failed to exchange code for tokens');
        }
        const tokens = await response.json();
        oauthTokens = tokens;
        return tokens;
    }
    catch (error) {
        console.error('Token exchange failed:', error);
        throw error;
    }
});
// Get stored OAuth tokens
ipcMain.handle('get-oauth-tokens', async () => {
    return oauthTokens;
});
// Clear OAuth tokens
ipcMain.handle('clear-oauth-tokens', async () => {
    oauthTokens = null;
    return true;
});
