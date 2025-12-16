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
  onSelectImages, 
  onClearAllImages,
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
            <button 
              className="btn btn-process" 
              onClick={onProcess}
              disabled={processDisabled}
              style={{ minWidth: '140px' }}
            >
              {processing ? 'Processing...' : 'Process Images'}
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
            
            return (
              <div key={idx} className="thumbnail-item">
                {isLoading ? (
                  <div className="thumbnail-loading">
                    <div className="thumbnail-spinner"></div>
                    <span>Loading...</span>
                  </div>
                ) : (
                  <img
                    className="thumbnail-image"
                    src={displayImage || ''}
                    alt={img.split(/[/\\]/).pop()}
                    onDoubleClick={() => handleImageDoubleClick(img, displayImage)}
                    style={{ cursor: 'pointer' }}
                    title="Double-click to preview"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<div class="thumbnail-error">Failed to load</div>';
                    }}
                  />
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

