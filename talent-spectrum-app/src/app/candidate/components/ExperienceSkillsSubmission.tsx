import { useState } from 'react';
import { Button } from "@/app/components/button";

interface ExperienceSkillsSubmissionProps {
  experiences: Array<{
    id: number;
    employer: string;
    industry: string;
    start: string;
    end: string;
    seniorityLevel: string;
    skillsToolsUsed: string;
    projectHighlights: string;
  }>;
  exp_skill: {
    HardSkills: string;
    SoftSkills: string;
    LanguageProficiency: string;
    Achievements: string;
  };
  onSave?: () => void;
}

export function ExperienceSkillsSubmission({ experiences, exp_skill, onSave }: ExperienceSkillsSubmissionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmitExperienceSkills = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        throw new Error('No userEmail found in localStorage');
      }

      // Save experiences
      const experienceResponse = await fetch(`http://127.0.0.1:8000/profiles/${userEmail}/experience`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ experiences }),
      });

      // Save skills
      const skillsResponse = await fetch(`http://127.0.0.1:8000/profiles/${userEmail}/exp_skill`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ exp_skill }),
      });

      if (experienceResponse.ok && skillsResponse.ok) {
        alert('Experience & Skills saved successfully!');
        if (onSave) onSave();
      } else {
        throw new Error('Failed to save experience & skills.');
      }
    } catch (error: any) {
      console.error('Error saving experience & skills:', error);
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