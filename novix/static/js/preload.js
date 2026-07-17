const {contextBridge, ipcRenderer} = require("electron");

contextBridge.exposeInMainWorld("electronAPI",{

    toggleChat: ()=>{
        ipcRenderer.send("toggle-chat");
    }

});