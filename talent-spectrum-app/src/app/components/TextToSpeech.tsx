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
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
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
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(selectedText);
    utteranceRef.current = utterance;

    // Configure speech settings for better clarity
    utterance.rate = 0.9; // Slightly slower for better comprehension
    utterance.pitch = 1.0; // Normal pitch
    utterance.volume = 1.0; // Full volume
    utterance.lang = 'en-US'; // Set language

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

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
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
  }, [selectedText]);

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
            className="bg-[#635BFF] hover:bg-[#524BCC] text-white px-3 py-1.5 text-xs font-medium transition-all"
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
            className="px-2 py-1.5 text-xs hover:bg-gray-100 transition-all"
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
            className="px-3 py-1.5 text-xs border-red-500 text-red-500 hover:bg-red-50 transition-all font-medium"
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

