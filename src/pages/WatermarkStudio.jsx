import React from 'react';
import { useWatermark } from '../hooks/useWatermark';
import WatermarkOptions from '../components/WatermarkOptions';
import LogoSelector from '../components/LogoSelector';
import OutputFolderSelector from '../components/OutputFolderSelector';
import ImageSelector from '../components/ImageSelector';
import ProcessButton from '../components/ProcessButton';
import './WatermarkStudio.css';

const WatermarkStudio = () => {
  const {
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
    setOptions,
    handleSelectImages,
    handleClearAllImages,
    handleSelectLogo,
    handleSelectBuiltInLogo,
    handleSelectOutputFolder,
    handleProcessBatch,
  } = useWatermark();

  return (
    <div className="watermark-layout">
      {/* Left Panel - Options Sidebar */}
      <div className="options-panel">
        <WatermarkOptions 
          options={options}
          setOptions={setOptions}
          processing={processing}
        />
        
        <LogoSelector
          builtInLogos={builtInLogos}
          logo={logo}
          logoThumb={logoThumb}
          onSelectLogo={handleSelectLogo}
          onSelectBuiltInLogo={handleSelectBuiltInLogo}
          processing={processing}
        />

        <OutputFolderSelector
          outputFolder={outputFolder}
          onSelectOutputFolder={handleSelectOutputFolder}
          processing={processing}
        />
      </div>

      {/* Right Panel - Main Content */}
      <div className="main-panel">
        <ImageSelector
          images={images}
          imageThumbs={imageThumbs}
          loadingThumbnails={loadingThumbnails}
          onSelectImages={handleSelectImages}
          onClearAllImages={handleClearAllImages}
          processing={processing}
        />

        <ProcessButton
          processing={processing}
          progress={progress}
          onProcess={handleProcessBatch}
          disabled={processing || !images.length || !logo || !outputFolder}
        />
      </div>
    </div>
  );
};

export default WatermarkStudio;

