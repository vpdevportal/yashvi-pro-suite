const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

// Set app name for macOS - must be set before app is ready
if (process.platform === 'darwin') {
  // Set the app name - this affects dock tooltip and app menu
  // Note: In development mode, dock tooltip may still show "Electron" 
  // because we're running from Electron.app bundle. This will be correct in packaged builds.
  app.setName('Yashvi Pro Suite');
  
  // Also set the about panel options early
  app.setAboutPanelOptions({
    applicationName: 'Yashvi Pro Suite',
    applicationVersion: app.getVersion() || '1.0.0',
    copyright: 'Yashvi Pro Suite'
  });
}

let mainWindow;

function createWindow() {
  // Set app icon - use .icns for macOS if available, otherwise PNG
  let iconPath;
  if (process.platform === 'darwin') {
    // Try multiple possible locations for the icon
    const possiblePaths = [
      path.join(__dirname, 'public', 'assets', 'yashvi-logo.icns'),
      path.join(__dirname, 'public', 'assets', 'yashvi-logo.png'),
      path.join(__dirname, 'assets', 'yashvi-logo.png'),
      path.join(__dirname, 'resources', 'logos', 'yashvi-logo.png'),
      path.join(app.getAppPath(), 'public', 'assets', 'yashvi-logo.png'),
      path.join(app.getAppPath(), 'assets', 'yashvi-logo.png'),
    ];
    
    for (const possiblePath of possiblePaths) {
      if (fs.existsSync(possiblePath)) {
        iconPath = possiblePath;
        break;
      }
    }
    
    // Fallback to default if nothing found
    if (!iconPath) {
      iconPath = path.join(__dirname, 'public', 'assets', 'yashvi-logo.png');
    }
  } else {
    iconPath = path.join(__dirname, 'public', 'assets', 'yashvi-logo.png');
  }
  
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: iconPath,
    title: 'Yashvi Pro Suite',
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
    // In packaged app, __dirname points to build/ directory inside asar
    // So index.html is at the same level as electron.js
    const indexPath = path.join(__dirname, 'index.html');
    
    console.log('Loading index.html from:', indexPath);
    console.log('__dirname:', __dirname);
    console.log('app.getAppPath():', app.getAppPath());
    
    // Add error handling
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
      console.error('Failed to load:', errorCode, errorDescription);
      console.error('URL:', validatedURL);
    });
    
    mainWindow.webContents.on('dom-ready', () => {
      console.log('DOM ready');
    });
    
    // Listen for console messages to debug
    mainWindow.webContents.on('console-message', (event, level, message) => {
      console.log(`[Renderer ${level}]:`, message);
    });
    
    // Use loadFile which handles file:// protocol correctly
    // With homepage: "./" in package.json, React will use relative paths
    mainWindow.loadFile(indexPath).catch((error) => {
      console.error('Error loading file:', error);
      // Fallback: try with file:// URL
      const fileUrl = `file://${indexPath}`;
      mainWindow.loadURL(fileUrl).catch((err) => {
        console.error('Failed to load URL:', err);
      });
    });
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  // Set dock icon and name for macOS
  if (process.platform === 'darwin' && app.dock) {
    const { nativeImage } = require('electron');
    const iconPath = path.join(__dirname, 'public', 'assets', 'yashvi-logo.png');
    if (fs.existsSync(iconPath)) {
      const icon = nativeImage.createFromPath(iconPath);
      if (!icon.isEmpty()) {
        app.dock.setIcon(icon);
      }
    }
    
    // Try to set the badge (this sometimes helps with name display)
    // app.dock.setBadge(''); // Uncomment if needed
  }
  
  // Ensure app name is set (double-check after ready)
  if (process.platform === 'darwin') {
    app.setName('Yashvi Pro Suite');
  }
  
  createWindow();
});

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
    
    // Composite logo onto image
    const outputFormat = path.extname(outputPath).toLowerCase();
    
    let outputPipeline = image.composite([
      {
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
// Increased default size to 500px to support zooming up to 400px with good quality
async function getThumbnailDataUrl(filePath, maxSize = 500, preserveAlpha = false) {
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
    return await getThumbnailDataUrl(filePath, 500, false);
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

// Get full quality image for modal preview (no resizing, or very large size)
ipcMain.handle('get-full-image', async (event, filePath) => {
  try {
    // Use a very large maxSize (10000px) to effectively get full quality
    // Sharp will only resize if the image is larger, so this preserves original quality
    return await getThumbnailDataUrl(filePath, 10000, false);
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
    // Try multiple possible locations for the logos directory
    // In development: __dirname is the project root
    // In production: __dirname is inside the app.asar at /build/
    // Resources folder is unpacked to app.asar.unpacked/resources/logos
    const possiblePaths = [
      path.join(process.resourcesPath, 'app.asar.unpacked', 'resources', 'logos'), // Production: unpacked location (PRIORITY)
      path.join(process.resourcesPath, 'resources', 'logos'), // Production: alternative unpacked location
      path.join(__dirname, '..', 'resources', 'logos'), // Production: inside asar (may not work with Sharp)
      path.join(__dirname, 'resources', 'logos'), // Development (project root)
      path.join(__dirname, 'build', 'resources', 'logos'), // Development (from build)
      path.join(app.getAppPath(), 'resources', 'logos'), // Production: asar root/resources/logos (may not work with Sharp)
      path.join(app.getAppPath(), 'build', 'resources', 'logos'), // Production (from build, if resources copied there)
    ];

    let logosDir = null;
    for (const possiblePath of possiblePaths) {
      try {
        if (fs.existsSync(possiblePath)) {
          const stats = await fs.promises.stat(possiblePath);
          if (stats.isDirectory()) {
            logosDir = possiblePath;
            break;
          }
        }
      } catch {
        // Continue to next path
      }
    }

    if (!logosDir) {
      console.log('No preset logos directory found. Tried paths:', possiblePaths);
      console.log('__dirname:', __dirname);
      console.log('app.getAppPath():', app.getAppPath());
      console.log('process.resourcesPath:', process.resourcesPath);
      return [];
    }

    console.log(`Found logos directory at: ${logosDir}`);
    const entries = await fs.promises.readdir(logosDir);
    const imageFiles = entries.filter((file) =>
      file.match(/\.(png|jpe?g|webp|gif|svg)$/i)
    );

    if (imageFiles.length === 0) {
      console.log('No preset logo images found in logos directory.');
      return [];
    }

    console.log(`Found ${imageFiles.length} logo file(s):`, imageFiles);
    const logos = [];
    for (const file of imageFiles) {
      const fullPath = path.join(logosDir, file);
      let thumbnail = null;
      try {
        if (!fs.existsSync(fullPath)) {
          console.warn(`Logo file does not exist: ${fullPath}`);
          continue;
        }
        thumbnail = await getThumbnailDataUrl(fullPath, 200, true);
        if (!thumbnail) {
          console.warn(`Failed to generate thumbnail for ${file}: thumbnail is null`);
        }
      } catch (error) {
        console.error(`Failed to generate thumbnail for ${file}:`, error.message);
        thumbnail = null;
      }
      logos.push({
        name: path.basename(file, path.extname(file)), // Name without extension
        path: fullPath,
        thumbnail
      });
    }

    console.log(`Loaded ${logos.length} preset logo(s) from ${logosDir}`);
    return logos;
  } catch (error) {
    console.error('Error loading built-in logos:', error);
    return [];
  }
});

