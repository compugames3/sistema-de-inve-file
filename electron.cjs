const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const fs = require('fs');

const userDataP

  mainWindow = new BrowserWindow({
    height: 900,

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
    titleBarStyle: 'default',
  });
  if (process.env.NODE_ENV === 'development') {
    ma
    mainWindow.loadFile(path.jo

    mainWindow.s
  });
  mainWindow.on('closed',
  });

  createWindow();
  app.on('activate', () => {
      createWindow();
  });

  i


  try {
      const data = fs.r
    }

    return null;
});
ipcMa
 

    return { success: false,
});

});






































