const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

let blobWindow;
let chatWindow;

function createWindows() {
    const webPreferences = {
        preload: path.join(__dirname, "preload.js"),
        contextIsolation: true,
        nodeIntegration: false,
    };

    blobWindow = new BrowserWindow({
        width: 90,
        height: 90,
        frame: false,
        transparent: true,
        resizable: false,
        alwaysOnTop: true,
        skipTaskbar: true,
        webPreferences,
    });

    blobWindow.loadFile(path.join(__dirname, "renderer", "blob.html"));

    chatWindow = new BrowserWindow({
        width: 380,
        height: 500,
        frame: true,
        transparent: true,
        show: false,
        resizable: true,
        alwaysOnTop: true,
        webPreferences,
    });

    chatWindow.loadFile(path.join(__dirname, "renderer", "chat.html"));
}

app.whenReady().then(createWindows);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

ipcMain.on("toggle-chat", () => {
    if (chatWindow && chatWindow.isVisible()) {
        chatWindow.hide();
    } else if (chatWindow && blobWindow) {
        const blobPos = blobWindow.getBounds();
        chatWindow.setPosition(blobPos.x - 280, blobPos.y - 360);
        chatWindow.show();
    }
});

ipcMain.on("move-blob-window", (event, { dx, dy }) => {
    if (blobWindow) {
        const [x, y] = blobWindow.getPosition();
        blobWindow.setPosition(x + dx, y + dy);
    }
});
