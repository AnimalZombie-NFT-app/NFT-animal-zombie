const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs-extra");
const { NFTStorage, File } = require("nft.storage");
const archiver = require("archiver");

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  if (process.env.NODE_ENV === "development") {
    win.loadURL("http://localhost:5173");
  } else {
    win.loadFile(path.join(__dirname, "dist/index.html"));
  }
}

app.whenReady().then(createWindow);
app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });

ipcMain.handle("dialog:open", async (_, opts) => {
  const win = BrowserWindow.getFocusedWindow();
  const res = await dialog.showOpenDialog(win, opts);
  return res;
});

ipcMain.handle("upload-images", async (_, { imagesDir }) => {
  const apiKey = process.env.NFT_STORAGE_KEY;
  if (!apiKey) return { error: "NFT_STORAGE_KEY not set in environment" };
  try {
    const client = new NFTStorage({ token: apiKey });
    const files = await fs.readdir(imagesDir);
    const fileObjs = [];
    for (const f of files) {
      const p = path.join(imagesDir, f);
      if ((await fs.stat(p)).isFile()) {
        const data = await fs.readFile(p);
        fileObjs.push(new File([data], f, { type: "image/png" }));
      }
    }
    const cid = await client.storeDirectory(fileObjs);
    return { cid };
  } catch (err) {
    return { error: err.message };
  }
});

ipcMain.handle("update-metadata", async (_, { metadataDir, imagesCid }) => {
  try {
    const outDir = path.join(path.dirname(metadataDir), "metadata_ipfs");
    await fs.ensureDir(outDir);
    const files = await fs.readdir(metadataDir);
    for (const f of files) {
      if (!f.endsWith(".json")) continue;
      const metaPath = path.join(metadataDir, f);
      const json = await fs.readJson(metaPath);
      const filename = (json.image || json.image_path || "").split("/").pop() || (`zombie_${f.split('_')[0]}.png`);
      json.image = `ipfs://${imagesCid}/${filename}`;
      json.image_gateway = `https://ipfs.io/ipfs/${imagesCid}/${filename}`;
      json.reference_image = path.join(__dirname, "assets", "reference.png");
      await fs.writeJson(path.join(outDir, f), json, { spaces: 2 });
    }
    return { outDir };
  } catch (err) {
    return { error: err.message };
  }
});

ipcMain.handle("create-zip", async (_, { imagesDir, metadataDir }) => {
  try {
    const outZip = path.join(app.getPath("desktop"), "zombie_elementals_final.zip");
    const output = fs.createWriteStream(outZip);
    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.pipe(output);
    archive.directory(imagesDir, "images");
    archive.directory(metadataDir, "metadata");
    await archive.finalize();
    return { zipPath: outZip };
  } catch (err) {
    return { error: err.message };
  }
});
