"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/app/components/card";
import { Button } from "@/app/components/button";
import { Trash2 } from "lucide-react";
import { EducationSubmission } from "../../components/EducationSubmission";

interface Education {
  id: number;
  level: string;
  institution: string;
  fieldOfStudy: string;
  graduationYear: number | null;
  cgpa_grade: string;
  award: string;
}

interface EducationPageProps {
  educations: Education[];
  setEducations: React.Dispatch<React.SetStateAction<Education[]>>;
  updateEducation: (index: number, field: string, value: string) => void;
  addEducation: () => void;
  grad_year: string[];
  refreshProfileData: () => void;
}

export default function EducationPage({
  educations,
  setEducations,
  updateEducation,
  addEducation,
  grad_year,
  refreshProfileData,
}: EducationPageProps) {
  const deleteEducation = (index: number) => {
    if (index > 0) {
      setEducations(educations.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="space-y-6">
      {educations.map((education, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Education {index > 0 ? index + 1 : ""}</CardTitle>
            {index > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteEducation(index)}
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
                  Level
                </label>
                <select
                  value={education.level}
                  onChange={(e) => updateEducation(index, "level", e.target.value)}
                  className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg outline-none focus-visible:border-gray-400 focus-visible:ring-[1px] focus-visible:ring-gray-400/50"
                >
                  <option value="">Select Level</option>
                  <option value="High School">High School</option>
                  <option value="Diploma">Diploma</option>
                  <option value="Bachelor's Degree">Bachelor's Degree</option>
                  <option value="Master's Degree">Master's Degree</option>
                  <option value="PhD">PhD</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#3a4043] mb-1">
                  Institution
                </label>
                <input
                  type="text"
                  value={education.institution}
                  onChange={(e) => updateEducation(index, "institution", e.target.value)}
                  className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg outline-none focus-visible:border-gray-400 focus-visible:ring-[1px] focus-visible:ring-gray-400/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#3a4043] mb-1">
                  Field of Study
                </label>
                <input
                  type="text"
                  value={education.fieldOfStudy}
                  onChange={(e) => updateEducation(index, "fieldOfStudy", e.target.value)}
                  className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg outline-none focus-visible:border-gray-400 focus-visible:ring-[1px] focus-visible:ring-gray-400/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#3a4043] mb-1">
                  Graduation Year
                </label>
                <select
                  value={education.graduationYear?.toString() || ""}
                  onChange={(e) => updateEducation(index, "graduationYear", e.target.value)}
                  className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg outline-none focus-visible:border-gray-400 focus-visible:ring-[1px] focus-visible:ring-gray-400/50"
                >
                  <option value="">Select Year</option>
                  {grad_year.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#3a4043] mb-1">
                  CGPA
                </label>
                <input
                  type="text"
                  value={education.cgpa_grade}
                  onChange={(e) => updateEducation(index, "cgpa_grade", e.target.value)}
                  className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg outline-none focus-visible:border-gray-400 focus-visible:ring-[1px] focus-visible:ring-gray-400/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#3a4043] mb-1">
                  Award
                </label>
                <input
                  type="text"
                  value={education.award}
                  onChange={(e) => updateEducation(index, "award", e.target.value)}
                  className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg outline-none focus-visible:border-gray-400 focus-visible:ring-[1px] focus-visible:ring-gray-400/50"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex gap-4">
        <Button onClick={addEducation} variant="outline">
          Add Education
        </Button>
        <EducationSubmission
          educations={educations}
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
