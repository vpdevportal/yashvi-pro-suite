import { useEffect, useState } from 'react';
import { isElectron } from '../utils/electron';

/**
 * Custom hook for Electron API interactions
 */
export const useElectron = () => {
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    setIsAvailable(isElectron());
  }, []);

  return { isElectron: isAvailable };
};

