"use client";
import React, { useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/app/components/card";
import { Button } from "@/app/components/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/app/components/select";
import { Badge } from "@/app/components/badge";
import { X, Plus } from "lucide-react";
import type { JobPosting } from "@/app/employer/employer-dashboard/page";

type Props = {
  isOpen: boolean;
  editJobData: Partial<JobPosting>;
  setEditJobData: React.Dispatch<React.SetStateAction<Partial<JobPosting>>>;
  errors: Record<string, string>;
  salaryRanges: string[];
  onClose: () => void;
  onSave: () => void;
};

export default function EditJobModal({ isOpen, editJobData, setEditJobData, errors, salaryRanges, onClose, onSave }: Props) {
  // Align options with Post New Job
  const jobTypes = ["Full-time", "Part-time", "Contract", "Temporary", "Internship"];
  const locations = ["Remote", "On-site", "Hybrid"];
  const experienceLevels = ["Entry Level", "Mid Level", "Senior Level", "Executive", "Non-Executive"];

  // Local UI-only state for Department (kept for parity with Post Job)
  const [department, setDepartment] = useState<string>((editJobData as any)?.department || "");

  // Skills management (mirror Post Job skills UI)
  const initialSkills = useMemo(
    () => (typeof editJobData?.soft_skills === "string"
      ? editJobData.soft_skills.split(",").map(s => s.trim()).filter(Boolean)
      : []),
    [editJobData?.soft_skills]
  );
  const [skills, setSkills] = useState<string[]>(initialSkills);
  const [newSkill, setNewSkill] = useState<string>("");

  const addSkill = () => {
    const skill = newSkill.trim();
    if (!skill || skills.includes(skill)) return;
    const next = [...skills, skill];
    setSkills(next);
    setNewSkill("");
    setEditJobData((p: any) => ({ ...p, soft_skills: next.join(", ") }));
  };
  const removeSkill = (skillToRemove: string) => {
    const next = skills.filter(s => s !== skillToRemove);
    setSkills(next);
    setEditJobData((p: any) => ({ ...p, soft_skills: next.join(", ") }));
  };

  // Full accommodations list (parity with Post Job)
  const accommodationItems: { key: string; label: string }[] = [
    { key: "flexible_work_hour", label: "Flexible work hours" },
    { key: "quiet_room", label: "Quiet room/space" },
    { key: "sensory_friendly_environment", label: "Sensory-friendly environment" },
    { key: "peer_support_system", label: "Peer support system" },
    { key: "dedicated_workspace", label: "Dedicated workspace (not hot desk)" },
    { key: "sensory_aids", label: "Sensory aids allowed" },
    { key: "neurodiversity_awareness_training", label: "Neurodiversity awareness training" },
    { key: "provide_visual_guidance", label: "Use visual project-tracking tool" },
    { key: "uses_project_management_tools", label: "Uses project management tools" },
    { key: "regular_supervisor_check_in", label: "Regular check-in with supervisor" },
    { key: "optional_social_event", label: "No forced social event" },
    { key: "zero_tolerance_bullying_mobbing_policy", label: "Zero tolerance policy for bullying & mobbing" },
    { key: "mental_health_support", label: "Mental health support" },
    { key: "augmentative_alternative_communication", label: "Alternative communication app allowed" },
    { key: "near_public_transport", label: "Near public transport" },
  ];

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Edit Job Posting</CardTitle>
            <Button variant="ghost" onClick={onClose}><X className="h-5 w-5" /></Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Job Info */}
          <div>
            <label className="block text-sm font-medium text-[#3a4043] mb-1">Job Title</label>
            <input
              type="text"
              value={editJobData.job_title || ""}
              onChange={e => setEditJobData((p: any) => ({ ...p, job_title: e.target.value }))}
              className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg"
              placeholder="Enter job title"
            />
            {errors.job_title && <p className="text-sm text-red-500">{errors.job_title}</p>}
          </div>
          {/* Department (UI-only) */}
          <div>
            <label className="block text-sm font-medium text-[#3a4043] mb-1">Department</label>
            <input
              type="text"
              value={department}
              onChange={e => setDepartment(e.target.value)}
              className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg"
              placeholder="e.g. Engineering"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#3a4043] mb-1">Location</label>
            <input
              type="text"
              value={editJobData.location || ""}
              onChange={e => setEditJobData((p: any) => ({ ...p, location: e.target.value }))}
              className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg"
              placeholder="Enter location"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#3a4043] mb-1">Salary Range</label>
            <Select
              value={editJobData.salary_range?.toString() || ""}
              onValueChange={val => setEditJobData((p: any) => ({ ...p, salary_range: Number(val) }))}
            >
              <SelectTrigger className={`border ${errors.salary_range ? "border-red-500" : "border-gray-300"} text-[#3a4043]`}>
                <SelectValue placeholder="Select salary range" />
              </SelectTrigger>
              <SelectContent className="bg-[#f9fafb] border border-[#e8e6f0] rounded-lg">
                {salaryRanges.map((range, index) => (
                  <SelectItem key={index} value={index.toString()}>{range}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.salary_range && <p className="text-sm text-red-500">{errors.salary_range}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#3a4043] mb-1">Job Type</label>
            <Select
              value={editJobData.job_type?.toLowerCase() || ""}
              onValueChange={val => setEditJobData((p: any) => ({ ...p, job_type: val }))}
            >
              <SelectTrigger className="border border-gray-300 text-[#3a4043]">
                <SelectValue placeholder="Select job type" />
              </SelectTrigger>
              <SelectContent className="bg-[#f9fafb] border border-[#e8e6f0] rounded-lg">
                {jobTypes.map(type => (
                  <SelectItem key={type} value={type.toLowerCase()}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#3a4043] mb-1">Work Mode</label>
            <Select
              value={editJobData.work_mode?.toLowerCase() || ""}
              onValueChange={val => setEditJobData((p: any) => ({ ...p, work_mode: val }))}
            >
              <SelectTrigger className="border border-gray-300 text-[#3a4043]">
                <SelectValue placeholder="Select work mode" />
              </SelectTrigger>
              <SelectContent className="bg-[#f9fafb] border border-[#e8e6f0] rounded-lg">
                {locations.map(mode => (
                  <SelectItem key={mode} value={mode.toLowerCase()}>{mode}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#3a4043] mb-1">Experience Level</label>
            <Select
              value={editJobData.experience_level?.toLowerCase() || ""}
              onValueChange={val => setEditJobData((p: any) => ({ ...p, experience_level: val }))}
            >
              <SelectTrigger className="border border-gray-300 text-[#3a4043]">
                <SelectValue placeholder="Select experience level" />
              </SelectTrigger>
              <SelectContent className="bg-[#f9fafb] border border-[#e8e6f0] rounded-lg">
                {experienceLevels.map(level => (
                  <SelectItem key={level} value={level.toLowerCase()}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Job Description */}
          <div>
            <label className="block text-sm font-medium text-[#3a4043] mb-1">Job Summary</label>
            <textarea
              rows={4}
              value={editJobData.job_summary || ""}
              onChange={e => setEditJobData((p: any) => ({ ...p, job_summary: e.target.value }))}
              className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg"
              placeholder="Enter job summary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#3a4043] mb-1">Requirements</label>
            <textarea
              rows={6}
              value={editJobData.job_requirements || ""}
              onChange={e => setEditJobData((p: any) => ({ ...p, job_requirements: e.target.value }))}
              className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg"
              placeholder="List requirements..."
            />
          </div>

          {/* Skills */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#3a4043]">Required Skills</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add a skill"
                value={newSkill}
                onChange={e => setNewSkill(e.target.value)}
                className="flex-1 px-3 py-2 border border-[#e8e6f0] rounded-lg"
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
              />
              <Button type="button" variant="outline" onClick={addSkill}><Plus className="h-4 w-4" /></Button>
            </div>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {skills.map(skill => (
                  <Badge key={skill} variant="secondary" className="bg-[#635bff]/10 text-[#635bff]">
                    {skill}
                    <button type="button" onClick={() => removeSkill(skill)} className="ml-2 hover:text-red-500">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Accommodations */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-[#3a4043]">Neurodivergent-Friendly Accommodations</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {accommodationItems.map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!(editJobData as any)[key]}
                    onChange={() => setEditJobData((p: any) => ({ ...p, [key]: !p[key] }))}
                    className="text-[#635bff]"
                  />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button className="bg-[#635bff] text-white rounded-full" onClick={onSave}>Save Changes</Button>
            <Button variant="outline" onClick={onClose} className="rounded-full">Cancel</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}