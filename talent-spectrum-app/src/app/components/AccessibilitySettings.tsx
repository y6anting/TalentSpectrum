"use client";

import React, { useState, useEffect } from 'react';
import { Settings, X, Type, Palette, Check, Volume2, Info, Play, Clock, Zap } from 'lucide-react';
import { Button } from './button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/card';

interface AccessibilityPreferences {
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  fontFamily: 'default' | 'arial' | 'verdana' | 'georgia' | 'comic-sans' | 'open-dyslexic';
  themeColor: 'purple' | 'blue' | 'green' | 'orange' | 'pink' | 'default';
  ttsVoice: string;
  ttsSpeed: number;
  ttsPitch: number;
}

const STORAGE_KEY = 'accessibility-preferences';

const AccessibilitySettings: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Prevent body scroll and preserve scrollbar width when modal opens
  useEffect(() => {
    if (isOpen) {
      // Calculate scrollbar width
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      // Save original padding
      const originalPaddingRight = document.body.style.paddingRight;
      const originalOverflow = document.body.style.overflow;
      
      // Apply padding to prevent shift when scrollbar disappears
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      document.body.style.overflow = 'hidden';
      
      return () => {
        // Restore original styles
        document.body.style.paddingRight = originalPaddingRight;
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [preferences, setPreferences] = useState<AccessibilityPreferences>({
    fontSize: 'medium',
    fontFamily: 'default',
    themeColor: 'purple',
    ttsVoice: '',
    ttsSpeed: 1.0,
    ttsPitch: 1.0,
  });

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
      // Debug: Log all English voices
      const englishVoices = voices.filter(voice => voice.lang.toLowerCase().startsWith('en'));
      console.log('Available English voices:', englishVoices.length, englishVoices.map(v => `${v.name} (${v.lang})`));
      
      // Set default voice if not set
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Set defaults for new fields if not present
          if (parsed.ttsSpeed === undefined) parsed.ttsSpeed = 1.0;
          if (parsed.ttsPitch === undefined) parsed.ttsPitch = 1.0;
          if (!parsed.ttsVoice && voices.length > 0) {
            const preferredVoice = voices.find(voice => 
              voice.lang.startsWith('en') && voice.name.includes('Female')
            ) || voices.find(voice => voice.lang.startsWith('en')) || voices[0];
            if (preferredVoice) {
              const updatedPrefs = { ...parsed, ttsVoice: preferredVoice.name };
              setPreferences(updatedPrefs);
              localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPrefs));
            }
          }
        } catch (error) {
          console.error('Failed to load accessibility preferences:', error);
        }
      } else if (voices.length > 0) {
        const preferredVoice = voices.find(voice => 
          voice.lang.startsWith('en') && voice.name.includes('Female')
        ) || voices.find(voice => voice.lang.startsWith('en')) || voices[0];
        if (preferredVoice) {
          const updatedPrefs = { 
            ...preferences, 
            ttsVoice: preferredVoice.name,
            ttsSpeed: preferences.ttsSpeed ?? 1.0,
            ttsPitch: preferences.ttsPitch ?? 1.0,
          };
          setPreferences(updatedPrefs);
        }
      }
    };
    
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Ensure ttsVoice, ttsSpeed, and ttsPitch are included if not present
          if (!parsed.ttsVoice && availableVoices.length > 0) {
            const preferredVoice = availableVoices.find(voice => 
              voice.lang.startsWith('en') && voice.name.includes('Female')
            ) || availableVoices.find(voice => voice.lang.startsWith('en')) || availableVoices[0];
            if (preferredVoice) {
              parsed.ttsVoice = preferredVoice.name;
            }
          }
          if (parsed.ttsSpeed === undefined) parsed.ttsSpeed = 1.0;
          if (parsed.ttsPitch === undefined) parsed.ttsPitch = 1.0;
          setPreferences(parsed);
          applyPreferences(parsed);
        } catch (error) {
          console.error('Failed to load accessibility preferences:', error);
        }
    } else {
      // Apply default preferences
      applyPreferences(preferences);
    }
  }, [availableVoices]);

  // Apply preferences to the document
  const applyPreferences = (prefs: AccessibilityPreferences) => {
    const root = document.documentElement;
    const body = document.body;

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

    // Apply theme color - Using Material Design standard colors
    const themeColorMap = {
      purple: '#635BFF',  // Custom purple brand color
      blue: '#2196F3',     // Material Blue 500
      green: '#4CAF50',   // Material Green 500
      orange: '#FF9800',  // Material Orange 500
      pink: '#E91E63',    // Material Pink 500
      default: '#635BFF',
    };
    root.style.setProperty('--theme-color', themeColorMap[prefs.themeColor]);
    root.style.setProperty('--theme-color-hover', adjustColorBrightness(themeColorMap[prefs.themeColor], -20));

    // Force update all elements with custom class
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
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new CustomEvent('accessibilityPreferencesUpdated'));
  };

  // Reset to defaults
  const resetToDefaults = () => {
    const defaultVoice = availableVoices.find(voice => 
      voice.lang.startsWith('en') && voice.name.includes('Female')
    ) || availableVoices.find(voice => voice.lang.startsWith('en')) || availableVoices[0];
    
    const defaults: AccessibilityPreferences = {
      fontSize: 'medium',
      fontFamily: 'default',
      themeColor: 'purple',
      ttsVoice: defaultVoice?.name || '',
      ttsSpeed: 1.0,
      ttsPitch: 1.0,
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
            style={{ paddingRight: typeof window !== 'undefined' ? `${window.innerWidth - document.documentElement.clientWidth}px` : '0px' }}
          />

          {/* Panel */}
          <div id="accessibility-settings-panel" className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[99999] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" style={{ willChange: 'auto' }}>
            <div className="p-8 overflow-y-auto flex-1" style={{ overflowAnchor: 'none' }}>
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
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

              {/* Settings Navigation Breadcrumb */}
              <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium text-gray-900 dark:text-white">Read Aloud</span>
                  <span>|</span>
                  <span className="font-medium text-gray-900 dark:text-white">Font Size</span>
                  <span>|</span>
                  <span className="font-medium text-gray-900 dark:text-white">Font Style</span>
                  <span>|</span>
                  <span className="font-medium text-gray-900 dark:text-white">Theme Color</span>
                </div>
              </div>

              <div className="space-y-8">
                {/* Custom styles for range inputs */}
                <style dangerouslySetInnerHTML={{__html: `
                  .tts-range-input::-webkit-slider-thumb {
                    appearance: none;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: var(--theme-color, #635BFF);
                    border: 2px solid white;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                    cursor: pointer;
                  }
                  .tts-range-input::-moz-range-thumb {
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: var(--theme-color, #635BFF);
                    border: 2px solid white;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                    cursor: pointer;
                  }
                `}} />

                {/* Read Aloud Section (Voice Selection) */}
                <Card className="border border-gray-300 dark:border-gray-700 shadow-md p-4">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 ">
                      <Volume2 className="w-5 h-5" style={{ color: 'var(--theme-color, #635BFF)' }} />
                      Read Aloud
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Read Aloud Info Banner */}
                    <div className="p-4 bg-[var(--theme-color,#635BFF)]/8 border border-[var(--theme-color,#635BFF)]/40 rounded-xl">
                      <div className="flex items-start gap-2">
                        <Info className="w-5 h-5" style={{ color: 'var(--theme-color, #635BFF)' }} />
                        <div className="text-sm font-semibold text-gray-600">
                          <p>Select any text on the website and click "Read Aloud" to have it read to you. Choose your preferred voice below.</p>
                        </div>
                      </div>
                    </div>

                    {/* Voice Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Preferred Voice
                      </label>
                      {availableVoices.length > 0 ? (
                        <Select
                          value={preferences.ttsVoice || ''}
                          onValueChange={(value) => updatePreference('ttsVoice', value)}
                        >
                          <SelectTrigger className="w-full border-gray-300 dark:border-gray-600 z-[100001]">
                            <SelectValue placeholder="Select a voice" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[300px]" style={{ zIndex: 100003 }} position="popper">
                            {availableVoices
                              .filter(voice => voice.lang.toLowerCase().startsWith('en'))
                              .map((voice) => {
                                const displayName = voice.name.replace(/^Microsoft\s+/i, '');
                                return (
                                  <SelectItem key={voice.name} value={voice.name}>
                                    {displayName} ({voice.lang})
                                  </SelectItem>
                                );
                              })}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Loading voices...
                        </div>
                      )}
                    </div>

                    {/* Speech Speed & Pitch - Nested Cards */}
                    {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> */}
                      {/* Speech Speed Card */}
                      <Card className="border border-gray-200 dark:border-gray-600 shadow-sm">
                        <CardHeader className="pb-1">
                          <CardTitle className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4" style={{ color: 'var(--theme-color, #635BFF)' }} />
                            Speech Speed
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="relative">
                            <input
                              type="range"
                              min="0.5"
                              max="2.0"
                              step="0.1"
                              value={preferences.ttsSpeed}
                              onChange={(e) => updatePreference('ttsSpeed', parseFloat(e.target.value))}
                              className="tts-range-input w-full h-2 bg-white border-2 border-gray-300 rounded-lg appearance-none cursor-pointer dark:bg-gray-800 dark:border-gray-600"
                              style={{
                                background: `linear-gradient(to right, var(--theme-color, #635BFF) 0%, var(--theme-color, #635BFF) ${((preferences.ttsSpeed - 0.5) / 1.5) * 100}%, #ffffff ${((preferences.ttsSpeed - 0.5) / 1.5) * 100}%, #ffffff 100%)`,
                                WebkitAppearance: 'none',
                                appearance: 'none'
                              }}
                            />
                            <div className="flex justify-between items-center mt-2">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" style={{ color: 'var(--theme-color, #635BFF)' }} />
                                <span className="text-xs text-gray-500 dark:text-gray-400">Slow</span>
                              </div>
                              <span className="text-sm font-medium" style={{ color: 'var(--theme-color, #635BFF)' }}>
                                {preferences.ttsSpeed.toFixed(1)}x
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 dark:text-gray-400">Fast</span>
                                <Zap className="w-4 h-4" style={{ color: 'var(--theme-color, #635BFF)' }} />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Speech Pitch Card */}
                      {/* <Card className="border border-gray-200 dark:border-gray-600 shadow-sm">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-sm">
                            <Volume2 className="w-4 h-4" style={{ color: 'var(--theme-color, #635BFF)' }} />
                            Speech Pitch
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="relative">
                            <input
                              type="range"
                              min="0.5"
                              max="2.0"
                              step="0.1"
                              value={preferences.ttsPitch}
                              onChange={(e) => {
                                const newPitch = parseFloat(e.target.value);
                                updatePreference('ttsPitch', newPitch);
                                // Test pitch immediately for feedback
                                const testUtterance = new SpeechSynthesisUtterance('Pitch test');
                                const selectedVoice = availableVoices.find(v => v.name === preferences.ttsVoice);
                                if (selectedVoice) {
                                  testUtterance.voice = selectedVoice;
                                }
                                testUtterance.rate = preferences.ttsSpeed;
                                testUtterance.pitch = newPitch;
                                window.speechSynthesis.cancel();
                                window.speechSynthesis.speak(testUtterance);
                              }}
                              className="tts-range-input w-full h-2 bg-white border-2 border-gray-300 rounded-lg appearance-none cursor-pointer dark:bg-gray-800 dark:border-gray-600"
                              style={{
                                background: `linear-gradient(to right, var(--theme-color, #635BFF) 0%, var(--theme-color, #635BFF) ${((preferences.ttsPitch - 0.5) / 1.5) * 100}%, #ffffff ${((preferences.ttsPitch - 0.5) / 1.5) * 100}%, #ffffff 100%)`,
                                WebkitAppearance: 'none',
                                appearance: 'none'
                              }}
                            />
                            <div className="flex justify-between items-center mt-2">
                              <span className="text-xs text-gray-500 dark:text-gray-400">0.5 (Lower)</span>
                              <span className="text-sm font-medium" style={{ color: 'var(--theme-color, #635BFF)' }}>
                                {preferences.ttsPitch.toFixed(1)}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">2.0 (Higher)</span>
                            </div>
                            <div className="flex justify-center mt-1">
                              <span className="text-xs text-gray-500 dark:text-gray-400">1.0 (Normal)</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div> */}

                    {/* Preview Text */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Preview Text
                      </label>
                      <p className="text-sm text-gray-600 dark:text-gray-300 italic">
                        "This is a preview of the text to speech voice. You can adjust the speed and pitch to your preference."
                      </p>
                    </div>

                    {/* Preview Button */}
                    <div>
                      <Button
                        onClick={() => {
                          const utterance = new SpeechSynthesisUtterance('This is a preview of the text to speech voice. You can adjust the speed and pitch to your preference.');
                          const selectedVoice = availableVoices.find(v => v.name === preferences.ttsVoice);
                          if (selectedVoice) {
                            utterance.voice = selectedVoice;
                          }
                          utterance.rate = preferences.ttsSpeed;
                          utterance.pitch = preferences.ttsPitch;
                          window.speechSynthesis.cancel();
                          window.speechSynthesis.speak(utterance);
                        }}
                        className="w-full hover:cursor-pointer flex items-center justify-center gap-2"
                        style={{
                          backgroundColor: 'var(--theme-color, #635BFF)',
                          color: 'white'
                        }}
                      >
                        <Play className="w-4 h-4" />
                        Preview Voice
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Font Size */}
                <Card className="border border-gray-300 dark:border-gray-700 shadow-md p-4">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Type className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                      Font Size
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
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
                  </CardContent>
                </Card>

                {/* Font Family */}
                <Card className="border border-gray-300 dark:border-gray-700 shadow-md p-4">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Type className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                      Font Style
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Select
                      value={preferences.fontFamily}
                      onValueChange={(value) => updatePreference('fontFamily', value as AccessibilityPreferences['fontFamily'])}
                    >
                      <SelectTrigger className="w-full border-gray-300 dark:border-gray-600 z-[100001]">
                        <SelectValue placeholder="Select font style" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]" style={{ zIndex: 100003 }} position="popper">
                        <SelectItem value="default">Default (System)</SelectItem>
                        <SelectItem value="arial">Arial</SelectItem>
                        <SelectItem value="verdana">Verdana</SelectItem>
                        <SelectItem value="georgia">Georgia</SelectItem>
                        <SelectItem value="comic-sans">Comic Sans (Dyslexia-friendly)</SelectItem>
                        <SelectItem value="open-dyslexic">OpenDyslexic (Recommended for Dyslexia)</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                {/* Theme Color */}
                <Card id="accessibility-settings-theme-color" className="border border-gray-300 dark:border-gray-700 shadow-md p-4">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                      Theme Color
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 theme-color-swatches">
                      {([
                        { 
                          value: 'purple', 
                          color: '#635BFF',  // Custom purple brand color
                          label: 'Purple' 
                        },
                        { 
                          value: 'blue', 
                          color: '#2196F3',  // Material Blue 500
                          label: 'Blue' 
                        },
                        { 
                          value: 'green', 
                          color: '#4CAF50',  // Material Green 500
                          label: 'Green' 
                        },
                        { 
                          value: 'orange', 
                          color: '#FF9800',  // Material Orange 500
                          label: 'Orange' 
                        },
                        { 
                          value: 'pink', 
                          color: '#E91E63',  // Material Pink 500
                          label: 'Pink' 
                        },
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
                            className="w-full h-8 rounded-lg theme-color-swatch"
                            style={{ 
                              backgroundColor: colorOption.color
                            }}
                          />
                          {preferences.themeColor === colorOption.value && (
                            <Check className="w-4 h-4 mx-auto mt-1 text-gray-900 dark:text-white" />
                          )}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
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

