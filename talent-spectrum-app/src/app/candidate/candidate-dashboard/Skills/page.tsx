"use client";

import React from "react";
import { SkillsSubmission } from "../../components/SkillsSubmission";

interface LanguageProficiency {
  id: number;
  language: string;
  reading: string;
  writing: string;
  listening: string;
  speaking: string;
}

interface SkillsPageProps {
  exp_skill: {
    SoftSkills: string;
    HardSkills: string;
  };
  languageProficiencies: LanguageProficiency[];
  userEmail: string;
  refreshProfileData: () => void;
}

export default function SkillsPage({
  exp_skill,
  languageProficiencies,
  userEmail,
  refreshProfileData,
}: SkillsPageProps) {
  return (
    <div className="space-y-6">
      <SkillsSubmission
        exp_skill={exp_skill}
        languageProficiencies={languageProficiencies}
        userEmail={userEmail}
        onSave={() => {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('profileUpdated'));
          }
        }}
      />
    </div>
  );
}
