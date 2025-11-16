"use client";

import { useState, useEffect, useCallback } from 'react';

const DARK_MODE_STORAGE_KEY = 'dark-mode-enabled';

// Apply dark mode filter to html element
const applyDarkMode = (enabled: boolean) => {
  if (typeof document !== 'undefined') {
    const htmlElement = document.documentElement;
    if (enabled) {
      htmlElement.classList.add('forced-dark');
    } else {
      htmlElement.classList.remove('forced-dark');
    }
  }
};

export function useDarkMode() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Load dark mode preference from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPreference = localStorage.getItem(DARK_MODE_STORAGE_KEY);
      if (savedPreference !== null) {
        const isDark = savedPreference === 'true';
        setIsDarkMode(isDark);
        applyDarkMode(isDark);
      } else {
        // Default to light mode if no preference is saved
        setIsDarkMode(false);
        applyDarkMode(false);
      }
    }
  }, []);

  const toggleDarkMode = useCallback(() => {
    const newValue = !isDarkMode;
    setIsDarkMode(newValue);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(DARK_MODE_STORAGE_KEY, String(newValue));
    }
    
    // Apply immediately
    applyDarkMode(newValue);
  }, [isDarkMode]);

  return { isDarkMode, toggleDarkMode };
}

