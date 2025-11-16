"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/app/components/button";
import { Card, CardContent } from "@/app/components/card";
import { 
  CheckCircle, 
  Clock, 
  Star,
  ArrowUpWideNarrow,
  MessageSquare,
  History,
  Mic,
  ArrowLeft
} from "lucide-react";

type Report = {
  id: number;
  candidate_email: string;
  position_title: string;
  position_level: string;
  interview_type: string;
  total_questions: number;
  start_time: string;
  end_time: string;
  duration_seconds: number;
  overall_score?: number;
  overall_feedback?: string;
  strengths?: string[];
  improvements?: string[];
  questions_data?: Array<{
    question: string;
    answer: string;
    feedback?: string | null;
    score?: number | null;
    type?: string;
    hasAudio?: boolean;
  }>;
  created_at: string;
};

type EmbeddedNavTarget = "history" | "setup";
interface EmbeddedNavProps { 
  reportId: number;
  onNavigate?: (target: EmbeddedNavTarget) => void;
}

export default function InterviewReportDetailPage({ reportId, onNavigate }: EmbeddedNavProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<Report | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      if (!reportId) {
        setError("Missing report id.");
        setLoading(false);
        return;
      }
      try {
        console.log('Fetching report with ID:', reportId);
        const res = await fetch(`/api/mock-interview/reports/detail?id=${encodeURIComponent(reportId)}`);
        console.log('Response status:', res.status);
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          console.error('Error fetching report:', data);
          throw new Error(data.error || `Failed to fetch report (${res.status})`);
        }
        const data = await res.json();
        console.log('Report data received:', data);
        console.log('Questions data:', data.questions_data);
        console.log('Questions data type:', typeof data.questions_data);
        console.log('Questions data length:', data.questions_data?.length);
        if (data.questions_data && data.questions_data.length > 0) {
          console.log('First question:', data.questions_data[0]);
        }
        setReport(data);
      } catch (e: any) {
        setError(e.message || "Failed to load report.");
        // Try to load from localStorage as fallback
        try {
          const local = JSON.parse(localStorage.getItem('interviewHistory') || '[]');
          const found = Array.isArray(local) ? local.find((r: any) => String(r.id) === String(reportId)) : null;
          if (found) {
            setReport(found);
            setError(null);
          }
        } catch {}
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [reportId]);

  const handleBackToHistory = () => {
    if (onNavigate) {
      onNavigate("history");
    }
  };

  const handlePracticeAgain = () => {
    if (onNavigate) {
      onNavigate("setup");
    } else {
      // Fallback: navigate to mock interview setup tab
      window.location.href = '/candidate/candidate-dashboard?tab=mock-interview&subtab=setup';
    }
  };

  if (loading) {
  return (
      <div className="w-full flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#635bff] mx-auto mb-4"></div>
          <p className="text-[#6f7a80]">Loading report...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error || "Report not found."}</p>
              <div className="space-x-2">
                <Button variant="outline" onClick={handleBackToHistory}>Back to History</Button>
                <Button onClick={handlePracticeAgain}>Start New Interview</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Parse the date string - backend returns ISO strings
  // If timezone info is missing, assume UTC
  const dateStr = report.created_at || report.end_time || report.start_time;
  let date: Date;
  if (dateStr) {
    // If the string doesn't end with Z or timezone offset, assume UTC
    const normalizedStr = dateStr.endsWith('Z') || dateStr.includes('+') || dateStr.includes('-', 10)
      ? dateStr
      : dateStr + 'Z'; // Append Z to indicate UTC
    date = new Date(normalizedStr);
  } else {
    date = new Date();
  }
  const durationMinutes = Math.round((report.duration_seconds || 0) / 60);

  return (
    <div className="w-full">
      <div className="mb-4">
        <Button
          variant="outline"
          onClick={handleBackToHistory}
          className="mb-4 border-[#635bff] text-[#635bff] hover:bg-[#635bff] hover:text-white cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to History
        </Button>
      </div>
      <div className="">
        <div className="max-w-[1400px] ">
          <Card className="max-w-[6xl] mx-auto bg-white p-4">
            <CardContent className="p-6 text-start">
              {/* Introduction - matches feedback page exactly */}
              <p className="text-gray-700 mb-6 text-xl">
                Great work completing your{" "}
                <span className="font-semibold capitalize">{report.interview_type} interview</span> for{" "}
                <span className="font-semibold">{report.position_title}</span>.
              </p>

              {/* Statistics Cards - matches feedback page exactly */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <div className="text-3xl font-bold text-[#635BFF] mb-2">{report.total_questions}</div>
                    <div className="text-sm text-gray-600 font-medium">Questions Answered</div>
                  </div>
                </Card>
                <Card>
                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <div className="text-3xl font-bold text-[#635BFF] mb-2">
                      {durationMinutes}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">Minutes Practiced</div>
                  </div>
                </Card>
      <Card>
                  <div className="bg-white p-6 rounded-xl shadow-sm flex items-center justify-between">
                <div>
                      <div className="text-3xl font-bold text-[#635BFF] mb-2">
                        {typeof report.overall_score === 'number' ? `${report.overall_score}/100` : '—'}
                </div>
                      <div className="text-sm text-gray-600 font-medium">Overall Score</div>
                </div>
                    {/* Score visualization - matches feedback page exactly */}
                    {typeof report.overall_score === 'number' ? (
                      <div className="relative w-16 h-16">
                        <div className="absolute inset-0 rounded-full" style={{ background: `conic-gradient(#635BFF ${report.overall_score * 3.6}deg, #e5e7eb 0deg)` }} />
                        <div className="absolute inset-1 bg-white rounded-full flex items-center justify-center text-xs font-semibold text-[#635BFF]">
                          {report.overall_score}%
                </div>
                </div>
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-xs text-gray-400">N/A</div>
                    )}
                </div>
                </Card>
              </div>

              {/* Overall Feedback Summary - matches feedback page */}
              {report.overall_feedback && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-6 mb-8 text-left">
                  <h4 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                    Overall Feedback 
                  </h4>
                  <p className="text-gray-700 text-lg leading-relaxed">{report.overall_feedback}</p>
                </div>
              )}

              {/* Text before strengths/improvements - matches feedback page exactly */}
              <div className="py-4">
                <p className="text-gray-700 text-lg">
                  Review your <span className="font-semibold">key strengths</span> and <span className="font-semibold">areas for improvement</span> below.
                </p>
                </div>

              {/* Strengths vs Improvements - matches feedback page exactly */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10 text-left">
                {/* Left: Strengths */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <h4 className="font-semibold text-lg text-gray-800 mb-4 flex items-center">
                    <Star className="w-5 h-5 text-[#635BFF] mr-2" /> Strengths
                  </h4>
                  <div className="space-y-3">
                    {(report.strengths && report.strengths.length > 0 ? report.strengths : ["Clear and concise communication when explaining your thought process.", "Strong examples of past leadership experience shared effectively."]).map((s, i) => (
                      <div key={i} className="p-4 bg-[#635BFF]/5 border border-[#635BFF]/20 rounded-xl text-gray-800">
                        <div className="flex items-start">
                          <CheckCircle className="w-4 h-4 mr-2 mt-1 text-[#635BFF] flex-shrink-0" /> 
                          <span>{String(s).replace(/^[-*•\s]+/, '').replace(/[\s*•-]+$/,'')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Areas for Improvement with Actionable Tips - matches feedback page exactly */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <h4 className="font-semibold text-lg text-gray-800 mb-4 flex items-center">
                    <ArrowUpWideNarrow className="w-5 h-5 text-red-600 mr-2" /> Areas for Improvement
                  </h4>
                  <div className="space-y-3">
                    {(report.improvements && report.improvements.length > 0 ? report.improvements : [
                      "Structure your answers using the STAR method (Situation, Task, Action, Result) for clearer storytelling.",
                      "Include specific metrics and quantifiable results to strengthen your examples.",
                      "Practice common behavioral questions to build confidence and reduce hesitation."
                    ]).map((imp, i) => (
                      <div key={i} className="p-4 bg-red-50 border border-red-100 rounded-xl">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                            <span className="text-white font-semibold text-xs">{i + 1}</span>
                          </div>
                          <p className="text-gray-800 leading-relaxed font-medium">
                            {String(imp).replace(/^\s*([0-9]+\.|[-*•])\s*/, '').replace(/[\s*•-]+$/,'')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* User Answers Review - matches feedback page exactly */}
              <br />
              {report.questions_data && Array.isArray(report.questions_data) && report.questions_data.length > 0 ? (
                <div className="text-left py-4">
                  <h4 className="font-bold text-gray-800 mb-6 text-left text-xl flex items-center justify-start">
                    <MessageSquare className="w-5 h-5 text-[#635BFF] mr-2" />
                    Your Interview Responses
                  </h4>
                  <div className="space-y-6 max-w-7xl mx-auto">
                    {report.questions_data.map((answer: any, index: number) => (
                      <div key={index} className="bg-gradient-to-r from-[#635BFF]/5 to-gray-50 rounded-xl p-6 border border-gray-300">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 w-7 h-7 bg-[#635BFF] rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">{index + 1}</span>
                          </div>
                          <div className="flex-1">
                            <div className="mb-4">
                              <h5 className="font-semibold text-gray-800 mb-2">Question:</h5>
                              <p className="text-gray-700 leading-relaxed">{answer.question || `Question ${index + 1}`}</p>
                            </div>
                            <div>
                              <h5 className="font-semibold text-gray-800 mb-2">Your Answer:</h5>
                              <p className="text-gray-700 leading-relaxed bg-white p-4 rounded-lg border">
                                {answer.answer || <span className="text-gray-400 italic">No answer provided</span>}
                              </p>
                              {/* Show audio indicator if available - matches feedback page */}
                              {answer.hasAudio && (
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
              ) : (
                <div className="text-left py-4">
                  <h4 className="font-bold text-gray-800 mb-6 text-left text-xl flex items-center justify-start">
                    <MessageSquare className="w-5 h-5 text-[#635BFF] mr-2" />
                    Your Interview Responses
                  </h4>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
                    <p className="text-yellow-800">
                      No questions and answers data available for this report. This may be an older report format.
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons - matches feedback page style */}
              <div className="flex flex-col sm:flex-row justify-center gap-4 py-6">
                <Button
                  variant="outline"
                  className="w-fit px-6 py-2 rounded-md border border-[#635BFF] text-[#635BFF] font-semibold hover:bg-[#635BFF]/10 hover:text-[#524BCC] hover:border-[#524BCC] cursor-pointer"
                  onClick={handleBackToHistory}
                >
                  View All History
                </Button>
                <Button
                  variant="outline"
                  className="w-fit px-4 py-2 rounded-md 
             border border-[#635BFF] text-[#635BFF] font-semibold 
             hover:bg-[#635BFF]/10 hover:text-[#524BCC] hover:border-[#524BCC] cursor-pointer"
                  onClick={handlePracticeAgain}
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
}
