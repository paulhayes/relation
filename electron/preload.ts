import { contextBridge, ipcRenderer } from 'electron'

export type IElectronAPI = {
  openOAuthUrl: (url: string) => Promise<void>
  exchangeOAuthCode: (code: string, clientId: string, clientSecret: string) => Promise<any>
  getOAuthTokens: () => Promise<any>
  clearOAuthTokens: () => Promise<boolean>
  onOAuthCodeReceived: (callback: (code: string) => void) => void
}

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  openOAuthUrl: (url: string) => ipcRenderer.invoke('open-oauth-url', url),
  exchangeOAuthCode: (code: string, clientId: string, clientSecret: string) => 
    ipcRenderer.invoke('exchange-oauth-code', code, clientId, clientSecret),
  getOAuthTokens: () => ipcRenderer.invoke('get-oauth-tokens'),
  clearOAuthTokens: () => ipcRenderer.invoke('clear-oauth-tokens'),
  onOAuthCodeReceived: (callback: (code: string) => void) => {
    ipcRenderer.on('oauth-code-received', (_, code) => callback(code))
  }
} as IElectronAPI)