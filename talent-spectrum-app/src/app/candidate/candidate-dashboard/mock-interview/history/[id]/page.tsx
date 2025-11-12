"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/app/components/button";
import { Card, CardContent } from "@/app/components/card";

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
  }>;
  created_at: string;
};

export default function InterviewReportDetailPage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<Report | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      if (!id) {
        setError("Missing report id.");
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/mock-interview/reports/detail?id=${encodeURIComponent(id)}`);
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `Failed to fetch report (${res.status})`);
        }
        const data = await res.json();
        setReport(data);
      } catch (e: any) {
        setError(e.message || "Failed to load report.");
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id]);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">Interview Report</h1>
        <div className="space-x-2">
          <Link href="/candidate/candidate-dashboard/mock-interview/history">
            <Button variant="outline" className="border-[#635BFF] text-[#635BFF]">Back to History</Button>
          </Link>
          <Link href="/candidate/candidate-dashboard/mock-interview/setup">
            <Button>Practice Again</Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardContent>
          {loading ? (
            <div className="p-4 text-gray-600">Loading...</div>
          ) : error ? (
            <div className="p-4 text-red-600">{error}</div>
          ) : !report ? (
            <div className="p-4 text-gray-600">Report not found.</div>
          ) : (
            <div className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500">Position</div>
                  <div className="font-medium text-gray-800">{report.position_title}</div>
                  <div className="text-xs text-gray-500">Level: {report.position_level}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Interview Type</div>
                  <div className="font-medium capitalize text-gray-800">{report.interview_type}</div>
                  <div className="text-xs text-gray-500">Questions: {report.total_questions}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Date</div>
                  <div className="font-medium text-gray-800">{new Date(report.created_at || report.end_time || report.start_time).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Duration</div>
                  <div className="font-medium text-gray-800">{Math.round((report.duration_seconds || 0) / 60)} min</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Score</div>
                  <div className="font-medium text-gray-800">{typeof report.overall_score === 'number' ? `${report.overall_score}/100` : '—'}</div>
                </div>
              </div>

              {report.overall_feedback && (
                <div>
                  <h2 className="text-lg font-semibold mb-2 text-gray-800">Overall Feedback</h2>
                  <p className="text-gray-700 whitespace-pre-line">{report.overall_feedback}</p>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Strengths</h3>
                  <ul className="space-y-1 text-sm text-gray-700 list-disc list-inside">
                    {(report.strengths && report.strengths.length ? report.strengths : ["N/A"]).map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Improvements</h3>
                  <ul className="space-y-1 text-sm text-gray-700 list-disc list-inside">
                    {(report.improvements && report.improvements.length ? report.improvements : ["N/A"]).map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {report.questions_data && report.questions_data.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-800">Responses</h2>
                  {report.questions_data.map((q, idx) => (
                    <div key={idx} className="border rounded-md p-4 bg-white shadow-sm">
                      <div className="text-sm font-semibold text-gray-800 mb-1">Q{idx + 1}: {q.question}</div>
                      <div className="text-sm text-gray-700 mb-2">Answer: {q.answer || '—'}</div>
                      {q.feedback && (
                        <div className="text-xs text-gray-600 mt-1">Feedback: {q.feedback}</div>
                      )}
                      {typeof q.score === 'number' && (
                        <div className="text-xs text-gray-600 mt-1">Score: {q.score}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}