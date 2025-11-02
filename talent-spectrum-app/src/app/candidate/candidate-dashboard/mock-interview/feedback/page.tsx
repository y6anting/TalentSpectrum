"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/app/components/button";
import { Card, CardContent } from "@/app/components/card";
import RealisticAvatar from "@/app/mock-interview/RealisticAvatar";
import { 
  generateAIFeedback,
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
  feedback?: string;
}

const MockInterviewFeedbackPage = () => {
  const router = useRouter();
  
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);

  useEffect(() => {
    // Load session data from sessionStorage
    const sessionData = sessionStorage.getItem('mockInterviewSession');
    if (sessionData) {
      const parsedData = JSON.parse(sessionData);
      const sessionWithDate = {
        ...parsedData,
        startTime: new Date(parsedData.startTime)
      };
      setSession(sessionWithDate);
      
      // Generate AI feedback if not already generated
      if (!parsedData.feedback && parsedData.answers && parsedData.answers.length > 0) {
        generateFeedback(sessionWithDate);
      } else {
        setLoading(false);
      }
    } else {
      // No session data, redirect to setup
      router.push('/mock-interview/setup');
    }
  }, [router]);

  const generateFeedback = async (sessionData: InterviewSession) => {
    if (!sessionData.selectedPosition || !sessionData.answers.length) {
      setLoading(false);
      return;
    }

    setIsGeneratingFeedback(true);
    try {
      const feedback = await generateAIFeedback(
        sessionData.selectedPosition,
        sessionData.interviewType,
        sessionData.answers
      );
      
      const updatedSession = {
        ...sessionData,
        feedback
      };
      
      setSession(updatedSession);
      sessionStorage.setItem('mockInterviewSession', JSON.stringify(updatedSession));
    } catch (error) {
      console.error("Failed to generate feedback:", error);
      const fallbackSession = {
        ...sessionData,
        feedback: "Thank you for completing the interview! Keep practicing to improve your skills."
      };
      setSession(fallbackSession);
      sessionStorage.setItem('mockInterviewSession', JSON.stringify(fallbackSession));
    } finally {
      setIsGeneratingFeedback(false);
      setLoading(false);
    }
  };

  if (loading || !session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {isGeneratingFeedback ? "Generating AI feedback..." : "Loading feedback..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-[1400px] mx-auto">
        <Card className="max-w-6xl mx-auto shadow-2xl border-0 bg-white/90 backdrop-blur-lg">
          <CardContent className="p-8 text-center">
            <RealisticAvatar size="medium" />
            
            <h2 className="text-4xl font-bold mb-4 text-gray-800">
              Interview Complete!
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

            {/* User Answers Review */}
            {session.answers.length > 0 && (
              <div className="text-left mb-8">
                <h4 className="font-bold text-gray-800 mb-6 text-center text-xl flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-blue-600 mr-2" />
                  Your Interview Responses
                </h4>
                <div className="space-y-6 max-w-4xl mx-auto">
                  {session.answers.map((answer, index) => (
                    <div key={index} className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <div className="mb-4">
                            <h5 className="font-semibold text-gray-800 mb-2">Question:</h5>
                            <p className="text-gray-700 leading-relaxed">{answer.question}</p>
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-800 mb-2">Your Answer:</h5>
                            <p className="text-gray-700 leading-relaxed bg-white p-4 rounded-lg border">
                              {answer.answer || <span className="text-gray-400 italic">No answer provided</span>}
                            </p>
                            {answer.audioBlob && (
                              <div className="mt-2 text-xs text-gray-500 flex items-center">
                                <Mic className="w-3 h-3 mr-1" />
                                Voice recording included
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
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
                  // Clear session data and redirect to setup
                  sessionStorage.removeItem('mockInterviewSession');
                  router.push('/mock-interview/setup');
                }}
              >
                Practice Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MockInterviewFeedbackPage;
