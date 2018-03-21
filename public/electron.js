const electron = require("electron");
const path = require("path");
const url = require("url");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

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
          pathname: path.join(__dirname, "/../build/index.html"),
          protocol: "file:",
          slashes: true,
        });
  mainWindow.loadURL(startUrl);

  mainWindow.on("closed", function() {
    mainWindow = null;
  });
}

app.on("ready", createWindow);

app.on("window-all-closed", function() {
  app.quit();
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
