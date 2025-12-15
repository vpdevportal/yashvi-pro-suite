import React from 'react';
import { WATERMARK_POSITIONS, WATERMARK_RANGES } from '../constants/watermarkOptions';
import './WatermarkOptions.css';

const WatermarkOptions = ({ options, setOptions, processing }) => {
  return (
    <div className="options-section">
      <h2>Watermark Options</h2>
      
      <div className="option-group">
        <label>Position:</label>
        <div className="position-cards">
          {WATERMARK_POSITIONS.map((pos) => (
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
          min={WATERMARK_RANGES.logoSize.min}
          max={WATERMARK_RANGES.logoSize.max}
          value={options.logoSize}
          onChange={(e) => setOptions({...options, logoSize: parseInt(e.target.value)})}
          disabled={processing}
        />
      </div>

      <div className="option-group">
        <label>Opacity: {options.opacity}%</label>
        <input 
          type="range" 
          min={WATERMARK_RANGES.opacity.min}
          max={WATERMARK_RANGES.opacity.max}
          value={options.opacity}
          onChange={(e) => setOptions({...options, opacity: parseInt(e.target.value)})}
          disabled={processing}
        />
      </div>

      <div className="option-group">
        <label>Margin: {options.margin}%</label>
        <input 
          type="range" 
          min={WATERMARK_RANGES.margin.min}
          max={WATERMARK_RANGES.margin.max}
          value={options.margin}
          onChange={(e) => setOptions({...options, margin: parseInt(e.target.value)})}
          disabled={processing}
        />
      </div>
    </div>
  );
};

export default WatermarkOptions;

