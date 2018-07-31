const electron = require("electron");
const path = require("path");
const url = require("url");
const logger = require("electron-log");
const { autoUpdater } = require("electron-updater");
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

let win;

function sendStatusToWindow(text) {
  log.info(text);
  win.webContents.send("message", text);
}

autoUpdater.on("checking-for-update", () => {
  sendStatusToWindow("Checking for update...");
});

autoUpdater.on("update-available", info => {
  sendStatusToWindow("Update available.");
});

autoUpdater.on("update-not-available", info => {
  sendStatusToWindow("Update not available.");
});

autoUpdater.on("error", err => {
  sendStatusToWindow("Error in auto-updater. " + err);
});

autoUpdater.on("download-progress", progressObj => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + " - Downloaded " + progressObj.percent + "%";
  log_message =
    log_message +
    " (" +
    progressObj.transferred +
    "/" +
    progressObj.total +
    ")";
  sendStatusToWindow(log_message);
});

autoUpdater.on("update-downloaded", info => {
  sendStatusToWindow("Update downloaded");
});

app.on("ready", function() {
  logger.info("Application ready");

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  autoUpdater.checkForUpdatesAndNotify();
  logger.info("Creating Window");

  createWindow();
});

/*
app.on("ready", () => {
  logger.info("Application ready");
  logger.info("Creating Window");
  autoUpdater.checkForUpdates();
  createWindow();
});
*/
// app.on('ready', function()  {
//   autoUpdater.checkForUpdates();
// });
// autoUpdater.on('checking-for-update', () => {
// })
// autoUpdater.on('update-available', (info) => {
// })
// autoUpdater.on('update-not-available', (info) => {
// })
// autoUpdater.on('error', (err) => {
// })
// autoUpdater.on('download-progress', (progressObj) => {
// })
// autoUpdater.on('update-downloaded', (info) => {
//   autoUpdater.quitAndInstall();
// })

app.on("window-all-closed", () => {
  app.quit();
});
