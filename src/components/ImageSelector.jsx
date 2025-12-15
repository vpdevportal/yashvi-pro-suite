import React from 'react';
import './ImageSelector.css';

const ImageSelector = ({ 
  images, 
  imageThumbs, 
  loadingThumbnails,
  onSelectImages, 
  onClearAllImages, 
  processing 
}) => {
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
          <button 
            className="btn btn-secondary" 
            onClick={onClearAllImages}
            disabled={processing}
          >
            Clear All
          </button>
        )}
      </div>
      {images.length > 0 && (
        <div className="thumbnail-grid">
          {images.map((img, idx) => {
            const thumbnail = imageThumbs[img];
            const isLoading = !thumbnail && loadingThumbnails;
            
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
                    src={thumbnail || ''}
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

