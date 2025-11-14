'use client';
import { useState } from 'react';
import { Button } from "@/app/components/button";
import { useSession } from "next-auth/react";
import { useToastHelpers } from "@/components/ui/toast";

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
  const { data: session } = useSession();
  const { success, error: showError } = useToastHelpers();

  const handleSubmitEducation = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const userEmail = session?.user?.email;
      if (!userEmail) {
        throw new Error('No user email found in session');
      }

      const response = await fetch(`/api/profiles?email=${encodeURIComponent(userEmail)}&type=education`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ educations: educations }),
      });

      if (response.ok) {
        success('Education Saved', 'Education information saved successfully!');
        if (onSave) onSave();
      } else {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        showError('Save Failed', 'Failed to save education.');
      }
    } catch (error: any) {
      console.error('Error saving education:', error);
      showError('Error', error.message || 'An error occurred while saving your education.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <Button
        className="bg-[#635bff] hover:bg-[#827CFF] text-white hover:cursor-pointer"
        onClick={handleSubmitEducation}
        disabled={isSubmitting || !session}
      >
        {isSubmitting ? 'Saving...' : 'Save Education'}
      </Button>
      {!session && (
        <p className="text-gray-500 text-sm mt-2">
          Please log in to save your education details.
        </p>
      )}
    </div>
  );
}
