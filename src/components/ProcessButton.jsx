import React from 'react';
import './ProcessButton.css';

const ProcessButton = ({ 
  processing, 
  progress, 
  onProcess, 
  disabled 
}) => {
  return (
    <div className="section">
      <button 
        className="btn btn-process" 
        onClick={onProcess}
        disabled={disabled}
      >
        {processing ? 'Processing...' : 'Process Images'}
      </button>
      
      {processing && (
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        </div>
      )}
    </div>
  );
};

export default ProcessButton;

