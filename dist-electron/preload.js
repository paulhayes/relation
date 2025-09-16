//import { contextBridge, ipcRenderer } from 'electron';
const { contextBridge, ipcRenderer } = require('electron');
// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    openOAuthUrl: (url) => ipcRenderer.invoke('open-oauth-url', url),
    exchangeOAuthCode: (code, clientId, clientSecret) => ipcRenderer.invoke('exchange-oauth-code', code, clientId, clientSecret),
    getOAuthTokens: () => ipcRenderer.invoke('get-oauth-tokens'),
    clearOAuthTokens: () => ipcRenderer.invoke('clear-oauth-tokens'),
    onOAuthCodeReceived: (callback) => {
        ipcRenderer.on('oauth-code-received', (_, code) => callback(code));
    }
});
