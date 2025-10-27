import { useState } from 'react';
import { Button } from "@/app/components/button";

interface EducationSubmissionProps {
  educations: Array<{
    id: number;
    level: string;
    fieldOfStudy: string;
    institution: string;
    graduationYear: number | null;
    cgpa_grade: string;
    award: string;
  }>;
  onSave?: () => void;
}

export function EducationSubmission({ educations, onSave }: EducationSubmissionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmitEducation = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        throw new Error('No userEmail found in localStorage');
      }

      const response = await fetch(`http://127.0.0.1:8000/profiles/${userEmail}/education`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ educations }),
      });

      if (response.ok) {
        alert('Education saved successfully!');
        if (onSave) onSave();
      } else {
        throw new Error('Failed to save education.');
      }
    } catch (error: any) {
      console.error('Error saving education:', error);
      setError(error.message || 'An error occurred while saving your education.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <Button
        className="bg-[#635bff] hover:bg-[#827CFF] text-white"
        onClick={handleSubmitEducation}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Saving...' : 'Save Education'}
      </Button>
    </div>
  );
}
