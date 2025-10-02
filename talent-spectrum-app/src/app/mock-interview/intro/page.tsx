"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/button";
import { Card, CardContent } from "@/app/components/card";
import RealisticAvatar from "@/app/mock-interview/RealisticAvatar";
import {
  Volume2,
  Target,
  Award,
  Play,
  Settings,
  Text,
  Eye,
  Mic,
  Wifi,
  Lightbulb,
  BellOff,
} from "lucide-react";

const mockSessionData = {
  selectedPosition: {
    title: "Frontend Developer",
    description:
      "Develop user-facing web applications using modern JavaScript frameworks",
    requirements: ["React", "TypeScript", "CSS", "HTML", "Git"],
    level: "mid" as const,
    industry: "Technology",
  },
  questions: [
    {
      id: "general-1",
      question:
        "Tell me about yourself and your experience with frontend development.",
      type: "general" as const,
      difficulty: "easy" as const,
      expectedDuration: 3,
    },
    {
      id: "technical-1",
      question: "How would you optimize the performance of a React application?",
      type: "technical" as const,
      difficulty: "medium" as const,
      expectedDuration: 4,
    },
  ],
  interviewType: "general" as const,
  totalQuestions: 5,
  positionLevel: "mid",
  startTime: new Date().toISOString(),
};

const MockInterviewIntroPage = () => {
  const router = useRouter();
  const [isAvatarSpeaking, setIsAvatarSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Accessibility settings
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [textOnly, setTextOnly] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);

  const handleBeginInterview = () => {
    sessionStorage.setItem(
      "mockInterviewSession",
      JSON.stringify(mockSessionData)
    );
    router.push("/mock-interview/interviewprocess");
  };

  return (
    <div
      className={`min-h-screen w-full flex items-center justify-center px-4 py-10 transition-colors duration-300 ${
        highContrast
          ? "bg-white text-black"
          : "bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"
      }`}
    >
      <div className="w-full max-w-[1400px] mx-auto relative">
        {/* Settings Button */}
        <button
          onClick={() => setSettingsOpen(!settingsOpen)}
          className="absolute top-4 right-4 p-2 rounded-full bg-white shadow hover:bg-gray-200"
        >
          <Settings className="w-5 h-5 text-gray-800" />
        </button>

        {/* Settings Panel */}
        {settingsOpen && (
          <div className="absolute top-14 right-4 bg-white shadow-lg rounded-xl p-4 w-64 space-y-3 border border-gray-200 z-50">
            <h4 className="font-semibold text-gray-800 mb-2 text-sm">
              Accessibility Settings
            </h4>
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={textOnly}
                onChange={() => setTextOnly(!textOnly)}
              />
              <Text className="w-4 h-4 text-purple-600" />
              Text-Only Mode
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={highContrast}
                onChange={() => setHighContrast(!highContrast)}
              />
              <Eye className="w-4 h-4 text-purple-600" />
              High Contrast Mode
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={largeText}
                onChange={() => setLargeText(!largeText)}
              />
              <span className="font-medium text-purple-600">Aa</span>
              Large Text
            </label>
          </div>
        )}

        <Card className="relative rounded-xl shadow-lg border-0 bg-white/80 dark:bg-black/20 overflow-hidden">
          <CardContent className="relative p-4 sm:p-8 md:p-16 text-center">
            {/* Title */}
            <h1
              className={`font-bold mb-4 text-gray-900 pt-3 ${
                largeText ? "text-5xl" : "text-3xl sm:text-4xl md:text-5xl"
              }`}
            >
              Welcome! Let’s get you ready.
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto mb-10">
              Your AI-powered interview is about to begin. Let’s quickly check
              a few things to make sure you’re ready.
            </p>

            {/* Avatar */}
            {!textOnly && (
              <div className="flex justify-center mb-8 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-40 h-40 rounded-full bg-purple-300/30 blur-3xl" />
                </div>
                <RealisticAvatar
                  isSpeaking={isAvatarSpeaking}
                  isListening={isListening}
                  onStartListening={() => setIsListening(true)}
                  onStopListening={() => setIsListening(false)}
                  size="large"
                />
              </div>
            )}

            {/* Checklist Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left mb-12 max-w-4xl mx-auto">
              <div className="bg-white/70 p-6 rounded-lg flex items-start space-x-4 border border-gray-300">
                <div className="flex-shrink-0 size-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Check Microphone</h3>
                  <p className="text-sm text-gray-600">
                    Ensure your mic is on and working clearly.
                  </p>
                </div>
              </div>

              <div className="bg-white/70 p-6 rounded-lg flex items-start space-x-4 border border-gray-300">
                <div className="flex-shrink-0 size-8 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Good Lighting</h3>
                  <p className="text-sm text-gray-600">
                    Sit in a well-lit area for best visibility.
                  </p>
                </div>
              </div>

              <div className="bg-white/70 p-6 rounded-lg flex items-start space-x-4 border border-gray-300">
                <div className="flex-shrink-0 size-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                  <Wifi className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">
                    Stable Connection
                  </h3>
                  <p className="text-sm text-gray-600">
                    Make sure your internet is strong and steady.
                  </p>
                </div>
              </div>

              <div className="bg-white/70 p-6 rounded-lg flex items-start space-x-4 border border-gray-300">
                <div className="flex-shrink-0 size-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                  <BellOff className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">
                    Quiet Environment
                  </h3>
                  <p className="text-sm text-gray-600">
                    Reduce distractions for best focus.
                  </p>
                </div>
              </div>
            </div>

            {/* Start Button */}
            <Button
              className="bg-purple-700 text-white font-bold text-lg py-4 px-10 rounded-lg shadow-lg hover:bg-purple-700 transition-transform duration-300 hover:scale-105 focus:ring-4 focus:ring-purple-400"
              onClick={handleBeginInterview}
            >
              <Play className="w-5 h-5 mr-2" />
              Start Interview
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MockInterviewIntroPage;
