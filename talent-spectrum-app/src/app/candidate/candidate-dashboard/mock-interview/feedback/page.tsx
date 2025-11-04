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
    overall?: { title?: string; summary?: string; score?: number };
    skills?: Record<string, number>;
    strengths?: string[];
    improvements?: string[];
    tips?: string[];
    raw: string;
  };

  const parseFeedback = (text: string): ParsedFeedback => {
    // Normalize text: strip code fences and surrounding quotes
    const stripFences = (s: string) => {
      let t = s.trim();
      // Remove ```json ... ``` or ``` ... ```
      const fenceMatch = t.match(/^```(?:json)?\n([\s\S]*?)\n```$/i);
      if (fenceMatch) t = fenceMatch[1].trim();
      // Remove leading and trailing quotes if it's a single giant quoted string
      if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
        t = t.slice(1, -1);
      }
      return t;
    };
    const normalized = stripFences(text);
    // Try JSON first
    try {
      const data = JSON.parse(normalized);
      if (data && (data.overall || data.skills || data.strengths || data.improvements)) {
        const cleanupItem = (s: string) => s
          .replace(/^\s*([0-9]+\.|[-*•])\s*/, '')
          .replace(/^[\"'`\s]+/, '')
          .replace(/[\"'`\s]+$/, '')
          .trim();
        const normalizeList = (val: any): string[] => {
          if (!val) return [];
          if (Array.isArray(val)) return val.map((x) => cleanupItem(String(x))).filter(Boolean);
          const str = String(val);
          const parts = str.split(/\n+/).filter(Boolean).map(x => x.trim());
          const items: string[] = [];
          for (const line of parts) {
            if (/^\s*([0-9]+\.|[-*•])\s+/.test(line)) {
              items.push(cleanupItem(line));
            } else if (line.length > 1) {
              items.push(cleanupItem(line));
            }
          }
          return items.filter(Boolean);
        };
        return {
          overall: data.overall,
          skills: data.skills,
          strengths: normalizeList(data.strengths),
          improvements: normalizeList(data.improvements),
          tips: normalizeList(data.tips),
          raw: normalized
        };
      }
    } catch (_) {}
    // Fallback: heuristic parse by headings / keywords
    const cleanupItem = (s: string) => s
      .replace(/^\s*([0-9]+\.|[-*•])\s*/, '')
      .replace(/^[\"'`\s]+/, '')
      .replace(/[\"'`\s]+$/, '')
      .trim();
    const sections = { strengths: [] as string[], improvements: [] as string[], tips: [] as string[] };
    const lines = normalized.split(/\n+/).map(l => l.trim()).filter(Boolean);
    let current: 'strengths' | 'improvements' | 'tips' | null = null;
    for (const line of lines) {
      const lower = line.toLowerCase();
      if (lower.includes('strengths')) { current = 'strengths'; continue; }
      if (lower.includes('areas for improvement') || lower.includes('improvements')) { current = 'improvements'; continue; }
      if (lower.startsWith('actionable tip') || lower.includes('tips')) { current = 'tips'; continue; }
      if (current) {
        const cleaned = cleanupItem(line);
        if (cleaned) (sections as any)[current].push(cleaned);
      }
    }
    // Skills heuristic: look for lines like Communication: 80/100
    const skills: Record<string, number> = {};
    for (const line of lines) {
      const m = line.match(/^(communication|problem\s*-?\s*solving|technical|behavioral)\s*[:|-]\s*(\d{1,3})\s*(?:\/\s*100|%)?/i);
      if (m) {
        skills[m[1].replace(/\s+/g, ' ').replace(/\b\w/g, c => c.toUpperCase())] = Math.min(100, parseInt(m[2], 10));
      }
    }
    // Overall score heuristic
    let score: number | undefined;
    const scoreLine = lines.find(l => /overall\s*score/i.test(l));
    if (scoreLine) {
      const m = scoreLine.match(/(\d{1,3})\s*(?:\/\s*100|%)/);
      if (m) score = Math.min(100, parseInt(m[1], 10));
    }
    const firstPara = lines.slice(0, 5).join(' ');
    return {
      overall: { title: 'Great Progress!', summary: firstPara, score },
      skills: Object.keys(skills).length ? skills : undefined,
      strengths: sections.strengths,
      improvements: sections.improvements,
      tips: sections.tips,
      raw: text
    };
  };

  const parsed = useMemo(() => session?.feedback ? parseFeedback(session.feedback) : undefined, [session?.feedback]);

  useEffect(() => {
    // Load session data from sessionStorage
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
    <div className="min-h-screen ">
      <div className="max-w-[1400px] mx-auto">
        <Card className="max-w-6xl mx-auto border-0 bg-white/90 backdrop-blur-lg">
           <CardContent className="p-8 text-start">
            {/* <RealisticAvatar size="medium" /> */}
            
              <p className="text-gray-700 mb-6 text-xl">
                Great work completing your {session.interviewType} interview for{" "}
                <span className="font-semibold">{session.selectedPosition?.title}</span>. 
                
              </p>
              
               {/* Overall & Statistics */}
              
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                  <div className="bg-white p-6 rounded-xl shadow-sm">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{session.answers.length}</div>
                  <div className="text-sm text-gray-600 font-medium">Questions Answered</div>
                </div>
                </Card>
                  <Card>
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                      <div className="text-3xl font-bold text-purple-600 mb-2">
                        {session.startTime ? 
                          Math.max(0, Math.round((((session.endTime ? session.endTime.getTime() : new Date().getTime()) - session.startTime.getTime()) / 1000) / 60)) : 0}
                      </div>
                      <div className="text-sm text-gray-600 font-medium">Minutes Practiced</div>
                    </div>
                  </Card>
                  <Card>
                    <div className="bg-white p-6 rounded-xl shadow-sm flex items-center justify-between">
                      <div>
                        <div className="text-sm text-gray-600 font-medium">Overall Score</div>
                        <div className="text-3xl font-bold text-green-600">{typeof parsed?.overall?.score === 'number' ? `${parsed.overall.score}/100` : '—'}</div>
                      </div>
                      {/* simple ring visualization */}
                      {typeof parsed?.overall?.score === 'number' ? (
                        <div className="relative w-16 h-16">
                          <div className="absolute inset-0 rounded-full" style={{ background: `conic-gradient(#16a34a ${parsed.overall.score * 3.6}deg, #e5e7eb 0deg)` }} />
                          <div className="absolute inset-1 bg-white rounded-full flex items-center justify-center text-xs font-semibold text-green-700">
                            {parsed.overall.score}%
                          </div>
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-xs text-gray-400">N/A</div>
                      )}
                    </div>
                  </Card>
              </div>

            {/* Overall Feedback */}
             <p>Review your strengths and focus areas below.</p>
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

            {/* Skill Assessment + Strengths vs Improvements */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10 text-left">
              {/* Left: Strengths + Skill bars */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <Star className="w-5 h-5 text-blue-600 mr-2" /> Strengths
                </h4>
                {parsed?.skills && (
                  <div className="mb-6">
                    {Object.entries(parsed.skills).map(([k, v]) => (
                      <div key={k} className="mb-3">
                        <div className="flex justify-between text-sm text-gray-600 mb-1"><span>{k}</span><span>{v}%</span></div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-2 bg-blue-600 rounded-full" style={{ width: `${Math.max(0, Math.min(100, v))}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="space-y-3">
                  {(parsed?.strengths?.length ? parsed.strengths : ["Clear and concise communication when explaining your thought process.", "Strong examples of past leadership experience shared effectively."]).map((s, i) => (
                    <div key={i} className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-800">
                      <div className="flex items-start"><CheckCircle className="w-4 h-4 mr-2 mt-1" /> <span>{s.replace(/^[-*•\s]+/, '').replace(/[\s*•-]+$/,'')}</span></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Areas for Improvement */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <ArrowUpWideNarrow className="w-5 h-5 text-orange-600 mr-2" /> Areas for Improvement
                </h4>
                <div className="space-y-3">
                  {(parsed?.improvements?.length ? parsed.improvements : ["Could provide more structure to answers using the STAR method.", "Be more specific with metrics and results where possible."]).map((imp, i) => (
                    <div key={i} className="p-4 bg-orange-50 border border-orange-200 rounded-xl text-orange-800">
                      <div className="flex items-start"><Target className="w-4 h-4 mr-2 mt-1" /> <span>{imp.replace(/^\s*([0-9]+\.|[-*•])\s*/, '').replace(/[\s*•-]+$/,'')}</span></div>
                    </div>
                  ))}
                </div>
                {parsed?.tips?.length ? (
                  <div className="mt-5 p-4 bg-purple-50 border border-purple-200 rounded-xl text-purple-800">
                    <div className="font-medium mb-1">Actionable Tip</div>
                    <div className="text-sm leading-relaxed">{parsed.tips[0]}</div>
                  </div>
                ) : (
                  <div className="mt-5 p-4 bg-purple-50 border border-purple-200 rounded-xl text-purple-800">
                    <div className="font-medium mb-1">Actionable Tip</div>
                    <div className="text-sm leading-relaxed">Practice structuring one behavioral story a day using the STAR framework to build fluency.</div>
                  </div>
                )}
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
            {session.answers.length > 0 && (
              <div className="text-left mb-8">
                <h4 className="font-bold text-gray-800 mb-6 text-left text-xl flex items-center justify-start">
                  <MessageSquare className="w-6 h-6 text-blue-600 mr-2" />
                  Your Interview Responses
                </h4>
                <div className="space-y-6 max-w-5xl mx-auto">
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
                  if (onNavigate) {
                    onNavigate("setup");
                  } else {
                    router.push('/mock-interview/setup');
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
  );
};

export default MockInterviewFeedbackPage;
