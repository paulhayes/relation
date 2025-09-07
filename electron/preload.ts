import { contextBridge, ipcRenderer } from 'electron'

export type IElectronAPI = {
  openOAuthUrl: (url: string) => Promise<void>
  onGoogleAuthCallback: (callback: (code: string) => void) => void
}

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  openOAuthUrl: (url: string) => ipcRenderer.invoke('open-oauth-url', url),
  onGoogleAuthCallback: (callback: (code: string) => void) => {
    ipcRenderer.on('google-auth-callback', (_, code) => callback(code))
  }
} as IElectronAPI)