import React, { useState, useEffect } from 'react';
import './ImageSelector.css';

const ImageSelector = ({ 
  images, 
  imageThumbs,
  watermarkedPreviews,
  loadingThumbnails,
  logo,
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

  // Save to localStorage when size changes
  useEffect(() => {
    localStorage.setItem('thumbnailSize', thumbnailSize.toString());
  }, [thumbnailSize]);

  const handleZoomIn = () => {
    setThumbnailSize(prev => Math.min(prev + 20, 400)); // Max 400px
  };

  const handleZoomOut = () => {
    setThumbnailSize(prev => Math.max(prev - 20, 40)); // Min 40px
  };

  return (
    <div className="section">
      <h2>Select Images</h2>
      <div style={{ display: 'flex', gap: '12px', marginBottom: images.length > 0 ? '15px' : '0' }}>
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
        <div className="progress-bar-container" style={{ marginTop: '15px' }}>
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        </div>
      )}
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
  );
};

export default ImageSelector;

