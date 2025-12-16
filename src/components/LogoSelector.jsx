import React from 'react';
import './LogoSelector.css';

const LogoSelector = ({ 
  builtInLogos, 
  logo, 
  logoThumb, 
  onSelectLogo, 
  onSelectBuiltInLogo, 
  processing 
}) => {
  return (
    <div className="options-section">
      <h2>Select Logo</h2>
      
      {/* Built-in logos grid */}
      {builtInLogos.length > 0 && (
        <div className="logo-grid">
          {builtInLogos.map((builtInLogo, idx) => (
            <div
              key={idx}
              className={`logo-card ${logo === builtInLogo.path ? 'logo-card-active' : ''}`}
              onClick={() => !processing && onSelectBuiltInLogo(builtInLogo.path)}
            >
              {builtInLogo.thumbnail ? (
                <img
                  className="logo-card-image"
                  src={builtInLogo.thumbnail}
                  alt={builtInLogo.name}
                  onError={(e) => {
                    console.error('Failed to load logo thumbnail:', builtInLogo.name, builtInLogo.path, builtInLogo.thumbnail?.substring(0, 50));
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="logo-card-placeholder">
                  <span>{builtInLogo.name || 'Logo'}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <button 
        className="btn btn-primary" 
        onClick={onSelectLogo}
        disabled={processing}
        style={{ marginTop: builtInLogos.length > 0 ? '15px' : '0', width: '100%' }}
      >
        Custom Logo
      </button>
      {logo && (
        <div className="logo-preview">
          <img
            className="logo-thumbnail-image"
            src={logoThumb || ''}
            alt={logo.split(/[/\\]/).pop()}
          />
        </div>
      )}
    </div>
  );
};

export default LogoSelector;

