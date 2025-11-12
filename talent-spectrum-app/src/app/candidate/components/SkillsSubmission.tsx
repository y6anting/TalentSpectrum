"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/app/components/button";

interface LanguageProficiency {
  id: number;
  language: string;
  reading: string;
  writing: string;
  listening: string;
  speaking: string;
}

interface SkillsSubmissionProps {
  exp_skill: {
    SoftSkills: string;
    HardSkills: string;
  };
  languageProficiencies?: LanguageProficiency[];
   userEmail: string;
   onSave?: () => void;
}

export function SkillsSubmission({
  exp_skill,
  languageProficiencies = [],
  onSave,
}: SkillsSubmissionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  const userEmail = session?.user?.email;

  /** 🔹 Manual save for Skills (button) */
  const handleSubmitSkills = async () => {
    if (!userEmail) {
      setError("User not logged in or session email missing.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const skillsData = { exp_skill };

      const response = await fetch(
        `/api/profiles?email=${encodeURIComponent(userEmail)}&type=exp_skill`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(skillsData),
        }
      );

      if (!response.ok) throw new Error("Failed to save skills.");

      alert("Skills saved successfully!");
      if (onSave) onSave();
    } catch (err: any) {
      console.error("Error saving skills:", err);
      setError(err.message || "An error occurred while saving your skills.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /** 🔹 Auto-save language whenever dropdown changes */
useEffect(() => {
  console.log("Current languageProficiencies:", languageProficiencies);
  if (!userEmail) return;
  if (!languageProficiencies || languageProficiencies.length === 0) return;

  const timeout = setTimeout(async () => {
    try {
      setIsAutoSaving(true);
      setError(null);

      const payload = {
        language_proficiencies: languageProficiencies.map(({ id, ...rest }) => rest),
      };

      console.log("Payload being sent:", payload);

      const res = await fetch(
        `/api/profiles?email=${encodeURIComponent(userEmail)}&type=language_proficiencies`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const errText = await res.text();
        console.error("Language auto-save failed:", errText);
        throw new Error("Failed to auto-save language proficiency.");
      }

      console.log("✅ Auto-saved language proficiency:", payload);
    } catch (err: any) {
      setError(err.message || "Error auto-saving language proficiency.");
    } finally {
      setIsAutoSaving(false);
    }
  }, 1000);

  return () => clearTimeout(timeout);
}, [languageProficiencies, userEmail]);

  return (
    <div>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <Button
        className="bg-[#635bff] hover:bg-[#827CFF] text-white"
        onClick={handleSubmitSkills}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Saving..." : "Save Skills"}
      </Button>

      {isAutoSaving && (
        <p className="text-xs text-gray-500 mt-1 italic">
          Auto-saving language proficiency...
        </p>
      )}
    </div>
  );
}