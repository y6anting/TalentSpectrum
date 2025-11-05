"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/app/components/button";
import { Card, CardContent } from "@/app/components/card";
import { 
  CheckCircle, 
  Clock, 
  Target, 
  TrendingUp,
  Users,
  Brain,
  Code,
  MessageSquare,
  Award,
  Star,
  Eye,
  Lightbulb,
  AlertTriangle
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
  selectedPosition?: {
    title: string;
    description: string;
    requirements: string[];
    level: string;
    industry: string;
  };
  interviewType: InterviewType;
  questions: Array<{
    id: string;
    question: string;
    type: InterviewType;
    difficulty: string;
    expectedDuration: number;
  }>;
  feedback?: string;
}

interface InterviewHistory {
  id: string;
  date: string;
  role: string;
  feedback: string;
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
      // Simulate AI feedback generation (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const feedback = "Based on your responses, you demonstrated strong technical knowledge and clear communication skills. Your experience with React and problem-solving approach shows good potential for this role.";
      
      const updatedSession = {
        ...sessionData,
        feedback
      };
      
      setSession(updatedSession);
      sessionStorage.setItem('mockInterviewSession', JSON.stringify(updatedSession));
      
      // Save to history
      saveToHistory(updatedSession);
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

  const saveToHistory = (sessionData: InterviewSession) => {
    const historyItem: InterviewHistory = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      role: sessionData.selectedPosition?.title || "Unknown Role",
      feedback: sessionData.feedback || ""
    };
    
    const existingHistory = JSON.parse(localStorage.getItem('interviewHistory') || '[]');
    const updatedHistory = [historyItem, ...existingHistory];
    localStorage.setItem('interviewHistory', JSON.stringify(updatedHistory));
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
        {/* Header Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Confidence Card */}
          <Card className="bg-gradient-to-br from-orange-100 to-orange-200 border-0 shadow-lg">
            <CardContent className="p-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Confidence</h3>
                  <h4 className="text-xl font-bold text-gray-900 mb-3">
                    You demonstrated strong confidence
                  </h4>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Your assured delivery conveyed a strong belief in your abilities. You presented yourself as a capable and competent candidate.
                  </p>
                </div>
              </div>
              <div className="flex justify-end">
                <div className="w-32 h-32 relative">
                  <div className="absolute inset-0 bg-orange-300 rounded-full opacity-20"></div>
                  <div className="absolute inset-2 bg-orange-400 rounded-full opacity-30"></div>
                  <div className="absolute inset-4 bg-orange-500 rounded-full opacity-40"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Users className="w-12 h-12 text-orange-600" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technical Accuracy Card */}
          <Card className="bg-gradient-to-br from-blue-100 to-blue-200 border-0 shadow-lg">
            <CardContent className="p-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Technical Accuracy</h3>
                  <h4 className="text-xl font-bold text-gray-900 mb-3">
                    Your technical knowledge was impressive
                  </h4>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    You demonstrated a solid grasp of the technical concepts relevant to the role. Your answers were accurate and insightful.
                  </p>
                </div>
              </div>
              <div className="flex justify-end">
                <div className="w-32 h-32 relative">
                  <div className="absolute inset-0 bg-blue-300 rounded-full opacity-20"></div>
                  <div className="absolute inset-2 bg-blue-400 rounded-full opacity-30"></div>
                  <div className="absolute inset-4 bg-blue-500 rounded-full opacity-40"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Code className="w-12 h-12 text-blue-600" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* What Went Well & Areas for Improvement */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* What Went Well */}
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">What Went Well</h3>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Clear Communication</h4>
                    <p className="text-gray-600 text-sm">
                      You effectively communicated your ideas with clarity and precision.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Engaging Demeanor</h4>
                    <p className="text-gray-600 text-sm">
                      Your enthusiasm and positive attitude created an engaging interview experience.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Code className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Technical Proficiency</h4>
                    <p className="text-gray-600 text-sm">
                      You demonstrated a strong understanding of the technical aspects of the role.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Areas for Improvement */}
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Areas for Improvement</h3>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Conciseness</h4>
                    <p className="text-gray-600 text-sm">
                      Consider giving more concise responses to maintain the interviewer's attention.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Problem-Solving Articulation</h4>
                    <p className="text-gray-600 text-sm">
                      Practice articulating your thought process more explicitly to showcase your problem-solving skills.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Interview History */}
        <Card className="bg-white shadow-lg border-0 mb-8">
          <CardContent className="p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Interview History</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-4 border-b border-gray-100">
                <div className="flex items-center space-x-4">
                  <span className="text-gray-600 text-sm">DATE</span>
                  <span className="text-gray-600 text-sm ml-20">ROLE</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between py-4 border-b border-gray-100">
                <div className="flex items-center space-x-4">
                  <span className="text-gray-800 text-sm">
                    {new Date().toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                  <span className="text-gray-800 text-sm ml-12">
                    {session.selectedPosition?.title || "Software Engineer"}
                  </span>
                </div>
                <Button variant="outline" className="text-purple-600 border-purple-200 hover:bg-purple-50">
                  View Feedback
                </Button>
              </div>
              
              <div className="flex items-center justify-between py-4 border-b border-gray-100">
                <div className="flex items-center space-x-4">
                  <span className="text-gray-800 text-sm">June 28, 2024</span>
                  <span className="text-gray-800 text-sm ml-12">Product Manager</span>
                </div>
                <Button variant="outline" className="text-purple-600 border-purple-200 hover:bg-purple-50">
                  View Feedback
                </Button>
              </div>
              
              <div className="flex items-center justify-between py-4">
                <div className="flex items-center space-x-4">
                  <span className="text-gray-800 text-sm">June 12, 2024</span>
                  <span className="text-gray-800 text-sm ml-12">Data Analyst</span>
                </div>
                <Button variant="outline" className="text-purple-600 border-purple-200 hover:bg-purple-50">
                  View Feedback
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
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
      </div>
    </div>
  );
};

export default MockInterviewFeedbackPage;