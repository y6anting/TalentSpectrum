"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, Pause, Play, X } from 'lucide-react';
import { Button } from './button';

interface Position {
  x: number;
  y: number;
}

const TextToSpeech: React.FC = () => {
  const [selectedText, setSelectedText] = useState<string>('');
  const [position, setPosition] = useState<Position | null>(null);
  const [isReading, setIsReading] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [ttsSpeed, setTtsSpeed] = useState<number>(1.0);
  const [ttsPitch, setTtsPitch] = useState<number>(1.0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isCancellingRef = useRef<boolean>(false);
  const buttonRef = useRef<HTMLDivElement>(null);
  const selectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Function to get selected text and its position with better viewport handling
  const handleTextSelection = useCallback(() => {
    try {
      const selection = window.getSelection();
      const text = selection?.toString().trim();

      // console.log('TTS: Text selected:', text ? `"${text.substring(0, 50)}..."` : 'none');

      if (text && text.length > 0) {
        const range = selection?.getRangeAt(0);
        const rect = range?.getBoundingClientRect();

        if (rect && rect.width > 0 && rect.height > 0) {
          // console.log('TTS: Selection rect:', { 
          //   left: rect.left, 
          //   top: rect.top,
          //   bottom: rect.bottom,
          //   right: rect.right,
          //   width: rect.width,
          //   height: rect.height,
          //   scrollX: window.scrollX,
          //   scrollY: window.scrollY
          // });

          setSelectedText(text);
          
          // Calculate position relative to selection with better accuracy
          const buttonWidth = 220; // Approximate button width
          const buttonHeight = 60; // Approximate button height
          const gap = 8; // Gap between selection and button
          
          // Calculate X position (centered on selection)
          // Use absolute position including scroll offset
          let x = rect.left + window.scrollX + (rect.width / 2);
          
          // Ensure button stays within viewport horizontally
          const viewportRight = window.innerWidth + window.scrollX;
          const viewportLeft = window.scrollX;
          
          // Adjust if button would go off right edge
          if (x + buttonWidth / 2 > viewportRight - 10) {
            x = viewportRight - buttonWidth / 2 - 10;
          }
          
          // Adjust if button would go off left edge
          if (x - buttonWidth / 2 < viewportLeft + 10) {
            x = viewportLeft + buttonWidth / 2 + 10;
          }
          
          // Calculate Y position (below selection by default)
          let y = rect.bottom + window.scrollY + gap;
          const viewportBottom = window.innerHeight + window.scrollY;
          
          // If button would go below viewport, place it above the selection
          if (y + buttonHeight > viewportBottom - 10) {
            y = rect.top + window.scrollY - buttonHeight - gap;
          }
          
          // Final check: if still off screen (very top), force below
          if (y < window.scrollY + 10) {
            y = rect.bottom + window.scrollY + gap;
          }
          
          setPosition({ x, y });
          // console.log('TTS: Button positioned at', { 
          //   x, 
          //   y, 
          //   selectionCenter: rect.left + rect.width / 2,
          //   distanceFromSelection: y - (rect.bottom + window.scrollY)
          // });
        } else {
          // console.log('TTS: Invalid rect dimensions, not showing button');
        }
      } else {
        // If no text is selected and not reading, hide the button
        if (!isReading) {
          // console.log('TTS: No text selected, hiding button');
          setPosition(null);
          setSelectedText('');
        }
      }
    } catch (error) {
      console.error('TTS: Error in handleTextSelection:', error);
    }
  }, [isReading]);

  // Load available voices and get saved preference
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
      
      // Get saved voice preference, speed, and pitch from accessibility settings
      const savedPrefs = localStorage.getItem('accessibility-preferences');
      let savedVoiceName = '';
      let savedSpeed = 1.0;
      let savedPitch = 1.0;
      if (savedPrefs) {
        try {
          const parsed = JSON.parse(savedPrefs);
          savedVoiceName = parsed.ttsVoice || '';
          savedSpeed = parsed.ttsSpeed !== undefined && parsed.ttsSpeed !== null ? Number(parsed.ttsSpeed) : 1.0;
          savedPitch = parsed.ttsPitch !== undefined && parsed.ttsPitch !== null ? Number(parsed.ttsPitch) : 1.0;
        } catch (e) {
          console.error('Failed to parse accessibility preferences:', e);
        }
      }
      
      // Set voice from saved preference or default
      if (!selectedVoice && voices.length > 0) {
        let voiceToUse: SpeechSynthesisVoice | null = null;
        
        if (savedVoiceName) {
          voiceToUse = voices.find(voice => voice.name === savedVoiceName) || null;
        }
        
        if (!voiceToUse) {
          // Fallback to default preference
          voiceToUse = voices.find(voice => 
            voice.lang.startsWith('en') && voice.name.includes('Female')
          ) || voices.find(voice => voice.lang.startsWith('en')) || voices[0];
        }
        
        if (voiceToUse) {
          setSelectedVoice(voiceToUse);
        }
      }
      // Always set speed and pitch from saved preferences (even if voice is already set)
      setTtsSpeed(savedSpeed);
      setTtsPitch(savedPitch);
    };
    
    loadVoices();
    // Voices may load asynchronously
    window.speechSynthesis.onvoiceschanged = loadVoices;
    
    // Listen for accessibility preference changes
    const handleStorageChange = () => {
      const savedPrefs = localStorage.getItem('accessibility-preferences');
      if (savedPrefs) {
        try {
          const parsed = JSON.parse(savedPrefs);
          if (parsed.ttsVoice) {
            const voices = window.speechSynthesis.getVoices();
            const voice = voices.find(v => v.name === parsed.ttsVoice);
            if (voice) {
              setSelectedVoice(voice);
            }
          }
          // Always update speed and pitch, even if they're the same value
          if (parsed.ttsSpeed !== undefined && parsed.ttsSpeed !== null) {
            setTtsSpeed(Number(parsed.ttsSpeed));
          }
          if (parsed.ttsPitch !== undefined && parsed.ttsPitch !== null) {
            setTtsPitch(Number(parsed.ttsPitch));
          }
        } catch (e) {
          console.error('Failed to parse accessibility preferences:', e);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    // Also listen for custom event (for same-tab updates)
    window.addEventListener('accessibilityPreferencesUpdated', handleStorageChange);
    
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('accessibilityPreferencesUpdated', handleStorageChange);
    };
  }, []);

  // Listen for text selection
  useEffect(() => {
    const handleMouseUp = (event: MouseEvent) => {
      // Don't trigger if clicking on the button itself
      if (buttonRef.current && buttonRef.current.contains(event.target as Node)) {
        return;
      }
      
      // Clear any existing timeout
      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current);
      }
      
      // Small delay to ensure selection is complete
      selectionTimeoutRef.current = setTimeout(() => {
        handleTextSelection();
      }, 100);
    };

    const handleMouseDown = (event: MouseEvent) => {
      // Only hide if clicking outside AND button is not reading AND not clicking on button
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        // If we're not reading, hide the button when clicking elsewhere
        if (!isReading && !isPaused) {
          // Small delay to allow new selection to happen first
          setTimeout(() => {
            const selection = window.getSelection();
            const hasSelection = selection && selection.toString().trim().length > 0;
            
            // Only clear if there's no new selection
            if (!hasSelection) {
              setPosition(null);
              setSelectedText('');
            }
          }, 50);
        }
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousedown', handleMouseDown);
      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current);
      }
    };
  }, [handleTextSelection, isReading, isPaused]);

  // Function to read text aloud
  const readText = useCallback((e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    if (!selectedText) return;

    // Cancel any ongoing speech
    isCancellingRef.current = false;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(selectedText);
    utteranceRef.current = utterance;

    // Configure speech settings from preferences
    // Ensure values are valid numbers (rate: 0.1-10, pitch: 0-2)
    utterance.rate = Math.max(0.1, Math.min(10, Number(ttsSpeed) || 1.0)); // Use saved speed preference
    utterance.pitch = Math.max(0, Math.min(2, Number(ttsPitch) || 1.0)); // Use saved pitch preference
    utterance.volume = 1.0; // Full volume
    utterance.lang = selectedVoice?.lang || 'en-US'; // Set language
    
    // Set selected voice if available
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    // Debug logging
    console.log('TTS Settings:', {
      rate: utterance.rate,
      pitch: utterance.pitch,
      voice: selectedVoice?.name,
      speed: ttsSpeed,
      pitchValue: ttsPitch
    });

    // Event handlers
    utterance.onstart = () => {
      setIsReading(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsReading(false);
      setIsPaused(false);
      // Don't auto-hide the button, let user close it manually
      // This allows them to read the same text again if needed
    };

    utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
      const err = (event as any)?.error;
      // Ignore errors triggered by user-initiated cancel/interrupt
      if (!isCancellingRef.current && err !== 'interrupted' && err !== 'canceled') {
        console.error('Speech synthesis error:', err || event);
      }
      setIsReading(false);
      setIsPaused(false);
    };

    utterance.onpause = () => {
      setIsPaused(true);
    };

    utterance.onresume = () => {
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  }, [selectedText, selectedVoice, ttsSpeed, ttsPitch]);

  // Function to pause/resume speech
  const togglePause = useCallback((e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    if (window.speechSynthesis.speaking) {
      if (isPaused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
      } else {
        window.speechSynthesis.pause();
        setIsPaused(true);
      }
    }
  }, [isPaused]);

  // Function to stop speech and close
  const handleClose = useCallback((e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    // Cancel speech
    isCancellingRef.current = true;
    window.speechSynthesis.cancel();
    
    // Reset all states
    setIsReading(false);
    setIsPaused(false);
    setPosition(null);
    setSelectedText('');
    
    // Clear text selection
    window.getSelection()?.removeAllRanges();
  }, []);

  // Cleanup on unmount and page visibility
  useEffect(() => {
    // Stop speech when component unmounts
    return () => {
      isCancellingRef.current = true;
      window.speechSynthesis.cancel();
      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current);
      }
    };
  }, []);

  // Handle page visibility changes (stop when tab is hidden)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isReading) {
        window.speechSynthesis.pause();
        setIsPaused(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isReading]);

  if (!position) return null;

  return (
    <div
      ref={buttonRef}
      className="fixed bg-white rounded-lg shadow-2xl border-2 border-[#635BFF] p-2 flex items-center gap-2"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translateX(-50%)',
        pointerEvents: 'auto',
        zIndex: 999999,
        position: 'fixed',
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {!isReading ? (
        <>
          <Button
            onClick={readText}
            onMouseDown={(e) => e.preventDefault()}
            size="sm"
            className="hover:cursor-pointer bg-[#635BFF] hover:bg-[#524BCC] text-white px-3 py-1.5 text-xs font-medium transition-all"
            title="Read selected text aloud"
          >
            <Volume2 className="w-4 h-4 mr-1.5" />
            Read Aloud
          </Button>
          <Button
            onClick={handleClose}
            onMouseDown={(e) => e.preventDefault()}
            size="sm"
            variant="outline"
            className="px-2 py-1.5 text-xs hover:cursor-pointer hover:bg-gray-100 transition-all"
            title="Close"
          >
            <X className="w-4 h-4" />
          </Button>
        </>
      ) : (
        <>
          <Button
            onClick={togglePause}
            onMouseDown={(e) => e.preventDefault()}
            size="sm"
            className="bg-[#635BFF] hover:bg-[#524BCC] text-white px-3 py-1.5 text-xs font-medium transition-all"
            title={isPaused ? 'Resume reading' : 'Pause reading'}
          >
            {isPaused ? (
              <>
                <Play className="w-4 h-4 mr-1.5" />
                Resume
              </>
            ) : (
              <>
                <Pause className="w-4 h-4 mr-1.5" />
                Pause
              </>
            )}
          </Button>
          <Button
            onClick={handleClose}
            onMouseDown={(e) => e.preventDefault()}
            size="sm"
            variant="outline"
            className="px-3 py-1.5 text-xs border-red-500 text-red-500 hover:bg-red-50 transition-all font-medium hover:cursor-pointer"
            title="Stop and close"
          >
            <X className="w-4 h-4 mr-1.5" />
            Stop
          </Button>
        </>
      )}
      {isReading && (
        <div className="flex items-center text-xs text-gray-600 ml-1 font-medium">
          {isPaused ? (
            <>
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
              Paused
            </>
          ) : (
            <>
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Reading...
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TextToSpeech;

