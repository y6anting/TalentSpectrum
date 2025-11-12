"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/app/components/button";
import { Card, CardContent } from "@/app/components/card";
import { Clock } from "lucide-react";

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

export default function InterviewHistoryPage() {
  const { data: authSession } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<Report[]>([]);

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

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">My Mock Interview History</h1>
        <Link href="/candidate/candidate-dashboard/mock-interview/setup">
          <Button variant="outline" className="border-[#635BFF] text-[#635BFF]">Practice Again</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 text-gray-600">Loading...</div>
          ) : error ? (
            <div className="p-6 text-red-600">{error}</div>
          ) : reports.length === 0 ? (
            <div className="p-6 text-gray-600">No history yet. Complete an interview and save it to see it here.</div>
          ) : (
            <div className="divide-y">
              <div className="px-6 py-3 text-sm text-gray-500 grid grid-cols-12">
                <div className="col-span-4">Position</div>
                <div className="col-span-3">Date</div>
                <div className="col-span-2">Type</div>
                <div className="col-span-1 text-right">Score</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>
              {reports.map((r) => {
                const date = new Date(r.created_at || r.end_time || r.start_time);
                return (
                  <div key={r.id} className="px-6 py-4 grid grid-cols-12 items-center">
                    <div className="col-span-4">
                      <div className="font-medium text-gray-800">{r.position_title}</div>
                      <div className="text-xs text-gray-500">Level: {r.position_level}</div>
                    </div>
                    <div className="col-span-3 text-gray-700">
                      {isNaN(date.getTime()) ? '-' : date.toLocaleString()}
                    </div>
                    <div className="col-span-2 capitalize text-gray-700">{r.interview_type}</div>
                    <div className="col-span-1 text-right text-gray-800">{typeof r.overall_score === 'number' ? `${r.overall_score}` : '—'}</div>
                    <div className="col-span-2 text-right space-x-2">
                      <Link href={`/candidate/candidate-dashboard/mock-interview/history/${r.id}`}>
                        <Button size="sm" variant="outline" className="border-gray-300">View</Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}