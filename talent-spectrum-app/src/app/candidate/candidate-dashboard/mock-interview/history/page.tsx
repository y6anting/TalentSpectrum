"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/app/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/card";
import { Badge } from "@/app/components/badge";
import { Clock, Briefcase, Calendar, FileText, TrendingUp, ArrowRight, Trash2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useToastHelpers } from "@/components/ui/toast";

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
  created_at: string;
};

type EmbeddedNavTarget = "history" | "history-detail" | "setup";
interface EmbeddedNavProps { 
  onNavigate?: (target: EmbeddedNavTarget, reportId?: number) => void;
}

export default function InterviewHistoryPage({ onNavigate }: EmbeddedNavProps = {}) {
  const { data: authSession } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const { success, error: showError } = useToastHelpers();

  useEffect(() => {
    const fetchReports = async () => {
      if (!authSession?.user?.email) {
        setError("Please sign in to view your history.");
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/mock-interview/reports?email=${encodeURIComponent(authSession.user.email)}`);
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `Failed to fetch history (${res.status})`);
        }
        const data = await res.json();
        setReports(data || []);
      } catch (e: any) {
        setError(e.message || "Failed to load history.");
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [authSession?.user?.email]);

  const getScoreColor = (score?: number) => {
    if (!score) return "text-gray-500";
    if (score >= 80) return "text-green-600";
    if (score >= 70) return "text-blue-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-500";
  };

  const getScoreBadge = (score?: number) => {
    if (typeof score !== 'number') return <Badge variant="secondary">—</Badge>;
    if (score >= 80) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    if (score >= 70) return <Badge className="bg-blue-100 text-blue-800">Good</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-100 text-yellow-800">Fair</Badge>;
    return <Badge className="bg-red-50 text-red-500 border border-red-100">Needs Improvement</Badge>;
  };

  const handleDeleteReport = async (reportId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this interview report?")) {
      return;
    }

    setDeletingId(reportId);
    try {
      const response = await fetch(`/api/mock-interview/reports/delete?id=${reportId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete report');
      }

      // Remove from local state
      setReports(prev => prev.filter(r => r.id !== reportId));
      success("Interview report deleted successfully");
    } catch (error: any) {
      console.error("Error deleting report:", error);
      showError(error?.message || "Failed to delete report. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleViewDetails = (reportId: number, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (onNavigate) {
      onNavigate("history-detail", reportId);
    } else {
      router.push(`/candidate/candidate-dashboard/mock-interview/history/${reportId}`);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          {/* <h1 className="text-3xl font-bold text-[#3a4043] mb-2">Mock Interview History</h1>
          <p className="text-[#6f7a80]">Review your past interview practice sessions</p> */}
        </div>
        
      </div>

      {/* Loading State */}
      {loading && (
        <div className="w-full flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#635bff] mx-auto mb-4"></div>
            <p className="text-[#6f7a80]">Loading interview history...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <p className="font-semibold mb-2">Error Loading History</p>
              <p className="text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!loading && !error && reports.length === 0 && (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[#3a4043] mb-2">No Interview History Yet</h3>
              <p className="text-[#6f7a80] mb-6">Complete an interview and save it to see it here.</p>
              <Button
                onClick={() => router.push('/candidate/candidate-dashboard?tab=mock-interview')}
                className="bg-[#635bff] hover:bg-[#524aff] text-white hover:cursor-pointer"
              >
                Start Your First Interview
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 10 History Limit Message and Practice Again Button */}
      {!loading && !error && reports.length > 0 && (
        <Card className="bg-[#635BFF]/2 border-[#635BFF]/30">
          <CardContent className="p-3">
            <div className="flex items-center justify-between gap-4 mt-1">
              <div className="flex items-start gap-3 flex-1">
                <AlertCircle className="h-5 w-5 text-[#635BFF] mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-[#635BFF]">
                    <strong>Note:</strong> Only the 10 most recent interview reports are stored. Older reports will be automatically deleted when you exceed this limit.
                  </p>
                </div>
              </div>
              <Button
                onClick={() => router.push('/candidate/candidate-dashboard?tab=mock-interview')}
                className="bg-[#635BFF] hover:bg-[#524BCC] text-white hover:cursor-pointer whitespace-nowrap"
              >
                Practice Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Reports List */}
      {!loading && !error && reports.length > 0 && (
        <div className="space-y-4">
          {reports.map((report, index) => {
            const date = new Date(report.created_at || report.end_time || report.start_time);
            const formattedDate = isNaN(date.getTime()) 
              ? '—' 
              : date.toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });
            
            const durationMinutes = Math.floor(report.duration_seconds / 60);
            
            return (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                  onClick={() => handleViewDetails(report.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-[#635bff]/10 rounded-lg">
                            <Briefcase className="h-5 w-5 text-[#635bff]" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-[#3a4043]">{report.position_title}</h3>
                            <div className="flex items-center gap-4 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {report.position_level}
                              </Badge>
                              <Badge variant="secondary" className="text-xs capitalize">
                                {report.interview_type}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 mt-4 text-sm text-[#6f7a80]">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{formattedDate}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{durationMinutes} min</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span>{report.total_questions} questions</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-row items-center gap-6">
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${getScoreColor(report.overall_score)}`}>
                            {typeof report.overall_score === 'number' ? `${report.overall_score}%` : '—'}
                          </div>
                          <div className="mt-1">
                            {getScoreBadge(report.overall_score)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            className="border-[#635bff] text-[#635bff] hover:bg-[#635bff] hover:text-white hover:cursor-pointer"
                            onClick={(e) => handleViewDetails(report.id, e)}
                          >
                            View Details
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 hover:cursor-pointer"
                            onClick={(e) => handleDeleteReport(report.id, e)}
                            disabled={deletingId === report.id}
                          >
                            {deletingId === report.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}