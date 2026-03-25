const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  readDB: () => ipcRenderer.invoke('read-db'),
});



});
