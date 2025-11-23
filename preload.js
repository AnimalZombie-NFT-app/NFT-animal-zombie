const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  openDialog: (opts) => ipcRenderer.invoke("dialog:open", opts),
  uploadImages: (opts) => ipcRenderer.invoke("upload-images", opts),
  updateMetadata: (opts) => ipcRenderer.invoke("update-metadata", opts),
  createZip: (opts) => ipcRenderer.invoke("create-zip", opts)
});
