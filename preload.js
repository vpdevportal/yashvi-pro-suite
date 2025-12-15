const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectImages: () => ipcRenderer.invoke('select-images'),
  selectLogo: () => ipcRenderer.invoke('select-logo'),
  selectOutputFolder: () => ipcRenderer.invoke('select-output-folder'),
  addWatermark: (data) => ipcRenderer.invoke('add-watermark', data),
  processBatch: (data) => ipcRenderer.invoke('process-batch', data),
  getImageThumbnail: (filePath) => ipcRenderer.invoke('get-image-thumbnail', filePath),
  getLogoThumbnail: (filePath) => ipcRenderer.invoke('get-logo-thumbnail', filePath),
  getDefaultOutputFolder: () => ipcRenderer.invoke('get-default-output-folder'),
  getBuiltInLogos: () => ipcRenderer.invoke('get-built-in-logos'),
  onBatchProgress: (callback) => {
    ipcRenderer.on('batch-progress', (event, progress) => callback(progress));
    return () => ipcRenderer.removeAllListeners('batch-progress');
  }
});

