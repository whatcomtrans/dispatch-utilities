const electron = require("electron");
const path = require("path");
const url = require("url");
const { app, BrowserWindow, Tray, Menu } = electron;

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  const startUrl =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : url.format({
          pathname: path.join(__dirname, "./index.html"),
          protocol: "file:",
          slashes: true,
        });
  mainWindow.loadURL(startUrl);
  mainWindow.webContents.openDevTools();
  mainWindow.on("close", e => {
    e.preventDefault();
    mainWindow.hide();
  });
  mainWindow.on("minimize", e => {
    e.preventDefault();
    mainWindow.hide();
  });
}

function createTray() {
  const tray = new Tray(path.join(__dirname, "./icon.ico"));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Quit",
      click: () => {
        tray.destroy();
        app.quit();
      },
    },
  ]);
  tray.on("click", () => {
    mainWindow.show();
  });
  tray.setToolTip("Dispatch Utilities");
  tray.setContextMenu(contextMenu);
}

app.on("ready", () => {
  createTray();
  createWindow();
});

const { clipboard, ipcMain } = electron;

ipcMain.once("ready", event => {
  let clipboardText;
  let clipboardImage;

  setInterval(() => {
    let newClipboardText = clipboard.readText();
    let newClipboardImage = clipboard.readImage();

    if (newClipboardText && clipboardText !== newClipboardText) {
      clipboardImage = null;
      clipboardText = newClipboardText;
      event.sender.send("copy-text", clipboardText);
    } else if (!newClipboardImage.isEmpty()) {
      newClipboardImage = newClipboardImage.toDataURL();
      if (clipboardImage !== newClipboardImage) {
        clipboardText = null;
        clipboardImage = newClipboardImage;
        event.sender.send("copy-image", clipboardImage);
      }
    }
  }, 250);
});
