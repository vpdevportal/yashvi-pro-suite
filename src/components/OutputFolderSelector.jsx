import React from 'react';
import './OutputFolderSelector.css';

const OutputFolderSelector = ({ outputFolder, onSelectOutputFolder, processing }) => {
  return (
    <div className="options-section">
      <h2>Output Folder</h2>
      <button 
        className="btn btn-primary" 
        onClick={onSelectOutputFolder}
        disabled={processing}
        style={{ width: '100%' }}
      >
        Choose Output Folder
      </button>
      {outputFolder && (
        <div className="file-list">
          <div className="file-item">✓ {outputFolder}</div>
        </div>
      )}
    </div>
  );
};

export default OutputFolderSelector;

