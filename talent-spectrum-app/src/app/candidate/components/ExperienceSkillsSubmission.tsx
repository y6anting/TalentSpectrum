'use client';
import { useState } from 'react';
import { Button } from "@/app/components/button";
import { useSession } from "next-auth/react";
import { useToastHelpers } from "@/components/ui/toast";

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
  const { success, error: showError } = useToastHelpers();

  const handleSubmitExperienceSkills = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const userEmail = session?.user?.email;
      if (!userEmail) {
        throw new Error('No user email found in session');
      }

      // Save experiences
      const experienceResponse = await fetch(`/api/profiles?email=${encodeURIComponent(userEmail)}&type=experience`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ experiences: experiences }),
      });

      if (experienceResponse.ok) {
        success('Experience Saved', 'Experience information saved successfully!');
        if (onSave) onSave();
      } else {
        const expText = await experienceResponse.text();
        console.error("Experience Response:", expText);
        throw new Error('Failed to save experience.');
      }
    } catch (error: any) {
      console.error('Error saving experience:', error);
      const errorMessage = error.message || 'An error occurred while saving your experience & skills.';
      setError(errorMessage);
      showError('Save Failed', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <Button
        className="bg-[#635bff] hover:bg-[#827CFF] text-white cursor-pointer"
        onClick={handleSubmitExperienceSkills}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Saving...' : 'Save Experience'}
      </Button>
    </div>
  );
}