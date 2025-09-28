// Utility for debugging localStorage and Zustand persist issues

export const debugStorage = {
  // Check if localStorage is available
  isAvailable: () => {
    try {
      const testKey = '__test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      console.error('localStorage not available:', e);
      return false;
    }
  },

  // Get all portfolio data from localStorage
  getPortfolioData: () => {
    try {
      const data = localStorage.getItem('portfolio-storage');
      if (data) {
        return JSON.parse(data);
      }
      return null;
    } catch (e) {
      console.error('Error reading portfolio data from localStorage:', e);
      return null;
    }
  },

  // Clear portfolio data from localStorage
  clearPortfolioData: () => {
    try {
      localStorage.removeItem('portfolio-storage');
      console.log('Portfolio data cleared from localStorage');
    } catch (e) {
      console.error('Error clearing portfolio data:', e);
    }
  },

  // Manually trigger rehydration
  rehydrateStore: () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'));
      console.log('Storage event dispatched for rehydration');
    }
  },

  // Log current storage state
  logStorageState: () => {
    const data = debugStorage.getPortfolioData();
    console.log('Current localStorage state:', {
      available: debugStorage.isAvailable(),
      hasData: !!data,
      data: data,
      keys: Object.keys(localStorage).filter(key => key.includes('portfolio')),
    });
  },
};

// Add to window for debugging in browser console
if (typeof window !== 'undefined') {
  (window as any).debugStorage = debugStorage;
}