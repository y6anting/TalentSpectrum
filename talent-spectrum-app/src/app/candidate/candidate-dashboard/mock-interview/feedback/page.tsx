"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  endTime?: Date;
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

type EmbeddedNavTarget = "setup" | "interview" | "feedback";
interface EmbeddedNavProps { onNavigate?: (target: EmbeddedNavTarget) => void }

const MockInterviewFeedbackPage: React.FC<EmbeddedNavProps> = ({ onNavigate }) => {
  const router = useRouter();
  
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);

  // Parse feedback into structured sections when available
  type ParsedFeedback = {
    overall_score?: number;
    overall?: string;
    strengths?: string[];
    areas_for_improvement?: string[]; // Now includes actionable tips
    raw?: string;
  };

  const parseFeedback = (feedbackData: string | any): ParsedFeedback => {
    console.log("🔍 Client: Parsing feedback data:", typeof feedbackData, feedbackData);
    
    // If it's already an object with the expected structure, return it
    if (typeof feedbackData === 'object' && feedbackData !== null) {
      const cleanupItem = (s: string) => s
        .replace(/^\s*([0-9]+\.|[-*•])\s*/, '')
        .replace(/^[\"'`\s]+/, '')
        .replace(/[\"'`\s]+$/, '')
        .trim();
      
      const normalizeList = (val: any): string[] => {
        if (!val) return [];
        if (Array.isArray(val)) return val.map((x) => cleanupItem(String(x))).filter(Boolean);
        return [];
      };

      const result = {
        overall_score: typeof feedbackData.overall_score === 'number' 
          ? feedbackData.overall_score 
          : (typeof feedbackData.overall_score === 'string' ? Number(feedbackData.overall_score) : undefined),
        overall: feedbackData.overall || feedbackData.summary,
        strengths: normalizeList(feedbackData.strengths),
        areas_for_improvement: normalizeList(feedbackData.areas_for_improvement || feedbackData.improvements),
        raw: typeof feedbackData === 'string' ? feedbackData : JSON.stringify(feedbackData, null, 2)
      };
      
      console.log("✅ Client: Parsed feedback structure:", {
        overall_score: result.overall_score,
        overall_length: result.overall?.length || 0,
        strengths_count: result.strengths?.length || 0,
        improvements_count: result.areas_for_improvement?.length || 0
      });
      
      return result;
    }

    // If it's a string, try to parse it as JSON
    if (typeof feedbackData === 'string') {
      const stripFences = (s: string) => {
        let t = s.trim();
        const fenceMatch = t.match(/^```(?:json)?\n([\s\S]*?)\n```$/i);
        if (fenceMatch) t = fenceMatch[1].trim();
        if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
          t = t.slice(1, -1);
        }
        return t;
      };
      
      const normalized = stripFences(feedbackData);
      
      try {
        const data = JSON.parse(normalized);
        console.log("✅ Client: Successfully parsed JSON from string");
        return parseFeedback(data); // Recursively parse the object
      } catch (error) {
        console.warn("⚠️ Client: Failed to parse feedback as JSON:", error);
        // Fallback for unparseable strings
        return {
          overall: feedbackData,
          strengths: [],
          areas_for_improvement: [],
          raw: feedbackData
        };
      }
    }

    // Default fallback
    console.warn("⚠️ Client: Using default fallback structure");
    return {
      strengths: [],
      areas_for_improvement: [],
      raw: String(feedbackData)
    };
  };

  const parsed = useMemo(() => {
    if (session?.feedback) {
      const result = parseFeedback(session.feedback);
      console.log("📊 Client: Final parsed feedback:", result);
      return result;
    }
    return undefined;
  }, [session?.feedback]);

  useEffect(() => {
    // Load session data from sessionStorage - only run once on mount
    const sessionData = sessionStorage.getItem('mockInterviewSession');
    if (sessionData) {
      const parsedData = JSON.parse(sessionData);
      const sessionWithDate = {
        ...parsedData,
        startTime: new Date(parsedData.startTime),
        endTime: parsedData.endTime ? new Date(parsedData.endTime) : undefined
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const generateFeedback = async (sessionData: InterviewSession) => {
    if (!sessionData.selectedPosition || !sessionData.answers.length) {
      setLoading(false);
      return;
    }

    // Don't regenerate if feedback already exists
    if (sessionData.feedback) {
      console.log("📋 Feedback already exists, skipping generation");
      setLoading(false);
      return;
    }

    setIsGeneratingFeedback(true);
    try {
      console.log("🤖 Generating new feedback...");
      const feedback = await generateAIFeedback(
        sessionData.selectedPosition,
        sessionData.interviewType,
        sessionData.answers
      );
      
      const updatedSession = {
        ...sessionData,
        feedback
      };
      
      console.log("✅ Feedback generated successfully");
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
      <div className="h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#635bFF] mx-auto mb-4"></div>
            <p className="text-gray-600">
              {isGeneratingFeedback ? "Generating AI feedback..." : "Loading feedback..."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="">
      <div className="">
        <div className="max-w-[1400px] ">
          <Card className="max-w-[6xl] mx-auto bg-white p-4">
            <CardContent className="p-6 text-start">
            {/* <RealisticAvatar size="medium" /> */}
            <p className="text-gray-700 mb-6 text-xl">
              Great work completing your{" "}
              <span className="font-semibold">{session.interviewType} interview</span> for{" "}
              <span className="font-semibold">{session.selectedPosition?.title}</span>.
            </p>

              
               {/* Overall & Statistics */}
              
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                  <div className="bg-white p-6 rounded-xl shadow-sm">
                  <div className="text-3xl font-bold text-[#635BFF] mb-2">{session.answers.length}</div>
                  <div className="text-sm text-gray-600 font-medium">Questions Answered</div>
                </div>
                </Card>
                  <Card>
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                      <div className="text-3xl font-bold text-[#635BFF] mb-2">
                        {session.startTime ? 
                          Math.max(0, Math.round((((session.endTime ? session.endTime.getTime() : new Date().getTime()) - session.startTime.getTime()) / 1000) / 60)) : 0}
                      </div>
                      <div className="text-sm text-gray-600 font-medium">Minutes Practiced</div>
                    </div>
                  </Card>
                  <Card>
                    <div className="bg-white p-6 rounded-xl shadow-sm flex items-center justify-between">
                      <div>
                        
                        <div className="text-3xl font-bold text-[#635BFF] mb-2">{typeof parsed?.overall_score === 'number' ? `${parsed.overall_score}/100` : '—'}</div>
                        <div className="text-sm text-gray-600 font-medium">Overall Score</div>
                      </div>
                      {/* simple ring visualization */}
                      {typeof parsed?.overall_score === 'number' ? (
                        <div className="relative w-16 h-16">
                          <div className="absolute inset-0 rounded-full" style={{ background: `conic-gradient(#635BFF ${parsed.overall_score * 3.6}deg, #e5e7eb 0deg)` }} />
                          <div className="absolute inset-1 bg-white rounded-full flex items-center justify-center text-xs font-semibold text-[#635BFF]">
                            {parsed.overall_score}%
                          </div>
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-xs text-gray-400">N/A</div>
                      )}
                    </div>
                  </Card>
              </div>

            {/* Overall Feedback */}
            
            {/* {parsed && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-6 mb-8 text-left">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                      {parsed.overall?.title || 'Overall Feedback'}
                    </h3>
                    <p className="text-gray-700 text-lg leading-relaxed">
                      {parsed.overall?.summary || 'Great work completing the interview. Review your strengths and focus areas below.'}
                    </p>
                  </div>
                  {typeof parsed.overall?.score === 'number' && (
                    <div className="min-w-[140px] text-center bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                      <div className="text-sm text-gray-500">Overall Score</div>
                      <div className="text-3xl font-bold text-blue-600">{parsed.overall.score}/100</div>
                    </div>
                  )}
                </div>
              </div>
            )} */}

            {/* Overall Summary */}
            {/* {parsed?.overall && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-0 border border-blue-200 rounded-2xl p-6 mb-8 text-left">
                <h4 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                  Overall Feedback 
                </h4>
                <p className="text-gray-700 text-lg leading-relaxed">{parsed.overall}</p>
              </div>
            )} */}
             <div className="py-4">
                <p className="text-gray-700 text-lg">
                  Review your <span className="font-semibold">key strengths</span> and <span className="font-semibold">areas for improvement</span> below.
                </p>
              </div>

            {/* Strengths vs Improvements */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10 text-left">
              {/* Left: Strengths */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h4 className="font-semibold text-lg text-gray-800 mb-4 flex items-center">
                  <Star className="w-5 h-5 text-[#635BFF] mr-2" /> Strengths
                </h4>
                <div className="space-y-3">
                  {(parsed?.strengths?.length ? parsed.strengths : ["Clear and concise communication when explaining your thought process.", "Strong examples of past leadership experience shared effectively."]).map((s, i) => (
                    <div key={i} className="p-4 bg-[#635BFF]/5 border border-[#635BFF]/20 rounded-xl text-gray-800">
                      <div className="flex items-start"><CheckCircle className="w-4 h-4 mr-2 mt-1 text-[#635BFF] flex-shrink-0" /> <span>{s.replace(/^[-*•\s]+/, '').replace(/[\s*•-]+$/,'')}</span></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Areas for Improvement with Actionable Tips */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h4 className="font-semibold text-lg text-gray-800 mb-4 flex items-center">
                  <ArrowUpWideNarrow className="w-5 h-5 text-red-600 mr-2" /> Areas for Improvement
                </h4>
                <div className="space-y-3">
                  {(parsed?.areas_for_improvement?.length ? parsed.areas_for_improvement : [
                    "Structure your answers using the STAR method (Situation, Task, Action, Result) for clearer storytelling.",
                    "Include specific metrics and quantifiable results to strengthen your examples.",
                    "Practice common behavioral questions to build confidence and reduce hesitation."
                  ]).map((imp, i) => (
                    <div key={i} className="p-4 bg-red-50 border border-red-100 rounded-xl">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                          <span className="text-white font-semibold text-xs">{i + 1}</span>
                        </div>
                        <p className="text-gray-800 leading-relaxed font-medium">{imp.replace(/^\s*([0-9]+\.|[-*•])\s*/, '').replace(/[\s*•-]+$/,'')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Full Feedback (details) */}
            {/* {session.feedback && (
              <div className="text-left mb-8 bg-white rounded-xl p-6 border border-gray-200">
                <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                  <Brain className="w-5 h-5 text-purple-600 mr-2" /> AI Feedback Details
                </h4>
                <div className="prose max-w-none text-gray-700 whitespace-pre-line">
                  {parsed?.raw || session.feedback}
                </div>
              </div>
            )} */}

            {/* User Answers Review */}
            <br />
            {session.answers.length > 0 && (
              <div className="text-left py-4">
                <h4 className="font-bold text-gray-800 mb-6 text-left text-xl flex items-center justify-start">
                  <MessageSquare className="w-5 h-5 text-[#635BFF] mr-2" />
                  Your Interview Responses
                </h4>
                <div className="space-y-6 max-w-7xl mx-auto">
                  {session.answers.map((answer, index) => (
                    <div key={index} className="bg-gradient-to-r from-[#635BFF]/5 to-gray-50 rounded-xl p-6 border border-gray-300">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-7 h-7 bg-[#635BFF] rounded-full flex items-center justify-center">
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
            {/* <div className="text-left mb-8 max-w-3xl mx-auto">
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
            </div> */}

            <div className="flex flex-col sm:flex-row justify-center gap-4 py-6">
              <Link href="/candidate/candidate-dashboard">
                <Button className="w-fit bg-[#635BFF] hover:from-blue-700 hover:cursor-pointer hover:bg-[#5748e5] text-white px-8 py-3 rounded-md shadow-lg">
                  Back to Dashboard
                </Button>
              </Link>
              <Button
                variant="outline"
                className="w-fit px-4 py-2 rounded-md 
             border border-[#635BFF] text-[#635BFF] font-semibold 
             hover:bg-[#635BFF]/10 hover:text-[#524BCC] hover:border-[#524BCC] cursor-pointer"
                onClick={() => {
                  // Clear session data and redirect to setup
                  sessionStorage.removeItem('mockInterviewSession');
                  if (onNavigate) {
                    onNavigate("setup");
                  } else {
                    router.push('/candidate/candidate-dashboard/mock-interview/setup');
                  }
                }}
              >
                Practice Again
              </Button>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
};

export default MockInterviewFeedbackPage;
