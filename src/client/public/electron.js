const electron = require("electron");
const path = require("path");
const url = require("url");
const logger = require("electron-log");
const { app, BrowserWindow, Tray, Menu } = electron;

logger.transports.file.level = "info";
logger.transports.file.maxSize = 1000000;

let mainWindow;

const isSecondInstance = app.makeSingleInstance(() => {
  if (mainWindow) {
    mainWindow.show();
  }
});

if (isSecondInstance) {
  app.quit();
}

const iconUrl =
  process.env.NODE_ENV === "development"
    ? path.join(__dirname, "../../../assets/icon.ico")
    : path.join(__dirname, "../assets/icon.ico");

function createWindow() {
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.js"),
    },
    icon: iconUrl,
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
  if (process.env.NODE_ENV === "development") {
    mainWindow.webContents.openDevTools();
  }
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.on("ready", () => {
  logger.info("Application ready");
  logger.info("Creating Window");
  createWindow();
});

app.on("window-all-closed", () => {
  app.quit();
});
