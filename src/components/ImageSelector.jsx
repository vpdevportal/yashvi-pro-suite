import React, { useState, useEffect } from 'react';
import { generateWatermarkedPreview } from '../utils/watermarkPreview';
import './ImageSelector.css';

const ImageSelector = ({ 
  images, 
  imageThumbs,
  watermarkedPreviews,
  loadingThumbnails,
  logo,
  logoThumb,
  options,
  outputFolder,
  onSelectImages, 
  onClearAllImages,
  onRemoveImage,
  onProcess,
  processing,
  progress,
  processDisabled
}) => {
  const [thumbnailSize, setThumbnailSize] = useState(() => {
    // Load from localStorage or default to 80px
    const saved = localStorage.getItem('thumbnailSize');
    return saved ? parseInt(saved, 10) : 80;
  });

  const [modalImage, setModalImage] = useState(null);
  const [modalImagePath, setModalImagePath] = useState(null);
  const [loadingFullImage, setLoadingFullImage] = useState(false);
  const [selectedImages, setSelectedImages] = useState(new Set());
  const [lastSelectedIndex, setLastSelectedIndex] = useState(null);

  // Save to localStorage when size changes
  useEffect(() => {
    localStorage.setItem('thumbnailSize', thumbnailSize.toString());
  }, [thumbnailSize]);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && modalImage) {
        setModalImage(null);
        setModalImagePath(null);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [modalImage]);

  const handleZoomIn = () => {
    setThumbnailSize(prev => Math.min(prev + 20, 400)); // Max 400px
  };

  const handleZoomOut = () => {
    setThumbnailSize(prev => Math.max(prev - 20, 40)); // Min 40px
  };

  const handleImageDoubleClick = async (imgPath, displayImage) => {
    if (!processing) {
      setModalImagePath(imgPath);
      setLoadingFullImage(true);
      
      try {
        // Load full quality image
        if (window.electronAPI && window.electronAPI.getFullImage) {
          const fullImage = await window.electronAPI.getFullImage(imgPath);
          if (fullImage) {
            // If logo is selected, generate watermarked preview with full quality image
            if (logo && logoThumb && options) {
              try {
                const watermarkedFull = await generateWatermarkedPreview(fullImage, logoThumb, options);
                setModalImage(watermarkedFull);
              } catch (error) {
                console.error('Failed to generate watermarked preview:', error);
                setModalImage(fullImage);
              }
            } else {
              setModalImage(fullImage);
            }
          } else {
            // Fallback to thumbnail if full image fails
            setModalImage(displayImage);
          }
        } else {
          // Fallback if Electron API not available
          setModalImage(displayImage);
        }
      } catch (error) {
        console.error('Error loading full image:', error);
        setModalImage(displayImage);
      } finally {
        setLoadingFullImage(false);
      }
    }
  };

  const handleCloseModal = () => {
    setModalImage(null);
    setModalImagePath(null);
  };

  // Toggle image selection with shift+click support
  const handleToggleImageSelection = (imgPath, currentIndex, event) => {
    if (processing) return;
    
    // Check if Shift key is pressed for range selection
    if (event && event.shiftKey && lastSelectedIndex !== null) {
      const startIndex = Math.min(lastSelectedIndex, currentIndex);
      const endIndex = Math.max(lastSelectedIndex, currentIndex);
      
      setSelectedImages(prev => {
        const newSet = new Set(prev);
        // Select all images in the range
        for (let i = startIndex; i <= endIndex; i++) {
          newSet.add(images[i]);
        }
        return newSet;
      });
      setLastSelectedIndex(currentIndex);
    } else {
      // Normal click - toggle single selection
      setSelectedImages(prev => {
        const newSet = new Set(prev);
        if (newSet.has(imgPath)) {
          newSet.delete(imgPath);
          setLastSelectedIndex(null);
        } else {
          newSet.add(imgPath);
          setLastSelectedIndex(currentIndex);
        }
        return newSet;
      });
    }
  };

  // Select all images
  const handleSelectAll = () => {
    if (processing) return;
    setSelectedImages(new Set(images));
  };

  // Deselect all images
  const handleDeselectAll = () => {
    if (processing) return;
    setSelectedImages(new Set());
    setLastSelectedIndex(null);
  };

  // Delete selected images
  const handleDeleteSelected = () => {
    if (processing || selectedImages.size === 0 || !onRemoveImage) return;
    selectedImages.forEach(imgPath => {
      onRemoveImage(imgPath);
    });
    setSelectedImages(new Set());
    setLastSelectedIndex(null);
  };

  // Process only selected images
  const handleProcessSelected = () => {
    if (selectedImages.size === 0) {
      alert('Please select at least one image to process');
      return;
    }
    if (onProcess) {
      onProcess(Array.from(selectedImages));
    }
  };

  // Update selected images when images array changes (remove deleted images from selection)
  useEffect(() => {
    setSelectedImages(prev => {
      const newSet = new Set();
      prev.forEach(img => {
        if (images.includes(img)) {
          newSet.add(img);
        }
      });
      return newSet;
    });
    // Reset last selected index if the image at that index was removed
    if (lastSelectedIndex !== null && lastSelectedIndex >= images.length) {
      setLastSelectedIndex(null);
    }
  }, [images, lastSelectedIndex]);

  return (
    <div className="image-selector-container">
      {/* Fixed Toolbar */}
      <div className="image-toolbar">
        <button 
          className="btn btn-primary" 
          onClick={onSelectImages}
          disabled={processing}
          style={{ flex: 1 }}
        >
          Choose Images ({images.length} selected)
        </button>
        {images.length > 0 && (
          <>
            <button 
              className="btn btn-zoom"
              onClick={handleZoomOut}
              disabled={processing || thumbnailSize <= 40}
              title="Zoom Out"
            >
              −
            </button>
            <button 
              className="btn btn-zoom"
              onClick={handleZoomIn}
              disabled={processing || thumbnailSize >= 400}
              title="Zoom In"
            >
              +
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={onClearAllImages}
              disabled={processing}
            >
              Clear All
            </button>
            {selectedImages.size > 0 && (
              <>
                <button 
                  className="btn btn-secondary" 
                  onClick={handleDeselectAll}
                  disabled={processing}
                  title="Deselect all images"
                >
                  Deselect All
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={handleDeleteSelected}
                  disabled={processing}
                  style={{ background: 'rgba(220, 38, 38, 0.8)', borderColor: 'rgba(220, 38, 38, 0.6)' }}
                  title={`Delete ${selectedImages.size} selected image(s)`}
                >
                  Delete ({selectedImages.size})
                </button>
              </>
            )}
            <button 
              className="btn btn-process" 
              onClick={handleProcessSelected}
              disabled={processing || selectedImages.size === 0 || !logo || !outputFolder}
              style={{ minWidth: '140px' }}
            >
              {processing ? 'Processing...' : `Process (${selectedImages.size})`}
            </button>
          </>
        )}
      </div>
      {processing && (
        <div className="progress-bar-container progress-bar-fixed">
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        </div>
      )}
      {/* Content Area */}
      <div className="image-content">
        {images.length > 0 && (
        <div 
          className="thumbnail-grid"
          style={{ 
            gridTemplateColumns: `repeat(auto-fill, minmax(${thumbnailSize}px, 1fr))` 
          }}
        >
          {images.map((img, idx) => {
            const thumbnail = imageThumbs[img];
            const watermarkedPreview = watermarkedPreviews?.[img];
            const isLoading = !thumbnail && loadingThumbnails;
            // Use watermarked preview if logo is selected, otherwise use original thumbnail
            const displayImage = (logo && watermarkedPreview) ? watermarkedPreview : thumbnail;
            
            const isSelected = selectedImages.has(img);
            
            return (
              <div 
                key={idx} 
                className={`thumbnail-item ${isSelected ? 'thumbnail-selected' : ''}`}
                onClick={(e) => handleToggleImageSelection(img, idx, e)}
              >
                {isLoading ? (
                  <div className="thumbnail-loading">
                    <div className="thumbnail-spinner"></div>
                    <span>Loading...</span>
                  </div>
                ) : (
                  <>
                    <img
                      className="thumbnail-image"
                      src={displayImage || ''}
                      alt={img.split(/[/\\]/).pop()}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        handleImageDoubleClick(img, displayImage);
                      }}
                      style={{ cursor: 'pointer' }}
                      title="Click to select, double-click to preview"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<div class="thumbnail-error">Failed to load</div>';
                      }}
                    />
                    <button
                      className="thumbnail-delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!processing && onRemoveImage) {
                          onRemoveImage(img);
                        }
                      }}
                      disabled={processing}
                      title="Delete image"
                      aria-label="Delete image"
                    >
                      ×
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {modalImage && (
        <div className="image-modal-overlay" onClick={handleCloseModal}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="image-modal-close" 
              onClick={handleCloseModal}
              aria-label="Close preview"
            >
              ×
            </button>
            <div className="image-modal-header">
              <h3>{modalImagePath ? modalImagePath.split(/[/\\]/).pop() : 'Image Preview'}</h3>
            </div>
            <div className="image-modal-body">
              {loadingFullImage ? (
                <div className="image-modal-loading">
                  <div className="thumbnail-spinner"></div>
                  <span>Loading full quality image...</span>
                </div>
              ) : (
                <img 
                  src={modalImage} 
                  alt={modalImagePath ? modalImagePath.split(/[/\\]/).pop() : 'Preview'}
                  className="image-modal-image"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageSelector;

