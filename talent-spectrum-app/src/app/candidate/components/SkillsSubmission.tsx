import { useState } from 'react';
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
  languageProficiencies: LanguageProficiency[];
  onSave?: () => void;
}

export function SkillsSubmission({ exp_skill, languageProficiencies, onSave }: SkillsSubmissionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmitSkills = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        throw new Error('No userEmail found in localStorage');
      }

      // Save skills data
      const skillsData = {
        exp_skill: exp_skill
      };

      console.log('Saving skills:', skillsData);

      const skillsResponse = await fetch(`http://127.0.0.1:8000/profiles/${userEmail}/exp_skill`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(skillsData),
      });

      if (!skillsResponse.ok) {
        throw new Error('Failed to save skills.');
      }

      // Save language proficiencies
      const langData = {
        language_proficiencies: languageProficiencies
      };

      console.log('Saving language proficiencies:', langData);

      const langResponse = await fetch(`http://127.0.0.1:8000/profiles/${userEmail}/language_proficiencies`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(langData),
      });

      if (!langResponse.ok) {
        throw new Error('Failed to save language proficiencies.');
      }

      alert('Skills and language proficiencies saved successfully!');
      if (onSave) onSave();
    } catch (error: any) {
      console.error('Error saving skills:', error);
      setError(error.message || 'An error occurred while saving your skills.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <Button
        className="bg-[#635bff] hover:bg-[#827CFF] text-white"
        onClick={handleSubmitSkills}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Saving...' : 'Save Skills & Languages'}
      </Button>
    </div>
  );
}
