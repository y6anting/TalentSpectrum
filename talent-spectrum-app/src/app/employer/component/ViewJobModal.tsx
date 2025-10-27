"use client";
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/app/components/card";
import { Badge } from "@/app/components/badge";
import { Button } from "@/app/components/button";
import { X } from "lucide-react";

type Props = {
  isOpen: boolean;
  job: any | null;
  salaryRanges: string[];
  onClose: () => void;
  onEdit: () => void;
};

export default function ViewJobModal({ isOpen, job, salaryRanges, onClose, onEdit }: Props) {
  if (!isOpen || !job) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{job.job_title}</CardTitle>
            <Button variant="ghost" onClick={onClose}><X className="h-5 w-5" /></Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-gray-600"><strong>Job Type:</strong> {job.job_type}</p>
            <p className="text-sm text-gray-600"><strong>Work Mode:</strong> {job.work_mode}</p>
            <p className="text-sm text-gray-600"><strong>Location:</strong> {job.location}</p>
            <p className="text-sm text-gray-600"><strong>Salary Range:</strong> {salaryRanges[job.salary_range] ?? "N/A"}</p>
            <p className="text-sm text-gray-600"><strong>Experience Level:</strong> {job.experience_level}</p>
            <p className="text-sm text-gray-600"><strong>Summary:</strong> {job.job_summary}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-[#3a4043]">Accommodations:</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {[
                { key: "flexible_work_hour", label: "Flexible Work Hours" },
                { key: "sensory_friendly_environment", label: "Sensory-Friendly Environment" },
                { key: "mental_health_support", label: "Mental Health Support" },
              ].map(({ key, label }) => (
                job[key] && (
                  <Badge key={key} className="bg-purple-100 text-purple-800">{label}</Badge>
                )
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button className="bg-[#635bff] text-white rounded-full" onClick={onEdit}>Edit Job</Button>
            <Button variant="outline" onClick={onClose} className="rounded-full">Close</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}