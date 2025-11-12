"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/button";
import { Card, CardContent } from "@/app/components/card";
import { Progress } from "@/app/components/progress";
import RealisticAvatar from "@/app/mock-interview/RealisticAvatar";
import { 
  generateAIFeedback,
  transcribeVoiceToText,
  InterviewQuestion, 
  JobPosition 
} from "@/app/mock-interview/interviewService";
import {
  Mic,
  MicOff,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Clock, TrendingUp, Eye, EyeOff
} from "lucide-react";

type EmbeddedNavTarget = "setup" | "interview" | "feedback";
interface EmbeddedNavProps { onNavigate?: (target: EmbeddedNavTarget) => void }

type InterviewType = "general" | "technical" | "behavioral";

interface InterviewSession {
  currentQuestion: number;
  totalQuestions: number;
  positionLevel: string;
  startTime?: Date;
  answers: Array<{
    question: string;
    answer: string;
    audioBlob?: Blob | null;
    timestamp: Date;
  }>;
  selectedPosition?: JobPosition;
  interviewType: InterviewType;
  questions: InterviewQuestion[];
}


const MockInterviewProcessPage: React.FC<EmbeddedNavProps> = ({ onNavigate }) => {
  const router = useRouter();
  
  // Section: Types & Defaults
  // Mock data for fallback (same as intro page)
  const mockSessionData = {
    selectedPosition: {
      title: "Frontend Developer",
      description: "Develop user-facing web applications using modern JavaScript frameworks",
      requirements: ["React", "TypeScript", "CSS", "HTML", "Git"],
      level: "mid" as const,
      industry: "Technology"
    },
    questions: [
      {
        id: "general-1",
        question: "Tell me about yourself and your experience with frontend development.",
        type: "general" as const,
        difficulty: "easy" as const,
        expectedDuration: 3
      },
      {
        id: "technical-1",
        question: "How would you optimize the performance of a React application?",
        type: "technical" as const,
        difficulty: "medium" as const,
        expectedDuration: 4
      }
    ], 
    interviewType: "general" as const,
    totalQuestions: 2,
    positionLevel: "mid",
    startTime: new Date().toISOString(),
    currentQuestion: 0,
    answers: []
  };
  
  // ====================== STATE & REFS ======================
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isAvatarSpeaking, setIsAvatarSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [questionSpoken, setQuestionSpoken] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);
  const [ttsState, setTtsState] = useState<'idle' | 'speaking' | 'paused'>('idle');
  const [isUsingBrowserTts, setIsUsingBrowserTts] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [answerStartTime, setAnswerStartTime] = useState<Date | null>(null);
  const [answerDuration, setAnswerDuration] = useState(0);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [isAnswering, setIsAnswering] = useState(false);
  const [showAnswerTimer, setShowAnswerTimer] = useState(true);
  const [cameraOn, setCameraOn] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [isPermissionWarning, setIsPermissionWarning] = useState(false);

  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<any>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const answerTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // ====================== SESSION LOAD ======================
  useEffect(() => {
    const sessionData = sessionStorage.getItem("mockInterviewSession");
    if (sessionData) {
      try {
        const parsed = JSON.parse(sessionData);
        setSession({
          ...parsed,
          currentQuestion: parsed.currentQuestion || 0,
          answers: parsed.answers || [],
          startTime: new Date(parsed.startTime),
        });
      } catch (error) {
        console.error("Error parsing session:", error);
        setSession({ ...mockSessionData, startTime: new Date() });
      }
    } else {
      setSession({ ...mockSessionData, startTime: new Date() });
    }
    setLoading(false);
  }, [router]);

  // ====================== CAMERA ======================
  const requestPermissions = async () => {
    try {
      setPermissionError(null);
      
      // Check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Your browser doesn't support camera/microphone access. Please use a modern browser like Chrome, Firefox, or Edge.");
      }

      // First, check if devices are available
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasVideoInput = devices.some(device => device.kind === 'videoinput');
      const hasAudioInput = devices.some(device => device.kind === 'audioinput');

      if (!hasVideoInput && !hasAudioInput) {
        throw new Error("No camera or microphone found. Please connect a camera and microphone to continue.");
      }

      // Try to request both camera and microphone
      let stream: MediaStream | null = null;
      
      if (hasVideoInput && hasAudioInput) {
        // Try both
        try {
          stream = await navigator.mediaDevices.getUserMedia({ 
            video: true, 
            audio: true 
          });
        } catch (err: any) {
          // If both fail, try individually
          if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
            throw new Error("Camera or microphone not found. Please ensure they are connected and not being used by another application.");
          }
          throw err;
        }
      } else if (hasVideoInput) {
        // Only camera available
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: false 
        });
        setIsPermissionWarning(true);
        setPermissionError("⚠️ Microphone not detected. You can continue, but audio recording won't be available.");
      } else if (hasAudioInput) {
        // Only microphone available
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: false, 
          audio: true 
        });
        setIsPermissionWarning(true);
        setPermissionError("⚠️ Camera not detected. You can continue, but video recording won't be available.");
      }

      if (stream) {
        // Store the stream for camera
        cameraStreamRef.current = stream;
        const hasVideo = stream.getVideoTracks().length > 0;
        
        if (hasVideo) {
          setCameraOn(true);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        }
        
        setPermissionsGranted(true);
        return true;
      }
      
      return false;
    } catch (err: any) {
      console.error("Permission error:", err);
      
      let errorMessage = "Unable to access camera and microphone. ";
      
      if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage = "No camera or microphone found. Please ensure your devices are connected and not being used by another application.";
      } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage = "Permission denied. Please allow camera and microphone access in your browser settings and refresh the page.";
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage = "Camera or microphone is already in use by another application. Please close other applications and try again.";
      } else if (err.name === 'OverconstrainedError') {
        errorMessage = "Camera or microphone constraints not supported. Please check your device settings.";
      } else if (err.name === 'TypeError') {
        errorMessage = "Browser doesn't support camera/microphone access. Please use Chrome, Firefox, or Edge.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setPermissionError(errorMessage);
      setPermissionsGranted(false);
      setIsPermissionWarning(false);
      return false;
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      cameraStreamRef.current = stream;
      // Show the video element first, then attach the stream in effect below
      setCameraOn(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access denied", err);
      alert("Please allow camera access.");
    }
  };

  const stopCamera = () => {
    cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
    cameraStreamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOn(false);
  };

  const cleanupMediaDevices = () => {
    // Stop camera
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraOn(false);

    // Stop recording if active
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
      setIsRecording(false);
    }

    // Stop speech recognition if active
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    // Clear timers
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
    if (answerTimerRef.current) {
      clearInterval(answerTimerRef.current);
    }

    // Stop TTS
    stopTTS();
  };

  // Ensure the stream is attached once the video element is mounted (after cameraOn becomes true)
  useEffect(() => {
    if (cameraOn && videoRef.current && cameraStreamRef.current) {
      (videoRef.current as HTMLVideoElement).srcObject = cameraStreamRef.current;
    }
  }, [cameraOn]);

  // ====================== SPEECH RECOGNITION ======================
  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join("");
        setCurrentAnswer(transcript);
      };

      recognition.onerror = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, []);

  // ====================== ANSWER TIMER ======================
  useEffect(() => {
    if (answerStartTime) {
      answerTimerRef.current = setInterval(() => {
        setAnswerDuration(Math.floor((new Date().getTime() - answerStartTime.getTime()) / 1000));
      }, 1000);
    } else {
      if (answerTimerRef.current) clearInterval(answerTimerRef.current);
    }
    return () => {
      if (answerTimerRef.current) clearInterval(answerTimerRef.current);
    };
  }, [answerStartTime]);

  const startAnswerTimer = () => {
    if (!answerStartTime) {
      setAnswerStartTime(new Date());
      setAnswerDuration(0);
    }
  };

  const stopAnswerTimer = () => {
    setAnswerStartTime(null);
    setAnswerDuration(0);
    if (answerTimerRef.current) clearInterval(answerTimerRef.current);
  };

  // ====================== RECORDING ======================
  const startRecording = async () => {
    try {
      stopTTS();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
          setHasRecording(true);
        }
      };

      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      startAnswerTimer();
      setIsAnswering(true);

      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      // Automatically start live transcription when recording starts
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch (err) {
          console.warn("Speech recognition start failed:", err);
        }
      }
    } catch (error) {
      console.error("Recording error:", error);
      alert("Microphone access denied.");
    }
  };

  const transcribeAndInsert = async (blob: Blob) => {
  setIsTranscribing(true);
  try {
    const text = await transcribeVoiceToText(blob);
    setCurrentAnswer(prev => prev ? `${prev} ${text}` : text);
  } catch (e) {
    console.error(e);
    alert('Transcription failed – you can still type.');
  } finally {
    setIsTranscribing(false);
  }
};

  const stopRecording = () => {
  if (mediaRecorderRef.current && isRecording) {
    mediaRecorderRef.current.stop();
    mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
    setIsRecording(false);
    clearInterval(recordingTimerRef.current!);

    // Stop live transcription when recording stops
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
        setIsListening(false);
      } catch (err) {
        console.warn("Speech recognition stop failed:", err);
      }
    }

    // Save the audio blob for the feedback page
    if (audioChunksRef.current.length) {
      const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      
      // Store blob reference for current answer (will be saved with handleNextQuestion)
      // Note: We're using live transcription now, so manual transcription is backup only
    }
  }
};

  const startListening = () => {
    if (recognitionRef.current) {
      stopTTS();
      recognitionRef.current.start();
      setIsListening(true);
      setIsAnswering(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // ====================== TTS: EDGE + BROWSER FALLBACK ======================
  const browserSpeakQuestion = (text: string) => {
    console.log("TTS: Using Browser Web Speech API (fallback)");
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 0.9;

    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find((v) => v.lang.startsWith("en") && v.name.includes("Neural")) ||
                     voices.find((v) => v.lang.startsWith("en"));
    if (preferred) utterance.voice = preferred;

    utterance.onstart = () => {
      setIsUsingBrowserTts(true);
      setIsAvatarSpeaking(true);
      setTtsState("speaking");
    };

    utterance.onend = () => {
      setQuestionSpoken(true);
      setTtsState("idle");
      setIsUsingBrowserTts(false);
    };

    utterance.onerror = () => {
      setTtsState("idle");
      setIsUsingBrowserTts(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const speakQuestion = async (text: string) => {
    if (!interviewStarted) {
      console.warn("TTS blocked: Interview not started");
      return;
    }

    console.log("TTS: Using Edge-TTS (API)");
    setIsUsingBrowserTts(false);
    setTtsState("speaking");
    setIsAvatarSpeaking(true);

    try {
      // Reset audio element completely before loading new audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        // Remove old src to ensure clean state
        audioRef.current.src = "";
        audioRef.current.load();
      }

      const res = await fetch("/api/edge-tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice: "en-US-AriaNeural" }),
      });

      if (!res.ok) throw new Error("Edge-TTS failed");

      const blob = await res.blob();
      
      // Check if blob is valid (Edge TTS succeeded)
      if (!blob || blob.size === 0) {
        throw new Error("Edge-TTS returned empty audio");
      }

      const url = URL.createObjectURL(blob);

      if (!audioRef.current) throw new Error("Audio element missing");

      // Edge TTS succeeded - we have a valid audio blob
      // Set up audio element - wait for audio to fully load before playing to avoid skipping words
      const audio = audioRef.current;
      audio.preload = "auto";
      
      // Wait for audio to be ready before playing to prevent skipping words at the start
      // Set up event listeners BEFORE setting src to avoid race conditions
      await new Promise<void>((resolve, reject) => {
        if (!audio) {
          reject(new Error("Audio element missing"));
          return;
        }

        let resolved = false;
        
        // Wait for audio to have enough data to play without skipping
        const onCanPlayThrough = () => {
          if (resolved) return;
          resolved = true;
          audio.removeEventListener("canplaythrough", onCanPlayThrough);
          audio.removeEventListener("loadeddata", onLoadedData);
          audio.removeEventListener("error", onError);
          resolve();
        };

        const onLoadedData = () => {
          // Alternative: if canplaythrough doesn't fire, loadeddata is acceptable for blob URLs
          if (resolved) return;
          if (audio.readyState >= 3) { // HAVE_FUTURE_DATA
            resolved = true;
            audio.removeEventListener("canplaythrough", onCanPlayThrough);
            audio.removeEventListener("loadeddata", onLoadedData);
            audio.removeEventListener("error", onError);
            resolve();
          }
        };

        const onError = (error: Event) => {
          if (resolved) return;
          resolved = true;
          audio.removeEventListener("canplaythrough", onCanPlayThrough);
          audio.removeEventListener("loadeddata", onLoadedData);
          audio.removeEventListener("error", onError);
          reject(error);
        };

        // Add listeners BEFORE setting src to avoid missing events
        audio.addEventListener("canplaythrough", onCanPlayThrough);
        audio.addEventListener("loadeddata", onLoadedData);
        audio.addEventListener("error", onError);

        // Now set src - this will trigger the loading
        audio.src = url;
        // Ensure we start from the beginning
        audio.currentTime = 0;

        // Fallback timeout (shouldn't happen with blob URLs, but just in case)
        setTimeout(() => {
          if (!resolved && audio.readyState >= 2) { // HAVE_CURRENT_DATA minimum
            resolved = true;
            audio.removeEventListener("canplaythrough", onCanPlayThrough);
            audio.removeEventListener("loadeddata", onLoadedData);
            audio.removeEventListener("error", onError);
            resolve();
          }
        }, 2000);
      });
      
      audioRef.current.onended = () => {
        URL.revokeObjectURL(url);
        setQuestionSpoken(true);
        setTtsState("idle");
        setIsAvatarSpeaking(false);
      };
      
      audioRef.current.onerror = (error) => {
        // Edge TTS already succeeded (we have a valid blob)
        // Audio element error is likely a playback/decoding issue, not an Edge TTS failure
        // Don't trigger browser TTS fallback to avoid both voices speaking
        URL.revokeObjectURL(url);
        console.warn("TTS: Edge-TTS audio playback error (audio was generated successfully)");
        setTtsState("idle");
        setIsAvatarSpeaking(false);
        setQuestionSpoken(true);
      };
      
      // Now play the audio - it should be fully loaded and ready
      try {
        // Double-check we're at the start before playing
        if (audioRef.current.currentTime > 0) {
          audioRef.current.currentTime = 0;
        }
        await audioRef.current.play();
      } catch (playError) {
        // Autoplay restriction or other playback error
        // But Edge TTS succeeded, so don't fallback - audio is ready for manual play
        console.warn("TTS: Audio play() failed (may be autoplay restriction), but Edge TTS succeeded:", playError);
        setTtsState("idle");
        setIsAvatarSpeaking(false);
      }
    } catch (e) {
      // Only fallback if Edge TTS API call itself failed
      console.log("TTS: Edge-TTS API failed → fallback to Browser TTS", e);
      browserSpeakQuestion(text);
    }
  };

  const pauseTTS = () => {
    if (!isUsingBrowserTts && audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setTtsState("paused");
      setIsAvatarSpeaking(false);
    } else if (isUsingBrowserTts && "speechSynthesis" in window) {
      window.speechSynthesis.pause();
      setTtsState("paused");
      setIsAvatarSpeaking(false);
    }
  };

  const resumeTTS = () => {
    if (!isUsingBrowserTts && audioRef.current && audioRef.current.paused) {
      audioRef.current.play();
      setTtsState("speaking");
      setIsAvatarSpeaking(true);
    } else if (isUsingBrowserTts && "speechSynthesis" in window) {
      window.speechSynthesis.resume();
      setTtsState("speaking");
      setIsAvatarSpeaking(true);
    }
  };

  const stopTTS = () => {
    if (!isUsingBrowserTts && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (isUsingBrowserTts && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setTtsState("idle");
    setIsAvatarSpeaking(false);
  };

  const toggleTTS = (text: string) => {
    if (!interviewStarted) {
      console.warn("TTS blocked: Click 'Start Interview' first");
      return;
    }
    if (ttsState === "idle") speakQuestion(text);
    else if (ttsState === "speaking") pauseTTS();
    else if (ttsState === "paused") resumeTTS();
  };

  // Auto-start TTS when interview begins
  useEffect(() => {
    if (interviewStarted && session?.questions[session.currentQuestion]?.question) {
      const q = session.questions[session.currentQuestion].question;
      speakQuestion(q);
    }
  }, [interviewStarted, session?.currentQuestion]);

  // Cleanup media devices on component unmount
  useEffect(() => {
    return () => {
      cleanupMediaDevices();
    };
  }, []);

  // ====================== NAVIGATION ======================
  const handleNextQuestion = async () => {
    if (!session) return;
    stopTTS();

    let finalAnswer = currentAnswer;
    let audioBlob = null;
    
    // Create audio blob from recorded chunks if available
    if (audioChunksRef.current.length > 0) {
      audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      
      // If no text answer yet, try to transcribe
      if (!currentAnswer.trim()) {
        setIsTranscribing(true);
        try {
          const text = await transcribeVoiceToText(audioBlob);
          if (text.trim()) {
            finalAnswer = text;
            setCurrentAnswer(text);
          }
        } catch (error) {
          console.error("Transcription failed:", error);
          alert("Auto-transcription failed.");
        } finally {
          setIsTranscribing(false);
        }
      }
    }

    const newAnswer = {
      question: session.questions[session.currentQuestion].question,
      answer: finalAnswer,
      audioBlob: audioBlob, // Save the blob for feedback page
      timestamp: new Date(),
    };

    const updated = {
      ...session,
      answers: [...session.answers, newAnswer],
    };

    if (session.currentQuestion < session.totalQuestions - 1) {
      // Stop any active transcription before moving to next question
      if (recognitionRef.current && isListening) {
        try {
          recognitionRef.current.stop();
          setIsListening(false);
        } catch (err) {
          console.warn("Speech recognition stop failed:", err);
        }
      }

      setSession({ ...updated, currentQuestion: session.currentQuestion + 1 });
      setCurrentAnswer("");
      setQuestionSpoken(false);
      audioChunksRef.current = [];
      setHasRecording(false);
      stopAnswerTimer();
      setIsAnswering(false);
      // Ensure recording state fully reset so button text reverts to 'Record & Transcribe'
      if (isRecording) {
        stopRecording();
      }
      setIsTranscribing(false);
      setIsRecording(false);
    } else {
      // Interview finished - cleanup all media devices
      cleanupMediaDevices();
      
      const final = { ...updated, endTime: new Date().toISOString() };
      sessionStorage.setItem("mockInterviewSession", JSON.stringify(final));
      onNavigate ? onNavigate("feedback") : router.push("/candidate/candidate-dashboard/mock-interview/feedback");
    }
  };

  const endEarly = () => {
    // Cleanup all media devices before ending
    cleanupMediaDevices();
    
    const final = { ...session, endTime: new Date().toISOString() };
    sessionStorage.setItem("mockInterviewSession", JSON.stringify(final));
    onNavigate ? onNavigate("feedback") : router.push("/candidate/candidate-dashboard/mock-interview/feedback");
  };

  // ====================== RENDER ======================
  if (loading || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-purple-600" />
      </div>
    );
  }

  const currentQuestion = session.questions[session.currentQuestion];
  const progress = ((session.currentQuestion + 1) / session.totalQuestions) * 100;

  return (
    <div className="h-screen overflow-hidden">
      <div className="h-full overflow-y-auto">
        <div className="max-w-[1400px] mx-auto p-6">
          <audio ref={audioRef} hidden preload="auto" />

          <Card className="bg-white shadow-sm rounded-2xl">
            <CardContent className="p-6 space-y-8">
          {/* Header */}
          <div className="flex flex-row justify-between items-center gap-2">
            <div className="text-lg font-medium text-gray-700">
            <span className="font-semibold text-gray-800">Interview:</span>{" "}
            {session.selectedPosition?.title} ({session.selectedPosition?.level})
          </div>
          {!interviewStarted && (
              <div className="flex items-center justify-start gap-4">
                <div>
                  <div className="text-base font-semibold text-gray-700">Ready to start?</div>
                </div>
                <Button
                  onClick={async () => {
                    const granted = await requestPermissions();
                    if (granted) {
                      setInterviewStarted(true);
                    }
                  }}
                  className="w-fit px-4 bg-white py-2 rounded-md 
                border border-[#635BFF] text-[#635BFF] font-semibold 
                hover:bg-[#635BFF]/10 hover:text-[#524BCC] hover:border-[#524BCC] 
                focus:outline-none focus:ring-2 focus:ring-[#746CFF] focus:ring-opacity-75 
                transition ease-in-out duration-150 cursor-pointer"
   >
                  <Play className="w-4 h-4 mr-2" /> Start Interview
                </Button>
              </div>
          )}
          
        </div>
         
          {/* Permission Error */}
          {permissionError && (
            <div className={`${isPermissionWarning ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'} border rounded-xl p-4`}>
              <div className="flex items-start gap-3">
                <div className={`${isPermissionWarning ? 'text-yellow-600' : 'text-red-600'} mt-0.5`}>
                  {isPermissionWarning ? '⚠️' : '❌'}
                </div>
                <div className="flex-1">
                  <p className={`${isPermissionWarning ? 'text-yellow-800' : 'text-red-800'} font-semibold mb-1`}>
                    {isPermissionWarning ? 'Warning' : 'Permission Required'}
                  </p>
                  <p className={`${isPermissionWarning ? 'text-yellow-700' : 'text-red-700'} text-sm`}>
                    {permissionError}
                  </p>
                  {!isPermissionWarning && (
                    <Button
                      onClick={async () => {
                        const granted = await requestPermissions();
                        if (granted) {
                          setInterviewStarted(true);
                        }
                      }}
                      className="mt-3 bg-red-600 hover:bg-red-700 text-white"
                    >
                      Try Again
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Avatar + Camera */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="h-fit">
              <CardContent className="p-9 text-center">
                <div className="max-h-[300px] flex items-center justify-center">
                  <RealisticAvatar
                    isSpeaking={isAvatarSpeaking}
                    isListening={isListening || isRecording}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-2xl overflow-hidden h-fit">
                <CardContent className="p-5">
                  <div className="text-center">
                    {/* <h3 className="text-base font-semibold text-gray-800 mb-3">Your Camera</h3> */}
                    <div className="relative w-full aspect-video max-h-[200px] bg-gray-900 rounded-xl overflow-hidden shadow-lg">
                      {cameraOn ? (
                        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center justify-center w-full h-full text-gray-400">
                          <div className="text-4xl mb-2">📷</div>
                          <div className="text-sm">Camera Off</div>
                        </div>
                      )}
                      {cameraOn && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                          ● REC
                        </div>
                      )}
                    </div>
                    {/* FIXED: Camera button working properly */}
                    <Button 
                      variant={cameraOn ? "destructive" : "outline"} 
                      onClick={cameraOn ? stopCamera : startCamera}
                      className="mt-3 hover:cursor-pointer bg-gray-100 border border-gray-300 hover:bg-gray-200 text-gray-700 w-fit hover:text-gray-700"
                    >
                      {cameraOn ? "Stop Camera" : "Open your Camera"}
                      
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

          {!interviewStarted && (
            <div className="bg-gradient-to-r from-blue-50 to-gray-50 border border-blue-200 rounded-xl p-4">
              <p className="text-gray-700 text-center">
                <span className="font-semibold">Take a moment to prepare:</span> You'll be asked to grant camera and microphone permissions. Ensure you're in a quiet space before you start.
              </p>
            </div>
          )}

          {/* Question */}
          {interviewStarted && (
            <div className="space-y-6 mt-12">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#635BFF] rounded-xl flex items-center justify-center text-white font-bold">
                    {session.currentQuestion + 1}
                  </div>
                  <h3 className="text-lg font-semibold">
                    {currentQuestion.type === "technical" ? "Technical" :
                     currentQuestion.type === "behavioral" ? "Behavioral" :
                     "General"} Question
                  </h3>
                  {currentQuestion.difficulty && (
                    <span className={`px-2 rounded-full text-xs font-medium ${
                      currentQuestion.difficulty === "easy" ? "bg-green-100 text-green-700 border border-green-200" :
                      currentQuestion.difficulty === "medium" ? "bg-yellow-100 text-yellow-700 border border-yellow-200" :
                      "bg-red-100 text-red-700 border border-red-200"
                    }`}>
                      {currentQuestion.difficulty}
                    </span>
                  )}
                </div>
                <div className="text-base font-medium text-gray-600">
                  Question {session.currentQuestion + 1} of {session.totalQuestions}
                </div>
              </div>

              <div className="bg-[#635BFF]/5 p-5 rounded-xl border-l-3 border-l-[#635BFF]/80 border-t border-r border-b border-[#635BFF]/15 ">
                <p className="text-base text-gray-700 mb-3">{currentQuestion.question}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  {currentQuestion.expectedDuration && (
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {currentQuestion.expectedDuration} min
                    </span>
                  )}
                  <span className="flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    Take your time
                  </span>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => toggleTTS(currentQuestion.question)}
                    className="w-fit px-4 py-2 rounded-md 
                    border border-[#635BFF] text-[#635BFF] font-semibold 
                    hover:bg-[#635BFF]/10 hover:text-[#524BCC] hover:border-[#524BCC] 
                    cursor-pointer"
        >
                    {ttsState === "idle" ? (
                      <> <Play className="w-4 h-4 mr-2" /> Start Reading </>
                    ) : ttsState === "speaking" ? (
                      <> <Pause className="w-4 h-4 mr-2" /> Stop Reading </>
                    ) : (
                      <> <Play className="w-4 h-4 mr-2" /> Continue </>
                    )}
                  </Button>
                  {ttsState !== "idle" && (
                    <Button variant="ghost" onClick={stopTTS} className="hover:cursor-pointer text-gray-700 border border-gray-300 hover:bg-gray-100 bg-white">
                      <RotateCcw className="w-4 h-4 mr-2 " /> Reset
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Answer */}
          {interviewStarted && (
            <div className="space-y-4 mt-12">
              <div className="flex items-center justify-between">
                <label className="text-lg font-semibold">Your Answer:</label>
                <div className="flex items-center gap-3">
                  {isRecording && (
                    <div className="flex items-center gap-2 text-red-600 animate-pulse">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
                      <span className="text-sm">Recording {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, "0")}</span>
                    </div>
                  )}
                  {isListening && <span className="text-blue-600 animate-pulse text-sm">Listening...</span>}
                  {isTranscribing && (
                    <div className="flex items-center gap-2 text-green-600 animate-pulse">
                      <div className="animate-spin h-3 w-3 border-b-2 border-green-600 rounded-full" />
                      <span className="text-sm">Transcribing...</span>
                    </div>
                  )}
                  {answerStartTime && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <Button
                        variant="ghost"
                        onClick={() => setShowAnswerTimer((v) => !v)}
                        className="p-1 h-auto w-auto text-[#635BFF] hover:text-[#635BFF] hover:bg-transparent hover:cursor-pointer"
                        title={showAnswerTimer ? "Hide timer" : "Show timer"}
                      >
                        {showAnswerTimer ? <Eye className="w-7 h-7" /> : <EyeOff className="w-7 h-7" />}
                      </Button>
                      {showAnswerTimer && (
                        <>
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">
                            {Math.floor(answerDuration / 60)}:{(answerDuration % 60).toString().padStart(2, "0")}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                  {/* {questionSpoken && !isAnswering && (
                    <Button
                      onClick={() => setIsAnswering(true)}
                      className="w-fit px-4 py-2 rounded-md 
             border border-[#635BFF] text-[#635BFF] font-semibold 
             hover:bg-[#635BFF]/10 hover:text-[#524BCC] hover:border-[#524BCC] cursor-pointer bg-white"
                      disabled={isAnswering}
                    >
                      <Play className="w-4 h-4 mr-2" /> Start Answering
                    </Button>
                  )} */}
                </div>
              </div>

              <textarea
                value={currentAnswer}
                onChange={(e) => {
                  setCurrentAnswer(e.target.value);
                  if (e.target.value.length === 1 && !answerStartTime) startAnswerTimer();
                }}
                onFocus={() => {
                  if (!answerStartTime) startAnswerTimer();
                  setIsAnswering(true);
                }}
                placeholder="Type your answer or use voice..."
                className="w-full p-4 border rounded-xl h-30 resize-h focus:ring-1 focus:ring-[#635BFF]/30"
                disabled={!interviewStarted}
              />

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant={isRecording ? "destructive" : "outline"}
                  onClick={isRecording ? stopRecording : startRecording}
                  className="w-fit px-4 py-2 rounded-md 
                border border-[#635BFF] text-[#635BFF] font-semibold 
                hover:bg-[#635BFF]/10 hover:text-[#524BCC] hover:border-[#524BCC] cursor-pointer"
                >
                  {isRecording ? (
                    <> <MicOff className="w-4 h-4 mr-2" /> Stop Recording </>
                  ) : (
                    <> <Mic className="w-4 h-4 mr-2" /> Transcribe & Record Again </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-6">
            <Button variant="outline" onClick={endEarly} className="border-orange-500 text-orange-600 hover:cursor-pointer hover:bg-orange-50 hover:text-orange-600">
              <RotateCcw className="w-4 h-4 mr-2" /> End Early
            </Button>
            <Button
              onClick={handleNextQuestion}
              className="bg-[#635BFF] hover:bg-[#635BFF]/80 text-white hover:cursor-pointer"
            >
              {session.currentQuestion < session.totalQuestions - 1 ? "Next Question" : "Finish & Get Feedback"}
            </Button>
          </div>
        </CardContent>
      </Card>
        </div>
      </div>
    </div>
  );
};

export default MockInterviewProcessPage;