import { contextBridge, ipcRenderer } from 'electron';
// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    openOAuthUrl: (url) => ipcRenderer.invoke('open-oauth-url', url),
    onGoogleAuthCallback: (callback) => {
        ipcRenderer.on('google-auth-callback', (_, code) => callback(code));
    }
});
