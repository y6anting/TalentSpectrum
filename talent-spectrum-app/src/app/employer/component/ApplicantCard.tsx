"use client";

import React from "react";
import { Card, CardContent } from "@/app/components/card";
import { Button } from "@/app/components/button";
import { Badge } from "@/app/components/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/select";
import { Eye, Download, Calendar } from "lucide-react";

interface Applicant {
  id?: number | string;
  applicationId?: number | string;
  candidate_email: string;
  candidate_name?: string;
  applied_date?: string;
  status?: string;
  score?: number;
  accommodations_requested?: boolean;
}

interface ApplicantCardProps {
  applicant: Applicant;
  onViewProfile: (email: string) => void;
  onViewResume: (email: string) => void;
  onUpdateStatus: (applicationId: number | string | undefined, newStatus: string) => void;
  getStatusBadge: (status: string) => React.ReactNode;
  getMatchScoreColor: (score: number) => string;
}

export default function ApplicantCard({
  applicant,
  onViewProfile,
  onViewResume,
  onUpdateStatus,
  getStatusBadge,
  getMatchScoreColor,
}: ApplicantCardProps) {
  return (
    <Card className="bg-gray-50">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <input type="checkbox" className="mt-1" />
              <h5 className="font-semibold text-[#3a4043]">
                {applicant.candidate_name || applicant.candidate_email || "Unknown Candidate"}
              </h5>
              {getStatusBadge(applicant.status || "under_review")}
              {applicant.score && (
                <span className={`text-sm font-medium ${getMatchScoreColor(applicant.score)}`}>
                  {applicant.score}% match
                </span>
              )}
            </div>
            <p className="text-sm text-[#6f7a80] mb-2">{applicant.candidate_email}</p>
            <div className="flex items-center gap-4 text-xs text-[#6f7a80]">
              {applicant.applied_date && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Applied: {new Date(applicant.applied_date).toISOString().split('T')[0]}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2 ml-4">
            <Button
              size="sm"
              className="bg-[#635bff] hover:bg-[#524aff] text-white cursor-pointer whitespace-nowrap"
              onClick={() => onViewProfile(applicant.candidate_email)}
            >
              <Eye className="w-4 h-4 mr-2" />
              View Profile
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-gray-300 text-gray-600 hover:bg-gray-50 cursor-pointer"
              onClick={() => onViewResume(applicant.candidate_email, applicant.candidate_name)}
            >
              <Download className="w-4 h-4 mr-2" />
              Resume
            </Button>
            <Select
              value={applicant.status || 'under_review'}
              onValueChange={(value) => onUpdateStatus(applicant.id || applicant.applicationId, value)}
            >
              <SelectTrigger className="w-full text-xs h-8">
                <SelectValue placeholder="Update Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="shortlisted">Shortlisted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

