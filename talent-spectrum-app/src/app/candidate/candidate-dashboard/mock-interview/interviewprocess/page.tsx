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
  CheckCircle, 
  Clock, 
  Target, 
  Volume2, 
  Briefcase, 
  Star,
  Award,
  Search, 
  TrendingUp,
  Users,
  Brain,
  Code,
  MessageSquare,
  Mic,
  MicOff,
  Play,
  Pause,
  RotateCcw,
  ArrowUpWideNarrow 
} from "lucide-react";

type InterviewType = "general" | "technical" | "behavioral";

interface InterviewSession {
  currentQuestion: number;
  totalQuestions: number;
  positionLevel: string;
  startTime?: Date;
  answers: Array<{
    question: string;
    answer: string;
    audioBlob?: Blob;
    timestamp: Date;
  }>;
  selectedPosition?: JobPosition;
  interviewType: InterviewType;
  questions: InterviewQuestion[];
  accessibilitySettings?: {
    textOnly: boolean;
    highContrast: boolean;
    largeText: boolean;
  };
}

type EmbeddedNavTarget = "setup" | "interview" | "feedback";
interface EmbeddedNavProps { onNavigate?: (target: EmbeddedNavTarget) => void }

const MockInterviewProcessPage: React.FC<EmbeddedNavProps> = ({ onNavigate }) => {
  const router = useRouter();
  
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
    ], // FIXED: Only include 2 questions to match totalQuestions
    interviewType: "general" as const,
    totalQuestions: 2,
    positionLevel: "mid",
    startTime: new Date().toISOString(),
    currentQuestion: 0,
    answers: []
  };
  
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  
  // Accessibility settings
  const [accessibilitySettings, setAccessibilitySettings] = useState({
    textOnly: false,
    highContrast: false,
    largeText: false
  });

  // Enable camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraEnabled(true);
    } catch (err) {
      console.error("Camera access denied", err);
      alert("Please allow camera access to proceed.");
    }
  };
  
  // Stop camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraEnabled(false);
  };

  const [session, setSession] = useState<InterviewSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isAvatarSpeaking, setIsAvatarSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [questionSpoken, setQuestionSpoken] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [answerStartTime, setAnswerStartTime] = useState<Date | null>(null);
  const [answerDuration, setAnswerDuration] = useState(0);
  const [stage, setStage] = useState<"introduction" | "interview">("interview");
  
  // New states for enhanced interview experience
  const [isAnswering, setIsAnswering] = useState(false);
  const [countdownTime, setCountdownTime] = useState(0);
  const [showCountdown, setShowCountdown] = useState(false);
  const [estimatedDuration, setEstimatedDuration] = useState(0);
  const [questionReadComplete, setQuestionReadComplete] = useState(false);
  const [isFirstQuestion, setIsFirstQuestion] = useState(true); // NEW: Track if it's the first question
  const [initialCountdownShown, setInitialCountdownShown] = useState(false); // NEW: Track if initial countdown was shown

  // Recording and speech recognition
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<any>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const answerTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const sessionData = sessionStorage.getItem('mockInterviewSession');
    if (sessionData) {
      try {
        const parsedData = JSON.parse(sessionData);
        setSession({
          ...parsedData,
          currentQuestion: parsedData.currentQuestion || 0,
          answers: parsedData.answers || [],
          startTime: new Date(parsedData.startTime)
        });
        console.log('✅ Loaded session data from storage');
      } catch (error) {
        console.error('❌ Error parsing session data:', error);
        // Fallback to mock data
        setSession({
          ...mockSessionData,
          startTime: new Date(mockSessionData.startTime)
            });
          }
        } else {
          // Use mock data for testing
          console.log('📝 Using mock data for testing');
          setSession({
            ...mockSessionData,
            startTime: new Date(mockSessionData.startTime)
          });
        }
    
    setLoading(false);
    
    // FIXED: Show initial countdown for first question only, then speak question
    if (!initialCountdownShown) {
      setInitialCountdownShown(true);
      setCountdownTime(3);
      setShowCountdown(true);
    }
  }, [router]);

  // Load accessibility settings
  useEffect(() => {
    const sessionData = sessionStorage.getItem('mockInterviewSession');
    if (sessionData) {
      try {
        const parsedData = JSON.parse(sessionData);
        if (parsedData.accessibilitySettings) {
          setAccessibilitySettings(parsedData.accessibilitySettings);
        }
      } catch (error) {
        console.error('Error loading accessibility settings:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        
        setCurrentAnswer(transcript);
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }
  }, []);

  // Answer timer effect
  useEffect(() => {
    if (answerStartTime) {
      answerTimerRef.current = setInterval(() => {
        setAnswerDuration(Math.floor((new Date().getTime() - answerStartTime.getTime()) / 1000));
      }, 1000);
    } else {
      if (answerTimerRef.current) {
        clearInterval(answerTimerRef.current);
      }
    }

    return () => {
      if (answerTimerRef.current) {
        clearInterval(answerTimerRef.current);
      }
    };
  }, [answerStartTime]);

  // FIXED: Countdown timer effect - speak question after initial countdown
  useEffect(() => {
    if (showCountdown && countdownTime > 0) {
      countdownTimerRef.current = setInterval(() => {
        setCountdownTime(prev => {
          if (prev <= 1) {
            setShowCountdown(false);
            // FIXED: Only speak question after initial countdown for first question
            if (isFirstQuestion && session) {
              const firstQuestion = session.questions[0];
              if (firstQuestion) {
                setTimeout(() => speakQuestion(firstQuestion.question), 500);
              }
              setIsFirstQuestion(false);
            } else {
              // For subsequent questions, just enable answering
              setIsAnswering(true);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    }

    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, [showCountdown, countdownTime, isFirstQuestion, session]);

  // Function to start answer timer
  const startAnswerTimer = () => {
    if (!answerStartTime) {
      setAnswerStartTime(new Date());
      setAnswerDuration(0);
    }
  };

  // Function to stop answer timer
  const stopAnswerTimer = () => {
    setAnswerStartTime(null);
    setAnswerDuration(0);
    if (answerTimerRef.current) {
      clearInterval(answerTimerRef.current);
    }
  };

  // Handle answer submission and move to next question
  const handleNextQuestion = async () => {
    if (!session) return;
    
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
    
    const currentQ = session.questions[session.currentQuestion];
    
    // Transcribe voice if audio was recorded and no text answer
    let finalAnswer = currentAnswer;
    if (audioChunksRef.current.length > 0 && !currentAnswer.trim()) {
      setIsTranscribing(true);
      try {
        console.log('🎤 Auto-transcribing recorded audio with Whisper...');
        const audioBlob = audioChunksRef.current[0];
        const transcribedText = await transcribeVoiceToText(audioBlob);
        
        if (transcribedText.trim()) {
          finalAnswer = transcribedText;
          setCurrentAnswer(transcribedText); // Update UI to show transcribed text
          console.log('✅ Auto-transcription completed');
          
          // Brief pause to show the transcribed text
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error('Auto-transcription failed:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        // Show brief error notification but continue
        const errorNotification = document.createElement('div');
        errorNotification.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
        errorNotification.textContent = `⚠️ Auto-transcription failed: ${errorMessage}`;
        document.body.appendChild(errorNotification);
        setTimeout(() => {
          if (document.body.contains(errorNotification)) {
            document.body.removeChild(errorNotification);
          }
        }, 5000);
      } finally {
        setIsTranscribing(false);
      }
    }
    
    const answerData = {
      question: currentQ?.question || "",
      answer: finalAnswer,
      audioBlob: audioChunksRef.current.length > 0 ? audioChunksRef.current[0] : undefined,
      timestamp: new Date()
    };

    const newAnswers = [...session.answers, answerData];
    setCurrentAnswer("");
    setQuestionSpoken(false);
    audioChunksRef.current = [];
    setHasRecording(false);
    stopAnswerTimer();
    
    if (session.currentQuestion < session.totalQuestions - 1) {
      setSession(prev => prev ? ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1,
        answers: newAnswers
      }) : null);
      resetQuestionState();
      // FIXED: Auto-speak the next question immediately without delay
      setTimeout(() => {
        const nextQuestion = session.questions[session.currentQuestion + 1];
        if (nextQuestion) {
          speakQuestion(nextQuestion.question);
        }
      }, 500); // Reduced delay
    } else {
      // Store final answers and navigate to feedback
      const finalSessionData = {
        ...session,
        answers: newAnswers
      };
      sessionStorage.setItem('mockInterviewSession', JSON.stringify(finalSessionData));
        if (onNavigate) {
          onNavigate("feedback");
        } else {
          router.push('/candidate/candidate-dashboard/mock-interview/feedback');
        }
    }
  };

  // Voice recording functions
  const startRecording = async () => {
    try {
      // Stop any ongoing speech when user starts recording
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
        console.log('🔇 Stopped TTS for recording');
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          setHasRecording(true);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start answer timer when recording begins
      startAnswerTimer();
      
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error("Error starting recording:", error);
      alert("Could not start recording. Please check microphone permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
  };

  const startListening = () => {
    if (recognitionRef.current) {
      // Stop any ongoing speech when user starts live transcription
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
        console.log('🔇 Stopped TTS for live transcription');
      }
      
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      setIsListening(false);
      recognitionRef.current.stop();
    }
  };

  const handleQuestionSpoken = () => {
    setIsAvatarSpeaking(false);
    setQuestionSpoken(true);
    setQuestionReadComplete(true);
  };

  // FIXED: Start answering process with countdown (only for subsequent questions)
  const startAnswering = () => {
    if (!questionReadComplete) {
      alert("Please wait for the AI interviewer to finish reading the question.");
      return;
    }
    
    const currentQuestion = session?.questions[session.currentQuestion];
    const duration = currentQuestion?.expectedDuration || 3;
    setEstimatedDuration(duration * 60); // Convert to seconds
    setCountdownTime(3); // 3-second countdown
    setShowCountdown(true);
  };

  // FIXED: Speak question using Text-to-Speech (no delay issues)
  const speakQuestion = (questionText: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech to prevent overlap
      speechSynthesis.cancel();
      
      // Small delay to ensure cancel is processed
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(questionText);
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 0.8;
        
        // Find a suitable voice
        const voices = speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice => 
          voice.lang.startsWith('en') && 
          (voice.name.includes('Female') || voice.name.includes('Neural') || voice.name.includes('Natural'))
        ) || voices.find(voice => voice.lang.startsWith('en'));
        
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
        
        utterance.onstart = () => {
          setIsAvatarSpeaking(true);
        };
        
        utterance.onend = () => {
          handleQuestionSpoken();
        };
        
        utterance.onerror = () => {
          handleQuestionSpoken();
        };
        
        speechSynthesis.speak(utterance);
      }, 100);
    } else {
      // Fallback if speech synthesis is not available
      setTimeout(() => {
        handleQuestionSpoken();
      }, 2000);
    }
  };

  // Reset question state for new question
  const resetQuestionState = () => {
    setQuestionSpoken(false);
    setQuestionReadComplete(false);
    setIsAnswering(false);
    setShowCountdown(false);
    setCountdownTime(0);
    setEstimatedDuration(0);
  };

  if (loading || !session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading interview...</p>
        </div>
      </div>
    );
  }

  // Enhanced Interview Stage
  const renderInterview = () => {
    const currentQuestion = session.questions[session.currentQuestion];
    const progress = ((session.currentQuestion + 1) / session.totalQuestions) * 100;
    
    return (
      <div className={`min-h-screen transition-colors duration-300 ${
        accessibilitySettings.highContrast 
          ? "bg-white text-black" 
          : "bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"
      }`}>
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-[1400px] mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">AI</span>
                </div>
                <h1 className={`font-bold text-gray-900 ${
                  accessibilitySettings.largeText ? "text-2xl" : "text-xl"
                }`}>
                  Interview with Sarah Chen
                </h1>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>{session.selectedPosition?.title || "Frontend Developer"} • {session.selectedPosition?.level || "Mid-level"}</span>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Live</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-[1400px] mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Side - Avatar */}
            <div className="lg:col-span-1">
              <Card className="bg-white shadow-lg border-0 rounded-2xl overflow-hidden">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="relative mb-4">
                      {!accessibilitySettings.textOnly && (
                        <RealisticAvatar 
                          isSpeaking={isAvatarSpeaking}
                          isListening={isListening || isRecording}
                          onStartListening={startListening}
                          onStopListening={stopListening}
                          currentQuestion={currentQuestion?.question}
                          onQuestionComplete={handleQuestionSpoken}
                          size="large"
                        />
                      )}
                      <div className="absolute bottom-2 left-2 bg-white rounded-full px-2 py-1 text-xs font-medium text-gray-600 shadow">
                        Sarah Chen
                      </div>
                      <div className="absolute bottom-2 right-2 bg-white rounded-full px-2 py-1 text-xs font-medium text-gray-600 shadow">
                        Your AI Interviewer
                      </div>
                    </div>
                    
                    {!questionReadComplete && currentQuestion && (
                      <div className="text-center">
                        <div className="animate-pulse text-blue-600 text-sm mb-2">
                          🎤 Reading question aloud...
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Candidate Camera */}
              <Card className="mt-6 bg-white shadow-lg border-0 rounded-2xl overflow-hidden">
                <CardContent className="p-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Camera</h3>
                    <div className="relative w-full aspect-video bg-gray-900 rounded-xl overflow-hidden shadow-lg">
                      {cameraEnabled ? (
                        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center justify-center w-full h-full text-gray-400">
                          <div className="text-4xl mb-2">📷</div>
                          <div className="text-sm">Camera Off</div>
                        </div>
                      )}
                      {cameraEnabled && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                          ● REC
                        </div>
                      )}
                    </div>
                    {/* FIXED: Camera button working properly */}
                    <Button 
                      variant={cameraEnabled ? "destructive" : "outline"} 
                      onClick={cameraEnabled ? stopCamera : startCamera}
                      className="mt-3 w-full"
                    >
                      {cameraEnabled ? "Stop Camera" : "Open Camera"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Side - Interview Content */}
            <div className="lg:col-span-2">
              <Card className="bg-white shadow-lg border-0 rounded-2xl">
                <CardContent className="p-8">
                  {/* Ready to begin section - only show if question is read but not started answering */}
                  {questionReadComplete && !isAnswering && !showCountdown && (
                    <div className="text-center mb-8">
                      <div className="bg-blue-50 rounded-2xl p-8 mb-6">
                        <div className="flex items-center justify-center mb-4">
                          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                            <MessageSquare className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        <h2 className={`font-bold text-gray-900 mb-4 ${
                          accessibilitySettings.largeText ? "text-3xl" : "text-2xl"
                        }`}>
                          Ready to begin?
                        </h2>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                          Hello! I'm Sarah, your guide for this interview. We'll go through a few questions to understand your skills. Take your time, and let's have a great conversation. Click "Start Answering" when you're ready.
                        </p>
                        <div className="flex items-center justify-center space-x-6 text-sm text-gray-500 mb-6">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span>Estimated Duration: 15 minutes</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Target className="w-4 h-4" />
                            <span>{session.totalQuestions} questions</span>
                          </div>
                        </div>
                        <Button
                          onClick={startAnswering}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl shadow-lg animate-pulse"
                        >
                          <Play className="w-5 h-5 mr-2" />
                          Start Answering
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Countdown Overlay */}
                  {showCountdown && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                      <div className="bg-white rounded-2xl p-12 text-center shadow-2xl">
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">
                          {isFirstQuestion ? "Interview Starting!" : "Get Ready!"}
                        </h3>
                        <div className="text-8xl font-bold text-blue-600 mb-4 animate-pulse">
                          {countdownTime}
                        </div>
                        <p className="text-gray-600">
                          {isFirstQuestion ? "Your interview will begin shortly..." : "Starting your answer session..."}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Progress Section */}
                  <div className="mb-8 bg-gray-50 rounded-xl p-6">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium text-gray-600">Interview Progress</span>
                      <span className="text-sm font-medium text-gray-600">
                        Question {session.currentQuestion + 1} of {session.totalQuestions}
                      </span>
                    </div>
                    <Progress value={progress} className="mb-3 h-3" />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Estimated time remaining: {(session.totalQuestions - session.currentQuestion - 1) * 2} minutes</span>
                      <span>{Math.round(progress)}% complete</span>
                    </div>
                  </div>

                  {/* Question Section */}
                  <div className="mb-8">
                    <div className="flex items-start space-x-4 mb-6">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-lg">
                          {session.currentQuestion + 1}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-3">
                          <h3 className={`font-semibold text-gray-800 ${
                            accessibilitySettings.largeText ? "text-2xl" : "text-xl"
                          }`}>
                            {currentQuestion?.type === 'technical' ? '💻 Technical Question' :
                            currentQuestion?.type === 'behavioral' ? '🧠 Behavioral Question' :
                            '👤 General Question'}
                          </h3>
                          {currentQuestion?.difficulty && (
                            <span className={`
                              px-3 py-1 rounded-full text-xs font-medium
                              ${currentQuestion.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                                currentQuestion.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'}
                            `}>
                              {currentQuestion.difficulty}
                            </span>
                          )}
                        </div>
                        
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border-l-4 border-blue-500 shadow-sm">
                          <p className={`text-gray-700 leading-relaxed mb-3 ${
                            accessibilitySettings.largeText ? "text-xl" : "text-lg"
                          }`}>
                            {currentQuestion?.question || "Loading question..."}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              {currentQuestion?.expectedDuration && (
                                <span className="flex items-center">
                                  <Clock className="w-4 h-4 mr-1" />
                                  Expected time: {currentQuestion.expectedDuration} min
                                </span>
                              )}
                              <span className="flex items-center">
                                <TrendingUp className="w-4 h-4 mr-1" />
                                Take your time to think
                              </span>
                            </div>
                          </div>
                          
                          {/* Auto-speak button for manual trigger */}
                          {!isAvatarSpeaking && !questionReadComplete && (
                            <div className="mt-3">
                              <Button
                                onClick={() => speakQuestion(currentQuestion?.question || "")}
                                variant="outline"
                                className="text-blue-600 border-blue-200 hover:bg-blue-50"
                              >
                                <Volume2 className="w-4 h-4 mr-2" />
                                Hear Question Again
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* FIXED: Answer Input Section - Always show text box */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <label className={`font-medium text-gray-700 ${
                        accessibilitySettings.largeText ? "text-xl" : "text-lg"
                      }`}>
                        Your Answer
                      </label>
                      <div className="flex items-center space-x-3">
                        {estimatedDuration > 0 && (
                          <div className="flex items-center space-x-2 text-blue-600">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              Estimated: {Math.floor(estimatedDuration / 60)}:{(estimatedDuration % 60).toString().padStart(2, '0')}
                            </span>
                          </div>
                        )}
                        {isRecording && (
                          <div className="flex items-center space-x-2 text-red-600 animate-pulse">
                            <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                            <span className="text-sm font-medium">Recording {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}</span>
                          </div>
                        )}
                        {isListening && (
                          <span className="text-blue-600 animate-pulse text-sm font-medium">🎤 Listening...</span>
                        )}
                        {isTranscribing && (
                          <div className="flex items-center space-x-2 text-green-600 animate-pulse">
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-600"></div>
                            <span className="text-sm font-medium">🤖 Transcribing with AI...</span>
                          </div>
                        )}
                        {answerStartTime && (
                          <div className="flex items-center space-x-2 text-purple-600">
                            <Clock className="w-3 h-3" />
                            <span className="text-sm font-medium">Answer time: {Math.floor(answerDuration / 60)}:{(answerDuration % 60).toString().padStart(2, '0')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  
                    {/* FIXED: Text box always shown and timer starts when clicked */}
                    <textarea
                      value={currentAnswer}
                      onChange={(e) => {
                        setCurrentAnswer(e.target.value);
                        // Start timer when user begins typing
                        if (e.target.value.length === 1 && !answerStartTime) {
                          startAnswerTimer();
                        }
                      }}
                      onFocus={() => {
                        // FIXED: Start timer when text box is clicked/focused
                        if (!answerStartTime) {
                          startAnswerTimer();
                        }
                      }}
                      placeholder="Type your answer here or use voice recording below..."
                      className={`w-full p-4 border border-gray-300 rounded-xl h-40 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-white shadow-sm ${
                        accessibilitySettings.largeText ? "text-lg" : ""
                      }`}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Bottom Controls - Recording and Navigation - Always show */}
          <Card className="mt-8 bg-white shadow-lg border-0 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                {/* Voice Controls */}
                <div className="flex items-center space-x-3">
                  <Button
                    variant={isRecording ? "destructive" : "outline"}
                    onClick={isRecording ? stopRecording : startRecording}
                    className="min-w-[120px]"
                  >
                    {isRecording ? (
                      <>
                        <MicOff className="w-4 h-4 mr-2" />
                        Stop Recording
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4 mr-2" />
                        Record Answer
                      </>
                    )}
                  </Button>
                
                  <Button
                    variant="outline"
                    onClick={isListening ? stopListening : startListening}
                    className="min-w-[120px]"
                  >
                    {isListening ? (
                      <>
                        <Pause className="w-4 h-4 mr-2" />
                        Stop Listening
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Live Transcribe
                      </>
                    )}
                  </Button>

                  {/* Whisper Transcription Button */}
                  {hasRecording && (
                    <Button
                      variant="outline"
                      onClick={async () => {
                        setIsTranscribing(true);
                        try {
                          console.log('🎤 Manual Whisper transcription...');
                          const audioBlob = audioChunksRef.current[0];
                          const transcribedText = await transcribeVoiceToText(audioBlob);
                          
                          if (transcribedText.trim()) {
                            setCurrentAnswer(prev => prev + (prev ? ' ' : '') + transcribedText);
                            console.log('✅ Manual transcription completed');
                            
                            // Show success feedback
                            const successMessage = document.createElement('div');
                            successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
                            successMessage.textContent = '✅ Audio transcribed successfully!';
                            document.body.appendChild(successMessage);
                            setTimeout(() => document.body.removeChild(successMessage), 3000);
                          } else {
                            alert('No speech detected in the audio. Please try recording again.');
                          }
                        } catch (error) {
                          console.error('❌ Manual transcription failed:', error);
                          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                          alert(`Transcription failed: ${errorMessage}\n\nTroubleshooting:\n- Check your internet connection\n- Ensure audio was recorded\n- Verify OpenAI API key is configured`);
                        } finally {
                          setIsTranscribing(false);
                        }
                      }}
                      disabled={isTranscribing}
                      className="min-w-[120px] border-green-200 text-green-600 hover:bg-green-50"
                    >
                      {isTranscribing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
                          Transcribing...
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-4 h-4 mr-2" />
                          Transcribe Audio
                        </>
                      )}
                    </Button>
                  )}
                </div>
                
                {/* Navigation Controls */}
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    className="border-orange-500 text-orange-600 hover:bg-orange-50"
                    onClick={() => {
                      // Stop any ongoing speech
                      if (speechSynthesis.speaking) {
                        speechSynthesis.cancel();
                      }
                      
                      // Store current answers and navigate to feedback
                      const finalSessionData = {
                        ...session,
                        answers: session.answers
                      };
                      sessionStorage.setItem('mockInterviewSession', JSON.stringify(finalSessionData));
    if (onNavigate) {
      onNavigate("feedback");
    } else {
      router.push('/candidate/candidate-dashboard/mock-interview/feedback');
    }
                    }}
                    disabled={isGeneratingFeedback}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    {isGeneratingFeedback ? "Generating Feedback..." : "End Early"}
                  </Button>

                  <Button
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl shadow-lg transition-all duration-200"
                    onClick={handleNextQuestion}
                    disabled={isGeneratingFeedback}
                  >
                    {isGeneratingFeedback ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Generating AI Feedback...
                      </>
                    ) : (
                      session.currentQuestion < session.totalQuestions - 1 ? "Next Question" : "Finish & Get AI Feedback"
                    )}
                  </Button>
                </div>
              </div>

              <div className="mt-4 text-center text-xs text-gray-500">
                💡 Tip: Use the STAR method (Situation, Task, Action, Result) for behavioral questions
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <div>
      {renderInterview()}
    </div>
  );
};

export default MockInterviewProcessPage;
