'use client';
import { useState } from 'react';
import { Button } from "@/app/components/button";
import { useSession } from "next-auth/react";

interface ExperienceSkillsSubmissionProps {
  experiences: Array<{
    id: number;
    employer: string;
    industry: string;
    start: string;
    end: string;
    seniorityLevel: string;
    achievements: string;
    projectHighlights: string;
  }>;
  onSave?: () => void;
}

export function ExperienceSkillsSubmission({ experiences, onSave }: ExperienceSkillsSubmissionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  const handleSubmitExperienceSkills = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const userEmail = session?.user?.email;
      if (!userEmail) {
        throw new Error('No user email found in session');
      }

      // Save experiences
      const experienceResponse = await fetch(`http://127.0.0.1:8000/profiles/${userEmail}/experience`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ experience: experiences }),
      });

      if (experienceResponse.ok) {
        alert('Experience saved successfully!');
        if (onSave) onSave();
      } else {
        const expText = await experienceResponse.text();
        console.error("Experience Response:", expText);
        throw new Error('Failed to save experience.');
      }
    } catch (error: any) {
      console.error('Error saving experience:', error);
      setError(error.message || 'An error occurred while saving your experience & skills.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <Button
        className="bg-[#635bff] hover:bg-[#827CFF] text-white"
        onClick={handleSubmitExperienceSkills}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Saving...' : 'Save Experience'}
      </Button>
    </div>
  );
}