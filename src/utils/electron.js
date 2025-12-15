/**
 * Electron utility functions
 */

export const isElectron = () => {
  return window.electronAPI !== undefined;
};

export const requireElectron = () => {
  if (!isElectron()) {
    alert('This app must be run in Electron. Please use "npm run dev" or "npm start"');
    return false;
  }
  return true;
};

