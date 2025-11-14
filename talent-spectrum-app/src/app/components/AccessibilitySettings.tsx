"use client";

import React, { useState, useEffect } from 'react';
import { Settings, X, Sun, Moon, Type, Palette, Check } from 'lucide-react';
import { Button } from './button';

interface AccessibilityPreferences {
  theme: 'light' | 'dark';
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  fontFamily: 'default' | 'arial' | 'verdana' | 'georgia' | 'comic-sans' | 'open-dyslexic';
  themeColor: 'purple' | 'blue' | 'green' | 'orange' | 'pink' | 'default';
}

const STORAGE_KEY = 'accessibility-preferences';

const AccessibilitySettings: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [preferences, setPreferences] = useState<AccessibilityPreferences>({
    theme: 'light',
    fontSize: 'medium',
    fontFamily: 'default',
    themeColor: 'purple',
  });

  // Load preferences from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPreferences(parsed);
        applyPreferences(parsed);
      } catch (error) {
        console.error('Failed to load accessibility preferences:', error);
      }
    } else {
      // Apply default preferences
      applyPreferences(preferences);
    }
  }, []);

  // Apply preferences to the document
  const applyPreferences = (prefs: AccessibilityPreferences) => {
    const root = document.documentElement;
    const body = document.body;

    // Apply theme (dark/light mode)
    if (prefs.theme === 'dark') {
      root.classList.add('dark-mode');
      body.classList.add('dark-mode');
      root.style.setProperty('--bg-primary', '#1a1a1a');
      root.style.setProperty('--bg-secondary', '#2d2d2d');
      root.style.setProperty('--text-primary', '#ffffff');
      root.style.setProperty('--text-secondary', '#e0e0e0');
      // Apply to body directly for immediate effect
      body.style.backgroundColor = '#1a1a1a';
      body.style.color = '#ffffff';
    } else {
      root.classList.remove('dark-mode');
      body.classList.remove('dark-mode');
      root.style.setProperty('--bg-primary', '#ffffff');
      root.style.setProperty('--bg-secondary', '#f5f5f5');
      root.style.setProperty('--text-primary', '#000000');
      root.style.setProperty('--text-secondary', '#333333');
      // Apply to body directly for immediate effect
      body.style.backgroundColor = '#ffffff';
      body.style.color = '#000000';
    }

    // Apply font size to both root and body
    const fontSizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px',
      'extra-large': '20px',
    };
    root.style.setProperty('--base-font-size', fontSizeMap[prefs.fontSize]);
    root.style.fontSize = fontSizeMap[prefs.fontSize];
    body.style.fontSize = fontSizeMap[prefs.fontSize];

    // Apply font family to both root and body
    const fontFamilyMap = {
      default: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      arial: 'Arial, sans-serif',
      verdana: 'Verdana, sans-serif',
      georgia: 'Georgia, serif',
      'comic-sans': '"Comic Sans MS", cursive',
      'open-dyslexic': '"OpenDyslexic", sans-serif',
    };
    root.style.fontFamily = fontFamilyMap[prefs.fontFamily];
    body.style.fontFamily = fontFamilyMap[prefs.fontFamily];

    // Apply theme color
    const themeColorMap = {
      purple: '#635BFF',
      blue: '#2196F3',
      green: '#4CAF50',
      orange: '#FF9800',
      pink: '#E91E63',
      default: '#635BFF',
    };
    root.style.setProperty('--theme-color', themeColorMap[prefs.themeColor]);
    root.style.setProperty('--theme-color-hover', adjustColorBrightness(themeColorMap[prefs.themeColor], -20));

    // Force update all elements with custom class
    root.setAttribute('data-theme', prefs.theme);
    root.setAttribute('data-font-size', prefs.fontSize);
    root.setAttribute('data-font-family', prefs.fontFamily);
    root.setAttribute('data-theme-color', prefs.themeColor);
  };

  // Helper function to adjust color brightness
  const adjustColorBrightness = (color: string, amount: number): string => {
    const hex = color.replace('#', '');
    const num = parseInt(hex, 16);
    const r = Math.max(0, Math.min(255, ((num >> 16) & 0xff) + amount));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amount));
    const b = Math.max(0, Math.min(255, (num & 0xff) + amount));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  };

  // Update a preference
  const updatePreference = <K extends keyof AccessibilityPreferences>(
    key: K,
    value: AccessibilityPreferences[K]
  ) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    applyPreferences(newPreferences);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPreferences));
  };

  // Reset to defaults
  const resetToDefaults = () => {
    const defaults: AccessibilityPreferences = {
      theme: 'light',
      fontSize: 'medium',
      fontFamily: 'default',
      themeColor: 'purple',
    };
    setPreferences(defaults);
    applyPreferences(defaults);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="hover:cursor-pointer fixed bottom-6 right-6 z-[99998] bg-[var(--theme-color,#635BFF)] hover:bg-[var(--theme-color-hover,#524BCC)] text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110"
        title="Accessibility Settings"
        aria-label="Open accessibility settings"
      >
        <Settings className="w-6 h-6" />
      </button>

      {/* Settings Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-[99998]"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[99999] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Settings className="w-7 h-7 text-[var(--theme-color,#635BFF)]" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Accessibility Settings
                  </h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="hover:cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors "
                  aria-label="Close settings"
                >
                  <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                </button>
              </div>

              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Customize your experience to suit your needs. All changes are saved automatically.
              </p>

              {/* Theme Mode */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Display Mode
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => updatePreference('theme', 'light')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      preferences.theme === 'light'
                        ? 'border-[var(--theme-color,#635BFF)] bg-[var(--theme-color,#635BFF)]/10'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 hover:cursor-pointer'
                    }`}
                  >
                    <Sun className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                    <div className="text-center font-medium text-gray-900 dark:text-white">Light Mode</div>
                    {preferences.theme === 'light' && (
                      <Check className="w-5 h-5 mx-auto mt-2 text-[var(--theme-color,#635BFF)]" />
                    )}
                  </button>
                  <button
                    onClick={() => updatePreference('theme', 'dark')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      preferences.theme === 'dark'
                        ? 'border-[var(--theme-color,#635BFF)] bg-[var(--theme-color,#635BFF)]/10'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 hover:cursor-pointer'
                    }`}
                  >
                    <Moon className="w-8 h-8 mx-auto mb-2 text-indigo-500" />
                    <div className="text-center font-medium text-gray-900 dark:text-white">Dark Mode</div>
                    {preferences.theme === 'dark' && (
                      <Check className="w-5 h-5 mx-auto mt-2 text-[var(--theme-color,#635BFF)]" />
                    )}
                  </button>
                </div>
              </div>

              {/* Font Size */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <Type className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Font Size
                  </h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(['small', 'medium', 'large', 'extra-large'] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => updatePreference('fontSize', size)}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        preferences.fontSize === size
                          ? 'border-[var(--theme-color,#635BFF)] bg-[var(--theme-color,#635BFF)]/10'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400  hover:cursor-pointer'
                      }`}
                    >
                      <div className="font-medium text-gray-900 dark:text-white capitalize text-center">
                        {size === 'extra-large' ? 'XL' : size.charAt(0).toUpperCase()}
                      </div>
                      {preferences.fontSize === size && (
                        <Check className="w-4 h-4 mx-auto mt-1 text-[var(--theme-color,#635BFF)]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Family */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <Type className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Font Style
                  </h3>
                </div>
                <div className="space-y-2">
                  {([
                    { value: 'default', label: 'Default (System)' },
                    { value: 'arial', label: 'Arial' },
                    { value: 'verdana', label: 'Verdana' },
                    { value: 'georgia', label: 'Georgia' },
                    { value: 'comic-sans', label: 'Comic Sans (Dyslexia-friendly)' },
                    { value: 'open-dyslexic', label: 'OpenDyslexic (Recommended for Dyslexia)' },
                  ] as const).map((font) => (
                    <button
                      key={font.value}
                      onClick={() => updatePreference('fontFamily', font.value)}
                      className={`w-full p-3 rounded-xl border-2 transition-all text-left flex items-center justify-between ${
                        preferences.fontFamily === font.value
                          ? 'border-[var(--theme-color,#635BFF)] bg-[var(--theme-color,#635BFF)]/10'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 hover:cursor-pointer'
                      }`}
                    >
                      <span className="font-medium text-gray-900 dark:text-white">{font.label}</span>
                      {preferences.fontFamily === font.value && (
                        <Check className="w-5 h-5 text-[var(--theme-color,#635BFF)]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme Color */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <Palette className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Theme Color
                  </h3>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {([
                    { value: 'purple', color: '#635BFF', label: 'Purple' },
                    { value: 'blue', color: '#6ca6f1ff', label: 'Blue' },
                    { value: 'green', color: '#4CAF50', label: 'Green' },
                    { value: 'orange', color: '#FF9800', label: 'Orange' },
                    { value: 'pink', color: '#E91E63', label: 'Pink' },
                    // { value: 'default', color: '#ff5bffff', label: 'Default' },
                  ] as const).map((colorOption) => (
                    <button
                      key={colorOption.value}
                      onClick={() => updatePreference('themeColor', colorOption.value)}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        preferences.themeColor === colorOption.value
                          ? 'border-gray-900 dark:border-white'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 hover:cursor-pointer'
                      }`}
                      title={colorOption.label}
                    >
                      <div
                        className="w-full h-8 rounded-lg"
                        style={{ backgroundColor: colorOption.color }}
                      />
                      {preferences.themeColor === colorOption.value && (
                        <Check className="w-4 h-4 mx-auto mt-1 text-gray-900 dark:text-white" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={resetToDefaults}
                  variant="outline"
                  className="flex-1 hover:cursor-pointer"
                >
                  Reset to Defaults
                </Button>
                <Button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 bg-[var(--theme-color,#635BFF)] hover:bg-[var(--theme-color-hover,#524BCC)] hover:cursor-pointer"
                >
                  Save & Close
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default AccessibilitySettings;

