const { app, BrowserWindow, screen, ipcMain } = require("electron");
const path = require("path");
function create() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const windowWidth = 420;
  const windowHeight = 640;
  const w = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    x: Math.max(20, width - windowWidth - 20),
    y: Math.max(20, height - windowHeight - 20),
    frame: false,
    transparent: true,
    resizable: true,
    alwaysOnTop: false,
    webPreferences: { preload: path.join(__dirname, "preload.js"), contextIsolation: true },
  });
  w.webContents.openDevTools();
  w.loadFile(path.join(__dirname, "renderer", "chat.html"));
}
app.whenReady().then(create);

// close window btn related

ipcMain.on("close-window", (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) {
    win.close();
  }
});