"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/app/components/card";
import { Button } from "@/app/components/button";
import { Trash2 } from "lucide-react";
import { ExperienceSkillsSubmission } from "../../components/ExperienceSkillsSubmission";

interface Experience {
  id: number;
  employer: string;
  industry: string;
  start: string;
  end: string;
  seniorityLevel: string;
  achievements: string;
  projectHighlights: string;
}

interface ExperiencePageProps {
  experiences: Experience[];
  setExperiences: React.Dispatch<React.SetStateAction<Experience[]>>;
  updateExperience: (index: number, field: string, value: string) => void;
  addExperience: () => void;
  refreshProfileData: () => void;
}

export default function ExperiencePage({
  experiences,
  setExperiences,
  updateExperience,
  addExperience,
  refreshProfileData,
}: ExperiencePageProps) {
  const deleteExperience = (index: number) => {
    if (index > 0) {
      setExperiences(experiences.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="space-y-6">
      {experiences.map((experience, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Experience {index > 0 ? index + 1 : ""}</CardTitle>
            {index > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteExperience(index)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#3a4043] mb-1">
                  Employer
                </label>
                <input
                  type="text"
                  value={experience.employer}
                  onChange={(e) => updateExperience(index, "employer", e.target.value)}
                  className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg outline-none focus-visible:border-gray-400 focus-visible:ring-[1px] focus-visible:ring-gray-400/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#3a4043] mb-1">
                  Industry
                </label>
                <input
                  type="text"
                  value={experience.industry}
                  onChange={(e) => updateExperience(index, "industry", e.target.value)}
                  className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg outline-none focus-visible:border-gray-400 focus-visible:ring-[1px] focus-visible:ring-gray-400/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#3a4043] mb-1">
                  Start Date
                </label>
                <input
                  type="text"
                  value={experience.start}
                  onChange={(e) => updateExperience(index, "start", e.target.value)}
                  placeholder="e.g., Jan 2020"
                  className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg outline-none focus-visible:border-gray-400 focus-visible:ring-[1px] focus-visible:ring-gray-400/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#3a4043] mb-1">
                  End Date
                </label>
                <input
                  type="text"
                  value={experience.end}
                  onChange={(e) => updateExperience(index, "end", e.target.value)}
                  placeholder="e.g., Dec 2022 or Present"
                  className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg outline-none focus-visible:border-gray-400 focus-visible:ring-[1px] focus-visible:ring-gray-400/50"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#3a4043] mb-1">
                  Seniority Level
                </label>
                <input
                  type="text"
                  value={experience.seniorityLevel}
                  onChange={(e) => updateExperience(index, "seniorityLevel", e.target.value)}
                  className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg outline-none focus-visible:border-gray-400 focus-visible:ring-[1px] focus-visible:ring-gray-400/50"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#3a4043] mb-1">
                  Project Highlights
                </label>
                <textarea
                  value={experience.projectHighlights}
                  onChange={(e) => updateExperience(index, "projectHighlights", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg outline-none focus-visible:border-gray-400 focus-visible:ring-[1px] focus-visible:ring-gray-400/50"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#3a4043] mb-1">
                  Achievements
                </label>
                <textarea
                  value={experience.achievements}
                  onChange={(e) => updateExperience(index, "achievements", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg outline-none focus-visible:border-gray-400 focus-visible:ring-[1px] focus-visible:ring-gray-400/50"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex gap-4">
        <Button onClick={addExperience} variant="outline">
          Add Experience
        </Button>
        <ExperienceSkillsSubmission
          experiences={experiences}
          onSave={() => {
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('profileUpdated'));
            }
          }}
        />
      </div>
    </div>
  );
}
