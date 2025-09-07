import { contextBridge, ipcRenderer } from "electron";
contextBridge.exposeInMainWorld("electronAPI", {
  openOAuthUrl: (url) => ipcRenderer.invoke("open-oauth-url", url),
  onGoogleAuthCallback: (callback) => {
    ipcRenderer.on("google-auth-callback", (_, code) => callback(code));
  }
});
