const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
    toggleChat: () => {
        try {
            ipcRenderer.send("toggle-chat");
        } catch (error) {
            console.warn("toggleChat failed:", error);
        }
    },
    moveWindow: (dx, dy) => {
        try {
            ipcRenderer.send("move-blob-window", { dx, dy });
        } catch (error) {
            console.warn("moveWindow failed:", error);
        }
    },
});
