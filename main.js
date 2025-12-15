const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Load the app - try dev server first, then fallback to build
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    // DevTools can be opened manually with Cmd+Option+I (Mac) or Ctrl+Shift+I (Windows/Linux)
  } else {
    mainWindow.loadFile(path.join(__dirname, 'build', 'index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC Handlers
ipcMain.handle('select-images', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff'] }
    ]
  });
  return result.canceled ? null : result.filePaths;
});

ipcMain.handle('select-logo', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'svg'] }
    ]
  });
  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle('select-output-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  return result.canceled ? null : result.filePaths[0];
});

// Helper function to add watermark
async function addWatermarkToImage({ imagePath, logoPath, outputPath, options }) {
  try {
    // Auto-rotate based on EXIF orientation - Sharp's rotate() without angle auto-rotates
    const image = sharp(imagePath).rotate();
    const logo = sharp(logoPath);
    
    // Get metadata after rotation to get correct dimensions
    const imageMetadata = await image.metadata();
    
    // Calculate logo size (percentage of image dimensions)
    const logoWidth = Math.floor(imageMetadata.width * (options.logoSize / 100));
    const logoHeight = Math.floor(imageMetadata.height * (options.logoSize / 100));
    
    // Resize logo maintaining aspect ratio
    const resizedLogo = await logo
      .resize(logoWidth, logoHeight, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .toBuffer();
    
    // Calculate position
    let top, left;
    const margin = Math.floor(Math.min(imageMetadata.width, imageMetadata.height) * (options.margin / 100));
    
    switch (options.position) {
      case 'top-left':
        top = margin;
        left = margin;
        break;
      case 'top-right':
        top = margin;
        left = imageMetadata.width - logoWidth - margin;
        break;
      case 'bottom-left':
        top = imageMetadata.height - logoHeight - margin;
        left = margin;
        break;
      case 'bottom-right':
        top = imageMetadata.height - logoHeight - margin;
        left = imageMetadata.width - logoWidth - margin;
        break;
      case 'center':
        top = Math.floor((imageMetadata.height - logoHeight) / 2);
        left = Math.floor((imageMetadata.width - logoWidth) / 2);
        break;
      default:
        top = margin;
        left = margin;
    }
    
    // Apply opacity if specified (Sharp doesn't directly support opacity in composite,
    // so we'll handle it by using ensureAlpha and modifying alpha channel)
    let logoBuffer = resizedLogo;
    if (options.opacity < 100) {
      const logoMetadata = await sharp(resizedLogo).metadata();
      const alpha = options.opacity / 100;
      
      // Ensure logo has alpha channel
      const logoWithAlpha = await sharp(resizedLogo)
        .ensureAlpha()
        .raw()
        .toBuffer();
      
      // Modify alpha channel to apply opacity
      const modifiedLogo = Buffer.from(logoWithAlpha);
      for (let i = 3; i < modifiedLogo.length; i += 4) {
        modifiedLogo[i] = Math.floor(modifiedLogo[i] * alpha);
      }
      
      logoBuffer = await sharp(modifiedLogo, {
        raw: {
          width: logoMetadata.width,
          height: logoMetadata.height,
          channels: 4
        }
      })
      .png()
      .toBuffer();
    }
    
    // Composite logo onto image (with subtle shadow under the logo for better visibility)
    const outputFormat = path.extname(outputPath).toLowerCase();
    
    // Create a shadow using the logo's alpha so the background stays transparent
    const shadowOffset = Math.floor(Math.min(imageMetadata.width, imageMetadata.height) * 0.005); // 0.5% of min dimension
    const blurRadius = Math.max(2, Math.floor(Math.min(imageMetadata.width, imageMetadata.height) * 0.005));

    const shadowBuffer = await sharp(logoBuffer)
      .ensureAlpha()
      .modulate({ brightness: 0 }) // make it black but keep alpha (shape of logo only)
      .blur(blurRadius)
      .toBuffer();

    let outputPipeline = image.composite([
      {
        // shadow slightly down/right, lower opacity
        input: shadowBuffer,
        top: Math.max(0, top + shadowOffset),
        left: Math.max(0, left + shadowOffset),
        blend: 'over',
        opacity: 0.4
      },
      {
        // real logo on top
        input: logoBuffer,
        top: Math.max(0, top),
        left: Math.max(0, left),
        blend: 'over'
      }
    ]);

    // Preserve quality based on output format
    if (outputFormat === '.jpg' || outputFormat === '.jpeg') {
      // JPEG: Use maximum quality (100) with mozjpeg for better compression
      outputPipeline = outputPipeline.jpeg({ quality: 100, mozjpeg: true });
    } else if (outputFormat === '.png') {
      // PNG: Lossless by default, use moderate compression (6) for good balance
      outputPipeline = outputPipeline.png({ compressionLevel: 6 });
    } else if (outputFormat === '.webp') {
      // WebP: Use maximum quality
      outputPipeline = outputPipeline.webp({ quality: 100 });
    }
    // For other formats (GIF, BMP, TIFF), Sharp will preserve quality with defaults

    await outputPipeline.toFile(outputPath);
    
    return { success: true, outputPath };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Helper to generate a small thumbnail as a data URL for previews
async function getThumbnailDataUrl(filePath, maxSize = 200, preserveAlpha = false) {
  const image = sharp(filePath).rotate(); // Auto-rotate based on EXIF orientation
  const metadata = await image.metadata();

  const width = metadata.width || maxSize;
  const height = metadata.height || maxSize;

  const size = Math.min(maxSize, Math.max(width, height));

  const format = preserveAlpha ? 'png' : 'jpeg';
  const mime = format === 'png' ? 'image/png' : 'image/jpeg';

  const buffer = await image
    .resize(size, size, {
      fit: 'inside',
      withoutEnlargement: true
    })
    [format]()
    .toBuffer();

  return `data:${mime};base64,${buffer.toString('base64')}`;
}

ipcMain.handle('add-watermark', async (event, data) => {
  return await addWatermarkToImage(data);
});

ipcMain.handle('process-batch', async (event, { imagePaths, logoPath, outputFolder, options }) => {
  const results = [];
  
  for (let i = 0; i < imagePaths.length; i++) {
    const imagePath = imagePaths[i];
    const fileName = path.basename(imagePath);
    const ext = path.extname(fileName);
    const nameWithoutExt = path.basename(fileName, ext);
    const outputPath = path.join(outputFolder, `${nameWithoutExt}_watermarked${ext}`);
    
    const result = await addWatermarkToImage({
      imagePath,
      logoPath,
      outputPath,
      options
    });
    
    results.push({
      input: imagePath,
      output: outputPath,
      ...result
    });
    
    // Send progress update
    const progress = ((i + 1) / imagePaths.length) * 100;
    event.sender.send('batch-progress', progress);
  }
  
  return results;
});

// IPC for thumbnails (used by React UI to preview local files)
ipcMain.handle('get-image-thumbnail', async (event, filePath) => {
  try {
    return await getThumbnailDataUrl(filePath, 200, false);
  } catch (error) {
    return null;
  }
});

ipcMain.handle('get-logo-thumbnail', async (event, filePath) => {
  try {
    // preserve alpha for logos so transparent PNGs look correct
    return await getThumbnailDataUrl(filePath, 200, true);
  } catch (error) {
    return null;
  }
});

// Default output folder (Downloads)
ipcMain.handle('get-default-output-folder', async () => {
  try {
    return app.getPath('downloads');
  } catch (error) {
    return null;
  }
});

// List built-in logos from resources/logos (with thumbnails)
ipcMain.handle('get-built-in-logos', async () => {
  try {
    const logosDir = path.join(__dirname, 'resources', 'logos');
    const entries = await fs.promises.readdir(logosDir);
    const imageFiles = entries.filter((file) =>
      file.match(/\.(png|jpe?g|webp|gif)$/i)
    );

    const logos = [];
    for (const file of imageFiles) {
      const fullPath = path.join(logosDir, file);
      let thumbnail = null;
      try {
        thumbnail = await getThumbnailDataUrl(fullPath, 200, true);
      } catch {
        thumbnail = null;
      }
      logos.push({
        name: file,
        path: fullPath,
        thumbnail
      });
    }

    return logos;
  } catch (error) {
    return [];
  }
});

