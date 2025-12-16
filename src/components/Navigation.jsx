import React from 'react';
import './Navigation.css';

const Navigation = ({ currentPage, onPageChange }) => {
  return (
    <nav className="top-nav">
      <div className="nav-brand" onClick={() => onPageChange('home')}>
        <img 
          src="./assets/yashvi-logo.png" 
          alt="Yashvi Logo" 
          className="nav-logo-img"
        />
        <span>Yashvi Pro Suite</span>
      </div>
      <div className="nav-links">
        <button
          className={`nav-link ${currentPage === 'home' ? 'nav-link-active' : ''}`}
          onClick={() => onPageChange('home')}
        >
          Home
        </button>
        <button
          className={`nav-link ${currentPage === 'watermark' ? 'nav-link-active' : ''}`}
          onClick={() => onPageChange('watermark')}
        >
          Watermark Studio
        </button>
      </div>
    </nav>
  );
};

export default Navigation;

