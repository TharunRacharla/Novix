const { app, BrowserWindow, ipcMain } = require("electron");

let blobWindow;
let chatWindow;

function createWindows() {

    blobWindow = new BrowserWindow({
        width: 120,
        height: 120,
        frame: false,
        transparent: true,
        resizable: false,
        alwaysOnTop: true,
        skipTaskbar: true,
        webPreferences: {
            preload: __dirname + "/preload.js"
        }
    });

    blobWindow.loadFile("./renderer/blob.html");

    chatWindow = new BrowserWindow({
        width: 380,
        height: 500,
        frame: false,
        transparent: true,
        show: false,
        resizable: false,
        alwaysOnTop: true,
        webPreferences: {
            preload: __dirname + "/preload.js"
        }
    });

    chatWindow.loadFile("./renderer/chat.html");
}

app.whenReady().then(createWindows);

ipcMain.on("toggle-chat", () => {

    if(chatWindow.isVisible()){
        chatWindow.hide();
    }else{

        const blobPos = blobWindow.getBounds();

        chatWindow.setPosition(
            blobPos.x - 280,
            blobPos.y - 360
        );

        chatWindow.show();
    }

});