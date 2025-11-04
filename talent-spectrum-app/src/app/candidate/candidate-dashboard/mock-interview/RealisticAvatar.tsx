"use client";

import Image from "next/image";
import React, { useState, useRef, useEffect } from "react";
import { Button } from "../components/button";
import { Volume2, VolumeX, Mic, MicOff, Loader2, Pause } from "lucide-react";

interface RealisticAvatarProps {
  isListening?: boolean;
  isSpeaking?: boolean;
  onStartListening?: () => void;
  onStopListening?: () => void;
  currentQuestion?: string;
  onQuestionComplete?: () => void;
  size?: "small" | "medium" | "large";
  imageUrl?: string;
}

export default function RealisticAvatar({
  isListening = false,
  isSpeaking = false,
  onStartListening,
  onStopListening,
  currentQuestion,
  onQuestionComplete,
  size = "medium",
  imageUrl = "",
}: RealisticAvatarProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioEnabled] = useState(true);
  const [isLoadingLipSync, setIsLoadingLipSync] = useState(false);
  const [currentSpeechText, setCurrentSpeechText] = useState("");

  const avatarRef = useRef<HTMLDivElement>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const animationFrameRef = useRef<number>(0);

  // Size configurations
  const sizeConfig = {
    small: {
      container: "w-24 h-24",
      text: "text-lg",
      controls: "text-xs",
      button: "px-2 py-1 text-xs",
    },
    medium: {
      container: "w-40 h-40",
      text: "text-2xl",
      controls: "text-sm",
      button: "px-3 py-1 text-sm",
    },
    large: {
      container: "w-56 h-56",
      text: "text-3xl",
      controls: "text-base",
      button: "px-4 py-2 text-sm",
    },
  };

  const config = sizeConfig[size];

  // Cleanup animations on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }
    };
  }, []);

  // Speak the current question with simple speech
  useEffect(() => {
    if (currentQuestion && !isMuted && audioEnabled) {
      speakQuestionSimple(currentQuestion);
    }
  }, [currentQuestion, isMuted, audioEnabled]);

  const speakQuestionSimple = (text: string) => {
    try {
      setCurrentSpeechText(text);

      if (speechRef.current) {
        speechSynthesis.cancel();
      }

      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.85;
        utterance.pitch = 1.0;
        utterance.volume = 0.8;

        // Pick a natural voice if available
        const voices = speechSynthesis.getVoices();
        let selectedVoice = voices.find(
          (voice) =>
            voice.lang.startsWith("en") &&
            (voice.name.includes("Female") ||
              voice.name.includes("Natural") ||
              voice.name.includes("Neural"))
        );

        if (!selectedVoice) {
          selectedVoice = voices.find((voice) => voice.lang.startsWith("en"));
        }

        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }

        utterance.onstart = () => {
          startVisualAnimation();
        };

        utterance.onend = () => {
          stopVisualAnimation();
          setCurrentSpeechText("");
          onQuestionComplete?.();
        };

        utterance.onerror = (event) => {
          if (event.error === "interrupted") {
            console.log("Speech interrupted by user action.");
          } else {
            console.error("Speech synthesis error:", event.error);
          }
          stopVisualAnimation();
          setCurrentSpeechText("");
          onQuestionComplete?.();
        };

        speechRef.current = utterance;
        speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error("Error with simple speech:", error);
      onQuestionComplete?.();
    }
  };

  const startVisualAnimation = () => {
    if (avatarRef.current) {
      avatarRef.current.classList.add("speaking");
    }

    const animate = () => {
      if (speechSynthesis.speaking) {
        if (avatarRef.current) {
          avatarRef.current.style.transform = "scale(1.05)";
        }
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  const stopVisualAnimation = () => {
    if (avatarRef.current) {
      avatarRef.current.classList.remove("speaking");
      avatarRef.current.style.transform = "scale(1)";
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const stopSpeaking = () => {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
    stopVisualAnimation();
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      stopSpeaking();
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      onStopListening?.();
    } else {
      setIsRecording(true);
      onStartListening?.();
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Avatar Display */}
      <div className="relative">
        <div
          ref={avatarRef}
          className={`
            ${config.container} rounded-full relative overflow-hidden shadow-2xl
            transition-all duration-300 ease-in-out
            ring-2 ring-gray-200
          `}
        >
          {/* Static Avatar Image */}
          <div
            className={`
            w-full h-full relative
            opacity-100
            transition-opacity duration-300
            `}
          >
            <Image
              src={imageUrl || "/avatar.png"}
              alt="AI Interviewer Avatar"
              fill
              className="object-cover rounded-full"
              priority
            />
          </div>

          {/* Loading Overlay */}
          {isLoadingLipSync && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-20">
              <div className="text-center text-white">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                <div className="text-xs">Preparing response...</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Avatar Info */}
      <div className="text-center">
        <p className={`${config.controls} text-gray-600`}>
          {isLoadingLipSync
            ? "Preparing response..."
            : isSpeaking
            ? "Speaking..."
            : isListening
            ? "Listening..."
            : "I am your interviewer"}
        </p>

        <h3 className={`${config.text} font-semibold text-gray-800 mt-2`}>
          Yan Ting
        </h3>

        {/* Current Speech Text Display */}
        {currentSpeechText && isSpeaking && (
          <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200 max-w-xs">
            <p className="text-xs text-blue-700 italic">
              "{currentSpeechText.substring(0, 50)}..."
            </p>
          </div>
        )}
      </div>

      {/* Audio Controls */}
      {/* <div className="flex items-center space-x-3">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleMute}
          className={`
            ${config.button}
            ${
              isMuted
                ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
                : "bg-gray-50 hover:bg-gray-100"
            }
          `}
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 mr-1" />
          ) : (
            <Volume2 className="w-4 h-4 mr-1" />
          )}
          {isMuted ? "Unmute" : "Mute"}
        </Button>

        {onStartListening && (
          <Button
            variant={isRecording ? "destructive" : "outline"}
            size="sm"
            onClick={toggleRecording}
            className={`${config.button} min-w-[80px]`}
          >
            {isRecording ? (
              <MicOff className="w-4 h-4 mr-1" />
            ) : (
              <Mic className="w-4 h-4 mr-1" />
            )}
            {isRecording ? "Stop" : "Record"}
          </Button>
        )}

        {isSpeaking && (
          <Button
            variant="outline"
            size="sm"
            onClick={stopSpeaking}
            className={`${config.button} text-orange-600 border-orange-200 hover:bg-orange-50`}
          >
            <Pause className="w-4 h-4 mr-1" />
            Skip
          </Button>
        )}
      </div> */}
    </div>
  );
}