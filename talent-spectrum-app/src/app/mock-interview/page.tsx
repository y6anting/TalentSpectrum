  "use client";

  import React, { useState, useEffect, useRef } from "react";
  import Link from "next/link";
  import { Button } from "@/app/components/button";
  import { Card, CardContent } from "@/app/components/card";
  import { Progress } from "@/app/components/progress";
  import RealisticAvatar from "@/app/components/RealisticAvatar";
  import { 
    generateInterviewQuestions, 
    jobPositions, 
    InterviewQuestion, 
    JobPosition,
    generateAIFeedback
  } from "@/services/interviewService";
  import { 
    CheckCircle, 
    Clock, 
    Target, 
    Volume2, 
    Briefcase, 
    Star,
    Award,
    TrendingUp,
    Users,
    Brain,
    Code,
    MessageSquare,
    Mic,
    MicOff,
    Play,
    Pause,
    RotateCcw
  } from "lucide-react";

  // Types
  type InterviewType = "general" | "technical" | "behavioral";
  type InterviewStage = "setup" | "introduction" | "interview" | "feedback";

  interface InterviewSession {
    stage: InterviewStage;
    currentQuestion: number;
    totalQuestions: number;
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
    feedback?: string;
  }

  const MockInterviewPage = () => {
    const [session, setSession] = useState<InterviewSession>({
      stage: "setup",
      currentQuestion: 0,
      totalQuestions: 5,
      answers: [],
      interviewType: "general",
      questions: []
    });

    const [loading, setLoading] = useState(false);
    const [currentAnswer, setCurrentAnswer] = useState("");
    const [selectedPositionId, setSelectedPositionId] = useState("");
    const [customJobDescription, setCustomJobDescription] = useState("");
    const [isAvatarSpeaking, setIsAvatarSpeaking] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [questionSpoken, setQuestionSpoken] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);

    // Recording and speech recognition
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recognitionRef = useRef<any>(null);
    const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

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

    // Generate questions and start interview
    const handleStartInterview = async () => {
      const selectedPosition = selectedPositionId 
        ? jobPositions.find(pos => pos.title === selectedPositionId)
        : null;

      if (!selectedPosition && !customJobDescription.trim()) {
        alert("Please select a position or enter a custom job description!");
        return;
      }

      setLoading(true);
      try {
        const jobToUse = selectedPosition || {
          title: "Custom Position",
          description: customJobDescription,
          requirements: ["Communication", "Problem Solving", "Teamwork"],
          level: "mid" as const,
          industry: "General"
        };

        const generatedQuestions = await generateInterviewQuestions(
          jobToUse,
          session.interviewType,
          session.totalQuestions
        );
        
        setSession(prev => ({
          ...prev,
          stage: "introduction",
          selectedPosition: jobToUse,
          questions: generatedQuestions,
          startTime: new Date()
        }));
      } catch (error) {
        console.error("Failed to generate questions:", error);
        alert("Failed to generate questions. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    // Handle answer submission and move to next question
    const handleNextQuestion = async () => {
      const currentQ = session.questions[session.currentQuestion];
      const answerData = {
        question: currentQ?.question || "",
        answer: currentAnswer,
        audioBlob: audioChunksRef.current.length > 0 ? audioChunksRef.current[0] : undefined,
        timestamp: new Date()
      };

      const newAnswers = [...session.answers, answerData];
      setCurrentAnswer("");
      setQuestionSpoken(false);
      audioChunksRef.current = [];
      
      if (session.currentQuestion < session.totalQuestions - 1) {
        setSession(prev => ({
          ...prev,
          currentQuestion: prev.currentQuestion + 1,
          answers: newAnswers
        }));
      } else {
        // Generate AI feedback before moving to feedback stage
        setIsGeneratingFeedback(true);
        try {
          const feedback = await generateAIFeedback(
            session.selectedPosition!,
            session.interviewType,
            newAnswers
          );
          
          setSession(prev => ({
            ...prev,
            stage: "feedback",
            answers: newAnswers,
            feedback
          }));
        } catch (error) {
          console.error("Failed to generate feedback:", error);
          setSession(prev => ({
            ...prev,
            stage: "feedback",
            answers: newAnswers,
            feedback: "Thank you for completing the interview! Keep practicing to improve your skills."
          }));
        } finally {
          setIsGeneratingFeedback(false);
        }
      }
    };

    // Voice recording functions
    const startRecording = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.start();
        setIsRecording(true);
        setRecordingTime(0);
        
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
    };

    // Enhanced Setup Stage with Better Position Selection
    const renderSetup = () => (
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-lg">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            AI Mock Interview
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Practice with AI-generated questions, realistic avatar interaction, and get personalized feedback to ace your next interview
          </p>
        </div>

        {/* Main Setup Card */}
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-lg">
          <CardContent className="p-8">
            <div className="grid lg:grid-cols-3 gap-8">
              
              {/* Interview Configuration */}
              <div className="lg:col-span-1 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Target className="w-5 h-5 text-blue-500 mr-2" />
                    Interview Type
                  </h3>
                  <div className="space-y-3">
                    {[
                      { value: "general", label: "General Interview", icon: Users, color: "blue", desc: "Basic questions about experience and motivation" },
                      { value: "technical", label: "Technical Interview", icon: Code, color: "purple", desc: "Skills and problem-solving scenarios" },
                      { value: "behavioral", label: "Behavioral Interview", icon: MessageSquare, color: "green", desc: "Past experiences and situational questions" }
                    ].map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setSession(prev => ({ ...prev, interviewType: type.value as InterviewType }))}
                        className={`
                          w-full p-4 rounded-xl border-2 text-left transition-all duration-200
                          ${session.interviewType === type.value
                            ? `border-${type.color}-500 bg-${type.color}-50 shadow-lg scale-105`
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                          }
                        `}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg bg-${type.color}-100`}>
                            <type.icon className={`w-5 h-5 text-${type.color}-600`} />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-800">{type.label}</div>
                            <div className="text-sm text-gray-600 mt-1">{type.desc}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <Clock className="w-5 h-5 text-green-500 mr-2" />
                    Number of Questions
                  </h3>
                  <select
                    value={session.totalQuestions}
                    onChange={(e) => setSession(prev => ({ ...prev, totalQuestions: parseInt(e.target.value) }))}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value={3}>3 Questions (5 min)</option>
                    <option value={5}>5 Questions (10 min)</option>
                    <option value={8}>8 Questions (15 min)</option>
                    <option value={10}>10 Questions (20 min)</option>
                  </select>
                </div>
              </div>

              {/* Enhanced Position Selection */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Briefcase className="w-5 h-5 text-purple-500 mr-2" />
                    Select Your Target Position
                  </h3>
                  
                  {/* Position Cards Grid */}
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    {jobPositions.map((position) => (
                      <button
                        key={position.title}
                        onClick={() => {
                          setSelectedPositionId(position.title);
                          setCustomJobDescription("");
                        }}
                        className={`
                          p-4 rounded-xl border-2 text-left transition-all duration-200
                          ${selectedPositionId === position.title
                            ? 'border-purple-500 bg-purple-50 shadow-lg scale-105'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                          }
                        `}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-800">{position.title}</h4>
                          <span className={`
                            px-2 py-1 rounded-full text-xs font-medium
                            ${position.level === 'mid' ? 'bg-blue-100 text-blue-700' :
                              'bg-purple-100 text-purple-700'}
                          `}>
                            {position.level}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {position.description}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {position.requirements.slice(0, 3).map((req, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                            >
                              {req}
                            </span>
                          ))}
                          {position.requirements.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              +{position.requirements.length - 3} more
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500">OR</span>
                    </div>
                  </div>

                  {/* Custom Job Description */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Custom Job Description
                    </label>
                    <textarea
                      value={customJobDescription}
                      onChange={(e) => {
                        setCustomJobDescription(e.target.value);
                        if (e.target.value.trim()) {
                          setSelectedPositionId("");
                        }
                      }}
                      placeholder="Paste a job description or describe the role you're preparing for..."
                      className="w-full p-4 border border-gray-300 rounded-xl h-32 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                      disabled={!!selectedPositionId}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Selected Position Preview */}
            {selectedPositionId && (
              <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                  <Star className="w-5 h-5 text-purple-500 mr-2" />
                  Selected Position Preview
                </h3>
                {(() => {
                  const position = jobPositions.find(pos => pos.title === selectedPositionId);
                  return position ? (
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-800 mb-2">{position.title}</h4>
                        <p className="text-gray-600 text-sm mb-3">{position.description}</p>
                        <div className="text-sm text-gray-500">
                          <span className="font-medium">Industry:</span> {position.industry} • 
                          <span className="font-medium"> Level:</span> {position.level}
                        </div>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-800 mb-2">Key Requirements:</h5>
                        <div className="flex flex-wrap gap-2">
                          {position.requirements.map((req, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-white text-purple-700 text-sm rounded-full border border-purple-200"
                            >
                              {req}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>
            )}

            {/* Start Button */}
            <div className="mt-8">
              <Button
                onClick={handleStartInterview}
                disabled={loading || (!selectedPositionId && !customJobDescription.trim())}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 text-lg font-medium rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Generating AI Questions...
                  </>
                ) : (
                  <>
                    <Brain className="w-5 h-5 mr-3" />
                    Start AI Interview Experience
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );

    // Enhanced Introduction Stage
    const renderIntroduction = () => (
      <Card className="max-w-4xl mx-auto shadow-2xl border-0 bg-white/90 backdrop-blur-lg">
        <CardContent className="p-8 text-center">
          <RealisticAvatar 
            isSpeaking={isAvatarSpeaking}
            isListening={isListening}
            onStartListening={startListening}
            onStopListening={stopListening}
            size="large"
          />
          
          <h2 className="text-3xl font-bold mb-4 text-gray-800">
            Welcome to your {session.interviewType} interview!
          </h2>
          
          <div className="max-w-2xl mx-auto mb-8">
            <p className="text-gray-600 mb-6 text-lg leading-relaxed">
              I'm your AI interviewer, and I'll be conducting a personalized interview for{" "}
              <span className="font-semibold text-purple-600">
                {session.selectedPosition?.title || "your target position"}
              </span>. 
              I've prepared {session.totalQuestions} questions specifically tailored to this role.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center justify-center space-x-2 p-4 bg-blue-50 rounded-xl">
                <Volume2 className="w-6 h-6 text-blue-600" />
                <span className="text-sm text-blue-700 font-medium">I'll speak questions aloud</span>
              </div>
              <div className="flex items-center justify-center space-x-2 p-4 bg-green-50 rounded-xl">
                <Target className="w-6 h-6 text-green-600" />
                <span className="text-sm text-green-700 font-medium">Tailored to your role</span>
              </div>
              <div className="flex items-center justify-center space-x-2 p-4 bg-purple-50 rounded-xl">
                <Award className="w-6 h-6 text-purple-600" />
                <span className="text-sm text-purple-700 font-medium">AI-powered feedback</span>
              </div>
            </div>
          </div>
          
          <Button
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105"
            onClick={() => {
              setSession(prev => ({ ...prev, stage: "interview" }));
              setIsAvatarSpeaking(true);
            }}
          >
            <Play className="w-5 h-5 mr-2" />
            Begin Interview
          </Button>
        </CardContent>
      </Card>
    );

    // Enhanced Interview Stage
    const renderInterview = () => {
      const currentQuestion = session.questions[session.currentQuestion];
      const progress = ((session.currentQuestion + 1) / session.totalQuestions) * 100;
      
      return (
        <Card className="max-w-5xl mx-auto shadow-2xl border-0 bg-white/90 backdrop-blur-lg">
          <CardContent className="p-8">
            {/* Avatar Section */}
            <div className="mb-8">
              <RealisticAvatar 
                isSpeaking={isAvatarSpeaking}
                isListening={isListening || isRecording}
                onStartListening={startListening}
                onStopListening={stopListening}
                currentQuestion={currentQuestion?.question}
                onQuestionComplete={handleQuestionSpoken}
                size="medium"
              />
            </div>
            
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
                    <h3 className="text-xl font-semibold text-gray-800">
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
                    <p className="text-lg text-gray-700 leading-relaxed mb-3">
                      {currentQuestion?.question || "Loading question..."}
                    </p>
                    {currentQuestion?.expectedDuration && (
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          Expected time: {currentQuestion.expectedDuration} min
                        </span>
                        <span className="flex items-center">
                          <TrendingUp className="w-4 h-4 mr-1" />
                          Take your time to think
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Answer Input Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <label className="text-lg font-medium text-gray-700">
                  Your Answer
                </label>
                <div className="flex items-center space-x-3">
                  {isRecording && (
                    <div className="flex items-center space-x-2 text-red-600 animate-pulse">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                      <span className="text-sm font-medium">Recording {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}</span>
                    </div>
                  )}
                  {isListening && (
                    <span className="text-blue-600 animate-pulse text-sm font-medium">🎤 Listening...</span>
                  )}
                </div>
              </div>
              
              <textarea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="Type your answer here or use voice recording below..."
                className="w-full p-4 border border-gray-300 rounded-xl h-40 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-white shadow-sm"
              />
              
              {/* Voice Controls */}
              <div className="flex items-center justify-between mt-4 p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <Button
                    variant={isRecording ? "destructive" : "outline"}
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={!questionSpoken}
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
                    disabled={!questionSpoken}
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
                </div>
                
                <div className="text-xs text-gray-500 max-w-xs">
                  💡 Tip: Use the STAR method (Situation, Task, Action, Result) for behavioral questions
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-xl shadow-lg transition-all duration-200"
                onClick={handleNextQuestion}
                disabled={!questionSpoken || isGeneratingFeedback}
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
              
              <Button
                variant="outline"
                className="border-orange-500 text-orange-600 hover:bg-orange-50 py-3 rounded-xl"
                onClick={() => setSession(prev => ({ ...prev, stage: "feedback" }))}
                disabled={isGeneratingFeedback}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                End Early
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    };

    // Enhanced Feedback Stage
    const renderFeedback = () => (
      <Card className="max-w-4xl mx-auto shadow-2xl border-0 bg-white/90 backdrop-blur-lg">
        <CardContent className="p-8 text-center">
          <RealisticAvatar size="medium" />
          
          <h2 className="text-4xl font-bold mb-4 text-gray-800">
            🎉 Interview Complete!
          </h2>
          
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6 mb-8">
            <h3 className="text-2xl font-semibold text-green-800 mb-3">
              Outstanding Performance!
            </h3>
            <p className="text-green-700 mb-6 text-lg">
              You've successfully completed your {session.interviewType} interview for{" "}
              <span className="font-semibold">{session.selectedPosition?.title}</span>.
            </p>
            
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="text-3xl font-bold text-blue-600 mb-2">{session.answers.length}</div>
                <div className="text-sm text-gray-600 font-medium">Questions Answered</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {session.startTime ? 
                    Math.round((new Date().getTime() - session.startTime.getTime()) / 1000 / 60) : 0}
                </div>
                <div className="text-sm text-gray-600 font-medium">Minutes Practiced</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {Math.round((session.answers.length / session.totalQuestions) * 100)}%
                </div>
                <div className="text-sm text-gray-600 font-medium">Completion Rate</div>
              </div>
            </div>
          </div>

          {/* AI Feedback Section */}
          {session.feedback && (
            <div className="text-left mb-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
              <h4 className="font-bold text-gray-800 mb-4 text-center flex items-center justify-center">
                <Brain className="w-6 h-6 text-purple-600 mr-2" />
                AI-Powered Feedback
              </h4>
              <div className="prose max-w-none text-gray-700 whitespace-pre-line">
                {session.feedback}
              </div>
            </div>
          )}

          {/* Interview Insights */}
          <div className="text-left mb-8 max-w-3xl mx-auto">
            <h4 className="font-semibold text-gray-800 mb-6 text-center text-xl">
              🎯 Interview Experience Highlights
            </h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-xl">
                <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <div className="font-medium text-blue-800">AI-Generated Questions</div>
                  <div className="text-sm text-blue-700">
                    Personalized questions for {session.selectedPosition?.title}
                  </div>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <div className="font-medium text-green-800">Realistic Experience</div>
                  <div className="text-sm text-green-700">
                    Voice interaction with AI interviewer
                  </div>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-4 bg-purple-50 rounded-xl">
                <CheckCircle className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                <div>
                  <div className="font-medium text-purple-800">Smart Feedback</div>
                  <div className="text-sm text-purple-700">
                    AI analysis of your responses
                  </div>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-4 bg-orange-50 rounded-xl">
                <CheckCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                <div>
                  <div className="font-medium text-orange-800">Multi-Modal Input</div>
                  <div className="text-sm text-orange-700">
                    Voice recording and text input
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/dashboard">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl shadow-lg">
                Back to Dashboard
              </Button>
            </Link>
            <Button
              variant="outline"
              className="border-purple-600 text-purple-600 hover:bg-purple-50 px-8 py-3 rounded-xl shadow-lg"
              onClick={() => {
                setSession({
                  stage: "setup",
                  currentQuestion: 0,
                  totalQuestions: 5,
                  answers: [],
                  interviewType: "general",
                  questions: []
                });
                setCurrentAnswer("");
                setSelectedPositionId("");
                setCustomJobDescription("");
                setQuestionSpoken(false);
                setRecordingTime(0);
                audioChunksRef.current = [];
              }}
            >
              Practice Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4">
        <div className="max-w-[1400px] mx-auto">
          {session.stage === "setup" && renderSetup()}
          {session.stage === "introduction" && renderIntroduction()}
          {session.stage === "interview" && renderInterview()}
          {session.stage === "feedback" && renderFeedback()}
        </div>
      </div>
    );
  };

  export default MockInterviewPage;