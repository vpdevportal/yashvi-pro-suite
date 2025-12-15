import React, { useState } from 'react';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import WatermarkStudio from './pages/WatermarkStudio';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home'); // 'home' | 'watermark'

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleNavigateToWatermark = () => {
    setCurrentPage('watermark');
  };

  return (
    <div className="App">
      <Navigation 
        currentPage={currentPage} 
        onPageChange={handlePageChange} 
      />

      <div className="container">
        {currentPage === 'home' ? (
          <div className="main-content main-content-home">
            <Home onNavigateToWatermark={handleNavigateToWatermark} />
          </div>
        ) : (
          <WatermarkStudio />
        )}
      </div>
    </div>
  );
}

export default App;
