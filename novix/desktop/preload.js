window.addEventListener('DOMContentLoaded', () => { });


// clse btn related 
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
    closeWindow: () => ipcRenderer.send("close-window")
});