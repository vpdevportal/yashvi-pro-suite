import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [images, setImages] = useState([]);
  const [logo, setLogo] = useState(null);
  const [imageThumbs, setImageThumbs] = useState({});
  const [logoThumb, setLogoThumb] = useState(null);
  const [builtInLogos, setBuiltInLogos] = useState([]);
  const [outputFolder, setOutputFolder] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [options, setOptions] = useState({
    position: 'bottom-right',
    logoSize: 15,
    opacity: 100,
    margin: 2
  });

  const isElectron = () => {
    return window.electronAPI !== undefined;
  };

  const handleSelectImages = async () => {
    if (!isElectron()) {
      alert('This app must be run in Electron. Please use "npm run dev" or "npm start"');
      return;
    }
    const selected = await window.electronAPI.selectImages();
    if (selected) {
      setImages(selected);
      // Load thumbnails for previews
      const thumbEntries = await Promise.all(
        selected.map(async (img) => {
          try {
            const dataUrl = await window.electronAPI.getImageThumbnail(img);
            return [img, dataUrl];
          } catch {
            return [img, null];
          }
        })
      );
      setImageThumbs(Object.fromEntries(thumbEntries));
    }
  };

  const handleSelectLogo = async () => {
    if (!isElectron()) {
      alert('This app must be run in Electron. Please use "npm run dev" or "npm start"');
      return;
    }
    const selected = await window.electronAPI.selectLogo();
    if (selected) {
      setLogo(selected);
      try {
        const dataUrl = await window.electronAPI.getLogoThumbnail(selected);
        setLogoThumb(dataUrl);
      } catch {
        setLogoThumb(null);
      }
    }
  };

  const handleSelectBuiltInLogo = async (logoPath) => {
    setLogo(logoPath);
    try {
      const dataUrl = await window.electronAPI.getLogoThumbnail(logoPath);
      setLogoThumb(dataUrl);
    } catch {
      setLogoThumb(null);
    }
  };

  const handleSelectOutputFolder = async () => {
    if (!isElectron()) {
      alert('This app must be run in Electron. Please use "npm run dev" or "npm start"');
      return;
    }
    const selected = await window.electronAPI.selectOutputFolder();
    if (selected) {
      setOutputFolder(selected);
    }
  };

  useEffect(() => {
    if (isElectron() && window.electronAPI.onBatchProgress) {
      const cleanup = window.electronAPI.onBatchProgress((progress) => {
        setProgress(progress);
      });
      return cleanup;
    }
  }, []);

  // On load, default the output folder to the system Downloads directory (Electron only)
  useEffect(() => {
    if (!isElectron() || !window.electronAPI.getDefaultOutputFolder) {
      return;
    }
    (async () => {
      try {
        const folder = await window.electronAPI.getDefaultOutputFolder();
        if (folder) {
          setOutputFolder(folder);
        }
      } catch {
        // ignore, user can still pick manually
      }
    })();
  }, []);

  // Load built-in logos on mount
  useEffect(() => {
    if (!isElectron() || !window.electronAPI.getBuiltInLogos) {
      return;
    }
    (async () => {
      try {
        const logos = await window.electronAPI.getBuiltInLogos();
        setBuiltInLogos(logos);
      } catch {
        // ignore, just won't show built-in logos
      }
    })();
  }, []);

  const handleProcessBatch = async () => {
    if (!isElectron()) {
      alert('This app must be run in Electron. Please use "npm run dev" or "npm start"');
      return;
    }
    
    if (!images.length || !logo || !outputFolder) {
      alert('Please select images, logo, and output folder');
      return;
    }

    setProcessing(true);
    setProgress(0);

    try {
      const results = await window.electronAPI.processBatch({
        imagePaths: images,
        logoPath: logo,
        outputFolder: outputFolder,
        options: options
      });

      let successCount = 0;
      let failCount = 0;

      results.forEach((result) => {
        if (result.success) {
          successCount++;
        } else {
          failCount++;
          console.error(`Failed to process ${result.input}:`, result.error);
        }
      });

      setProgress(100);
      alert(`Processing complete!\nSuccess: ${successCount}\nFailed: ${failCount}`);
    } catch (error) {
      alert(`Error processing images: ${error.message}`);
    } finally {
      setProcessing(false);
      setProgress(0);
    }
  };

  return (
    <div className="App">
      <div className="container">
        <header className="header">
          <h1>🖼️ Batch Watermark Tool</h1>
          <p>Add your logo to multiple images at once</p>
          {!isElectron() && (
            <div style={{ 
              marginTop: '15px', 
              padding: '10px', 
              background: 'rgba(255, 255, 255, 0.2)', 
              borderRadius: '5px',
              fontSize: '0.9em'
            }}>
              ⚠️ Please run this app in Electron using "npm run dev" or "npm start"
            </div>
          )}
        </header>

        <div className="main-content">
          {/* Images Section */}
          <div className="section">
            <h2>Select Images</h2>
            <button 
              className="btn btn-primary" 
              onClick={handleSelectImages}
              disabled={processing}
            >
              Choose Images ({images.length} selected)
            </button>
            {images.length > 0 && (
              <>
                <div className="thumbnail-grid">
                  {images.map((img, idx) => (
                    <div key={idx} className="thumbnail-item">
                      <img
                        className="thumbnail-image"
                        src={imageThumbs[img] || ''}
                        alt={img.split(/[/\\]/).pop()}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Logo, Output, and Options in one row */}
          <div className="section-row">
            {/* Logo Section */}
            <div className="section section-inline">
              <h2>Select Logo</h2>
              
              {/* Built-in logos grid */}
              {builtInLogos.length > 0 && (
                <div className="logo-grid">
                  {builtInLogos.map((builtInLogo, idx) => (
                    <div
                      key={idx}
                      className={`logo-card ${logo === builtInLogo.path ? 'logo-card-active' : ''}`}
                      onClick={() => !processing && handleSelectBuiltInLogo(builtInLogo.path)}
                    >
                      <img
                        className="logo-card-image"
                        src={builtInLogo.thumbnail || ''}
                        alt={builtInLogo.name}
                      />
                    </div>
                  ))}
                </div>
              )}

              <button 
                className="btn btn-primary" 
                onClick={handleSelectLogo}
                disabled={processing}
                style={{ marginTop: builtInLogos.length > 0 ? '15px' : '0' }}
              >
                Choose Custom Logo
              </button>
              {logo && (
                <>
                  <div className="logo-preview">
                    <img
                      className="logo-thumbnail-image"
                      src={logoThumb || ''}
                      alt={logo.split(/[/\\]/).pop()}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Output Folder Section */}
            <div className="section section-inline">
              <h2>Output Folder</h2>
              <button 
                className="btn btn-primary" 
                onClick={handleSelectOutputFolder}
                disabled={processing}
              >
                Choose Output Folder
              </button>
              {outputFolder && (
                <div className="file-list">
                  <div className="file-item">✓ {outputFolder}</div>
                </div>
              )}
            </div>

            {/* Options Section */}
            <div className="section options-section section-inline">
              <h2>Watermark Options</h2>
              
              <div className="option-group">
                <label>Position:</label>
                <div className="position-cards">
                  {[
                    { value: 'top-left', label: 'Top Left' },
                    { value: 'top-right', label: 'Top Right' },
                    { value: 'center', label: 'Center' },
                    { value: 'bottom-left', label: 'Bottom Left' },
                    { value: 'bottom-right', label: 'Bottom Right' },
                  ].map((pos) => (
                    <button
                      key={pos.value}
                      type="button"
                      data-position={pos.value}
                      className={
                        'position-card' +
                        (options.position === pos.value ? ' position-card-active' : '')
                      }
                      onClick={() =>
                        !processing && setOptions({ ...options, position: pos.value })
                      }
                      disabled={processing}
                    >
                      {pos.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="option-group">
                <label>Logo Size: {options.logoSize}%</label>
                <input 
                  type="range" 
                  min="5" 
                  max="50" 
                  value={options.logoSize}
                  onChange={(e) => setOptions({...options, logoSize: parseInt(e.target.value)})}
                  disabled={processing}
                />
              </div>

              <div className="option-group">
                <label>Opacity: {options.opacity}%</label>
                <input 
                  type="range" 
                  min="10" 
                  max="100" 
                  value={options.opacity}
                  onChange={(e) => setOptions({...options, opacity: parseInt(e.target.value)})}
                  disabled={processing}
                />
              </div>

              <div className="option-group">
                <label>Margin: {options.margin}%</label>
                <input 
                  type="range" 
                  min="0" 
                  max="10" 
                  value={options.margin}
                  onChange={(e) => setOptions({...options, margin: parseInt(e.target.value)})}
                  disabled={processing}
                />
              </div>
            </div>
          </div>

          {/* Process Button */}
          <div className="section">
            <button 
              className="btn btn-process" 
              onClick={handleProcessBatch}
              disabled={processing || !images.length || !logo || !outputFolder}
            >
              {processing ? 'Processing...' : 'Process Images'}
            </button>
            
            {processing && (
              <div className="progress-bar-container">
                <div className="progress-bar" style={{ width: `${progress}%` }}></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
