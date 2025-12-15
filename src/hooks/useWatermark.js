import { useState, useEffect } from 'react';
import { DEFAULT_WATERMARK_OPTIONS } from '../constants/watermarkOptions';
import { isElectron, requireElectron } from '../utils/electron';

/**
 * Custom hook for watermark state and operations
 */
export const useWatermark = () => {
  const [images, setImages] = useState([]);
  const [logo, setLogo] = useState(null);
  const [imageThumbs, setImageThumbs] = useState({});
  const [loadingThumbnails, setLoadingThumbnails] = useState(false);
  const [logoThumb, setLogoThumb] = useState(null);
  const [builtInLogos, setBuiltInLogos] = useState([]);
  const [outputFolder, setOutputFolder] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [options, setOptions] = useState(DEFAULT_WATERMARK_OPTIONS);

  // Load thumbnails for selected images (progressive loading)
  const loadImageThumbnails = async (imagePaths) => {
    setLoadingThumbnails(true);
    setImageThumbs({}); // Clear previous thumbnails
    
    // Load thumbnails progressively for better UX
    for (const img of imagePaths) {
      try {
        const dataUrl = await window.electronAPI.getImageThumbnail(img);
        setImageThumbs(prev => ({ ...prev, [img]: dataUrl }));
      } catch {
        setImageThumbs(prev => ({ ...prev, [img]: null }));
      }
    }
    
    setLoadingThumbnails(false);
  };

  // Select images
  const handleSelectImages = async () => {
    if (!requireElectron()) return;
    
    const selected = await window.electronAPI.selectImages();
    if (selected) {
      setImages(selected);
      // Start loading thumbnails immediately (non-blocking)
      loadImageThumbnails(selected);
    }
  };

  // Clear all images
  const handleClearAllImages = () => {
    setImages([]);
    setImageThumbs({});
  };

  // Select logo
  const handleSelectLogo = async () => {
    if (!requireElectron()) return;
    
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

  // Select built-in logo
  const handleSelectBuiltInLogo = async (logoPath) => {
    setLogo(logoPath);
    try {
      const dataUrl = await window.electronAPI.getLogoThumbnail(logoPath);
      setLogoThumb(dataUrl);
    } catch {
      setLogoThumb(null);
    }
  };

  // Select output folder
  const handleSelectOutputFolder = async () => {
    if (!requireElectron()) return;
    
    const selected = await window.electronAPI.selectOutputFolder();
    if (selected) {
      setOutputFolder(selected);
    }
  };

  // Process batch
  const handleProcessBatch = async () => {
    if (!requireElectron()) return;
    
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

  // Progress listener
  useEffect(() => {
    if (isElectron() && window.electronAPI.onBatchProgress) {
      const cleanup = window.electronAPI.onBatchProgress((progress) => {
        setProgress(progress);
      });
      return cleanup;
    }
  }, []);

  // Load default output folder
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

  // Load built-in logos
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

  return {
    // State
    images,
    logo,
    imageThumbs,
    loadingThumbnails,
    logoThumb,
    builtInLogos,
    outputFolder,
    processing,
    progress,
    options,
    // Actions
    setOptions,
    handleSelectImages,
    handleClearAllImages,
    handleSelectLogo,
    handleSelectBuiltInLogo,
    handleSelectOutputFolder,
    handleProcessBatch,
  };
};

