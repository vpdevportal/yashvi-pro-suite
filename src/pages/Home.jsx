import React from 'react';
import { useElectron } from '../hooks/useElectron';
import './Home.css';

const Home = ({ onNavigateToWatermark }) => {
  const { isElectron } = useElectron();

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-text">
          <h1>Yashvi Pro Suite</h1>
          <p>
            A beautiful desktop toolkit for creators. Start with effortless batch watermarking,
            powered by your brand.
          </p>
          <div className="hero-actions">
            <button
              className="btn btn-primary"
              onClick={onNavigateToWatermark}
            >
              Open Watermark Studio
            </button>
          </div>
          {!isElectron && (
            <p className="hero-note">
              ⚠️ Please run this app in Electron using <code>npm run dev</code> or <code>npm start</code>.
            </p>
          )}
        </div>
      </section>
      <section className="home-section">
        <h2>What you can do</h2>
        <div className="home-grid">
          <div className="home-card">
            <h3>Batch Watermarking</h3>
            <p>Apply your logo to dozens of photos in one go, with full control over size, position, and opacity.</p>
          </div>
          <div className="home-card">
            <h3>Brand‑ready Output</h3>
            <p>Keep your original formats and get clean, consistent watermarked images for social, web, and print.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

